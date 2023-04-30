import { db } from "../routes.js";
import User from "./User.js";
import Choice from "./Choice.js";
import Poll from "./Poll.js";
import VoteResponse from "../responses/VoteResponse.js";

export default class Vote {
  /**
   * Constructs vote object
   * @param {{poll_token: String, owner: {name: String}, choice: Array<{id: Number, worst: [boolean]}>, token: [String], _id: [String]}} param0 object
   *
   * @return {{poll_token: String, owner: {name: String}, choice: Array<Choice>}}
   */
  constructor({ poll_token, owner, choice, token = null, _id = null }) {
    this.token = token ?? _id;
    this.poll_token = poll_token;
    this.owner = new User(owner);

    this.choice = [];
    choice.forEach((c) => this.choice.push(new Choice(c)));

    this.time = new Date();
  }

  /** @type{Promise<Poll>} */
  get poll() {
    return Poll.getByToken(this.poll_token);
  }

  /** @type {Promise<VoteResponse>} */
  get response() {
    return VoteResponse.generate(this);
  }

  /**
   * @param {String} token Vote token
   * @returns {Vote}
   */
  static async getByToken(token) {
    return new Vote(await db.findOneAsync({ _id: token }));
  }
}
