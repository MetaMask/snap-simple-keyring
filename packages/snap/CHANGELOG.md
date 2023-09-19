# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.3]
### Uncategorized
- chore: update Gatsby to version 5 ([#83](https://github.com/MetaMask/snap-simple-keyring/pull/83))
- feat: enable linters and fix errors ([#81](https://github.com/MetaMask/snap-simple-keyring/pull/81))

## [0.2.2]
### Fixed
- Persist snap state after switching between sync <-> async ([#76](https://github.com/MetaMask/snap-simple-keyring/pull/76))

## [0.2.1]
### Changed
- Migrate to new `keyring-api` version (0.2.x) ([#64](https://github.com/MetaMask/snap-simple-keyring/pull/64)).
- Polyfill crypto dependency introduced in `metamask-utils` 6.2.0 ([#62](https://github.com/MetaMask/snap-simple-keyring/pull/62)).

## [0.2.0]
### Added
- Support the async approval flow ([#50](https://github.com/MetaMask/snap-simple-keyring/pull/50)).
- Import account ([#58](https://github.com/MetaMask/snap-simple-keyring/pull/58)).

## [0.1.4]
### Changed
- Bump `@metamask/snaps-cli` to `v0.38.2-flask.1` ([#55](https://github.com/MetaMask/snap-simple-keyring/pull/55)).

## [0.1.3]
### Fixed
- Fix address checksum and account update order. ([#44](https://github.com/MetaMask/snap-simple-keyring/pull/44)).
- Fix unique name during account creation. ([#43](https://github.com/MetaMask/snap-simple-keyring/pull/43)).

## [0.1.2]
### Changed
- Update snaps and API dependencies. ([#41](https://github.com/MetaMask/snap-simple-keyring/pull/41)).
- Add IDs for e2e tests. ([#40](https://github.com/MetaMask/snap-simple-keyring/pull/40)).

## [0.1.1] - 2023-06-23
### Changed
- Update snap's `README.md` ([#37](https://github.com/MetaMask/snap-simple-keyring/pull/37)).

### Fixed
- Allow calls from `https://metamask.github.io` to the snap. ([#36](https://github.com/MetaMask/snap-simple-keyring/pull/36)).

## [0.1.0] - 2023-06-22
### Added
- Initial release.

[Unreleased]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snap-simple-keyring/releases/tag/v0.1.0
