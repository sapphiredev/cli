import { repoUrl } from '#constants';
import { CommandExists } from '#functions/CommandExists';
import { CreateFileFromTemplate } from '#functions/CreateFileFromTemplate';
import { fileExists } from '#functions/FileExists';
import { PromptNew, PromptNewObjectKeys } from '#prompts/PromptNew';
import { fromAsync, isErr } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import { execa } from 'execa';
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ora from 'ora';
import prompts from 'prompts';

async function editPackageJson(location: string, name: string) {
	const pjLocation = `./${location}/package.json`;
	const output = JSON.parse(await readFile(pjLocation, 'utf8'));
	if (!output) throw new Error("Can't read file.");

	output.name = name;

	const result = await fromAsync(async () => writeFile(pjLocation, JSON.stringify(output, null, 2)));

	if (isErr(result)) {
		return false;
	}

	return true;
}

async function installDeps(location: string, pm: string, verbose: boolean) {
	const result = await fromAsync(async () =>
		execa(pm.toLowerCase(), ['install'], {
			stdio: verbose ? 'inherit' : undefined,
			cwd: `./${location}/`
		})
	);

	if (isErr(result)) {
		throw result.error;
	}

	if (result.value.exitCode !== 0) {
		throw new Error('An unknown error occurred while installing the dependencies. Try running Sapphire CLI with "--verbose" flag.');
	}

	const oppositeLockfile = `./${location}/${pm === 'npm' ? 'yarn.lock' : 'package-lock.json'}`;

	if (await fileExists(oppositeLockfile)) {
		await rm(oppositeLockfile);
	}

	return true;
}

async function configureYarnRc(location: string, name: string, value: string) {
	const result = await fromAsync(async () => execa('yarn', ['config', 'set', name, value], { cwd: `./${location}/` }));

	if (isErr(result)) {
		throw result.error;
	}

	return true;
}

async function installYarnV3(location: string, verbose: boolean) {
	const result = await fromAsync(async () =>
		execa('yarn', ['set', 'version', 'berry'], {
			stdio: verbose ? 'inherit' : undefined,
			cwd: `./${location}/`
		})
	);

	if (isErr(result)) {
		throw result.error;
	}

	if (result.value.exitCode !== 0) {
		throw new Error('An unknown error occurred while installing Yarn v3. Try running Sapphire CLI with "--verbose" flag.');
	}

	await Promise.all([
		//
		configureYarnRc(location, 'enableGlobalCache', 'true'),
		configureYarnRc(location, 'nodeLinker', 'node-modules')
	]);

	return true;
}

async function installYarnTypescriptPlugin(location: string) {
	const result = await fromAsync(async () => execa('yarn', ['plugin', 'import', 'typescript'], { cwd: `./${location}/` }));

	if (isErr(result)) {
		throw result.error;
	}

	return true;
}

async function initializeGitRepo(location: string) {
	const result = await fromAsync(async () => execa('git', ['init'], { cwd: `./${location}/` }));

	if (isErr(result)) {
		throw result.error;
	}

	return true;
}

async function runJob(job: () => Promise<any>, name: string) {
	const spinner = ora(name).start();

	const result = await fromAsync(async () => job());

	if (isErr(result)) {
		spinner.fail(red((result.error as Error).message));
		console.error(red((result.error as Error).message));
		throw result.error;
	}

	spinner.succeed();
	return true;
}

async function cloneRepo(location: string, verbose: boolean) {
	const result = await fromAsync(async () =>
		execa('git', ['clone', repoUrl, `${location}/ghr`], {
			stdio: verbose ? 'inherit' : undefined
		})
	);

	if (isErr(result)) {
		throw result.error;
	}

	if (result.value.exitCode !== 0) {
		throw new Error('An unknown error occurred while cloning the repository. Try running Sapphire CLI with "--verbose" flag.');
	}

	return true;
}

export default async (name: string, flags: Record<string, boolean>) => {
	const response = await prompts<PromptNewObjectKeys>(PromptNew(name, await CommandExists('yarn')));

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
		[stpJob, 'Setting up the project']
	];

	if (response.git) {
		jobs.push([() => initializeGitRepo(response.projectName), 'Initializing git repo']);
	}

	if (response.yarnV3) {
		jobs.push([() => installYarnV3(response.projectName, flags.verbose), 'Installing Yarn v3']);
		if (response.projectLang === 'ts') jobs.push([() => installYarnTypescriptPlugin(response.projectName), 'Installing Yarn Typescript Plugin']);
	}

	jobs.push([
		() => installDeps(response.projectName, response.packageManager, flags.verbose),
		`Installing dependencies using ${response.packageManager}`
	]);

	for (const [job, name] of jobs) {
		await runJob(job, name).catch(() => process.exit(1));
	}

	console.log(blueBright('Done!'));
	process.exit(0);
};
