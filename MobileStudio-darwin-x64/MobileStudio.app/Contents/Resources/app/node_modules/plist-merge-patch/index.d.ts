export interface Reporter {
	log?(msg: string): void;
}

export interface Patch {
	name: string,
	read(): string	
}

export class PlistSession {
	constructor(console: Reporter);
	public patch(patch: Patch): void;
	public build(): string;
}
