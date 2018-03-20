import OL3Parser from '../../node_modules/jsts/org/locationtech/jts/io/OL3Parser';
import UnionOp from '../../node_modules/jsts/org/locationtech/jts/operation/union/UnionOp';
import TopologyControl from './topology';
import unionSVG from '../../img/union.svg';

/**
 * Control for creating a union of geometries.
 * @extends {ole.Control}
 * @alias ole.Union
 */
class Union extends TopologyControl {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {number} [options.hitTolerance] Select tolerance in pixels
   *   (default is 10)
   */
  constructor(options) {
    super(Object.assign({
      title: 'Union',
      className: 'ole-control-union',
      image: unionSVG,
    }, options));
  }

  /**
   * Apply a union for given features.
   * @param {Array.<ol.Feature>} features Features to union.
   */
  applyTopologyOperation(features) {
    super.applyTopologyOperation(features);
    const parser = new OL3Parser();

    for (let i = 1; i < features.length; i += 1) {
      const geom = parser.read(features[0].getGeometry());
      const otherGeom = parser.read(features[i].getGeometry());
      const unionGeom = UnionOp.union(geom, otherGeom);
      features[0].setGeometry(parser.write(unionGeom));
      features[i].setGeometry(null);
    }
  }
}

export default Union;
