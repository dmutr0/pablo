import express, { Express, NextFunction, Request, Response } from "express";
import { IMiddleware } from "../common/middleware.interface";
import { ILogger } from "../logger/logger.interface";
import { magentaBright } from "cli-color";
import { RequestGuard } from "./guards/request.guard";

export class App {
	app: Express;
	host = process.env.HOST || "0.0.0.0";
	port = Number(process.env.PORT) || 3000;
	middlewares: IMiddleware[] = [new RequestGuard()];
	private textArray: string[] = [];
	constructor(private readonly logger: ILogger) {
		this.app = express();
	}

	public addString(text: string): void {
		this.textArray.push(text);
		this.logger.info(`Got message ${magentaBright(text)} to print`);
	}

	private useMiddlewares(): void {
		for (const middleware of this.middlewares) {
			this.app.use(middleware.exec.bind(middleware));
		}
	}

	public async init(): Promise<void> {
		this.useMiddlewares();

		this.app.get("/getstring", (req: Request, res: Response, next: NextFunction) => {
			if (this.textArray.length > 0) {
				res.send(this.textArray.shift());
			} else {
				res.send("");
			}
			
		});

		this.app.listen(this.port, this.host, () => {
			this.logger.info(`Server started on ${this.host}:${this.port}`);
		});
	}
}