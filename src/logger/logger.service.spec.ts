



import { warn } from 'console';
import { logger } from './logger.config';
import { AppLoggerService } from './logger.service';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./logger.config',()=>({
    logger:{
        info:jest.fn(),
        warn:jest.fn(),
        error:jest.fn(),
        debug:jest.fn(),
        verbose:jest.fn(),
    }
}));

describe("src/logger.service.ts",()=>{

    let loggerService:AppLoggerService;

    beforeEach(async()=>{
        const refService :TestingModule = await Test.createTestingModule({
            providers:[
                AppLoggerService,
            ]
        }).compile();
        loggerService = refService.get<AppLoggerService>(AppLoggerService);
    });


    it("should log info message with context",()=>{
        const message = 'test info message';

        const loggerWithContext = loggerService.withContext('testContext');
        loggerWithContext.log(message);

        expect(logger.info).toHaveBeenCalledWith(
            message,
            { context: 'testContext' }
        );
    });

    it("should log error message with context",()=>{
        const message ='test error message';
        const trace = 'test trace'
        const contextLogger = loggerService.withContext('testContext');
        contextLogger.error(message,trace);
        expect(logger.error).toHaveBeenCalledWith(`${message}${trace ? ' - ' + trace : ''}`,{ context: 'testContext' });

    });


    it("should log warn message with context",()=>{
        const message = 'test message';
        const contextLog = loggerService.withContext('testContext');
        contextLog.warn(message);
        expect(logger.warn).toHaveBeenCalledWith(message,{context:'testContext'});
    });

    it("should log debug message with context",()=>{
        const message = 'test message';
        const contextLog = loggerService.withContext('testContext');
        contextLog.debug(message);
        expect(logger.debug).toHaveBeenCalledWith(message,{context:'testContext'});
    });

    it("should log verbose message with context",()=>{
        const message = 'test message';
        const contextLog = loggerService.withContext('testContext');
        contextLog.verbose(message);
        expect(logger.verbose).toHaveBeenCalledWith(message,{context:'testContext'});
    });


});







