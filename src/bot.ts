import {  blackBright, greenBright } from "cli-color";
import { Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { IMessage } from "./common/message.interface";
import { DatabaseService } from "./database/database.service";
import { ILogger } from "./logger/logger.interface";
import { App } from "./server/app";

export class Bot {
	private readonly bot: Telegraf;
	private readonly app: App;
	private readonly logger: ILogger;
	private readonly database: DatabaseService;
	private charsLimit: number = Number(process.env.LIMIT) || 100;
	private isEmptyPrint: boolean = false;
	constructor(logger: ILogger, database: DatabaseService) {
		this.bot = new Telegraf(process.env.TOKEN!);
		this.app = new App(logger, database);
		this.logger = logger;
		this.database = database;
	}

	private addMessage(msg: Update.New & Update.NonChannel & Message.TextMessage) {
		const message: IMessage = {
			username: msg.from.first_name,
			message: msg.text,
		}

		this.database.addMessage(message);
	} 

	public async init() {
		this.bot.help((ctx) => {
			this.logger.info(blackBright("[Bot]"), "They asked help aafsdafgr");
			ctx.reply("papa");
		});

		this.bot.command("print", (ctx) => {
			const str = ctx.message.text.split(" ").slice(1).join(" ");
			if (str.length > this.charsLimit) {
				this.logger.error(blackBright("[Bot]"), "Failed to send string");
				return ctx.reply(`String length must be less than ${this.charsLimit} symbols`);
			}

			if (str.length < 1) {
				this.isEmptyPrint = true;
				return ctx.reply("Send me a string or commad second time with your input");
			}
			this.addMessage({...ctx.message, text: str});
			this.app.addString(str);
		});

		this.bot.hears(/.*/, (ctx) => {
			if (this.isEmptyPrint) {
				const str = ctx.message.text;
				this.isEmptyPrint = false;
				if (str.length > this.charsLimit) {
					this.logger.warn(blackBright("[Bot]"), "Failed to send string");
					return ctx.reply(`String length must be less than ${this.charsLimit} symbols`);
				}
				this.addMessage(ctx.message);
				return this.app.addString(str);
			}
			this.logger.debug(new Date());
			
			
		});

	this.app.init();
	this.bot.launch();
	
	this.logger.info(blackBright("[Bot]"), "Bot started");
	}
}
