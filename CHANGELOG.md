# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/geops/openlayers-editor/compare/v1.1.6...v1.2.0) (2020-11-12)


### Features

* **version:** Installed standard-version to improve changelog ([00466c5](https://github.com/geops/openlayers-editor/commit/00466c56f0695bb62115159c1918704668d6266d))
* **version:** using standard-version and conventional-commits for version and release management, switched to yarn package manager ([ef321f9](https://github.com/geops/openlayers-editor/commit/ef321f9434501c398d6269c695c8aa4a3ff0cb7d))

## [1.2.0-beta.1](https://github.com/geops/openlayers-editor/compare/v1.2.0-beta.0...v1.2.0-beta.1) (2020-11-11)


### Bug Fixes

* **index:** fix demo page ([7cfab51](https://github.com/geops/openlayers-editor/commit/7cfab511f62de9bafb1945ac4b18a5fc7a495b38))
* remove unecessary properties ([24b2357](https://github.com/geops/openlayers-editor/commit/24b23571ecc2d2342fe53d840df10f3da8ba029e))
* use singleclick instead of click to avoid bugs ([37e1d9d](https://github.com/geops/openlayers-editor/commit/37e1d9d6b5889071184fb1dc996c300cefdf629a))
* **index:** fix demo page ([ea49c0a](https://github.com/geops/openlayers-editor/commit/ea49c0ad4dfaa8d230d742bd63a54a6f9b860677))
* **modify:** add a high zIndex to default modify style ([f3584b1](https://github.com/geops/openlayers-editor/commit/f3584b17ef915e2362f1fdca7563ee492af1234a))
* **modify:** use click instead of singleclick ([ecea48c](https://github.com/geops/openlayers-editor/commit/ecea48c4b94f64625289d4966bc1bcc9bfe5bf39))
* **selectmove:** add a default style with a high zIndex to selectmove interaction ([2222aaa](https://github.com/geops/openlayers-editor/commit/2222aaac49c93163077d4a0914118755a5b742d4))

## [1.2.0-beta.0](https://github.com/geops/openlayers-editor/compare/v1.1.6...v1.2.0-beta.0) (2020-11-11)


### Features

* **version:** Installed standard-version to improve changelog ([00466c5](https://github.com/geops/openlayers-editor/commit/00466c56f0695bb62115159c1918704668d6266d))
* **version:** using standard-version and conventional-commits for version and release management, switched to yarn package manager ([ef321f9](https://github.com/geops/openlayers-editor/commit/ef321f9434501c398d6269c695c8aa4a3ff0cb7d))

### [1.1.8-beta.6](https://github.com/geops/openlayers-editor/compare/v1.1.8-beta.2...v1.1.8-beta.6) (2020-11-09)


### Features

* **version:** Installed standard-version to improve changelog ([00466c5](https://github.com/geops/openlayers-editor/commit/00466c56f0695bb62115159c1918704668d6266d))


### Bug Fixes

* **version:** added yarn release script ([a62a548](https://github.com/geops/openlayers-editor/commit/a62a548b3e22b6008c5df69e0531b8759528b1db))

## 0.0.3 - 2019-03-11
### Added
- Support for Internet Explorer >= 10 has been added.
- Support for ol 5.3.0.
- Add style options to some controls.

### Changed
- Move JSTS to peer dependency to fix broken builds and reduce build size.

## 0.0.1 - 2018-03-20
### Added
- Using [JSTS](https://github.com/bjornharrtell/jsts) for topology operations.
- Implemented control for buffering geometries.
- Added a generic topology control.
- Derived controls from topology control for creating a union, an intersection or a difference of geometries.
- Added tests using [Cypress](https://cypress.io/)

### Changed
- Using [Neutrino](https://neutrino.js.org/) for build and development process.
- Switched from PNG to SVG images for control icons.
