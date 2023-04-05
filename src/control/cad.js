import { RegularShape, Style, Fill, Stroke } from 'ol/style';
import { Point, LineString, Polygon, MultiPoint } from 'ol/geom';
import Feature from 'ol/Feature';
import Vector from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Pointer, Snap } from 'ol/interaction';
import { OverlayOp } from 'jsts/org/locationtech/jts/operation/overlay';
import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser';
import Control from './control';
import cadSVG from '../../img/cad.svg';
import SnapEvent, { SnapEventType } from '../event/snap-event';
import getProjectedPoint from '../helper/getProjectedPoint';
import getEquationOfLine from '../helper/getEquatioinOfLine';

const parser = new OL3Parser();
parser.inject(Point, LineString, Polygon, MultiPoint);

/**
 * Control with snapping functionality for geometry alignment.
 * @extends {ole.Control}
 * @alias ole.CadControl
 */
class CadControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {Function} [options.drawCustomSnapLines] Allow to draw more snapping lines using selected corrdinaites.
   * @param {Function} [options.filter] Returns an array containing the features
   *   to include for CAD (takes the source as a single argument).
   * @param {Number} [options.nbClosestFeatures] Number of features to use for snapping (closest first). Default is 5.
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
   *
   */
  constructor(options) {
    super({
      title: 'CAD control',
      className: 'ole-control-cad',
      image: cadSVG,
      showSnapPoints: true,
      showSnapLines: false,
      snapPointDist: 10,
      ...options,
    });

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
     * Function to draw more snapping lines.
     * @type {Function}
     * @private
     */
    this.drawCustomSnapLines = options.drawCustomSnapLines;

    /**
     * Number of features to use for snapping (closest first). Default is 5.
     * @type {Number}
     * @private
     */
    this.nbClosestFeatures =
      options.nbClosestFeatures === undefined ? 5 : options.nbClosestFeatures;

    /**
     * Snap tolerance in pixel.
     * @type {Number}
     * @private
     */
    this.snapTolerance =
      options.snapTolerance === undefined ? 10 : options.snapTolerance;

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
   * Removes the closest node to a given coordinate from a given geometry.
   * @private
   * @param {ol.Geometry} geometry An openlayers geometry.
   * @param {ol.Coordinate} coordinate Coordinate.
   * @returns {ol.Geometry.MultiPoint} An openlayers MultiPoint geometry.
   */
  static getShiftedMultipoint(geometry, coordinate) {
    // Include all but the closest vertex to the coordinate (e.g. at mouse position)
    // to prevent snapping on mouse cursor node
    const isPolygon = geometry instanceof Polygon;
    const shiftedMultipoint = new MultiPoint(
      isPolygon ? geometry.getCoordinates()[0] : geometry.getCoordinates(),
    );

    const drawNodeCoordinate = shiftedMultipoint.getClosestPoint(coordinate);

    // Exclude the node being modified
    shiftedMultipoint.setCoordinates(
      shiftedMultipoint.getCoordinates().filter((coord) => {
        return coord.toString() !== drawNodeCoordinate.toString();
      }),
    );

    return shiftedMultipoint;
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
    this.map.getInteractions().on(
      'add',
      ((e) => {
        const pos = e.target.getArray().indexOf(this.snapInteraction);

        if (
          this.snapInteraction.getActive() &&
          pos > -1 &&
          pos !== e.target.getLength() - 1
        ) {
          this.deactivate(true);
          this.activate(true);
        }
        // eslint-disable-next-line no-extra-bind
      }).bind(this),
    );
  }

  /**
   * Handle move event.
   * @private
   * @param {ol.MapBrowserEvent} evt Move event.
   */
  onMove(evt) {
    const features = this.getClosestFeatures(
      evt.coordinate,
      this.nbClosestFeatures,
    );

    this.linesLayer.getSource().clear();
    this.snapLayer.getSource().clear();

    this.pointerInteraction.dispatchEvent(
      new SnapEvent(SnapEventType.SNAP, features.length ? features : null, evt),
    );

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
      const dist = dx * dx + dy * dy;
      featureDict[dist] = f;
    };

    this.source.forEachFeatureInExtent(ext, (f) => {
      if (!this.filter || (this.filter && this.filter(f))) {
        pushSnapFeatures(f);
      }
    });

    const dists = Object.keys(featureDict);
    let features = [];
    const count = Math.min(dists.length, num);

    dists.sort((a, b) => a - b);

    for (let i = 0; i < count; i += 1) {
      features.push(featureDict[dists[i]]);
    }

    const editFeature = this.editor.getEditFeature();
    // Initially exclude the edit feature from the snapping
    if (editFeature && features.indexOf(editFeature) > -1) {
      features.splice(features.indexOf(editFeature), 1);
    }

    // When using showSnapPoints return all features except edit/draw features
    if (this.properties.showSnapPoints) {
      return features;
    }

    const drawFeature = this.editor.getDrawFeature();
    if (drawFeature) {
      const geom = drawFeature.getGeometry();
      /* Include all nodes of the edit feature except the node at the mouse position */
      // Clone drawFeature and apply adjusted snap geometry
      const snapGeom = CadControl.getShiftedMultipoint(geom, coordinate);
      const isPolygon = geom instanceof Polygon;
      const snapDrawFeature = drawFeature.clone();
      snapDrawFeature
        .getGeometry()
        .setCoordinates(
          isPolygon ? [snapGeom.getCoordinates()] : snapGeom.getCoordinates(),
        );
      features = [snapDrawFeature, ...features];
    }

    if (editFeature) {
      const geom = editFeature.getGeometry();
      /* Include all nodes of the edit feature except the node at the mouse position */
      // Clone editFeature and apply adjusted snap geometry
      const snapGeom = CadControl.getShiftedMultipoint(geom, coordinate);
      const isPolygon = geom instanceof Polygon;
      const snapEditFeature = editFeature.clone();
      snapEditFeature
        .getGeometry()
        .setCoordinates(
          isPolygon ? [snapGeom.getCoordinates()] : snapGeom.getCoordinates(),
        );
      features = [snapEditFeature, ...features];
    }

    return features;
  }

  /**
   * Returns an extent array, considers the map rotation.
   * @private
   * @param {ol.Geometry} geometry An OL geometry.
   * @returns {Array.<number>} extent array.
   */
  getRotatedExtent(geometry, coordinate) {
    const coordinates =
      geometry instanceof Polygon
        ? geometry.getCoordinates()[0]
        : geometry.getCoordinates();

    if (!coordinates.length) {
      // Polygons initially return a geometry with an empty coordinate array, so we need to catch it
      return [coordinate];
    }

    // Get the extreme X and Y using pixel values so the rotation is considered
    const xMin = coordinates.reduce((finalMin, coord) => {
      const pixelCurrent = this.map.getPixelFromCoordinate(coord);
      const pixelFinal = this.map.getPixelFromCoordinate(
        finalMin || coordinates[0],
      );
      return pixelCurrent[0] <= pixelFinal[0] ? coord : finalMin;
    });
    const xMax = coordinates.reduce((finalMax, coord) => {
      const pixelCurrent = this.map.getPixelFromCoordinate(coord);
      const pixelFinal = this.map.getPixelFromCoordinate(
        finalMax || coordinates[0],
      );
      return pixelCurrent[0] >= pixelFinal[0] ? coord : finalMax;
    });
    const yMin = coordinates.reduce((finalMin, coord) => {
      const pixelCurrent = this.map.getPixelFromCoordinate(coord);
      const pixelFinal = this.map.getPixelFromCoordinate(
        finalMin || coordinates[0],
      );
      return pixelCurrent[1] <= pixelFinal[1] ? coord : finalMin;
    });
    const yMax = coordinates.reduce((finalMax, coord) => {
      const pixelCurrent = this.map.getPixelFromCoordinate(coord);
      const pixelFinal = this.map.getPixelFromCoordinate(
        finalMax || coordinates[0],
      );
      return pixelCurrent[1] >= pixelFinal[1] ? coord : finalMax;
    });

    // Create four infinite lines through the extremes X and Y and rotate them
    const minVertLine = new LineString([
      [xMin[0], -20037508.342789],
      [xMin[0], 20037508.342789],
    ]);
    minVertLine.rotate(this.map.getView().getRotation(), xMin);
    const maxVertLine = new LineString([
      [xMax[0], -20037508.342789],
      [xMax[0], 20037508.342789],
    ]);
    maxVertLine.rotate(this.map.getView().getRotation(), xMax);
    const minHoriLine = new LineString([
      [-20037508.342789, yMin[1]],
      [20037508.342789, yMin[1]],
    ]);
    minHoriLine.rotate(this.map.getView().getRotation(), yMin);
    const maxHoriLine = new LineString([
      [-20037508.342789, yMax[1]],
      [20037508.342789, yMax[1]],
    ]);
    maxHoriLine.rotate(this.map.getView().getRotation(), yMax);

    // Use intersection points of the four lines to get the extent
    const intersectTopLeft = OverlayOp.intersection(
      parser.read(minVertLine),
      parser.read(minHoriLine),
    );
    const intersectBottomLeft = OverlayOp.intersection(
      parser.read(minVertLine),
      parser.read(maxHoriLine),
    );
    const intersectTopRight = OverlayOp.intersection(
      parser.read(maxVertLine),
      parser.read(minHoriLine),
    );
    const intersectBottomRight = OverlayOp.intersection(
      parser.read(maxVertLine),
      parser.read(maxHoriLine),
    );

    return [
      [intersectTopLeft.getCoordinate().x, intersectTopLeft.getCoordinate().y],
      [
        intersectBottomLeft.getCoordinate().x,
        intersectBottomLeft.getCoordinate().y,
      ],
      [
        intersectTopRight.getCoordinate().x,
        intersectTopRight.getCoordinate().y,
      ],
      [
        intersectBottomRight.getCoordinate().x,
        intersectBottomRight.getCoordinate().y,
      ],
    ];
  }

  /**
   * Draws snap lines by building the extent for
   * a pair of features.
   * @private
   * @param {Array.<ol.Feature>} features List of features.
   * @param {ol.Coordinate} coordinate Mouse pointer coordinate.
   */
  drawSnapLines(features, coordinate) {
    // First get all snap points: neighbouring feature vertices and extent corners
    const snapCoordsBefore = []; // store the direct before point in the coordinate array
    const snapCoords = [];
    const snapCoordsNext = []; // store the direct next point in the coordinate array

    for (let i = 0; i < features.length; i += 1) {
      const geom = features[i].getGeometry();
      const featureCoord = geom.getCoordinates();
      // Polygons initially return a geometry with an empty coordinate array, so we need to catch it
      if (featureCoord.length) {
        if (geom instanceof Point) {
          snapCoordsBefore.push();
          snapCoords.push(featureCoord);
          snapCoordsNext.push();
        } else {
          // Add feature vertices
          // eslint-disable-next-line no-lonely-if
          if (geom instanceof LineString) {
            for (let j = 0; j < featureCoord.length; j += 1) {
              snapCoordsBefore.push(featureCoord[j - 1]);
              snapCoords.push(featureCoord[j]);
              snapCoordsNext.push(featureCoord[j + 1]);
            }
          } else if (geom instanceof Polygon) {
            for (let j = 0; j < featureCoord[0].length; j += 1) {
              snapCoordsBefore.push(featureCoord[0][j - 1]);
              snapCoords.push(featureCoord[0][j]);
              snapCoordsNext.push(featureCoord[0][j + 1]);
            }
          }

          // Add extent vertices
          // const coords = this.getRotatedExtent(geom, coordinate);
          // for (let j = 0; j < coords.length; j += 1) {
          //   snapCoordsBefore.push();
          //   snapCoords.push(coords[j]);
          //   snapCoordsNext.push();
          // }
        }
      }
    }

    // Draw snaplines when cursor vertically or horizontally aligns with a snap feature.
    // We draw only on verticla and one horizontal line.
    const halfTol = this.snapTolerance / 2;
    const doubleTol = this.snapTolerance * 2;
    const mousePx = this.map.getPixelFromCoordinate(coordinate);
    const [mouseX, mouseY] = mousePx;
    let vLine;
    let hLine;
    let closerDistanceWithVLine = Infinity;
    let closerDistanceWithHLine = Infinity;
    for (let i = 0; i < snapCoords.length; i += 1) {
      const snapCoord = snapCoords[i];
      const snapPx = this.map.getPixelFromCoordinate(snapCoords[i]);
      const [snapX, snapY] = snapPx;
      const drawVLine = mouseX > snapX - halfTol && mouseX < snapX + halfTol;
      const drawHLine = mouseY > snapY - halfTol && mouseY < snapY + halfTol;

      const distanceWithVLine = Math.abs(mouseX - snapX);
      const distanceWithHLine = Math.abs(mouseY - snapY);

      if (
        (drawVLine && distanceWithVLine > closerDistanceWithVLine) ||
        (drawHLine && distanceWithHLine > closerDistanceWithHLine)
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }

      let newPt;

      if (drawVLine) {
        closerDistanceWithVLine = distanceWithVLine;
        const newY = mouseY + (mouseY < snapY ? -doubleTol : doubleTol);
        newPt = this.map.getCoordinateFromPixel([snapX, newY]);
      } else if (drawHLine) {
        closerDistanceWithHLine = distanceWithHLine;
        const newX = mouseX + (mouseX < snapX ? -doubleTol : doubleTol);
        newPt = this.map.getCoordinateFromPixel([newX, snapY]);
      }

      if (newPt) {
        const lineCoords = [newPt, snapCoord];
        const geom = new LineString(lineCoords);
        const feature = new Feature(geom);

        if (drawVLine) {
          vLine = feature;
        }

        if (drawHLine) {
          hLine = feature;
        }
      }
    }

    if (hLine) {
      this.snapLayer.getSource().addFeature(hLine);
    }
    if (vLine && vLine !== hLine) {
      this.snapLayer.getSource().addFeature(vLine);
    }

    // Draw custom lines
    if (this.drawCustomSnapLines) {
      this.drawCustomSnapLines(
        coordinate,
        snapCoords,
        snapCoordsBefore,
        snapCoordsNext,
      );
    }

    const cad = this;
    for (let i = 0; i < snapCoords.length; i += 1) {
      if (!snapCoordsBefore[i]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const snapCoordBefore = snapCoordsBefore[i];
      const snapCoord = snapCoords[i];
      const snapPxBefore = cad.map.getPixelFromCoordinate(snapCoordBefore);
      const snapPx = cad.map.getPixelFromCoordinate(snapCoord);

      const [snapX] = snapPx;

      // Calulate projected point
      const projMousePx = getProjectedPoint(mousePx, snapPxBefore, snapPx);
      const [projMouseX, projMouseY] = projMousePx;
      const distance = Math.sqrt(
        (projMouseX - mouseX) ** 2 + (projMouseY - mouseY) ** 2,
      );
      let newPt;

      if (distance <= this.snapTolerance) {
        const lineFunc = getEquationOfLine(snapPxBefore, snapPx);
        const newX = projMouseX + (projMouseX < snapX ? -doubleTol : doubleTol);
        newPt = this.map.getCoordinateFromPixel([newX, lineFunc(newX)]);
      }

      if (newPt) {
        const lineCoords = [snapCoordBefore, snapCoord, newPt];
        const geom = new LineString(lineCoords);
        const feature = new Feature(geom);
        feature.setStyle(() => {
          return new Style({
            stroke: new Stroke({
              width: 2,
              color: 'orange',
              lineDash: [5, 10],
            }),
          });
        });

        cad.snapLayer.getSource().addFeature(feature);
      }
    }

    // Snap to snap line intersection points
    let intersectedLineFeatures = [];
    const snapFeatures = this.snapLayer.getSource().getFeatures() || [];
    let snapLinesIntersectCoords;
    snapFeatures.forEach((feature) => {
      snapFeatures.forEach((feature2) => {
        // We check if horizontal and vertical snap lines intersect and calculate the intersection coordinate
        const intersectCoords = OverlayOp.intersection(
          parser.read(feature.getGeometry()),
          parser.read(feature2.getGeometry()),
        )?.getCoordinates()[0];
        if (intersectCoords && feature !== feature2) {
          snapLinesIntersectCoords = intersectCoords;
          intersectedLineFeatures = [feature, feature2];
        }
      });
    });

    if (snapLinesIntersectCoords && intersectedLineFeatures.length) {
      this.linesLayer.getSource().clear();
      this.linesLayer.getSource().addFeatures(intersectedLineFeatures);

      this.snapLayer.getSource().clear();
      const snapGeom = new Point([
        snapLinesIntersectCoords.x,
        snapLinesIntersectCoords.y,
      ]);
      this.snapLayer.getSource().addFeature(new Feature(snapGeom));
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

    document.getElementById('aux-cb')?.addEventListener('change', (evt) => {
      this.setProperties({
        showSnapLines: evt.target.checked,
        showSnapPoints: !evt.target.checked,
      });
    });

    document.getElementById('dist-cb')?.addEventListener('change', (evt) => {
      this.setProperties({
        showSnapPoints: evt.target.checked,
        showSnapLines: !evt.target.checked,
      });
    });

    document.getElementById('width-input')?.addEventListener('keyup', (evt) => {
      const snapPointDist = parseFloat(evt.target.value);
      if (!Number.isNaN(snapPointDist)) {
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
