# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.4.5](https://github.com/geops/openlayers-editor/compare/v2.4.4...v2.4.5) (2024-09-04)


### Bug Fixes

* avoid js error when map is not set when activate/deactivate is called ([c808a36](https://github.com/geops/openlayers-editor/commit/c808a36a6eaa5704f650adfd4b6176b0c7fc96cd))
* improve cursor behavior on pointer down and up in modify control ([5eb32b9](https://github.com/geops/openlayers-editor/commit/5eb32b9be4f4cc23dc4a17c67f459c55072f5fcf))
* use viewport to set cursor style ([62a427d](https://github.com/geops/openlayers-editor/commit/62a427d8830b1641aeec7d3a03f4e266cae3eac8))

### [2.4.4](https://github.com/geops/openlayers-editor/compare/v2.4.3...v2.4.4) (2024-08-20)


### Bug Fixes

* add new option cursorStyleHandler to change cursor style value ([ceb4bff](https://github.com/geops/openlayers-editor/commit/ceb4bff19ce9adee53e94b25d2ef13204504a7f0))
* display points of all linear rings of a polygon ([027b52b](https://github.com/geops/openlayers-editor/commit/027b52bb8e99aab81de84e4ae4db28155e86a910))
* throttle the cursor style change in modify control ([5175746](https://github.com/geops/openlayers-editor/commit/5175746aff4ab34171b8765df26df6e6debec14d))

### [2.4.3](https://github.com/geops/openlayers-editor/compare/v2.4.2...v2.4.3) (2024-06-25)


### Bug Fixes

* hide topology errors in line hit detection & optimizations ([ae85670](https://github.com/geops/openlayers-editor/commit/ae856703dd11a99bd2fe35ede6977ce50670831b))

### [2.4.2](https://github.com/geops/openlayers-editor/compare/v2.4.1...v2.4.2) (2024-05-14)


### Bug Fixes

* fix: listen only when possible ([5a2c042](https://github.com/geops/openlayers-editor/commit/5a2c042cf2fa54cc7f4e56432eb2191f1d034aac))
* fix: unlisten only when possible ([b1029294](https://github.com/geops/openlayers-editor/commit/b1029294f84e9b2c0c7c409a17b4cdf32cf91ac2))

### [2.4.1](https://github.com/geops/openlayers-editor/compare/v2.4.0...v2.4.1) (2024-05-14)


### Bug Fixes

* fix editor.remove and add a test ([1427d6e](https://github.com/geops/openlayers-editor/commit/1427d6e25edab0088ff327de98d4d45efb414b5c))

## [2.4.0](https://github.com/geops/openlayers-editor/compare/v2.3.0...v2.4.0) (2024-05-10)


### Features

* add editor#removeControl ([#266](https://github.com/geops/openlayers-editor/issues/266)) ([cd4c777](https://github.com/geops/openlayers-editor/commit/cd4c7772cf9be101a00d2c226a564de815732b49))
* add extentFilter property  in CAD control ([aa160a4](https://github.com/geops/openlayers-editor/commit/aa160a437f368799f6f31557aa2445b83afda22e))
* add line filter for reducing line clutter ([#265](https://github.com/geops/openlayers-editor/issues/265)) ([842e836](https://github.com/geops/openlayers-editor/commit/842e836b44a9faf63a03a11affd5930dc5522e55))


### Bug Fixes

* cleanup map events unmounting cad control ([#264](https://github.com/geops/openlayers-editor/issues/264)) ([3907615](https://github.com/geops/openlayers-editor/commit/390761571f8146c62d4dc85ef4255210a4b592ec))

## [2.3.0](https://github.com/geops/openlayers-editor/compare/v2.2.1...v2.3.0) (2024-05-10)


### Features

* allow to modifiy  circle geometry ([#270](https://github.com/geops/openlayers-editor/issues/270)) ([18deb75](https://github.com/geops/openlayers-editor/commit/18deb75c672c4d25e659598e7dd87386b24ffe73))

### [2.2.1](https://github.com/geops/openlayers-editor/compare/v2.2.0...v2.2.1) (2024-03-05)


### Bug Fixes

* update JSDoc comments to improve TypeScript definitions ([#269](https://github.com/geops/openlayers-editor/issues/269)) ([769c1bc](https://github.com/geops/openlayers-editor/commit/769c1bc48f426310cece9a9b0444edd6c77895b3))

## [2.2.0](https://github.com/geops/openlayers-editor/compare/v2.1.2...v2.2.0) (2023-05-04)


### Features

* support OpenLayers 7.x support

* add TypeScript definitions ([#256](https://github.com/geops/openlayers-editor/issues/256)) ([f6db2f6](https://github.com/geops/openlayers-editor/commit/f6db2f6ae37b21a7919428841ce421c07882772f))

* add more snap lines in the CAD control. Configurable via showOrthoLines and showSegmentLines properties

### Bug Fixes

* use JSDoc for param documentation ([51f8445](https://github.com/geops/openlayers-editor/commit/51f84459fb07529456f6b94c0faf136f63e9221a))

### [2.1.2](https://github.com/geops/openlayers-editor/compare/v2.1.1...v2.1.2) (2022-08-11)


### Bug Fixes

* **DrawControl:** add drawInteractionOptions for DrawControl ([#239](https://github.com/geops/openlayers-editor/issues/239)) ([e1ceb7c](https://github.com/geops/openlayers-editor/commit/e1ceb7c0a62c36658d231236be84773890d2e609))

### [2.1.1](https://github.com/geops/openlayers-editor/compare/v2.1.0...v2.1.1) (2022-08-10)


### Bug Fixes

* **CAD:** snap enabled on edit feature vertices, CAD support for rotated maps ([#234](https://github.com/geops/openlayers-editor/issues/234)) ([0d706af](https://github.com/geops/openlayers-editor/commit/0d706af65bce2759e61dbae5d9ca359940251573))

## [2.1.0](https://github.com/geops/openlayers-editor/compare/v2.0.1...v2.1.0) (2022-06-20)


### Features

* use conventional-pr-title for PR title validation ([#227](https://github.com/geops/openlayers-editor/issues/227)) ([607e5ec](https://github.com/geops/openlayers-editor/commit/607e5ec3d4aa4849f4b6b7e7acc827728f70a36c))


### Bug Fixes

* **demo:** Update style URL ([#222](https://github.com/geops/openlayers-editor/issues/222)) ([63da714](https://github.com/geops/openlayers-editor/commit/63da714cce7ad7660b99218be153644e1f193d01))

### [2.0.1](https://github.com/geops/openlayers-editor/compare/v2.0.0...v2.0.1) (2021-01-26)


### Bug Fixes

* **cad:** allow a snap distance of 0 ([#220](https://github.com/geops/openlayers-editor/issues/220)) ([8eebfaf](https://github.com/geops/openlayers-editor/commit/8eebfafc8eadbdb3d1d4686b75b6c7075d3ff15c))

## [2.0.0](https://github.com/geops/openlayers-editor/compare/v1.4.0-beta.1...v2.0.0) (2020-11-18)


### ⚠ BREAKING CHANGES

* **modify:** the ole.control.modify is completely refactored (check
docs)

* **modify:** added selectFilter to getFeatureAtPixel() ([007ad16](https://github.com/geops/openlayers-editor/commit/007ad162872444c7b8e2eb8e39a5f52009caa317))

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
