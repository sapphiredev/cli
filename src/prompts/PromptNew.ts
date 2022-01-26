import type { Choice, PromptObject } from 'prompts';

const tsTemplates: Choice[] = [
	{ title: 'Default template (Recommended)', value: 'with-typescript-recommended' },
	{ title: 'with Docker', value: 'with-docker' },
	{ title: 'with tsup', value: 'with-tsup' },
	{ title: 'with SWC', value: 'with-swc' }
];
const jsTemplates: Choice[] = [
	{ title: 'with ESM (Recommended)', value: 'with-esm' },
	{ title: 'with CommonJS', value: 'with-javascript' }
];

export const PromptNew = (projectName: string, yarn: boolean) => {
	const pmChoices = [
		{
			title: `Yarn (Recommended) ${yarn ? '' : '(Not installed)'}`,
			value: 'Yarn',
			disabled: !yarn
		},
		{ title: 'npm', value: 'npm' }
	];

	return [
		{
			type: 'text',
			name: 'projectName',
			message: "What's the name of your project?",
			initial: projectName ?? 'my-sapphire-bot'
		},
		{
			type: 'select',
			name: 'projectLang',
			message: 'Choose a language for your project',
			choices: [
				{ title: 'TypeScript (Recommended)', value: 'ts' },
				{ title: 'JavaScript', value: 'js' }
			]
		},
		{
			type: 'select',
			name: 'projectTemplate',
			message: 'Choose a template for your project',
			choices: (prev: string) => (prev === 'ts' ? tsTemplates : jsTemplates)
		},
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
			name: 'packageManager',
			message: 'What package manager do you want to use?',
			choices: yarn ? pmChoices : pmChoices.slice().reverse()
		},
		{
			type: 'confirm',
			name: 'git',
			message: 'Do you want to create a git repository for this project?'
		}
	] as PromptObject<any>[];
};
