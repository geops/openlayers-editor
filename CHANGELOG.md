# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0-beta.1](https://github.com/geops/openlayers-editor/compare/v1.1.8-beta.2...v1.2.0-beta.1) (2020-11-09)


### Features

* **version:** Installed standard-version to improve changelog ([00466c5](https://github.com/geops/openlayers-editor/commit/00466c56f0695bb62115159c1918704668d6266d))


### Bug Fixes

* **version:** added yarn release script ([a62a548](https://github.com/geops/openlayers-editor/commit/a62a548b3e22b6008c5df69e0531b8759528b1db))

## [1.2.0-beta.0](https://github.com/geops/openlayers-editor/compare/v1.1.8-beta.2...v1.2.0-beta.0) (2020-11-09)


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
