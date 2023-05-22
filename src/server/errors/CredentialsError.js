export default class CredentialsError extends Error {
  /**
   * @param {String} message Message
   */
  constructor(message) {
    super(message);
    this.name = "CredentialsError";
  }
}
