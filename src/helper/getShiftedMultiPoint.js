import { LineString, MultiPoint } from "ol/geom";

/**
 * Removes the last coordinate of a given geometry (Line or Polygon).
 * When we draw the last coordinate if tat mouse cursor.
 * @private
 * @param {ol.Geometry} geometry An openlayers geometry.
 * @returns {ol.Geometry.MultiPoint} An openlayers MultiPoint geometry.
 */
const getShiftedMultipoint = (geometry) => {
  // Include all but the last vertex to the coordinate (e.g. at mouse position)
  // to prevent snapping on mouse cursor node
  const isPolygon = geometry.getType() === "Polygon";
  const lineGeometry = isPolygon
    ? new LineString(geometry.getCoordinates()[0])
    : geometry;

  const coordinates = [];
  lineGeometry.forEachSegment((start) => {
    coordinates.push(start);
  });
  if (isPolygon) {
    coordinates.pop();
  }
  return new MultiPoint(coordinates);
};

export default getShiftedMultipoint;
