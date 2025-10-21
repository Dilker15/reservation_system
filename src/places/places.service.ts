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
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PlaceResponseDto } from './dto/place.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PlacesService {
  constructor(@InjectRepository(Place) private readonly placeRepo:Repository<Place>,
              @InjectRepository(PlaceImages) private readonly placeImagesRepo:Repository<PlaceImages>
              ,@InjectRepository(Category) private readonly categoryRepo:Repository<Category>,
              @InjectRepository(BookingMode) private readonly bookinModeRepo:Repository<BookingMode>,
              @InjectRepository(City) private readonly cityRepo:Repository<City>,
              private readonly enqueueImageService:EnqueueImagesUploadServices,
              private readonly dataSource:DataSource,
){
  }

  async create(createPlaceDto: CreatePlaceDto,pathImages:string[],user:User) {
    try{
       const [cityData,bookingData,categoryData] = await this.getInformationToCompletePlace(createPlaceDto.category_id,createPlaceDto.booking_mode_id,createPlaceDto.city_id);
       const placetoCreate = this.placeRepo.create({...createPlaceDto,city:cityData,booking_mode:bookingData,category:categoryData,owner:user});
       const placeCreated = await this.placeRepo.save(placetoCreate);
       await this.enqueueImageService.enqueImagesToUpload(placeCreated.id,pathImages);
       return placeCreated;
    }catch(error){
      console.log(error);
      throw error;
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
      console.error(error);
      throw new InternalServerErrorException("Something was wrong get places");
    }
  }


  async getMyPlaces(owner:User){
    try{
        const placesFound = await this.placeRepo.find({where:{owner: { id: owner.id},status:placeEnumStatus.ACTIVE}});
        return placesFound;
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException("Something was wrong");
    }
  }


  async findOne(placeId:string):Promise<PlaceResponseDto>{
    try{
        const placeFound = await this.placeRepo.findOne({
            where:{id:placeId,status:placeEnumStatus.ACTIVE},
            relations:['images','category','city','city.country','booking_mode']   
        });
      if(!placeFound){
          throw new BadRequestException(`Place with ${placeId} : not Found`);
      }
      return this.createPlaceResponseDto(placeFound);
    }catch(error){
       console.log(error);
       if(error instanceof BadRequestException){
          throw error;
       }
       throw new InternalServerErrorException("Something was wrong");
    }
  }


  private async getInformationToCompletePlace(category_id: string,booking_id: string,city_id: string):Promise<[City, BookingMode, Category]> {
      const [city, booking, category] = await Promise.all([this.cityRepo.findOneBy({ id: city_id }),
        this.bookinModeRepo.findOneBy({ id: booking_id }),
        this.categoryRepo.findOneBy({ id: category_id }),
      ]);
      if (!city || !booking || !category) {
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

          await queryRunner.commitTransaction();
      } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error(`Transaction failed for place ${place_id}`, error);
          throw error;
      } finally {
          await queryRunner.release();
      }
  }


  private buildQueryFilterPlaces(queryParams:PaginationDto,owner?:string){
      const querySql = this.placeRepo.createQueryBuilder('place')
      .innerJoin("place.category",'cat')
      .innerJoin("place.city","cit")
      .innerJoin("place.booking_mode","bmod")
      /*if(owner){
        querySql.innerJoin('place.owner','own').andWhere('own.id = :ownerId',{ownerId:owner});
      }*/
      
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
      
      querySql.where('place.status = :myStatus',{myStatus:'active'});
    return querySql;
  }




  private createPlaceResponseDto(placesData:Place){
    return plainToInstance(PlaceResponseDto,placesData,{excludeExtraneousValues:true});
  }


}
