import type { Config } from '#lib/types';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import findUp from 'find-up';
import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

export async function generateCommandFlow(spinnerMessage: string, callback: (config: Config, configLocation: string) => Promise<boolean>) {
	const spinner = new Spinner(spinnerMessage).start();

	const fail = (error: string, additionalExecution?: () => void) => {
		spinner.error({ text: error });
		additionalExecution?.();
		process.exit(1);
	};

	const configLocation = await fetchConfig();

	if (!configLocation) {
		return fail("Can't find the Sapphire CLI config.");
	}

	const config: Config = configLocation.endsWith('json')
		? JSON.parse(await readFile(configLocation, 'utf8'))
		: load(await readFile(configLocation, 'utf8'));

	if (!config) {
		return fail("Can't parse the Sapphire CLI config.");
	}

	const result = await Result.fromAsync<boolean, Error>(() => callback(config, configLocation.replace(/.sapphirerc.(json|yml)/g, '')));

	return result.match({
		ok: () => {
			spinner.success();

			console.log(blueBright('Done!'));
			process.exit(0);
		},
		err: (error) => fail(error.message, () => console.log(red(error.message)))
	});
}

/**
 * Fetches the configuration file asynchronously.
 * It first tries to find the '.sapphirerc.json' file in the current working directory.
 * If not found, it then tries to find the '.sapphirerc.yml' file.
 * Returns a Promise that resolves to the configuration file as JSON if found, otherwise resolves to null.
 * @returns A Promise that resolves to the configuration file as JSON if found, otherwise resolves to null.
 */
async function fetchConfig() {
	const configFileAsJson = await Promise.race([findUp('.sapphirerc.json', { cwd: '.' }), sleep(5000)]);

	if (configFileAsJson) {
		return configFileAsJson;
	}

	return Promise.race([findUp('.sapphirerc.yml', { cwd: '.' }), sleep(5000)]);
}
