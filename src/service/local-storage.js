import Storage from './storage';

/**
 * OLE LocalStorage.
 * Saves control properties to the browser's localStorage.
 * @alias ole.service.LocalStorage
 */
export default class LocalStorage extends Storage {
  /**
   * @inherticdoc
   */
  storeProperties(controlName, properties) {
    const props = super.storeProperties(controlName, properties);
    window.localStorage.setItem(controlName, JSON.stringify(props));
  }

  /**
   * @inherticdoc
   */
  restoreProperties() {
    for (let i = 0; i < this.controls.length; i += 1) {
      const controlName = this.controls[i].constructor.name;
      const props = window.localStorage.getItem(controlName);

      if (props) {
        this.controls[i].setProperties(JSON.parse(props), true);
      }
    }
  }
}
