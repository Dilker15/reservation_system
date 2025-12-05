import { Preference } from "mercadopago";
import { PAYMENTS_STATUS } from "src/common/Interfaces";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity({name:'payments'})
export class Payment{


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'payment_id',type:'varchar', length:64})
    payment_id:string;



    @Column({name:'payment_type', type:'varchar'}) // DEBIT, CREDIT , MP ACCOUNT , ETC
    payment_type_id:string;



    @Column({name:'payer_id' , type:'varchar'})
    payer_id:string;


    @Column({name:'payer_name', type:'varchar' , length:64})
    payer_name:string;



    @Column({name:'payer_email', type:'varchar'})
    payer_email:string;



    @Column({name:'preference_id', type:'varchar'})
    preference_id:string;



    @Column({name:'preference',type:'varchar'})
    preference:string;


    @Column({name:'status' , type:'enum' , enum:PAYMENTS_STATUS,default:PAYMENTS_STATUS.CREATED})
    status:PAYMENTS_STATUS


    @Column({name: 'amount',type: 'decimal',precision: 10,scale: 2,default: '0.00'})
    amount: string;


    @CreateDateColumn({name: 'created_at', type: 'timestamptz'})
    created_at: Date;


    @UpdateDateColumn({name: 'updated_at',type: 'timestamptz'})
    updated_at: Date;




}