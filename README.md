<div align="center">

![Sapphire Logo](https://cdn.skyra.pw/gh-assets/sapphire-banner.png)

# @sapphire/cli

**CLI for Sapphire Framework.**

[![GitHub](https://img.shields.io/github/license/sapphiredev/cli?style=flat-square)](https://github.com/sapphiredev/cli/blob/main/LICENSE.md)
[![npm](https://img.shields.io/npm/v/@sapphire/cli?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/@sapphire/cli)

</div>

## Features

-   Written in TypeScript
-   Generate Sapphire projects easily
-   Generate components (commands, listeners, etc.)
-   Create your own templates for components

## Usage

```sh-session
$ npm install -g @sapphire/cli
$ sapphire [command]
running command...
$ sapphire --version
0.0.1
$ sapphire help [command]
USAGE
  $ sapphire COMMAND
...
```

## Commands

* [`sapphire new|n [options] [name]`](#sapphire-newn-options-name)
* [`sapphire generate|g <component> <name>`](#sapphire-generateg-component-name)
* [`sapphire help [command]`](#sapphire-help-command)

## `sapphire new|n [options] [name]`

creates a new Sapphire project

```
Usage: $ sapphire new|n [options] [name]

creates a new Sapphire project

Arguments:
  name           project name

Options:
  -v, --verbose
  -h, --help     display help for command
```

_See code: [src/commands/new.ts](https://github.com/sapphiredev/cli/blob/main/src/commands/new.ts)_

## `sapphire generate|g <component> <name>`

generate a component (command, listener, etc.)

```
Usage: $ sapphire generate|g [options] <component> <name>

generates a component/piece

Arguments:
  component   component/piece name
  name        file name

Options:
  -h, --help  display help for command
```

_See code: [src/commands/generate.ts](https://github.com/sapphiredev/cli/blob/main/src/commands/generate.ts)_

## `sapphire help [command]`

display help for sapphire

```
Usage: $ sapphire help [command]

display help for command

Arguments:
  command     command name
```

## Component Templates

Default component templates are:

-   command
-   listener
-   argument
-   precondition

If you want to make your own templates, or want to override the default ones, read the next section.

## Custom component templates

### Enable custom component templates

In the `.sapphirerc.json` file:

-   Set `customFileTemplates.enabled` to `true`
-   Set `customFileTemplates.location` to the name of the directory you want to store your templates in.

Example:

```json
{
	"customFileTemplates": {
		"enabled": true,
		"location": "templates"
	}
}
```

### Create custom component templates

-   Create a file like this in your custom template directory `<templateName>.<language>.sapphire` (e.g `command.ts.sapphire`). If you make its name same as one of the default template's, your template will override the default one.
-   Template's have 2 parts, config and the template, separated with `---`.
-   We first need to type the config:

```json
{
	"category": "commands"
}
```

`category` is the category of that template, CLI uses it to know where to create the component by finding that category's location from the `locations` field in `.sapphirerc.json`. You can create your own categories. Default categories are: `commands`, `listeners`, `arguments`, `preconditions`. This example uses the `commands` category.

-   Now we add the separator.

```
{
  "category": "commands"
}
---
```

-   And the last part, we add the template.

```
{
  "category": "commands"
}
---
import { ApplyOptions } from '@sapphire/decorators';
import { MyExtendedCommand } from './somewhere';
import { Message } from 'discord.js';

@ApplyOptions<MyExtendedCommand.Options>({
	description: 'A basic command'
})
export class {{name}}Command extends MyExtendedCommand {
	public async run(message: Message) {
		return message.channel.send('Hello world!');
	}
}

```

If you look at the name of the class, you will see it includes `{{name}}`, this is the component's name and it is replaced with that name when creating the component. For example: if we created this component with the name `HelloWorld`, the name of the exported class would be `HelloWorldCommand`. It is not required but if you need it, this is how it's done.

-   And now you can create component with your template

```
sapphire generate <templateName> <componentName>
```

## Buy us some doughnuts

Sapphire Community is and always will be open source, even if we don't get donations. That being said, we know there are amazing people who may still want to donate just to show their appreciation. Thank you very much in advance!

We accept donations through Open Collective, Ko-fi, Paypal, Patreon and GitHub Sponsorships. You can use the buttons below to donate through your method of choice.

|   Donate With   |                       Address                       |
| :-------------: | :-------------------------------------------------: |
| Open Collective | [Click Here](https://sapphirejs.dev/opencollective) |
|      Ko-fi      |      [Click Here](https://sapphirejs.dev/kofi)      |
|     Patreon     |    [Click Here](https://sapphirejs.dev/patreon)     |
|     PayPal      |     [Click Here](https://sapphirejs.dev/paypal)     |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://favware.tech/"><img src="https://avatars3.githubusercontent.com/u/4019718?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeroen Claassens</b></sub></a><br /><a href="https://github.com/sapphiredev/cli/commits?author=Favna" title="Code">💻</a> <a href="https://github.com/sapphiredev/cli/commits?author=Favna" title="Documentation">📖</a> <a href="#infra-Favna" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-Favna" title="Project Management">📆</a> <a href="#plugin-Favna" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/enxg"><img src="https://avatars.githubusercontent.com/u/61084101?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Enes Genç</b></sub></a><br /><a href="https://github.com/sapphiredev/cli/commits?author=enxg" title="Code">💻</a> <a href="https://github.com/sapphiredev/cli/commits?author=enxg" title="Documentation">📖</a> <a href="#infra-enxg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-enxg" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://kaname.netlify.app"><img src="https://avatars.githubusercontent.com/u/56084970?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kaname</b></sub></a><br /><a href="https://github.com/sapphiredev/cli/commits?author=kaname-png" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
