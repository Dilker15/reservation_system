import { PaymentAccount } from "../entities/payment_account.entity";

const dataAccountAuth = [
    {
      access_token: 'APP_USR-98342145-110022-AR-a9f3c2e4b1d6f8a7',
      refresh_token: 'TG-98342145-110022-AR-7e6d5c4b3a2f1e9',
      token_type: 'bearer',
      expires_in: 1555200,
      provider_account_id: '3023405934',
      user_id: 1100223344,
      default_currency: 'ARS',
      created_at: '2025-01-02T10:12:45Z'
    },
    {
      access_token: 'APP_USR-77451236-220033-AR-4f6a8b9c2e1d7a3',
      refresh_token: 'TG-77451236-220033-AR-9a1b2c3d4e5f6a7',
      token_type: 'bearer',
      expires_in: 1555200,
      provider_account_id: '3023405934',
      user_id: 2200334455,
      default_currency: 'ARS',
      created_at: '2025-01-03T14:28:19Z'
    },
    {
      access_token: 'APP_USR-66549871-330044-AR-abc123def456',
      refresh_token: 'TG-66549871-330044-AR-fed654cba321',
      token_type: 'bearer',
      expires_in: 1555200,
      provider_account_id: '3023405934',
      user_id: 3300445566,
      default_currency: 'ARS',
      created_at: '2025-01-04T08:41:02Z'
    },
    {
      access_token: 'APP_USR-55236789-440055-AR-9f8e7d6c5b4a3',
      refresh_token: 'TG-55236789-440055-AR-3a4b5c6d7e8f9',
      token_type: 'bearer',
      expires_in: 1555200,
      provider_account_id: '3023405934',
      user_id: 4400556677,
      default_currency: 'ARS',
      created_at: '2025-01-05T19:55:37Z'
    },
    {
      access_token: 'APP_USR-44128976-550066-AR-1a2b3c4d5e6f',
      refresh_token: 'TG-44128976-550066-AR-6f5e4d3c2b1a',
      token_type: 'bearer',
      expires_in: 15552000,
      provider_account_id: '3023405934',
      user_id: 5500667788,
      default_currency: 'ARS',
      created_at: '2025-01-06T16:09:11Z'
    }
  ];
  



export const getAuthData = (index:number)=>{
    return dataAccountAuth[index];
}