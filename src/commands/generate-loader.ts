import { componentsFolder } from '#constants';
import { fileExists } from '#functions/FileExists';
import type { Config } from '#lib/types';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import findUp from 'find-up';
import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { CreateComponentLoaders } from '../functions/CreateComponentLoader.js';

async function createLoader(config: Config, configLoc: string) {
	const component = '_load';
	const name = '_load';
	const { projectLanguage } = config;

	if (!projectLanguage) {
		throw new Error("There is no 'projectLanguage' field in .sapphirerc.json");
	}

	const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;

	const corePath = `${componentsFolder}${template}`;
	const target = join(configLoc, config.locations.base, '%L%', `${name}.${projectLanguage}`);

	if (await fileExists(corePath)) {
		return CreateComponentLoaders(target, config);
	}

	throw new Error(`Couldn't find a template file for loader component.`);
}

async function fetchConfig() {
	const configFileAsJson = await Promise.race([findUp('.sapphirerc.json', { cwd: '.' }), sleep(5000)]);

	if (configFileAsJson) {
		return configFileAsJson;
	}

	return Promise.race([findUp('.sapphirerc.yml', { cwd: '.' }), sleep(5000)]);
}

export default async () => {
	const spinner = new Spinner(`Creating loaders...`).start();

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

	const result = await Result.fromAsync<boolean, Error>(() => createLoader(config, configLoc.replace(/.sapphirerc.(json|yml)/g, '')));

	return result.match({
		ok: () => {
			spinner.success();

			console.log(blueBright('Done!'));
			process.exit(0);
		},
		err: (error) => fail(error.message, () => console.log(red(error.message)))
	});
};