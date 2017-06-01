import Control from './control.js';
import movePng from '../../img/move.png';

export default class MoveControl extends Control {
  /**
   * Tool for moving geometries,
   * See http://openlayers.org/en/latest/examples/custom-interactions.html
   * @param {Object} options Tool options.
   * @param {string} [type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.Collection<ol.Feature>} [features] Destination for drawing.
   * @param {ol.source.Vector} [source] Destination for drawing.
   */
  constructor(options) {

    super(
      Object.assign(options, {
        title: 'Move geometries',
        className: 'icon-move',
        image: movePng
      })
    );

    this._coordinate = null;
    this._cursor = 'pointer';
    this._feature = null;
    this.__previousCursor = null;

    this.pointerInteraction = new ol.interaction.Pointer({
        handleDownEvent: this.handleDownEvent.bind(this),
        handleDragEvent: this.handleDragEvent.bind(this),
        handleMoveEvent: this.handleMoveEvent.bind(this),
        handleUpEvent: this.handleUpEvent.bind(this)
    });
  }

  /**
   * Handle the down event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   */
  handleDownEvent(evt) {
    var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function(f) {
      return f;
    });

    if (feature) {
      this._coordinate = evt.coordinate;
      this._feature = feature;
      return true;
    }
  }

  /**
   * Handle the drag event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   */
  handleDragEvent(evt) {
    var deltaX = evt.coordinate[0] - this._coordinate[0];
    var deltaY = evt.coordinate[1] - this._coordinate[1];

    this._feature.getGeometry().translate(deltaX, deltaY);

    this._coordinate[0] = evt.coordinate[0];
    this._coordinate[1] = evt.coordinate[1];
  }

  /**
   * Handle the move event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   */
  handleMoveEvent(evt) {
    if (this.cursor_) {
      var element = evt.map.getTargetElement();

      var feature = evt.map.forEachFeatureAtPixel(evt.pixel,
        function(f) {
        return f;
      });

      if (feature) {
        if (element.style.cursor !== this.cursor_) {
          this._previousCursor_ = element.style.cursor;
          element.style.cursor = this.cursor_;
        }
      } else if (this._previousCursor_ !== null) {
        element.style.cursor = this._previousCursor_;
        this._previousCursor_ = null;
      }
    }
  }

  /**
   * Handle the up event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   */
  handleUpEvent() {
    this._coordinate = null;
    this._feature = null;
    return false;
  }

  /**
   * Activate the control
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    super.activate();
  }

  /**
   * Activate the control
   */
  deactivate() {
    this.map.removeInteraction(this.pointerInteraction);
    super.deactivate();
  }
}
