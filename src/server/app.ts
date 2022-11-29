import express, { Express, NextFunction, Request, Response } from "express";
import { IMiddleware } from "../common/middleware.interface";
import { ILogger } from "../logger/logger.interface";
import { blackBright, blueBright, greenBright, magentaBright, red } from "cli-color";
import { RequestGuard } from "./guards/request.guard";
import { DatabaseService } from "../database/database.service";

export class App {
	app: Express;
	host = process.env.HOST || "0.0.0.0";
	port = Number(process.env.PORT) || 3000;
	middlewares: IMiddleware[] = [new RequestGuard()];
	private textArray: string[] = [];
	constructor(private readonly logger: ILogger, private readonly database: DatabaseService) {
		this.app = express();
	}

	public addString(text: string): void {
		this.textArray.push(text);
		this.logger.info(`${blackBright("[Server]")} Got message ${magentaBright(text)} to print`);
	}

	private useMiddlewares(): void {
		for (const middleware of this.middlewares) {
			this.app.use(middleware.exec.bind(middleware));
		}
	}

	public async init(): Promise<void> {
		this.useMiddlewares();

		this.app.get("/getstring", async (req: Request, res: Response, next: NextFunction) => {
			if (this.textArray.length > 0) {
				const msg = this.textArray.shift()!.replaceAll("ї", "ж").replaceAll("ґ", "ж").replaceAll("є", "ж");
				res.send(msg);
			} else {
				res.send("");
			}
		});

		this.app.get("/messages", async (req: Request, res: Response, next: NextFunction) => {
			try {
				const data = await this.database.getMessages();
				res.send(data);
				this.logger.info(blackBright("[Server]"), "Sent all messages");
			} catch (e) {
				res.status(404).send(e);
			}
			
		});

		this.app.listen(this.port, this.host, () => {
			this.logger.info(blackBright("[Server]"), `Server started on ${blueBright(`http://${this.host}:${this.port}`)}`);
		});
	}
}
