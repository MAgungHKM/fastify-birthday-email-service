import fp from "fastify-plugin";
import Fastify from "fastify";
import { test } from "tap";
import { InMemoryDB } from "../../src/infra/inmemory/db";
import { UserDTO } from "../../src/routes/user/dto";
import { dateAsYYYYMMDD } from "../../src/utils";
import { build } from "../helper";
import MockedBootstrapper from "../plugins/boot.mock";

test("user route work as intended", async (t) => {
  InMemoryDB.getInstance().users().clearData();

  const app = await build(t);

  const now = new Date();
  const nowStr = dateAsYYYYMMDD(now);

  const userPayload1: UserDTO = {
    first_name: "John",
    last_name: "Doe",
    birthday: nowStr,
    location: "Australia/Melbourne",
  };

  t.test("create a user", async (t) => {
    const res = await app.inject({
      method: "POST",
      url: "/user",
      payload: userPayload1,
    });

    t.same(JSON.parse(res.payload), {
      message: "Success",
      data: {
        id: 1,
        ...userPayload1,
      },
    });
  });

  t.test("get all user", async (t) => {
    const res = await app.inject({
      method: "GET",
      url: "/user",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 200);
    t.equal(payload.data.length, 1);
    t.same(payload, {
      message: "Success",
      data: [
        {
          ...userPayload1,
          id: 1,
        },
      ],
    });
  });

  t.test("get user but with invalid id", async (t) => {
    const res = await app.inject({
      method: "GET",
      url: "/user/1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 200);
    t.same(payload, {
      message: "Success",
      data: {
        ...userPayload1,
        id: 1,
      },
    });
  });

  t.test("get user by id", async (t) => {
    const res = await app.inject({
      method: "GET",
      url: "/user/-1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 404);
    t.same(payload, {
      message: `User #-1 not found.`,
    });
  });

  const newUserPayload1: UserDTO = {
    first_name: "Jeane",
    last_name: "Doe",
    birthday: nowStr,
    location: "Australia/Melbourne",
  };

  t.test("update a user by their id", async (t) => {
    const res = await app.inject({
      method: "PUT",
      url: "/user/1",
      payload: newUserPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 200);
    t.same(payload, {
      message: "Success",
      data: {
        ...newUserPayload1,
        id: 1,
      },
    });
  });

  t.test("update a user but with invalid id", async (t) => {
    const res = await app.inject({
      method: "PUT",
      url: "/user/-1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 404);
    t.same(payload, {
      message: `User #-1 not found.`,
    });
  });

  t.test("delete a user by their id", async (t) => {
    const res = await app.inject({
      method: "DELETE",
      url: "/user/1",
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 200);
    t.same(payload, {
      message: "User #1 successfully deleted",
      data: {
        ...newUserPayload1,
      },
    });
  });

  t.test("delete a user but with invalid id", async (t) => {
    const res = await app.inject({
      method: "DELETE",
      url: "/user/-1",
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 404);
    t.same(payload, {
      message: `User #-1 not found.`,
    });
  });

  const AppMock = t.mock("../../src/app", {
    "../../src/plugins/boot": MockedBootstrapper,
  });
  const mockedApp = Fastify();
  mockedApp.register(fp(AppMock), {});

  t.test("create a user but return unknown error", async (t) => {
    const res = await mockedApp.inject({
      method: "POST",
      url: "/user",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.same(payload, {
      message: `Unknown error`,
    });
  });

  t.test("update a user but return unknown error", async (t) => {
    const res = await mockedApp.inject({
      method: "PUT",
      url: "/user/1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.same(payload, {
      message: `Unknown error`,
    });
  });

  t.test("get user by id but return unknown error", async (t) => {
    const res = await mockedApp.inject({
      method: "GET",
      url: "/user/1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.same(payload, {
      message: `Unknown error`,
    });
  });

  t.test("get all user but return unknown error", async (t) => {
    const res = await mockedApp.inject({
      method: "GET",
      url: "/user",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.same(payload, {
      message: `Unknown error`,
    });
  });

  t.test("delete user by id but return unknown error", async (t) => {
    const res = await mockedApp.inject({
      method: "DELETE",
      url: "/user/1",
      payload: userPayload1,
    });
    const payload = JSON.parse(res.payload);

    t.equal(res.statusCode, 500);
    t.same(payload, {
      message: `Unknown error`,
    });
  });

  t.teardown(async () => {
    InMemoryDB.getInstance().users().clearData();
    await mockedApp.close();
  });
});
