import Control from './control';
import cadSVG from '../../img/cad.svg';

/**
 * Control with snapping functionality for geometry alignment.
 * @extends {ole.Control}
 * @alias ole.CadControl
 */
class CadControl extends Control {
  /**
   * @param {Object} options Tool options.
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
   */
  constructor(options) {
    super(Object.assign({
      title: 'CAD control',
      className: 'ole-control-cad',
      image: cadSVG,
    }, options));

    /**
     * If true, map units are used for point snapping.
     * The default measurement are pixels.
     */
    this.useMapUnits = options.useMapUnits;

    /**
     * Interaction for handling move events.
     * @type {ol.interactionPointer}
     * @private
     */
    this.pointerInteraction = new ol.interaction.Pointer({
      handleMoveEvent: this.onMove.bind(this),
    });

    /**
     * Layer for drawing snapping geometries.
     * @type {ol.layer.Vector}
     * @private
     */
    this.snapLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: [
        new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: new ol.style.Fill({
              color: '#E8841F',
            }),
            stroke: new ol.style.Stroke({
              width: 1,
              color: '#618496',
            }),
            points: 4,
            radius: 5,
            radius2: 0,
            angle: Math.PI / 4,
          }),
          stroke: new ol.style.Stroke({
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
    this.linesLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
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
    this.snapTolerance = options.snapTolerance || 10;

    /**
     * Interaction for snapping
     * @type {ol.interaction.Snap}
     * @private
     */
    this.snapInteraction = new ol.interaction.Snap({
      pixelTolerance: this.snapTolerance,
      source: this.snapLayer.getSource(),
    });

    /**
     * Whether to show the snap points.
     * @type {Boolean}
     * @private
     */
    this.showSnapPoints = options.showSnapPoints;

    /**
     * Initial distance of snap points.
     * @type {Number}
     * @private
     */
    this.snapPointDist = options.snapPointDist || 30;

    /**
     * Whether to show snap lines.
     * @type {Boolean}
     * @private
     */
    this.showSnapLines = options.showSnapLines;

    if (this.showSnapLines === 'undefined') {
      this.showSnapLines = true;
    }

    /**
     * Template for dialog.
     * @type {string}
     */
    const distLabel = this.useMapUnits ? 'map units' : 'px';
    this.dialogTemplate = `
      <div>
        <input
          id="aux-cb"
          type="radio"
          name="radioBtn"
          ${this.showSnapLines ? 'checked' : ''}
        >
        <label>Show snap lines</label>
      </div>
      <div>
        <input
          id="dist-cb"
          type="radio"
          name="radioBtn"
          ${this.showSnapPoints ? 'checked' : ''}
        >
        <label>Show snap points. Distance (${distLabel}):</label>
        <input type="text" id="width-input" value="${this.snapPointDist}">
      </div>
    `;

    this.standalone = false;
  }

  /**
   * @inheritdoc
   */
  setMap(map) {
    super.setMap(map);
    this.map.addLayer(this.snapLayer);
    this.map.addLayer(this.linesLayer);

    // Ensure that the snap interaction is at the last position
    // as it must be the first to handle the  pointermove event.
    this.map.getInteractions().on('change:length', (e) => {
      const pos = e.target.getArray().indexOf(this.snapInteraction);

      if (this.active && pos > -1 && pos !== e.target.getLength() - 1) {
        this.deactivate();
        this.activate();
      }
    });
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

    if (this.showSnapLines) {
      this.drawSnapLines(features, evt.coordinate);
    }

    if (this.showSnapPoints && features.length) {
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

    this.source.forEachFeatureInExtent(ext, (f) => {
      const cCoord = f.getGeometry().getClosestPoint(coordinate);
      const dx = cCoord[0] - coordinate[0];
      const dy = cCoord[1] - coordinate[1];
      const dist = (dx * dx) + (dy * dy);
      featureDict[dist] = f;
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

      if (geom instanceof ol.geom.Point) {
        auxCoords.push(featureCoord);
      } else {
        // filling snapLayer with features vertex
        if (geom instanceof ol.geom.LineString) {
          for (let j = 0; j < featureCoord.length; j += 1) {
            auxCoords.push(featureCoord[j]);
          }
        } else if (geom instanceof ol.geom.Polygon) {
          for (let j = 0; j < featureCoord[0].length; j += 1) {
            auxCoords.push(featureCoord[0][j]);
          }
        }

        // filling auxCoords
        const coords = ol.geom.Polygon.fromExtent(geom.getExtent())
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
        const g = new ol.geom.LineString(lineCoords);
        this.snapLayer.getSource().addFeature(new ol.Feature(g));
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
        const snapGeom = new ol.geom.Point(snapPt);
        this.snapLayer.getSource().addFeature(new ol.Feature(snapGeom));
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

    if (this.useMapUnits) {
      snapCoords = [
        [featCoord[0] - this.snapPointDist, featCoord[1]],
        [featCoord[0] + this.snapPointDist, featCoord[1]],
        [featCoord[0], featCoord[1] - this.snapPointDist],
        [featCoord[0], featCoord[1] + this.snapPointDist],
      ];
    } else {
      const snapPx = [
        [px[0] - this.snapPointDist, px[1]],
        [px[0] + this.snapPointDist, px[1]],
        [px[0], px[1] - this.snapPointDist],
        [px[0], px[1] + this.snapPointDist],
      ];

      for (let j = 0; j < snapPx.length; j += 1) {
        snapCoords.push(this.map.getCoordinateFromPixel(snapPx[j]));
      }
    }

    const snapGeom = new ol.geom.MultiPoint(snapCoords);
    this.snapLayer.getSource().addFeature(new ol.Feature(snapGeom));
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);

    document.getElementById('aux-cb').addEventListener('change', (evt) => {
      this.showSnapLines = evt.target.checked;
      this.showSnapPoints = !this.showSnapLines;
    });

    document.getElementById('dist-cb').addEventListener('change', (evt) => {
      this.showSnapPoints = evt.target.checked;
      this.showSnapLines = !this.showSnapPoints;
    });

    document.getElementById('width-input').addEventListener('keyup', (evt) => {
      if (parseFloat(evt.target.value)) {
        this.snapPointDist = parseFloat(evt.target.value);
      }
    });
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    super.deactivate();
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
  }
}

export default CadControl;
