import { doubleClick } from "ol/events/condition";
import { MultiPoint } from "ol/geom";
import GeometryCollection from "ol/geom/GeometryCollection";
import Select from "ol/interaction/Select";
import { Circle, Fill, Stroke, Style } from "ol/style";

// Default style on modifying geometries
const selectModifyStyle = new Style({
  fill: new Fill({
    color: "rgba(255,255,255,0.4)",
  }),
  geometry: (f) => {
    const coordinates = [];
    const geometry = f.getGeometry();
    let geometries = [geometry];
    if (geometry.getType() === "GeometryCollection") {
      geometries = geometry.getGeometriesArrayRecursive();
    }

    // At this point geometries doesn't contains any GeometryCollections.
    geometries.forEach((geom) => {
      let multiGeometries = [geom];
      if (geom.getType() === "MultiLineString") {
        multiGeometries = geom.getLineStrings();
      } else if (geom.getType() === "MultiPolygon") {
        multiGeometries = geom.getPolygons();
      } else if (geom.getType() === "MultiPoint") {
        multiGeometries = geom.getPoints();
      }
      // At this point multiGeometries contains only single geometry.
      multiGeometries.forEach((geomm) => {
        if (geomm.getType() === "Polygon") {
          geomm.getLinearRings().forEach((ring) => {
            coordinates.push(...ring.getCoordinates());
          });
        } else if (geomm.getType() === "LineString") {
          coordinates.push(...geomm.getCoordinates());
        } else if (geomm.getType() === "Point") {
          coordinates.push(geomm.getCoordinates());
        }
      });
    });
    return new GeometryCollection([
      f.getGeometry(),
      new MultiPoint(coordinates),
    ]);
  },
  image: new Circle({
    fill: new Fill({
      color: "#05A0FF",
    }),
    radius: 5,
    stroke: new Stroke({ color: "#05A0FF", width: 2 }),
  }),
  stroke: new Stroke({
    color: "#05A0FF",
    width: 3,
  }),
  zIndex: 10000, // Always on top
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
          hitTolerance: this.hitTolerance_,
          layerFilter: this.layerFilter_,
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
