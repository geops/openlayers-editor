
import { Select } from '../interaction';
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
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
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
    this.selectInteraction = new Select({
      toggleCondition: () => true,
      layers: this.layerFilter,
      hitTolerance: options.hitTolerance === undefined ? 10 : options.hitTolerance,
      multi: true,
      style: options.style,
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
  deactivate(silent) {
    this.addedFeatures = [];
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate(silent);
  }
}

export default TopologyControl;
