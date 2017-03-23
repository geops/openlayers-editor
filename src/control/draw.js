import Control from './control.js';

export default class DrawControl extends Control {

  /**
   * Tool with CAD drawing functions.
   * @param {Object} options Tool options.
   * @param {string} [type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.Collection<ol.Feature>} [features] Destination for drawing.
   * @param {ol.source.Vector} [source] Destination for drawing.
   */
  constructor(options) {
    super(Object.assign(options, {
      title: 'Draw',
      className: 'icon-draw'
    }));

    this.drawInteraction = new ol.interaction.Draw({
      type: options.type || 'Point',
      features: options.features,
      source: options.source
    });
  }

  setMap(map) {
    super.setMap(map);
    this.map.addInteraction(this.drawInteraction);
  }

  /**
   * Activate the control
   */
  activate() {
    this.drawInteraction.setActive(true);
    super.activate();
  }

  /**
   * Activate the control
   */
  deactivate() {
    this.drawInteraction.setActive(false);
    super.deactivate();
  }
}
