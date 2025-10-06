import { Test, TestingModule } from "@nestjs/testing";
import { BookingModeController } from "./booking-mode.controller";
import { BookingModeService } from "./booking-mode.service";
import { CreateBookingModeDto } from "./dto/create-booking-mode.dto";
import { BookingModeType, BookingName } from "src/common/Interfaces";



describe("BookingModeController",()=>{

    let controller :BookingModeController;
    let mockBookingService:Partial<jest.Mocked<BookingModeService>>;


    beforeEach(async()=>{
        mockBookingService = {
            create:jest.fn(),
            findAll:jest.fn(),
        }
        const refMod:TestingModule = await Test.createTestingModule({
            controllers:[BookingModeController],
            providers:[
                {
                    provide:BookingModeService,
                    useValue:mockBookingService,
                }
            ]
        }).compile();

        controller = refMod.get<BookingModeController>(BookingModeController);
        jest.clearAllMocks();
    });


    it("should create a bookingMode with correct data",async()=>{
        const createBooking:CreateBookingModeDto={description:'test description',min_duration:1,name:BookingName.PER_DAY,type:BookingModeType.DAILY};
        await controller.create(createBooking);
        expect(mockBookingService.create).toHaveBeenCalledWith(createBooking);
    });


    it("should return a booking-mode list",async()=>{
         await controller.getBookinModes();
         expect(mockBookingService.findAll).toHaveBeenCalledTimes(1);

    });



});