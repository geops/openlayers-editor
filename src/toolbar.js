import Control from 'ol/control/Control';
import '../style/ole.css';

/**
 * The editor's toolbar.
 * @class
 * @alias ole.Toolbar
 */
class Toolbar extends Control {
  /**
   * Constructor.
   * @param {ol.Map} map The map object.
   * @param {ol.Collection.<ol.control.Control>} controls Controls
   * @param {HTMLElement} [options.target] Specify a target if you want
   *   the control to be rendered outside of the map's viewport.
   */
  constructor(map, controls, target) {
    const element = document.createElement('div');
    element.setAttribute('id', 'ole-toolbar');

    super({
      element: target || element,
    });

    /**
     * @private
     * @type {ol.Collection.<ol.control.Control>}
     */
    this.controls = controls;

    /**
     * @private
     * @type {ol.Map}
     */
    this.map = map;

    if (!target) {
      this.map.getTargetElement().appendChild(this.element);
    }

    this.load();
    this.controls.on('change:length', this.load.bind(this));
  }

  /**
   * Load the toolbar.
   * @private
   */
  load() {
    for (let i = 0; i < this.controls.getLength(); i += 1) {
      const btn = this.controls.item(i).getElement();
      this.element.appendChild(btn);
    }
  }

  /**
   * Destroy the toolbar.
   * @private
   */
  destroy() {
    for (let i = 0; i < this.controls.getLength(); i += 1) {
      const btn = this.controls.item(i).getElement();
      this.element.removeChild(btn);
    }
  }
}

export default Toolbar;
