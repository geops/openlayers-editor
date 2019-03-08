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
   * @prram {Object} [options] Control options.
   * @param {ol.source.Vector} [source] vector to delete.
   * @param {boolean} [multi] select multiple if set to true
   *   (default is false).
   * @param {ol.style.Style.StyleLike} [style] Style used when a feature is selected.
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
      source: this.source,
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
