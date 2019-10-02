/* eslint-disable */
/**
 * @module ol/interaction/Select
 * @ignore
 */
import {getUid} from 'ol/util.js';
import CollectionEventType from 'ol/CollectionEventType.js';
import {extend, includes} from 'ol/array.js';
import Event from 'ol/events/Event.js';
import {singleClick, never, shiftKeyOnly, pointerMove} from 'ol/events/condition.js';
import {TRUE} from 'ol/functions.js';
import GeometryType from 'ol/geom/GeometryType.js';
import Interaction from 'ol/interaction/Interaction.js';
import VectorLayer from 'ol/layer/Vector.js';
import {clear} from 'ol/obj.js';
import VectorSource from 'ol/source/Vector.js';
import {createEditingStyle} from 'ol/style/Style.js';


/**
 * @enum {string}
 * @ignore
 */
const SelectEventType = {
  /**
   * Triggered when feature(s) has been (de)selected.
   * @event SelectEvent#select
   * @api
   * @ignore
   */
  SELECT: 'select'
};


/**
 * A function that takes an {ol/Feature} or
 * {ol/render/Feature} and an
 * {Layer} and returns `true` if the feature may be
 * selected or `false` otherwise.
 */


/**
 * @property {Condition} [addCondition] A function
 * that takes an {MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled.
 * By default, this is {ol/events/condition~never}. Use this if you
 * want to use different events for add and remove instead of `toggle`.
 * @property {Function} [condition] A function that
 * takes an {MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. This is the event
 * for the selected features as a whole. By default, this is
 * {ol/events/condition~singleClick}. Clicking on a feature selects that
 * feature and removes any that were in the selection. Clicking outside any
 * feature removes all from the selection.
 * See `toggle`, `add`, `remove` options for adding/removing extra features to/
 * from the selection.
 * @property {Array<Layer>} [layers]
 * A list of layers from which features should be selected. Alternatively, a
 * filter function can be provided. The function will be called for each layer
 * in the map and should return `true` for layers that you want to be
 * selectable. If the option is absent, all visible layers will be considered
 * selectable.
 * @property {StyleLike} [style]
 * Style for the selected features. By default the default edit style is used
 * (see {ol/style}).
 * @property {Condition} [removeCondition] A function
 * that takes an {MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled.
 * By default, this is {ol/events/condition~never}. Use this if you
 * want to use different events for add and remove instead of `toggle`.
 * @property {Condition} [toggleCondition] A function
 * that takes an {MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. This is in addition
 * to the `condition` event. By default,
 * {ol/events/condition~shiftKeyOnly}, i.e. pressing `shift` as
 * well as the `condition` event, adds that feature to the current selection if
 * it is not currently selected, and removes it if it is. See `add` and `remove`
 * if you want to use different events instead of a toggle.
 * @property {boolean} [multi=false] A boolean that determines if the default
 * behaviour should select only single features or all (overlapping) features at
 * the clicked map position. The default of `false` means single select.
 * @property {Collection<Feature>} [features]
 * Collection where the interaction will place selected features. Optional. If
 * not set the interaction will create a collection. In any case the collection
 * used by the interaction is returned by
 * {ol/interaction/Select~Select#getFeatures}.
 * @property {FilterFunction} [filter] A function
 * that takes an {ol/Feature} and an
 * {Layer} and returns `true` if the feature may be
 * selected or `false` otherwise.
 * @property {boolean} [wrapX=true] Wrap the world horizontally on the selection
 * overlay.
 * @property {number} [hitTolerance=0] Hit-detection tolerance. Pixels inside
 * the radius around the given position will be checked for features.
 */


/**
 * @classdesc
 * Events emitted by {ol/interaction/Select~Select} instances are instances of
 * this type.
 * @class
 * @ignore
 */
class SelectEvent extends Event {
  /**
   * @param {SelectEventType} type The event type.
   * @param {Array<Feature>} selected Selected features.
   * @param {Array<Feature>} deselected Deselected features.
   * @param {MapBrowserEvent} mapBrowserEvent Associated
   *     {ol/MapBrowserEvent}.
   * @ignore
   */
  constructor(type, selected, deselected, mapBrowserEvent) {
    super(type);

    /**
     * Selected features array.
     * @type {Array<Feature>}
     * @api
     */
    this.selected = selected;

    /**
     * Deselected features array.
     * @type {Array<Feature>}
     * @api
     */
    this.deselected = deselected;

    /**
     * Associated {ol/MapBrowserEvent}.
     * @type {MapBrowserEvent}
     * @api
     */
    this.mapBrowserEvent = mapBrowserEvent;

  }

}


/**
 * @classdesc
 * Interaction for selecting vector features. By default, selected features are
 * styled differently, so this interaction can be used for visual highlighting,
 * as well as selecting features for other actions, such as modification or
 * output. There are three ways of controlling which features are selected:
 * using the browser event as defined by the `condition` and optionally the
 * `toggle`, `add`/`remove`, and `multi` options; a `layers` filter; and a
 * further feature filter using the `filter` option.
 *
 * Selected features are added to an internal unmanaged layer.
 *
 * @fires SelectEvent
 * @api
 * @ignore
 */
class Select extends Interaction {
  /**
   * @param {Options=} opt_options Options.
   * @ignore
   */
  constructor(opt_options) {

    super({
      handleEvent: handleEvent
    });

    const options = opt_options ? opt_options : {};

    /**
     * @private
     * @type {Condition}
     */
    this.condition_ = options.condition ? options.condition : singleClick;

    /**
     * @private
     * @type {Condition}
     */
    this.addCondition_ = options.addCondition ? options.addCondition : never;

    /**
     * @private
     * @type {Condition}
     */
    this.removeCondition_ = options.removeCondition ? options.removeCondition : never;

    /**
     * @private
     * @type {Condition}
     */
    this.toggleCondition_ = options.toggleCondition ? options.toggleCondition : shiftKeyOnly;

    /**
     * @private
     * @type {boolean}
     */
    this.multi_ = options.multi ? options.multi : false;

    /**
     * @private
     * @type {FilterFunction}
     */
    this.filter_ = options.filter ? options.filter : TRUE;

    /**
     * @private
     * @type {number}
     */
    this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;

    const featureOverlay = new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false,
        features: options.features,
        wrapX: options.wrapX
      }),
      style: options.style ? options.style :
        getDefaultStyleFunction(),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    /**
     * @private
     * @type {VectorLayer}
     */
    this.featureOverlay_ = featureOverlay;

    /** @type {ol.layer.Layer} */
    let layerFilter;
    if (options.layers) {
      if (typeof options.layers === 'function') {
        layerFilter = options.layers;
      } else {
        const layers = options.layers;
        layerFilter = function(layer) {
          return includes(layers, layer);
        };
      }
    } else {
      layerFilter = TRUE;
    }

    /**
     * @private
     * @type {ol.layer.Layer}
     */
    this.layerFilter_ = layerFilter;

    /**
     * An association between selected feature (key)
     * and layer (value)
     * @private
     * @type {Layer}
     */
    this.featureLayerAssociation_ = {};
  }

  /**
   * @param {FeatureLike} feature Feature.
   * @param {Layer} layer Layer.
   * @private
   */
  addFeatureLayerAssociation_(feature, layer) {
    this.featureLayerAssociation_[getUid(feature)] = layer;
  }

  /**
   * Get the selected features.
   * @return {Feature} Features collection.
   * @api
   */
  getFeatures() {
    return this.featureOverlay_.getSource().getFeaturesCollection();
  }

  /**
   * Returns the Hit-detection tolerance.
   * @returns {number} Hit tolerance in pixels.
   * @api
   */
  getHitTolerance() {
    return this.hitTolerance_;
  }

  /**
   * Returns the associated {ol/layer/Vector~Vector vectorlayer} of
   * the (last) selected feature. Note that this will not work with any
   * programmatic method like pushing features to
   * {ol/interaction/Select~Select#getFeatures collection}.
   * @param {FeatureLike} feature Feature
   * @return {VectorLayer} Layer.
   * @api
   */
  getLayer(feature) {
    return (
      /** @type {VectorLayer} */ (this.featureLayerAssociation_[getUid(feature)])
    );
  }

  /**
   * Get the overlay layer that this interaction renders selected features to.
   * @return {VectorLayer} Overlay layer.
   * @api
   */
  getOverlay() {
    return this.featureOverlay_;
  }

  /**
   * Hit-detection tolerance. Pixels inside the radius around the given position
   * will be checked for features.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @api
   */
  setHitTolerance(hitTolerance) {
    this.hitTolerance_ = hitTolerance;
  }

  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {PluggableMap} map Map.
   * @override
   * @api
   */
  setMap(map) {
    super.setMap(map);
    this.featureOverlay_.setMap(map);
  }

  /**
   * @param {FeatureLike} feature Feature.
   * @private
   */
  removeFeatureLayerAssociation_(feature) {
    delete this.featureLayerAssociation_[getUid(feature)];
  }
}


/**
 * Handles the {ol/MapBrowserEvent map browser event} and may change the
 * selected state of features.
 * @param {MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {Select}
 */
function handleEvent(mapBrowserEvent) {
  if (!this.condition_(mapBrowserEvent)) {
    return true;
  }
  const add = this.addCondition_(mapBrowserEvent);
  const remove = this.removeCondition_(mapBrowserEvent);
  const toggle = this.toggleCondition_(mapBrowserEvent);
  const set = !add && !remove && !toggle;
  const map = mapBrowserEvent.map;
  const features = this.getFeatures();
  const deselected = [];
  const selected = [];
  if (set) {
    // Replace the currently selected feature(s) with the feature(s) at the
    // pixel, or clear the selected feature(s) if there is no feature at
    // the pixel.
    clear(this.featureLayerAssociation_);
    map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
      (
        /**
         * @param {FeatureLike} feature Feature.
         * @param {Layer} layer Layer.
         * @return {boolean|undefined} Continue to iterate over the features.
         */
        function(feature, layer) {
          if (this.filter_(feature, layer)) {
            selected.push(feature);
            this.addFeatureLayerAssociation_(feature, layer);
            return !this.multi_;
          }
        }).bind(this), {
        layerFilter: this.layerFilter_,
        hitTolerance: this.hitTolerance_
      });
    for (let i = features.getLength() - 1; i >= 0; --i) {
      const feature = features.item(i);
      const index = selected.indexOf(feature);
      if (index > -1) {
        // feature is already selected
        selected.splice(index, 1);
      } else {
        features.remove(feature);
        deselected.push(feature);
      }
    }
    if (selected.length !== 0) {
      features.extend(selected);
    }
  } else {
    // Modify the currently selected feature(s).
    map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
      (
        /**
         * @param {FeatureLike} feature Feature.
         * @param {Layer} layer Layer.
         * @return {boolean|undefined} Continue to iterate over the features.
         */
        function(feature, layer) {
          if (this.filter_(feature, layer)) {
            if ((add || toggle) && !includes(features.getArray(), feature)) {
              selected.push(feature);
              this.addFeatureLayerAssociation_(feature, layer);
            } else if ((remove || toggle) && includes(features.getArray(), feature)) {
              deselected.push(feature);
              this.removeFeatureLayerAssociation_(feature);
            }
            return !this.multi_;
          }
        }).bind(this), {
        layerFilter: this.layerFilter_,
        hitTolerance: this.hitTolerance_
      });
    for (let j = deselected.length - 1; j >= 0; --j) {
      features.remove(deselected[j]);
    }
    features.extend(selected);
  }
  if (selected.length > 0 || deselected.length > 0) {
    this.dispatchEvent(
      new SelectEvent(SelectEventType.SELECT,
        selected, deselected, mapBrowserEvent));
  }
  return pointerMove(mapBrowserEvent);
}


/**
 * @return {StyleFunction} Styles.
 */
function getDefaultStyleFunction() {
  const styles = createEditingStyle();
  extend(styles[GeometryType.POLYGON], styles[GeometryType.LINE_STRING]);
  extend(styles[GeometryType.GEOMETRY_COLLECTION], styles[GeometryType.LINE_STRING]);

  return function(feature, resolution) {
    if (!feature.getGeometry()) {
      return null;
    }
    return styles[feature.getGeometry().getType()];
  };
}


export default Select;