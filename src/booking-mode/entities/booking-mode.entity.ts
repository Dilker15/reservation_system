import { BookingModeType, BookingName } from "src/common/Interfaces";
import { Place } from "src/places/entities/place.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity({name:'booking_mode'})
export class BookingMode {

 @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type:'enum',enum:BookingName, unique: true }) // PER HOUR, PER DAY,PER WEEK,PER MOTH ,ETC.
  name: string;

  @Column({type: 'enum', enum: BookingModeType})
  type: BookingModeType; 

  @Column({ name:'description',type:'varchar', length:100,nullable: true })
  description?: string; 

  @Column({name:'min_duration' ,type: 'int',default:1})
  min_duration: number; 

  @OneToMany(()=>Place,(place)=>place.booking_mode)
  places:Place[];


  @Column({ name:'is_active',type: 'boolean', default: true })
  is_active: boolean; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
    

}
