import { RegularShape, Style, Fill, Stroke } from 'ol/style';
import { Point, LineString, Polygon, MultiPoint } from 'ol/geom';
import { fromExtent } from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import Vector from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Pointer, Snap } from 'ol/interaction';
import Control from './control';
import cadSVG from '../../img/cad.svg';
import SnapEvent, { SnapEventType } from '../helper/snap-event';

/**
 * Control with snapping functionality for geometry alignment.
 * @extends {ole.Control}
 * @alias ole.CadControl
 */
class CadControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {Function} [options.filter] Returns an array containing the features
   *   to include for CAD (takes the source as a single argument).
   * @param {Number} [options.snapTolerance] Snap tolerance in pixel
   *   for snap lines. Default is 10.
   * @param {Boolean} [options.showSnapLines] Whether to show
   *   snap lines (default is true).
   * @param {Boolean} [options.showSnapPoints] Whether to show
   *  snap points around the closest feature.
   * @param {Number} [options.snapPointDist] Distance of the
   *   snap points (default is 30).
   * @param {Boolean} [options.useMapUnits] Whether to use map units
   *   as measurement for point snapping. Default is false (pixel are used).
   * @param {ol.style.Style.StyleLike} [options.snapStyle] Style used for the snap layer.
   * @param {ol.style.Style.StyleLike} [options.linesStyle] Style used for the lines layer.
   */
  constructor(options) {
    super(Object.assign({
      title: 'CAD control',
      className: 'ole-control-cad',
      image: cadSVG,
      showSnapPoints: true,
      showSnapLines: false,
      snapPointDist: 10,
    }, options));

    /**
     * Interaction for handling move events.
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.pointerInteraction = new Pointer({
      handleMoveEvent: this.onMove.bind(this),
    });

    /**
     * Layer for drawing snapping geometries.
     * @type {ol.layer.Vector}
     * @private
     */
    this.snapLayer = new Vector({
      source: new VectorSource(),
      style: options.snapStyle || [
        new Style({
          image: new RegularShape({
            fill: new Fill({
              color: '#E8841F',
            }),
            stroke: new Stroke({
              width: 1,
              color: '#618496',
            }),
            points: 4,
            radius: 5,
            radius2: 0,
            angle: Math.PI / 4,
          }),
          stroke: new Stroke({
            width: 1,
            lineDash: [5, 10],
            color: '#618496',
          }),
        }),
      ],
    });

    /**
     * Layer for colored lines indicating
     * intesection point between snapping lines.
     * @type {ol.layer.Vector}
     * @private
     */
    this.linesLayer = new Vector({
      source: new VectorSource(),
      style: options.linesStyle || [
        new Style({
          stroke: new Stroke({
            width: 1,
            lineDash: [5, 10],
            color: '#FF530D',
          }),
        }),
      ],
    });

    /**
     * Snap tolerance in pixel.
     * @type {Number}
     * @private
     */
    this.snapTolerance = options.snapTolerance === undefined ? 10 : options.snapTolerance;

    /**
     * Filter the features to snap with.
     * @type {Function}
     * @private
     */
    this.filter = options.filter || null;

    /**
     * Interaction for snapping
     * @type {ol.interaction.Snap}
     * @private
     */
    this.snapInteraction = new Snap({
      pixelTolerance: this.snapTolerance,
      source: this.snapLayer.getSource(),
    });

    this.standalone = false;
  }

  /**
   * @inheritdoc
   */
  getDialogTemplate() {
    const distLabel = this.properties.useMapUnits ? 'map units' : 'px';

    return `
      <div>
        <input
          id="aux-cb"
          type="radio"
          name="radioBtn"
          ${this.properties.showSnapLines ? 'checked' : ''}
        >
        <label>Show snap lines</label>
      </div>
      <div>
        <input
          id="dist-cb"
          type="radio"
          name="radioBtn"
          ${this.properties.showSnapPoints ? 'checked' : ''}
        >
        <label>Show snap points. Distance (${distLabel}):</label>
        <input type="text" id="width-input"
          value="${this.properties.snapPointDist}">
      </div>
    `;
  }

  /**
   * @inheritdoc
   */
  setMap(map) {
    super.setMap(map);

    // Ensure that the snap interaction is at the last position
    // as it must be the first to handle the  pointermove event.
    this.map.getInteractions().on('add', ((e) => {
      const pos = e.target.getArray().indexOf(this.snapInteraction);

      if (this.snapInteraction.getActive() && pos > -1 && pos !== e.target.getLength() - 1) {
        this.deactivate(true);
        this.activate(true);
      }
      // eslint-disable-next-line no-extra-bind
    }).bind(this));
  }

  /**
   * Handle move event.
   * @private
   * @param {ol.MapBrowserEvent} evt Move event.
   */
  onMove(evt) {
    const features = this.getClosestFeatures(evt.coordinate, 5);

    // Don't snap on the edit feature
    const editFeature = this.editor.getEditFeature();
    if (editFeature && features.indexOf(editFeature) > -1) {
      features.splice(features.indexOf(editFeature), 1);
    }

    this.linesLayer.getSource().clear();
    this.snapLayer.getSource().clear();

    this.pointerInteraction.dispatchEvent(new SnapEvent(
      SnapEventType.SNAP,
      features.length ? features : null,
      evt,
    ));

    if (this.properties.showSnapLines) {
      this.drawSnapLines(features, evt.coordinate);
    }

    if (this.properties.showSnapPoints && features.length) {
      this.drawSnapPoints(evt.coordinate, features[0]);
    }
  }

  /**
   * Returns a list of the {num} closest features
   * to a given coordinate.
   * @private
   * @param {ol.Coordinate} coordinate Coordinate.
   * @param {Number} numFeatures Number of features to search.
   * @returns {Array.<ol.Feature>} List of closest features.
   */
  getClosestFeatures(coordinate, numFeatures) {
    const num = numFeatures || 1;
    const ext = [-Infinity, -Infinity, Infinity, Infinity];
    const featureDict = {};

    const pushSnapFeatures = (f) => {
      const cCoord = f.getGeometry().getClosestPoint(coordinate);
      const dx = cCoord[0] - coordinate[0];
      const dy = cCoord[1] - coordinate[1];
      const dist = (dx * dx) + (dy * dy);
      featureDict[dist] = f;
    };

    this.source.forEachFeatureInExtent(ext, (f) => {
      if (!this.filter || (this.filter && this.filter(f))) {
        pushSnapFeatures(f);
      }
    });

    const dists = Object.keys(featureDict);
    const features = [];
    const count = Math.min(dists.length, num);

    dists.sort((a, b) => a - b);

    for (let i = 0; i < count; i += 1) {
      features.push(featureDict[dists[i]]);
    }

    return features;
  }

  /**
   * Draws snap lines by building the extent for
   * a pair of features.
   * @private
   * @param {Array.<ol.Feature>} features List of features.
   * @param {ol.Coordinate} coordinate Mouse pointer coordinate.
   */
  drawSnapLines(features, coordinate) {
    let auxCoords = [];

    for (let i = 0; i < features.length; i += 1) {
      const geom = features[i].getGeometry();
      const featureCoord = geom.getCoordinates();

      if (geom instanceof Point) {
        auxCoords.push(featureCoord);
      } else {
        // filling snapLayer with features vertex
        if (geom instanceof LineString) {
          for (let j = 0; j < featureCoord.length; j += 1) {
            auxCoords.push(featureCoord[j]);
          }
        } else if (geom instanceof Polygon) {
          for (let j = 0; j < featureCoord[0].length; j += 1) {
            auxCoords.push(featureCoord[0][j]);
          }
        }

        // filling auxCoords
        const coords = fromExtent(geom.getExtent())
          .getCoordinates()[0];
        auxCoords = auxCoords.concat(coords);
      }
    }

    const px = this.map.getPixelFromCoordinate(coordinate);
    let lineCoords = null;

    for (let i = 0; i < auxCoords.length; i += 1) {
      const tol = this.snapTolerance;
      const auxPx = this.map.getPixelFromCoordinate(auxCoords[i]);
      const drawVLine = (px[0] > auxPx[0] - (this.snapTolerance / 2)) &&
        (px[0] < auxPx[0] + (this.snapTolerance / 2));
      const drawHLine = (px[1] > auxPx[1] - (this.snapTolerance / 2)) &&
        (px[1] < auxPx[1] + (this.snapTolerance / 2));

      if (drawVLine) {
        let newY = px[1];
        newY += (px[1] < auxPx[1]) ? -tol * 2 : tol * 2;
        const newPt = this.map.getCoordinateFromPixel([auxPx[0], newY]);
        lineCoords = [[auxCoords[i][0], newPt[1]], auxCoords[i]];
      } else if (drawHLine) {
        let newX = px[0];
        newX += (px[0] < auxPx[0]) ? -tol * 2 : tol * 2;
        const newPt = this.map.getCoordinateFromPixel([newX, auxPx[1]]);
        lineCoords = [[newPt[0], auxCoords[i][1]], auxCoords[i]];
      }

      if (lineCoords) {
        const g = new LineString(lineCoords);
        this.snapLayer.getSource().addFeature(new Feature(g));
      }
    }

    let vertArray = null;
    let horiArray = null;
    const snapFeatures = this.snapLayer.getSource().getFeatures();

    if (snapFeatures.length) {
      snapFeatures.forEach((feature) => {
        const featureCoord = feature.getGeometry().getCoordinates();
        const x0 = featureCoord[0][0];
        const x1 = featureCoord[1][0];
        const y0 = featureCoord[0][1];
        const y1 = featureCoord[1][1];

        if (x0 === x1) {
          vertArray = x0;
        }
        if (y0 === y1) {
          horiArray = y0;
        }
      });

      const snapPt = [];

      if (vertArray && horiArray) {
        snapPt.push(vertArray);
        snapPt.push(horiArray);
        this.linesLayer.getSource().addFeatures(snapFeatures);

        this.snapLayer.getSource().clear();
        const snapGeom = new Point(snapPt);
        this.snapLayer.getSource().addFeature(new Feature(snapGeom));
      }
    }
  }

  /**
   * Adds snap points to the snapping layer.
   * @private
   * @param {ol.Coordinate} coordinateMouse cursor coordinate.
   * @param {ol.eaturee} feature Feature to draw the snap points for.
   */
  drawSnapPoints(coordinate, feature) {
    const featCoord = feature.getGeometry().getClosestPoint(coordinate);

    const px = this.map.getPixelFromCoordinate(featCoord);
    let snapCoords = [];

    if (this.properties.useMapUnits) {
      snapCoords = [
        [featCoord[0] - this.properties.snapPointDist, featCoord[1]],
        [featCoord[0] + this.properties.snapPointDist, featCoord[1]],
        [featCoord[0], featCoord[1] - this.properties.snapPointDist],
        [featCoord[0], featCoord[1] + this.properties.snapPointDist],
      ];
    } else {
      const snapPx = [
        [px[0] - this.properties.snapPointDist, px[1]],
        [px[0] + this.properties.snapPointDist, px[1]],
        [px[0], px[1] - this.properties.snapPointDist],
        [px[0], px[1] + this.properties.snapPointDist],
      ];

      for (let j = 0; j < snapPx.length; j += 1) {
        snapCoords.push(this.map.getCoordinateFromPixel(snapPx[j]));
      }
    }

    const snapGeom = new MultiPoint(snapCoords);
    this.snapLayer.getSource().addFeature(new Feature(snapGeom));
  }

  /**
   * @inheritdoc
   */
  activate(silent) {
    super.activate(silent);
    this.snapLayer.setMap(this.map);
    this.linesLayer.setMap(this.map);
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);

    document.getElementById('aux-cb').addEventListener('change', (evt) => {
      this.setProperties({
        showSnapLines: evt.target.checked,
        showSnapPoints: !evt.target.checked,
      });
    });

    document.getElementById('dist-cb').addEventListener('change', (evt) => {
      this.setProperties({
        showSnapPoints: evt.target.checked,
        showSnapLines: !evt.target.checked,
      });
    });

    document.getElementById('width-input').addEventListener('keyup', (evt) => {
      const snapPointDist = parseFloat(evt.target.value);
      if (snapPointDist) {
        this.setProperties({ snapPointDist });
      }
    });
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    super.deactivate(silent);
    this.snapLayer.setMap(null);
    this.linesLayer.setMap(null);
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
  }
}

export default CadControl;
