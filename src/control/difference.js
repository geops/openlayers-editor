import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser';
import { OverlayOp } from 'jsts/org/locationtech/jts/operation/overlay';
import LinearRing from 'ol/geom/LinearRing';
import {
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from 'ol/geom';
import TopologyControl from './topology';
import diffSVG from '../../img/difference.svg';

/**
 * Control for creating a difference of geometries.
 * @extends {ole.Control}
 * @alias ole.Difference
 */
class Difference extends TopologyControl {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {number} [options.hitTolerance] Select tolerance in pixels
   *   (default is 10)
   */
  constructor(options) {
    super(Object.assign({
      title: 'Difference',
      className: 'ole-control-difference',
      image: diffSVG,
    }, options));
  }

  /**
   * Apply a difference operation for given features.
   * @param {Array.<ol.Feature>} features Features.
   */
  applyTopologyOperation(features) {
    super.applyTopologyOperation(features);

    if (features.length < 2) {
      return;
    }

    const parser = new OL3Parser();
    parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiPoint,
      MultiLineString,
      MultiPolygon,
    );

    for (let i = 1; i < features.length; i += 1) {
      const geom = parser.read(features[0].getGeometry());
      const otherGeom = parser.read(features[i].getGeometry());
      const diffGeom = OverlayOp.difference(geom, otherGeom);
      features[0].setGeometry(parser.write(diffGeom));
      features[i].setGeometry(null);
    }
  }
}

export default Difference;
