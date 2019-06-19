import { Draw } from 'ol/interaction';
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
   * @param {Object} [options] Tool options.
   * @param {string} [options.type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.style.Style.StyleLike} [options.style] Style used for the draw interaction.
   */
  constructor(options) {
    let image = null;

    switch (options.type) {
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
      title: `Draw ${(options.type || 'Point')}`,
      className: 'ole-control-draw',
      image,
    }, options));

    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.drawInteraction = new Draw({
      type: options.type || 'Point',
      features: options.features,
      source: options.source,
      style: options.style,
      stopClick: true,
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
  deactivate(silent) {
    this.map.removeInteraction(this.drawInteraction);
    super.deactivate(silent);
  }
}

export default DrawControl;
