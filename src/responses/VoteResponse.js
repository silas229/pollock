import Response from "./Response.js";
import Vote from "../models/Vote.js";

export default class VoteResponse extends Response {
  /**
   * Constructs response object for showing a vote
   *
   * @param {Vote} body Vote body
   *
   * @returns {{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Array<Number[]>, worst: [Number[]]}>}} votes
   */
  constructor(vote) {}

  static _base = "/vote/lack";

  static error = Object.assign(
    {
      404: {
        code: 404,
        message: "Vote not found.",
      },
    },
    Response.error,
  );
}
