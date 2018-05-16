/**
 * OLE service base class.
 * @alias ole.Service
 */
export default class Service {
  constructor() {
    this.active = false;
  }

  /**
   * Activate the service.
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivate the service.
   */
  deactivate() {
    this.active = false;
  }
}
