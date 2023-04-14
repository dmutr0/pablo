import { blackBright } from "cli-color";

export function createCtx(name: string): string {
	return blackBright(`[${name}]`);
}