import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AmenitiesPlace } from "./amanities_place.entity";


@Entity({name:'amenities'})
export class Amenity {


    @PrimaryGeneratedColumn('uuid')
    id:string;

        
    @Column({ unique: true })
    name: string;


    @Column({ default: true })
    is_active: boolean;


    @OneToMany(()=>AmenitiesPlace,(am)=>am.amenity)
    amenties_place:AmenitiesPlace[];



}
