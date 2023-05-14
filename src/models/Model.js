import Nedb from "@seald-io/nedb";
import NotImplementedError from "../NotImplemetedError.js";
import Response from "../responses/Response.js";

export default class Model {
  constructor() {}

  /**
   * @param {Nedb<Record<string, any>>} db
   * @returns {Promise<Model>}
   */
  async _save(db) {
    if (this.token) {
      return db.updateAsync({ _id: this.token }, this), { multi: false };
    } else {
      return db.insertAsync(this);
    }
  }

  async save() {
    throw new NotImplementedError("save");
  }

  async delete() {
    throw new NotImplementedError("delete");
  }

  /**
   * @type {Response}
   */
  get response() {
    throw new NotImplementedError("response");
  }

  static get rules() {
    throw new NotImplementedError("rules");
  }

  /**
   * @param {String} token Token
   * @returns {?Model}
   */
  static async getByToken(token) {
    throw new NotImplementedError("getByToken");
  }
}
