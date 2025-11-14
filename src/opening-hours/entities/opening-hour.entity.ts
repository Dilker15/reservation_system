import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { WeekDay } from "../enums/days.enum";
import { Place } from "src/places/entities/place.entity";


@Entity('opening_hours')
@Unique(['day','place'])
export class OpeningHour {


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'day',type:'int2'})
    day:WeekDay;


    @Column({name:'open_time', type:'time without time zone'})
    open_time:string;


    @Column({name:'close_time',type:'time without time zone'})
    close_time:string;


    @Column({name:'is_active' , type:'bool',default:true})
    is_active:boolean;



    @ManyToOne(()=>Place,(p)=>p.opening_hours)
    @JoinColumn({name:'place_id'})
    place:Place;
    


    @CreateDateColumn({name:'created_at'})
    created_at:Date;



    @UpdateDateColumn({name:'updated_at'})
    updated_at:Date;

}
