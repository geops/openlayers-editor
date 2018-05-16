import Storage from './storage';

/**
 * OLE LocalStorage.
 * Saves control properties to the browser's localStorage.
 * @alias ole.service.LocalStorage
 */
export default class LocalStorage extends Storage {
  /**
   * @inheritdoc
   */
  storeProperties(controlName, properties) {
    const props = super.storeProperties(controlName, properties);
    window.localStorage.setItem(controlName, JSON.stringify(props));
  }

  /**
   * @inheritdoc
   */
  restoreProperties() {
    for (let i = 0; i < this.controls.length; i += 1) {
      const controlName = this.controls[i].getProperties().title;
      const props = window.localStorage.getItem(controlName);

      if (props) {
        this.controls[i].setProperties(JSON.parse(props), true);
      }
    }
  }

  /**
   * @inheritdoc
   */
  storeActiveControls() {
    const activeControlNames = super.storeActiveControls();
    window.localStorage.setItem('active', JSON.stringify(activeControlNames));
  }

  /**
   * @inheritdoc
   */
  restoreActiveControls() {
    let activeControlNames = window.localStorage.getItem('active');
    activeControlNames = activeControlNames
      ? JSON.parse(activeControlNames)
      : [];

    if (!activeControlNames.length) {
      return;
    }

    for (let i = 0; i < this.controls.length; i += 1) {
      const controlName = this.controls[i].getProperties().title;

      if (activeControlNames.indexOf(controlName) > -1) {
        this.controls[i].activate();
      } else {
        this.controls[i].deactivate();
      }
    }
  }
}
