import User from "./User.js";
import Choice from "./Choice.js";
import Poll from "./Poll.js";
import VoteResponse from "../responses/VoteResponse.js";
import Model from "./Model.js";
import Nedb from "@seald-io/nedb";

export default class Vote extends Model {
  static db = new Nedb({ filename: "./data/votes.db", autoload: true });
  /**
   * Constructs vote object
   * @param {{poll_token: String, owner: {name: String}, choice: Array<{id: Number, worst: [boolean]}>, token: [String], _id: [String]}} param0 object
   *
   * @return {{poll_token: String, owner: {name: String}, choice: Array<Choice>}}
   */
  constructor({ poll_token, owner, choice, token = null, _id = null }) {
    super();
    this.token = token ?? _id;
    this.poll_token = poll_token;
    this.owner = new User(owner);

    this.choice = [];
    choice.forEach((c) => this.choice.push(new Choice(c)));

    this.time = new Date();
  }

  /**
   * @returns Promise<Vote>
   */
  async save() {
    return this._save(Vote.db);
  }

  /**
   * @returns {Promise<number>}
   */
  async delete() {
    return Vote.db.removeAsync({ _id: this.token }, { multi: false });
  }

  static get rules() {
    return {
      "owner.name": "required|string",
      choice: "required|array",
      "choice.*.id": "required|integer|poll_valid_option",
      "choice.*.worst": "boolean|poll_worst_allowed",
    };
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
    return new Vote(await Vote.db.findOneAsync({ _id: token }));
  }
}
