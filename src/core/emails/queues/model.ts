import { GenericError } from "../../../common";
import { Email } from "../model";

export class EmailQueueItem {
  email: Email;
  retries: number;

  constructor(email: Email) {
    this.email = email;
    this.retries = 0;
  }

  incrementRetries = () => this.retries++;
  resetRetries = () => (this.retries = 0);
}

export class EmailQueue {
  onGoing: EmailQueueItem[] = [];
  failed: EmailQueueItem[] = [];

  shiftOnGoing = () => {
    if (this.onGoing.length == 0) {
      return { error: new EmptyEmailQueueError() };
    }

    return { item: this.onGoing.shift() };
  };

  pushOnGoing = (emailQueueItem: EmailQueueItem) => {
    this.onGoing.push(emailQueueItem);
  };

  shiftFailed = () => {
    if (this.failed.length == 0) {
      return { error: new EmptyEmailQueueError() };
    }

    return { item: this.failed.shift() };
  };

  pushFailed = (emailQueueItem: EmailQueueItem) => {
    this.failed.push(emailQueueItem);
  };
}

export class EmptyEmailQueueError implements GenericError {
  message: string;

  constructor() {
    this.message = `Email queue is empty.`;
  }
}
