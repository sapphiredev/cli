# Changelog

All notable changes to this project will be documented in this file.

# [1.8.0](https://github.com/sapphiredev/cli/compare/v1.8.0...v1.8.0) - (2023-11-16)

## 🚀 Features

- Bump minimum nodejs version to >= 18 ([3343626](https://github.com/sapphiredev/cli/commit/334362647a45bc99e5763028d5b848ce514cdda2))

# [1.7.0](https://github.com/sapphiredev/cli/compare/v1.7.0...v1.7.0) - (2023-11-16)

## 🐛 Bug Fixes

- Update default JS templates to use new `LoaderContext` in doc comments ([47d5911](https://github.com/sapphiredev/cli/commit/47d5911bc0114161b951561ee6aa86043587804c))
- **deps:** Update dependency execa to v8 (#254) ([88880b2](https://github.com/sapphiredev/cli/commit/88880b29595236ef552573c54a718a6e262f820b))
- **deps:** Update dependency commander to v11 (#235) ([76d0719](https://github.com/sapphiredev/cli/commit/76d0719ed55e2e7ae43aba5c21c4843bd7660af7))
- **deps:** Update all non-major dependencies ([d647d3f](https://github.com/sapphiredev/cli/commit/d647d3f9fbefa118348543bba2c098ed84604071))

## 🚀 Features

- Bump minimum nodejs version to 16.17.0 ([28a4cc8](https://github.com/sapphiredev/cli/commit/28a4cc806aeb993a924ee52fc448655a6db157a0))

# [1.6.1](https://github.com/sapphiredev/cli/compare/v1.6.0...v1.6.1) - (2023-05-02)

## 🏃 Performance

- Optimize the logic of "parseCommonHints" (#221) ([13260f0](https://github.com/sapphiredev/cli/commit/13260f02456f13e87c9257b97dcd03199e6bf57d))

## 🐛 Bug Fixes

- Output proper esm code ([353a861](https://github.com/sapphiredev/cli/commit/353a861455caed0a5762f6a6d9661bc5419000dc))
- Use proper imports ([7c7b54b](https://github.com/sapphiredev/cli/commit/7c7b54b700faf3f21a8cab16d2ce493ab2a8ff31))
- Ensure yarn v3 is configured properly ([f53d59a](https://github.com/sapphiredev/cli/commit/f53d59a77a59c8c2f2639bd5c0ad92759ff42d10))
- **deps:** Update all non-major dependencies ([60e7410](https://github.com/sapphiredev/cli/commit/60e7410eba394745477f8707c705c9444f02dff4))

# [1.6.0](https://github.com/sapphiredev/cli/compare/v1.5.0...v1.6.0) - (2023-04-12)

## 🏠 Refactor

- Remove `with-docker` template ([1b485f8](https://github.com/sapphiredev/cli/commit/1b485f836d656022dd761cc13862fa9a970142a7))
- Stricter typing for config parsing ([ab0efb3](https://github.com/sapphiredev/cli/commit/ab0efb3c602843b76bf64e135c0a448288227462))
- **new:** Make yarn v3 the default ([30499ea](https://github.com/sapphiredev/cli/commit/30499ea72a52c31220794f41da695494145c9b08))
- **CreateFileFromTemplate:** Better internal code naming ([3189772](https://github.com/sapphiredev/cli/commit/3189772a1b85ecc2bad2949ed8d339ff0541cebf))
- Better error messages for `generate` when template doesn't exist ([dc34e1e](https://github.com/sapphiredev/cli/commit/dc34e1ecda585eeb7024d716fbf401e8e18a9b93))

## 🐛 Bug Fixes

- Better error messages when creating file ([afa4afb](https://github.com/sapphiredev/cli/commit/afa4afba579f4877eecbe447a9728b71b4042b0c))
- Fixed JSON config file ([6fe3d0c](https://github.com/sapphiredev/cli/commit/6fe3d0c87a0ba70a802d73c73028832b77c0077b))
- **templates:** Adhere to strict type checking rules ([b455738](https://github.com/sapphiredev/cli/commit/b455738705d475d99357f758d9eeea505d43c2f2))

## 🚀 Features

- Add route in prompt (#220) ([60451d6](https://github.com/sapphiredev/cli/commit/60451d6e2c92ef42c07f592d2923177aa9386595))
- **templates:** Add interaction handler templates (#216) ([650ec76](https://github.com/sapphiredev/cli/commit/650ec76c3c17e2ae5d480994daac4b42bacbfc34))
- Add `interactive-tools` plugin for yarn v3 installs ([c417d97](https://github.com/sapphiredev/cli/commit/c417d970f139da1827fe914f69903f90df436907))

## 🪞 Styling

- Add prettierignore file ([2d24595](https://github.com/sapphiredev/cli/commit/2d24595e347a9e4d24ca6926e35fb60945e11725))

# [1.5.0](https://github.com/sapphiredev/cli/compare/v1.4.0...v1.5.0) - (2023-04-10)

## 🐛 Bug Fixes

- **deps:** Update dependency execa to v7 (#203) ([dd78817](https://github.com/sapphiredev/cli/commit/dd78817e287246ae17c5e0ca947a04adf49fb86c))

## 🚀 Features

- **templates:** Add route component (#215) ([2945f09](https://github.com/sapphiredev/cli/commit/2945f09a663421362ea3f34f28900fd193acf5d7))

# [1.4.0](https://github.com/sapphiredev/cli/compare/v1.3.1...v1.4.0) - (2023-01-29)

## 🏠 Refactor

- Import discord types from discord.js ([542b63e](https://github.com/sapphiredev/cli/commit/542b63e1070f70cddc31e9c1b349c47f2de2f438))
- Update template to v14/djs and sapphire/v4 (#181) ([7c2d28b](https://github.com/sapphiredev/cli/commit/7c2d28b4b3fbae511c2e68aa237983f373cde032))

## 🐛 Bug Fixes

- **deps:** Update dependency commander to v10 (#196) ([8646ff0](https://github.com/sapphiredev/cli/commit/8646ff0187db16d5da2f7aae0a30ee1d9164e01a))
- **deps:** Update dependency @sapphire/result to ^2.6.0 (#176) ([309768b](https://github.com/sapphiredev/cli/commit/309768bdfebb22001c14f84cd46a1f750ae1afbd))
- **deps:** Update dependency @sapphire/result to ^2.5.0 ([c501908](https://github.com/sapphiredev/cli/commit/c50190879f6ffa1708a972c717cb3dd84eca0248))

## 📝 Documentation

- Add @BashGuy10 as a contributor ([2343600](https://github.com/sapphiredev/cli/commit/234360035defce7cb150e836ac7b8e2cf3d64dee))

## 🚀 Features

- Add typescript starter example ([2dedf93](https://github.com/sapphiredev/cli/commit/2dedf93f3a82b2853a8f8f142de57e0d25caf3f0))
- Add pnpm support (#191) ([1eec4e6](https://github.com/sapphiredev/cli/commit/1eec4e6e2c59676bb9ca46a4de2f23c6a726e1bb))

# [1.3.1](https://github.com/sapphiredev/cli/compare/v1.3.0...v1.3.1) - (2022-09-06)

## 🐛 Bug Fixes

- Fixed core templates (#159) ([85ea98b](https://github.com/sapphiredev/cli/commit/85ea98babb5197e041367f3d47e12c18f753e4ea))
- **deps:** Update dependency @sapphire/result to ^2.4.1 ([1960263](https://github.com/sapphiredev/cli/commit/1960263268e38dfc8ccfb91a8b3621d4d0c3bf76))
- Update messagecommand to v3 and use Command (#152) ([f897118](https://github.com/sapphiredev/cli/commit/f897118b7edd9129068dea71dca865dc5c7b39ab))

# [1.3.0](https://github.com/sapphiredev/cli/compare/v1.2.0...v1.3.0) - (2022-08-21)

## 🏠 Refactor

- Switch to @favware/colorette-spinner ([e52962d](https://github.com/sapphiredev/cli/commit/e52962d53bc11af482c4ba60186f411d94f29b0b))

## 🐛 Bug Fixes

- **deps:** Update dependency @sapphire/result to ^2.3.3 ([4c6891b](https://github.com/sapphiredev/cli/commit/4c6891b28134120969975b00ab474683eaa9cedd))
- **deps:** Update dependency @sapphire/result to ^2.1.1 ([e42c188](https://github.com/sapphiredev/cli/commit/e42c188b05ec2f4a68403f94cfa6333e9d5421fd))
- **deps:** Update dependency @sapphire/result to v2 (#135) ([025c7ca](https://github.com/sapphiredev/cli/commit/025c7caed86e17e4b9e20def743e7c33d9b81589))

## 📝 Documentation

- Add @boingtheboeing as a contributor ([ac6088c](https://github.com/sapphiredev/cli/commit/ac6088c557800b25f3da1bd561de3941298e5f22))

## 🚀 Features

- Add templates for slash commands and context menu commands (#141) ([b97aeac](https://github.com/sapphiredev/cli/commit/b97aeac80999e81a3ae80e0dc7c749d6474945a8))

# [1.3.1](https://github.com/sapphiredev/cli/compare/v1.3.0...v1.3.1) - (2022-09-06)

## 🐛 Bug Fixes

- Fixed core templates (#159) ([85ea98b](https://github.com/sapphiredev/cli/commit/85ea98babb5197e041367f3d47e12c18f753e4ea))
- **deps:** Update dependency @sapphire/result to ^2.4.1 ([1960263](https://github.com/sapphiredev/cli/commit/1960263268e38dfc8ccfb91a8b3621d4d0c3bf76))
- Update messagecommand to v3 and use Command (#152) ([f897118](https://github.com/sapphiredev/cli/commit/f897118b7edd9129068dea71dca865dc5c7b39ab))

# [1.3.0](https://github.com/sapphiredev/cli/compare/v1.2.0...v1.3.0) - (2022-08-21)

## 🏠 Refactor

- Switch to @favware/colorette-spinner ([e52962d](https://github.com/sapphiredev/cli/commit/e52962d53bc11af482c4ba60186f411d94f29b0b))

## 🐛 Bug Fixes

- **deps:** Update dependency @sapphire/result to ^2.3.3 ([4c6891b](https://github.com/sapphiredev/cli/commit/4c6891b28134120969975b00ab474683eaa9cedd))
- **deps:** Update dependency @sapphire/result to ^2.1.1 ([e42c188](https://github.com/sapphiredev/cli/commit/e42c188b05ec2f4a68403f94cfa6333e9d5421fd))
- **deps:** Update dependency @sapphire/result to v2 (#135) ([025c7ca](https://github.com/sapphiredev/cli/commit/025c7caed86e17e4b9e20def743e7c33d9b81589))

## 📝 Documentation

- Add @boingtheboeing as a contributor ([ac6088c](https://github.com/sapphiredev/cli/commit/ac6088c557800b25f3da1bd561de3941298e5f22))

## 🚀 Features

- Add templates for slash commands and context menu commands (#141) ([b97aeac](https://github.com/sapphiredev/cli/commit/b97aeac80999e81a3ae80e0dc7c749d6474945a8))

# [1.3.0](https://github.com/sapphiredev/cli/compare/v1.2.0...v1.3.0) - (2022-08-21)

## 🏠 Refactor

- Switch to @favware/colorette-spinner ([e52962d](https://github.com/sapphiredev/cli/commit/e52962d53bc11af482c4ba60186f411d94f29b0b))

## 🐛 Bug Fixes

- **deps:** Update dependency @sapphire/result to ^2.3.3 ([4c6891b](https://github.com/sapphiredev/cli/commit/4c6891b28134120969975b00ab474683eaa9cedd))
- **deps:** Update dependency @sapphire/result to ^2.1.1 ([e42c188](https://github.com/sapphiredev/cli/commit/e42c188b05ec2f4a68403f94cfa6333e9d5421fd))
- **deps:** Update dependency @sapphire/result to v2 (#135) ([025c7ca](https://github.com/sapphiredev/cli/commit/025c7caed86e17e4b9e20def743e7c33d9b81589))

## 📝 Documentation

- Add @boingtheboeing as a contributor ([ac6088c](https://github.com/sapphiredev/cli/commit/ac6088c557800b25f3da1bd561de3941298e5f22))

## 🚀 Features

- Add templates for slash commands and context menu commands (#141) ([b97aeac](https://github.com/sapphiredev/cli/commit/b97aeac80999e81a3ae80e0dc7c749d6474945a8))

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
