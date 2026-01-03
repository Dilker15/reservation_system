import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity({name:'oauth_states'})
export class OAuthStates{


    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({name:'state',type:'varchar', length:255})
    state:string;

    @OneToOne(() => User, (user) => user)
    @JoinColumn({ name: 'admin_id' })
    admin: User;


    @CreateDateColumn({name:'expired_at',type:'timestamp'})
    expires_at:Date;

}