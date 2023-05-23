import Response from "./Response.js";
import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

export default class VoteResponse extends Response {
  /**
   * Constructs response object for showing a vote
   *
   * @param {Vote} body Vote body
   *
   * @returns {{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Array<Number[]>, worst: [Number[]]}>}} votes
   */
  constructor(vote) {}

  /**
   *
   * @param {Vote} body Vote body
   * @returns {Promise<{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Array<Number[]>, worst: [Number[]]}>}>}
   */
  static async generate(body) {
    const poll = await body.poll;

    const time = body.time;

    body.token = undefined;
    body.poll_token = undefined;
    body.time = undefined;

    body.owner = await body.owner.response;

    return {
      poll: (await poll.response).poll,
      vote: body,
      time: time,
    };
  }

  static _base = "/vote/lack";

  static messages = Object.assign(
    {
      404: {
        code: 404,
        message: "Vote not found.",
      },
    },
    Response.messages,
  );
}
