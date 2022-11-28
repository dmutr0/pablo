import express, { Express, NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client"
import { IMiddleware } from "../common/middleware.interface";
import { ILogger } from "../logger/logger.interface";
import { blackBright, magentaBright, red } from "cli-color";
import { RequestGuard } from "./guards/request.guard";
import { PrismaService } from "../database/prisma.service";

export class App {
	app: Express;
	host = process.env.HOST || "0.0.0.0";
	port = Number(process.env.PORT) || 3000;
	middlewares: IMiddleware[] = [new RequestGuard()];
	private textArray: string[] = [];
	constructor(private readonly logger: ILogger, private readonly prisma: PrismaService) {
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
				res.send(this.textArray.shift());
			} else {
				res.send("");
			}
		});

		this.app.get("/messages/:id", async (req: Request, res: Response, next: NextFunction) => {
			const message = await this.prisma.getMessage(Number(req.params.id));
			this.logger.info(`Got message from db ${magentaBright(message?.message)} from ${red(message?.username)}`);
			
			res.send(message);
		})

		this.app.listen(this.port, this.host, () => {
			this.logger.info(`Server started on ${this.host}:${this.port}`);
		});
	}
}
