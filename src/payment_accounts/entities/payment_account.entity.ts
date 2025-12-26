import { PAYMENT_ACCOUNTS_STATUS, PAYMENTS_STATUS, PROVIDERS } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
    JoinColumn,
    ManyToOne,

  } from 'typeorm';

  

  
 
  
  @Entity('payment_accounts')
  @Index(['provider', 'provider_account_id'], { unique: true })
  @Index(['admin', 'provider'], { unique: true })
  export class PaymentAccount {



      @PrimaryGeneratedColumn('uuid')
      id: string;


      @Column({type: 'enum',enum:PROVIDERS})
      @Index()
      provider: PROVIDERS;
    

      @Column({ name: 'provider_account_id', type: 'varchar', length: 255 })
      @Index()
      provider_account_id: string;
  
    
      @Column({ name: 'access_token', type: 'text', nullable: true })
      access_token?: string;
      
    
      @Column({ name: 'refresh_token', type: 'text', nullable: true })
      refresh_token?: string;

    
      @Column({ name: 'token_type', type: 'varchar', length: 50, nullable: true })
      token_type?: string; // 'bearer'

  
      @Column({type: 'enum' , enum:PAYMENT_ACCOUNTS_STATUS ,default:PAYMENT_ACCOUNTS_STATUS.ACTIVE})
      @Index()
      status: PAYMENT_ACCOUNTS_STATUS
    
  
      @Column({name: 'default_currency',type: 'varchar',length: 3,default: 'ARS',})
      default_currency: string;
    
    
      @Column({ type: 'jsonb', nullable: true })
      metadata?: Record<string, any>;

    
      @Column({ name: 'token_expires_at', type: 'int', nullable: true })
      token_expires_at?: number;


      @ManyToOne(()=>User,(u)=>u.payment_accounts)
      @JoinColumn({name:'admin_id'})
      admin:User;
      
      @CreateDateColumn({ name: 'created_at' })
      created_at: Date;
    
      @UpdateDateColumn({ name: 'updated_at' })
      updated_at: Date;
    

  
    
    
  }