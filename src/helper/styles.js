import { Circle, Style, Fill, Stroke } from 'ol/style';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { MultiPoint } from 'ol/geom';
import GeometryType from 'ol/geom/GeometryType';
import { unByKey } from 'ol/Observable';

// Default style on modifying geometries
export const selectModifyStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({
      color: '#05A0FF',
    }),
    stroke: new Stroke({ color: '#05A0FF', width: 2 }),
  }),
  stroke: new Stroke({
    color: '#05A0FF',
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(255,255,255,0.4)',
  }),
  geometry: (f) => {
    const coordinates = [];
    const geometry = f.getGeometry();
    let geometries = [geometry];
    if (geometry.getType() === GeometryType.GEOMETRY_COLLECTION) {
      geometries = geometry.getGeometriesArrayRecursive();
    }

    // At this point geometries doesn't contains any GeometryCollections.
    geometries.forEach((geom) => {
      let multiGeometries = [geom];
      if (geom.getType() === GeometryType.MULTI_LINE_STRING) {
        multiGeometries = geom.getLineStrings();
      } else if (geom.getType() === GeometryType.MULTI_POLYGON) {
        multiGeometries = geom.getPolygons();
      } else if (geom.getType() === GeometryType.MULTI_POINT) {
        multiGeometries = geom.getPoints();
      }
      // At this point multiGeometries contains only single geometry.
      multiGeometries.forEach((geomm) => {
        if (geomm.getType() === GeometryType.POLYGON) {
          geomm.getCoordinates()[0].forEach((coordinate) => {
            coordinates.push(coordinate);
          });
        } else if (geomm.getType() === GeometryType.LINE_STRING) {
          coordinates.push(...geomm.getCoordinates());
        } else if (geomm.getType() === GeometryType.POINT) {
          coordinates.push(geomm.getCoordinates());
        }
      });
    });
    return new GeometryCollection([
      f.getGeometry(),
      new MultiPoint(coordinates),
    ]);
  },
});

const OLD_STYLES_PROP = 'oldStyles';

// Return an array of styles
const getStyles = (style, feature) => {
  if (!style) {
    return [];
  }
  let styles = style;
  if (typeof style === 'function') {
    if (feature) {
      // styleFunction
      styles = style(feature);
    } else {
      // featureStyleFunction
      styles = style();
    }
  }
  return Array.isArray(styles) ? styles : [styles];
};

/**
 * Apply a style to an existing one, creating an array of styles.
 * @param {*} feature
 * @param {*} styleToApply
 */
const applySelectStyle = (feature, styleToApply) => {
  const featureStyles = getStyles(feature.getStyleFunction());
  const stylesToApply = getStyles(styleToApply, feature);

  // At this point featureStyles must not contain the select styles.
  const newStyles = [...featureStyles, ...stylesToApply];
  feature.set(OLD_STYLES_PROP, featureStyles);
  feature.setStyle(newStyles);
};

const onSelectedFeatureChange = (feature, selectStyle) => {
  const featureStyles = getStyles(feature.getStyleFunction());
  const oldStyles = feature.get(OLD_STYLES_PROP);
  if (!oldStyles) {
    return;
  }
  const isStyleChanged = oldStyles.some(
    (style, idx) => style !== featureStyles[idx],
  );
  if (isStyleChanged) {
    // If the user changes the style of the feature, we reapply the select style.
    applySelectStyle(feature, selectStyle);
  }
};

/**
 * Apply a style to an existing one.
 * @param {*} feature
 * @param {*} styleToApply
 */
export const onSelectFeature = (feature, selectStyle, listenerPropName) => {
  if (!feature.getStyleFunction()) {
    return;
  }

  // Append the select style to the feature's style
  applySelectStyle(feature, selectStyle);

  // Ensure we don't have twice the same event registered.
  const listenerKey = feature.get(listenerPropName);
  if (listenerKey) {
    unByKey(listenerKey);
    feature.unset(listenerKey);
  }

  feature.set(
    listenerPropName,
    feature.on('change', (e) => {
      // On change of the feature's style, we re-apply the selected Style.
      onSelectedFeatureChange(e.target, selectStyle);
    }),
  );
};

export const onDeselectFeature = (feature, selectStyle, listenerPropName) => {
  if (!feature.getStyleFunction()) {
    return;
  }

  const listenerKey = feature.get(listenerPropName);
  if (listenerKey) {
    unByKey(listenerKey);
    feature.unset(listenerKey);
  }

  // Remove the select styles
  feature.unset(OLD_STYLES_PROP);
  const styles = getStyles(feature.getStyleFunction(), null);
  const selectStyles = getStyles(selectStyle, feature);
  const featureStyles = styles.slice(0, styles.indexOf(selectStyles[0]));
  feature.setStyle(featureStyles);
};

export default {};
