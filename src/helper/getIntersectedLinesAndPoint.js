import { OverlayOp } from 'jsts/org/locationtech/jts/operation/overlay';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import isSameLines from './isSameLines';
import parser from './parser';

// Find lines that intersects and calculate the intersection point.
const getIntersectedLinesAndPoint = (lines, map) => {
  const liness = [];
  const points = [];
  const isAlreadyIntersected = [];
  const isPointAlreadyExist = {};

  lines.forEach((lineA) => {
    lines.forEach((lineB) => {
      const intersections = OverlayOp.intersection(
        parser.read(lineA.getGeometry()),
        parser.read(lineB.getGeometry()),
      );
      const coord = intersections?.getCoordinates()[0];
      if (coord && lineA !== lineB && !isSameLines(lineA, lineB, map)) {
        if (!isAlreadyIntersected.includes(lineA)) {
          liness.push(lineA);
          isAlreadyIntersected.push(lineA);
        }

        if (!isAlreadyIntersected.includes(lineB)) {
          liness.push(lineB);
          isAlreadyIntersected.push(lineB);
        }

        intersections.getCoordinates().forEach(({ x, y }) => {
          if (!isPointAlreadyExist[`${x}${y}`]) {
            isPointAlreadyExist[`${x}${y}`] = true;
            points.push(new Feature(new Point([x, y])));
          }
        });
      }
    });
  });
  console.log('feature intersected', liness.length);
  return [...liness, ...points];
};

export default getIntersectedLinesAndPoint;
