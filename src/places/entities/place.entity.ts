import { City } from "src/countries/entities/city.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
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


    @Column({name:'location',type:'json'})
    location:string;


    @Column({name:'price',type:'float'})
    price:number;


    @Column({ name: 'availability', type: 'json' })
    availability: {
    [day: string]: { from: string, to: string }[];
    };


    @ManyToOne(()=>City,(city)=>city.places)
    @JoinColumn({name:'city_id'})
    city:City;


    @Column({name:'is_active',type:'bool',default:true})
    is_active:boolean;


    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
    
        
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;


}
