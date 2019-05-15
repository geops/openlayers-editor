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

    this.selectStyle = options.style;

    /**
     * Select interaction to move features
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectMove = new ol.interaction.Select({
      condition: ol.events.condition.singleClick,
      toggleCondition: ol.events.condition.shiftKeyOnly,
      layers: this.layerFilter,
      features: this.featuresToMove,
    });

    if (options.style) {
      // Apply the select style dynamically when the feature has its own style.
      this.selectMove.getFeatures().on('add', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Append the select style to the feature's style
        const feature = evt.element;
        const featureStyles = getStyles(feature.getStyleFunction());
        const selectStyles = getStyles(options.style, feature);
        const styles = featureStyles.concat(selectStyles);
        evt.element.setStyle(styles);
      });

      // Remove the select style dynamically when the feature had its own style.
      this.selectMove.getFeatures().on('remove', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Remove the select styles
        const feature = evt.element;
        const styles = getStyles(feature.getStyleFunction(), null);
        const selectStyles = getStyles(options.style, feature);
        const featureStyles = styles.slice(0, styles.indexOf(selectStyles[0]));
        evt.element.setStyle(featureStyles);
      });
    }

    this.selectMove.getFeatures().on('add', () => {
      this.selectModify.getFeatures().clear();
      this.changeCursor('move');
      document.addEventListener('keydown', this.deleteFeature.bind(this));
      this.map.addInteraction(this.moveInteraction);
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
      style: this.selectStyle,
    });

    if (options.style) {
      // Apply the select style dynamically when the feature has its own style.
      this.selectModify.getFeatures().on('add', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Append the select style to the feature's style
        const feature = evt.element;
        const featureStyles = getStyles(feature.getStyleFunction());
        const selectStyles = getStyles(options.style, feature);
        const styles = featureStyles.concat(selectStyles);
        evt.element.setStyle(styles);
      });

      // Remove the select style dynamically when the feature had its own style.
      this.selectModify.getFeatures().on('remove', (evt) => {
        if (!evt.element.getStyleFunction()) {
          return;
        }

        // Remove the select styles
        const feature = evt.element;
        const styles = getStyles(feature.getStyleFunction(), null);
        const selectStyles = getStyles(options.style, feature);
        const featureStyles = styles.slice(0, styles.indexOf(selectStyles[0]));
        evt.element.setStyle(featureStyles);
      });
    }

    this.selectModify.getFeatures().on('add', () => {
      this.selectMove.getFeatures().clear();
      this.changeCursor('grab');
      document.addEventListener('keydown', this.deleteFeature.bind(this));
      this.map.addInteraction(this.modifyInteraction);
      this.map.addEventListener('pointermove', this.modifyCursorHandler.bind(this));
      this.map.addEventListener('click', this.modifyUnselect.bind(this));
    });

    this.selectModify.getFeatures().on('remove', () => {
      this.changeCursor(null);
      document.removeEventListener('keydown', this.deleteFeature.bind(this));
      this.map.removeInteraction(this.modifyInteraction);
      this.map.removeEventListener('pointermove', this.modifyCursorHandler.bind(this));
    });

    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new ol.interaction.Modify({
      features: this.selectModify.getFeatures(),
      style: options.modifyStyle,
    });

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.moveInteraction = new ol.interaction.Pointer({
      handleDownEvent: this.startMoveFeature.bind(this),
      handleDragEvent: this.moveFeature.bind(this),
      handleUpEvent: this.stopMoveFeature.bind(this),
      handleMoveEvent: this.selectFeature.bind(this),
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
  selectFeature(evt) {
    if (this.feature) {
      // Remove the select style dynamically when the feature had its own style.
      if (this.feature.getStyleFunction()) {
        const styles = getStyles(this.feature.getStyleFunction(), null);
        const selectStyles = getStyles(this.selectStyle, this.feature);
        this.feature.setStyle(styles.slice(0, styles.indexOf(selectStyles[0])));
      }
    }

    this.feature = evt.map.forEachFeatureAtPixel(
      evt.pixel,
      f => f,
      { layerfilter: this.layerFilter },
    );

    // Apply the select style dynamically when the feature has its own style.
    if (this.feature && this.feature.getStyleFunction()) {
      const featureStyles = getStyles(this.feature.getStyleFunction());
      const selectStyles = getStyles(this.selectStyle, this.feature);
      this.feature.setStyle(featureStyles.concat(selectStyles));
    }

    this.editor.setEditFeature(this.feature);

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
