# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2023-06-22
### Uncategorized
- ci: use workflows from template ([#26](https://github.com/MetaMask/snap-simple-keyring/pull/26))
- chore: revert versions to `0.0.0` before release ([#27](https://github.com/MetaMask/snap-simple-keyring/pull/27))
- 0.1.0 ([#24](https://github.com/MetaMask/snap-simple-keyring/pull/24))
- 0.1.0 ([#23](https://github.com/MetaMask/snap-simple-keyring/pull/23))
- feat(snap): enable eth_sign ([#22](https://github.com/MetaMask/snap-simple-keyring/pull/22))
- 0.1.0 ([#20](https://github.com/MetaMask/snap-simple-keyring/pull/20))
- chore: prepare for release ([#19](https://github.com/MetaMask/snap-simple-keyring/pull/19))
- chore(snap): update manifest ([#16](https://github.com/MetaMask/snap-simple-keyring/pull/16))
- fix(snap): use new snap controller method name ([#14](https://github.com/MetaMask/snap-simple-keyring/pull/14))
- feat(site): add inputs fields ([#12](https://github.com/MetaMask/snap-simple-keyring/pull/12))
- chore: bump `keyring-api` to `0.1.0` (`site`) ([#13](https://github.com/MetaMask/snap-simple-keyring/pull/13))
- chore: bump `keyring-api` and remove allowed scripts ([#9](https://github.com/MetaMask/snap-simple-keyring/pull/9))
- chore: fix linter
- chore: update `chainHandlers` function name (was `buildHandlersChain`)
- chore: rename `keyring2` to `keyring`
- chore: remove old keyring
- fix: fix signing on `keyring2`
- feat: use dispatcher in the snap
- feat: use dispatcher in the snap
- remove ethereumjs dep from site
- remove unused func
- rename the keyring class
- update yarn and dep
- Merge remote-tracking branch 'origin/main' into feat/api-wrapper
- update checksum in manifest
- remove duplicate
- Merge remote-tracking branch 'origin/feat/api-wrapper' into feat/api-wrapper-signing
- add examples and implement filter
- wip: some API changes
- add isEVMChain util
- update to use new KeyringAccount and implement filterSupportedChains
- update switch methods
- add cases to request handler
- add handle signing
- add saveSnapKeyringState
- update keyringstate keys
- update getWalletByAddress and throw if none is found
- add save keyringState after account creation
- update keyring construction
- add jsdoc for stateManagment
- add utils
- update methods
- chore: prettier formatting
- chore: rename keyring-api package
- chore: use new keyring API
- Merge branch 'fix-unused-chainOpts' into feat/api-wrapper
- fix unused chainOpts
- Update yarn.lock + dedupe ethereumjs packages
- use latest snap version
- wip: start implementation on snap side
- wip: list accounts
- chore: start dev of wrapper
- refactor into keyring class
- fix handleApproveRequest
- fix nodemon
- feat: display account addresses
- chore: rename methods and remove more logic from UI
- fix chain id
- remove keys
- fix comment
- fix type 2 transactions
- remove ethers form accountManagement
- remove dep
- fix sign legacy
- Merge branch 'main' into feat/remove-account
- add ethereum js
- updatedSIgned tx to be serializable
- update snaps keyring, move signPersonalMessage to snap
- move signPersonalMessage logic into snap
- refactor: add new account/request methods
- update dep
- fix: add missing return values
- update imports
- add hexToArrayBuffer
- add transaction management functions
- add account management functions
- add ethereumjs dependency
- remove unused
- refactor state management
- add ui for delete account
- allow snap_manageAccount in host interaction
- Add some missing types
- automatic lint fixes
- updated all other packages
- @metamask/snaps-* packages at 0.30.0
- mvp working
- Initial commit

### Added
- Initial release.

[Unreleased]: https://github.com/MetaMask/snap-simple-keyring/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MetaMask/snap-simple-keyring/releases/tag/v0.1.0
