import { Expose } from "class-transformer";


export class UserResponseDto{
        @Expose()
        id:string;
       
        @Expose()
        name:string;

        @Expose()
        last_name:string;

        @Expose()
        email:string;

        @Expose()
        role:string;

        @Expose()
        is_active:boolean;

        
        @Expose()
        email_verified:boolean;
}