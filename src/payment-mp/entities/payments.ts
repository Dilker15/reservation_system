import { PAYMENTS_STATUS } from "src/common/Interfaces";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity({name:'payments'})
export class Payments{


    @PrimaryGeneratedColumn('uuid')
    id:string;



    @Column({name:'payment_id',type:'varchar', length:64})
    payment_id:string;



    @Column({name:'payment_type_id', type:'varchar'}) // DEBIT, CREDIT , MP ACCOUNT , ETC
    payment_type_id:string;



    @Column({name:'payer_id' , type:'varchar'})
    payer_id:string;


    @Column({name:'payer_name', type:'varchar' , length:64})
    payer_name:string;



    @Column({name:'payer_email', type:'varchar'})
    payer_email:string;


    @Column({name:'status' , type:'enum' , enum:PAYMENTS_STATUS,default:PAYMENTS_STATUS.CREATED})
    status:PAYMENTS_STATUS




}