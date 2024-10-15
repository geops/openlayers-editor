import Event from "ol/events/Event";

/**
 * Enum for delete event type.
 * @enum {string} DeleteEventType DELETE
 * @ignore
 */
export const DeleteEventType = {
  /**
   * Triggered upon feature(s) is(are) deleted.
   * @type {string}
   */
  DELETE: "delete",
};

/**
 * Events emitted by the snap interaction of cad control instances are
 * instances of this type.
 * @ignore
 */
export default class DeleteEvent extends Event {
  /**
   * @inheritdoc
   * @param {DeleteEventType} type Type.
   * @param {Feature} feature The feature snapped.
   * @param {MapBrowserPointerEvent} mapBrowserPointerEvent
   * @ignore
   */
  constructor(type, features, mapBrowserPointerEvent) {
    super(type);

    /**
     * The features being deleted.
     * @type {Features}
     */
    this.features = features;

    /**
     * @type {MapBrowserPointerEvent}
     */
    this.mapBrowserEvent = mapBrowserPointerEvent;
  }
}
