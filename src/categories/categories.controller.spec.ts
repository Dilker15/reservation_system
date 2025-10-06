import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";



describe("CategoriesController",()=>{

    let controller:CategoriesController;
    let mockCategorieService:Partial<jest.Mocked<CategoriesService>>;

    beforeEach(async()=>{
        jest.clearAllMocks();
        mockCategorieService = {
            create:jest.fn(),
            findAll:jest.fn(),
        };

        const refMod:TestingModule = await Test.createTestingModule({
            controllers:[CategoriesController],
            providers:[
                {
                    provide:CategoriesService,
                    useValue:mockCategorieService,
                }
            ]
        }).compile();
        controller = refMod.get<CategoriesController>(CategoriesController);
    });


    it("should create a category with correct data",()=>{
        const createDto:CreateCategoryDto = {};
        const result = controller.create(createDto);
        expect(mockCategorieService.create).toHaveBeenCalledWith(createDto);
    });

    it("should return a list of categories",async()=>{
        await controller.findAll();
        expect(mockCategorieService.findAll).toHaveBeenCalledTimes(1);
    });


    







});