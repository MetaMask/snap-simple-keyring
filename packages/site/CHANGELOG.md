# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2]
### Uncategorized
- fix: disable async-sync toggle if snap is not installed ([#77](https://github.com/MetaMask/snap-simple-keyring/pull/77))
- build: update configs from `metamask-module-template` ([#75](https://github.com/MetaMask/snap-simple-keyring/pull/75))
- chore: update toggle style ([#73](https://github.com/MetaMask/snap-simple-keyring/pull/73))
- feat: the dApp specifies the Snap version to install ([#72](https://github.com/MetaMask/snap-simple-keyring/pull/72))
- feat: add dapp version to header ([#71](https://github.com/MetaMask/snap-simple-keyring/pull/71))

## [0.2.1]
### Changed
- Align button and request result with action name ([#66](https://github.com/MetaMask/snap-simple-keyring/pull/66)).
- Remove account name and improve some UI components ([#65](https://github.com/MetaMask/snap-simple-keyring/pull/65)).
- Migrate to new `keyring-api` version (0.2.x) ([#64](https://github.com/MetaMask/snap-simple-keyring/pull/64)).
- Polyfill crypto dependency introduced in `metamask-utils` 6.2.0 ([#62](https://github.com/MetaMask/snap-simple-keyring/pull/62)).

## [0.2.0]
### Added
- Support the async approval flow ([#50](https://github.com/MetaMask/snap-simple-keyring/pull/50)).
- Import account ([#58](https://github.com/MetaMask/snap-simple-keyring/pull/58)).

### Changed
- Improve UI/UX ([#54](https://github.com/MetaMask/snap-simple-keyring/pull/54)).

### Fixed
- Now you don't have to change your `defaultSnapOrigin` ([#59](https://github.com/MetaMask/snap-simple-keyring/pull/59)).

## [0.1.4]
### Fixed
- Fix `rejectRequest` call in site package ([#53](https://github.com/MetaMask/snap-simple-keyring/pull/53)).

## [0.1.3]
### Changed
- No changes in this release.

## [0.1.2]
### Changed
- Update snaps and API dependencies. ([#41](https://github.com/MetaMask/snap-simple-keyring/pull/41)).
- Add IDs for e2e tests. ([#40](https://github.com/MetaMask/snap-simple-keyring/pull/40)).

## [0.1.1] - 2023-06-23
### Changed
- No changes in this release.

## [0.1.0] - 2023-06-22
### Added
- Initial release.

[Unreleased]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snap-simple-keyring/releases/tag/v0.1.0
