import { PromptInit } from '#prompts';
import prompts from 'prompts';
import YAML from 'yaml';
import { writeFile } from 'fs/promises';
import FindUp from 'find-up';
import chalk from 'chalk';

const { red } = chalk;

export default async () => {
	const packageJson = await FindUp('package.json');
	if (!packageJson) {
		console.log(red("Can't find package.json"));
		process.exit(1);
	}

	const response = await prompts(PromptInit);
	if (!response.preconditions) return process.exit(1);

	const config = {
		projectLanguage: response.projectLanguage,
		locations: {
			base: response.base,
			arguments: response.arguments,
			commands: response.commands,
			listeners: response.listeners,
			preconditions: response.preconditions
		},
		customFileTemplates: {
			enabled: response.cftEnabled,
			location: response.cftLocation ?? ''
		}
	};

	const file = response.configFormat === 'json' ? JSON.stringify(config, null, 2) : YAML.stringify(config);
	return writeFile(`.sapphirerc.${response.configFormat}`, file);
};
