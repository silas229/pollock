export default class Choice {
  /**
   * Constructs choice object
   *
   * @param {{id: Number, worst: Boolean}} param0 object
   *
   * @returns {{id: Number, worst: Boolean}}
   */
  constructor({ id, worst = false }) {
    this.id = id;
    this.worst = worst;
  }
}
