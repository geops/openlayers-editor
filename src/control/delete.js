import Control from './control';
import delSVG from '../../img/delete.svg';

/**
 * Control for deleting geometries.
 * @extends {ole.Control}
 * @alias ole.DeleteControl
 */
class DeleteControl extends Control {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {ol.source.Vector} [options.source] vector to delete.
   * @param {boolean} [options.multi] select multiple if set to true
   *   (default is false).
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Delete geometry',
      className: 'ole-control-delete',
      image: delSVG,
    }, options));

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new ol.interaction.Select({
      layers: this.layerFilter,
      multi: options.multi || false,
      style: options.style,
    });

    /**
     * Select Interaction to clear and remove features
     * @private
     */
    this.selectInteraction.on('select', (evt) => {
      evt.selected.forEach((f) => {
        this.source.removeFeature(f);
        this.selectInteraction.getFeatures().clear();
      });
    });
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate(silent);
  }
}

export default DeleteControl;
