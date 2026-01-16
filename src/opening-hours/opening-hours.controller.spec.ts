import { Test, TestingModule } from '@nestjs/testing';
import { OpeningHoursController } from './opening-hours.controller';
import { OpeningHoursService } from './opening-hours.service';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { User } from 'mercadopago';

describe('OpeningHoursController', () => {
  let controller: OpeningHoursController;
  let mockOpeningService : Partial<jest.Mocked<OpeningHoursService>>;

  beforeEach(async () => {
    mockOpeningService = {
      update:jest.fn(),
      remove:jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpeningHoursController],
      providers: [
        {
          provide:OpeningHoursService,
          useValue:mockOpeningService,
        }
      ],
    }).compile();

    controller = module.get<OpeningHoursController>(OpeningHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  it('should update opening hours', async () => {
    const id = 'uuid-1';

    const newOpening: UpdateOpeningHourDto = {
      close_time: '20:30',
      open_time: '10:00',
      place_id: 'place-1',
    };

    const ownerTest = {
      id: 'user-uuid',
      name: 'owner-test',
    } as any;
    
    await controller.update(id, newOpening, ownerTest);

    expect(mockOpeningService.update).toHaveBeenCalledWith(
      id,
      newOpening,
      ownerTest
    );
  });


  it("should detele opening hours",async()=>{
      const hourToRemove = 'hour-uuid';
      const placeId = 'place-uuid';
      const owner = { id:'user-uuid',name:'test'} as any;

      await controller.remove(hourToRemove,placeId,owner);

      expect(mockOpeningService.remove).toHaveBeenCalledWith(hourToRemove,placeId,owner);

  });



});
