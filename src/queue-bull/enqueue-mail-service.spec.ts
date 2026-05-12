
import { getQueueToken } from "@nestjs/bullmq";
import { EnqueueMailServices } from "./enqueue-mail-services"
import {TestingModule,Test } from "@nestjs/testing";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { AppLoggerService } from "src/logger/logger.service";


const mockqueue ={
    add:jest.fn(),
}
const mockData = {
    log:jest.fn(),
    error:jest.fn(),
}

describe("Enqueue mail services",()=>{

    let enqueService:EnqueueMailServices;

    let mockLogger = {
        withContext:()=>mockData
    }

    beforeEach(async()=>{
        const refMod:TestingModule= await Test.createTestingModule({
            providers:[
                EnqueueMailServices,
                {
                    provide:getQueueToken('emails-queue'),
                    useValue:mockqueue,
                },
                {
                    provide:AppLoggerService,
                    useValue:mockLogger,
                }
            ]
        }).compile();

        enqueService=refMod.get<EnqueueMailServices>(EnqueueMailServices);
        jest.clearAllMocks();
    });


    it("should define enque-service",()=>{
        expect(enqueService).toBeDefined();
    });

    it("should enqueue a verification code email with correct payload",async()=>{
        const data = {
            to:'test@gmail.com',
            code:'24524',
        }
        const notification_type = EMAIL_TYPE.VERIFICATION_CODE;
        await enqueService.enqueEmail(notification_type,data);
        expect(mockqueue.add).toHaveBeenCalledWith(notification_type,{
            notification_type,
            data,
        })


    });


    it("should throw an error if queue.add fails",async()=>{
        const data = {
            to:'test@gmail.com',
            code:'24524',
        }
        const notification_type = EMAIL_TYPE.VERIFICATION_CODE;
        mockqueue.add.mockRejectedValueOnce(new Error('enqueue fails'));
        await expect(enqueService.enqueEmail(notification_type,{notification_type,data})).rejects.toThrow('enqueue fails');
    });

});


