import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { DatabaseService } from "../database/database.service";
import { ILogger } from "../logger/logger.interface";
import { IUser } from "../mail/user.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class AuthService {
	constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Database) private readonly database: DatabaseService
	) {}

	public async getUserInfo(
		msg: string
	): Promise<{ mail: string; pass: string } | void> {
		const args = msg.split(" ");
		if (args.length < 2) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return { mail: args.shift()!, pass: args.shift()! };
	}

	public async checkUser(
		ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >,
		mail: string
	): Promise<boolean> {
		if (await this.database.getUserById(ctx.from.id)) {
			await ctx.reply("Ви вже увішли в акаунт");
			return true;
		}

		if (await this.database.getUserByMail(mail)) {
			await ctx.reply("Акаунт з такою поштою вже існує");
			return true;
		}

		return false;
	}

	public async validateUser(
		ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >,
		user: IUser | void,
		pass: string
	): Promise<boolean> {
		if (!user) {
			ctx.reply("Ви ще не ввійшли або не створили акаунт");
			return true;
		}

		if (user.pass != pass) {
			ctx.reply("Неправильний пароль");
			return true;
		}

		return false;
	}
}
