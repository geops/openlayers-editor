import Control from './control.js';

/**
 * Tool with CAD drawing functions.
 */
export default class RotateControl extends Control {

  /**
   * Constructor.
   * @param {ol.Collection<ol.Feature>} [options.features] Control features.
   *   for drawing.
   * @param {ol.source.Vector} [options.source] Control features.
   * @param {string} [options.rotateAttribute] Name of a feature attribute
   *   that is used for storing the rotation in rad.
   */
  constructor(options) {
    super(Object.assign(options, {
      title: 'Rotate',
      className: 'icon-rotate'
    }));

    this.pointerInteraction = new ol.interaction.Pointer({
      handleDownEvent: this._onDown.bind(this),
      handleDragEvent: this._onDrag.bind(this),
      handleUpEvent: this._onUp.bind(this)
    });

    this.rotateAttribute = options.rotateAttribute || 'ole_rotation';

    this.rotateLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: function(f) {
        var rotation = f.get(this.rotateAttribute);
        return [
          new ol.style.Style({
            geometry: new ol.geom.Point(this._center),
            image: new ol.style.Icon({
              rotation: rotation,
              src: 'img/rotate.svg'
            })
          })
        ];
      }.bind(this)
    });
  }

  /**
   * Handle a pointer down event.
   * @param {ol.MapBrowserEvent} event Down event
   */
  _onDown(evt) {
    this._dragging = false;
    this._feature = this.map.forEachFeatureAtPixel( evt.pixel, function(f) {
      return f;
    });

    if (this._center && this._feature) {
      this._feature.set(this.rotateAttribute,
        this._feature.get(this.rotateAttribute) || 0);

      // rotation between clicked coordinate and feature center
      this._initialRotation = Math.atan2(
        evt.coordinate[1] - this._center[1],
        evt.coordinate[0] - this._center[0]
      ) + (this._feature.get(this.rotateAttribute));
    }

    return true;
  }

  /**
   * Handle a pointer drag event.
   * @param {ol.MapBrowserEvent} event Down event
   */
  _onDrag(evt) {
    this._dragging = true;

    if (this._feature) {
      var rotation = Math.atan2(
        evt.coordinate[1] - this._center[1],
        evt.coordinate[0] - this._center[0]
      );

      var rotationDiff = this._initialRotation - rotation;
      var geomRotation = rotationDiff - this._feature.get(this.rotateAttribute);
      this._feature.getGeometry().rotate(-geomRotation, this._center);
      this._feature.set(this.rotateAttribute, rotationDiff);
    }
  }

  /**
   * Handle a pointer up event.
   * @param {ol.MapBrowserEvent} event Down event
   */
  _onUp(evt) {
    if (!this._dragging) {
      if (this._feature) {
        this._center = evt.coordinate;
        this.rotateLayer.getSource().clear();
        this.rotateLayer.getSource().addFeature(this._feature);
      } else {
        this.rotateLayer.getSource().clear();
      }
    }
  }

  /**
   * Activate the control.
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    this.map.addLayer(this.rotateLayer);
    super.activate();
  }

  /**
   * Deactivate the control.
   */
  deactivate() {
    this.map.removeLayer(this.rotateLayer);
    this.map.removeInteraction(this.pointerInteraction);
    super.deactivate();
  }
}
