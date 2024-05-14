/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, describe, beforeEach } from 'vitest';
import Map from 'ol/Map';
import Editor from './editor';
import CAD from './control/cad';
import ModifyControl from './control/modify';

describe('editor', () => {
  let map;
  let editor;
  let cad;
  let modify;

  beforeEach(() => {
    // In the test we use pixel as coordinates.
    map = new Map({
      target: document.createElement('div'),
    });
    editor = new Editor(map);
    cad = new CAD();
    modify = new ModifyControl();
  });

  test('adds a control', () => {
    editor.addControl(cad);
    expect(editor.controls.getArray()[0]).toBe(cad);
    expect(editor.activeControls.getLength()).toBe(0);
    expect(cad.map).toBe(map);
    expect(cad.editor).toBe(editor);
    expect(cad.getActive()).toBe();

    cad.activate();
    expect(cad.getActive()).toBe(true);
    expect(editor.activeControls.getArray()[0]).toBe(cad);
  });

  test('removes a control', () => {
    editor.addControl(cad);
    cad.activate();
    expect(cad.getActive()).toBe(true);
    expect(editor.controls.getArray()[0]).toBe(cad);
    expect(editor.activeControls.getArray()[0]).toBe(cad);
    editor.removeControl(cad);
    expect(editor.controls.getLength()).toBe(0);
    expect(editor.activeControls.getLength()).toBe(0);
    expect(cad.map).toBe();
    expect(cad.editor).toBe();
    expect(cad.getActive()).toBe(false);
  });

  test('is removed', () => {
    editor.addControl(modify);
    editor.addControl(cad);
    modify.activate();
    expect(modify.getActive()).toBe(true);
    expect(editor.controls.getArray()[0]).toBe(modify);
    expect(editor.controls.getArray()[1]).toBe(cad);
    expect(editor.activeControls.getArray()[0]).toBe(modify);
    expect(editor.activeControls.getArray()[0]).toBe(modify);
    editor.remove();
    expect(editor.controls.getLength()).toBe(0);
    expect(editor.activeControls.getLength()).toBe(0);
    expect(modify.map).toBe();
    expect(modify.editor).toBe();
    expect(modify.getActive()).toBe(false);
    expect(cad.map).toBe();
    expect(cad.editor).toBe();
    expect(cad.getActive()).toBe(false);
  });
});
