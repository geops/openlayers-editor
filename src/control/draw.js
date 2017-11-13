import Control from './control.js';
import drawPointPng from '../../img/draw_point.png';
import drawPolygonPng from '../../img/draw_polygon.png';
import drawLinePng from '../../img/draw_line.png';

/**
 * Control for drawing features.
 * @extends {ole.Control}
 * @alias ole.DrawControl
 */
export default class DrawControl extends Control {
  /**
   * @param {Object} options Tool options.
   * @param {string} [type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
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
      Object.assign(
        {
          title: 'Draw ' + (options.type || 'Point'),
          className: 'ole-control-draw',
          image: image
        },
        options
      )
    );

    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.drawInteraction = new ol.interaction.Draw({
      type: options.type || 'Point',
      features: options.features,
      source: options.source
    });
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.drawInteraction);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.map.removeInteraction(this.drawInteraction);
    super.deactivate();
  }
}
