import { CommandExists, CreateFileFromTemplate } from '#functions';
import { PromptNew } from '#prompts';
import { Command, flags } from '@oclif/command';
import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { cp, readFile, rm, writeFile } from 'fs/promises';
import ora from 'ora';
import { resolve } from 'path';
import prompts from 'prompts';
import { config } from '../config';
import chalk from 'chalk';

export default class New extends Command {
	public async run() {
		const { args, flags } = this.parse(New);
		const response = await prompts(PromptNew(args.ProjectName, await CommandExists('yarn')));
		if (!response.projectName || !response.projectLang || !response.projectTemplate || !response.packageManager) {
			process.exit(1);
		}
		const projectName = response.projectName === '.' ? '' : response.projectName;

		const gitSpinner = ora('Cloning the repository').start();
		await this.cloneRepo(response.projectName, flags.verbose).catch((err) => {
			gitSpinner.fail('An error occurred while cloning the repository');
			console.log(chalk.red(err.message));
			process.exit(1);
		});
		gitSpinner.succeed('Cloned the repository');

		const stpSpinner = ora('Setting up the project').start();
		const stpSpinnerFail = (err: Error) => {
			stpSpinner.fail('An error occurred while setting up the project');
			console.log(chalk.red(err.message));
			process.exit(1);
		};

		await cp(`./${response.projectName}/ghr/examples/${response.projectTemplate}/.`, `./${response.projectName}/`, { recursive: true }).catch(
			stpSpinnerFail
		);
		await rm(`./${response.projectName}/ghr`, { recursive: true, force: true }).catch(stpSpinnerFail);

		await CreateFileFromTemplate('.sapphirerc.json', resolve(`./${response.projectName}/.sapphirerc.json`), {
			language: response.projectLang
		}).catch(stpSpinnerFail);
		await this.editPackageJson(response.projectName, projectName).catch(stpSpinnerFail);

		stpSpinner.succeed();

		const pmSpinner = ora(`Installing dependencies using ${response.packageManager}`).start();
		await this.installDeps(response.projectName, response.packageManager, flags.verbose).catch((err) => {
			pmSpinner.fail('An error occurred while installing the dependencies.');
			console.log(chalk.red(err.message));
			process.exit(1);
		});
		await pmSpinner.succeed();

		if (response.git) {
			const gitSpinner = ora('Initializing git repo').start();
			await this.initializeGitRepo(response.projectName).catch((err) => {
				gitSpinner.fail('An error occurred while initializing the git repo');
				console.log(chalk.red(err.message));
				process.exit(1);
			});
			gitSpinner.succeed();
		}

		console.log(chalk.blueBright('Done!'));
	}

	public cloneRepo(location: string, verbose: boolean) {
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

	public editPackageJson(location: string, name: string) {
		return new Promise(async (resolve, reject) => {
			const pjLocation = `./${location}/package.json`;
			const output = JSON.parse(await readFile(pjLocation, 'utf8'));
			if (!output) return reject(new Error("Can't read file."));

			output.name = name;
			await writeFile(pjLocation, JSON.stringify(output, null, 2)).catch(reject);
			return resolve(true);
		});
	}

	public installDeps(location: string, pm: string, verbose: boolean) {
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

	public initializeGitRepo(location: string) {
		return new Promise((resolve, reject) => {
			return exec('git init', { cwd: `./${location}/` }, (e) => {
				if (!e) return resolve(true);
				return reject(e);
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
