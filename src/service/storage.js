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
   * @param {object} [options] Service options
   * @param {array.<ol.control.Control>} [controls] List of controls.
   *  If undefined, all controls of the editor are used.
   */
  constructor(optOptions) {
    const options = optOptions || {};
    super(options);

    /**
     * List of service controls
     * @type {array.<ol.control.Control>}
     * @private
     */
    this.controls = options.controls;

    /**
     * List of properties keys to ignore.
     * @type {array.<string>}
     */
    this.ignoreKeys = ['title', 'image', 'className'];
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    this.controls = this.controls || this.editor.getControls().getArray();
    this.restoreProperties();

    this.controls.forEach((control) => {
      control.addEventListener('propertychange', (evt) => {
        this.storeProperties(
          evt.detail.control.constructor.name,
          evt.detail.properties,
        );
      });
    });
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    super.deactivate();

    this.controls.forEach((control) => {
      control.removeEventListener('propertychange');
    });
  }

  /**
   * Store control properties.
   * @param {string} controlName Name of the control.
   * @param {object} properties Control properties.
   */
  storeProperties(controlName, properties) {
    // filter only non-object properties.
    const storageProps = {};
    const propKeys = Object.keys(properties);

    for (let i = 0; i < propKeys.length; i += 1) {
      const key = propKeys[i];
      if (this.ignoreKeys.indexOf(key) === -1 &&
          !(properties[key] instanceof Object)) {
        storageProps[key] = properties[key];
      }
    }

    return storageProps;
  }

  /**
   * Restore the control properties.
   */
  restoreProperties() {
    // to be implemented by child class
  }
}
