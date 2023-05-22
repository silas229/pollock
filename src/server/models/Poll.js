import Option from "./Option.js";
import PollResponse from "../responses/PollResponse.js";
import Vote from "./Vote.js";
import { uid } from "@seald-io/nedb/lib/customUtils.js";
import Model from "./Model.js";
import Nedb from "@seald-io/nedb";

/**
 * @property {String} token
 * @property {String} admin_token
 * @property {String} description
 * @property {Option[]} options
 * @property {{voices: Number, worst: Boolean, deadline: Date}} setting
 * @property {Number[]} fixed
 */
class Poll extends Model {
  static db = new Nedb({ filename: "./data/polls.db", autoload: true });

  /**
   * Constructs poll object
   *
   * @param {{title: String, description: String, options: Array<{id: Number, text: String}>, setting: {voices: Number, worst: Boolean, deadline: String}, fixed: [Array<Number>], token: [String], admin_token: [String], _id: [String]}} param0 object
   */
  constructor({
    title,
    description,
    options,
    setting,
    fixed,
    _id = null,
    token = null,
    admin_token = null,
  }) {
    super();
    this.token = token ?? _id;
    this.admin_token = admin_token ?? uid(16);
    this.title = title;
    this.description = description;

    this.options = [];
    options.forEach((o) => this.options.push(new Option(o)));

    this.setting = { voices: null, worst: null, deadline: null };
    this.setting.voices = setting?.voices ?? null;
    this.setting.worst = setting?.worst ?? null;
    this.setting.deadline = setting?.deadline
      ? new Date(setting.deadline)
      : null;

    // TODO: What means fixed?
    this.fixed = fixed ?? [];
  }

  static get rules() {
    return {
      title: "required|string",
      description: "string",
      options: "required|array",
      "options.*.id": "required|integer|min:0",
      "options.*.text": "required|string",
      setting: {
        voices: "integer|min:0|poll_number_of_voices",
        worst: "boolean",
        deadline: "date",
      },
      fixed: "array",
      "fixed.*": "integer|min:0",
    };
  }

  static get lock_rules() {
    return Object.assign({}, Poll.rules); // TODO lock rules
  }

  /**
   * @returns {Promise<Poll>}
   */
  async save() {
    return this._save(Poll.db);
  }

  /**
   * @returns {Promise<number>}
   */
  async delete() {
    return Poll.db.removeAsync(
      { admin_token: this.admin_token },
      { multi: false },
    );
  }

  get is_open() {
    return this.setting.deadline ? this.setting.deadline >= new Date() : true;
  }

  /**
   * @type {Promise<Vote[]>}
   */
  get votes() {
    return Vote.db.find({ poll_token: this.token }).then(
      (votes) =>
        votes.map((v) => {
          const vote = new Vote(v);
          vote.owner.password = undefined;
          return vote;
        }),
      [],
    );
  }

  /**
   * @type {PollResponse}
   */
  get response() {
    return PollResponse.generate(this);
  }

  /**
   * @param {String} token Poll token
   * @returns {Poll}
   */
  static async getByToken(token) {
    return new Poll(await Poll.db.findOneAsync({ _id: token }));
  }

  /**
   * @param {String} token Poll token
   * @returns {Poll}
   */
  static async getByAdminToken(token) {
    return new Poll(await Poll.db.findOneAsync({ admin_token: token }));
  }
}
export default Poll;
