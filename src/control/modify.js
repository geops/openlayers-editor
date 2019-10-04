import { unByKey } from 'ol/Observable';
import { getCenter } from 'ol/extent';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { MultiPoint, Point } from 'ol/geom';
import { Modify, Pointer } from 'ol/interaction';
import { singleClick, doubleClick, shiftKeyOnly } from 'ol/events/condition';
import { Select } from '../interaction';
import Control from './control';
import image from '../../img/modify_geometry2.svg';
import MoveEvent, { MoveEventType } from '../helper/move-event';

// Return an array of styles
const getStyles = (style, feature) => {
  if (!style) {
    return [];
  }
  let styles = style;
  if (typeof style === 'function') {
    if (feature) {
      // styleFunction
      styles = style(feature);
    } else {
      // featureStyleFunction
      styles = style();
    }
  }
  return Array.isArray(styles) ? styles : [styles];
};

// Default style on modifying geometries
const selectModifyStyle = new Style({
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
  geometry: (f) => {
    let coordinates = [];
    if (f.getGeometry().getType() === 'Polygon') {
      f.getGeometry()
        .getCoordinates()[0]
        .forEach((coordinate) => {
          coordinates.push(coordinate);
        });
    } else if (f.getGeometry().getType() === 'LineString') {
      coordinates = f.getGeometry().getCoordinates();
    } else {
      coordinates = [f.getGeometry().getCoordinates()];
    }
    return new GeometryCollection([
      f.getGeometry(),
      new MultiPoint(coordinates),
    ]);
  },
});

/**
 * Control for modifying geometries.
 * @extends {ole.Control}
 * @alias ole.ModifyControl
 */
class ModifyControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {string} [options.type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {number} [options.hitTolerance] Select tolerance in pixels
   *   (default is 5)
   * @param {ol.Collection<ol.Feature>} [options.features] Destination for drawing.
   * @param {ol.source.Vector} [options.source] Destination for drawing.
   * @param {ol.style.Style.StyleLike} [options.selectMoveStyle]
   * Style used when a feature is selected to be moved.
   * @param {ol.style.Style.StyleLike} [options.selectModifyStyle]
   * Style used when a feature is selected to be modified.
   * @param {ol.style.Style.StyleLike} [options.modifyStyle] Style used by the Modify interaction.
   * @param {ol.events.condition} [options.moveCondition] Condition to trigger Move select.
   * @param {ol.events.condition} [options.modifyCondition] Condition to trigger Modify select.
   * @param {ol.events.condition} [options.moveToggleCondition]
   * Condition to toggle Move selected features (or multi-select).
   * @param {ol.events.condition} [options.modifyToggleCondition]
   * Condition to toggle Modify selected features (or multi-select).
   * @param {function} [options.deleteCondition] Function that takes a browser
   * keyboard event, should return true to delete the current feature selected.
   *   (default deleteCondition activated on Backspace and Delete key)
   */
  constructor(options) {
    super(Object.assign(
      {
        title: 'Modify geometry',
        className: 'ole-control-modify',
        image,
      },
      options,
    ));

    const OLD_STYLES_PROP = 'oldStyles';
    const SELECT_MOVE_ON_CHANGE_KEY = 'selectMoveOnChangeKey';
    const SELECT_MODIFY_ON_CHANGE_KEY = 'selectModifyOnChangeKey';

    /**
     * @type {ol.Coordinate}
     * @private
     */

    this.coordinate = null;

    /**
     * @type {string}
     * @private
     */
    this.previousCursor = null;

    /**
     * @type {number}
     * @private
     */
    this.hitTolerance = options.hitTolerance === undefined ? 5 : options.hitTolerance;

    this.selectMoveStyle = options.selectMoveStyle;

    this.selectModifyStyle = options.selectModifyStyle || selectModifyStyle;

    this.modifyStyle = options.modifyStyle;

    this.deleteFeature = this.deleteFeature.bind(this);

    this.cursorHandler = this.cursorHandler.bind(this);

    this.cursorTimeout = null;

    this.deleteCondition =
      options.deleteCondition ||
      (evt => evt.keyCode === 46 || evt.keyCode === 8);

    this.selectFilter = (feature, layer) => {
      if (this.layerFilter) {
        return this.layerFilter(layer);
      }
      return true;
    };

    this.getFeatureAtPixel = (pixel) => {
      const feature = (this.map.getFeaturesAtPixel(pixel, {
        hitTolerance: this.hitTolerance,
        layerFilter: this.layerFilter,
      }) || [])[0];
      return feature;
    };

    this.isHoverVertexFeatureAtPixel = (pixel) => {
      let isHoverVertex = false;
      this.map.forEachFeatureAtPixel(
        pixel,
        (feat, layer) => {
          if (!layer) {
            isHoverVertex = true;
            return true;
          }
          return false;
        },
        {
          hitTolerance: this.hitTolerance,
        },
      );
      return isHoverVertex;
    };

    this.applySelectStyle = (feature, styleToApply) => {
      const featureStyles = getStyles(feature.getStyleFunction());
      const stylesToApply = getStyles(styleToApply, feature);

      // At this point featureStyles must not contain the select styles.
      const newStyles = [...featureStyles, ...stylesToApply];
      feature.set(OLD_STYLES_PROP, featureStyles);
      feature.setStyle(newStyles);
    };

    this.onSelectFeature = (feature, selectStyle, listenerPropName) => {
      if (!feature.getStyleFunction()) {
        return;
      }

      // Append the select style to the feature's style
      this.applySelectStyle(feature, selectStyle);

      // Ensure we don't have twice the same event registered.
      const listenerKey = feature.get(listenerPropName);
      if (listenerKey) {
        unByKey(listenerKey);
        feature.unset(listenerKey);
      }

      feature.set(
        listenerPropName,
        feature.on('change', (e) => {
          // On change of the feature's style, we re-apply the selected Style.
          this.onSelectedFeatureChange(e.target, selectStyle);
        }),
      );
    };

    this.onDeselectFeature = (feature, selectStyle, listenerPropName) => {
      if (!feature.getStyleFunction()) {
        return;
      }

      const listenerKey = feature.get(listenerPropName);
      if (listenerKey) {
        unByKey(listenerKey);
        feature.unset(listenerKey);
      }

      // Remove the select styles
      feature.unset(OLD_STYLES_PROP);
      const styles = getStyles(feature.getStyleFunction(), null);
      const selectStyles = getStyles(selectStyle, feature);
      const featureStyles = styles.slice(0, styles.indexOf(selectStyles[0]));
      feature.setStyle(featureStyles);
    };

    this.onSelectedFeatureChange = (feature, selectStyle) => {
      const featureStyles = getStyles(feature.getStyleFunction());
      const oldStyles = feature.get(OLD_STYLES_PROP);
      if (!oldStyles) {
        return;
      }
      const isStyleChanged = oldStyles.some((style, idx) => style !== featureStyles[idx]);
      if (isStyleChanged) {
        // If the user changes the style of the feature, we reapply the select style.
        this.applySelectStyle(feature, selectStyle);
      }
    };

    /**
     * Select interaction to move features
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectMove = new Select({
      condition: options.moveCondition || singleClick,
      toggleCondition: options.moveToggleCondition || doubleClick,
      filter: (feature, layer) => {
        // If the feature is already selected by modify interaction ignore the selection.
        if (this.isSelectedByModify(feature)) {
          return false;
        }
        return this.selectFilter(feature, layer);
      },
      style: this.selectMoveStyle,
      hitTolerance: this.hitTolerance,
      wrapX: false,
    });

    let moveMapKey;
    this.selectMove.getFeatures().on('add', (evt) => {
      this.selectModify.getFeatures().clear();
      document.addEventListener('keydown', this.deleteFeature);
      this.map.addInteraction(this.moveInteraction);

      moveMapKey = this.map.on('singleclick', (e) => {
        this.unselectInteraction(e, this.selectMove);
      });

      if (this.selectMoveStyle) {
        // Apply the select style dynamically when the feature has its own style.
        this.onSelectFeature(
          evt.element,
          this.selectMoveStyle,
          SELECT_MOVE_ON_CHANGE_KEY,
        );
      }
    });

    this.selectMove.getFeatures().on('remove', (evt) => {
      document.removeEventListener('keydown', this.deleteFeature);
      this.map.removeInteraction(this.moveInteraction);
      unByKey(moveMapKey);
      if (this.selectMoveStyle) {
        // Remove the select style dynamically when the feature had its own style.
        this.onDeselectFeature(
          evt.element,
          this.selectMoveStyle,
          SELECT_MOVE_ON_CHANGE_KEY,
        );
      }
    });

    /**
     * Select interaction to modify features
     * @type {ol.interaction.Select}
     * @private
     */

    this.selectModify = new Select({
      condition: options.modifyCondition || doubleClick,
      toggleCondition: options.modifyToggleCondition || shiftKeyOnly,
      filter: this.selectFilter,
      style: this.selectModifyStyle,
      hitTolerance: this.hitTolerance,
      wrapX: false,
    });
    let modifyMapKey;
    this.selectModify.getFeatures().on('add', (evt) => {
      this.selectMove.getFeatures().clear();
      document.addEventListener('keydown', this.deleteFeature);
      this.map.addInteraction(this.modifyInteraction);

      modifyMapKey = this.map.on('singleclick', (e) => {
        this.unselectInteraction(e, this.selectModify);
      });
      if (this.selectModifyStyle) {
        // Apply the select style dynamically when the feature has its own style.
        this.onSelectFeature(
          evt.element,
          this.selectModifyStyle,
          SELECT_MODIFY_ON_CHANGE_KEY,
        );
      }
    });

    this.selectModify.getFeatures().on('remove', (evt) => {
      document.removeEventListener('keydown', this.deleteFeature);
      this.map.removeInteraction(this.modifyInteraction);
      unByKey(modifyMapKey);
      if (this.selectModifyStyle) {
        this.onDeselectFeature(
          evt.element,
          this.selectModifyStyle,
          SELECT_MODIFY_ON_CHANGE_KEY,
        );
      }
    });

    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new Modify({
      features: this.selectModify.getFeatures(),
      style: this.modifyStyle,
    });

    this.modifyInteraction.on('modifystart', (evt) => {
      this.editor.setEditFeature(evt.features.item(0));
      this.isModifying = true;
    });

    this.modifyInteraction.on('modifyend', () => {
      this.editor.setEditFeature(null);
      this.isModifying = false;
    });

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.moveInteraction = new Pointer({
      handleDownEvent: this.startMoveFeature.bind(this),
      handleDragEvent: this.moveFeature.bind(this),
      handleUpEvent: this.stopMoveFeature.bind(this),
    });
  }

  /**
   * Handle the event of the delete event listener.
   * @param {Event} evt Event.
   * @private
   */
  deleteFeature(evt) {
    // Ignore if the event comes from textarea and input
    if (
      /textarea|input/i.test(evt.target.nodeName) ||
      !this.deleteCondition(evt)
    ) {
      return;
    }

    let features;

    // Choose feature collection to delete
    if (this.selectMove.getFeatures().getArray().length > 0) {
      features = this.selectMove.getFeatures();
    } else if (this.selectModify.getFeatures().getArray().length > 0) {
      features = this.selectModify.getFeatures();
    }

    // Delete selected features using delete key
    if (features) {
      // Loop delete through selected features array
      features.getArray().forEach((feature, i) => {
        this.source.removeFeature(features.getArray()[i]);
      });
      this.changeCursor(null);
      features.clear();

      // Prevent browser history back button action on IE 11
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  isSelectedByMove(feature) {
    return (
      this.selectMove
        .getFeatures()
        .getArray()
        .indexOf(feature) !== -1
    );
  }

  isSelectedByModify(feature) {
    return (
      this.selectModify
        .getFeatures()
        .getArray()
        .indexOf(feature) !== -1
    );
  }

  /**
   * Handle the down event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  startMoveFeature(evt) {
    this.featureToMove = this.getFeatureAtPixel(evt.pixel);
    if (this.featureToMove && this.isSelectedByMove(this.featureToMove)) {
      if (this.featureToMove.getGeometry() instanceof Point) {
        const extent = this.featureToMove.getGeometry().getExtent();
        this.coordinate = getCenter(extent);
      } else {
        this.coordinate = evt.coordinate;
      }
      this.editor.setEditFeature(this.featureToMove);
      this.isMoving = true;
      this.moveInteraction.dispatchEvent(new MoveEvent(
        MoveEventType.MOVESTART,
        this.featureToMove,
        evt,
      ));

      return true;
    }

    return false;
  }

  /**
   * Handle the drag event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  moveFeature(evt) {
    const deltaX = evt.coordinate[0] - this.coordinate[0];
    const deltaY = evt.coordinate[1] - this.coordinate[1];

    this.featureToMove.getGeometry().translate(deltaX, deltaY);
    this.coordinate = evt.coordinate;
  }

  /**
   * Handle the up event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  stopMoveFeature(evt) {
    this.moveInteraction.dispatchEvent(new MoveEvent(
      MoveEventType.MOVEEND,
      this.featureToMove,
      evt,
    ));
    this.coordinate = null;
    this.editor.setEditFeature(null);
    this.isMoving = false;
    this.featureToMove = null;
    return false;
  }

  /**
   * Handle the move event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  cursorHandler(evt) {
    if (this.cursorTimeout) {
      clearTimeout(this.cursorTimeout);
    }
    this.cursorTimeout = setTimeout(() => {
      if (evt.dragging || this.isMoving || this.isModifying) {
        this.changeCursor('grabbing');
        return;
      }

      const feature = this.getFeatureAtPixel(evt.pixel);
      if (!feature) {
        this.changeCursor(this.previousCursor);
        this.previousCursor = null;
        return;
      }

      if (this.isSelectedByMove(feature)) {
        this.changeCursor('grab');
      } else if (this.isSelectedByModify(feature)) {
        if (this.isHoverVertexFeatureAtPixel(evt.pixel)) {
          this.changeCursor('grab');
        } else {
          this.changeCursor(this.previousCursor);
        }
      } else {
        // Feature available for selection.
        this.changeCursor('pointer');
      }
    }, 50);
  }

  /**
   * Deselect features when editing geometries on a single click on map.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  unselectInteraction(evt, interaction) {
    if (!this.map.hasFeatureAtPixel(evt.pixel)) {
      interaction.getFeatures().clear();
    }
  }

  /**
   * Change cursor style.
   * @param {string} cursor New cursor name.
   * @private
   */
  changeCursor(cursor) {
    const element = this.map.getTargetElement();
    if ((element.style.cursor || cursor) && element.style.cursor !== cursor) {
      if (this.previousCursor === null) {
        this.previousCursor = element.style.cursor;
      }
      element.style.cursor = cursor;
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    clearTimeout(this.cursorTimeout);
    this.map.on('pointermove', this.cursorHandler);
    this.map.addInteraction(this.selectMove);
    this.map.addInteraction(this.selectModify);
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    clearTimeout(this.cursorTimeout);
    this.map.un('pointermove', this.cursorHandler);
    this.selectMove.getFeatures().clear();
    this.selectModify.getFeatures().clear();
    this.map.removeInteraction(this.selectMove);
    this.map.removeInteraction(this.selectModify);
    super.deactivate(silent);
  }
}

export default ModifyControl;
