import express, { Express, NextFunction, Request, Response } from "express";
import { Bot } from "../bot";
import { ILogger } from "../logger/logger.interface";

export class App {
	app: Express;
	host = "0.0.0.0";
	port = Number(process.env.PORT) || 3000;
	private textArray: string[] = [];
	constructor(private readonly logger: ILogger) {
		this.app = express();
	}

	public addString(text: string): void {
		this.textArray.push(text);
		this.logger.warn(text);
	}

	async init(): Promise<void> {

		this.app.get("/getstring", (req: Request, res: Response, next: NextFunction) => {
			if (this.textArray.length > 0) {
				res.send(this.textArray.shift());
			}
			
		})

		this.app.listen(this.port, this.host, () => {
			this.logger.info(`Server started on ${this.host}:${this.port}`);
		});
	}
}
