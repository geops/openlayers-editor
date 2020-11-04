import Select from 'ol/interaction/Select';
import { singleClick, shiftKeyOnly } from 'ol/events/condition';

/**
 * Select features for modification by a Move interaction.
 *
 * Default behavior:
 *  - Single click on the feature to select one feature.
 *  - Single click on a selected feature to deselect one feature.
 *  - Single click on the map to deselect all features.
 */
class SelectMove extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: singleClick,
      toggleCondition: shiftKeyOnly,
      wrapX: false,
      ...options,
    });
  }
}

export default SelectMove;
