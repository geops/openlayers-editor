import Control from './control.js';
import mustache from 'mustache';
import cadPng from '../../img/cad.png';

export default class CadControl extends Control {
  /**
   * Tool with CAD drawing functions.
   * @param {Object} options Tool options.
   * @param {ol.Collection<ol.Feature>} [options.features] Destination
   *   for drawing.
   * @param {ol.source.Vector} [options.source] Destination for drawing.
   * @param {Number} [options.snapTolerance] Snap tolerance in pixel
   *   for snap lines. Default is 10.
   * @param {Boolean} [options.showSnapLines] Whether to show
   *   snap lines (default is true).
   * @param {Boolean} [options.showSnapPoints] Whether to show
   *  snap points around the closest feature.
   * @param {Number} [options.snapPointDist] Distance of the
   *   snap points in pixel (default is 30).
   */
  constructor(options) {
    super(
      Object.assign(options, {
        title: 'CAD control',
        className: 'icon-cad',
        image: cadPng
      })
    );

    this.pointerInteraction = new ol.interaction.Pointer({
      handleMoveEvent: this._onMove.bind(this)
    });

    // layer with snapping geometries
    this.snapLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: [
        new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: new ol.style.Fill({
              color: '#E8841F'
            }),
            stroke: new ol.style.Stroke({
              width: 1,
              color: '#618496'
            }),
            points: 4,
            radius: 5,
            radius2: 0,
            angle: Math.PI / 4
          }),
          stroke: new ol.style.Stroke({
            width: 1,
            lineDash: [5, 10],
            color: '#618496'
          })
        })
      ]
    });

    // Snap tolerance in pixel
    this.snapTolerance = options.snapTolerance || 10;

    // The control's snap interaction
    this.snapInteraction = new ol.interaction.Snap({
      pixelTolerance: this.snapTolerance,
      source: this.snapLayer.getSource()
    });

    // Whether to show the snap points
    this.showSnapPoints = options.showSnapPoints;

    // Cell width of the snap grid in px
    this.snapPointDist = options.snapPointDist || 30;

    // Whether to show snap lines
    if (typeof options.showSnapLines === 'undefined') {
      this.showSnapLines = true;
    } else {
      this.showSnapLines = options.showSnapLines;
    }

    // control can be activated together with
    // other controls, like Draw.
    this.standalone = false;
  }

  /**
   * Set the map of the control.
   */
  setMap(map) {
    super.setMap(map);
    this.map.addLayer(this.snapLayer);

    // Ensure that the snap interaction is at the last position
    // as it must be the first to handle the  pointermove event.
    this.map.getInteractions().on(
      'change:length',
      function(e) {
        var pos = e.target.getArray().indexOf(this.snapInteraction);

        if (this.active && pos > -1 && pos !== e.target.getLength() - 1) {
          this.deactivate();
          this.activate();
        }
      },
      this
    );
  }

  /**
   * Handle move event.
   * @param {ol.MapBrowserEvent} evt Move event.
   */
  _onMove(evt) {
    var features = this._getClosestFeatures(evt.coordinate, 5);

    // Don't snap on the edit feature
    var editFeature = this.editor.getEditFeature();
    if (editFeature && features.indexOf(editFeature) > -1) {
      features.splice(features.indexOf(editFeature), 1);
    }

    this.snapLayer.getSource().clear();

    if (this.showSnapLines) {
      this._drawSnapLines(features, evt.coordinate);
    }

    if (this.showSnapPoints && features.length) {
      this._drawSnapPoints(evt.coordinate, features[0]);
    }
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
   * Draws snap lines by building the extent for
   * a pair of features.
   * @param {Array.<ol.Feature>} features List of features.
   * @param {ol.Coordinate} coordinate Mouse pointer coordinate.
   */
  _drawSnapLines(features, coordinate) {
    var auxCoords = [];
    for (var i = 0; i < features.length; i++) {
      var geom = features[i].getGeometry();

      if (geom instanceof ol.geom.Point) {
        auxCoords.push(geom.getCoordinates());
      } else {
        var coords = ol.geom.Polygon
          .fromExtent(geom.getExtent())
          .getCoordinates()[0];
        auxCoords = auxCoords.concat(coords);
      }
    }

    var px = this.map.getPixelFromCoordinate(coordinate);
    var lineCoords;

    for (i = 0; i < auxCoords.length; i++) {
      var auxPx = this.map.getPixelFromCoordinate(auxCoords[i]);
      if (
        px[0] > auxPx[0] - this.snapTolerance / 2 &&
        px[0] < auxPx[0] + this.snapTolerance / 2
      ) {
        var newY = px[1];
        newY += px[1] < auxPx[1]
          ? -this.snapTolerance * 2
          : this.snapTolerance * 2;

        lineCoords = [
          this.map.getCoordinateFromPixel([auxPx[0], newY]),
          auxCoords[i]
        ];
      } else if (
        px[1] > auxPx[1] - this.snapTolerance / 2 &&
        px[1] < auxPx[1] + this.snapTolerance / 2
      ) {
        var newX = px[0];
        newX += px[0] < auxPx[0]
          ? -this.snapTolerance * 2
          : this.snapTolerance * 2;

        lineCoords = [
          this.map.getCoordinateFromPixel([newX, auxPx[1]]),
          auxCoords[i]
        ];
      }

      if (lineCoords) {
        var g = new ol.geom.LineString(lineCoords);
        this.snapLayer.getSource().addFeature(new ol.Feature(g));
      }
    }
  }

  /**
   * Adds snap points to the snapping layer.
   * @param {ol.Coordinate} coordinateMouse cursor coordinate.
   * @param {ol.eaturee} feature Feature to draw the snap points for.
   */
  _drawSnapPoints(coordinate, feature) {
    var featCoord = feature.getGeometry().getClosestPoint(coordinate);

    var px = this.map.getPixelFromCoordinate(featCoord);
    var snapPx = [
      [px[0] - this.snapPointDist, px[1]],
      [px[0] + this.snapPointDist, px[1]],
      [px[0], px[1] - this.snapPointDist],
      [px[0], px[1] + this.snapPointDist]
    ];

    var snapCoords = [];

    for (var j = 0; j < snapPx.length; j++) {
      snapCoords.push(this.map.getCoordinateFromPixel(snapPx[j]));
    }

    var snapGeom = new ol.geom.MultiPoint(snapCoords);
    this.snapLayer.getSource().addFeature(new ol.Feature(snapGeom));
  }

  /**
   * Open the control's dialog.
   */
  _openDialog() {
    var tpl = [
      '<div class="ole-dialog" id="{{className}}-dialog">' +
        '<div><input type="checkbox" {{#c1}}checked{{/c1}} id="aux-cb">' +
        '<label>Show snap lines</label></div>' +
        '<div><input type="checkbox" {{#c2}}checked{{/c2}} id="dist-cb">' +
        '<label>Show snap points. Distance (px): </label>' +
        '<input type="text" id="width-input" value="{{gridWidth}}"></div>' +
        '</div>'
    ].join('');

    var div = document.createElement('div');
    div.innerHTML = mustache.render(tpl, {
      className: this.className,
      gridWidth: this.snapPointDist,
      c1: this.showSnapLines,
      c2: this.showSnapPoints
    });

    this.map.getTargetElement().appendChild(div.firstChild);

    document.getElementById('aux-cb').addEventListener(
      'change',
      function(evt) {
        this.showSnapLines = evt.target.checked;
      }.bind(this)
    );

    document.getElementById('dist-cb').addEventListener(
      'change',
      function(evt) {
        this.showSnapPoints = evt.target.checked;
      }.bind(this)
    );

    document.getElementById('width-input').addEventListener(
      'keyup',
      function(evt) {
        if (parseFloat(evt.target.value)) {
          this.snapPointDist = parseFloat(evt.target.value);
        }
      }.bind(this)
    );
  }

  /**
   * Closes the control dialog.
   */
  _closeDialog() {
    var div = document.getElementById(this.className + '-dialog');
    if (div) {
      this.map.getTargetElement().removeChild(div);
    }
  }

  /**
   * Activate the control.
   */
  activate() {
    super.activate();
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);
    this._openDialog();
  }

  /**
   * Deactivate the control.
   */
  deactivate() {
    super.deactivate();
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
    this._closeDialog();
  }
}
