import { Place } from "src/places/entities/place.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Amenity } from "./amenity.entity";



@Entity({name:'amenities_place'})
@Unique('UQ_place_amenity', ['place', 'amenity'])
export class AmenitiesPlace{

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({default:true})
    is_active:boolean;


    @ManyToOne(()=>Place,(pl)=>pl.amenities)
    @JoinColumn({name:'place_id'})
    place:Place;


    @ManyToOne(()=>Amenity,(am)=>am)
    @JoinColumn({name:'amenity_id'})
    amenity:Amenity;


}