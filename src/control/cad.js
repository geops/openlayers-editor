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
    this.numAuxiliaryLines = options.numAuxiliaryLines || 2;

    this.pointerInteraction = new ol.interaction.Pointer({
      handleMoveEvent: this._onMove.bind(this)
    });

    this.snapLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    });

    this.map.addLayer(this.snapLayer);

    this.snapInteraction = new ol.interaction.Snap({
      source: this.snapLayer.getSource()
    });
  }

  /**
   * Handle move event.
   */
  _onMove(evt) {
    var features = this._getClosestFeatures(evt.coordinate, 4);
    this._drawAuxiliaryLines(features);
    this._drawDistanceHelperPoints();
  }

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
   * For the set of auxiliary lines in the snapLayer,
   * check if there are further points on the line. If so, add
   * snap geometries that help adding equidistant features.
   */
  _drawDistanceHelperPoints() {
    var feats = this.snapLayer.getSource().getFeatures().filter(function(f) {
      return f.getGeometry() instanceof ol.geom.LineString;
    });

    for (var i = 0, len = feats.length; i < len; i++) {
      var p = feats[i].getGeometry();
    }
  }

  /**
   * http://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
   */
  _getIntersectionPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua;
    var ub;
    var denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);

    if (!denom) {
      return;
    }

    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3)) / denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3)) / denom;

    return {
      x: x1 + ua*(x2 - x1),
      y: y1 + ua*(y2 - y1),
      seg1: ua >= 0 && ua <= 1,
      seg2: ub >= 0 && ub <= 1
    };
  }

  _drawIntercectionPoints() {
    var feats = this.snapLayer.getSource().getFeatures().filter(function(f) {
      return f.getGeometry() instanceof ol.geom.LineString;
    });

    for (var i = 0, len = feats.length; i++) {}
  }

  /**
   * Draws the auxiliary lines for snapping to
   * the given feature.
   * @param {Array.<ol.Feature>} feature Feature to draw auxiliary lines for.
   */
  _drawAuxiliaryLines(features) {
    this.snapLayer.getSource().clear();

    for (var i = 0; i < features.length; i++) {
      var ext = features[i].getGeometry().getExtent();
      var coords = ol.geom.Polygon.fromExtent(ext).getCoordinates()[0];
      var oldCoord = [0, 0];

      for (var j = 0; j < coords.length; j++) {
        if (coords[i][0] === oldCoord[0] && coords[j][1] === oldCoord[1]) {
          break;
        }

        oldCoord = coords[i];
        var currDeg = 0;
        var increment = 180 / this.numAuxiliaryLines;

        do {
          var rad = currDeg * (Math.PI / 180);
          var feat = new ol.Feature(this._getAuxiliaryLine(coords[j], 10000000, rad));
          this.snapLayer.getSource().addFeature(feat);

          currDeg += increment;
        } while (currDeg <= 180);

        this.snapInteraction.changed();
      }
    }
  }

  /**
   * Activate the control
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);
    super.activate();
  }

  deactivate() {
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
    super.deactivate();
  }
}
