export default class Option {
  /**
   * Constructs option object
   *
   * @param {{id: Number, text: String}} param0
   *
   * @returns {{id: Number, text: String}}
   */
  constructor({ id, text }) {
    this.id = id;
    this.text = text;
  }
}
