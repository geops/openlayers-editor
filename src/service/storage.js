import Service from './service';

/**
 * OLE storage service.
 * Base class for storage services,
 * such as LocalStorage, PermalinkStorage, CookieStorage.
 * @alias ole.serviceStorage.
 */
export default class Storage extends Service {
  /**
   * Saves control properties.
   * @param {object} Service options
   * @param {array.<ol.control.Control>} controls List of controls.
   */
  constructor(options) {
    super(options);

    /**
     * List of service controls
     * @type {array.<ol.control.Control>}
     * @private
     */
    this.controls = options.controls;

    options.controls.forEach((control) => {
      control.addEventListener('propertychange', (evt) => {
        this.storeProperties(
          evt.detail.control.constructor.name,
          evt.detail.properties,
        );
      });
    });
  }

  /**
   * Store control properties.
   * @param {string} controlName Name of the control.
   * @param {object} properties Control properties.
   */
  storeProperties() {
    // to be implemented by child class
  }

  /**
   * Restore the control properties.
   */
  restoreProperties() {
    // to be implemented by child class
  }
}
