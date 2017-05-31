import Toolbar from './toolbar.js';

export default class Editor {
  /**
   * Initialization of the editor.
   * @param {ol.Map} The map object.
   * @param {Object} opt_options Optional options.
   * @param {Boolean} opt_options.showToolbar Should there be a toolbar?
   *   Default is true.
   */
  constructor(map, opt_options) {
    this.map = map;
    this.controls = new ol.Collection();
    this.options = opt_options || {};

    if (typeof this.options.showToolbar === 'undefined') {
      this.options.showToolbar = true;
    }

    if (this.options.showToolbar) {
      this.toolbar = new Toolbar(this.map, this.controls);
    }
  }

  /**
   * Adds a new control to the editor.
   * @param {ol.control.Control} control The control.
   */
  addControl(control) {
    control.setMap(this.map);
    control.on('change:active', this._activeStateChange.bind(this));
    this.controls.push(control);
  }

  /**
   * Adds a collection of controls to the editor.
   * @param {ol.Collection.<ol.control.Control>} controls
   *   Collection of controls.
   */
  addControls(controls) {
    controls = controls instanceof ol.Collection
      ? controls
      : new ol.Collection(controls);

    for (var i = 0; i < controls.getLength(); i++) {
      this.addControl(controls.item(i));
    }
  }

  /**
   * Removes the editor from the map.
   */
  remove() {
    this.controls.forEach((c) => {
      c.deactivate();
    });

    this.toolbar._destroy();
  }

  /**
   * Listener for activity state changes of controls.
   * @param {ol.control.Control} control Control.
   */
  _activeStateChange(evt) {
    var ctrl = evt.target;

    // deactivate other controls that are not standalone
    if (ctrl.getActive() && ctrl.standalone) {
      for (var i = 0; i < this.controls.getLength(); i++) {
        if (
          this.controls.item(i) !== ctrl && this.controls.item(i).standalone
        ) {
          this.controls.item(i).deactivate();
        }
      }
    }
  }
}
