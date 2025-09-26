import { DataSource } from "typeorm";
import { Category } from "../entities/category.entity";
import categories from "../data/categories.data";


export async function seedCategory(data:DataSource):Promise<void>{
    const repo =  data.getRepository(Category);
    const elements = await repo.count();
    if(elements>0)return;

    for(const categorie of categories){
       await repo.save({...categorie});
    }
    console.log("seeder category created");
}