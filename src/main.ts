import { config } from "dotenv";
import { LoggerService } from "./logger/logger.service";
import { Bot } from "./bot";
import { PrismaService } from "./database/prisma.service";

config();

async function bootstrap() {
    const logger = new LoggerService();
    const prisma = new PrismaService(logger);
    const bot = new Bot(logger, prisma);

    bot.init();
}

bootstrap();