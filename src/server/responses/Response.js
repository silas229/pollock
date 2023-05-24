import { baseUrl } from "../../../app.config.js";

export default class Response {
  static generate() {
    return {};
  }

  static getLink(token) {
    return new URL(baseUrl + this.base + "/" + token);
  }

  static _base = "";

  static get base() {
    return this._base;
  }

  static messages = {
    200: {
      code: "200",
      message: "i.O.",
    },
    401: {
      code: 401,
      message: "Unauthorized",
    },
    403: {
      code: 403,
      message: "Forbidden",
    },
    405: {
      code: 405,
      message: "Invalid input",
    },
    500: {
      code: 500,
      message: "Something went wrong on the server side",
    },
  };
}
