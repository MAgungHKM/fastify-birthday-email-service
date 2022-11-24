import S from "fluent-json-schema";

export type UserDTO = {
  id?: number;
  first_name: string;
  last_name: string;
  birthday: string;
  location: string;
};

export type GetUserByIdDTO = {
  id: number;
};

export const createUserSchema = (locations: Record<string, boolean>) =>
  S.object()
    .id("create-user")
    .title("Create a User")
    .description(
      "A simple user with first & last names, date of birth, and their location."
    )
    .prop("first_name", S.string().minLength(1).required())
    .prop("last_name", S.string().minLength(1).required())
    .prop(
      "birthday",
      S.raw({
        type: "string",
        format: "date",
      }).required()
    )
    .prop(
      "location",
      S.string()
        .enum(Object.keys(locations))
        .default("Australia/Melbourne")
        .required()
    );

export const getUserByIdSchema = S.object()
  .id("get-user-by-id")
  .title("Get a User by their ID")
  .description("Get a user and theri data using the provided ID.")
  .prop("id", S.number().required());
