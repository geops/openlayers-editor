import Select from 'ol/interaction/Select';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { click } from 'ol/events/condition';

// Default style on moving geometries
const selectMoveStyle = new Style({
  zIndex: 10000, // Always on top
  image: new Circle({
    radius: 5,
    fill: new Fill({
      color: '#05A0FF',
    }),
    stroke: new Stroke({ color: '#05A0FF', width: 2 }),
  }),
  stroke: new Stroke({
    color: '#05A0FF',
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(255,255,255,0.4)',
  }),
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
      condition: click,
      style: selectMoveStyle,
      ...options,
    });
  }
}

export default SelectMove;
