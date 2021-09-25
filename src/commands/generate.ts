import { CreateFileFromTemplate } from '#functions';
import { Command, flags } from '@oclif/command';
import { blueBright, red } from 'chalk';
import FindUp from 'find-up';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import ora from 'ora';
import { join, basename } from 'path';
import { setTimeout } from 'timers/promises';

export default class Generate extends Command {
	public async run() {
		const { args } = this.parse(Generate);

		const spinner = ora(`Creating a ${args.component.toLowerCase()}`).start();
		const fail = (error: string) => {
			spinner.fail(error);
			process.exit(1);
		};

		const configLoc = await this.fetchConfig();
		if (!configLoc) return fail("Can't find the Sapphire CLI config.");
		const config = JSON.parse(await readFile(configLoc, 'utf8'));
		if (!config) return fail("Can't parse the Sapphire CLI config.");

		await this.createComponent(args.component, args.name, config, configLoc.replace('.sapphirerc.json', '')).catch((err) => {
			spinner.fail();
			console.log(red(err.message));
			process.exit(1);
		});
		spinner.succeed();
		return console.log(blueBright('Done!'));
	}

	private createComponent(component: string, name: string, config: any, configLoc: string) {
		return new Promise(async (resolve, reject) => {
			const { projectLanguage } = config;
			if (!projectLanguage) return reject(new Error("There is no 'projectLanguage' field in .sapphirerc.json"));
			const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;

			const corePath = `${__dirname}/../../templates/components/${template}`;
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

	private timeout(ms: number): Promise<null> {
		return new Promise((resolve, reject) => {
			// false positive
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			return setTimeout(ms)
				.then(() => {
					resolve(null);
				})
				.catch(reject);
		});
	}

	private fetchConfig(): Promise<
		Promise<string | undefined> | Promise<null> extends PromiseLike<infer U> ? U : Promise<string | undefined> | Promise<null>
	> {
		return Promise.race([FindUp('.sapphirerc.json', { cwd: '.' }), this.timeout(5000)]);
	}

	public static description = 'generate a component (command, listener, etc.)';

	public static flags = {
		help: flags.help({ char: 'h' })
	};

	public static args = [
		{ name: 'component', required: true },
		{ name: 'name', required: true }
	];
}
