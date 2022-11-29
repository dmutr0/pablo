import { bold, greenBright } from "cli-color";
import { Logger } from "tslog";
import { ILogger } from "./logger.interface";

export class LoggerService implements ILogger {
    constructor(
        private readonly logger = new Logger(
            {
                "displayFilePath": "hidden",
                "displayFunctionName": false,
                "displayInstanceName": false,
            }
        )
        ) {}

    info(...args: any): void {
        this.logger.info(bold(greenBright(...args)));
    }

    debug(...args: any): void {
        this.logger.debug(bold(...args));
    }

    warn(...args: any): void {
        this.logger.warn(bold(...args));
    }

    error(...args: any): void {
        this.logger.error(bold(...args));
    }
}
