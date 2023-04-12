import { componentsFolder } from '#constants';
import { CreateFileFromTemplate } from '#functions/CreateFileFromTemplate';
import { fileExists } from '#functions/FileExists';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import findUp from 'find-up';
import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { commandNames, componentCommandNames, componentInteractionHandlerNames, interactionHandlerNames } from 'src/lib/aliases';
import type { Config } from 'src/lib/types';

async function createComponent(component: string, name: string, config: Config, configLoc: string) {
	const { projectLanguage } = config;

	if (!projectLanguage) {
		throw new Error("There is no 'projectLanguage' field in .sapphirerc.json");
	}

	const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;

	const corePath = `${componentsFolder}${template}`;
	const userPath = config.customFileTemplates.enabled ? join(configLoc, config.customFileTemplates.location, template) : null;
	const target = join(configLoc, config.locations.base, '%L%', `${name}.${projectLanguage}`);
	const params = { name: basename(name) };

	if (userPath && (await fileExists(userPath))) {
		return CreateFileFromTemplate(userPath, target, config, params, true, true);
	} else if (await fileExists(corePath)) {
		return CreateFileFromTemplate(`components/${template}`, target, config, params, false, true);
	}

	throw new Error(`Couldn't find a template file for that component type.${parseCommonHints(component)}`);
}

async function fetchConfig() {
	const configFileAsJson = await Promise.race([findUp('.sapphirerc.json', { cwd: '.' }), sleep(5000)]);

	if (configFileAsJson) {
		return configFileAsJson;
	}

	return Promise.race([findUp('.sapphirerc.yml', { cwd: '.' }), sleep(5000)]);
}

function joinComponentNames(components: string[]): string {
	const lastComponent = components.pop();
	return `${components.join('", "')}" or "${lastComponent}"`;
}

/**
 * Parses common hints for the user
 * @param component Component name
 * @returns A string with a hint for the user
 */
function parseCommonHints(component: string): string {
	const newLine = '\n';
	const lowerCaseComponent = component.toLowerCase();
	const commonHints = `${newLine}Hint: You wrote "${component}", instead of `;

	if (commandNames.includes(lowerCaseComponent)) {
		return `${commonHints}"${joinComponentNames(componentCommandNames)}".`;
	}

	if (interactionHandlerNames.includes(lowerCaseComponent)) {
		return `${commonHints}"${joinComponentNames(componentInteractionHandlerNames)}".`;
	}

	return '';
}

export default async (component: string, name: string) => {
	const spinner = new Spinner(`Creating a ${component.toLowerCase()}`).start();

	const fail = (error: string, additionalExecution?: () => void) => {
		spinner.error({ text: error });
		additionalExecution?.();
		process.exit(1);
	};

	const configLoc = await fetchConfig();

	if (!configLoc) {
		return fail("Can't find the Sapphire CLI config.");
	}

	const config: Config = configLoc.endsWith('json') ? JSON.parse(await readFile(configLoc, 'utf8')) : load(await readFile(configLoc, 'utf8'));

	if (!config) {
		return fail("Can't parse the Sapphire CLI config.");
	}

	const result = await Result.fromAsync<boolean, Error>(() =>
		createComponent(component, name, config, configLoc.replace(/.sapphirerc.(json|yml)/g, ''))
	);

	return result.match({
		ok: () => {
			spinner.success();

			console.log(blueBright('Done!'));
			process.exit(0);
		},
		err: (error) => fail(error.message, () => console.log(red(error.message)))
	});
};
