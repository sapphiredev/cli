import { componentsFolder } from '#constants';
import { fileExists } from '#functions/FileExists';
import { fetchConfig } from '#functions/fetchConfig';
import type { Config } from '#lib/types';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateComponentLoaders } from '../functions/CreateComponentLoader.js';

/**
 * Generates loaders based on the Sapphire CLI config.
 * @returns A promise that resolves when the loaders are created.
 */
export default async (): Promise<void> => {
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

/**
 * Creates a loader component based on the provided configuration.
 * @param config - The configuration object.
 * @param configLoc - The location of the configuration file.
 * @returns A promise that resolves to the created loader component.
 * @throws An error if the 'projectLanguage' field is missing in the configuration file or if a template file for the loader component cannot be found.
 */
async function createLoader(config: Config, configLoc: string) {
	const component = '_load';
	const { projectLanguage } = config;

	if (!projectLanguage) {
		throw new Error("There is no 'projectLanguage' field in .sapphirerc.json");
	}

	const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;
	const templateLocation = `${componentsFolder}${template}`;
	const targetDir = join(configLoc, config.locations.base, '%L%');

	if (await fileExists(templateLocation)) {
		return CreateComponentLoaders(templateLocation, targetDir, config);
	}

	throw new Error(`Couldn't find a template file for loader component.`);
}
