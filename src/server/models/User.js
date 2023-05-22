import Nedb from "@seald-io/nedb";
import bcrypt from "bcrypt";

import CredentialsError from "../errors/CredentialsError.js";

/**
 * @property {String} name
 * @property {boolean} lock
 * @property {String|null} password
 */
class User {
  static _ROUNDS = 10;
  static db = new Nedb({ filename: "./data/users.db", autoload: true });
  static apiKeyDB = new Nedb({
    filename: "./data/apiKeys.db",
    autoload: true,
  });

  /**
   * Constructs user object
   *
   * @param {{name: String, lock: [boolean], password: [String]}} param0 object
   */
  constructor({ name, lock = false, password = null }) {
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
      name: this.name,
      time: new Date(),
    })._id;
  }

  /**
   * @returns {Promise<number>}
   */
  async delete() {
    return User.db.removeAsync({ _id: this._id }, { multi: false });
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
   * @returns {User}
   */
  static async getByName(name) {
    return new User(await User.db.findOneAsync({ name: name }));
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
      await User.apiKeyDB.findOneAsync({ _id: key }).name,
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
