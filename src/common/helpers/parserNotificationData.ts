import { Injectable } from "@nestjs/common";
import { Place } from "src/places/entities/place.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { User } from "src/users/entities/user.entity";
import { NotificationConfirmDto } from "../dtos/notification.confirm.dto";
import { BookingModeType } from "../Interfaces";




@Injectable()
export class ParserNotificationData{


    parserNotificationConfirm(client:User,reservation:Reservation,place:Place):NotificationConfirmDto{
        let notificationData:NotificationConfirmDto = {clientName:client.name,placeName:place.name,reservationStart:reservation.reservation_start_date}
        if(place.booking_mode.type === BookingModeType.DAILY){
                notificationData.startHour = reservation.start_time;
                notificationData.endHour   = reservation.end_time;
                notificationData.reservationEnd = reservation.reservation_start_date;
        }else{
               notificationData.reservationEnd = reservation.reservation_end_date;
        }
        return notificationData;
    }

}