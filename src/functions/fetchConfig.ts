import findUp from 'find-up';
import { setTimeout as sleep } from 'node:timers/promises';

/**
 * Fetches the configuration file asynchronously.
 * It first tries to find the '.sapphirerc.json' file in the current working directory.
 * If not found, it then tries to find the '.sapphirerc.yml' file.
 * Returns a Promise that resolves to the configuration file as JSON if found, otherwise resolves to null.
 * @returns A Promise that resolves to the configuration file as JSON if found, otherwise resolves to null.
 */
export async function fetchConfig() {
	const configFileAsJson = await Promise.race([findUp('.sapphirerc.json', { cwd: '.' }), sleep(5000)]);

	if (configFileAsJson) {
		return configFileAsJson;
	}

	return Promise.race([findUp('.sapphirerc.yml', { cwd: '.' }), sleep(5000)]);
}
