import { FastifyPluginAsync } from "fastify";
import { User, UserNotFound } from "../../core/users";
import { dateAsYYYYMMDD } from "../../utils";
import {
  UserDTO,
  GetUserByIdDTO,
  getUserByIdSchema,
  createUserSchema,
} from "./dto";

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const createUserSchemaImpl = createUserSchema(fastify.getAllValidTimeZones());

  fastify.get(
    "",
    {
      schema: {
        tags: ["User"],
      },
    },
    async function (request, reply) {
      const { users, error } = fastify.userRepository.getAll();
      if (error || !user) {
        reply.code(500).send(error);
        return;
      }

      return {
        message: "Success",
        data: users?.map<UserDTO>((item) => ({
          id: item._id,
          first_name: item.firstName,
          last_name: item.lastName,
          birthday: dateAsYYYYMMDD(item.birthday),
          location: item.location,
        })),
      };
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["User"],
        params: getUserByIdSchema,
      },
    },
    async function (request, reply) {
      const data = request.params as GetUserByIdDTO;
      const { user, error } = fastify.userRepository.getById(data.id);
      if (error || !user) {
        const statusCode = error instanceof UserNotFound ? 404 : 500;

        reply.code(statusCode).send(error);
        return;
      }

      const responseData: UserDTO = {
        id: user._id,
        first_name: user.firstName,
        last_name: user.lastName,
        birthday: dateAsYYYYMMDD(user.birthday),
        location: user.location,
      };

      return {
        message: "Success",
        data: responseData,
      };
    }
  );

  fastify.post(
    "",
    {
      schema: {
        tags: ["User"],
        body: createUserSchemaImpl,
      },
    },
    async function (request, reply) {
      const data = request.body as UserDTO;
      const user: User = {
        firstName: data.first_name,
        lastName: data.last_name,
        birthday: new Date(data.birthday),
        location: data.location,
      };

      const error = fastify.userRepository.create(user);
      if (error) {
        reply.code(500).send(error);
        return;
      }

      const responseData: UserDTO = {
        id: user._id,
        first_name: user.firstName,
        last_name: user.lastName,
        birthday: dateAsYYYYMMDD(user.birthday),
        location: user.location,
      };

      return {
        message: "Success",
        data: responseData,
      };
    }
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["User"],
        params: getUserByIdSchema,
        body: createUserSchemaImpl,
      },
    },
    async function (request, reply) {
      const body = request.body as UserDTO;
      const params = request.params as GetUserByIdDTO;
      const user: User = {
        _id: params.id,
        firstName: body.first_name,
        lastName: body.last_name,
        birthday: new Date(body.birthday),
        location: body.location,
      };

      const { user: updatedUser, error } = fastify.userRepository.update(user);
      if (error || !updatedUser) {
        const statusCode = error instanceof UserNotFound ? 404 : 500;

        reply.code(statusCode).send(error);
        return;
      }

      const responseData: UserDTO = {
        id: updatedUser._id,
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        birthday: dateAsYYYYMMDD(updatedUser.birthday),
        location: updatedUser.location,
      };

      return {
        message: "Success",
        data: responseData,
      };
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["User"],
        params: getUserByIdSchema,
      },
    },
    async function (request, reply) {
      const data = request.params as GetUserByIdDTO;
      const { user, error } = fastify.userRepository.delete(data.id);
      if (error || !user) {
        const statusCode = error instanceof UserNotFound ? 404 : 500;

        reply.code(statusCode).send(error);
        return;
      }

      const responseData: UserDTO = {
        first_name: user.firstName,
        last_name: user.lastName,
        birthday: dateAsYYYYMMDD(user.birthday),
        location: user.location,
      };

      return {
        message: `User #${user._id} successfully deleted`,
        data: responseData,
      };
    }
  );
};

export default user;
