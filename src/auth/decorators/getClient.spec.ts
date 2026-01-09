import { BadRequestException, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { getClientFunc } from "./getClient";
import { Roles } from "src/common/Interfaces";



describe('GetClient Decorator', () => {

  let mockContext: Partial<ExecutionContext>;
  let getRequestMock: jest.Mock;

  let baseUser = {
    id:'test_id',
    name:'test_name',
    role:['OWNER']
  }
  beforeEach(() => {
    getRequestMock = jest.fn();

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: getRequestMock,
      }),
    };
  });

  it('should throw InternalServerErrorException if user not found', () => {
    getRequestMock.mockReturnValueOnce({}); 

    expect(() =>
      getClientFunc(undefined, mockContext as ExecutionContext),
    ).toThrow(InternalServerErrorException);
  });

  it('should throw BadRequestException if role is not CLIENT', () => {
    getRequestMock.mockReturnValueOnce({
      user: {
        ...baseUser,
        role: ['OWNER'], 
      },
    });

    expect(() =>
      getClientFunc(undefined, mockContext as ExecutionContext),
    ).toThrow(BadRequestException);
  });

  it('should return user if role is CLIENT', () => {
    const clientUser = {
      ...baseUser,
      role: [Roles.CLIENT],
    };

    getRequestMock.mockReturnValueOnce({
      user: clientUser,
    });

    const result = getClientFunc(undefined, mockContext as ExecutionContext);

    expect(result).toBe(clientUser);
  });
});




