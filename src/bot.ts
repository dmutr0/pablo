import { magentaBright, greenBright, redBright } from "cli-color";
import { Telegraf } from "telegraf";
import { ILogger } from "./logger/logger.interface";
import { App } from "./server/app";

export class Bot {
	private bot: Telegraf;
	private app: App;
	private readonly logger: ILogger;
	private charsLimit: number = Number(process.env.LIMIT) || 100;
	private isEmptyPrint: boolean = false;
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
			const str = ctx.message.text.split(" ").slice(1).join(" ");
			if (str.length > this.charsLimit) {
				this.logger.warn("Failed to send string");
				return ctx.reply(`String length must be less than ${this.charsLimit} symbols`);
			}

			if (str.length < 1) {
				this.isEmptyPrint = true;
				return ctx.reply("Send me a string or commad second time with your input");
			}
			this.app.addString(str);
		});

		this.bot.hears(/.*/, (ctx) => {
			if (this.isEmptyPrint) {
				const str = ctx.message.text;
				this.isEmptyPrint = false;
				if (str.length > this.charsLimit) {
					this.logger.warn("Failed to send string");
					return ctx.reply(`String length must be less than ${this.charsLimit} symbols`);
				}
				this.app.addString(str);
			}
		});

	this.app.init();
	this.bot.launch();
	
	this.logger.info(greenBright("Bot started"));
	}
}
