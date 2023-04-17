import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser';
import { LineString, MultiPoint, Point, Polygon } from 'ol/geom';

// Create a JSTS parser for OpenLayers geometry.
const parser = new OL3Parser();
parser.inject(Point, LineString, Polygon, MultiPoint);

export default parser;
