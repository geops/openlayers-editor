import { singleClick } from "ol/events/condition";
import Select from "ol/interaction/Select";
import { Circle, Fill, Stroke, Style } from "ol/style";

// Default style on moving geometries
const selectMoveStyle = new Style({
  fill: new Fill({
    color: "rgba(255,255,255,0.4)",
  }),
  image: new Circle({
    fill: new Fill({
      color: "#05A0FF",
    }),
    radius: 5,
    stroke: new Stroke({ color: "#05A0FF", width: 2 }),
  }),
  stroke: new Stroke({
    color: "#05A0FF",
    width: 3,
  }),
  zIndex: 10000, // Always on top
});

/**
 * Select features for modification by a Move interaction.
 *
 * Default behavior:
 *  - Single click on the feature to select one feature.
 */
class SelectMove extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: singleClick,
      style: selectMoveStyle,
      ...options,
    });
  }
}

export default SelectMove;
