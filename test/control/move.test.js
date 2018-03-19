import MoveControl from '../../src/control/move';
import Editor from '../../src/editor';

describe('ole.control.Move', () => {
  it('should instantiate', () => {
    const inst = new MoveControl();
    expect(inst).toBeInstanceOf(MoveControl);
  });

  it('shoud be inactive per default', () => {
    const inst = new MoveControl();
    expect(inst.active).toBeFalsy();
  });

  it('can be activated', () => {
    const map = new ol.CanvasMap({
      target: document.createElement('div'),
    });

    const editor = new Editor(map);
    const inst = new MoveControl();

    editor.addControl(inst);
    inst.activate();
    expect(inst.active).toBeTruthy();
  });
});

