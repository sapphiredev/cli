#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { URL } from 'url';

import newCmd from '#commands/new';
import generateCmd from '#commands/generate';
import initCmd from '#commands/init';

const sapphire = new Command();

const packageFile = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(await readFile(packageFile, 'utf-8'));

sapphire.name('sapphire').version(packageJson.version);

sapphire
	.command('new')
	.description('creates a new Sapphire project')
	.alias('n')
	.argument('[name]', 'project name')
	.option('-v, --verbose')
	.action(newCmd);

sapphire
	.command('generate')
	.description('generates a component/piece')
	.alias('g')
	.argument('<component>', 'component/piece name')
	.argument('<name>', 'file name')
	.action(generateCmd);

sapphire.command('init').description('creates a config file on an existing Sapphire project').alias('i').action(initCmd);

sapphire.parse(process.argv);
