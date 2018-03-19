import Control from './control';
import drawPointSVG from '../../img/draw_point.svg';
import drawPolygonSVG from '../../img/draw_polygon.svg';
import drawLineSVG from '../../img/draw_line.svg';

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
  constructor(options = {}) {
    let image = null;
    const type = options.type || 'Point';

    switch (type) {
      case 'Polygon':
        image = drawPolygonSVG;
        break;
      case 'LineString':
        image = drawLineSVG;
        break;
      default:
        image = drawPointSVG;
    }

    super(Object.assign({
      title: `Draw ${type}`,
      className: 'ole-control-draw',
      image,
    }, options));

    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.drawInteraction = new ol.interaction.Draw({
      type,
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
