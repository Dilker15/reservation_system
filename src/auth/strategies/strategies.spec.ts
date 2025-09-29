import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { UsersService } from "src/users/users.service";
import { ClientRegisterStrategy } from "./client-register.strategy";
import { AdminRegisterStrategy } from "./admin-register.strategy";
import { ClientDto } from "../dto/create-client-auth.dto";
import { Roles } from "src/common/Interfaces";


describe("Auth/strategies",()=>{

    let clientStrategy:ClientRegisterStrategy;
    let adminStrategy:AdminRegisterStrategy;

    const mockeUserService:Partial<jest.Mocked<UsersService>> = {
        create:jest.fn().mockImplementation((data)=>data),
    }

    
    beforeEach(async()=>{
        const refMod:TestingModule = await Test.createTestingModule({
            providers:[
                ClientRegisterStrategy,
                AdminRegisterStrategy,
                {
                    provide:UsersService,
                    useValue:mockeUserService,
                },
            ]
        }).compile();

        clientStrategy = refMod.get<ClientRegisterStrategy>(ClientRegisterStrategy);
        adminStrategy = refMod.get<AdminRegisterStrategy>(AdminRegisterStrategy);
    });


    it("should call register from clientStrategy",async()=>{
        const clientData:ClientDto= {email:"test@gmail.com",last_name:'lastname test',name:"testing1",password:'secure123',role:Roles.CLIENT};
        const clientRegistered = await clientStrategy.register(clientData,clientData.role);
        expect(mockeUserService.create).toHaveBeenCalledWith(clientData,clientData.role);
        
    });



    it("should call register from clientStrategy",async()=>{
        const adminData:ClientDto= {email:"test@gmail.com",last_name:'lastname test',name:"testing1",password:'secure123',role:Roles.CLIENT};
        const clientRegistered = await adminStrategy.register(adminData,adminData.role);
        expect(mockeUserService.create).toHaveBeenCalledWith(adminData,adminData.role);
        
    });
   


});