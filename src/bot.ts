import {  blackBright, greenBright } from "cli-color";
import { Context, NarrowedContext, Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { IMessage } from "./common/message.interface";
import { PrismaService } from "./database/prisma.service";
import { ILogger } from "./logger/logger.interface";
import { App } from "./server/app";

export class Bot {
	private readonly bot: Telegraf;
	private readonly app: App;
	private readonly logger: ILogger;
	private readonly prisma: PrismaService;
	private charsLimit: number = Number(process.env.LIMIT) || 100;
	private isEmptyPrint: boolean = false;
	constructor(logger: ILogger, prisma: PrismaService) {
		this.bot = new Telegraf(process.env.TOKEN!);
		this.app = new App(logger, prisma);
		this.logger = logger;
		this.prisma = prisma;
	}

	private addMessage(ctx: any) {
		const message: IMessage = {
			username: ctx.message.from.first_name,
			contacts: ctx.message.from.id.toString(),
			message: ctx.message.text,
		}
		this.prisma.addMessage(message);
	} 

	public async init() {
		this.bot.help((ctx) => {
			this.logger.info("They asked help aafsdafgr");
			ctx.reply("papa");
		});

		this.bot.command("print", (ctx) => {
			this.addMessage(ctx);
			const str = ctx.message.text.split(" ").slice(1).join(" ");
			if (str.length > this.charsLimit) {
				this.logger.warn(`${blackBright("[Bot]")}`, "Failed to send string");
				return ctx.reply(`String length must be less than ${this.charsLimit} symbols`);
			}

			if (str.length < 1) {
				this.isEmptyPrint = true;
				return ctx.reply("Send me a string or commad second time with your input");
			}
			this.app.addString(str);
		});

		this.bot.hears(/.*/, (ctx) => {
			this.addMessage(ctx);
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
