import { OverlayOp } from "jsts/org/locationtech/jts/operation/overlay";
import Feature from "ol/Feature";
import { Circle, LineString, MultiPoint, Point, Polygon } from "ol/geom";
import { Pointer, Snap } from "ol/interaction";
import Vector from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import { getUid } from "ol/util";

import cadSVG from "../../img/cad.svg";
import { SnapEvent, SnapEventType } from "../event";
import {
  CUSTOM_LINE_KEY,
  defaultSnapStyles,
  getEquationOfLine,
  getIntersectedLinesAndPoint,
  getProjectedPoint,
  getShiftedMultiPoint,
  isSameLines,
  ORTHO_LINE_KEY,
  parser,
  SEGMENT_LINE_KEY,
  SNAP_FEATURE_TYPE_PROPERTY,
  SNAP_POINT_KEY,
  VH_LINE_KEY,
} from "../helper";
import Control from "./control";

/**
 * Control with snapping functionality for geometry alignment.
 * @extends {Control}
 * @alias ole.CadControl
 */
class CadControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {Function} [options.drawCustomSnapLines] Allow to draw more snapping lines using selected coordinates.
   * @param {Function} [options.filter] Returns an array containing the features
   *   to include for CAD (takes the source as a single argument).
   * @param {Function} [options.extentFilter] An optional spatial filter for the features to snap with. Returns an ol.Extent which will be used by the source.getFeaturesinExtent method.
   * @param {Function} [options.lineFilter] An optional filter for the generated snapping lines
   *   array (takes the lines and cursor coordinate as arguments and returns the new line array)
   * @param {Number} [options.nbClosestFeatures] Number of features to use for snapping (closest first). Default is 5.
   * @param {Number} [options.snapTolerance] Snap tolerance in pixel
   *   for snap lines. Default is 10.
   * @param {Boolean} [options.showSnapLines] Whether to show
   *   snap lines. Default is true.
   * @param {Boolean} [options.showSnapPoints] Whether to show
   *  snap points around the closest feature.
   * @param {Boolean} [options.showSnapPointsOnlyOnPoints] Whether to show
   *  snap points only on points or not. Default is false.
   * @param {Boolean} [options.showOrthoLines] Whether to show
   *   snap lines that arae perpendicular to segment (default is true).
   * @param {Boolean} [options.showSegmentLines] Whether to show
   *   snap lines that extends a segment (default is true).
   * @param {Boolean} [options.showVerticalAndHorizontalLines] Whether to show vertical
   *   and horizontal lines for each snappable point (default is true).
   * @param {Boolean} [options.snapLinesOrder] Define order of display of snap lines,
   *   must be an array containing the following values 'ortho', 'segment', 'vh'. Default is ['ortho', 'segment', 'vh', 'custom'].
   * @param {Number} [options.snapPointDist] Distance of the
   *   snap points (default is 30).
   * @param {Boolean} [options.useMapUnits] Whether to use map units
   *   as measurement for point snapping. Default is false (pixel are used).
   * @param {ol.VectorSource} [options.source] The vector source to retrieve the snappable features from.
   * @param {ol.style.Style.StyleLike} [options.snapStyle] Style used for the snap layer.
   * @param {ol.style.Style.StyleLike} [options.linesStyle] Style used for the lines layer.
   *
   */
  constructor(options = {}) {
    super({
      className: "ole-control-cad",
      image: cadSVG,
      showOrthoLines: true,
      showSegmentLines: true,
      showSnapLines: false,
      showSnapPoints: true,
      showSnapPointsOnlyOnPoints: false,
      showVerticalAndHorizontalLines: true,
      snapLinesOrder: ["ortho", "segment", "vh"],
      snapPointDist: 30,
      title: "CAD control",
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
        defaultSnapStyles[VH_LINE_KEY],
        defaultSnapStyles[SNAP_POINT_KEY],
      ],
    });

    /**
     * Layer for colored lines indicating
     * intersection point between snapping lines.
     * @type {ol.layer.Vector}
     * @private
     */
    this.linesLayer = new Vector({
      source: new VectorSource(),
      style: options.linesStyle || [
        new Style({
          stroke: new Stroke({
            color: "#FF530D",
            lineDash: [5, 10],
            width: 1,
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
    this.filter =
      options.filter ||
      (() => {
        return true;
      });

    /**
     * Filter the features spatially.
     */
    this.extentFilter =
      options.extentFilter ||
      (() => {
        return [-Infinity, -Infinity, Infinity, Infinity];
      });

    /**
     * Filter the generated line list
     */
    this.lineFilter = options.lineFilter;

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

    this.handleInteractionAdd = this.handleInteractionAdd.bind(this);

    this.on("propertychange", () => {
      this.updateDialog();
    });
  }

  /**
   * @inheritdoc
   */
  activate(silent) {
    super.activate(silent);
    this.snapLayer.setMap(this.map);
    this.linesLayer.setMap(this.map);
    this.map?.addInteraction(this.pointerInteraction);
    this.map?.addInteraction(this.snapInteraction);

    document.getElementById("aux-cb")?.addEventListener("change", (evt) => {
      this.setProperties({
        showSnapLines: evt.target.checked,
        showSnapPoints: !evt.target.checked,
      });
    });

    document.getElementById("dist-cb")?.addEventListener("change", (evt) => {
      this.setProperties({
        showSnapLines: !evt.target.checked,
        showSnapPoints: evt.target.checked,
      });
    });

    document.getElementById("width-input")?.addEventListener("keyup", (evt) => {
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
    this.map?.removeInteraction(this.pointerInteraction);
    this.map?.removeInteraction(this.snapInteraction);
  }

  /**
   * Draws snap lines by building the extent for
   * a pair of features.
   * @private
   * @param {ol.Coordinate} coordinate Mouse pointer coordinate.
   * @param {Array.<ol.Feature>} features List of features.
   */
  drawSnapLines(coordinate, features) {
    // First get all snap points: neighbouring feature vertices and extent corners
    const snapCoordsBefore = []; // store the direct before point in the coordinate array
    const snapCoords = [];
    const snapCoordsAfter = []; // store the direct next point in the coordinate array

    for (let i = 0; i < features.length; i += 1) {
      const geom = features[i].getGeometry();
      let featureCoord = geom.getCoordinates();

      if (!featureCoord && geom instanceof Circle) {
        featureCoord = geom.getCenter();
      }

      // Polygons initially return a geometry with an empty coordinate array, so we need to catch it
      if (featureCoord?.length) {
        if (geom instanceof Point || geom instanceof Circle) {
          snapCoordsBefore.push();
          snapCoords.push(featureCoord);
          snapCoordsAfter.push();
        } else {
          // Add feature vertices

          if (geom instanceof LineString) {
            for (let j = 0; j < featureCoord.length; j += 1) {
              snapCoordsBefore.push(featureCoord[j - 1]);
              snapCoords.push(featureCoord[j]);
              snapCoordsAfter.push(featureCoord[j + 1]);
            }
          } else if (geom instanceof Polygon) {
            for (let j = 0; j < featureCoord[0].length; j += 1) {
              snapCoordsBefore.push(featureCoord[0][j - 1]);
              snapCoords.push(featureCoord[0][j]);
              snapCoordsAfter.push(featureCoord[0][j + 1]);
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

    const {
      showOrthoLines,
      showSegmentLines,
      showVerticalAndHorizontalLines,
      snapLinesOrder,
    } = this.properties;

    let lines = [];
    const helpLinesOrdered = [];
    const helpLines = {
      [CUSTOM_LINE_KEY]: [],
      [ORTHO_LINE_KEY]: [],
      [SEGMENT_LINE_KEY]: [],
      [VH_LINE_KEY]: [],
    };

    if (showOrthoLines) {
      helpLines[ORTHO_LINE_KEY] =
        this.getOrthoLines(coordinate, snapCoords, snapCoordsBefore) || [];
    }

    if (showSegmentLines) {
      helpLines[SEGMENT_LINE_KEY] =
        this.getSegmentLines(coordinate, snapCoords, snapCoordsBefore) || [];
    }

    if (showVerticalAndHorizontalLines) {
      helpLines[VH_LINE_KEY] =
        this.getVerticalAndHorizontalLines(coordinate, snapCoords) || [];
    }

    // Add custom lines
    if (this.drawCustomSnapLines) {
      helpLines[CUSTOM_LINE_KEY] =
        this.drawCustomSnapLines(
          coordinate,
          snapCoords,
          snapCoordsBefore,
          snapCoordsAfter,
        ) || [];
    }

    // Add help lines in a defined order.
    snapLinesOrder.forEach((lineType) => {
      helpLinesOrdered.push(...(helpLines[lineType] || []));
    });

    // Remove duplicated lines, comparing their equation using pixels.
    helpLinesOrdered.forEach((lineA) => {
      if (
        !lines.length ||
        !lines.find((lineB) => {
          return isSameLines(lineA, lineB, this.map);
        })
      ) {
        lines.push(lineA);
      }
    });

    if (this.lineFilter) {
      lines = this.lineFilter(lines, coordinate);
    }

    // We snap on intersections of lines (distance < this.snapTolerance) or on all the help lines.
    const intersectFeatures = getIntersectedLinesAndPoint(
      coordinate,
      lines,
      this.map,
      this.snapTolerance,
    );

    if (intersectFeatures?.length) {
      intersectFeatures.forEach((feature) => {
        if (feature.getGeometry().getType() === "Point") {
          this.snapLayer.getSource().addFeature(feature);
        } else {
          this.linesLayer.getSource().addFeature(feature);
        }
      });
    } else {
      this.snapLayer.getSource().addFeatures(lines);
    }
  }

  /**
   * Adds snap points to the snapping layer.
   * @private
   * @param {ol.Coordinate} coordinate cursor coordinate.
   * @param {ol.eaturee} feature Feature to draw the snap points for.
   */
  drawSnapPoints(coordinate, feature) {
    if (
      this.properties.showSnapPointsOnlyOnPoints &&
      !(feature.getGeometry() instanceof Point)
    ) {
      return;
    }
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
   * Returns a list of the {num} closest features
   * to a given coordinate.
   * @private
   * @param {ol.Coordinate} coordinate Coordinate.
   * @param {Number} nbFeatures Number of features to search.
   * @returns {Array.<ol.Feature>} List of closest features.
   */
  getClosestFeatures(coordinate, nbFeatures = 1) {
    const editFeature = this.editor.getEditFeature();
    const drawFeature = this.editor.getDrawFeature();
    const currentFeatures = [editFeature, drawFeature].filter((f) => {
      return !!f;
    });

    const cacheDist = {};
    const dist = (f) => {
      const uid = getUid(f);
      if (!cacheDist[uid]) {
        const cCoord = f.getGeometry().getClosestPoint(coordinate);
        const dx = cCoord[0] - coordinate[0];
        const dy = cCoord[1] - coordinate[1];
        cacheDist[uid] = dx * dx + dy * dy;
      }
      return cacheDist[uid];
    };
    const sortByDistance = (a, b) => {
      return dist(a) - dist(b);
    };

    let features = this.source
      .getFeaturesInExtent(this.extentFilter())
      .filter((feature) => {
        return this.filter(feature) && !currentFeatures.includes(feature);
      })
      .sort(sortByDistance)
      .slice(0, nbFeatures);

    // When using showSnapPoints, return all features except edit/draw features
    if (this.properties.showSnapPoints) {
      return features;
    }

    // When using showSnapLines, return all features but edit/draw features are
    // cloned to remove the node being modified.
    currentFeatures.filter(this.filter).forEach((feature) => {
      const geom = feature.getGeometry();

      if (!(geom instanceof Circle) && !(geom instanceof Point)) {
        const snapGeom = getShiftedMultiPoint(
          geom,
          coordinate,
          editFeature,
          drawFeature,
        );
        const isPolygon = geom instanceof Polygon;
        const snapFeature = feature.clone();
        const coordinates = snapGeom.getCoordinates();
        snapFeature
          .getGeometry()
          .setCoordinates(isPolygon ? [coordinates] : coordinates);
        features = [snapFeature, ...features];
      }
    });

    return features;
  }

  /**
   * @inheritdoc
   */
  getDialogTemplate() {
    const distLabel = this.properties.useMapUnits ? "map units" : "px";

    return `
      <div>
        <input
          id="aux-cb"
          type="radio"
          name="radioBtn"
          ${this.properties.showSnapLines ? "checked" : ""}
        >
        <label>Show snap lines</label>
      </div>
      <div>
        <input
          id="dist-cb"
          type="radio"
          name="radioBtn"
          ${this.properties.showSnapPoints ? "checked" : ""}
        >
        <label>Show snap points. Distance (${distLabel}):</label>
        <input type="text" id="width-input"
          value="${this.properties.snapPointDist}">
      </div>
    `;
  }

  /**
   * For each segment, we calculate lines that are perpendicular.
   */
  getOrthoLines(coordinate, snapCoords, snapCoordsBefore) {
    const mousePx = this.map.getPixelFromCoordinate(coordinate);
    const doubleTol = this.snapTolerance * 2;
    const [mouseX, mouseY] = mousePx;
    const lines = [];

    for (let i = 0; i < snapCoords.length; i += 1) {
      if (!snapCoordsBefore[i]) {
        continue;
      }
      const snapCoordBefore = snapCoordsBefore[i];
      const snapCoord = snapCoords[i];
      const snapPxBefore = this.map.getPixelFromCoordinate(snapCoordBefore);
      const snapPx = this.map.getPixelFromCoordinate(snapCoord);

      const orthoLine1 = new LineString([snapPxBefore, snapPx]);
      orthoLine1.rotate((90 * Math.PI) / 180, snapPxBefore);

      const orthoLine2 = new LineString([snapPx, snapPxBefore]);
      orthoLine2.rotate((90 * Math.PI) / 180, snapPx);

      [orthoLine1, orthoLine2].forEach((line) => {
        const [anchorPx, last] = line.getCoordinates();
        const projMousePx = getProjectedPoint(mousePx, anchorPx, last);
        const [projMouseX, projMouseY] = projMousePx;
        const distance = Math.sqrt(
          (projMouseX - mouseX) ** 2 + (projMouseY - mouseY) ** 2,
        );

        let newPt;
        if (distance <= this.snapTolerance) {
          // lineFunc is undefined when it's a vertical line
          const lineFunc = getEquationOfLine(anchorPx, projMousePx);
          const newX =
            projMouseX + (projMouseX < anchorPx[0] ? -doubleTol : doubleTol);
          if (lineFunc) {
            newPt = this.map.getCoordinateFromPixel([
              newX,
              lineFunc ? lineFunc(newX) : projMouseY,
            ]);
          }
        }

        if (newPt) {
          const coords = [this.map.getCoordinateFromPixel(anchorPx), newPt];
          const geom = new LineString(coords);
          const feature = new Feature(geom);
          feature.set(SNAP_FEATURE_TYPE_PROPERTY, ORTHO_LINE_KEY);
          lines.push(feature);
        }
      });
    }
    return lines;
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
   * For each segment, we calculate lines that extends it.
   */
  getSegmentLines(coordinate, snapCoords, snapCoordsBefore) {
    const mousePx = this.map.getPixelFromCoordinate(coordinate);
    const doubleTol = this.snapTolerance * 2;
    const [mouseX, mouseY] = mousePx;
    const lines = [];

    for (let i = 0; i < snapCoords.length; i += 1) {
      if (!snapCoordsBefore[i]) {
        continue;
      }
      const snapCoordBefore = snapCoordsBefore[i];
      const snapCoord = snapCoords[i];
      const snapPxBefore = this.map.getPixelFromCoordinate(snapCoordBefore);
      const snapPx = this.map.getPixelFromCoordinate(snapCoord);

      const [snapX] = snapPx;

      // Calculate projected point
      const projMousePx = getProjectedPoint(mousePx, snapPxBefore, snapPx);
      const [projMouseX, projMouseY] = projMousePx;
      const distance = Math.sqrt(
        (projMouseX - mouseX) ** 2 + (projMouseY - mouseY) ** 2,
      );
      let newPt;

      if (distance <= this.snapTolerance) {
        // lineFunc is undefined when it's a vertical line
        const lineFunc = getEquationOfLine(snapPxBefore, snapPx);
        const newX = projMouseX + (projMouseX < snapX ? -doubleTol : doubleTol);
        if (lineFunc) {
          newPt = this.map.getCoordinateFromPixel([
            newX,
            lineFunc ? lineFunc(newX) : projMouseY,
          ]);
        }
      }

      if (newPt) {
        const lineCoords = [snapCoordBefore, snapCoord, newPt];
        const geom = new LineString(lineCoords);
        const feature = new Feature(geom);
        feature.set(SNAP_FEATURE_TYPE_PROPERTY, SEGMENT_LINE_KEY);
        lines.push(feature);
      }
    }
    return lines;
  }

  // Calculate lines that are vertical or horizontal to a coordinate.
  getVerticalAndHorizontalLines(coordinate, snapCoords) {
    // Draw snaplines when cursor vertically or horizontally aligns with a snap feature.
    // We draw only on vertical and one horizontal line to avoid crowded lines when polygons or lines have a lot of coordinates.
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

        feature.set(SNAP_FEATURE_TYPE_PROPERTY, VH_LINE_KEY);

        if (drawVLine) {
          vLine = feature;
        }

        if (drawHLine) {
          hLine = feature;
        }
      }
    }

    const lines = [];

    if (hLine) {
      lines.push(hLine);
    }

    if (vLine && vLine !== hLine) {
      lines.push(vLine);
    }

    return lines;
  }

  handleInteractionAdd(evt) {
    const pos = evt.target.getArray().indexOf(this.snapInteraction);

    if (
      this.snapInteraction.getActive() &&
      pos > -1 &&
      pos !== evt.target.getLength() - 1
    ) {
      this.deactivate(true);
      this.activate(true);
    }
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
      this.drawSnapLines(evt.coordinate, features);
    }

    if (this.properties.showSnapPoints && features.length) {
      this.drawSnapPoints(evt.coordinate, features[0]);
    }
  }

  /**
   * @inheritdoc
   */
  setMap(map) {
    if (this.map) {
      this.map.getInteractions().un("add", this.handleInteractionAdd);
    }

    super.setMap(map);

    // Ensure that the snap interaction is at the last position
    // as it must be the first to handle the  pointermove event.
    if (this.map) {
      this.map.getInteractions().on("add", this.handleInteractionAdd);
    }
  }
}

export default CadControl;
