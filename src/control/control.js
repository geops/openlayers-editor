export default class Control extends ol.control.Control {

  constructor(options) {
    var button = document.createElement('button');
    button.className = 'ole3-control ' + options.className;
    // button.addEventListener('click', this._toggleActiveState.bind(this));

    var element = document.createElement('div');
    element.appendChild(button);

    super({
      element: element
    });

    this.title = options.title;
    this.element = element;
    this.map = options.map;
    this.source = options.source || new ol.source.Vector({
      features: options.features
    });
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
