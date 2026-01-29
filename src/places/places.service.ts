import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { DataSource, In, Repository } from 'typeorm';
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
import { LocationsService } from 'src/locations/locations.service';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { UpdateLocationDto } from 'src/locations/dto/update.location.dto';
import { OpeningHour } from 'src/opening-hours/entities/opening-hour.entity';
import { CalendarAvailabityDto } from 'src/common/dtos/calendarAvailabity';
import { ReservationService } from 'src/reservation/reservation.service';
import { BookingModeType} from 'src/common/Interfaces';


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
              private readonly imageUploadService:ImageUploadService,
              @InjectRepository(OpeningHour) private readonly openingHourRepo:Repository<OpeningHour>,
              private readonly reservationService:ReservationService,
){
  this.logger = this.appLogService.withContext(PlacesService.name);
  }



  async create(createPlaceDto: CreatePlaceDto, pathImages: string[], user: User) {
    return this.createPlaceCommon(createPlaceDto, pathImages, user, true);
  }

  async createRange(createPlaceDto: CreatePlaceDto, pathImages: string[], user: User) {
    return this.createPlaceCommon(createPlaceDto, pathImages, user, false);
  }




  private async createPlaceCommon(createPlaceDto: CreatePlaceDto,pathImages: string[],user: User,isHourly: boolean){
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = await this.bookinModeRepo.findOneByOrFail({ id: createPlaceDto.booking_mode_id });
      if (isHourly && booking.type != BookingModeType.HOURLY) {
        throw new BadRequestException('Booking Mode is not correct is hourly');
      }
      if (!isHourly && booking.type == BookingModeType.HOURLY) {
        throw new BadRequestException('Booking Mode is not correct is not hourly');
      }

      const placeRepo = queryRunner.manager.getRepository(Place);
      const [cityData, bookingData, categoryData] = await this.getInformationToCreatePlace(
        createPlaceDto.category_id,
        createPlaceDto.booking_mode_id,
        createPlaceDto.city_id
      );

      const placetoCreate = placeRepo.create({
        ...createPlaceDto,
        city: cityData,
        booking_mode: bookingData,
        category: categoryData,
        owner: user,
        location: {
          latitude: createPlaceDto.latitude,
          longitude: createPlaceDto.longitude,
        },     
        ...(isHourly && {
          opening_hours: createPlaceDto.opening_hours.map(h => ({
            ...new OpeningHour(),
            day: h.day,
            open_time: h.open_time,
            close_time: h.close_time,
          })),
        }),
      });

      const placeCreated = await placeRepo.save(placetoCreate);
      await this.enqueueImageService.enqueImagesToUpload(placeCreated.id, pathImages);
      this.logger.log('places created successfully');

      await queryRunner.commitTransaction();
      return placeCreated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.throwCommonError(error, 'Error creating Place. Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }


  async findAll(queryParams: PaginationDto) {
    const {limit = 10, page = 1} = queryParams;
    
    try {
      const querySql = this.buildQueryFilterPlaces(queryParams);
      querySql
        .orderBy('place.created_at', 'DESC')
        .limit(limit)
        .offset(limit * (page - 1));
      
      const [data, total] = await querySql.getManyAndCount();
      
      if (data.length > 0) {
        const placeIds = data.map(place => place.id);
        const places = await this.placeRepo.find({
          where: { id: In(placeIds) },
          relations: ['images'],
          select: {
            id: true,
            images: {
              url: true 
            }
          }
        });
        
        data.forEach(place => {
          const fullPlace = places.find(p => p.id === place.id);
          if (fullPlace) {
            place.images = fullPlace.images;
          }
        });
      }
      
      return {total, page, limit, data}
    } catch(error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException("Something was wrong get places");
    }
  }

  async getMyPlaces(owner:User){
    try{
      const placesFound = await this.placeRepo
      .createQueryBuilder('place')
      .leftJoin('place.booking_mode', 'booking_mode')
      .leftJoin('place.category', 'category')
      .where('place.owner_id = :ownerId', { ownerId: owner.id })
      .select([
        'place.id',
        'place.name',
        'place.price',
        'booking_mode.name',
        'category.name',
      ])
      .getMany();
      console.log(placesFound);
     return placesFound;
    }catch(error){
      this.throwCommonError(error,"Something was wrong getMyPlaces");
    }
  }


  async findOne(placeId: string,currentOwner?: User): Promise<PlaceResponseDto> {
  
    try {
      const query = this.placeRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.images', 'image')
        .leftJoinAndSelect('place.category', 'category')
        .leftJoinAndSelect('place.opening_hours','open')
        .leftJoinAndSelect('place.booking_mode', 'booking')
        .leftJoinAndSelect('place.city', 'city')
        .leftJoinAndSelect('city.country', 'country')
        .leftJoinAndSelect('place.location','location')
        .where('place.id = :id', { id: placeId })
        .andWhere('place.status = :status', {
          status: placeEnumStatus.ACTIVE,
        });
  
      if (currentOwner) {
        query.andWhere('place.ownerId = :ownerId', {
          ownerId: currentOwner.id,
        });
      }
  
      const placeFound = await query
        .select([
          'place.id',
          'place.name',
          'place.description',
          'place.price',
       
          'image.url',

          'category.name',

          'booking.name',
          'booking.type',
  
          'city.name',
          'country.id',
          'country.name',

          'open.open_time',
          'open.close_time',
          'open.day',

          'location.latitude',
          'location.longitude'
        ])
        .getOne();
  
      if (!placeFound) {
        throw new BadRequestException(`Place with ${placeId} not found`);
      }
  
      return this.createPlaceResponseDto(placeFound);
  
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
  
      this.logger.error(error, error.stack);
      throw new InternalServerErrorException('Something was wrong');
    }
  }
  


  async updateBasicInformation(updatePlaceDto:UpdatePlaceDto,place_id:string,ownerPlace:User){
    try{
       const placeFound = await this.findOne(place_id,ownerPlace)
        await this.placeRepo.update(place_id, {
                ...updatePlaceDto,
                updated_at:new Date(),
        });
      return placeFound;
    }catch(error:unknown){
      this.throwCommonError(error,"Error on updateBasic Information place");
    }
  }

  

  async updateImages(place_id:string,owner:User,filesToUpdate:string[]){
      try{
         const placeToUpdate  = await this.findOne(place_id,owner);
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
    const placeFound = await this.findOne(place_id,owner); // IT VERIFY IF PLACE EXISTS AND RETURN IT;
    await this.placeRepo.update(place_id,{booking_mode:bookingFound});
    return placeFound;
  }  


    async updateLocation(place_id:string,newLocation:UpdateLocationDto,owner:User){
      try{
          await this.findOne(place_id,owner);
          const locatinUpdated = await this.locationService.updateByPlace(place_id,newLocation);
          return locatinUpdated;
      }catch(error){
          this.throwCommonError(error,'Error Update location');
      }
    }


    async updateCity(place_id: string, newCityId: string, owner: User) {
      try {
        const [place, newCity] = await Promise.all([
          this.placeRepo.findOneOrFail({
            where: { id: place_id, owner: { id: owner.id }, status: placeEnumStatus.ACTIVE },
            relations: ['city'],
          }),
          this.cityRepo.findOneByOrFail({ id: newCityId, is_active: true }),
        ]);
    
        place.city = newCity;
        place.updated_at = new Date();
    
        const updatedPlace = await this.placeRepo.save(place);
        this.logger.log(`City updated successfully for place_id: ${place_id}`);
        return this.createPlaceResponseDto(updatedPlace);
    
      } catch (error) {
        this.throwCommonError(error, 'City or place Not Found');
      }
    }
    



    async deleteImage(place_id: string, image_id: string, owner: User) {
      let imageFound;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    
      try {
        const repo = queryRunner.manager.getRepository(PlaceImages);
        await this.findOne(place_id, owner);
    
        imageFound = await repo.findOne({
          where: { storage_id: image_id, place: { id: place_id } },
        });
    
        if (!imageFound) {
          throw new BadRequestException(`Image with ID ${image_id} not found in place ${place_id}`);
        }
    
        await repo.remove(imageFound);
        await queryRunner.commitTransaction();
        this.logger.log("Image deleted from DB successfully");
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(error?.message, error?.stack || "trace not found on deleteImage");
        this.throwCommonError(error, "Error on deleteImages()");
      } finally {
        await queryRunner.release();
      }
      try {
        await this.imageUploadService.deleteImage(image_id);
        this.logger.log("Image deleted from cloud successfully");
      } catch (err) {
        this.logger.warn(`Failed to delete image ${image_id} from cloud storage: ${err.message}`);
      }
      return imageFound;
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


  async getCalendar(placeId: string) {
    try {
      const [openingHours,place] = await Promise.all([
        this.getOpeningHoursByPlace(placeId),
        this.findOne(placeId),
      ]);
      return {
        openingHours,
        booking_mode:place.booking_mode.name,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'Error getting calendar availability',
      );
    }
  }
  
  
  async getReservationsByDate(place_id:string,date:string){
     return this.reservationService.getAvailabilityDaily(place_id,date)
  }

  
  
  async getOpeningHoursByPlace(placeId: string) {
    return this.openingHourRepo
      .createQueryBuilder('hours')
      .select([
        'hours.open_time',
        'hours.close_time',
        'hours.day',
        'hours.is_active',
      ])
      .where('hours.place_id = :placeId', { placeId })
      .andWhere('hours.is_active = true')
      .orderBy('hours.open_time', 'ASC')
      .getMany();
  }
  
    

 


  private buildQueryFilterPlaces(queryParams:PaginationDto,owner?:string){
      const querySql = this.placeRepo.createQueryBuilder('place')
      .select(['place.id','place.name','place.description','place.price'])
      .innerJoin("place.category",'cat')
      .innerJoin("place.city","cit")
      .innerJoin('cit.country', 'country')
      .innerJoin("place.booking_mode","bmod")
      
      querySql.addSelect(['bmod.name']);
      querySql.addSelect(['cit.name']);
      querySql.addSelect(['country.name']);
      querySql.addSelect(['cat.name']);

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



  private throwCommonError(error:any,messageError:string){
    this.logger.error(messageError,error.stack || 'trace not found on updatePlace');
     if (error instanceof BadRequestException) {
       this.logger.warn(messageError);
        throw error;
      }
     if (error instanceof Error) {
      throw new InternalServerErrorException(error.message);
     }
     throw new BadRequestException('Unexpected error occurred');
  }


  private createPlaceResponseDto(placesData:Place){
    return plainToInstance(PlaceResponseDto,placesData,{excludeExtraneousValues:true});
  }




}
