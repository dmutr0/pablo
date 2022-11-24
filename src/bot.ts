import { magentaBright, greenBright, redBright } from "cli-color";
import { Telegraf } from "telegraf";
import { ILogger } from "./logger/logger.interface";
import { App } from "./server/app";

export class Bot {
	private bot: Telegraf;
	private app: App;
	private readonly logger: ILogger;
	constructor(logger: ILogger) {
		this.bot = new Telegraf(process.env.TOKEN!);
		this.app = new App(logger);
		this.logger = logger;
	}


	public async init() {

		this.bot.help((ctx) => {
			this.logger.info("They asked help aafsdafgr");
			ctx.reply("papa");
		});

		this.bot.command("print", (ctx) => {
			this.app.addString(ctx.message.text.split(" ").slice(1).join(" "));
		});

		this.bot.hears(/.*/, (ctx) => {
			this.logger.info(`Got message ${magentaBright(ctx.message.text)} from ${redBright(ctx.message.from.first_name)}`);
			ctx.reply("mama...");
		});

	this.app.init();
	this.bot.launch();
	
	this.logger.info(greenBright("Bot started"));
	}
}
