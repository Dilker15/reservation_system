import { Injectable } from "@nestjs/common";


@Injectable()
export class GeneratorCodeService{


    generate(length = 5): string {
        let code = '';
        for (let i = 0; i < length; i++) {
          code += Math.floor(Math.random() * 10);
        }
        return code;
      }
}