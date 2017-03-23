/**
 * Default ole style
 */
export class Style {
  constructor() {
    this.pointStyle = this._getDefaultPointStyle();
    this.strokeStyle = this._getDefaultStrokeStyle();

    this.style = new ol.style.Style({
      image: this.pointStyle,
      stroke: this.strokeStyle
    });
  }

  /**
   * Getter for the default point style of ole.
   * @returns {ol.style.Circle} The style.
   */
  _getDefaultPointStyle() {
    return new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'rgba(97, 132, 156, 0.5)'
      }),
      stroke: this._getDefaultStrokeStyle()
    });
  }

  /**
   * Getter for the default stroke style of ole.
   * @returns {ol.style.Circle} The style.
   */
  _getDefaultStrokeStyle() {
    return new ol.style.Stroke({
      width: 1,
      color: 'rgb(97, 132, 156)'
    });
  }

  /**
   * Style function for this style.
   * @returns {Array.<ol.style.Style} The feature style.
   */
  styleFunction() {
    return [this.style];
  }
}

/**
 * Features are invisible by default and become
 * visible on mouse over.
 */
export default class CadStyle extends Style {
  constructor() {
    super();

    this.strokeStyle.setLineDash([5, 5]);
    this.hoverFeatures = [];
  }

  /**
   * Adds a hover feature that should be styled.
   * @param {ol.Feature} feature The hover feature.
   */
  addHoverFeature(feature) {
    this.hoverFeatures.push(feature);
  }

  /**
   * Removes all hover features.
   */
  clearHoverFeatures() {
    this.hoverFeatures = [];
  }

  /**
   * Style function for this style.
   * @param {ol.Feature} Feature to style.
   * @returns {Array.<ol.style.Style} The feature style.
   */
  styleFunction(feature) {
    if (this.hoverFeatures.indexOf(feature) === -1) {
      return []
    }

    return [this.style];
  }
}

