import Control from './control.js';
import rotatePng from '../../img/rotate.png';
import rotateMapPng from '../../img/rotate_map.png';

/**
 * Tool with for rotating geometries.
 * @extends {ole.Control}
 * @alias ole.RotateControl
 */
export default class RotateControl extends Control {
  /**
   * @param {string} [options.rotateAttribute] Name of a feature attribute
   *   that is used for storing the rotation in rad.
   */
  constructor(options) {
    super(
      Object.assign(
        {
          title: 'Rotate',
          className: 'icon-rotate',
          image: rotatePng
        },
        options
      )
    );

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.pointerInteraction = new ol.interaction.Pointer({
      handleDownEvent: this.onDown.bind(this),
      handleDragEvent: this.onDrag.bind(this),
      handleUpEvent: this.onUp.bind(this)
    });

    /**
     * @type {string}
     * @private
     */
    this.rotateAttribute = options.rotateAttribute || 'ole_rotation';

    /**
     * Layer for rotation feature.
     * @type {ol.layer.Vector}
     * @private
     */
    this.rotateLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: f => {
        var rotation = f.get(this.rotateAttribute);
        return [
          new ol.style.Style({
            geometry: new ol.geom.Point(this.center),
            image: new ol.style.Icon({
              rotation: rotation,
              src: rotateMapPng
            })
          })
        ];
      }
    });
  }

  /**
   * Handle a pointer down event.
   * @param {ol.MapBrowserEvent} event Down event
   * @private
   */
  onDown(evt) {
    this.dragging = false;
    this.feature = this.map.forEachFeatureAtPixel(evt.pixel, f => {
      if (this.source.getFeatures().indexOf(f) > -1) {
        return f;
      }
    });

    if (this.center && this.feature) {
      this.feature.set(
        this.rotateAttribute,
        this.feature.get(this.rotateAttribute) || 0
      );

      // rotation between clicked coordinate and feature center
      this.initialRotation = Math.atan2(
        evt.coordinate[1] - this.center[1],
        evt.coordinate[0] - this.center[0]
      ) + this.feature.get(this.rotateAttribute);
    }

    return true;
  }

  /**
   * Handle a pointer drag event.
   * @param {ol.MapBrowserEvent} event Down event
   * @private
   */
  onDrag(evt) {
    this.dragging = true;

    if (this.feature && this.center) {
      var rotation = Math.atan2(
        evt.coordinate[1] - this.center[1],
        evt.coordinate[0] - this.center[0]
      );

      var rotationDiff = this.initialRotation - rotation;
      var geomRotation = rotationDiff - this.feature.get(this.rotateAttribute);

      this.feature.getGeometry().rotate(-geomRotation, this.center);
      this.rotateFeature.getGeometry().rotate(-geomRotation, this.center);

      this.feature.set(this.rotateAttribute, rotationDiff);
      this.rotateFeature.set(this.rotateAttribute, rotationDiff);
    }
  }

  /**
   * Handle a pointer up event.
   * @param {ol.MapBrowserEvent} event Down event
   * @private
   */
  onUp(evt) {
    if (!this.dragging) {
      if (this.feature) {
        this.rotateFeature = this.feature;
        this.center = evt.coordinate;
        this.rotateLayer.getSource().clear();
        this.rotateLayer.getSource().addFeature(this.rotateFeature);
      } else {
        this.rotateLayer.getSource().clear();
      }
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    this.map.addLayer(this.rotateLayer);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.rotateLayer.getSource().clear();
    this.map.removeLayer(this.rotateLayer);
    this.map.removeInteraction(this.pointerInteraction);
    super.deactivate();
  }
}
