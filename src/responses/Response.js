export default class Response {
  static generate() {
    return {};
  }

  static getLink(token) {
    return new URL(this.baseUrl + this.base + "/" + token);
  }

  static baseUrl = "http://localhost:49725";

  static _base = "";

  static get base() {
    return this._base;
  }

  static messages = {
    200: {
      code: "200",
      message: "i.O.",
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
