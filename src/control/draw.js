import Control from './control.js';
import drawPointPng from '../../img/draw_point.png';
import drawPolygonPng from '../../img/draw_polygon.png';
import drawLinePng from '../../img/draw_line.png';

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
    var image;

    switch (options.type) {
      case 'Polygon':
        image = drawPolygonPng;
        break;
      case 'LineString':
        image = drawLinePng;
        break;
      default:
        image = drawPointPng;
    }

    super(
      Object.assign(options, {
        title: 'Draw ' + (options.type || 'Point'),
        className: 'icon-draw',
        image: image
      })
    );

    this.drawInteraction = new ol.interaction.Draw({
      type: options.type || 'Point',
      features: options.features,
      source: options.source
    });
  }

  setMap(map) {
    super.setMap(map);
  }

  /**
   * Activate the control
   */
  activate() {
    this.map.addInteraction(this.drawInteraction);
    super.activate();
  }

  /**
   * Activate the control
   */
  deactivate() {
    this.map.removeInteraction(this.drawInteraction);
    super.deactivate();
  }
}
