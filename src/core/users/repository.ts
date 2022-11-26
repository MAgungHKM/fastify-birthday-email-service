import { HourNumbers } from "luxon";
import { GenericError } from "../../common";
import { User } from "./model";

export type IUserRepository = {
  getAll: () => Promise<{ users?: User[]; error?: GenericError }>;
  getById: (userId: number) => Promise<{ user?: User; error?: GenericError }>;
  getByLocalTime: (time: HourNumbers) => Promise<{
    users?: User[];
    error?: GenericError;
  }>;
  create: (user: User) => Promise<GenericError | undefined>;
  update: (user: User) => Promise<{ user?: User; error?: GenericError }>;
  delete: (userId: number) => Promise<{ user?: User; error?: GenericError }>;
};
