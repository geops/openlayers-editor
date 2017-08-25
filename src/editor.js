import Toolbar from './toolbar.js';

/**
 * Core component of ole.
 * All controls are added to this class.
 * @class
 */
export default class Editor {
  /**
   * Initialization of the editor.
   * @param {ol.Map} map The map object.
   * @param {Object} [options] Editor options.
   * @param {Boolean} [options.showToolbar] Whether to show the toolbar.
   *   Default is true.
   */
  constructor(map, opt_options) {
    /**
     * @private
     * @type {ol.Map}
     */
    this.map = map;

    /**
     * @private
     * @type {ol.Collection<ole.Control>}
     */
    this.controls = new ol.Collection();

    /**
     * @private
     * @type {ol.Collection<ole.Control>}
     */
    this.activeControls = new ol.Collection();

    /**
     * @private
     * @type {Object}
     */
    this.options = opt_options || {};

    /**
     * Feature that is currently edited.
     * @private
     * @type {ol.Feature}
     */
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
   * @param {ole.Control} control The control.
   */
  addControl(control) {
    control.setMap(this.map);
    control.setEditor(this);
    this.controls.push(control);
  }

  /**
   * Adds a collection of controls to the editor.
   * @param {ol.Collection<ole.Control>} controls Collection of controls.
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
    this.controls.forEach(c => {
      c.deactivate();
    });

    this.toolbar.destroy();
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
   * Some controls need information about the feature
   * that is currently edited (e.g. for not snapping on them).
   * @param {ol.Feature|null} feature The editfeature (or null if none)
   * @protected
   */
  setEditFeature(feature) {
    this.editFeature = feature;
  }

  /**
   * Returns the feature that is currently edited.
   * @returns {ol.Feature|null} The edit feature.
   */
  getEditFeature() {
    return this.editFeature;
  }

  /**
   * Controls use this function for triggering activity state changes.
   * @param {ol.control.Control} control Control.
   * @private
   */
  activeStateChange(ctrl) {
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

    var ctrls = this.controls.getArray().filter(c => {
      return c.getActive();
    });

    this.activeControls.clear();
    this.activeControls.extend(ctrls);
  }
}
