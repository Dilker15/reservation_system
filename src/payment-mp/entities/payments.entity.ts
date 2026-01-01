
import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity({name:'payment_intents'})
@Index('UQ_one_approved_payment_per_reservation',['reservation'],{unique: true,where: `"status" = 'PAID'`})
export class PaymentIntent{


    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({name:'provider' ,enum:PROVIDERS})
    provider:PROVIDERS;


    @Index('UQ_payment_id_not_null', ['payment_id'], { unique: true, where: '"payment_id" IS NOT NULL' })
    @Column({ name: 'payment_id', type: 'varchar', length: 64, nullable: true })
    payment_id: string;



    @Column({name:'payment_type', type:'varchar',nullable:true}) // DEBIT, CREDIT , MP ACCOUNT , ETC
    payment_type:string;



    @Column({name:'payer_id' , type:'varchar',nullable:true})
    payer_id:string;


    @Column({name:'payer_email', type:'varchar',nullable:true})
    payer_email:string;




    @Column({name:'preference_id', type:'varchar' , unique:true})
    preference_id:string;



    @Column({ name: 'preference_link', type: 'varchar'})
    preference_link: string;


    @Column({ name: 'external_reference', type: 'varchar', length: 255,unique:true })
    external_reference: string;
    

    @Column({name:'status' , type:'enum' , enum:PAYMENTS_STATUS,default:PAYMENTS_STATUS.PENDING})
    status:PAYMENTS_STATUS


    @Column({name: 'amount',type: 'decimal',precision: 10,scale: 2,default: '0.00'})
    amount: string;


    @Column({name:'currency', type:'varchar' ,length:3, nullable:true})
    currency:string;


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