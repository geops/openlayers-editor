/**
 * OLE control base class.
 * @extends ol.control.Control
 * @alias ole.Control
 */
class Control extends ol.control.Control {
  /**
   * @inheritdoc
   * @param {Object} options Control options.
   * @param {string} options.className Name of the control's HTML class.
   * @param {string} options.title Title of the control toolbar button.
   * @param {Image} options.image Control toolbar image.
   * @param {ol.source.Vector} [options.source] Vector source holding
   *   edit features. If undefined, options.features must be passed.
   * @param {ol.Collection<ol.Feature>} [options.features] Collection of
   *   edit features. If undefined, options.source must be set.
   * @param {boolean} [standalone] Boolean indicating whether the Control
   *   can be  activated together with other controls, like ole.Draw.
   */
  constructor(options) {
    var button = document.createElement('button');
    button.className = 'ole-control ' + options.className;

    super({
      element: button
    });

    /**
     * Html class name of the control button
     * @type {string}
     * @private
     */
    this.className = options.className;

    /**
     * Control title.
     * @type {string}
     * @private
     */
    this.title = options.title;

    var img = document.createElement('img');
    img.src = options.image;

    button.appendChild(img);
    button.title = this.title;

    /**
     * Source with edit features.
     * @type {ol.source.Vector}
     * @private
     */
    this.source =
      options.source ||
      new ol.source.Vector({
        features: options.features
      });

    /**
     * ole.Editor instance.
     * @type {ole.Editor}
     * @private
     */
    this.editor = null;

    button.addEventListener('click', this.onClick.bind(this));

    /**
     * @type {Boolean}
     * @private
     */
    this.standalone = true;
  }

  /**
   * Returns the control's element.
   * @returns {Element} the control element.
   */
  getElement() {
    return this.element;
  }

  /**
   * Click handler for the control element.
   * @private
   */
  onClick() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  /**
   * Sets the map of the control.
   * @protected
   * @param {ol.Map} map The map object.
   */
  setMap(map) {
    this.map = map;
    super.setMap(this.map);
  }

  /**
   * Introduce the control to it's editor.
   * @param {ole.Editor} editor OLE Editor.
   * @protected
   */
  setEditor(editor) {
    this.editor = editor;
  }

  /**
   * Activate the control
   */
  activate() {
    this.active = true;
    this.element.className += ' active';
    this.editor.activeStateChange(this);
  }

  /**
   * Dectivate the control
   */
  deactivate() {
    this.active = false;
    this.element.classList.remove('active');
    this.editor.activeStateChange(this);
  }

  /**
   * Returns the active state of the control.
   * @returns {Boolean} Active state.
   */
  getActive() {
    return this.active;
  }
}

export default Control;
