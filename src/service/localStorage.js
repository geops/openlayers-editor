/**
 * OLE service.
 * @alias ole.service.LocalStorage
 */
class LocalStorage {
  /**
   * Stores cached variables
   * @param {Object} options
   */
  constructor(options) {
    /**
     * @type {Array} Array of controls, for which properties must be watched
     */
    this.controls = options.controls;
    /**
     * @type {localStorage} store data across browser sessions.
     */
    this.storage = localStorage;

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

export default LocalStorage;
