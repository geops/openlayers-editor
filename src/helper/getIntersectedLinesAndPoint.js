import { OverlayOp } from 'jsts/org/locationtech/jts/operation/overlay';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { SNAP_FEATURE_TYPE_PROPERTY, SNAP_POINT_KEY } from './constants';
import getDistance from './getDistance';
import isSameLines from './isSameLines';
import parser from './parser';

// Find lines that intersects and calculate the intersection point.
// Return only point (and corresponding lines) that are distant from the mouse coordinate < snapTolerance
const getIntersectedLinesAndPoint = (coordinate, lines, map, snapTolerance) => {
  const liness = [];
  const points = [];
  const isAlreadyIntersected = [];
  const isPointAlreadyExist = {};
  const mousePx = map.getPixelFromCoordinate(coordinate);

  lines.forEach((lineA) => {
    lines.forEach((lineB) => {
      const intersections = OverlayOp.intersection(
        parser.read(lineA.getGeometry()),
        parser.read(lineB.getGeometry()),
      );
      const coord = intersections?.getCoordinates()[0];
      console.log(coord, lineA !== lineB, isSameLines(lineA, lineB, map));

      if (coord && lineA !== lineB && !isSameLines(lineA, lineB, map)) {
        intersections.getCoordinates().forEach(({ x, y }) => {
          if (
            getDistance(map.getPixelFromCoordinate([x, y]), mousePx) <=
            snapTolerance
          ) {
            // Add lines only when the intersecting point is valid for snapping
            if (!isAlreadyIntersected.includes(lineA)) {
              liness.push(lineA);
              isAlreadyIntersected.push(lineA);
            }

            if (!isAlreadyIntersected.includes(lineB)) {
              liness.push(lineB);
              isAlreadyIntersected.push(lineB);
            }

            if (!isPointAlreadyExist[`${x}${y}`]) {
              isPointAlreadyExist[`${x}${y}`] = true;
              const feature = new Feature(new Point([x, y]));
              feature.set(SNAP_FEATURE_TYPE_PROPERTY, SNAP_POINT_KEY);
              points.push(feature);
            }
          }
        });
      }
    });
  });

  return [...liness, ...points];
};

export default getIntersectedLinesAndPoint;
