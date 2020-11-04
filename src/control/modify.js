import { Modify } from 'ol/interaction';
import { click } from 'ol/events/condition';
import Control from './control';
import image from '../../img/modify_geometry2.svg';
import SelectMove from '../interaction/selectmove';
import SelectModify from '../interaction/selectmodify';
import Move from '../interaction/move';
import { onSelectFeature, onDeselectFeature } from '../helper/styles';
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

    const SELECT_MOVE_ON_CHANGE_KEY = 'selectMoveOnChangeKey';
    const SELECT_MODIFY_ON_CHANGE_KEY = 'selectModifyOnChangeKey';

    /**
     * @type {string}
     * @private
     */
    this.previousCursor = null;

    /**
     * @type {number}
     * @private
     */
    this.hitTolerance =
      options.hitTolerance === undefined ? 5 : options.hitTolerance;

    this.getFeatureAtPixel = this.getFeatureAtPixel.bind(this);

    this.cursorHandler = this.cursorHandler.bind(this);

    this.cursorTimeout = null;

    // this.deleteNodeCondition = options.deleteNodeCondition || click;

    this.selectFilter =
      options.selectFilter ||
      ((feature, layer) => {
        if (layer && this.layerFilter) {
          return this.layerFilter(layer);
        }
        return true;
      });

    this.getFeatureFilter = options.getFeatureFilter || (() => true);

    // this.onMapClick = options.onMapClick;

    /* Interactions */
    /**
     * Select interaction to move features
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
      ...options.selectMoveOptions,
    });

    // let moveMapKey;
    this.selectMove.getFeatures().on('add', (evt) => {
      this.selectModify.getFeatures().clear();
      this.map.addInteraction(this.moveInteraction);
      this.deleteInteraction.setFeatures(this.selectMove.getFeatures());

      // Remove key before adding to prevent listener stacking
      // unByKey(moveMapKey);
      // moveMapKey = this.map.on('singleclick', (e) => {
      //   console.log('singleclick move');
      //   this.unselectInteraction(e, this.selectMove);
      // });

      if (this.selectMoveStyle) {
        // Apply the select style dynamically when the feature has its own style.
        onSelectFeature(
          evt.element,
          this.selectMoveStyle,
          SELECT_MOVE_ON_CHANGE_KEY,
        );
      }
    });

    this.selectMove.getFeatures().on('remove', (evt) => {
      this.map.removeInteraction(this.moveInteraction);
      this.deleteInteraction.setFeatures();

      // unByKey(moveMapKey);
      if (this.selectMoveStyle) {
        // Remove the select style dynamically when the feature had its own style.
        onDeselectFeature(
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
    this.selectModify = new SelectModify({
      filter: this.selectFilter,
      hitTolerance: this.hitTolerance,
      ...options.selectModifyOptions,
    });
    // let modifyMapKey;
    this.selectModify.getFeatures().on('add', (evt) => {
      this.selectMove.getFeatures().clear();
      this.map.addInteraction(this.modifyInteraction);
      this.deleteInteraction.setFeatures(this.selectModify.getFeatures());

      // Remove key before adding to prevent listener stacking
      // unByKey(modifyMapKey);
      // modifyMapKey = this.map.on('singleclick', (e) => {
      //   console.log('singleclick modify');
      //   this.unselectInteraction(e, this.selectModify);
      // });

      if (this.selectModifyStyle) {
        // Apply the select style dynamically when the feature has its own style.
        onSelectFeature(
          evt.element,
          this.selectModifyStyle,
          SELECT_MODIFY_ON_CHANGE_KEY,
        );
      }
    });

    this.selectModify.getFeatures().on('remove', (evt) => {
      this.map.removeInteraction(this.modifyInteraction);
      // unByKey(modifyMapKey);
      if (this.selectModifyStyle) {
        onDeselectFeature(
          evt.element,
          this.selectModifyStyle,
          SELECT_MODIFY_ON_CHANGE_KEY,
        );
      }
    });

    this.createModifyInteraction(options.modifyInteractionOptions);
    this.createMoveInteraction(options.moveInteractionOptions);
    this.createDeleteInteraction(options.deleteInteractionOptions);
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
      deleteCondition: click,
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

    if (this.getFeatureFilter(feature)) {
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

  // /**
  //  * Deselect features when editing geometries on a single click on map.
  //  * @param {ol.MapBrowserEvent} evt Event.
  //  * @private
  //  */
  // unselectInteraction(evt, interaction) {
  // Override unselect when a node is deleted with a click
  // if (this.deleteNode) {
  //   this.deleteNode = false;
  //   return;
  // }
  // if (!this.map.hasFeatureAtPixel(evt.pixel)) {
  //   // Apply onMapClick from options if defined
  //   if (this.onMapClick) {
  //     evt.stopPropagation();
  //     evt.preventDefault();
  //     this.onMapClick(evt, this);
  //     return;
  //   }
  //   // Default: Clear selection
  //   interaction.getFeatures().clear();
  // }
  // }

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
    this.map.addInteraction(this.deleteInteraction);
    this.map.addInteraction(this.selectModify);
    // For the default behvior it's very important to add selectMove after selectModify.
    // It will avoid single/dbleclick mess.
    this.map.addInteraction(this.selectMove);
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    clearTimeout(this.cursorTimeout);
    this.map.un('pointermove', this.cursorHandler);
    this.selectMove.getFeatures().clear();
    this.selectModify.getFeatures().clear();

    this.map.removeInteraction(this.deleteInteraction);
    this.map.removeInteraction(this.selectMove);
    this.map.removeInteraction(this.selectModify);
    super.deactivate(silent);
  }
}

export default ModifyControl;
