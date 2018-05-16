/**
 * OLE service.
 * @alias ole.service.LocalStorage
 */
export default class LocalStorage {
  /**
   * Saves control properties in the LocalStorage and restores them.
   * @param {object} Service options
   * @param {array.<ol.control.Control>} controls List of controls.
   */
  constructor(options) {
    /**
     * List of service controls
     * @type {array.<ol.control.Control>}
     * @private
     */
    this.controls = options.controls;

    options.controls.forEach((control) => {
      control.addEventListener('propertychange', (evt) => {
        this.updateLocalStorage(evt.detail);
      });
    });
  }

  /**
   * Store control properties in localStorage with setItem() method
   * @param {Object} properties
   */
  updateLocalStorage(properties) {
    Object.keys(properties).forEach((key) => {
      this.storage.setItem(key, properties[key]);
    });
  }
}
