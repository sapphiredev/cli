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

async function createComponent(component: string, name: string, config: any, configLoc: string) {
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

	throw new Error("Can't find the template.");
}

async function fetchConfig() {
	const a = await Promise.race([findUp('.sapphirerc.json', { cwd: '.' }), sleep(5000)]);

	if (a) {
		return a;
	}

	return Promise.race([findUp('.sapphirerc.yml', { cwd: '.' }), sleep(5000)]);
}

export default async (component: string, name: string) => {
	const spinner = new Spinner(`Creating a ${component.toLowerCase()}`).start();

	const fail = (error: string, additionalExecution?: () => void) => {
		spinner.error({ text: error });
		if (additionalExecution) additionalExecution();
		process.exit(1);
	};

	const configLoc = await fetchConfig();

	if (!configLoc) {
		return fail("Can't find the Sapphire CLI config.");
	}

	const config = configLoc.endsWith('json') ? JSON.parse(await readFile(configLoc, 'utf8')) : load(await readFile(configLoc, 'utf8'));

	if (!config) {
		return fail("Can't parse the Sapphire CLI config.");
	}

	const result = await Result.fromAsync<Promise<boolean>, Error>(async () =>
		createComponent(component, name, config, configLoc.replace(/.sapphirerc.(json|yml)/g, ''))
	);

	result.orElse((error) => fail(error.message, () => console.log(red(error.message))));

	spinner.success();

	console.log(blueBright('Done!'));
	process.exit(0);
};
