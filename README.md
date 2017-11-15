# Openlayers Editor

[![Greenkeeper badge](https://badges.greenkeeper.io/geops/ole2.svg)](https://greenkeeper.io/)
[![Travis badge](https://api.travis-ci.org/geops/ole2.svg?branch=master)](https://travis-ci.org/geops/ole2)

OpenLayers Editor (OLE) provides a set of controls for extended editing of spatial data.
This is the new version of OLE which is based on OpenLayers 4.
The old version using OpenLayers 2 can be found [here](https://github.com/geops/ole).

Contributions are welcome! Feel free to add more controls and to extend the current functionality.
Additionally, the build process is currently very basic and could be optimized.
Translations would be nice, too.

## Features
- CAD tool for geometry alignment
- Drawing line, point and polygon features
- Moving and rotating geometries
- Modifying geometries
- Toolbar for activating and deactivating controls

## Demo
For a demo, visit [http://ole.geops.de](http://ole.geops.de).

## Dependencies
- node & npm

## Getting started
- Clone this repository
- Install: `npm install`
- Run: `npm start`
- Open your browser and visit [http://localhost:8080](http://localhost:8080)

## Usage
```js
var editor = new ole.Editor(map);

var cad = new ole.CadControl({
  source: editLayer.getSource()
});

var draw = new ole.DrawControl({
  source: editLayer.getSource()
});

editor.addControls([draw, cad]);

```

## Development
- Build: `npm run build`
- Create doc: `npm run-script doc`
