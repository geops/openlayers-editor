import Select from "ol/interaction/Select";

import delSVG from "../../img/buffer.svg";
import Control from "./control";

/**
 * Control for deleting geometries.
 * @extends {Control}
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
    super({
      className: "ole-control-topology",
      image: delSVG,
      title: "TopoloyOp",
      ...options,
    });

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new Select({
      hitTolerance:
        options.hitTolerance === undefined ? 10 : options.hitTolerance,
      layers: this.layerFilter,
      multi: true,
      style: options.style,
      toggleCondition: () => {
        return true;
      },
    });

    this.selectInteraction.on("select", () => {
      const feats = this.selectInteraction.getFeatures();

      try {
        this.applyTopologyOperation(feats.getArray());
      } catch (error) {
        console.error("Unable to process features.", error);
        feats.clear();
      }
    });
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map?.addInteraction(this.selectInteraction);
    this.addedFeatures = [];
    super.activate();
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
  deactivate(silent) {
    this.addedFeatures = [];
    this.map?.removeInteraction(this.selectInteraction);
    super.deactivate(silent);
  }
}

export default TopologyControl;
