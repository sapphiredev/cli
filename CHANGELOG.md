# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0](https://github.com/sapphiredev/cli/compare/v1.1.0...v1.2.0) (2022-02-26)

### Features

-   add yarn v3 support ([#84](https://github.com/sapphiredev/cli/issues/84)) ([4c47d1a](https://github.com/sapphiredev/cli/commit/4c47d1aef07b600c0727106bd8d008213f3c2d04))

## [1.1.0](https://github.com/sapphiredev/cli/compare/v1.0.2...v1.1.0) (2022-01-31)

### Features

-   add tsup and swc template options ([#71](https://github.com/sapphiredev/cli/issues/71)) ([625dd8e](https://github.com/sapphiredev/cli/commit/625dd8ea9d43f7005c72212fb5a65bf0b8aa7492))

### Bug Fixes

-   **deps:** update dependency commander to v9 ([#76](https://github.com/sapphiredev/cli/issues/76)) ([d75ea1b](https://github.com/sapphiredev/cli/commit/d75ea1b1542490fd67a14630ee67e3223dc3b6e7))
-   Generated command comportnent code has error ([#67](https://github.com/sapphiredev/cli/issues/67)) ([9901517](https://github.com/sapphiredev/cli/commit/990151771e3d1da09dee34c9995d70abc241a769))

### [1.0.2](https://github.com/sapphiredev/cli/compare/v1.0.1...v1.0.2) (2021-11-08)

### Bug Fixes

-   update URL for guide ([0b7e402](https://github.com/sapphiredev/cli/commit/0b7e402e3db26af818824f423059c643374ed920))

### [1.0.1](https://github.com/sapphiredev/cli/compare/v1.0.0...v1.0.1) (2021-11-06)

### Bug Fixes

-   allow more node & npm versions in engines field ([ce6c97f](https://github.com/sapphiredev/cli/commit/ce6c97f8c2934796e9d6ab159195f2c0fa05188a))
-   **deps:** update all non-major dependencies ([#36](https://github.com/sapphiredev/cli/issues/36)) ([1a9e791](https://github.com/sapphiredev/cli/commit/1a9e791768ebbe5edd11875ac07c31b9d3cec50e))
-   typo `msg` -> `message` ([#39](https://github.com/sapphiredev/cli/issues/39)) ([0f8933b](https://github.com/sapphiredev/cli/commit/0f8933b1af3927c96a79a1f4d9b1bcc46727dd24))

## [1.0.0](https://github.com/sapphiredev/cli/compare/v0.0.3...v1.0.0) (2021-10-16)

### [0.0.3](https://github.com/sapphiredev/cli/compare/v0.0.2...v0.0.3) (2021-10-16)

### Bug Fixes

-   **templates:** Overridden run method to messageRun ([#30](https://github.com/sapphiredev/cli/issues/30)) ([07fc1d5](https://github.com/sapphiredev/cli/commit/07fc1d5516f057cd346340de853ded314741335f))

### [0.0.2](https://github.com/sapphiredev/cli/compare/v0.0.1...v0.0.2) (2021-10-16)

### Features

-   add `init` command ([588e956](https://github.com/sapphiredev/cli/commit/588e956eeb9867be1e16db9bcd962fd72864d8fc))
-   add JSON scheme for CLI config ([1ca569b](https://github.com/sapphiredev/cli/commit/1ca569b8ed89a869af3d5e39c6f1f4cc988edf08))
-   add prompt for `init` command ([67d5a10](https://github.com/sapphiredev/cli/commit/67d5a106c66df3235260810ac6770234a7e7f2fc))
-   category support ([0498b31](https://github.com/sapphiredev/cli/commit/0498b3125767b1b37614e50795402dbb8d72627e))
-   switch to commander ([#15](https://github.com/sapphiredev/cli/issues/15)) ([8f34fa8](https://github.com/sapphiredev/cli/commit/8f34fa8323a6dfdb79abf2ebaf7fdd4d17f3df4b))
-   YAML support ([#17](https://github.com/sapphiredev/cli/issues/17)) ([f69ae95](https://github.com/sapphiredev/cli/commit/f69ae959b664a3aa4342cf67c27802e197505c08))

### Bug Fixes

-   add timeout when finding the config file ([46e3e21](https://github.com/sapphiredev/cli/commit/46e3e21e2b3e0d431e1eeea612a5da9b636ed34a))
-   create the config file on project root instead of the current folder ([aa3b352](https://github.com/sapphiredev/cli/commit/aa3b352aa22b7cecb2117ced37f8e33202fa492b))
-   include `templates` directory in the npm package ([c85406f](https://github.com/sapphiredev/cli/commit/c85406f9e9ba764a8063f5b7af458eb8b8f23924))
-   path and executable issues on Windows ([f317d7f](https://github.com/sapphiredev/cli/commit/f317d7f35d39d388798e6250d79915e7cfdfa23a))
-   **templates:** typescript types ([3812b34](https://github.com/sapphiredev/cli/commit/3812b34f7467e30624c7993a64366d2cb0821ac9))

### 0.0.1 (2021-09-23)

### Features

-   add a function to check if a command exists ([107ccee](https://github.com/sapphiredev/cli/commit/107ccee0b55b3ddf6261d177d6b0b5730512811c))
-   add command: `generate` ([b14a965](https://github.com/sapphiredev/cli/commit/b14a965548f5548ce7ac5e0e53d23c85ca827da2))
-   add command: `new` ([4afa8cd](https://github.com/sapphiredev/cli/commit/4afa8cdaf122bac4bc7b16a8f18a9bda40663d4c))
-   add command: `new` ([ffe5a69](https://github.com/sapphiredev/cli/commit/ffe5a695c0126523a4c9e79ea4817542023de193))
-   add function to create files using templates ([e95db50](https://github.com/sapphiredev/cli/commit/e95db50555a9f02e241bea9753506e12a14b0395))
-   add path aliases ([1b65110](https://github.com/sapphiredev/cli/commit/1b65110d0135f4ee9a064d8ac6f130f06ec8ab4c))
-   add PWSH script for Windows ([c69c55f](https://github.com/sapphiredev/cli/commit/c69c55f44f39b6d1984adaded486e29759118375))
-   add templates for `generate` command ([be6f535](https://github.com/sapphiredev/cli/commit/be6f53583ecba3d959a76a12310ff3d80cbd52dd))
-   update batch file for Windows Command Prompt ([746ab83](https://github.com/sapphiredev/cli/commit/746ab838bc668c863a8fc6b2d9632e4c5790acdc))
-   update config template ([65c47a0](https://github.com/sapphiredev/cli/commit/65c47a0728f4652b725b37ebcf758fb60155de7c))
-   use new template format ([1adcbeb](https://github.com/sapphiredev/cli/commit/1adcbeb39678fbbfe6ea119dd9586d3a022cbc11))

### Bug Fixes

-   language value was not getting replaced when creating the `.sapphirerc.json` file from template ([946a40a](https://github.com/sapphiredev/cli/commit/946a40a4365411c2f20a1ed8806e0057c0afbc56))
