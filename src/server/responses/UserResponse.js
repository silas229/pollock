import User from "../models/User.js";
import Response from "./Response.js";

export default class UserResponse extends Response {
  /**
   * Generates User response
   * @param {User} body User object
   * @returns {{name: String, lock: boolean}}
   */
  static async generate(body) {
    return {
      name: body.name,
      lock: body.lock,
    };
  }

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
