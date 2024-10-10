import { Fill, RegularShape, Stroke, Style } from "ol/style";

export const ORTHO_LINE_KEY = "ortho";
export const SEGMENT_LINE_KEY = "segment";
export const VH_LINE_KEY = "vh";
export const CUSTOM_LINE_KEY = "custom";
export const SNAP_POINT_KEY = "point";
export const SNAP_FEATURE_TYPE_PROPERTY = "ole.snap.feature.type";

export const defaultSnapStyles = {
  [ORTHO_LINE_KEY]: new Style({
    stroke: new Stroke({
      color: "purple",
      lineDash: [5, 10],
      width: 1,
    }),
  }),
  [SEGMENT_LINE_KEY]: new Style({
    stroke: new Stroke({
      color: "orange",
      lineDash: [5, 10],
      width: 1,
    }),
  }),
  [SNAP_POINT_KEY]: new Style({
    image: new RegularShape({
      angle: Math.PI / 4,
      fill: new Fill({
        color: "#E8841F",
      }),
      points: 4,
      radius: 5,
      radius2: 0,
      stroke: new Stroke({
        color: "#618496",
        width: 1,
      }),
    }),
  }),
  [VH_LINE_KEY]: new Style({
    stroke: new Stroke({
      color: "#618496",
      lineDash: [5, 10],
      width: 1,
    }),
  }),
};
