import Response from "./Response.js";
import PollResponse from "./PollResponse.js";
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

  /**
   *
   * @param {Vote} body Vote body
   * @returns {Promise<{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Array<Number[]>, worst: [Number[]]}>}>}
   */
  static async generate(body) {
    const poll = await body.poll;

    return {
      poll: {
        body: poll,
        share: {
          id: body.poll_token,
          link: PollResponse.getLink(body.poll_token),
        },
      },
      vote: body, // TODO: Remove token, poll_token, time
      time: body.time,
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
