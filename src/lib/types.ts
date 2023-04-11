/**
 * Scheme for Sapphire CLI Config (@sapphire/cli)
 */
export interface Config {
	/**
	 * Settings about custom component (piece) templates
	 */
	customFileTemplates: CustomFileTemplates;
	/**
	 * Categories and their locations
	 */
	locations: Locations;
	/**
	 * Project language (ts | js)
	 */
	projectLanguage: string;
	[property: string]: any;
}

/**
 * Settings about custom component (piece) templates
 */
interface CustomFileTemplates {
	/**
	 * Enable custom file templates
	 */
	enabled: boolean;
	/**
	 * Location of your custom file templates
	 */
	location: string;
	[property: string]: any;
}

/**
 * Categories and their locations
 */
interface Locations {
	arguments: string;
	base: string;
	commands: string;
	listeners: string;
	preconditions: string;
	routes?: string;
	[property: string]: any;
}
