import { Modify } from 'ol/interaction';
import { singleClick } from 'ol/events/condition';
import Control from './control';
import image from '../../img/modify_geometry2.svg';
import SelectMove from '../interaction/selectmove';
import SelectModify from '../interaction/selectmodify';
import Move from '../interaction/move';
import {
  onSelectFeature,
  onDeselectFeature,
  selectModifyStyle,
} from '../helper/styles';
import Delete from '../interaction/delete';

/**
 * Control for modifying geometries.
 * @extends {ole.Control}
 * @alias ole.ModifyControl
 */
class ModifyControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {number} [options.hitTolerance=5] Select tolerance in pixels.
   * @param {ol.Collection<ol.Feature>} [options.features] Destination for drawing.
   * @param {ol.source.Vector} [options.source] Destination for drawing.
   * @param {boolean} [options.useAppendSelectStyle=false] useAppendSelectStyle Append the select style to the feature instead of replacing it.
   * @param {Object} [options.selectMoveOptions] Options for the select interaction used to move features.
   * @param {Object} [options.selectModifyOptions] Options for the select interaction used to modify features.
   * @param {Object} [options.moveInteractionOptions] Options for the move interaction.
   * @param {Object} [options.modifyInteractionOptions] Options for the modify interaction.
   * @param {Object} [options.deleteInteractionOptions] Options for the delete interaction.
   *
   */
  constructor(options) {
    super({
      title: 'Modify geometry',
      className: 'ole-control-modify',
      image,
      ...options,
    });

    /**
     * Buffer around the coordintate clicked in pixels.
     * @type {number}
     * @private
     */
    this.hitTolerance =
      options.hitTolerance === undefined ? 5 : options.hitTolerance;

    /**
     * By default select interactions replace the current feature's style by the select style.
     * If true, the select style is append to the feature's style.
     * @type {boolean}
     * @private
     */
    this.useAppendSelectStyle = !!options.useAppendSelectStyle || false;

    /**
     * Filter function to determine which features are elligible for selection.
     * We exclude features on unmanaged layer(for ex: nodes to delete).
     * @type {function(ol.Feature, ol.layer.Layer)}
     * @private
     */
    this.selectFilter =
      options.selectFilter ||
      ((feature, layer) => {
        if (layer && this.layerFilter) {
          return this.layerFilter(layer);
        }
        return !!layer;
      });

    /**
     *
     * Return features elligible for selection on specific pixel.
     * @type {function(ol.events.MapBrowserEvent)}
     * @private
     */
    this.getFeatureAtPixel = this.getFeatureAtPixel.bind(this);

    /* Cursor management */
    this.previousCursor = null;
    this.cursorTimeout = null;
    this.cursorFilter = options.cursorFilter || (() => true);
    this.cursorHandler = this.cursorHandler.bind(this);

    /* onClickOutsideFeatures management */
    this.onClickOutsideFeatures = this.onClickOutsideFeatures.bind(this);

    /* Interactions */
    this.createSelectMoveInteraction(options.selectMoveOptions);
    this.createSelectModifyInteraction(options.selectModifyOptions);
    this.createModifyInteraction(options.modifyInteractionOptions);
    this.createMoveInteraction(options.moveInteractionOptions);
    this.createDeleteInteraction(options.deleteInteractionOptions);
  }

  /**
   * Create the interaction used to select feature to move.
   * @param {*} options
   * @private
   */
  createSelectMoveInteraction(options = {}) {
    const ON_CHANGE_KEY = 'selectMoveOnChangeKey';
    const useAppendSelectStyle =
      this.useAppendSelectStyle && options && options.style;

    /**
     * Select interaction to move features.
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectMove = new SelectMove({
      filter: (feature, layer) => {
        // If the feature is already selected by modify interaction ignore the selection.
        if (this.isSelectedByModify(feature)) {
          return false;
        }
        return this.selectFilter(feature, layer);
      },
      hitTolerance: this.hitTolerance,
      ...options,
    });

    this.selectMove.getFeatures().on('add', (evt) => {
      this.selectModify.getFeatures().clear();
      this.moveInteraction.setActive(true);
      this.deleteInteraction.setFeatures(this.selectMove.getFeatures());

      if (useAppendSelectStyle) {
        // Append the select style dynamically when the feature has its own style.
        onSelectFeature(evt.element, options.style, ON_CHANGE_KEY);
      }
    });

    this.selectMove.getFeatures().on('remove', (evt) => {
      // Deactive interaction when the select array is empty
      if (this.selectMove.getFeatures().getLength() === 0) {
        this.moveInteraction.setActive(false);
        this.deleteInteraction.setFeatures();
      }

      if (useAppendSelectStyle) {
        // Remove the select style dynamically when the feature had its own style.
        onDeselectFeature(evt.element, options.style, ON_CHANGE_KEY);
      }
    });
  }

  /**
   * Create the interaction used to select feature to modify.
   * @param {*} options
   * @private
   */

  createSelectModifyInteraction(options = {}) {
    const ON_CHANGE_KEY = 'selectModifyOnChangeKey';
    const useAppendSelectStyle =
      this.useAppendSelectStyle && options && options.style;

    /**
     * Select interaction to modify features.
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectModify = new SelectModify({
      filter: this.selectFilter,
      hitTolerance: this.hitTolerance,
      ...options,
      style: useAppendSelectStyle ? null : options.style || selectModifyStyle,
    });

    this.selectModify.getFeatures().on('add', (evt) => {
      this.selectMove.getFeatures().clear();
      this.modifyInteraction.setActive(true);
      this.deleteInteraction.setFeatures(this.selectModify.getFeatures());

      if (useAppendSelectStyle) {
        // Apply the select style dynamically when the feature has its own style.
        onSelectFeature(evt.element, options.style, ON_CHANGE_KEY);
      }
    });

    this.selectModify.getFeatures().on('remove', (evt) => {
      // Deactive interaction when the select array is empty
      if (this.selectModify.getFeatures().getLength() === 0) {
        this.modifyInteraction.setActive(false);
        this.deleteInteraction.setFeatures();
      }

      if (useAppendSelectStyle) {
        // Remove the select style dynamically when the feature had its own style.
        onDeselectFeature(evt.element, options.style, ON_CHANGE_KEY);
      }
    });
  }

  /**
   * Create the interaction used to move feature.
   * @param {*} options
   */
  createMoveInteraction(options = {}) {
    /**
     * @type {ole.interaction.Move}
     * @private
     */
    this.moveInteraction = new Move({
      features: this.selectMove.getFeatures(),
      ...options,
    });

    this.moveInteraction.on('movestart', (evt) => {
      this.editor.setEditFeature(evt.feature);
      this.isMoving = true;
    });

    this.moveInteraction.on('moveend', () => {
      this.editor.setEditFeature(null);
      this.isMoving = false;
    });
    this.moveInteraction.setActive(false);
  }

  /**
   * Create the interaction used to modify vertexes of features.
   * @param {*} options
   */
  createModifyInteraction(options = {}) {
    /**
     * @type {ol.interaction.Modify}
     * @private
     */
    this.modifyInteraction = new Modify({
      features: this.selectModify.getFeatures(),
      deleteCondition: singleClick,
      ...options,
    });

    this.modifyInteraction.on('modifystart', (evt) => {
      this.editor.setEditFeature(evt.features.item(0));
      this.isModifying = true;
    });

    this.modifyInteraction.on('modifyend', () => {
      this.editor.setEditFeature(null);
      this.isModifying = false;
    });
    this.modifyInteraction.setActive(false);
  }

  /**
   * Create the interaction used to delete selected features.
   * @param {*} options
   */
  createDeleteInteraction(options = {}) {
    /**
     * @type {ol.interaction.Delete}
     * @private
     */
    this.deleteInteraction = new Delete({ source: this.source, ...options });

    this.deleteInteraction.on('delete', () => {
      this.changeCursor(null);
    });
  }

  /**
   * Get a selectable feature at a pixel.
   * @param {*} pixel
   */
  getFeatureAtPixel(pixel) {
    const feature = (this.map.getFeaturesAtPixel(pixel, {
      hitTolerance: this.hitTolerance,
      layerFilter: this.layerFilter,
    }) || [])[0];

    if (this.cursorFilter(feature)) {
      return feature;
    }
    return null;
  }

  /**
   * Detect if a vertex is hovered.
   * @param {*} pixel
   */
  isHoverVertexFeatureAtPixel(pixel) {
    let isHoverVertex = false;
    this.map.forEachFeatureAtPixel(
      pixel,
      (feat, layer) => {
        console.log(layer);
        if (!layer) {
          console.log(layer);
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
  }

  isSelectedByMove(feature) {
    return this.selectMove.getFeatures().getArray().indexOf(feature) !== -1;
  }

  isSelectedByModify(feature) {
    return this.selectModify.getFeatures().getArray().indexOf(feature) !== -1;
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
   * Clear selection on map's singleclick event.
   * @param {*} evt
   * @private
   */
  onClickOutsideFeatures(evt) {
    const onFeature = this.getFeatureAtPixel(evt.pixel);
    const onVertex = this.isHoverVertexFeatureAtPixel(evt.pixel);

    if (!onVertex && !onFeature) {
      // Default: Clear selection on click outside features.
      this.selectMove.getFeatures().clear();
      this.selectModify.getFeatures().clear();
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    clearTimeout(this.cursorTimeout);
    this.map.on('singleclick', this.onClickOutsideFeatures);
    // this.map.on('pointermove', this.cursorHandler);
    this.map.addInteraction(this.deleteInteraction);
    this.map.addInteraction(this.selectModify);
    // For the default behvior it's very important to add selectMove after selectModify.
    // It will avoid single/dbleclick mess.
    this.map.addInteraction(this.selectMove);
    this.map.addInteraction(this.moveInteraction);
    this.map.addInteraction(this.modifyInteraction);
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    clearTimeout(this.cursorTimeout);
    this.map.un('singleclick', this.onClickOutsideFeatures);
    // this.map.un('pointermove', this.cursorHandler);
    this.selectMove.getFeatures().clear();
    this.selectModify.getFeatures().clear();

    this.map.removeInteraction(this.modifyInteraction);
    this.map.removeInteraction(this.moveInteraction);
    this.map.removeInteraction(this.selectMove);
    this.map.removeInteraction(this.selectModify);
    this.map.removeInteraction(this.deleteInteraction);
    super.deactivate(silent);
  }
}

export default ModifyControl;
