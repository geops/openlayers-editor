import ol from 'openlayers';
global.ol = ol;
import canvas from 'canvas';

window.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 1);
};


['CanvasRenderingContext2D', 'CanvasPattern', 'CanvasGradient'].forEach(obj => {
  global[obj] = canvas[obj]
});
