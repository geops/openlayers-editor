import { getUid } from "ol";
import { LineString, MultiPoint } from "ol/geom";

let prevCoordinates;
let prevFeature;
let prevIndex = -1;

/**
 * Removes the last coordinate of a given geometry (Line or Polygon).
 * When we draw the last coordinate if tat mouse cursor.
 * @private
 * @param {ol.Geometry} geometry An openlayers geometry.
 * @returns {ol.Geometry.MultiPoint} An openlayers MultiPoint geometry.
 */
const getShiftedMultipoint = (
  geometry,
  coordinate,
  editFeature,
  drawFeature,
) => {
  // Include all but the last vertex to the coordinate (e.g. at mouse position)
  // to prevent snapping on mouse cursor node
  let lineGeometry = geometry;

  const isPolygon = geometry.getType() === "Polygon";
  if (isPolygon) {
    const coordinates = geometry.getCoordinates()[0];

    // If the poylgon is properly closed we remove the last coordinate to avoid duplicated snapping nodes and lines.
    if (
      coordinates[0].toString() ===
      coordinates[coordinates.length - 1].toString()
    ) {
      coordinates.pop();
    }
    lineGeometry = new LineString(coordinates);
  }

  let coordinates = [];

  if (
    !editFeature ||
    (prevFeature && getUid(editFeature) !== getUid(prevFeature))
  ) {
    prevFeature = editFeature;
    prevCoordinates = null;
    prevIndex = -1;
  }

  // When the user is drawing a line or polygon, we just want to remove the last coordinate drawn.
  if (drawFeature) {
    lineGeometry.forEachSegment((start) => {
      coordinates.push(start);
    });
    if (isPolygon) {
      coordinates.pop();
    }

    // When we are modifying a line or polygon, we want to remove the node that is being modified.
  } else if (editFeature) {
    const index = prevCoordinates?.length
      ? lineGeometry.getCoordinates()?.findIndex((coord, index) => {
          return coord.toString() !== prevCoordinates[index].toString();
        })
      : -1;

    // The use of prevIndex avoid the flickering of the snapping node on eache pointer move event.
    prevIndex = index != -1 ? index : prevIndex;
    prevCoordinates = lineGeometry.getCoordinates();

    if (prevIndex > -1) {
      // Exclude the node being modified
      const coords = lineGeometry.getCoordinates();
      coords.splice(prevIndex, 1);
      coordinates = coords;
    }
  }
  return new MultiPoint(coordinates);
};

export default getShiftedMultipoint;
