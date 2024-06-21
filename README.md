# Openlayers Editor

![npm](https://img.shields.io/npm/v/ole)
![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)
![code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)
![unit tests](https://github.com/geops/openlayers-editor/actions/workflows/lint.yml/badge.svg)
![e2e tests](https://github.com/geops/openlayers-editor/actions/workflows/cypress.yml/badge.svg)
![Deploy](https://vercelbadge.vercel.app/api/geops/openlayers-editor)

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

For a demo, visit [https://openlayers-editor.geops.com](https://openlayers-editor.geops.com).

## Dependencies

- node & npm

## Getting started

- Clone this repository
- Install: `yarn install`
- Build: `yarn build`
- Run: `yarn start`
- Open your browser and visit [http://localhost:8080](http://localhost:8080)

## Usage

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/ole@latest/style/ole.css" />
<script src="https://cdn.jsdelivr.net/npm/ole@latest/index.js"></script>
```

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

### Versions and Changelog

This repo uses [standard-version](https://github.com/conventional-changelog/standard-version/) for release versioning and changelog management. Therefore updates should be committed using [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) messages:

```text

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

1. fix: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in semantic versioning).
2. feat: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in semantic versioning).
3. BREAKING CHANGE: a commit that has a footer BREAKING CHANGE:, or appends a ! after the type/scope, introduces a breaking API change (correlating with MAJOR in semantic versioning). A BREAKING CHANGE can be part of commits of any type.
4. types other than fix: and feat: are allowed, for example @commitlint/config-conventional (based on the the Angular convention) recommends build:, chore:, ci:, docs:, style:, refactor:, perf:, test:, and others.
5. footers other than BREAKING CHANGE: <description> may be provided and follow a convention similar to git trailer format.

Additional types are not mandated by the Conventional Commits specification, and have no implicit effect in semantic versioning (unless they include a BREAKING CHANGE). A scope may be provided to a commit’s type, to provide additional contextual information and is contained within parenthesis, e.g., feat(parser): add ability to parse arrays.

## Contributing

All PRs are welcome and will be reviewed soon or later. Please make sure to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
