import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "../../places/entities/place.entity";



@Entity({name:'locations'})
export class Location{

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'latitude',type:'double precision', nullable:true})
    latitude:number;



    @Column({name:'longitude',type:'double precision',nullable:true})
    longitude:number;


    @OneToOne(()=>Place,(place)=>place.location)
    @JoinColumn({name:'place_id'})
    place:Place;



    @CreateDateColumn({name:'created_at', type:'timestamp' , default:()=>'CURRENT_TIMESTAMP'})
    created_at:Date;


    @CreateDateColumn({name:'updated_at',type:'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    updated_at:Date;

}