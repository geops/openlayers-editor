import { getUid } from "ol";
import { LineString, MultiPoint } from "ol/geom";

let prevCoordinates;
let prevFeature;

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
  const isPolygon = geometry.getType() === "Polygon";
  const lineGeometry = isPolygon
    ? new LineString(geometry.getCoordinates()[0])
    : geometry;

  let coordinates = [];
  // console.log(editFeature, drawFeature);

  if (
    !editFeature ||
    (prevFeature && getUid(editFeature) !== getUid(prevFeature))
  ) {
    prevFeature = editFeature;
    prevCoordinates = null;
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
    prevCoordinates = lineGeometry.getCoordinates();

    if (index > -1) {
      // Exclude the node being modified
      const coords = lineGeometry.getCoordinates();
      coords.splice(index, 1);
      coordinates = coords;
    }
  }
  return new MultiPoint(coordinates);
};

export default getShiftedMultipoint;
