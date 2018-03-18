import Control from './control';
import drawPointPng from '../../img/draw_point.svg';
import drawPolygonPng from '../../img/draw_polygon.svg';
import drawLinePng from '../../img/draw_line.svg';

/**
 * Control for drawing features.
 * @extends {ole.Control}
 * @alias ole.DrawControl
 */
class DrawControl extends Control {
  /**
   * @param {Object} options Tool options.
   * @param {string} [type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   */
  constructor(options) {
    let image = null;

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

    super(Object.assign({
      title: `Draw ${(options.type || 'Point')}`,
      className: 'ole-control-draw',
      image,
    }, options));

    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.drawInteraction = new ol.interaction.Draw({
      type: options.type || 'Point',
      features: options.features,
      source: options.source,
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

export default DrawControl;
