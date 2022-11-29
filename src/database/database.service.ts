import { blackBright, magentaBright, redBright } from "cli-color";
import { Client } from "pg";
import { IMessage } from "../common/message.interface";
import { ILogger } from "../logger/logger.interface";
import { config } from "./config";

export class DatabaseService {
    client: Client;

    constructor(private readonly logger: ILogger) {
        this.client = new Client(config);
        this.client
            .connect()
            .then(() => this.logger.info(blackBright("[Database]"), "Connected to db"))
            .catch((e) => this.logger.error(e));
    }

    async addMessage(msg: IMessage) {
        await this.client.query("INSERT INTO messages (username, message) VALUES ($1, $2)", [msg.username, msg.message]);
        this.logger.info(blackBright("[Database]"), `Created message ${magentaBright(msg.message)} from user ${redBright(msg.username)}`);
    }

    async getMessages() {
        const res = await this.client.query("SELECT * from messages");
        this.logger.info(blackBright("[Database]"), "Got all messages from database");
        return res.rows;
    }
}