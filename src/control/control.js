/**
 * Base control of ole.
 */
export default class Control extends ol.control.Control {

  /**
   * Constructor.
   * @param {Object} options Control options.
   */
  constructor(options) {
    var button = document.createElement('button');
    button.className = 'ole-control ' + options.className;

    super({
       element: button
    });

    this.className = options.className;
    this.title = options.title;


    var img = document.createElement('img');
    img.src = options.image;

    button.appendChild(img);
    button.title = this.title;

    this.source = options.source || new ol.source.Vector({
      features: options.features
    });

    button.addEventListener('click', this._onClick.bind(this));

    // standalone means that this control can only be active
    // together with controls that are not standalone.
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
   */
  _onClick() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  /**
   * Sets the map of the control.
   */
  setMap(map) {
    this.map = map;
    super.setMap(this.map);
  }

  /**
   * Activate the control
   */
  activate() {
    this.active = true;
    this.element.className += ' active';
    this._fireActiveStateChange();
  }

  /**
   * Dectivate the control
   */
  deactivate() {
    this.active = false;
    this.element.classList.remove('active');
    this._fireActiveStateChange();
  }

  /**
   * Returns the active state of the control.
   * @returns {Boolean} Active state.
   */
  getActive() {
    return this.active;
  }

  /**
   * Fires the 'change:active' event.
   */
  _fireActiveStateChange() {
    var evt = new ol.events.Event('change:active');
    this.dispatchEvent(evt);
  }
}
