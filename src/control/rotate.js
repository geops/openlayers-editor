import { Style, Icon } from 'ol/style';
import Point from 'ol/geom/Point';
import Vector from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Pointer from 'ol/interaction/Pointer';
import Control from './control';
import rotateSVG from '../../img/rotate.svg';
import rotateMapSVG from '../../img/rotate_map.svg';

/**
 * Tool with for rotating geometries.
 * @extends {ole.Control}
 * @alias ole.RotateControl
 */
class RotateControl extends Control {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {string} [options.rotateAttribute] Name of a feature attribute
   *   that is used for storing the rotation in rad.
   * @param {ol.style.Style.StyleLike} [options.style] Style used for the rotation layer.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Rotate',
      className: 'icon-rotate',
      image: rotateSVG,
    }, options));

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.pointerInteraction = new Pointer({
      handleDownEvent: this.onDown.bind(this),
      handleDragEvent: this.onDrag.bind(this),
      handleUpEvent: this.onUp.bind(this),
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
    this.rotateLayer = new Vector({
      source: new VectorSource(),
      style: options.style || ((f) => {
        const rotation = f.get(this.rotateAttribute);
        return [
          new Style({
            geometry: new Point(this.center),
            image: new Icon({
              rotation,
              src: rotateMapSVG,
            }),
          }),
        ];
      }),
    });
  }

  /**
   * Handle a pointer down event.
   * @param {ol.MapBrowserEvent} event Down event
   * @private
   */
  onDown(evt) {
    this.dragging = false;
    this.feature = this.map.forEachFeatureAtPixel(evt.pixel, (f) => {
      if (this.source.getFeatures().indexOf(f) > -1) {
        return f;
      }

      return null;
    });

    if (this.center && this.feature) {
      this.feature.set(
        this.rotateAttribute,
        this.feature.get(this.rotateAttribute) || 0,
      );

      // rotation between clicked coordinate and feature center
      this.initialRotation =
        Math.atan2(
          evt.coordinate[1] - this.center[1],
          evt.coordinate[0] - this.center[0],
        ) + this.feature.get(this.rotateAttribute);
    }

    if (this.feature) {
      return true;
    }

    return false;
  }

  /**
   * Handle a pointer drag event.
   * @param {ol.MapBrowserEvent} event Down event
   * @private
   */
  onDrag(evt) {
    this.dragging = true;

    if (this.feature && this.center) {
      const rotation = Math.atan2(
        evt.coordinate[1] - this.center[1],
        evt.coordinate[0] - this.center[0],
      );

      const rotationDiff = this.initialRotation - rotation;
      const geomRotation = rotationDiff - this.feature.get(this.rotateAttribute);

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
    this.rotateLayer.setMap(this.map);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    this.rotateLayer.getSource().clear();
    this.rotateLayer.setMap(null);
    this.map.removeInteraction(this.pointerInteraction);
    super.deactivate(silent);
  }
}

export default RotateControl;
