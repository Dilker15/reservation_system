import { SetMetadata } from "@nestjs/common";


export const  KEY_ROLES:string='roles';

export const Role = (...roles:string[])=>SetMetadata(KEY_ROLES,roles);