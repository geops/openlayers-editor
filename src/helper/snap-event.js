import Event from 'ol/events/Event';

/**
 * Enum for snap event type.
 * @enum {string} SnapEventType SNAP
 * @ignore
 */
export const SnapEventType = {
  /**
   * Triggered upon feature is snapped.
   * @type {string}
   */
  SNAP: 'snap',
};

/**
 * Events emitted by the snap interaction of cad control instances are
 * instances of this type.
 * @ignore
 */
export default class SnapEvent extends Event {
  /**
   * @inheritdoc
   * @param {SnapEventType} type Type.
   * @param {Feature} feature The feature snapped.
   * @param {MapBrowserPointerEvent} mapBrowserPointerEvent
   * @ignore
   */
  constructor(type, features, mapBrowserPointerEvent) {
    super(type);

    /**
     * The features being snapped.
     * @type {Features}
     */
    this.features = features;

    /**
     * @type {MapBrowserPointerEvent}
     */
    this.mapBrowserEvent = mapBrowserPointerEvent;
  }
}
