import { DateTime, HourNumbers } from "luxon";
import { dateAsYYYYMMDD } from "../../utils";
import { IUserRepository } from "./repository";

export class UserService {
  private userRepository: IUserRepository;
  private getAllTimeZonesByHour: (
    hour: HourNumbers,
    date?: DateTime
  ) => Record<string, string>;

  constructor(
    userRepository: IUserRepository,
    getAllTimeZonesByHour: (
      hour: HourNumbers,
      date?: DateTime
    ) => Record<string, string>
  ) {
    this.userRepository = userRepository;
    this.getAllTimeZonesByHour = getAllTimeZonesByHour;
  }

  isUserBirthDayById = async (id: number, hour: HourNumbers) => {
    const { user, error } = await this.userRepository.getById(id);
    if (error || !user) return false;

    const zones = this.getAllTimeZonesByHour(hour);

    return (
      Object.keys(zones).includes(user.location) &&
      dateAsYYYYMMDD(user.birthdate).slice(5) === zones[user.location].slice(5)
    );
  };
}
