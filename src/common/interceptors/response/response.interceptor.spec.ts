import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let context: Partial<ExecutionContext>;
  let callHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

   
    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    };

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('should wrap the response in standard format', (done) => {
    const mockData = { id: 1, name: 'Test' };
    (callHandler.handle as jest.Mock) = jest.fn().mockReturnValue(of(mockData));

    const result$ = interceptor.intercept(
      context as ExecutionContext,
      callHandler as CallHandler,
    );

    result$.subscribe((res) => {
      expect(res).toHaveProperty('success', true);
      expect(res).toHaveProperty('error', 0);
      expect(res).toHaveProperty('statusCode', 200);
      expect(res).toHaveProperty('message', 'Success');
      expect(res).toHaveProperty('timestamp');
      expect(res).toHaveProperty('data', mockData);
      done();
    });
  });

  it('should return empty object if handle emits null', (done) => {
    (callHandler.handle as jest.Mock) = jest.fn().mockReturnValue(of(null));

    const result$ = interceptor.intercept(
      context as ExecutionContext,
      callHandler as CallHandler,
    );

    result$.subscribe((res) => {
      expect(res.data).toEqual({});
      done();
    });
  });

  it('should use statusCode from response', (done) => {
    const customContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      }),
    };

    (callHandler.handle as jest.Mock) = jest.fn().mockReturnValue(of({}));

    const result$ = interceptor.intercept(
      customContext as unknown as ExecutionContext,
      callHandler as CallHandler,
    );

    result$.subscribe((res) => {
      expect(res.statusCode).toBe(201);
      done();
    });
  });
});
