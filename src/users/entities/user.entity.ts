import { Roles } from "src/common/Interfaces";
import { Place } from "src/places/entities/place.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'users'})
export class User {


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'name',type:'varchar', length:100})
    name:string;


    @Column({name:'last_name',type:'varchar' , length:100})
    last_name:string;


    @Column({name:'email', type:'varchar', unique:true, length:255})
    email:string;


    @Column({name:'password', type:'varchar', length:255})
    password:string;


    @Column({ type: 'enum', enum: Roles, default: Roles.CLIENT})
    role:Roles;


    @OneToMany(()=>Reservation,(res)=>res.user)
    reservations:Reservation[];

    
    @Column({name:'is_active', type:'boolean' , default:false})
    is_active:boolean;


    @Column({name:'email_verified',type:'boolean' , default:false})
    email_verified:boolean;


    @Column({name:'verification_code', type:'varchar', length:5,nullable:true})
    verification_code:string;


    @OneToMany(()=>Place,(place)=>place.owner)
    places?:Place[];


    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

  


}
