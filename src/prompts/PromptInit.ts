import type { PromptObject } from 'prompts';

export const PromptInit = [
	{
		type: 'select',
		name: 'configFormat',
		message: 'What format do you want your config file to be in?',
		choices: [
			{ title: 'JSON', value: 'json' },
			{ title: 'YAML', value: 'yml' }
		]
	},
	{
		type: 'select',
		name: 'projectLanguage',
		message: 'Choose the language used in your project',
		choices: [
			{ title: 'TypeScript', value: 'ts' },
			{ title: 'JavaScript', value: 'js' }
		]
	},
	{
		type: 'text',
		name: 'base',
		message: 'Your base directory',
		initial: 'src'
	},
	{
		type: 'text',
		name: 'commands',
		message: 'Where do you store your commands? (do not include the base)',
		initial: 'commands'
	},
	{
		type: 'text',
		name: 'listeners',
		message: 'Where do you store your listeners? (do not include the base)',
		initial: 'listeners'
	},
	{
		type: 'text',
		name: 'arguments',
		message: 'Where do you store your arguments? (do not include the base)',
		initial: 'arguments'
	},
	{
		type: 'text',
		name: 'preconditions',
		message: 'Where do you store your preconditions? (do not include the base)',
		initial: 'preconditions'
	},
	{
		type: 'confirm',
		name: 'cftEnabled',
		message: 'Do you want to enable custom file templates?'
	},
	{
		type: (prev) => (prev ? 'text' : null),
		name: 'cftLocation',
		message: 'Where do you store your custom file templates?',
		initial: 'templates'
	}
] as PromptObject[];
