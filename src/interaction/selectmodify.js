/* eslint-disable no-underscore-dangle */
import Select from 'ol/interaction/Select';
import { doubleClick, singleClick } from 'ol/events/condition';
import { selectModifyStyle } from '../helper/styles';

/**
 * Select features for modification by a Modify interaction.
 *
 * Default behavior:
 *  - Double click to select a feature for mdofication.
 *  - Single click on the feature to deselect one feature.
 *  - Single click on the map to deselect all features.
 */
class SelectModify extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: (evt) => doubleClick(evt) || singleClick(evt),
      addCondition: (evt) => doubleClick(evt),
      removeCondition: (evt) => singleClick(evt),
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
    if (add || remove || toggle) {
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
      console.log(add, remove, toggle, isEvtOnSelectableFeature, this);
      if (isEvtOnSelectableFeature) {
        // if a feature is about to be selected or unselected we stop event propagation.
        super.handleEvent(mapBrowserEvent);
        return false;
      }
      if (remove && !isEvtOnSelectableFeature) {
        // That means you click on the map outside selectable features.
        // so you deselect all features of this Select interaction.
        this.getFeatures().clear();
        return true;
      }
    }

    return super.handleEvent(mapBrowserEvent);
  }
}

export default SelectModify;
