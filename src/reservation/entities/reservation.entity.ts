import { RESERVATION_STATUS } from "src/common/Interfaces";
import { Place } from "src/places/entities/place.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({name:'reservations'})
@Index('idx_creation',['place','reservation_start_date','start_time','end_time'],
    {
    unique: true,
    where: `"status" <> 'CANCELLED'` 
   }
)
export class Reservation {


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    reservation_start_date: Date;



    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    reservation_end_date: Date;
    

    @Column({name:'start_time' , type :'time without time zone'})
    start_time:string;


    @Column({name:'end_time' , type:'time without time zone' })
    end_time:string;


    @Column({name:'status' ,type:'enum', enum:RESERVATION_STATUS, default:RESERVATION_STATUS.CREATED})
    status:RESERVATION_STATUS
    
    
    @Column({name:'total_price', type:'float', default:0})
    total_price:number;


    @Column({name:'amount', type:'float' , default:0})
    amount:number



    @ManyToOne(()=>Place,(pl)=>pl.reservations,{onDelete:'CASCADE'})
    @JoinColumn({name:'place_id'})
    place:Place;


    @ManyToOne(()=>User,(user)=>user.reservations,{onDelete:'CASCADE',nullable:true})
    @JoinColumn({name:'client_id'})
    user:User;

    @CreateDateColumn({name:'created_on' , type:'timestamp'})
    created_on:Date


    @UpdateDateColumn({name:'updated_on', type:'timestamp'})
    updated_on:Date



}
