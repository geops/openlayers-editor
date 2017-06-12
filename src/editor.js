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

    // editor map
    this.map = map;

    // collection of editor controls
    this.controls = new ol.Collection();

    // collection of active controls
    this.activeControls = new ol.Collection();

    // control options
    this.options = opt_options || {};

    // feature that is currently edited
    this.editFeature = null;

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
    control.setEditor(this);
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
   * Returns a list of active controls.
   * @returns {ol.Collection.<ole.Control>} Active controls.
   */
  getActiveControls() {
    return this.activeControls;
  }

  /**
   * Sets an instance of the feature that is edited.
   * Some control need information about the feature
   * that is currently edited (e.g. for not snapping on them)
   * @param {ol.Feature|null} feature The editfeature (or null if none)
   */
  setEditFeature(feature) {
    this.editFeature = feature;
  }

  /**
   * Returns the feature that is currently edited.
   * @returns {ol.Feature|null} The edit feature.
   */
  getEditFeature(feature) {
    return this.editFeature;
  }

  /**
   * Listener for activity state changes of controls.
   * @param {ol.control.Control} control Control.
   */
  _activeStateChange(ctrl) {
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

    var ctrls = this.controls.getArray().filter( c => {
      return c.getActive();
    });

    this.activeControls.clear();
    this.activeControls.extend(ctrls);
  }
}
