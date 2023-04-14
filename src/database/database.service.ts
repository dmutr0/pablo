import { magentaBright, redBright } from "cli-color";
import { Client } from "pg";
import { IMessage } from "../common/message.interface";
import { ILogger } from "../logger/logger.interface";
import { IUser } from "../mail/user.interface";
import { config } from "./config";
import { inject, injectable } from "inversify";
import { createCtx } from "../createCtx";
import { TYPES } from "../types";

@injectable()
export class DatabaseService {
	client: Client;
	ctx = createCtx("Database");

	constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
		this.client = new Client(config);
		this.client
			.connect()
			.then(() => this.logger.info(this.ctx, "Connected to db"))
			.catch((e) => this.logger.error(e));
	}

	public async addMessage(msg: IMessage) {
		await this.client.query("INSERT INTO messages (email, message) VALUES ($1, $2)", [msg.email, msg.message]);
		this.logger.info(this.ctx, `Created message ${magentaBright(msg.message)} from user ${redBright(msg.email)}`);
	}

	public async getMessages() {
		const res = await this.client.query("SELECT * from messages");
		this.logger.info(this.ctx, "Got all messages from database");
		return res.rows;
	}
    
	public async createUser(user: IUser): Promise<void> {
		await this.client.query("INSERT INTO Users (email, pass, ids) VALUES($1, $2, $3)", [user.email, user.pass, user.ids]);
		this.logger.info(this.ctx, "Created new user ", redBright(user.email));
	}

	public async deleteUser(id: string): Promise<void> {
		await this.client.query("DELETE FROM Users WHERE email = $1", [id]);
	}

	public async getUserByMail(mail: string): Promise<IUser | void> {
		const res = await this.client.query("SELECT * FROM Users WHERE email=$1", [mail]);

		if (res.rows.length < 0) {
			return;
		}
        
		return res.rows[0];
	}

	public async getUserById(id: number): Promise<IUser | void> {
		const res = await this.client.query("SELECT * FROM Users WHERE $1=ANY(ids)", [id]);

		if (res.rows.length < 0) {
			return;
		}
        
		return res.rows[0];
	}

	public async updateUser(ids: number[], email: string): Promise<void> {
		// await this.client.query("DELETE FROM Users WHERE email = $1", [newUser.email]);
		await this.client.query("UPDATE Users SET ids = $1 WHERE email = $2", [ids, email]);
		// await this.createUser(newUser);
	}
}