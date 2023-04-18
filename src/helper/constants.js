import { Fill, RegularShape, Stroke, Style } from 'ol/style';

export const ORTHO_LINE_KEY = 'ortho';
export const SEGMENT_LINE_KEY = 'segment';
export const VH_LINE_KEY = 'vh';
export const CUSTOM_LINE_KEY = 'custom';
export const SNAP_POINT_KEY = 'point';
export const SNAP_FEATURE_TYPE_PROPERTY = 'ole.snap.feature.type';

export const defaultSnapStyles = {
  [ORTHO_LINE_KEY]: new Style({
    stroke: new Stroke({
      width: 1,
      color: 'purple',
      lineDash: [5, 10],
    }),
  }),
  [SEGMENT_LINE_KEY]: new Style({
    stroke: new Stroke({
      width: 1,
      color: 'orange',
      lineDash: [5, 10],
    }),
  }),
  [VH_LINE_KEY]: new Style({
    stroke: new Stroke({
      width: 1,
      lineDash: [5, 10],
      color: '#618496',
    }),
  }),
  [SNAP_POINT_KEY]: new Style({
    image: new RegularShape({
      fill: new Fill({
        color: '#E8841F',
      }),
      stroke: new Stroke({
        width: 1,
        color: '#618496',
      }),
      points: 4,
      radius: 5,
      radius2: 0,
      angle: Math.PI / 4,
    }),
  }),
};
