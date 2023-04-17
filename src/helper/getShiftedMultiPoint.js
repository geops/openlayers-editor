import { MultiPoint } from 'ol/geom';

/**
 * Removes the closest node to a given coordinate from a given geometry.
 * @private
 * @param {ol.Geometry} geometry An openlayers geometry.
 * @param {ol.Coordinate} coordinate Coordinate.
 * @returns {ol.Geometry.MultiPoint} An openlayers MultiPoint geometry.
 */
const getShiftedMultipoint = (geometry, coordinate) => {
  // Include all but the closest vertex to the coordinate (e.g. at mouse position)
  // to prevent snapping on mouse cursor node
  const isPolygon = geometry.getType() === 'Polygon';
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
};

export default getShiftedMultipoint;
