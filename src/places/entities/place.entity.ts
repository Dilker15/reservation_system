import { BookingMode } from "src/booking-mode/entities/booking-mode.entity";
import { City } from "src/countries/entities/city.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlaceImages } from "./place-images.entity";
import { Category } from "src/categories/entities/category.entity";
import { placeEnumStatus } from "../interfaces/interfaces";
import { Location } from "../../locations/entities/location.entity";
import { OpeningHour } from "src/opening-hours/entities/opening-hour.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { Amenity } from "src/amenities/entities/amenity.entity";
import { AmenitiesPlace } from "src/amenities/entities/amanities_place.entity";

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

    @Column({ name: 'max_guests', type: 'int', nullable: false })
    max_guests: number;



    @Column({ name: 'bedrooms', type: 'int', nullable: true })
    bedrooms: number;


    @Column({ name: 'bathrooms', type: 'int', nullable: true })
    bathrooms: number;



    @Column({ name: 'size_m2', type: 'int', nullable: true })
    size_m2: number;


    @OneToOne(()=>Location,(location)=>location.place,{eager:true,cascade:true})
    location:Location;


    @OneToMany(()=>OpeningHour,(op)=>op.place,{cascade:true})
    opening_hours:OpeningHour[];

    


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



    @OneToMany(()=>Reservation,(res)=>res.place)
    reservations:Reservation[];


    @OneToMany(() => AmenitiesPlace, ap => ap.place, { cascade: true })
    amenities: AmenitiesPlace[];


    @Column({name:'status',enum:placeEnumStatus,default:placeEnumStatus.PROCESSING})
    status:placeEnumStatus;



    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
    
        
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;


}
