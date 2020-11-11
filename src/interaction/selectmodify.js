/* eslint-disable no-underscore-dangle */
import Select from 'ol/interaction/Select';
import { doubleClick } from 'ol/events/condition';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { MultiPoint } from 'ol/geom';
import GeometryType from 'ol/geom/GeometryType';

// Default style on modifying geometries
const selectModifyStyle = new Style({
  zIndex: 10000, // Always on top
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

/**
 * Select features for modification by a Modify interaction.
 *
 * Default behavior:
 *  - Double click on the feature to select one feature.
 *  - Click on the map to deselect all features.
 */
class SelectModify extends Select {
  /**
   * @param {Options=} options Options.
   * @ignore
   */
  constructor(options) {
    super({
      condition: doubleClick,
      wrapX: false,
      style: selectModifyStyle,
      ...options,
    });
  }

  // We redefine the handle method to avoid propagation of double click to the map.
  handleEvent(mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
      return true;
    }
    const add = this.addCondition_(mapBrowserEvent);
    const remove = this.removeCondition_(mapBrowserEvent);
    const toggle = this.toggleCondition_(mapBrowserEvent);
    const { map } = mapBrowserEvent;
    const set = !add && !remove && !toggle;
    if (set) {
      let isEvtOnSelectableFeature = false;
      map.forEachFeatureAtPixel(
        mapBrowserEvent.pixel,
        (feature, layer) => {
          if (this.filter_(feature, layer)) {
            isEvtOnSelectableFeature = true;
          }
        },
        {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_,
        },
      );

      if (isEvtOnSelectableFeature) {
        // if a feature is about to be selected or unselected we stop event propagation.
        super.handleEvent(mapBrowserEvent);
        return false;
      }
    }

    return super.handleEvent(mapBrowserEvent);
  }
}

export default SelectModify;
