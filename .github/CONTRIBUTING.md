# Contributing

## Workflow

1. Fork and clone this repository.
2. Create a new branch in your fork based off the **main** branch.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here]!

## Contributing to the code

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server][discord server]**.

To contribute to this repository, feel free to create a new fork of the repository and
submit a pull request. We highly suggest [ESLint] to be installed
in your text editor or IDE of your choice to ensure builds from GitHub Actions do not fail.

**_Before committing and pushing your changes, please ensure that you do not have any linting errors by running `yarn lint`!_**

### @sapphire/cli Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

-   Everything in @sapphire/cli should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
-   Everything should follow [OOP paradigms][oop paradigms] and generally rely on behaviour over state where possible. This generally helps methods be predictable, keeps the codebase simple and understandable, reduces code duplication through abstraction, and leads to efficiency and therefore scalability.
-   Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.

<!-- Link Dump -->

<!-- Guides -->

<!-- Code -->

[discord server]: https://sapphirejs.dev/discord
[here]: https://github.com/sapphiredev/cli/pulls
[eslint]: https://eslint.org/
[node.js]: https://nodejs.org/en/download/
[yarn]: https://classic.yarnpkg.com/en/docs/install
[oop paradigms]: https://en.wikipedia.org/wiki/Object-oriented_programming
[scripts]: /scripts