// We consider 2 lines identical when 2 lines have the same equation when the use their pixel values not coordinate.
// Using the coordinate the calculation is falsy because of some rounding.

import getEquationOfLine from './getEquationOfLine';

// This function compares only 2 lines of 2 coordinates.
const isSameLines = (lineA, lineB, map) => {
  const geomA = lineA.getGeometry();
  const firstPxA = map.getPixelFromCoordinate(geomA.getFirstCoordinate());
  const lastPxA = map.getPixelFromCoordinate(geomA.getLastCoordinate());
  const lineFuncA = getEquationOfLine(firstPxA, lastPxA);

  const geomB = lineB.getGeometry();
  const firstPxB = map.getPixelFromCoordinate(geomB.getFirstCoordinate());
  const lastPxB = map.getPixelFromCoordinate(geomB.getLastCoordinate());
  const lineFuncB = getEquationOfLine(firstPxB, lastPxB);

  // We compare with toFixed(2) becaus eof rounding issues converting pixel to coordinate.
  if (
    lineFuncA &&
    lineFuncB &&
    lineFuncA(-350).toFixed(2) === lineFuncB(-350).toFixed(2) &&
    lineFuncA(7800).toFixed(2) === lineFuncB(7800).toFixed(2)
  ) {
    return true;
  }

  // 2 are vertical lines
  if (!lineFuncA && !lineFuncB && firstPxA[0] && firstPxB[0]) {
    return true;
  }

  return false;
};

export default isSameLines;
