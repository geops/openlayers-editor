# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.0.2 - 2018-04-17
### Added
- Support for Internet Explorer >= 10 has been added.

### Changed
- Moved JSTS to peer depency to fix broken builds and reduce build size.

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
