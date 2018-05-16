/**
 * OLE service base class.
 * @alias ole.Service
 */
export default class Service {
  constructor() {
    this.active = false;

    /**
     * @type {ole.Editor}
     * @private
     */
    this.editor = null;

    /**
     * @type {ol.Map}
     * @private
     */
    this.map = null;
  }

  /**
   * Activate the service.
   * @priavte
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivate the service.
   * @priavte
   */
  deactivate() {
    this.active = false;
  }

  /**
   * Set the service's editor instance.
   * @param {ole.Editor} editor Editor instance.
   */
  setEditor(editor) {
    this.editor = editor;
  }

  /**
   * Set the service's map.
   * @param {ol.Map} map Map object.
   */
  setMap(map) {
    this.map = map;
  }
}
