import OL3Parser from '../../node_modules/jsts/org/locationtech/jts/io/OL3Parser';
import UnionOp from '../../node_modules/jsts/org/locationtech/jts/operation/union/UnionOp';
import Control from './control';
import delSVG from '../../img/buffer.svg';

/**
 * Control for deleting geometries.
 * @extends {ole.Control}
 * @alias ole.TopologyControl
 */
class TopologyControl extends Control {
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
      image: delSVG,
    }, options));

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new ol.interaction.Select({
      condition: () => !this.getActiveDrawInteractions().length,
      hitTolerance: options.hitTolerance || 10,
      source: this.source,
      multi: true,
    });

    this.selectInteraction.on('select', () => {
      this.union(this.selectInteraction.getFeatures().getArray());
    });
    this.standalone = false;
  }

  /**
   * Return a list of active draw interactions.
   * @returns {Array.<ol.interaction.Draw}
   */
  getActiveDrawInteractions() {
    const activeDrawinteractions = [];
    this.map.getInteractions().forEach((i) => {
      if (i instanceof ol.interaction.Draw && i.getActive()) {
        activeDrawinteractions.push(i);
      }
    });

    return activeDrawinteractions;
  }

  /**
   * Apply a union for given features.
   * @param {Array.<ol.Feature>} features Features to union.
   */
  union(features) {
    this.foo = 'bar';

    if (features.length < 2) {
      return;
    }

    const parser = new OL3Parser();

    for (let i = 1; i < features.length; i += 1) {
      const geom = parser.read(features[0].getGeometry());
      const otherGeom = parser.read(features[i].getGeometry());
      const unionGeom = UnionOp.union(geom, otherGeom);

      features[0].setGeometry(parser.write(unionGeom));
      features[i].setGeometry(null);
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    this.addedFeatures = [];
    this.addfeatureKey = this.source.on('addfeature', (e) => {
      this.addedFeatures.push(e.feature);
      this.addedFeatures = this.addedFeatures.filter(f => f.getGeometry());

      if (this.addedFeatures.length > 1) {
        this.union(this.addedFeatures);
      }
    });
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.addedFeatures = [];
    this.source.unset(this.addfeatureKey);
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate();
  }
}

export default TopologyControl;
