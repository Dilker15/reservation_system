
import { ParseAndValidateJsonPipe } from "./ParseJson.pipe";
import { BadRequestException } from '@nestjs/common';

describe('ParseAndValidateJsonPipe', () => {
  let pipe: ParseAndValidateJsonPipe;

  beforeEach(() => {
    pipe = new ParseAndValidateJsonPipe();
  });

  it('should throw if value is empty', () => {
    expect(() => pipe.transform(null)).toThrow(BadRequestException);
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
  });


  it('should throw if JSON is invalid', () => {
    const invalidJson = '{bad json}';
    expect(() => pipe.transform(invalidJson)).toThrow(
      BadRequestException,
    );
  });


  it('should throw if JSON is not an array', () => {
    const notArray = JSON.stringify({ day: 'Monday' });
    expect(() => pipe.transform(notArray)).toThrow(BadRequestException);
  });



  it('should throw if array is empty', () => {
    const emptyArray = JSON.stringify([]);
    expect(() => pipe.transform(emptyArray)).toThrow(BadRequestException);
  });



  it('should throw if days are repeated', () => {
    const repeatedDays = JSON.stringify([
      { day: 'Monday', open: '9:00', close: '17:00' },
      { day: 'Monday', open: '10:00', close: '18:00' },
    ]);
    expect(() => pipe.transform(repeatedDays)).toThrow(BadRequestException);
  });




  it('should return parsed array if valid', () => {
    const validJson = JSON.stringify([
      { day: 'Monday', open: '9:00', close: '17:00' },
      { day: 'Tuesday', open: '10:00', close: '18:00' },
    ]);

    const result = pipe.transform(validJson);

    expect(result).toEqual([
      { day: 'Monday', open: '9:00', close: '17:00' },
      { day: 'Tuesday', open: '10:00', close: '18:00' },
    ]);
  });
  
});
