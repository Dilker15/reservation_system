import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { Multer } from 'multer';
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

  findAll() {
    return `This action returns all places`;
  }

  findOne(id: number) {
    return `This action returns a #${id} place`;
  }

  update(id: number, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: number) {
    return `This action removes a #${id} place`;
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





}
