import { PromptInit, type PromptInitObjectKeys } from '#prompts/PromptInit';
import { red } from 'colorette';
import findUp from 'find-up';
import { dump } from 'js-yaml';
import { writeFile } from 'node:fs/promises';
import prompts from 'prompts';

export default async () => {
	const packageJson = await findUp('package.json');

	if (!packageJson) {
		console.log(red("Can't find package.json"));
		process.exit(1);
	}

	const response = await prompts<PromptInitObjectKeys>(PromptInit);
	if (!response.preconditions) process.exit(1);

	const config = {
		projectLanguage: response.projectLanguage,
		locations: {
			base: response.base,
			arguments: response.arguments,
			commands: response.commands,
			listeners: response.listeners,
			preconditions: response.preconditions,
			'interaction-handlers': response['interaction-handlers']
		},
		customFileTemplates: {
			enabled: response.cftEnabled,
			location: response.cftLocation ?? ''
		}
	};

	const file = response.configFormat === 'json' ? JSON.stringify(config, null, 2) : dump(config);
	await writeFile(packageJson.replace('package.json', `.sapphirerc.${response.configFormat}`), file);
	process.exit(0);
};
