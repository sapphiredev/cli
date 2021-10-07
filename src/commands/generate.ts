import { CreateFileFromTemplate } from '#functions';
import { componentsFolder } from '#constants';
import chalk from 'chalk';
import FindUp from 'find-up';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import ora from 'ora';
import { join, basename } from 'path';
import { setTimeout } from 'timers/promises';
import YAML from 'yaml';

const { blueBright, red } = chalk;

function createComponent(component: string, name: string, config: any, configLoc: string) {
	return new Promise((resolve, reject) => {
		const { projectLanguage } = config;
		if (!projectLanguage) return reject(new Error("There is no 'projectLanguage' field in .sapphirerc.json"));
		const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;

		const corePath = `${componentsFolder.pathname}${template}`;
		const userPath = config.customFileTemplates.enabled ? join(configLoc, config.customFileTemplates.location, template) : null;
		const target = join(configLoc, config.locations.base, '%L%', `${name}.${projectLanguage}`);
		const params = { name: basename(name) };

		if (userPath && existsSync(userPath)) {
			return CreateFileFromTemplate(userPath, target, config, params, true, true).then(resolve).catch(reject);
		} else if (existsSync(corePath)) {
			return CreateFileFromTemplate(`components/${template}`, target, config, params, false, true).then(resolve).catch(reject);
		}
		return reject(new Error("Can't find the template."));
	});
}

function timeout(ms: number): Promise<null> {
	return new Promise((resolve, reject) => {
		// false positive
		// eslint-disable-next-line @typescript-eslint/no-implied-eval
		return setTimeout(ms)
			.then(() => {
				return resolve(null);
			})
			.catch(reject);
	});
}

function fetchConfig(): Promise<
	Promise<string | undefined> | Promise<null> extends PromiseLike<infer U> ? U : Promise<string | undefined> | Promise<null>
> {
	return Promise.race([FindUp('.sapphirerc.json', { cwd: '.' }), timeout(5000)]).then((a) => {
		if (a) return a;
		return Promise.race([FindUp('.sapphirerc.yml', { cwd: '.' }), timeout(5000)]);
	});
}

export default async (component: string, name: string) => {
	const spinner = ora(`Creating a ${component.toLowerCase()}`).start();
	const fail = (error: string) => {
		spinner.fail(error);
		process.exit(1);
	};

	const configLoc = await fetchConfig();
	if (!configLoc) return fail("Can't find the Sapphire CLI config.");
	const config = configLoc.endsWith('json') ? JSON.parse(await readFile(configLoc, 'utf8')) : YAML.parse(await readFile(configLoc, 'utf8'));
	if (!config) return fail("Can't parse the Sapphire CLI config.");

	await createComponent(component, name, config, configLoc.replace(/.sapphirerc.(json|yml)/g, '')).catch((err) => {
		spinner.fail();
		console.log(red(err.message));
		process.exit(1);
	});
	spinner.succeed();
	return console.log(blueBright('Done!'));
};
