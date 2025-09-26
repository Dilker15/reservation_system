import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity({name:'categories'})
export class Category{

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'name', type:'varchar', length:50})
    name:string;


    @Column({name:'description' ,type:'varchar', length:100})
    description:string;


    @Column({name:'is_active', type:'bool', default:true})
    is_active:boolean;


    @CreateDateColumn({name:'created_at',type:'timestamp'})
    created_at:Date;

    @CreateDateColumn({name:'updated_at' , type:'timestamp'})
    updated_at:Date;


  


}