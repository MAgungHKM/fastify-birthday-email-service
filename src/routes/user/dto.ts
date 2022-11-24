import S from "fluent-json-schema";

export type UserDTO = {
  id?: number;
  first_name: string;
  last_name: string;
  birthday: string;
  location: string;
};

export type UserIdDTO = {
  id: number;
};

export const userJSONSchema = (locations: Record<string, boolean>) =>
  S.object()
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

export const userParamIdSchema = S.object().prop("id", S.number().required());
