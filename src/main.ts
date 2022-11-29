import { config } from "dotenv";
import { LoggerService } from "./logger/logger.service";
import { Bot } from "./bot";
import { DatabaseService } from "./database/database.service";

config();

async function bootstrap() {
    const logger = new LoggerService();
    const database = new DatabaseService(logger);
    const bot = new Bot(logger, database);

    bot.init();
}

bootstrap();