import { config } from "dotenv";
import { LoggerService } from "./logger/logger.service";
import { Bot } from "./bot";

config();

async function bootstrap() {
    const logger = new LoggerService();
    const bot = new Bot(logger);

    bot.init();
}

bootstrap();