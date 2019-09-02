import Event from 'ol/events/Event';

/**
 * @enum {string} MoveEventType
 */
export const MoveEventType = {
  /**
   * Triggered upon feature move start
   */
  MOVESTART: 'movestart',

  /**
   * Triggered upon feature move end
   */
  MOVEEND: 'moveend',
};

/**
 * Events emitted by the move interaction of modify control instances are
 * instances of this type.
 */
export default class MoveEvent extends Event {
  /**
   * @param {MoveEventType} type Type.
   * @param {Feature} feature The feature moved.
   * @param {MapBrowserPointerEvent} mapBrowserPointerEvent
   */
  constructor(type, feature, mapBrowserPointerEvent) {
    super(type);

    /**
     * The features being modified.
     * @type {Feature}
     */
    this.feature = feature;

    /**
     * Associated {@link module:ol/MapBrowserEvent}.
     * @type {MapBrowserPointerEvent}
     */
    this.mapBrowserEvent = mapBrowserPointerEvent;
  }
}
