import 'reflect-metadata';
import { ErrorsFilter } from './errors.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('ErrorsFilter', () => {
  let filter: ErrorsFilter<any>;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new ErrorsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Bad Request', 400);

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'Bad Request',
        path: '/test',
        errors: 1,
        data: [],
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle non-HttpException correctly', () => {
    const exception = { foo: 'bar' };

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/test',
        errors: 1,
        data: [],
        timestamp: expect.any(String),
      }),
    );
  });
});
