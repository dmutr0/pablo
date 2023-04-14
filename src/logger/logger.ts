import { bold } from "cli-color";
import { Logger as WrappedLogger, ILogObj } from "tslog";
import { ILogger } from "./logger.interface";
import { injectable } from "inversify";

@injectable()
export class Logger implements ILogger {
	constructor(
		private readonly logger = new WrappedLogger<ILogObj>({
			stylePrettyLogs: true,
			hideLogPositionForProduction: true,
		})
	) {}

	info(...args: unknown[]): void {
		this.logger.info(bold(...args));
	}

	debug(...args: unknown[]): void {
		this.logger.debug(bold(...args));
	}

	warn(...args: unknown[]): void {
		this.logger.warn(bold(...args));
	}

	error(...args: unknown[]): void {
		this.logger.error(bold(...args));
	}
}
