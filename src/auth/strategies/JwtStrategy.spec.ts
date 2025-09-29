import { UsersService } from "src/users/users.service";
import { JwtStrategy } from "./JwtStrategy";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { payloadToken, Roles } from "src/common/Interfaces";


describe("Auth/strategies/JwtStrategy", () => {
  let strategy: JwtStrategy;
  let mockUserService: jest.Mocked<UsersService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const userMock = {
    id: "user_id_1",
    name: "name 1",
    email: "test@gmail.com",
    is_active: true,
  };

  beforeEach(async () => {
    mockUserService = {
      findUserValidById: jest.fn().mockResolvedValue(userMock),
    } as any;

    mockConfigService = {
      get: jest.fn().mockReturnValue("token_test"),
    } as any;

    const refMod: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    strategy = refMod.get<JwtStrategy>(JwtStrategy);
  });

  it("should call user service with payload and return user", async () => {
    const payloadUser: payloadToken = { role: Roles.CLIENT, sub: "user1" };
    const data = await strategy.validate(payloadUser);

    expect(mockUserService.findUserValidById).toHaveBeenCalledWith("user1");
    expect(data).toEqual(userMock);
  });




  it("should propagate errors from UsersService", async () => {
    mockUserService.findUserValidById.mockRejectedValueOnce(new Error("DB error"));
    const payloadUser: payloadToken = { role: Roles.CLIENT, sub: "user1" };
    await expect(strategy.validate(payloadUser)).rejects.toThrow("DB error");

  });


});
