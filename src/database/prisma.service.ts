import { Message, PrismaClient } from "@prisma/client";
import { blackBright, magentaBright, red } from "cli-color";
import { IMessage } from "../common/message.interface";
import { ILogger } from "../logger/logger.interface";

export class PrismaService {
	prisma: PrismaClient;

	constructor(private readonly logger: ILogger) {
		this.prisma = new PrismaClient();
	}

	async addMessage(message: IMessage): Promise<void> {
		const newMessage = await this.prisma.message.create({
			data: {
				username: message.username,
				contacts: message.contacts,
				message: message.message,
			}
		});

		this.logger.info(`${blackBright("[PrismaService]")} Created a message ${magentaBright(newMessage.message)} from ${red(newMessage.username)}`);
	}

	async getMessage(id: number): Promise<Message | null> {
		const message = await this.prisma.message.findFirst({
			where: {
				id,
			}
		});
		return message;
	}
}
