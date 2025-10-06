import { Repository } from "typeorm";
import { BookingModeService } from "./booking-mode.service";
import { BookingMode } from "./entities/booking-mode.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateBookingModeDto } from "./dto/create-booking-mode.dto";
import { BookingModeType, BookingName } from "src/common/Interfaces";




describe('BookingModeService',()=>{
    let service:BookingModeService;
    let mockRepository:Partial<jest.Mocked<Repository<BookingMode>>>;
    const mockBookingModes = [
        {name:"hourly"},
         {name:"yearly"}
    ];

    beforeEach(async()=>{
        jest.resetAllMocks();
        mockRepository = {
            find:jest.fn().mockResolvedValue(mockBookingModes),
        }

        const modRef:TestingModule = await Test.createTestingModule({
            providers:[
                BookingModeService,
                {
                    provide:getRepositoryToken(BookingMode),
                    useValue:mockRepository
                }
            ]
        }).compile();

        service = modRef.get<BookingModeService>(BookingModeService);
    });



    it("should create and return a new bookingMode",async()=>{
       const createBooking:CreateBookingModeDto={description:'test description',min_duration:1,name:BookingName.PER_DAY,type:BookingModeType.DAILY};
       const result = await service.create(createBooking);
       expect(result).toEqual(createBooking);
    });


    it("should return a list of Booking mode",async()=>{
        const query = {where:{is_active:true}};
        const result = await service.findAll();
        expect(mockRepository.find).toHaveBeenCalledWith(query);
        expect(result).toEqual(mockBookingModes);
    });


});