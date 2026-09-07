export default class ApiError extends Error {
  public constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}
