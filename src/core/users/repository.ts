import { User, UserError } from "./model";

export type IUserRepository = {
  getAll: () => { users?: User[]; error?: UserError };
  getById: (userId: number) => { user?: User; error?: UserError };
  create: (user: User) => UserError | undefined;
  update: (user: User) => { user?: User; error?: UserError };
  delete: (userId: number) => { user?: User; error?: UserError };
};
