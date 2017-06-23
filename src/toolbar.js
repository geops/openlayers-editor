import '../style/ole.css';

/**
 * The editor's toolbar.
 * @class
 * @alias ole.Toolbar
 */
export default class Toolbar extends ol.control.Control {
  /**
   * Constructor.
   * @param {ol.Map} map The map object.
   * @param {ol.Collection.<ol.control.Control>} controls Controls
   *   to display in the toolbar.
   */
  constructor(map, controls) {

    var element = document.createElement('div');
    element.setAttribute('id', 'ole-toolbar');

    super({
      element: element
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

    this.map.getTargetElement().appendChild(this.element);
    this.load();
    this.controls.on('change:length', this.load, this);
  }

  /**
   * Load the toolbar.
   * @private
   */
  load() {
    for (var i = 0; i < this.controls.getLength(); i++) {
      var btn = this.controls.item(i).getElement();
      this.element.appendChild(btn);
    }
  }

  /**
   * Destroy the toolbar.
   * @private
   */
  destroy() {
    for (var i = 0; i < this.controls.getLength(); i++) {
      var btn = this.controls.item(i).getElement();
      this.element.removeChild(btn);
    }
  }
}
