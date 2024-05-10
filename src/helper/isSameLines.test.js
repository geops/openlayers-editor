/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, describe, beforeEach } from 'vitest';
import LineString from 'ol/geom/LineString';
import Feature from 'ol/Feature';
import isSameLines from './isSameLines';

describe('isSameLines', () => {
  let map;

  beforeEach(() => {
    // In the test we use pixel as coordinates.
    map = {
      getPixelFromCoordinate: (coord) => coord,
    };
  });

  test('returns false', () => {
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

    const isSameLine = isSameLines(line1, line2, map);
    expect(isSameLine).toBe(false);
  });

  test('returns true', () => {
    const line1 = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    const line2 = new Feature(
      new LineString([
        [2, 2],
        [3, 3],
      ]),
    );

    const isSameLine = isSameLines(line1, line2, map);
    expect(isSameLine).toBe(true);
  });
});
