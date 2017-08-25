import Control from './control.js';
import mustache from 'mustache';
import cadPng from '../../img/cad.png';

/**
 * Control with snapping functionality for geometry alignment.
 * @extends {ole.Control}
 * @alias ole.CadControl
 */
export default class CadControl extends Control {
  /**
   * @param {Object} options Tool options.
   * @param {Number} [options.snapTolerance] Snap tolerance in pixel
   *   for snap lines. Default is 10.
   * @param {Boolean} [options.showSnapLines] Whether to show
   *   snap lines (default is true).
   * @param {Boolean} [options.showSnapPoints] Whether to show
   *  snap points around the closest feature.
   * @param {Number} [options.snapPointDist] Distance of the
   *   snap points (default is 30).
   * @param {Boolean} [options.useMapUnits] Whether to use map units
   *   as measurement for point snapping. Default is false (pixel are used).
   */
  constructor(options) {
    super(
      Object.assign(options, {
        title: 'CAD control',
        className: 'ole-control-cad',
        image: cadPng
      })
    );

    /**
     * If true, map units are used for point snapping.
     * The default measurement are pixels.
     */
    this.useMapUnits = options.useMapUnits;

    /**
     * Interaction for handling move events.
     * @type {ol.interactionPointer}
     * @private
     */
    this.pointerInteraction = new ol.interaction.Pointer({
      handleMoveEvent: this.onMove.bind(this)
    });

    /**
     * Layer for drawing snapping geometries.
     * @type {ol.layer.Vector}
     * @private
     */
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

    /**
     * Snap tolerance in pixel.
     * @type {Number}
     * @private
     */
    this.snapTolerance = options.snapTolerance || 10;

    /**
     * Interaction for snapping
     * @type {ol.interaction.Snap}
     * @private
     */
    this.snapInteraction = new ol.interaction.Snap({
      pixelTolerance: this.snapTolerance,
      source: this.snapLayer.getSource()
    });

    /**
     * Whether to show the snap points.
     * @type {Boolean}
     * @private
     */
    this.showSnapPoints = options.showSnapPoints;

    /**
     * Initial distance of snap points.
     * @type {Number}
     * @private
     */
    this.snapPointDist = options.snapPointDist || 30;

    /**
     * Whether to show snap lines.
     * @type {Boolean}
     * @private
     */
    this.showSnapLines = options.showSnapLines;

    if (this.showSnapLines === 'undefined') {
      this.showSnapLines = true;
    }

    this.standalone = false;
  }

  /**
   * @inheritdoc
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
   * @private
   * @param {ol.MapBrowserEvent} evt Move event.
   */
  onMove(evt) {
    var features = this.getClosestFeatures(evt.coordinate, 5);

    // Don't snap on the edit feature
    var editFeature = this.editor.getEditFeature();
    if (editFeature && features.indexOf(editFeature) > -1) {
      features.splice(features.indexOf(editFeature), 1);
    }

    this.snapLayer.getSource().clear();

    if (this.showSnapLines) {
      this.drawSnapLines(features, evt.coordinate);
    }

    if (this.showSnapPoints && features.length) {
      this.drawSnapPoints(evt.coordinate, features[0]);
    }
  }

  /**
   * Returns a list of the {num} closest features
   * to a given coordinate.
   * @private
   * @param {ol.Coordinate} coordinate Coordinate.
   * @param {Number} num Number of features to search.
   * @returns {Array.<ol.Feature>} List of closest features.
   */
  getClosestFeatures(coordinate, num) {
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
   * @private
   * @param {Array.<ol.Feature>} features List of features.
   * @param {ol.Coordinate} coordinate Mouse pointer coordinate.
   */
  drawSnapLines(features, coordinate) {
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
   * @private
   * @param {ol.Coordinate} coordinateMouse cursor coordinate.
   * @param {ol.eaturee} feature Feature to draw the snap points for.
   */
  drawSnapPoints(coordinate, feature) {
    var featCoord = feature.getGeometry().getClosestPoint(coordinate);

    var px = this.map.getPixelFromCoordinate(featCoord);
    var snapCoords = [];

    if (this.useMapUnits) {
      snapCoords = [
        [featCoord[0] - this.snapPointDist, featCoord[1]],
        [featCoord[0] + this.snapPointDist, featCoord[1]],
        [featCoord[0], featCoord[1] - this.snapPointDist],
        [featCoord[0], featCoord[1] + this.snapPointDist]
      ];
    } else {
      var snapPx = [
        [px[0] - this.snapPointDist, px[1]],
        [px[0] + this.snapPointDist, px[1]],
        [px[0], px[1] - this.snapPointDist],
        [px[0], px[1] + this.snapPointDist]
      ];

      for (var j = 0; j < snapPx.length; j++) {
        snapCoords.push(this.map.getCoordinateFromPixel(snapPx[j]));
      }
    }

    var snapGeom = new ol.geom.MultiPoint(snapCoords);
    this.snapLayer.getSource().addFeature(new ol.Feature(snapGeom));
  }

  /**
   * Open the control's dialog.
   * @private
   */
  openDialog() {
    var distLabel = this.useMapUnits ? 'map units' : 'px';

    var tpl = [
      '<div class="ole-dialog" id="{{className}}-dialog">' +
        '<div><input type="radio" name="radioBtn" {{#c1}}checked{{/c1}} id="aux-cb">' +
        '<label>Show snap lines</label></div>' +
        '<div><input type="radio" name="radioBtn" {{#c2}}checked{{/c2}} id="dist-cb">' +
        '<label>Show snap points. Distance (' +
        distLabel +
        '): </label>' +
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
        this.showSnapPoints = !this.showSnapLines;
      }.bind(this)
    );

    document.getElementById('dist-cb').addEventListener(
      'change',
      function(evt) {
        this.showSnapPoints = evt.target.checked;
        this.showSnapLines = !this.showSnapPoints;
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
   * @private
   */
  closeDialog() {
    var div = document.getElementById(this.className + '-dialog');
    if (div) {
      this.map.getTargetElement().removeChild(div);
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    super.activate();
    this.map.addInteraction(this.pointerInteraction);
    this.map.addInteraction(this.snapInteraction);
    this.openDialog();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    super.deactivate();
    this.map.removeInteraction(this.pointerInteraction);
    this.map.removeInteraction(this.snapInteraction);
    this.closeDialog();
  }
}
