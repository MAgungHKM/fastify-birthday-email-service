export type GenericError = {
  message: string;
};

export const callPromise = async (
  promise: Promise<any>
): Promise<[any, any]> => {
  try {
    const data = await promise;
    return [data, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
