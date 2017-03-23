export default class Control extends ol.control.Control {

  constructor(options) {
    var button = document.createElement('button');
    button.className = 'ole3-control ' + options.className;

    var element = document.createElement('div');
    element.appendChild(button);

    super({
      element: element
    });

    this.title = options.title;
    this.element = element;
    this.source = options.source || new ol.source.Vector({
      features: options.features
    });
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
  }


  /**
   * Dectivate the control
   */
  deactivate() {
    this.element.classList.remove('active');
  }
}
