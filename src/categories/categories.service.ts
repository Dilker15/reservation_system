import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {

  constructor(@InjectRepository(Category)private readonly categoryRepo:Repository<Category>){

  }

   create(createCategoryDto: CreateCategoryDto) {
    throw new NotImplementedException("Method not implemented yet");
  }

  async findAll():Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find({where:{is_active:true}});
    return this.parseCategoriesResponse(categories);
  }



  private parseCategoriesResponse(categories:Category[]):CategoryResponseDto[]{
    return plainToInstance(CategoryResponseDto,categories,{excludeExtraneousValues:true});
  }

  
}
