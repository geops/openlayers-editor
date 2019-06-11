import Control from './control';
import image from '../../img/modify_geometry2.svg';

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
const modifyStyleFunction = () => {
  const style = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: '#05A0FF',
        }),
        stroke: new ol.style.Stroke({ color: '#05A0FF', width: 2 }),
      }),
      geometry: (f) => {
        let coordinates = [];
        if (f.getGeometry().getType() === 'Polygon') {
          f.getGeometry().getCoordinates()[0].forEach((coordinate) => {
            coordinates.push(coordinate);
          });
        } else if (f.getGeometry().getType() === 'LineString') {
          coordinates = f.getGeometry().getCoordinates();
        } else {
          coordinates = [f.getGeometry().getCoordinates()];
        }
        return new ol.geom.MultiPoint(coordinates);
      },
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#05A0FF',
        width: 3,
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)',
      }),
    }),
  ];

  return style;
};

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
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
   * @param {ol.style.Style.StyleLike} [options.modifyStyle] Style used by the Modify interaction.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Modify geometry',
      className: 'ole-control-modify',
      image,
    }, options));

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
    this.hitTolerance = options.hitTolerance || 5;

    this.selectStyle = options.style;
    this.modifyStyle = options.modifyStyle || modifyStyleFunction;

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
        ol.Observable.unByKey(listenerKey);
        feature.unset(listenerKey);
      }

      feature.set(listenerPropName, feature.on('change', (e) => {
        // On change of the feature's style, we re-apply the selected Style.
        this.onSelectedFeatureChange(e.target, selectStyle);
      }));
    };


    this.onDeselectFeature = (feature, selectStyle, listenerPropName) => {
      if (!feature.getStyleFunction()) {
        return;
      }

      const listenerKey = feature.get(listenerPropName);
      if (listenerKey) {
        ol.Observable.unByKey(listenerKey);
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
      const isStyleChanged = oldStyles.some((style, idx) => (style !== featureStyles[idx]));
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
    this.selectMove = new ol.interaction.Select({
      condition: ol.events.condition.singleClick,
      toggleCondition: e => (ol.events.condition.doubleClick(e)),
      layers: this.layerFilter,
      features: this.featuresToMove,
      style: this.selectStyle,
      hitTolerance: this.hitTolerance,
      wrapX: false,
    });

    if (this.selectStyle) {
      // Apply the select style dynamically when the feature has its own style.
      this.selectMove.getFeatures().on('add', (evt) => {
        this.onSelectFeature(evt.element, this.selectStyle, SELECT_MOVE_ON_CHANGE_KEY);
      });

      // Remove the select style dynamically when the feature had its own style.
      this.selectMove.getFeatures().on('remove', (evt) => {
        this.onDeselectFeature(evt.element, this.selectStyle, SELECT_MOVE_ON_CHANGE_KEY);
      });
    }

    this.selectMove.getFeatures().on('add', (evt) => {
      this.selectModify.getFeatures().clear();
      this.changeCursor('move');
      document.addEventListener('keydown', this.deleteFeature.bind(this));
      this.map.addInteraction(this.moveInteraction);
      // Set the target element as initial feature to move.
      this.feature = evt.element;
    });

    this.selectMove.getFeatures().on('remove', () => {
      this.changeCursor(null);
      document.removeEventListener('keydown', this.deleteFeature.bind(this));
      this.map.removeInteraction(this.moveInteraction);
    });


    /**
     * Select interaction to modify features
     * @type {ol.interaction.Select}
     * @private
     */

    this.selectModify = new ol.interaction.Select({
      condition: ol.events.condition.doubleClick,
      toggleCondition: ol.events.condition.shiftKeyOnly,
      layers: this.layerFilter,
      features: this.featuresToModify,
      style: this.modifyStyle,
      hitTolerance: this.hitTolerance,
      wrapX: false,
    });

    this.selectModify.getFeatures().on('add', (evt) => {
      this.selectMove.getFeatures().clear();
      this.changeCursor('grab');
      document.addEventListener('keydown', this.deleteFeature.bind(this));
      this.map.addInteraction(this.modifyInteraction);
      this.map.addEventListener('pointermove', this.modifyCursorHandler.bind(this));
      this.map.addEventListener('click', this.modifyUnselect.bind(this));

      if (this.modifyStyle) {
        // Apply the select style dynamically when the feature has its own style.
        this.onSelectFeature(evt.element, this.modifyStyle, SELECT_MODIFY_ON_CHANGE_KEY);
      }
    });

    this.selectModify.getFeatures().on('remove', (evt) => {
      this.changeCursor(null);
      document.removeEventListener('keydown', this.deleteFeature.bind(this));
      this.map.removeInteraction(this.modifyInteraction);
      this.map.removeEventListener('pointermove', this.modifyCursorHandler.bind(this));

      if (this.modifyStyle) {
        this.onDeselectFeature(evt.element, this.modifyStyle, SELECT_MODIFY_ON_CHANGE_KEY);
      }
    });

    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new ol.interaction.Modify({
      features: this.selectModify.getFeatures(),
    });

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.moveInteraction = new ol.interaction.Pointer({
      handleDownEvent: this.startMoveFeature.bind(this),
      handleDragEvent: this.moveFeature.bind(this),
      handleUpEvent: this.stopMoveFeature.bind(this),
      handleMoveEvent: this.moveCursorHandler.bind(this),
    });
  }

  /**
   * Handle the event of the delete event listener.
   * @param {Event} evt Event.
   * @private
   */
  deleteFeature(evt) {
    let features;

    // Choose feature collection to delete
    if (this.selectMove.getFeatures().getArray().length > 0) {
      features = this.selectMove.getFeatures();
    } else if (this.selectModify.getFeatures().getArray().length > 0) {
      features = this.selectModify.getFeatures();
    }

    // Delete selected features using delete key
    if (evt.key === 'Delete' && features) {
      // Loop delete through selected features array
      features.getArray().forEach((feature, i) => {
        this.source.removeFeature(features.getArray()[i]);
      });
      this.changeCursor(null);
      features.clear();
    }
  }

  /**
   * Handle the down event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  startMoveFeature(evt) {
    if (this.feature && this.selectMove.getFeatures().getArray().indexOf(this.feature) !== -1) {
      if (this.feature.getGeometry() instanceof ol.geom.Point) {
        const extent = this.feature.getGeometry().getExtent();
        this.coordinate = ol.extent.getCenter(extent);
      } else {
        this.coordinate = evt.coordinate;
      }
      this.editor.setEditFeature(this.feature);

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

    this.feature.getGeometry().translate(deltaX, deltaY);
    this.coordinate = evt.coordinate;
  }

  /**
   * Handle the up event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  stopMoveFeature() {
    this.coordinate = null;
    this.feature = null;
    this.editor.setEditFeature(null);
    return false;
  }

  /**
   * Handle the move event of the move interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  moveCursorHandler(evt) {
    this.feature = evt.map.forEachFeatureAtPixel(
      evt.pixel,
      f => f,
      { layerfilter: this.layerFilter },
    );

    if (this.feature && this.selectMove.getFeatures().getArray().indexOf(this.feature) !== -1) {
      this.changeCursor('move');
    } else if (this.previousCursor !== null) {
      this.changeCursor(this.previousCursor);
      this.previousCursor = null;
    }
  }

  /**
   * Handle the cursor behavior when editing geometries.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  modifyCursorHandler(evt) {
    this.modifyActive = this.selectModify.getFeatures().getArray().length > 0;

    if (this.modifyActive) {
      this.feature = this.map.forEachFeatureAtPixel(
        evt.pixel,
        f => f,
        { layerFilter: this.layerFilter },
      );

      if (this.feature && this.selectModify.getFeatures().getArray().indexOf(this.feature) !== -1) {
        this.changeCursor('grab');
      } else if (this.previousCursor !== null) {
        this.changeCursor(this.previousCursor);
        this.previousCursor = null;
      }
    }
  }

  /**
   * Deselect features when editing geometries on a single click on map.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  modifyUnselect(evt) {
    if (!this.map.hasFeatureAtPixel(evt.pixel)) {
      this.selectModify.getFeatures().clear();
    }
  }

  /**
   * Change cursor style.
   * @param {string} cursor New cursor name.
   * @private
   */
  changeCursor(cursor) {
    const element = this.map.getTargetElement();
    if (element.style.cursor !== cursor) {
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
    this.map.addInteraction(this.selectMove);
    this.map.addInteraction(this.selectModify);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    this.selectMove.getFeatures().clear();
    this.selectModify.getFeatures().clear();
    this.map.removeInteraction(this.selectMove);
    this.map.removeInteraction(this.selectModify);
    super.deactivate(silent);
  }
}


export default ModifyControl;
