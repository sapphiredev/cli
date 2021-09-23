declare module '@oclif/errors/handle' {
	import type { PrettyPrintableError } from '@oclif/errors/lib/errors/pretty-print';
	import type { OclifError } from '@oclif/errors/lib/errors/cli';

	const handle: (err: Error & Partial<PrettyPrintableError> & Partial<OclifError>) => void;

	export default handle;
}
