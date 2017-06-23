# Openlayers Editor

OpenLayers Editor (OLE) provides a set of controls for extended editing of spatial data.
This is the new version of OLE which is based on OpenLayers 4.
For the old version using OpenLayers 2, see
[https://github.com/geops/ole2](https://github.com/geops/ole2).

## Features
- CAD tool for geometry alignment
- Drawing line, point and polygon features
- Moving and rotating geometries
- Modifying geometries
- Toolbar for activating and deactivating controls

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


## TODO
- Feel free to add more controls and to extend the current functionality.
- The build process is currently very basic and could be optimized.
