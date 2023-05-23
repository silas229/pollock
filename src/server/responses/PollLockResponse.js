import PollResponse from "./PollResponse.js";
import Poll from "../models/Poll.js";

export default class PollLockResponse extends PollResponse {
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
    body.token = undefined;
    body.admin_token = undefined;

    const security = {
      owner: await (await body.getOwner()).response,
      users: await body.getUsers(),
      visibility: body.visibility,
    };
    body.owner = undefined;
    body.users = undefined;
    body.visibility = undefined;

    return {
      poll: {
        body: body,
        security: security,
        share: {
          link: PollLockResponse.getLink(token),
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

  static _base = "/poll/lock";
}
