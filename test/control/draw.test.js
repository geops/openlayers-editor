import DrawControl from '../../src/control/draw';
import Editor from '../../src/editor';

describe('ole.control.Draw', () => {
  beforeEach(() => {
    const map = new ol.Map({
      target: document.createElement('div'),
    });

    const editor = new Editor(map);
  });

  it('should instantiate', () => {
    const inst = new DrawControl();
    expect(inst).toBeInstanceOf(DrawControl);
  });

  it('should draw points per default', () => {
    const inst = new DrawControl();
    expect(inst.title).toBe('Draw Point');
  });

  it('should draw LineStrings.', () => {
    const inst = new DrawControl({ type: 'LineString' });
    expect(inst.title).toBe('Draw LineString');
  });

  it('should draw Polygons.', () => {
    const inst = new DrawControl({ type: 'Polygon' });
    expect(inst.title).toBe('Draw Polygon');
  });
});
