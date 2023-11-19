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

async function editPackageJson(location: string, name: string) {
	const pjLocation = `./${location}/package.json`;
	const output = JSON.parse(await readFile(pjLocation, 'utf8'));
	if (!output) throw new Error("Can't read file.");

	output.name = name;

	const result = await Result.fromAsync(() => writeFile(pjLocation, JSON.stringify(output, null, 2)));

	return result.isOk();
}

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

async function configureYarnRc(location: string, name: string, value: string) {
	await execa('yarn', ['config', 'set', name, value], { cwd: `./${location}/` });
	return true;
}

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

async function initializeGitRepo(location: string) {
	await execa('git', ['init'], { cwd: `./${location}/` });
	return true;
}

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

async function cloneRepo(location: string, verbose: boolean) {
	const value = await execa('git', ['clone', repoUrl, `${location}/ghr`], { stdio: verbose ? 'inherit' : undefined });
	if (value.exitCode !== 0) {
		throw new Error('An unknown error occurred while cloning the repository. Try running Sapphire CLI with "--verbose" flag.');
	}

	return true;
}

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
