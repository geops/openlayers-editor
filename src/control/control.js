import OLControl from 'ol/control/Control';
import VectorSource from 'ol/source/Vector';
/**
 * OLE control base class.
 * @extends ol.control.Control
 * @alias ole.Control
 */
class Control extends OLControl {
  /**
   * @inheritdoc
   * @param {Object} options Control options.
   * @param {HTMLElement} options.element Element which to substitute button.
   * @param {string} options.className Name of the control's HTML class.
   * @param {string} options.title Title of the control toolbar button.
   * @param {Image} options.image Control toolbar image.
   * @param {HTMLElement} [options.dialogTarget] Specify a target if you want
   *   the dialog div used by the control to be rendered outside of the map's viewport.
   * @param {ol.source.Vector} [options.source] Vector source holding
   *   edit features. If undefined, options.features must be passed.
   * @param {ol.Collection<ol.Feature>} [options.features] Collection of
   *   edit features. If undefined, options.source must be set.
   * @param {function} [options.layerFilter] Filter editable layer.
   */
  constructor(options) {
    let button = null;
    if (!options.element) {
      button = document.createElement('button');
      button.className = `ole-control ${options.className}`;
    }

    super({
      element: options.element || button,
    });

    /**
     * Specify a target if you want the dialog div used by the
     * control to be rendered outside of the map's viewport.
     * @type {HTMLElement}
     * @private
     */
    this.dialogTarget = options.dialogTarget;

    /**
     * Control properties.
     * @type {object}
     * @private
     */
    this.properties = { ...options };

    /**
     * Html class name of the control button.
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

    if (button) {
      const img = document.createElement('img');
      img.src = options.image;

      button.appendChild(img);
      button.title = this.title;

      button.addEventListener('click', this.onClick.bind(this));
    }

    /**
     * Source with edit features.
     * @type {ol.source.Vector}
     * @private
     */
    this.source =
      options.source ||
      new VectorSource({
        features: options.features,
      });

    /**
     * Filter editable layer. Used by select interactions instead of
     * the old source property.
     * @type {function}
     * @private
     */
    this.layerFilter =
      options.layerFilter ||
      (layer => !this.source || (layer && layer.getSource() === this.source));

    /**
     * ole.Editor instance.
     * @type {ole.Editor}
     * @private
     */
    this.editor = null;

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
  activate(silent) {
    this.active = true;
    this.element.className += ' active';

    if (!silent) {
      this.dispatchEvent({
        type: 'change:active',
        target: this,
        detail: { control: this },
      });
    }

    this.openDialog();
  }

  /**
   * Dectivate the control
   * @param {boolean} [silent] Do not trigger an event.
   */
  deactivate(silent) {
    this.active = false;
    this.element.classList.remove('active');

    if (!silent) {
      this.dispatchEvent({
        type: 'change:active',
        target: this,
        detail: { control: this },
      });
    }

    this.closeDialog();
  }

  /**
   * Returns the active state of the control.
   * @returns {Boolean} Active state.
   */
  getActive() {
    return this.active;
  }

  /**
   * Open the control's dialog (if defined).
   */
  openDialog() {
    this.closeDialog();
    if (this.getDialogTemplate) {
      this.dialogDiv = document.createElement('div');

      this.dialogDiv.innerHTML = `
        <div class="ole-dialog">
          ${this.getDialogTemplate()}
        </div>
      `;
      (this.dialogTarget || this.map.getTargetElement()).appendChild(this.dialogDiv);
    }
  }

  /**
   * Closes the control dialog.
   * @private
   */
  closeDialog() {
    if (this.dialogDiv) {
      (this.dialogTarget || this.map.getTargetElement()).removeChild(this.dialogDiv);
      this.dialogDiv = null;
    }
  }

  /**
   * Set properties.
   * @param {object} properties New control properties.
   * @param {boolean} [silent] If true, no propertychange event is triggered.
   */
  setProperties(properties, silent) {
    this.properties = { ...this.properties, ...properties };

    if (!silent) {
      this.dispatchEvent({
        type: 'propertychange',
        target: this,
        detail: { properties: this.properties, control: this },
      });
    }
  }

  /**
   * Return properties.
   * @returns {object} Copy of control properties.
   */
  getProperties() {
    return { ...this.properties };
  }
}

export default Control;
