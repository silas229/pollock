import Poll from "../models/Poll.js";
import User from "../models/User.js";
import Response from "./Response.js";

/**
 * @type {{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Number[], worst: [Number[]]}>}}
 */
export default class PollResponse extends Response {
  /**
   * Constructs response object for showing a poll
   *
   * @returns {{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Number[], worst: [Number[]]}>}}
   */
  constructor(poll, participants, votes) {
    super();
    this.poll = poll;
    this.participants = participants;
    this.votes = votes;
  }
  /**
   * Constructs response object for showing a poll
   *
   * @param {Poll} body Poll body
   *
   * @returns {{poll: {body: Poll, share: {id: Number, link: URL}}, participants: User[], options: Array<{voted: Number[], worst: [Number[]]}>}}
   */
  static async generate(body) {
    const votes = await body.votes;
    const token = body.token;

    // Remove properties that are not in spec
    delete body.token;
    delete body.admin_token;

    delete body.owner;
    delete body.users;
    delete body.visibility;

    return {
      poll: {
        body: body,
        share: {
          link: PollResponse.getLink(token),
          value: token,
        },
      },

      participants: votes.map((v) => v.owner),

      options: body.options.map((option) => {
        return {
          voted: votes
            .filter((vote) => vote.choice.find((c) => c.id === option.id))
            .map((_vote, i) => {
              return i;
            }),
          worst: body.setting.worst
            ? votes
                .filter((vote) =>
                  vote.choice.find((c) => c.id === option.id && c.worst),
                )
                .map((_vote, i) => {
                  return i;
                })
            : undefined,
        };
      }),
    };
  }

  static _base = "/poll/lack";

  static messages = Object.assign(
    {
      400: {
        code: 400,
        message: "Invalid poll admin token.",
      },
      404: {
        code: 404,
        message: "Poll not found.",
      },
      410: {
        code: 410,
        message: "Poll is gone.",
      },
    },
    Response.messages,
  );
}
