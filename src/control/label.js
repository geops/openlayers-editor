import { Draw } from 'ol/interaction';
import { Style, Text } from 'ol/style';
import Control from './control';
import Constants from '../helper/constants';
import drawLabelSVG from '../../img/draw_label.svg';

/**
 * Control for drawing label features.
 * @extends {ole.Control}
 * @alias ole.DrawControl
 */
class LabelControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {Style.StyleLike} [options.style] Style used for the draw interaction.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Label',
      className: 'ole-control-draw',
      image: drawLabelSVG,
      defaultLabelText: 'New label',
      text: '',
    }, options));


    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.labelInteraction = new Draw({
      type: 'Point',
      features: options.features,
      source: options.source,
      style: () =>
        new Style({
          text: new Text({
            text: this.getLabelText(),
            zIndex: Infinity,
            font: '14px sans-serif',
          }),
        }),
      stopClick: true,
    });

    /**
   * Computes the text to be set on the label feature.
   * @private
   */
    this.getLabelText = () =>
      this.properties.text || this.properties.defaultLabelText;

    /**
     * @callback drawEndCallback
     * @param {event} [event]
     * @private
     */
    this.drawEndCallback = (event) => {
      event.feature.set(Constants.LABEL_PROP_NAME, this.getLabelText());
      options.source.changed();
    };
  }

  /**
   * @inheritdoc
   */
  getDialogTemplate() {
    return `
        <label>Label text: &nbsp;
        <input type="text" id="label-text"
            value="${this.properties.text}"
        />
        </label>
        <input type="button" value="OK" id="label-text-btn" />
    `;
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    document.getElementById('label-text-btn').addEventListener('click', () => {
      const input = document.getElementById('label-text');
      this.setProperties({ text: input.value });
      // keep the focus in the input control
      input.focus();
    });

    document.getElementById('label-text').focus();

    this.labelInteraction.on('drawend', this.drawEndCallback);
    this.map.addInteraction(this.labelInteraction);
  }

  /**
     * @inheritdoc
   */
  deactivate(silent) {
    this.setProperties({ text: '' });
    this.labelInteraction.un('drawend', this.drawEndCallback);
    this.map.removeInteraction(this.labelInteraction);
    super.deactivate(silent);
  }
}

export default LabelControl;
