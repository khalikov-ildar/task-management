import { Injectable } from '@nestjs/common';
import { IDateService } from './i-date.service';

@Injectable()
export class DateService implements IDateService {
  getDateOneHourFromNow(): Date {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  isAfterOneHourFromNow(date: Date): boolean {
    return date.getTime() > Date.now() + 60 * 60 * 1000;
  }

  isAfterNow(date: Date): boolean {
    return date.getTime() > Date.now();
  }
}
