import { Category } from "src/categories/entities/category.entity";
import { Repository } from "typeorm";
import { DataSource } from "typeorm/browser";
import { seedCategory } from "./category.seeder";
import categories from "../data/categories.data";
import { mock } from "node:test";

describe("Shared.CategorySeeders",()=>{
    
    let mockRepository:Partial<jest.Mocked<Repository<Category>>>;
    let mockDataSource:Partial<jest.Mocked<DataSource>>;

    beforeEach(()=>{
        jest.clearAllMocks();
        mockRepository = {
            count:jest.fn().mockResolvedValue(0),
            save:jest.fn(),
        };

        mockDataSource ={
            getRepository:jest.fn().mockReturnValue(mockRepository),
        };
    
    });


    it("should call save for each category if table is empty",async()=>{
        const sp = jest.spyOn(console,'log');
        await seedCategory(mockDataSource as unknown as DataSource);
        expect(mockDataSource.getRepository).toHaveBeenCalled();
        expect(mockRepository.count).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalledTimes(categories.length);
        expect(sp).toHaveBeenCalled();
        
    });


    it("should not insert categories",async()=>{
        const splog = jest.spyOn(console,'log');
        mockRepository.count?.mockResolvedValue(2);
        await seedCategory(mockDataSource as unknown as DataSource);
        expect(mockDataSource.getRepository).toHaveBeenCalled();
        expect(mockRepository.count).toHaveBeenCalled();
        expect(mockRepository.save).not.toHaveBeenCalled();
        expect(splog).not.toHaveBeenCalled();

    });



});