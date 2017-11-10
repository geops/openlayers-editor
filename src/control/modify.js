import Control from './control.js';
import image from '../../img/modify_geometry.png';

/**
 * Control for modifying geometries.
 * @extends {ole.Control}
 * @alias ole.ModifyControl
 */
export default class ModifyControl extends Control {
  /**
   * @param {Object} options Tool options.
   * @param {string} [type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.Collection<ol.Feature>} [features] Destination for drawing.
   * @param {ol.source.Vector} [source] Destination for drawing.
   */
  constructor(options) {
    super(
      Object.assign(
        {
          title: 'Modify geometry',
          className: 'ole-control-modify',
          image: image
        },
        options
      )
    );

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new ol.interaction.Select({
      source: this.source,
      features: this.features
    });

    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new ol.interaction.Modify({
      features: this.selectInteraction.getFeatures()
    });
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    this.map.addInteraction(this.modifyInteraction);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.map.removeInteraction(this.selectInteraction);
    this.map.removeInteraction(this.modifyInteraction);
    super.deactivate();
  }
}
