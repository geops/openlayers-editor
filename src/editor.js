import Collection from 'ol/Collection';
import BaseObject from 'ol/Object';
import Toolbar from './control/toolbar';

/**
 * Core component of OLE.
 * All controls are added to this class.
 */
class Editor extends BaseObject {
  /**
   * Initialization of the editor.
   * @param {ol.Map} map The map object.
   * @param {Object} [options] Editor options.
   * @param {Boolean} [options.showToolbar] Whether to show the toolbar.
   * @param {HTMLElement} [options.target] Specify a target if you want
   *   the toolbar to be rendered outside of the map's viewport.
   */
  constructor(map, opts) {
    super();
    /**
     * @private
     * @type {ol.Map}
     */
    this.map = map;

    /**
     * @private
     * @type {ol.Collection<ole.Control>}
     */
    this.controls = new Collection();

    /**
     * @private
     * @type {ol.Collection<ole.Control>}
     */
    this.activeControls = new Collection();

    /**
     * @private
     * @type {ol.Collection<ole.Service>}
     */
    this.services = new Collection();

    /**
     * @private
     * @type {Object}
     */
    this.options = opts || {};

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
      this.toolbar = new Toolbar(this.map, this.controls, this.options.target);
    }

    this.activeStateChange = this.activeStateChange.bind(this);
  }

  /**
   * Adds a new control to the editor.
   * @param {ole.Control} control The control.
   */
  addControl(control) {
    control.setMap(this.map);
    control.setEditor(this);
    control.addEventListener('change:active', this.activeStateChange);
    this.controls.push(control);
  }

  /**
   * Remove a control from the editor
   * @param {ole.Control} control The control.
   */
  removeControl(control) {
    control.deactivate();
    this.controls.remove(control);
    control.removeEventListener('change:active', this.activeStateChange);
    control.setEditor();
    control.setMap();
  }

  /**
   * Adds a service to the editor.
   */
  addService(service) {
    service.setMap(this.map);
    service.setEditor(this);
    service.activate();
    this.services.push(service);
  }

  /**
   * Adds a collection of controls to the editor.
   * @param {ol.Collection<ole.Control>} controls Collection of controls.
   */
  addControls(controls) {
    const ctrls =
      controls instanceof Collection ? controls : new Collection(controls);

    for (let i = 0; i < ctrls.getLength(); i += 1) {
      this.addControl(ctrls.item(i));
    }
  }

  /**
   * Removes the editor from the map.
   */
  remove() {
    const controls = [...this.controls.getArray()];
    controls.forEach((control) => {
      this.removeControl(control);
    });
    if (this.toolbar) {
      this.toolbar.destroy();
    }
  }

  /**
   * Returns a list of ctive controls.
   * @returns {ol.Collection.<ole.Control>} Active controls.
   */
  getControls() {
    return this.controls;
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
    if (feature !== this.editFeature) {
      this.editFeature = feature;
    }
  }

  /**
   * Returns the feature that is currently edited.
   * @returns {ol.Feature|null} The edit feature.
   */
  getEditFeature() {
    return this.editFeature;
  }

  /**
   * Sets an instance of the feature that is being drawn.
   * Some controls need information about the feature
   * that is currently being drawn (e.g. for not snapping on them).
   * @param {ol.Feature|null} feature The drawFeature (or null if none).
   * @protected
   */
  setDrawFeature(feature) {
    if (feature !== this.drawFeature) {
      this.drawFeature = feature;
    }
  }

  /**
   * Returns the feature that is currently being drawn.
   * @returns {ol.Feature|null} The drawFeature.
   */
  getDrawFeature() {
    return this.drawFeature;
  }

  /**
   * Controls use this function for triggering activity state changes.
   * @param {ol.control.Control} control Control.
   * @private
   */
  activeStateChange(evt) {
    const ctrl = evt.detail.control;
    // Deactivate other controls that are not standalone
    if (ctrl.getActive() && ctrl.standalone) {
      for (let i = 0; i < this.controls.getLength(); i += 1) {
        const otherCtrl = this.controls.item(i);
        if (
          otherCtrl !== ctrl &&
          otherCtrl.getActive() &&
          otherCtrl.standalone
        ) {
          otherCtrl.deactivate();
          this.activeControls.remove(otherCtrl);
        }
      }
    }

    if (ctrl.getActive()) {
      this.activeControls.push(ctrl);
    } else {
      this.activeControls.remove(ctrl);
    }
  }

  get editFeature() {
    return this.get('editFeature');
  }

  set editFeature(feature) {
    this.set('editFeature', feature);
  }

  get drawFeature() {
    return this.get('drawFeature');
  }

  set drawFeature(feature) {
    this.set('drawFeature', feature);
  }
}

export default Editor;
