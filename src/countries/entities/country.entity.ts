import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { City } from "./city.entity";

@Entity({name:'countries'})
export class Country {

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'name',type:'varchar', length:100})
    name:string;


    @Column({name:'country_code',type:'varchar', length:'10', unique:true})
    country_code:string;

    
    @Column({name:'is_active', type:'bool',default:true})
    is_active:boolean;


    @OneToMany(()=>City,(city)=>city.country)
    cities:City[];


}
