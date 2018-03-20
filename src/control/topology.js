import Control from './control';
import Util from '../helper/util';
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
      title: 'TopoloyOp',
      className: 'ole-control-topology',
      image: delSVG,
    }, options));

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new ol.interaction.Select({
      toggleCondition: () => true,
      hitTolerance: options.hitTolerance || 10,
      source: this.source,
      multi: true,
    });

    this.selectInteraction.on('select', () => {
      const feats = this.selectInteraction.getFeatures();

      try {
        this.applyTopologyOperation(feats.getArray());
      } catch (ex) {
        Util.logError('Unable to process features.');
        feats.clear();
      }
    });
  }

  /**
   * Apply a topology operation for given features.
   * @param {Array.<ol.Feature>} features Features.
   */
  applyTopologyOperation(features) {
    this.topologyFeatures = features;
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    this.addedFeatures = [];
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.addedFeatures = [];
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate();
  }
}

export default TopologyControl;
