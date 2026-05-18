import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { dataFun } from "./getUser.decorator";



describe("Get User decorator",()=>{

    let mockUser = {name:'test_user',id:'test_id'};

    let mockExecutionContext : Partial<ExecutionContext> = {
        switchToHttp:jest.fn().mockReturnValue({
            getRequest:jest.fn().mockReturnValue({
                user: mockUser,
            }),
        }),
    }

    it("should return an user in request",()=>{
        const result = dataFun('',mockExecutionContext as ExecutionContext);
        expect(result).toBe(mockUser);
    })


    it("should throw an userNot found exception",()=>{
        const executionCont : Partial<ExecutionContext> = {
            switchToHttp:jest.fn().mockReturnValue({
                 getRequest:jest.fn().mockReturnValue({})
            })
        }
        expect(() =>dataFun(undefined, executionCont as ExecutionContext)).toThrow(InternalServerErrorException);
    })
});