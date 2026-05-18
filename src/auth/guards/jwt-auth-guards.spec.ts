import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth-guards';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Roles } from 'src/common/Interfaces';

describe('JwtAuthGuard', () => {
  let guardJwt: JwtAuthGuard;
  let mockReflector: Partial<Reflector>;

  const mockUser = {
    id: 'uuid_test',
    name: 'user_test',
    role: Roles.OWNER,
  };

  const mockExecutionContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    }) as any;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guardJwt = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should return true for public endpoints with @Public() decorator', async () => {
    jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValueOnce(true);

    const result = await guardJwt.canActivate(mockExecutionContext());

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when JWT token is invalid', async () => {
    jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValueOnce(false);
    jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guardJwt)), 'canActivate')
        .mockResolvedValueOnce(false);

    await expect(guardJwt.canActivate(mockExecutionContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when user lacks required roles', async () => {
    jest.spyOn(mockReflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['admins', 'master']);

    jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guardJwt)), 'canActivate')
        .mockResolvedValueOnce(true);

    await expect(guardJwt.canActivate(mockExecutionContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should return true, user authorized to resource",async()=>{
      jest.spyOn(mockReflector,'getAllAndOverride').mockReturnValueOnce(false)
          .mockReturnValueOnce([Roles.CLIENT,Roles.OWNER]);

      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guardJwt)),'canActivate')
          .mockResolvedValueOnce(true);
    

      const result = await guardJwt.canActivate(mockExecutionContext());
      expect(result).toBe(true);
  });

});