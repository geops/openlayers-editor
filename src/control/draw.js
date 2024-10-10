import { Draw } from "ol/interaction";

import drawLineSVG from "../../img/draw_line.svg";
import drawPointSVG from "../../img/draw_point.svg";
import drawPolygonSVG from "../../img/draw_polygon.svg";
import Control from "./control";

/**
 * Control for drawing features.
 * @extends {Control}
 * @alias ole.DrawControl
 */
class DrawControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {string} [options.type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {Object} [options.drawInteractionOptions] Options for the Draw interaction (ol/interaction/Draw).
   * @param {ol.style.Style.StyleLike} [options.style] Style used for the draw interaction.
   */
  constructor(options) {
    let image = null;

    switch (options?.type) {
      case "Polygon":
        image = drawPolygonSVG;
        break;
      case "LineString":
        image = drawLineSVG;
        break;
      default:
        image = drawPointSVG;
    }

    super({
      className: "ole-control-draw",
      image,
      title: `Draw ${options?.type || "Point"}`,
      ...(options || {}),
    });

    /**
     * @type {ol.interaction.Draw}
     */
    this.drawInteraction = new Draw({
      features: options?.features,
      source: options?.source,
      stopClick: true,
      style: options?.style,
      type: options?.type || "Point",
      ...(options?.drawInteractionOptions || {}),
    });

    this.drawInteraction.on("drawstart", (evt) => {
      this.editor.setDrawFeature(evt.feature);
    });

    this.drawInteraction.on("drawend", () => {
      this.editor.setDrawFeature();
    });
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map?.addInteraction(this.drawInteraction);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate(silent) {
    this.map?.removeInteraction(this.drawInteraction);
    super.deactivate(silent);
  }
}

export default DrawControl;
