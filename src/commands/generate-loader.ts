import { locationReplacement } from '#constants';
import { CreateComponentLoaders } from '#functions/CreateComponentLoader';
import { generateCommandFlow } from '#functions/generateCommandFlow';
import type { Config } from '#lib/types';
import { join } from 'node:path';

/**
 * Generates loaders based on the Sapphire CLI config.
 * @returns A promise that resolves when the loaders are created.
 */
export default async (): Promise<void> => {
	return generateCommandFlow('Creating loaders...', (config, configLocation) => createLoader(config, configLocation));
};

/**
 * Creates a loader component based on the provided configuration.
 * @param config - The configuration object.
 * @param configLoc - The location of the configuration file.
 * @returns A promise that resolves to the created loader component.
 * @throws An error if the 'projectLanguage' field is missing in the configuration file or if a template file for the loader component cannot be found.
 */
export async function createLoader(config: Config, configLoc: string) {
	const { projectLanguage } = config;

	if (!projectLanguage) {
		throw new Error("There is no 'projectLanguage' field in .sapphirerc.json");
	}

	const targetDir = join(configLoc, config.locations.base, locationReplacement);

	return CreateComponentLoaders(targetDir, config);
}
