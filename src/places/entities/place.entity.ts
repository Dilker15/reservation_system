import { BookingMode } from "src/booking-mode/entities/booking-mode.entity";
import { City } from "src/countries/entities/city.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlaceImages } from "./place-images.entity";
import { Category } from "src/categories/entities/category.entity";
import { Availability, FieldLocation, placeEnumStatus } from "../interfaces/interfaces";
import { Transform } from "class-transformer";

@Entity({name:'places'})
export class Place {

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Index()
    @Column({name:'name',type:'varchar'})
    name:string;


    @Column({name:'description',type:'text'})
    description:string;



    @Column({name:'address',type:'varchar'})
    address:string;


   


    @Column({name:'price',type:'float'})
    price:number;




    @Column({name:'location',type:'varchar'})
    location:string;


    @Column({ name: 'availability', type: 'varchar' })
    availability:string;


    @ManyToOne(()=>City,(city)=>city.places)
    @JoinColumn({name:'city_id'}) 
    city:City;


    @ManyToOne(()=>BookingMode,(booking)=>booking.places)
    @JoinColumn({name:'booking_mode_id'})
    booking_mode:BookingMode;



    @ManyToOne(()=>Category,(category)=>category.places)
    @JoinColumn({name:'category_id'})
    category:Category;


    @ManyToOne(()=>User,(owner)=>owner.places)
    @JoinColumn({name:'owner_id'})
    owner:User;


    @OneToMany(()=>PlaceImages,(placeImage)=>placeImage.place)
    images:PlaceImages[];


    @Column({name:'status',enum:placeEnumStatus,default:placeEnumStatus.PROCESSING})
    status:placeEnumStatus;


    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
    
        
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;


}
