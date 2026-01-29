import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  export function IsDateOnly(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isDateOnly',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
          validate(value: string) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
            const date = new Date(value + 'T00:00:00');
            return !isNaN(date.getTime());
          },
        },
      });
    };
  }
  