import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";

@injectable()
export class Queue {
	queue: string[] = [];

	constructor(@inject(TYPES.Logger) private logger: ILogger) {}

	public next(): string {
		return this.queue.shift() || "";
	}

	public add(msg: string) {
		this.queue.push(msg);
	}
}