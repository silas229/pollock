import Option from "./Option.js";
import { db } from "../routes.js";
import PollResponse from "../responses/PollResponse.js";
import Vote from "./Vote.js";

/**
 * @property {String} token
 * @property {String} description
 * @property {Option[]} options
 * @property {{voices: Number, worst: Boolean, deadline: Date}} setting
 * @property {Number[]} fixed
 */
class Poll {
  /**
   * Constructs poll object
   *
   * @param {{title: String, description: String, options: Array<{id: Number, text: String}>, setting: {voices: Number, worst: Boolean, deadline: String}, fixed: [Array<Number>], token: [String], _id: [String]}} param0 object
   */
  constructor({
    title,
    description,
    options,
    setting,
    fixed,
    _id = null,
    token = null,
  }) {
    this.token = token ?? _id;
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

  get is_open() {
    return this.setting.deadline ? this.setting.deadline >= new Date() : true;
  }

  /**
   * @type {Promise<Vote[]>}
   */
  get votes() {
    return db
      .find({ poll_token: this.token })
      .then((votes) => votes.map((v) => new Vote(v)), []);
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
    return new Poll(await db.findOneAsync({ _id: token }));
  }
}
export default Poll;
