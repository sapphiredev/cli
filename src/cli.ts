#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';

import newCmd from '#commands/new.js';
import generateCmd from '#commands/generate.js';

const sapphire = new Command();
const packageJson = JSON.parse(await readFile(`${process.cwd()}/package.json`, 'utf8'));

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

sapphire.parse(process.argv);
