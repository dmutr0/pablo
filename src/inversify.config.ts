import { Container } from "inversify";
import { TYPES } from "./types";
import { ILogger } from "./logger/logger.interface";
import { Logger } from "./logger/logger";
import { Bot } from "./bot";
import { IWSS } from "./wss/wss.interface";
import { WSS } from "./wss/wss";
import { DatabaseService } from "./database/database.service";
import { AuthService } from "./auth/auth.service";
import { MailService } from "./mail/mail.service";

const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<IWSS>(TYPES.WSS).to(WSS).inSingletonScope();
container.bind<DatabaseService>(TYPES.Database).to(DatabaseService).inSingletonScope();
container.bind<MailService>(TYPES.Mail).to(MailService).inSingletonScope();
container.bind<AuthService>(TYPES.Auth).to(AuthService).inSingletonScope();
container.bind<ILogger>(TYPES.Logger).to(Logger).inSingletonScope();

export { container };