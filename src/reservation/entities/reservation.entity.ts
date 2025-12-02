import { RESERVATION_STATUS } from "src/common/Interfaces";
import { Place } from "src/places/entities/place.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'reservations'})
export class Reservation {


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    reservation_start_date: Date;



    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    reservation_end_date: Date;
    

    @Column({name:'start_time' , type :'time without time zone'})
    start_time:Date


    @Column({name:'end_time' , type:'time without time zone' })
    end_time:Date


    @Column({name:'status' ,type:'enum', enum:RESERVATION_STATUS, default:RESERVATION_STATUS.CREATED})
    status:RESERVATION_STATUS
    

    @Column({name:'amount', type:'float' , default:0})
    amount:number



    @ManyToOne(()=>Place,(pl)=>pl.reservations,{onDelete:'CASCADE'})
    @JoinColumn({name:'place_id'})
    place:Place;


    @ManyToOne(()=>User,(user)=>user.reservations,{onDelete:'CASCADE',nullable:true})
    @JoinColumn({name:'user_id'})
    user:User;

    @CreateDateColumn({name:'created_on' , type:'timestamp'})
    created_on:Date


    @UpdateDateColumn({name:'updated_on', type:'timestamp'})
    updated_on:Date



}
