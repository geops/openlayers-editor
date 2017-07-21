window.ole = {};

import Editor from './editor.js';
import Control from './control/control.js';
import CadControl from './control/cad.js';
import RotateControl from './control/rotate.js';
import DrawControl from './control/draw.js';
import MoveControl from './control/move.js';
import ModifyControl from './control/modify.js';
import DeleteControl from './control/delete.js';

window.ole = {
  Editor: Editor,
  Control: Control,
  CadControl: CadControl,
  RotateControl: RotateControl,
  DrawControl: DrawControl,
  MoveControl: MoveControl,
  ModifyControl: ModifyControl,
  DeleteControl: DeleteControl
};
