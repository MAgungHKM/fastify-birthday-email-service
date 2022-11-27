import { AxiosError } from "axios";
import { IUserRepository, UserNotFound, UserService } from "../../users";
import { Email } from "../model";
import { EmailQueue, EmailQueueItem } from "./model";
import { ApiService } from "../../../api";
import { GenericError } from "../../../common";

const BIRTHDAY_EMAILING_HOUR = 9;

export class EmailQueueService {
  private api: ApiService;
  private userRepository: IUserRepository;
  private userService: UserService;

  constructor(
    userRepository: IUserRepository,
    userService: UserService,
    apiService: ApiService
  ) {
    this.userRepository = userRepository;
    this.userService = userService;
    this.api = apiService;
  }

  populateOnGoingQueue = async (emailQueue: EmailQueue) => {
    const { users, error } = await this.userRepository.getByLocalTime(
      BIRTHDAY_EMAILING_HOUR
    );

    if (error || !users || users.length === 0) {
      return new UserNotFound();
    }

    for (const user of users) {
      const email = new Email(user);
      const emailQueueItem = new EmailQueueItem(email);

      emailQueue.pushOnGoing(emailQueueItem);
    }

    return undefined;
  };

  processOnGoingQueue = async (
    emailQueue: EmailQueue
  ): Promise<AxiosError<any, any> | GenericError | undefined> => {
    while (true) {
      const { item, error } = emailQueue.shiftFailed();
      if (error) {
        if (error && error.message === "Email queue is empty.") break;
        else return Promise.resolve(error);
      }

      emailQueue.pushOnGoing(item as EmailQueueItem);
    }

    let i = 1;
    while (true) {
      const { item, error } = emailQueue.shiftOnGoing();

      if (error || !item) {
        if (error && error.message === "Email queue is empty.") break;
        else return Promise.resolve(error);
      }

      const { title, message, to, userId } = item.email;

      const isUserBirthday = await this.userService.isUserBirthDayById(
        userId,
        BIRTHDAY_EMAILING_HOUR
      );

      if (!isUserBirthday) continue;

      console.log(`Process #${i++}. Sending an email to: ${to}`);

      await this.api
        .sendNotification(title, message, to)
        .then(() => console.log("The email successfully sent."))
        .catch(() => {
          console.log(
            `A problem occured when sending an email to: ${to}, will try again in the next batch.`
          );
          item.incrementRetries();

          if (item.retries > 3) {
            item.resetRetries();
            emailQueue.pushFailed(item);
          } else {
            emailQueue.pushOnGoing(item);
          }
        });
    }
  };
}
