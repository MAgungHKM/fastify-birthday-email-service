import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

const ONE_MINUTE_TIMEOUT = 60 * 1000;

export class ApiService {
  private instance: AxiosInstance;

  constructor(baseURL: string | undefined) {
    this.instance = axios.create({
      baseURL,
      timeout: ONE_MINUTE_TIMEOUT,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    axiosRetry(this.instance, {
      retries: 3,
      shouldResetTimeout: true,
      retryDelay: (retryCount) => {
        console.log(
          `Retry [${retryCount}/3], will retry the failed request after ${
            15 * retryCount
          } seconds.`
        );
        return retryCount * 15000;
      },
      onRetry: (_, error) => {
        console.log(`Retry caused by: ${error.message}`);
      },
      retryCondition: (error) => {
        return (
          error.code === "ECONNABORTED" ||
          (error.response as AxiosResponse).status.toString()[0] == "5" ||
          (error.response as AxiosResponse).status.toString()[0] == "4"
        );
      },
    });
  }

  sendNotification = (title: string, message: string, email: string) => {
    return this.instance.post("/send-email", {
      email,
      title,
      message,
    });
  };
}
