import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BookingMode } from 'src/booking-mode/entities/booking-mode.entity';
import { City } from 'src/countries/entities/city.entity';
import { EnqueueImagesUploadServices } from 'src/queue-bull/enqueue-images.services';
import { UploadApiResponse } from 'cloudinary';
import { placeEnumStatus } from './interfaces/interfaces';
import { PlaceImages } from './entities/place-images.entity';
import { AppLoggerService } from 'src/logger/logger.service';
import { PlaceResponseDto } from './dto/place.response.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { LocationsService } from 'src/locations/locations.service';

@Injectable()
export class PlacesService {
  private logger : AppLoggerService;
  constructor(@InjectRepository(Place) private readonly placeRepo:Repository<Place>,
              @InjectRepository(PlaceImages) private readonly placeImagesRepo:Repository<PlaceImages>
              ,@InjectRepository(Category) private readonly categoryRepo:Repository<Category>,
              @InjectRepository(BookingMode) private readonly bookinModeRepo:Repository<BookingMode>,
              @InjectRepository(City) private readonly cityRepo:Repository<City>,
              private readonly enqueueImageService:EnqueueImagesUploadServices,
              private readonly dataSource:DataSource,
              private readonly appLogService:AppLoggerService,
              private readonly locationService:LocationsService,
              

){
  this.logger = this.appLogService.withContext(PlacesService.name);
  }

  async create(createPlaceDto: CreatePlaceDto,pathImages:string[],user:User) {
    try{
       const [cityData,bookingData,categoryData] = await this.getInformationToCreatePlace(createPlaceDto.category_id,createPlaceDto.booking_mode_id,createPlaceDto.city_id);
       const placetoCreate = this.placeRepo.create({...createPlaceDto,city:cityData,booking_mode:bookingData,category:categoryData,owner:user});
       const placeCreated = await this.placeRepo.save(placetoCreate);
       //await this.enqueueImageService.enqueImagesToUpload(placeCreated.id,pathImages);
       this.locationService.create(placeCreated.id,createPlaceDto.latitude,createPlaceDto.longitude)
       this.logger.log('places created successfully');
       return placeCreated;
    }catch(error){
      this.throwCommonError(error,"Error cretae Place Somehting was wrong");
    }
  }

  async findAll(queryParams:PaginationDto) {
    const {limit=10,page=1} = queryParams;
    try{
      const querySql = this.buildQueryFilterPlaces(queryParams);
      querySql.limit(limit)
               .offset(limit*(page-1));
      const [data,total]= await querySql.getManyAndCount();
      return {total,page,limit,data}
    }catch(error){
      throw new InternalServerErrorException("Something was wrong get places");
    }
  }


  async getMyPlaces(owner:User){
    try{
        const placesFound = await this.placeRepo.find({where:{owner: { id: owner.id},status:placeEnumStatus.ACTIVE}});
        return placesFound;
    }catch(error){
      this.throwCommonError(error,"Something was wrong getMyPlaces");
    }
  }


  async findOne(placeId:string,currentOwner?:User):Promise<PlaceResponseDto>{     // IF EXIST PLACE RETURN, OR THROW EXCEPTION
    let queryUser;
    if(currentOwner){
       queryUser = {owner:{id:currentOwner.id}};
    }
    try{
        const placeFound = await this.placeRepo.findOne({
            where:{id:placeId,status:placeEnumStatus.ACTIVE,...queryUser},
            relations:['images','category','booking_mode','city','city.country'],
        });
      if(!placeFound){
          throw new BadRequestException(`Place with ${placeId} : not Found`);
      }
      return this.createPlaceResponseDto(placeFound);
    }catch(error){
       if(error instanceof BadRequestException){
          throw error;
       }
       throw new InternalServerErrorException("Something was wrong");
    }
  }


  async updateBasicInformation(updatePlaceDto:UpdatePlaceDto,place_id:string,ownerPlace:User){
    try{
       const placeFound = await this.findOne(place_id,ownerPlace)
       if(!placeFound){
          this.logger.warn("place not found or inactive with id : "+place_id);
          throw new BadRequestException("Place Not Found");
       }
     await this.placeRepo.update(place_id, {
            ...updatePlaceDto,
            updated_at:new Date(),
     });
     console.log(updatePlaceDto);
     console.log(placeFound);
      
      return placeFound;
    }catch(error:unknown){
      this.throwCommonError(error,"Error on updateBasic Information place");
    }
  }

  

  async updateImages(place_id:string,owner:User,filesToUpdate:string[]){
      try{
         const placeToUpdate  = await this.findOne(place_id,owner);
         if(!placeToUpdate){
           throw new BadRequestException("Place not Found or owner Incorrect");
         }
         const count = placeToUpdate.images.length
         if(count + filesToUpdate.length> 5){
            throw new BadRequestException("Max number of total files accepted 5,remove files");
         }
         await this.enqueueImageService.enqueImageToUpdate(place_id,filesToUpdate,owner.id);
         this.logger.log("Images to update enqueued successfully");
         return { message: `images will be updated (${placeToUpdate.images.length} total)` };

      }catch(error){
         this.throwCommonError(error,"Error on UpdateImages place");
      }
  }


  async updateCategory(place_id:string,category_id:string,owner:User){
        const categoryFound = await this.categoryRepo.findOneBy({id:category_id,is_active:true});
        if(!categoryFound){
          throw new BadRequestException("Category not found");
        }
        const placeFound = await this.findOne(place_id,owner);
        await this.placeRepo.update(place_id,{category:categoryFound});
        return placeFound;
  }



  async updateBookingMode(place_id:string,newBooking_id:string,owner:User){
     const bookingFound = await this.bookinModeRepo.findOneBy({id:newBooking_id,is_active:true});
     if(!bookingFound){
       throw new BadRequestException("Booking Mode to update not found");
     }
    const placeFound = await this.findOne(place_id,owner); // IT VERIFY IF EXIST PLACE TOO.
    console.log(placeFound);
    await this.placeRepo.update(place_id,{booking_mode:bookingFound});
    return placeFound;
  }  


  async deleteImages(place_id:string,image_id:string,owner:User){
     console.log("DELETED IMAGES");
  }


  private async getInformationToCreatePlace(category_id: string,booking_id: string,city_id: string):Promise<[City, BookingMode, Category]> {
      const [city, booking, category] = await Promise.all([this.cityRepo.findOneBy({ id: city_id }),
        this.bookinModeRepo.findOneBy({ id: booking_id }),
        this.categoryRepo.findOneBy({ id: category_id }),
      ]);
      if (!city || !booking || !category) {
        this.logger.warn("city , booking o category not exist getInformationToCompletePlace() ");
        throw new BadRequestException("Invalid city, booking mode, or category ID.");
      }
      return [city, booking, category];
  }




  async addImagesPlace(place_id: string, images: UploadApiResponse[]): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
          const placeRepo = queryRunner.manager.getRepository(Place);
          const placeImagesRepo = queryRunner.manager.getRepository(PlaceImages);
          const placeFound = await placeRepo.findOneBy({
            id: place_id,
            status: placeEnumStatus.PROCESSING,
          });
          if (!placeFound) {
            this.logger.warn("place not with id : "+place_id +" not found")
            throw new BadRequestException(`Place with id: ${place_id} not found`);
          }
          const imageEntities = images.map(img =>
            placeImagesRepo.create({
              storage_id: img.public_id,
              url: img.secure_url,
              original_name: img.original_filename,
              mime_type: img.format,
              size: img.bytes,
              place: placeFound,
            }),
          );

          await placeImagesRepo.save(imageEntities);
          placeFound.status = placeEnumStatus.ACTIVE;
          await placeRepo.save(placeFound);
          this.logger.log("imagePlaces added succesfully");
          await queryRunner.commitTransaction();
      } catch (error) {
          await queryRunner.rollbackTransaction();
          this.logger.error(`Transaction failed for add Imageplace rollback executed ${place_id}`, error?.stack || 'No stack trace')
          throw error;
      } finally {
          await queryRunner.release();
      }
  }

  async updateImagesPlace(place_id:string, images: UploadApiResponse[]){
     const queryRun = this.dataSource.createQueryRunner();
     await queryRun.connect();
     await queryRun.startTransaction();
     try{

         await this.findOne(place_id);
         const imageRepo = queryRun.manager.getRepository(PlaceImages);
         const imagesToUpdate = images.map((currenImage)=>{
            return this.placeImagesRepo.create({
               place:{id:place_id},
               ...currenImage,
               storage_id:currenImage.public_id,
               mime_type:currenImage.format,
               original_name:currenImage.original_filename,
            });
         });
         await imageRepo.save(imagesToUpdate);
         queryRun.commitTransaction();
     }catch(error ){
        queryRun.rollbackTransaction();
        this.logger.error("Error on updateImagesPlace()",error.trace);
        throw error;
     }
    
  }




  private buildQueryFilterPlaces(queryParams:PaginationDto,owner?:string){
      const querySql = this.placeRepo.createQueryBuilder('place')
      .innerJoin("place.category",'cat')
      .innerJoin("place.city","cit")
      .innerJoin("place.booking_mode","bmod")
      
      if(queryParams.category){
        querySql.andWhere('cat.id = :idCategory',{idCategory:queryParams.category})
      }
      if(queryParams.city){
        querySql.andWhere('cit.id = :idCity',{idCity:queryParams.city});
      }
      if(queryParams.reservation_mode){
        querySql.andWhere('bmod.id = :idBooking',{idBooking:queryParams.reservation_mode});
      }

      if(queryParams.min_price){
        querySql.andWhere("place.price >= :minPrice",{minPrice:queryParams.min_price});
      }
      if(queryParams.max_price){
        querySql.andWhere("place.price <= :maxPrice",{maxPrice:queryParams.max_price})
      }
      
      querySql.andWhere('place.status = :myStatus',{myStatus:'active'});
    return querySql;
  }




  private createPlaceResponseDto(placesData:Place){
    return plainToInstance(PlaceResponseDto,placesData,{excludeExtraneousValues:true});
  }



  private throwCommonError(error:any,messageError:string){
     if (error instanceof BadRequestException) {
       this.logger.warn(messageError);
        throw error;
      }
     if (error instanceof Error) {
      throw new BadRequestException(error.message);
     }
     this.logger.error(messageError,error.stack || 'trace not found on updatePlace');
     throw new BadRequestException('Unexpected error occurred');
  }

}
