# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Move and Delete control implemented within the Modify tool.
- Fix bug duplicate creation of dialog.

### Removed
- ol.control.Move and ol.control.Delete tools have been removed.

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
