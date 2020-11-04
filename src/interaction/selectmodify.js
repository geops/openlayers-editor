/* eslint-disable no-underscore-dangle */
import Select from 'ol/interaction/Select';
import { doubleClick } from 'ol/events/condition';
import { selectModifyStyle } from '../helper/styles';

/**
 * Select features for modification by a Modify interaction.
 */
class SelectModify extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: (evt) => doubleClick(evt),
      wrapX: false,
      style: selectModifyStyle,
      ...options,
    });
  }

  // We have to manage the cases:
  // -  where we click outside a features we unselect the feature.
  // -  selection on double click stop event propagation.
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
