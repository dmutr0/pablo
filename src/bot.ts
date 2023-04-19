import { Context as Ctx, NarrowedContext, Telegraf } from "telegraf";
import { ILogger } from "./logger/logger.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { createCtx } from "./createCtx";
import { IWSS } from "./wss/wss.interface";
import { greenBright } from "cli-color";
import { UserState } from "./common/userState.enum";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { DatabaseService } from "./database/database.service";
import { AuthService } from "./auth/auth.service";
import { MailService } from "./mail/mail.service";
import { Queue } from "./queue/queue.service";

type Context = NarrowedContext<
  Ctx<Update>,
  {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }
>;

@injectable()
export class Bot {
	private readonly bot: Telegraf;
	private readonly ctx = createCtx(Bot.name);
	private users: { state: UserState; payload: null | { mail: string, code: number, pass: string }; id: number }[] = [];
	private readonly charsLimit: number = Number(process.env.LIMIT) || 100;
	private readonly regex: RegExp =
		// eslint-disable-next-line max-len
		/(?<=^|[^а-я])(([уyu]|[нзnz3][аa]|(хитро|не)?[вvwb][зz3]?[ыьъi]|[сsc][ьъ']|(и|[рpr][аa4])[зсzs]ъ?|([оo0][тбtb6]|[пp][оo0][дd9])[ьъ']?|(.\B)+?[оаеиeo])?-?([еёe][бb6](?!о[рй])|и[пб][ае][тц]).*?|([нn][иеаaie]|([дпdp]|[вv][еe3][рpr][тt])[оo0]|[рpr][аa][зсzc3]|[з3z]?[аa]|с(ме)?|[оo0]([тt]|дно)?|апч)?-?[хxh][уuy]([яйиеёюuie]|ли(?!ган)).*?|([вvw][зы3z]|(три|два|четыре)жды|(н|[сc][уuy][кk])[аa])?-?[бb6][лl]([яy](?!(х|ш[кн]|мб)[ауеыио]).*?|[еэe][дтdt][ь']?)|([рp][аa][сзc3z]|[знzn][аa]|[соsc]|[вv][ыi]?|[пp]([еe][рpr][еe]|[рrp][оиioеe]|[оo0][дd])|и[зс]ъ?|[аоao][тt])?[пpn][иеёieu][зz3][дd9].*?|([зz3][аa])?[пp][иеieu][дd][аоеaoe]?[рrp](ну.*?|[оаoa][мm]|([аa][сcs])?([иiu]([лl][иiu])?[нщктлtlsn]ь?)?|([оo](ч[еиei])?|[аa][сcs])?[кk]([оo]й)?|[юu][гg])[ауеыauyei]?|[мm][аa][нnh][дd]([ауеыayueiи]([лl]([иi][сзc3щ])?[ауеыauyei])?|[оo][йi]|[аоao][вvwb][оo](ш|sh)[ь']?([e]?[кk][ауеayue])?|юк(ов|[ауи])?)|[мm][уuy][дd6]([яyаиоaiuo0].*?|[еe]?[нhn]([ьюия'uiya]|ей))|мля([тд]ь)?|лять|([нз]а|по)х|м[ао]л[ао]фь([яию]|[её]й))(?=($|[^а-я]))/;

	constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.WSS) private readonly wss: IWSS,
	@inject(TYPES.Auth) private readonly auth: AuthService,
	@inject(TYPES.Mail) private readonly mail: MailService,
    @inject(TYPES.Database) private readonly database: DatabaseService,
	@inject(TYPES.Queue) private readonly queue: Queue,
	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.bot = new Telegraf(process.env.TOKEN!);
		this.logger.info(this.ctx, "Bot has been created");
	}

	private async onStart(ctx: Context) {
		ctx.reply("Hello!");
	}

	private async onHelp(ctx: Context) {
		ctx.reply("Help");
	}

	private async onPrint(ctx: Context) {
		this.removeFromStateExcept(ctx.from.id, UserState.Print);

		const user = await this.database.getUserById(ctx.from.id);
		if (!user) {
			ctx.reply("Ви маєте ввійти або зареєструватися");
			return;
		}

		const onlyCommand = this.isOnlyCommand(ctx.message.text);
		const containsInState = this.containsInState(ctx.from.id, UserState.Print);

		if (onlyCommand && !containsInState) {
			this.users.push({
				state: UserState.Print,
				id: ctx.from.id,
				payload: null,
			});
			ctx.reply("Напишіть щось і відправте мені");
			return;
		}

		this.removeFromState(ctx.from.id);

		const message =
		containsInState && onlyCommand
			? ctx.message.text
			: this.removeCommand(ctx.message.text);

		if (!this.validateMessage(message)) {
			ctx.reply(":(");
			this.removeFromState(ctx.from.id);
			return;
		}

		if (message.length > this.charsLimit) {
			ctx.reply(
				`Довжина тексту не може перевищувати ${this.charsLimit} символів`
			);
			this.removeFromState(ctx.from.id);
			return;
		}

		this.database.addMessage({ message, email: user.email });
		this.queue.add(message);
		ctx.reply("Ваше повідомлення було додано в чергу: " + message);
	}

	private async onRegister(ctx: Context) {
		this.removeFromStateExcept(ctx.from.id, UserState.Register);

		if (await this.database.getUserById(ctx.from.id)) {
			ctx.reply("Ви вже ввійшли в акаунт");
			return;
		}

		const onlyCommand = this.isOnlyCommand(ctx.message.text);
		const containsInState = this.containsInState(ctx.from.id, UserState.Register);

		if (onlyCommand && !containsInState) {
			this.users.push({ state: UserState.Register, id: ctx.from.id, payload: null });
			ctx.reply("Пошта і пароль");
			return;
		}

		const data = containsInState ? ctx.message.text : this.removeCommand(ctx.message.text);

		const userInfo = await this.auth.getUserInfo(data);

		if (!userInfo) {
			this.removeFromState(ctx.from.id);
			ctx.reply("Щось пішло не так...");
			return;
		}

		const { mail, pass } = userInfo;

		if (await this.auth.checkUser(ctx, mail)) return this.removeFromState(ctx.from.id);

		const code = await this.mail.sendCode(mail);
		
		if (code == 0) {
			this.removeFromState(ctx.from.id);
			ctx.reply("Пошта має бути шкільною");
			return;
		}

		ctx.reply("Підтвердіть свою пошту");

		this.removeFromState(ctx.from.id);
		this.users.push({ state: UserState.Verify, id: ctx.from.id, payload: { mail, pass, code } });
	}

	private async onLogin(ctx: Context) {
		this.removeFromState(ctx.from.id);

		if (await this.database.getUserById(ctx.from.id)) {
			ctx.reply("Ви вже ввійшли в акаунт");
			return;
		}

		const onlyCommand = this.isOnlyCommand(ctx.message.text);
		const containsInState = this.containsInState(ctx.from.id, UserState.Register);

		if (onlyCommand && !containsInState) {
			this.users.push({ state: UserState.Register, id: ctx.from.id, payload: null });
			ctx.reply("Пошта і пароль");
			return;
		}

		const data = this.removeCommand(ctx.message.text);

		const userInfo = await this.auth.getUserInfo(data);

		if (!userInfo) {
			this.removeFromState(ctx.from.id);
			ctx.reply("Щось пішло не так...");
			return;
		}

		const { mail, pass } = userInfo;

		const user = await this.database.getUserByMail(mail);

		if (await this.auth.validateUser(ctx, user, pass)) return this.removeFromState(ctx.from.id);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.database.updateUser([...user!.ids, ctx.from.id], user!.email);
		ctx.reply("Успішно авторизовано");
		this.removeFromState(ctx.from.id);
	}

	private async onVerify(ctx: Context, data: { mail: string, code: number, pass: string }) {
		this.removeFromState(ctx.from.id);
		if (data.code == Number(ctx.message.text)) {
			this.database.createUser({ email: data.mail, pass: data.pass, ids: [ctx.from.id] });
			return ctx.reply("Акаунт створено");
		}

		return ctx.reply("Неправильний код");
	}

	private async onLeave(ctx: Context) {
		const user = await this.database.getUserById(ctx.from.id);
		if (!user) {
			await ctx.reply("Ви не авторизовані");
			return;
		}

		await this.database.updateUser([...user.ids.filter(id => id != ctx.from.id)], user.email);
		ctx.reply("Ви вийшли з акаунту");
	}

	private removeFromStateExcept(id: number, state: UserState) {
		this.users = this.users.filter(
			(user) => user.id != id || user.state == state
		);
	}

	private removeFromState(id: number) {
		this.users = this.users.filter((user) => user.id != id);
	}

	private containsInState(id: number, state: UserState): boolean {
		const user = this.users.filter((user) => {
			if (user.id == id && user.state == state) return true;
		});
		this.logger.debug(user.length);
		return user.length > 0 ? true : false;
	}

	private isOnlyCommand(message: string): boolean {
		const str = message.split(" ");
		str.shift();

		return str.length == 0;
	}

	private removeCommand(message: string): string {
		return message.split(" ").slice(1).join(" ");
	}

	private validateMessage(message: string): boolean {
		return !message.toLocaleLowerCase().match(this.regex);
	}

	public async run() {
		this.wss.init();
		this.bot.start(this.onStart.bind(this));
		this.bot.help(this.onHelp.bind(this));
		this.bot.command("print", this.onPrint.bind(this));
		this.bot.command("register", this.onRegister.bind(this));
		this.bot.command("leave", this.onLeave.bind(this));
		this.bot.hears(/.*/, async (ctx) => {
			const user = this.users.filter(user => user.id == ctx.from.id);

			if (!user) return;

			switch (user[0]?.state) {
			case UserState.Print:
				return this.onPrint(ctx);
			case UserState.Register:
				return this.onRegister(ctx);
			case UserState.Verify:
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return this.onVerify(ctx, user[0].payload!);
			case UserState.Login:
				return this.onLogin(ctx);
			}
		});
		this.bot.launch();
		this.logger.info(this.ctx, greenBright("Bot has been started"));
	}
}
