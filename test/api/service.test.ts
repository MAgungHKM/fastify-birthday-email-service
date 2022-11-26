import { test } from "tap";

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

  const api = new MockedApiService();

  await api
    .sendNotification("Test", "test", "Bearer testtt")
    .then((res: any) => {
      t.equal(res?.response?.status, 200);
    })
    .catch((err: any) => {
      t.equal(err?.response?.status, 500);
    });
});
