import { CommandExists, CreateFileFromTemplate } from '#functions';
import { PromptNew } from '#prompts';
import { Command, flags } from '@oclif/command';
import { blueBright, red } from 'chalk';
import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { cp, readFile, rm, writeFile } from 'fs/promises';
import ora from 'ora';
import { resolve } from 'path';
import prompts from 'prompts';
import { config } from '../config';

export default class New extends Command {
	public async run() {
		const { args, flags } = this.parse(New);
		const response = await prompts(PromptNew(args.ProjectName, await CommandExists('yarn')));
		if (!response.projectName || !response.projectLang || !response.projectTemplate || !response.packageManager) {
			process.exit(1);
		}
		const projectName = response.projectName === '.' ? '' : response.projectName;

		const stpJob = async () => {
			await cp(`./${response.projectName}/ghr/examples/${response.projectTemplate}/.`, `./${response.projectName}/`, { recursive: true });

			for (const p of ['.gitignore', '.prettierignore']) {
				await cp(`./${response.projectName}/ghr/${p}`, `./${response.projectName}/${p}`, { recursive: true });
			}

			await rm(`./${response.projectName}/ghr`, { recursive: true, force: true });

			await CreateFileFromTemplate('.sapphirerc.json.sapphire', resolve(`./${response.projectName}/.sapphirerc.json`), null, {
				language: response.projectLang
			});

			await this.editPackageJson(response.projectName, projectName);
		};

		const jobs: [() => any, string][] = [
			[() => this.cloneRepo(response.projectName, flags.verbose), 'Cloning the repository'],
			[stpJob, 'Setting up the project'],
			[
				() => this.installDeps(response.projectName, response.packageManager, flags.verbose),
				`Installing dependencies using ${response.packageManager}`
			]
		];

		if (response.git) {
			jobs.push([() => this.initializeGitRepo(response.projectName), 'Initializing git repo']);
		}

		for (const [job, name] of jobs) {
			await this.runJob(job, name).catch(() => process.exit(1));
		}

		console.log(blueBright('Done!'));
	}

	private cloneRepo(location: string, verbose: boolean) {
		const git = spawn('git', ['clone', config.repoUrl, `${location}/ghr`], {
			stdio: verbose ? 'inherit' : undefined
		});

		return new Promise((resolve, reject) => {
			git.on('error', reject);

			git.on('exit', (code) => {
				code === 0
					? resolve(true)
					: reject(new Error('An unknown error occured while cloning the repository. Try running Sapphire CLI with "--verbose" flag.'));
			});
		});
	}

	private editPackageJson(location: string, name: string) {
		return new Promise(async (resolve, reject) => {
			const pjLocation = `./${location}/package.json`;
			const output = JSON.parse(await readFile(pjLocation, 'utf8'));
			if (!output) return reject(new Error("Can't read file."));

			output.name = name;
			await writeFile(pjLocation, JSON.stringify(output, null, 2)).catch(reject);
			return resolve(true);
		});
	}

	private installDeps(location: string, pm: string, verbose: boolean) {
		const pmp = spawn(pm.toLowerCase(), ['install'], {
			stdio: verbose ? 'inherit' : undefined,
			cwd: `./${location}/`
		});

		return new Promise((resolve, reject) => {
			pmp.on('error', reject);

			pmp.on('exit', async (code) => {
				if (code === 0) {
					const lockfile = `./${location}/${pm === 'npm' ? 'yarn.lock' : 'package-lock.json'}`;
					if (existsSync(lockfile)) await rm(lockfile);
					resolve(true);
				} else {
					reject(new Error('An unknown error occured while installing the dependencies. Try running Sapphire CLI with "--verbose" flag.'));
				}
			});
		});
	}

	private initializeGitRepo(location: string) {
		return new Promise((resolve, reject) => {
			return exec('git init', { cwd: `./${location}/` }, (e) => {
				if (!e) return resolve(true);
				return reject(e);
			});
		});
	}

	private runJob(job: () => Promise<any>, name: string) {
		return new Promise((resolve, reject) => {
			const spinner = ora(name).start();
			return job()
				.then(() => {
					spinner.succeed();
					resolve(true);
				})
				.catch((e: Error) => {
					spinner.fail(red(e.message));
					console.log(red(e));
					reject(e);
				});
		});
	}

	public static description = 'create a new Sapphire project';

	public static flags = {
		help: flags.help({ char: 'h' }),
		verbose: flags.boolean({ char: 'v' })
	};

	public static args = [{ name: 'ProjectName', default: 'NewSapphireProject' }];
}
