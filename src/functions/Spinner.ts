import * as colorette from 'colorette';
import tty from 'node:tty';

/**
 * A very minimal terminal spinner
 *
 * @license ISC
 * @copyright 2021 Usman Yunusov <usman.iunusov@gmail.com>
 * @see https://github.com/usmanyunusov/nanospinner/blob/master/index.js
 */
export class Spinner implements ISpinner {
	#isCI =
		process.env.CI ||
		process.env.WT_SESSION ||
		process.env.ConEmuTask === '{cmd::Cmder}' ||
		process.env.TERM_PROGRAM === 'vscode' ||
		process.env.TERM === 'xterm-256color' ||
		process.env.TERM === 'alacritty';

	#isTTY = tty.isatty(1) && process.env.TERM !== 'dumb' && !('CI' in process.env);

	#supportUnicode = process.platform === 'win32' ? this.#isCI : process.env.TERM !== 'linux';

	#symbols = {
		frames: this.#isTTY ? (this.#supportUnicode ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] : ['-', '\\', '|', '/']) : ['-'],
		tick: this.#supportUnicode ? '✔' : '√',
		cross: this.#supportUnicode ? '✖' : '×'
	};

	#text = '';
	#current = 0;
	#interval = 50;
	#stream: NodeJS.WriteStream = process.stderr;
	#frames = this.#symbols.frames;
	#color: keyof colorette.Colorette = 'greenBright';
	#lines = 0;
	#timer: NodeJS.Timeout | undefined;

	public constructor(text?: string, options?: SpinnerOptions) {
		this.#text = text ?? this.#text;

		this.#interval = options?.interval ?? this.#interval;
		this.#stream = options?.stream ?? this.#stream;

		if (options?.frames && options?.frames.length) {
			this.#frames = options.frames;
		}

		this.#color = options?.color ?? this.#color;
	}

	public clear(): this {
		this.write('\x1b[1G');

		for (let i = 0; i < this.#lines; i++) {
			i > 0 && this.write('\x1b[1A');
			this.write('\x1b[2K\x1b[1G');
		}

		this.#lines = 0;

		return this;
	}

	public error(options?: { text?: string; mark?: string }): this {
		const mark = colorette.red(this.#symbols.cross);
		return this.stop({ mark, ...options });
	}

	public reset(): this {
		this.#current = 0;
		this.#lines = 0;

		if (this.#timer) {
			clearTimeout(this.#timer);
		}

		return this;
	}

	public spin(): this {
		this.render();
		this.#current = ++this.#current % this.#frames.length;
		return this;
	}

	public start(opts: Parameters<ISpinner['start']>[0] = {}) {
		this.#timer && this.reset();
		return this.update({ text: opts.text, color: opts.color }).loop();
	}

	public stop(opts: Parameters<ISpinner['stop']>[0] = {}) {
		if (this.#timer) {
			clearTimeout(this.#timer);
		}

		const mark = colorette[opts.color || this.#color](this.#frames[this.#current]);
		const optsMark = opts.mark && opts.color ? colorette[opts.color](opts.mark) : opts.mark;
		this.write(`${optsMark || mark} ${opts.text || this.#text}\n`, true);

		return this.#isTTY ? this.write(`\x1b[?25h`) : this;
	}

	public success(opts: Parameters<ISpinner['success']>[0] = {}): this {
		const mark = colorette.green(this.#symbols.tick);
		return this.stop({ mark, ...opts });
	}

	public update(opts: Parameters<ISpinner['update']>[0] = {}): this {
		this.#text = opts.text || this.#text;

		this.#interval = opts?.interval ?? this.#interval;
		this.#stream = opts?.stream ?? this.#stream;

		if (opts?.frames && opts?.frames.length) {
			this.#frames = opts.frames;
		}

		this.#color = opts?.color ?? this.#color;

		if (this.#frames.length - 1 < this.#current) {
			this.#current = 0;
		}

		return this;
	}

	private loop(): this {
		this.#isTTY && (this.#timer = setTimeout(() => this.loop(), this.#interval));
		return this.spin();
	}

	private write(str: string, clear = false): this {
		if (clear && this.#isTTY) {
			this.clear();
		}

		this.#stream.write(str);
		return this;
	}

	private render() {
		const mark = colorette[this.#color](this.#frames[this.#current]);
		let str = `${mark} ${this.#text}`;
		this.#isTTY ? this.write(`\x1b[?25l`) : (str += '\n');
		this.write(str, true);
		this.#isTTY && (this.#lines = this.getLines(str, this.#stream.columns));
	}

	private getLines(str = '', width = 80) {
		return str
			.replace(/\u001b[^m]*?m/g, '')
			.split('\n')
			.reduce((col, line) => (col += Math.max(1, Math.ceil(line.length / width))), 0);
	}
}

interface SpinnerOptions {
	stream?: NodeJS.WriteStream;
	frames?: string[];
	interval?: number;
	text?: string;
	color?: keyof colorette.Colorette;
}

interface ISpinner {
	clear(): Spinner;
	error(opts?: { text?: string; mark?: string }): Spinner;
	reset(): Spinner;
	spin(): Spinner;
	start(opts?: { text?: string; color?: keyof colorette.Colorette }): Spinner;
	stop(opts?: { text?: string; mark?: string; color?: keyof colorette.Colorette }): Spinner;
	success(opts?: { text?: string; mark?: string }): Spinner;
	update(opts?: SpinnerOptions): Spinner;
}
