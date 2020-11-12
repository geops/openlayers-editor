import Pointer from 'ol/interaction/Pointer';
import Point from 'ol/geom/Point';
import { getCenter } from 'ol/extent';
import MoveEvent, { MoveEventType } from '../event/move-event';

class Move extends Pointer {
  constructor(options) {
    super();
    this.features = options.features;
  }

  /**
   * Handle the down event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleDownEvent(evt) {
    [this.featureToMove] = evt.map.getFeaturesAtPixel(evt.pixel);
    if (
      !this.featureToMove ||
      !this.features.getArray().includes(this.featureToMove)
    ) {
      return false;
    }

    if (this.featureToMove.getGeometry() instanceof Point) {
      const extent = this.featureToMove.getGeometry().getExtent();
      this.coordinate = getCenter(extent);
    } else {
      this.coordinate = evt.coordinate;
    }
    this.isMoving = true;
    this.dispatchEvent(
      new MoveEvent(MoveEventType.MOVESTART, this.featureToMove, evt),
    );

    return true;
  }

  /**
   * Handle the drag event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleDragEvent(evt) {
    const deltaX = evt.coordinate[0] - this.coordinate[0];
    const deltaY = evt.coordinate[1] - this.coordinate[1];

    this.featureToMove.getGeometry().translate(deltaX, deltaY);
    this.coordinate = evt.coordinate;
  }

  /**
   * Handle the up event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleUpEvent(evt) {
    this.dispatchEvent(
      new MoveEvent(MoveEventType.MOVEEND, this.featureToMove, evt),
    );
    this.coordinate = null;
    this.isMoving = false;
    this.featureToMove = null;
    return false;
  }
}

export default Move;
