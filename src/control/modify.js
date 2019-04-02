import Control from './control';
import image from '../../img/modify_geometry.svg';

// Return an array of styles
const getStyles = (style, feature) => {
  if (!style) {
    return [];
  }
  let styles = style;
  if (typeof style === 'function') {
    if (feature) {
      // styleFunction
      styles = style(feature);
    } else {
      // featureStyleFunction
      styles = style();
    }
  }
  return Array.isArray(styles) ? styles : [styles];
};

/**
 * Control for modifying geometries.
 * @extends {ole.Control}
 * @alias ole.ModifyControl
 */
class ModifyControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {string} [options.type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.Collection<ol.Feature>} [options.features] Destination for drawing.
   * @param {ol.source.Vector} [options.source] Destination for drawing.
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
   * @param {ol.style.Style.StyleLike} [options.modifyStyle] Style used by the Modify interaction.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Modify geometry',
      className: 'ole-control-modify',
      image,
    }, options));

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new ol.interaction.Select({
      layers: this.layerFilter,
      features: this.features,
      style: options.style,
    });

    if (options.style) {
      // Apply the select style dynamically when the feature has its own style.
      this.selectInteraction.getFeatures().on('add', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Append the select style to the feature's style
        const feature = evt.element;
        const featureStyles = getStyles(feature.getStyleFunction());
        const selectStyles = getStyles(options.style, feature);
        const styles = featureStyles.concat(selectStyles);
        evt.element.setStyle(styles);
      });

      // Remove the select style dynamically when the feature had its own style.
      this.selectInteraction.getFeatures().on('remove', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Remove the select styles
        const feature = evt.element;
        const styles = getStyles(feature.getStyleFunction(), null);
        const selectStyles = getStyles(options.style, feature);
        const featureStyles = styles.slice(0, styles.indexOf(selectStyles[0]));
        evt.element.setStyle(featureStyles);
      });
    }

    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new ol.interaction.Modify({
      features: this.selectInteraction.getFeatures(),
      style: options.modifyStyle,
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
  deactivate(silent) {
    this.selectInteraction.getFeatures().clear();
    this.map.removeInteraction(this.selectInteraction);
    this.map.removeInteraction(this.modifyInteraction);
    super.deactivate(silent);
  }
}

export default ModifyControl;
