import { test } from "tap";
import { AxiosResponse, AxiosError } from "axios";
import dotenv from "dotenv";
dotenv.config();

const mockedAxiosRetry = (_instance: any, _config: any) => {
  const { retryCondition, retryDelay, onRetry } = _config;

  retryCondition({ status: 200, response: { status: 200 } });
  retryDelay(1);
  onRetry(1, { message: "test" });

  return _instance;
};

test("check apiSerivce", async (t) => {
  const { ApiService: MockedApiService } = t.mock("../../src/api", {
    "axios-retry": mockedAxiosRetry,
  });

  const api = new MockedApiService(process.env.EMAIL_SERVICE_URL);

  await api
    .sendNotification("Test", "test", "test@mail.test")
    .then((res: AxiosResponse) => {
      t.equal(res.status, 200);
      t.equal(res.data.status, "sent");
    })
    .catch((err: AxiosError) => {
      t.equal(err?.response?.status.toString()[0], "5");
    });
});
