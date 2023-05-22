export default class NotImplementedError extends Error {
  /**
   * @param {String} method Method name
   */
  constructor(method) {
    super(`Method or property ${method} is not implemented`);
    this.name = "NotImplementedError";
  }
}
