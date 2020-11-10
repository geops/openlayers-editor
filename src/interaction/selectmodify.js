/* eslint-disable no-underscore-dangle */
import Select from 'ol/interaction/Select';
import { doubleClick } from 'ol/events/condition';

/**
 * Select features for modification by a Modify interaction.
 *
 * Default behavior:
 *  - Double click on the feature to select one feature.
 *  - Click on the map to deselect all features.
 */
class SelectModify extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: doubleClick,
      wrapX: false,
      ...options,
    });
  }

  // We redefine the handle method to avoid propagation of double click to the map.
  handleEvent(mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
      return true;
    }
    const add = this.addCondition_(mapBrowserEvent);
    const remove = this.removeCondition_(mapBrowserEvent);
    const toggle = this.toggleCondition_(mapBrowserEvent);
    const { map } = mapBrowserEvent;
    const set = !add && !remove && !toggle;
    if (set) {
      let isEvtOnSelectableFeature = false;
      map.forEachFeatureAtPixel(
        mapBrowserEvent.pixel,
        (feature, layer) => {
          if (this.filter_(feature, layer)) {
            isEvtOnSelectableFeature = true;
          }
        },
        {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_,
        },
      );

      if (isEvtOnSelectableFeature) {
        // if a feature is about to be selected or unselected we stop event propagation.
        super.handleEvent(mapBrowserEvent);
        return false;
      }
    }

    return super.handleEvent(mapBrowserEvent);
  }
}

export default SelectModify;
