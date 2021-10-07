import { CommandExists, CreateFileFromTemplate } from '#functions';
import { PromptNew } from '#prompts';
import chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { cp, readFile, rm, writeFile } from 'fs/promises';
import ora from 'ora';
import { resolve } from 'path';
import prompts from 'prompts';
import { repoUrl } from '#constants';

const { blueBright, red } = chalk;

function editPackageJson(location: string, name: string) {
	return new Promise(async (resolve, reject) => {
		const pjLocation = `./${location}/package.json`;
		const output = JSON.parse(await readFile(pjLocation, 'utf8'));
		if (!output) return reject(new Error("Can't read file."));

		output.name = name;
		await writeFile(pjLocation, JSON.stringify(output, null, 2)).catch(reject);
		return resolve(true);
	});
}

function installDeps(location: string, pm: string, verbose: boolean) {
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

function initializeGitRepo(location: string) {
	return new Promise((resolve, reject) => {
		return exec('git init', { cwd: `./${location}/` }, (e) => {
			if (!e) return resolve(true);
			return reject(e);
		});
	});
}

function runJob(job: () => Promise<any>, name: string) {
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

function cloneRepo(location: string, verbose: boolean) {
	const git = spawn('git', ['clone', repoUrl, `${location}/ghr`], {
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

export default async (name: string, flags: Record<string, boolean>) => {
	const response = await prompts(PromptNew(name, await CommandExists('yarn')));
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

		await CreateFileFromTemplate(
			`.sapphirerc.${response.configFormat}.sapphire`,
			resolve(`./${response.projectName}/.sapphirerc.${response.configFormat}`),
			null,
			{
				language: response.projectLang
			}
		);

		await editPackageJson(response.projectName, projectName);
	};

	const jobs: [() => any, string][] = [
		[() => cloneRepo(response.projectName, flags.verbose), 'Cloning the repository'],
		[stpJob, 'Setting up the project'],
		[() => installDeps(response.projectName, response.packageManager, flags.verbose), `Installing dependencies using ${response.packageManager}`]
	];

	if (response.git) {
		jobs.push([() => initializeGitRepo(response.projectName), 'Initializing git repo']);
	}

	for (const [job, name] of jobs) {
		await runJob(job, name).catch(() => process.exit(1));
	}

	console.log(blueBright('Done!'));
};
