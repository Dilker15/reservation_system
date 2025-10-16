import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "./place.entity";


@Entity({name:'place_images'})
export class PlaceImages{


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'storage_id',type:'varchar', length:255, unique:true})
    storage_id:string;


    @Column({name:'url',type:'varchar' ,length:500})
    url:string;


    @Column({name:'original_name',type:'varchar' ,length:255 , nullable:true})
    original_name?:string;


    @Column({name:'mime_type', type:'varchar' , length:60})
    mime_type:string;


    @Column({name:'size',type:'int',default:0})
    size:number;


    @Column({name:'order',type:'int2',default:0})
    order:number;


    @ManyToOne(()=>Place,(place)=>place.images)
    @JoinColumn({name:'place_id'})
    place:Place;

    @CreateDateColumn({type:'timestamp'})
    created_at:Date;


    @CreateDateColumn({type:'timestamp'})
    updated_at:Date;

}