import { componentsFolder, locationReplacement } from '#constants';
import { CreateFileFromTemplate } from '#functions/CreateFileFromTemplate';
import { fileExists } from '#functions/FileExists';
import { generateCommandFlow } from '#functions/generateCommandFlow';
import { commandNames, componentCommandNames, componentInteractionHandlerNames, interactionHandlerNames } from '#lib/aliases';
import type { Config } from '#lib/types';
import { basename, join } from 'node:path';

/**
 * Generates a component based on the given component type and name.
 * @param component The type of component to generate.
 * @param name The name of the component.
 * @returns A Promise that resolves when the component generation is complete.
 */
export default async (component: string, name: string): Promise<void> => {
	return generateCommandFlow('Creating loaders...', (config, configLocation) => createComponent(component, name, config, configLocation));
};

/**
 * Joins an array of component names into a single string.
 *
 * @param components - An array of component names.
 * @returns The joined string with component names.
 */
function joinComponentNames(components: string[]): string {
	const lastComponent = components.pop();
	return `"${components.join('", "')}" or "${lastComponent}"`;
}

/**
 * Creates a component based on the specified parameters.
 *
 * @param component - The type of component to create.
 * @param name - The name of the component.
 * @param config - The configuration object.
 * @param configLoc - The location of the configuration file.
 * @returns A Promise that resolves when the component is created.
 * @throws An error if the 'projectLanguage' field is missing in the configuration file,
 * or if a template file for the component type cannot be found.
 */
async function createComponent(component: string, name: string, config: Config, configLoc: string) {
	const { projectLanguage } = config;

	if (!projectLanguage) {
		throw new Error("There is no 'projectLanguage' field in .sapphirerc.json");
	}

	const template = `${component.toLowerCase()}.${projectLanguage}.sapphire`;

	const corePath = `${componentsFolder}${template}`;
	const userPath = config.customFileTemplates.enabled ? join(configLoc, config.customFileTemplates.location, template) : null;
	const target = join(configLoc, config.locations.base, locationReplacement, `${name}.${projectLanguage}`);
	const params = { name: basename(name) };

	if (userPath && (await fileExists(userPath))) {
		return CreateFileFromTemplate(userPath, target, config, params, true, true);
	} else if (await fileExists(corePath)) {
		return CreateFileFromTemplate(`components/${template}`, target, config, params, false, true);
	}

	throw new Error(`Couldn't find a template file for that component type.${parseCommonHints(component)}`);
}

/**
 * Parses common hints for the user
 * @param component Component name
 * @returns A string with a hint for the user
 */
function parseCommonHints(component: string): string {
	const newLine = '\n';
	const lowerCaseComponent = component.toLowerCase();
	const commonHints = `${newLine}Hint: You wrote "${component}", instead of `;

	if (commandNames.includes(lowerCaseComponent)) {
		return `${commonHints}"${joinComponentNames(componentCommandNames)}".`;
	}

	if (interactionHandlerNames.includes(lowerCaseComponent)) {
		return `${commonHints} ${joinComponentNames(componentInteractionHandlerNames)}.`;
	}

	return '';
}
