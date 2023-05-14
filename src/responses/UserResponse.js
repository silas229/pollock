import Response from "./Response.js";

export default class UserResponse extends Response {
  static messages = Object.assign(
    {
      400: {
        code: 400,
        message: "Invalid username supplied.",
      },
      404: {
        code: 404,
        message: "User not found.",
      },
    },
    Response.messages,
  );
}
