import { Repository } from "typeorm";
import { CategoriesService } from "./categories.service";
import { Category } from "./entities/category.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { NotImplementedException } from "@nestjs/common";



describe("CategoryService",()=>{

    let service:CategoriesService;
    let mockCategoryRepository:Partial<Repository<Category>>;

    const categories = [
        {id:"uuid-1", description:"description 1",name:"category-1",type:"type1"},
        {id:"uuid-2", description:"description 2",name:"category-2",type:"type2"},
        {id:"uuid-3", description:"description 3",name:"category-3",type:"type3"}
    ];

    beforeEach(async()=>{
        jest.clearAllMocks();

        mockCategoryRepository = {
            find:jest.fn().mockResolvedValue(categories)
        }

        const refMod:TestingModule =await Test.createTestingModule({
            providers:[
                CategoriesService,
                {
                    provide:getRepositoryToken(Category),
                    useValue:mockCategoryRepository,
                }
            ]
        }).compile();


        service = refMod.get<CategoriesService>(CategoriesService);
    });

    it("should throw a NotimplementedException",async()=>{
        const data:CreateCategoryDto  = {};
        expect(() => service.create(data)).toThrow(NotImplementedException);
    });


    it("should return a list of categories",async()=>{
        const query = {where:{is_active:true}};
        const result = await service.findAll();
        expect(mockCategoryRepository.find).toHaveBeenCalledWith(query);
        expect(result[0]).toEqual(expect.objectContaining({
            id:expect.any(String),
            name:expect.any(String),
            description:expect.any(String),
        }));

    });




    

});