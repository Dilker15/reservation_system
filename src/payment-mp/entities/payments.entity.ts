
import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity({name:'payment_intents'})
export class PaymentIntent{


    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column({name:'provider' ,enum:PROVIDERS})
    provider:PROVIDERS;


    @Column({name:'payment_id',type:'varchar', length:64,nullable:true}) // webhook payment_id
    payment_id:string;      



    @Column({name:'payment_type', type:'varchar',nullable:true}) // DEBIT, CREDIT , MP ACCOUNT , ETC
    payment_type:string;



    @Column({name:'payer_id' , type:'varchar',nullable:true})
    payer_id:string;


    @Column({name:'payer_name', type:'varchar' , length:64,nullable:true})
    payer_name:string;



    @Column({name:'payer_email', type:'varchar',nullable:true})
    payer_email:string;




    @Column({name:'preference_id', type:'varchar' , unique:true})
    preference_id:string;



    @Column({ name: 'preference_link', type: 'varchar'})
    preference_link: any;


    @Column({ name: 'external_reference', type: 'varchar', length: 255 })
    external_reference: string;
    

    @Column({name:'status' , type:'enum' , enum:PAYMENTS_STATUS,default:PAYMENTS_STATUS.CREATED})
    status:PAYMENTS_STATUS


    @Column({name: 'amount',type: 'decimal',precision: 10,scale: 2,default: '0.00'})
    amount: string;


    @Column({ name: 'fee_amount', type: 'decimal', precision: 10, scale: 2, default: '0.00' })
    fee_amount: string;
    

    @Column({name:'destination_account',type:'varchar', nullable:true})
    destination_account: string;



    @ManyToOne(()=>Reservation,(res)=>res.payment_intents)
    @JoinColumn({name:'reservation_id'})
    reservation:Reservation;


    @CreateDateColumn({name: 'created_at', type: 'timestamptz'})
    created_at: Date;


    @UpdateDateColumn({name: 'updated_at',type: 'timestamptz'})
    updated_at: Date;




}