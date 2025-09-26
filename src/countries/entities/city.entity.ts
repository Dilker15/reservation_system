import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Country } from "./country.entity";
import { Place } from "src/places/entities/place.entity";



@Entity({name:'cities'})
export class City{

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'name',type:'varchar',length:100})
    name:string;


    @Column({name:'is_active',type:'bool', default:true})
    is_active:boolean;

    

    @ManyToOne(()=>Country,(country)=>country.cities,{eager:true})
    @JoinColumn({ name: 'country_id' })
    country:Country;



    @OneToMany(()=>Place,(place)=>place.city)
    places:Place[];
}