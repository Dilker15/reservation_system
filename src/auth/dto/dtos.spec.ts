import { Roles } from "src/common/Interfaces";
import { LoginResponseDto } from "./login-response.dto";
import { validate } from "class-validator";

describe('LoginResponseDto', () => {

  it("should be valid with correct data", async () => {
    const loginData = new LoginResponseDto();
    loginData.id = '550e8400-e29b-41d4-a716-446655440000';
    loginData.email = 'test@gmail.com';
    loginData.is_active = true;
    loginData.name = 'test1';
    loginData.last_name = 'lastname test';
    loginData.role = Roles.CLIENT;
    loginData.token = 'testtoken';

    const res = await validate(loginData);
    expect(res.length).toBe(0);
  });

  it("should fail when required fields are missing", async () => {
    const loginData = new LoginResponseDto();
    const res = await validate(loginData);
    expect(res.length).toBeGreaterThan(0);
  });

  it("should fail with invalid UUID in id", async () => {
    const loginData = new LoginResponseDto();
    loginData.id = 'invalid-uuid';
    loginData.email = 'test@gmail.com';
    loginData.is_active = true;
    loginData.name = 'test1';
    loginData.last_name = 'lastname test';
    loginData.role = Roles.CLIENT;
    loginData.token = 'testtoken';

    const res = await validate(loginData);
    expect(res.some(r => r.property === 'id')).toBeTruthy();
  });

  it("should fail with invalid email", async () => {
    const loginData = new LoginResponseDto();
    loginData.id = '550e8400-e29b-41d4-a716-446655440000';
    loginData.email = 'not-an-email';
    loginData.is_active = true;
    loginData.name = 'test1';
    loginData.last_name = 'lastname test';
    loginData.role = Roles.CLIENT;
    loginData.token = 'testtoken';

    const res = await validate(loginData);
    expect(res.some(r => r.property === 'email')).toBeTruthy();
  });

  it("should fail with invalid role", async () => {
    const loginData = new LoginResponseDto();
    loginData.id = '550e8400-e29b-41d4-a716-446655440000';
    loginData.email = 'test@gmail.com';
    loginData.is_active = true;
    loginData.name = 'test1';
    loginData.last_name = 'lastname test';
    //@ts-expect-error para forzar un valor no permitido
    loginData.role = "INVALID_ROLE";
    loginData.token = 'testtoken';

    const res = await validate(loginData);
    expect(res.some(r => r.property === 'role')).toBeTruthy();
  });
});
