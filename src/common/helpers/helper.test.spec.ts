import { BcryptService } from "./bcryp";
import { GeneratorCodeService } from "./codeGenerator"



describe("Common Helpers",()=>{
    

    it("It should return a code with 5 number",()=>{
       const codeGenerated = GeneratorCodeService.generate();
       expect(codeGenerated).toMatch(/^\d{5}$/);
    });


    it("It should be return a hashed Password",async()=>{
        const testPassword = "Password123";
        const hash = await BcryptService.hasPassword(testPassword);
        expect(hash).not.toEqual(testPassword);
        expect(hash.startsWith("$2b$")).toBe(true)
        
    })
})


