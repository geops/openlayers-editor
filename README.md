# Openlayers Editor

[![Travis badge](https://api.travis-ci.org/geops/openlayers-editor.svg?branch=master)](https://travis-ci.org/geops/openlayers-editor)

OpenLayers Editor (OLE) is based on [OpenLayers](https://openlayers.org/) and provides a set of controls for extended editing of spatial data.

Contributions are welcome! Feel free to add more controls and to extend the current functionality.
Additionally, the build process is currently very basic and could be optimized.
Translations would be nice, too.

## Features
- CAD tool for geometry alignment
- Drawing line, point and polygon features
- Moving and rotating geometries
- Modifying geometries
- Deleting geometries
- Topology operations using [JSTS](https://github.com/bjornharrtell/jsts): buffer, union, intersection, difference
- Toolbar for activating and deactivating controls

## Demo
For a demo, visit [https://openlayers-editor.geops.de](https://openlayers-editor.geops.de).

## Dependencies
- node & npm

## Getting started
- Clone this repository
- Install: `npm install`
- Run: `npm start`
- Open your browser and visit [http://localhost:5000](http://localhost:5000)

## Usage
```js
var editor = new ole.Editor(map);

var cad = new ole.control.CAD({
  source: editLayer.getSource()
});

var draw = new ole.control.Draw({
  source: editLayer.getSource()
});

editor.addControls([draw, cad]);

```

## Development
- Build: `npm run build`
- Create doc: `npm run-script doc`
