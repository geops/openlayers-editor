import Interaction from 'ol/interaction/Interaction';
import EventType from 'ol/events/EventType';
import { noModifierKeys, targetNotEditable } from 'ol/events/condition';
import DeleteEvent, { DeleteEventType } from '../event/delete-event';

class Delete extends Interaction {
  constructor(options = {}) {
    super(options);

    this.source = options.source;

    this.features = options.features;

    this.condition =
      options.condition ||
      ((mapBrowserEvent) => {
        const bool =
          noModifierKeys(mapBrowserEvent) &&
          targetNotEditable(mapBrowserEvent) &&
          (mapBrowserEvent.originalEvent.keyCode === 46 ||
            mapBrowserEvent.originalEvent.keyCode === 8);
        return bool;
      });
  }

  setFeatures(features) {
    this.features = features;
  }

  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (
      (mapBrowserEvent.type === EventType.KEYDOWN ||
        mapBrowserEvent.type === EventType.KEYPRESS) &&
      this.condition(mapBrowserEvent) &&
      this.features
    ) {
      // Loop delete through selected features array
      this.features
        .getArray()
        .forEach((feature) => this.source.removeFeature(feature));

      this.dispatchEvent(
        new DeleteEvent(DeleteEventType.DELETE, this.features, mapBrowserEvent),
      );

      // Clean select's collection
      this.features.clear();
      stopEvent = true;
    }
    return !stopEvent;
  }
}

export default Delete;
