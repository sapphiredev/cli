import { repoUrl } from '#constants';
import { CommandExists } from '#functions/CommandExists';
import { CreateFileFromTemplate } from '#functions/CreateFileFromTemplate';
import { fileExists } from '#functions/FileExists';
import { PromptNew, type PromptNewObjectKeys } from '#prompts/PromptNew';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { blueBright, red } from 'colorette';
import { execa } from 'execa';
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import prompts from 'prompts';

/**
 * Creates a new project with the given name and flags.
 * @param name - The name of the project.
 * @param flags - The flags for the project.
 * @returns A promise that resolves when the project setup is complete.
 */
export default async (name: string, flags: Record<string, boolean>) => {
	const response = await prompts<PromptNewObjectKeys>(PromptNew(name, await CommandExists('yarn'), await CommandExists('pnpm')));

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

		if (response.packageManager === 'pnpm') {
			await writeFile(`./${response.projectName}/.npmrc`, '# pnpm only\nshamefully-hoist=true\npublic-hoist-pattern[]=@sapphire/*');
		}
	};

	const jobs: [() => any, string][] = [
		[() => cloneRepo(response.projectName, flags.verbose), 'Cloning the repository'],
		[stpJob, 'Setting up the project']
	];

	if (response.git) {
		jobs.push([() => initializeGitRepo(response.projectName), 'Initializing git repo']);
	}

	if (response.yarnV4) {
		jobs.push([() => installYarnV4(response.projectName, flags.verbose), 'Installing Yarn v4']);
		jobs.push([() => configureYarnRc(response.projectName, 'enableGlobalCache', 'true'), 'Enabling Yarn v4 global cache']);
		jobs.push([() => configureYarnRc(response.projectName, 'nodeLinker', 'node-modules'), 'Configuring Yarn v4 to use node-modules']);
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

/**
 * Edits the package.json file at the specified location by updating the "name" field.
 * @param location - The location of the package.json file.
 * @param name - The new value for the "name" field.
 * @returns A boolean indicating whether the operation was successful.
 */
async function editPackageJson(location: string, name: string) {
	const pjLocation = `./${location}/package.json`;
	const output = JSON.parse(await readFile(pjLocation, 'utf8'));
	if (!output) throw new Error("Can't read file.");

	output.name = name;

	const result = await Result.fromAsync(() => writeFile(pjLocation, JSON.stringify(output, null, 2)));

	return result.isOk();
}

/**
 * Installs dependencies using the specified package manager.
 * @param location The location where the dependencies should be installed.
 * @param pm The package manager to use ('npm', 'Yarn', or 'pnpm').
 * @param verbose Whether to display the installation output.
 * @returns A boolean indicating whether the installation was successful.
 */
async function installDeps(location: string, pm: 'npm' | 'Yarn' | 'pnpm', verbose: boolean) {
	const value = await execa(pm.toLowerCase(), ['install'], {
		stdio: verbose ? 'inherit' : undefined,
		cwd: `./${location}/`
	});

	if (value.exitCode !== 0) {
		throw new Error('An unknown error occurred while installing the dependencies. Try running Sapphire CLI with "--verbose" flag.');
	}

	const oppositeLockfiles = {
		npm: ['yarn.lock', 'pnpm-lock.yaml'],
		yarn: ['package-lock.json', 'pnpm-lock.yaml'],
		pnpm: ['package-lock.json', 'yarn.lock']
	} as const;

	const lockfiles = pm === 'npm' ? oppositeLockfiles.npm : pm === 'Yarn' ? oppositeLockfiles.yarn : oppositeLockfiles.pnpm;

	for (const lockfile of lockfiles) {
		if (await fileExists(lockfile)) {
			await rm(lockfile);
		}
	}

	return true;
}

/**
 * Configures the yarnrc file with the specified name and value.
 *
 * @param location - The location of the yarnrc file.
 * @param name - The name of the configuration to set.
 * @param value - The value to set for the configuration.
 * @returns A promise that resolves to true if the configuration was successfully set, otherwise false.
 */
async function configureYarnRc(location: string, name: string, value: string) {
	await execa('yarn', ['config', 'set', name, value], { cwd: `./${location}/` });
	return true;
}

/**
 * Installs Yarn v4 at the specified location.
 *
 * @param location - The location where Yarn v4 will be installed.
 * @param verbose - Whether to display verbose output during installation.
 * @returns A boolean indicating whether the installation was successful.
 * @throws An error if an unknown error occurs during installation.
 */
async function installYarnV4(location: string, verbose: boolean) {
	const valueSetVersion = await execa('yarn', ['set', 'version', 'berry'], {
		stdio: verbose ? 'inherit' : undefined,
		cwd: `./${location}/`
	});

	if (valueSetVersion.exitCode !== 0) {
		throw new Error('An unknown error occurred while installing Yarn v4. Try running Sapphire CLI with "--verbose" flag.');
	}

	return true;
}

/**
 * Initializes a Git repository at the specified location.
 * @param location - The location where the Git repository should be initialized.
 * @returns A boolean indicating whether the Git repository was successfully initialized.
 */
async function initializeGitRepo(location: string) {
	await execa('git', ['init'], { cwd: `./${location}/` });
	return true;
}

/**
 * Runs a job asynchronously and handles the result.
 *
 * @param job - The job to be executed.
 * @param name - The name of the job.
 * @returns A boolean indicating whether the job was successful or not.
 */
async function runJob(job: () => Promise<any>, name: string) {
	const spinner = new Spinner(name).start();

	const result = await Result.fromAsync<any, Error>(() => job());
	return result.match({
		ok: () => {
			spinner.success();
			return true;
		},
		err: (error) => {
			spinner.error({ text: red(error.message) });
			console.error(red(error.message));
			throw error;
		}
	});
}

/**
 * Clones a repository to the specified location.
 * @param location - The location where the repository will be cloned.
 * @param verbose - Whether to display the output of the cloning process.
 * @returns A boolean indicating whether the cloning was successful.
 * @throws An error if an unknown error occurred while cloning the repository.
 */
async function cloneRepo(location: string, verbose: boolean) {
	const value = await execa('git', ['clone', repoUrl, `${location}/ghr`], { stdio: verbose ? 'inherit' : undefined });
	if (value.exitCode !== 0) {
		throw new Error('An unknown error occurred while cloning the repository. Try running Sapphire CLI with "--verbose" flag.');
	}

	return true;
}
