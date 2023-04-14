import "dotenv/config";
import "reflect-metadata";
import { container } from "./inversify.config";
import { Bot } from "./bot";
import { TYPES } from "./types";

async function bootstrap() {
	const bot = container.get<Bot>(TYPES.Bot);

	await bot.run();
}

bootstrap();