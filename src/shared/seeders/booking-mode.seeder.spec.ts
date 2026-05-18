import { DataSource, Repository } from "typeorm";
import { seedBookingMode } from "./booking-mode.seeder";
import { BookingMode } from "src/booking-mode/entities/booking-mode.entity";
import { log } from "console";
import { bookingModesData } from "../data/booking-mode.data";




describe("Shared.BookingModeSeeder",()=>{

     let mockDataSource: Partial<jest.Mocked<DataSource>>;
     let mockRepository: Partial<jest.Mocked<Repository<BookingMode>>>;

  beforeEach(() => {
    mockRepository = {
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository as Repository<BookingMode>),
    }
    jest.clearAllMocks();
  });

   it('should call save for each booking mode if table is empty', async () => {
    await seedBookingMode(mockDataSource as unknown as DataSource);
    expect(mockRepository.count).toHaveBeenCalled();
    expect(mockDataSource.getRepository).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledTimes(bookingModesData.length);

  });


  it("should not insert bookingmode",async()=>{
    mockRepository.count?.mockResolvedValueOnce(2);
    await seedBookingMode(mockDataSource as unknown as DataSource);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });


});