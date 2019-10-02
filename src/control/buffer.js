import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser';
import { BufferOp } from 'jsts/org/locationtech/jts/operation/buffer';
import LinearRing from 'ol/geom/LinearRing';
import {
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from 'ol/geom';
import { Select } from '../interaction';
import Control from './control';
import bufferSVG from '../../img/buffer.svg';

/**
 * Control for creating buffers.
 * @extends {ole.Control}
 * @alias ole.BufferControl
 */
class BufferControl extends Control {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {number} [options.hitTolerance] Select tolerance in pixels
   *   (default is 10)
   * @param {boolean} [options.multi] Allow selection of multiple geometries
   *   (default is false).
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
   */
  constructor(options) {
    super(Object.assign({
      title: 'Buffer geometry',
      className: 'ole-control-buffer',
      image: bufferSVG,
      buffer: 50,
    }, options));

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new Select({
      layers: this.layerFilter,
      hitTolerance: options.hitTolerance === undefined ?
        10 : options.hitTolerance,
      multi: typeof (options.multi) === 'undefined' ? true : options.multi,
      style: options.style,
    });
  }

  /**
   * @inheritdoc
   */
  getDialogTemplate() {
    return `
      <label>Buffer width: &nbsp;
        <input type="text" id="buffer-width"
          value="${this.properties.buffer}"
        />
      </label>
      <input type="button" value="OK" id="buffer-btn" />
    `;
  }

  /**
   * Apply a buffer for seleted features.
   * @param {Number} width Buffer width in map units.
   */
  buffer(width) {
    const parser = new OL3Parser();
    parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiPoint,
      MultiLineString,
      MultiPolygon,
    );

    const features = this.selectInteraction.getFeatures().getArray();
    for (let i = 0; i < features.length; i += 1) {
      const jstsGeom = parser.read(features[i].getGeometry());
      const bo = new BufferOp(jstsGeom);
      const buffered = bo.getResultGeometry(width);
      features[i].setGeometry(parser.write(buffered));
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    super.activate();

    document.getElementById('buffer-width').addEventListener('change', (e) => {
      this.setProperties({ buffer: e.target.value });
    });

    document.getElementById('buffer-btn').addEventListener('click', () => {
      const input = document.getElementById('buffer-width');
      const width = parseInt(input.value, 10);

      if (width) {
        this.buffer(width);
      }
    });
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate();
  }
}

export default BufferControl;
