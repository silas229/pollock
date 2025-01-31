import Nedb from "@seald-io/nedb";
import bcrypt from "bcrypt";

import CredentialsError from "../errors/CredentialsError.js";
import Model from "./Model.js";
import Poll from "./Poll.js";
import UserResponse from "../responses/UserResponse.js";

/**
 * @property {String} name
 * @property {boolean} lock
 * @property {String|null} password
 */
class User extends Model {
  static _ROUNDS = 10;
  static db = new Nedb({ filename: "./data/users.db", autoload: true });
  static apiKeyDB = new Nedb({
    filename: "./data/apiKeys.db",
    autoload: true,
  });

  /**
   * Constructs user object
   *
   * @param {{name: String, lock: [boolean], password: [String], token: [String], _id: [String]}} param0 object
   */
  constructor({
    name,
    lock = false,
    password = null,
    token = null,
    _id = null,
  }) {
    super();
    this.token = token ?? _id;
    this.name = name;
    this.lock = lock;
    this.password = password;
  }

  /**
   * @returns {Promise<User>}
   */
  async save() {
    return this._save(User.db);
  }

  async createApiToken() {
    return await User.apiKeyDB.insertAsync({
      user: this.name,
      time: new Date(),
    });
  }

  /**
   * @returns {Promise<number>}
   */
  async delete() {
    User.apiKeyDB.removeAsync({ user: this.name }, { multi: true });
    return User.db.removeAsync({ _id: this.token }, { multi: false });
  }

  /**
   * @type {Promise<Poll[]>}
   */
  get polls() {
    return Poll.db.find({ owner: this.name }).then(
      (polls) =>
        polls.map((p) => {
          const poll = new Poll(p);
          return poll;
        }),
      [],
    );
  }

  static get rules() {
    return {
      name: "required|string",
      password: "required|string",
    };
  }

  /** @type {Promise<User>} */
  get response() {
    return UserResponse.generate(this);
  }

  /**
   *
   * @param {Poll} poll
   * @param {User} user Current user
   *
   * @returns boolean
   */
  canAccessPoll(poll) {
    if (poll.visibility == "lock") {
      if (poll.users.length > 0) {
        if (this.name != poll.owner && !poll.users.includes(this.name)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   *
   * @param {Poll} poll
   * @param {User} user Current user
   *
   * @returns boolean
   */
  canChangePoll(poll) {
    return poll.owner === this.name || poll.users.includes(this.name);
  }

  /**
   * @param {String} token User token
   * @returns {User}
   */
  static async getByToken(token) {
    return new User(await User.db.findOneAsync({ _id: token }));
  }

  /**
   * @param {String} name Name
   * @param {[boolean]} onlyLock Only get registered users
   * @returns {User}
   */
  static async getByName(name, onlyLock = false) {
    const result = await User.db.findOneAsync({ name: name });
    return new User(result ?? (onlyLock ? null : { name }));
  }

  static async exists(name) {
    return (await User.db.findOneAsync({ name: name })) != null;
  }

  /**
   * @param {String} name Username
   * @param {String} password Password
   * @returns {User}
   */
  static async getByCredentials(name, password) {
    const user = new User(await User.db.findOneAsync({ name: name }));

    if (!user.passwordVerify(password)) {
      throw new CredentialsError("The password does not match");
    }

    return user;
  }

  /**
   * @param {String} key API-Key
   * @returns {User}
   */
  static async getByApiKey(key) {
    return new User.getByName(
      await User.apiKeyDB.findOneAsync({ _id: key, user: this.name }).name,
    );
  }

  /**
   * @param {String} password Plaintext password
   * @returns {String} Hashed password
   */
  static async passwordHash(password) {
    return await bcrypt.hash(password, User._ROUNDS);
  }

  /**
   * @param {String} password Plaintext password
   * @returns {boolean} If password matches hash
   */
  async passwordVerify(password) {
    return await bcrypt.compare(password, this.password);
  }
}
export default User;
