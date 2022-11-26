import { GenericError } from "../../common";
import { User } from "./model";

export type IUserRepository = {
  getAll: () => { users?: User[]; error?: GenericError };
  getById: (userId: number) => { user?: User; error?: GenericError };
  getByLocations: (locations: string[]) => {
    users?: User[];
    error?: GenericError;
  };
  create: (user: User) => GenericError | undefined;
  update: (user: User) => { user?: User; error?: GenericError };
  delete: (userId: number) => { user?: User; error?: GenericError };
};
