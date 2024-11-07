export abstract class IDateService {
  abstract getDateOneHourFromNow(): Date;
  abstract isAfterOneHourFromNow(date: Date): boolean;
  abstract isAfterNow(date: Date): boolean;
}
