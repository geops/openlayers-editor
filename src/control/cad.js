import Control from './control.js';

export default class CadControl extends Control {

  /**
   * Tool with CAD drawing functions.
   * @param {Object} options Tool options.
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.Collection<ol.Feature>} [features] Destination for drawing.
   * @param {ol.source.Vector} [source] Destination for drawing.
   * @param {Number} [numAuxiliaryLines] Number of angles for auxiliary lines.
   *   Default is 2.
   */
  constructor(options) {
    super(Object.assign(options, {
      source: options.source,
      features: options.features,
      title: 'CAD control',
      className: 'icon-cad'
    }));

    // Closest feature to the pointer
    this.closestFeature = null;

    // Number of draw engles
    this.numAuxiliaryLines = options.numAuxiliaryLines || 5;

    this.pointerInteraction = new ol.interaction.Pointer({
      handleMoveEvent: this._onMove.bind(this)
    });

    this.snapLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    });

    this.map.addLayer(this.snapLayer);

    this.snapInteraction = new ol.interaction.Snap({
      pixelTolerance: 20,
      source: this.snapLayer.getSource()
    });
  }

  /**
   * Handle move event.
   */
  _onMove(evt) {
    var features = this._getClosestFeatures(evt.coordinate, 4);
    this._drawAuxiliaryLines(features);
  }

  /**
   * Returns a list of the (num} closest features
   * to a given coordinate.
   * @param {ol.Coordinate} coordinate Coordinate.
   * @param {Number} num Number of features to search.
   * @returns {Array.<ol.Feature>} List of closest features.
   */
   _getClosestFeatures(coordinate, num) {
    num = num || 1;
    var ext = [-Infinity, -Infinity, Infinity, Infinity];
    var featureDict = {};

    this.source.forEachFeatureInExtent(ext, function(f) {
      var cCoord = f.getGeometry().getClosestPoint(coordinate);
      var dx = cCoord[0] - coordinate[0];
      var dy = cCoord[1] - coordinate[1];
      var dist = dx * dx + dy * dy;
      featureDict[dist] = f;
    });

    var dists = Object.keys(featureDict);
    var features = [];
    var count = Math.min(dists.length, num);

    dists.sort(function(a, b) {
      return a - b;
    });

    for (var i = 0; i < count; i++) {
      features.push(featureDict[dists[i]]);
    }

    return features;
  }

  /**
   * Returns an auxiliary line through a given coordinate
   * in a given angle and a given length.
   * @parma {ol.coordinate} coord The coordinate
   * @param {Number} length Line length
   * @param {Number} angle Line angle (rad).
   * @returns {ol.geom.LineString} Auxiliary line
   */
  _getAuxiliaryLine(coord, length, angle) {
    length /= 2;
    return new ol.geom.LineString([
      [
        coord[0] + Math.cos(angle) * length,
        coord[1] - Math.sin(angle) * length
      ], [
        coord[0] + Math.cos(angle - Math.PI) * length,
        coord[1] - Math.sin(angle - Math.PI) * length
      ]
    ]);
  }

  /**
   * Get auxiliary lines building the extent of
   * two given coordinates.
   * @param {ol.Coordinate} coord1 First coordinate.
   * @param {ol.Coordinate} coord2 Second coordinate.
   * @returns {Array.<ol.geom.LineString>} Set of lines.
   */
  _getAuxiliaryLines(coord1, coord2) {
    var minX = Math.min(coord1[0], coord2[0]);
    var minY = Math.min(coord1[1], coord2[1]);
    var maxX = Math.max(coord1[0], coord2[0]);
    var maxY = Math.max(coord1[1], coord2[1]);

    var coords = [
      [[minX, minY], [maxX, minY]],
      [[maxX, minY], [maxX, maxY]],
      [[maxX, maxY], [minX, maxY]],
      [[minX, maxY], [minX, minY]]
    ];

    var lines = [];

    for (var i = 0; i < coords.length; i++) {
      lines.push(new ol.geom.LineString(coords[i]));
    }

    return lines;
  }

  /**
   * Draws auxiliary lines by building the extent for
   * a pair of features.
   * @param {Array.<ol.Feature>} features List of features.
   */
  _drawAuxiliaryLines(features) {
    this.snapLayer.getSource().clear();

    var auxCoords = [];
    for (var i = 0; i < features.length; i++) {
      var geom = features[i].getGeometry();

      if (geom instanceof ol.geom.Point) {
        auxCoords.push(geom.getCoordinates());
      } else {
        var coords = ol.geom.Polygon.fromExtent(
          geom.getExtent()).getCoordinates()[0];
        auxCoords = auxCoords.concat(coords);
      }
    }

    for (i = 0; i < auxCoords.length; i++) {
      for (var j = 0; j < auxCoords.length; j++) {
        if (auxCoords[i] !== auxCoords[j]) {
            var l = this._getAuxiliaryLines(auxCoords[i], auxCoords[j]);
            for (var k = 0; k < l.length; k++) {
              var feat = new ol.Feature(l[k]);
              this.snapLayer.getSource().addFeature(feat);
            }
          }
        }
     }
  }

  /**
   * Activate the control.
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);
    super.activate();
  }

  /**
   * Deactivate the control.
   */
  deactivate() {
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
    super.deactivate();
  }
}
