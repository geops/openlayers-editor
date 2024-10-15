import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { beforeEach, describe, expect, test } from "vitest";

import getIntersectedLinesAndPoint from "./getIntersectedLinesAndPoint";

describe("getIntersectedLinesAndPoint", () => {
  let map;

  beforeEach(() => {
    // In the test we use pixel as coordinates.
    map = {
      getPixelFromCoordinate: (coord) => {
        return coord;
      },
    };
  });

  test("returns empty array because lines are not intersected", () => {
    const line1 = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    const line2 = new Feature(
      new LineString([
        [3, 4],
        [5, 7],
      ]),
    );

    const intersectedLines = getIntersectedLinesAndPoint(
      [0, 0],
      [line1, line2],
      map,
      0,
    );

    expect(intersectedLines).toEqual([]);
  });

  test("returns empty array because the tolerance is not big enough", () => {
    const line1 = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    const line2 = new Feature(
      new LineString([
        [0, 1],
        [1, 0],
      ]),
    );

    const intersectedLines = getIntersectedLinesAndPoint(
      [0, 0],
      [line1, line2],
      map,
      0,
    );

    expect(intersectedLines).toEqual([]);
  });

  test("returns intersected lines and the intersection point", () => {
    const line1 = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    const line2 = new Feature(
      new LineString([
        [0, 1],
        [1, 0],
      ]),
    );

    const intersectedLines = getIntersectedLinesAndPoint(
      [0, 0],
      [line1, line2],
      map,
      1,
    );
    expect(intersectedLines[0]).toBe(line1);
    expect(intersectedLines[1]).toBe(line2);
    expect(intersectedLines[2].getGeometry().getCoordinates()).toEqual([
      0.5, 0.5,
    ]);
  });
});
