import canvas from 'canvas';

window.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 1);
};

['CanvasRenderingContext2D', 'CanvasPattern', 'CanvasGradient'].forEach(obj => {
  global[obj] = canvas[obj]
});

import ol from 'openlayers';
global.ol = ol;
