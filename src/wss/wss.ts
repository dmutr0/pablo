import { inject, injectable } from "inversify";
import { WebSocket, WebSocketServer } from "ws";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";
import { IWSS } from "./wss.interface";
import { createCtx } from "../createCtx";

@injectable()
export class WSS implements IWSS {
	private readonly wss: WebSocketServer;
	private readonly ctx = createCtx(WSS.name);

	constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
		this.wss = new WebSocket.Server({ port: 8000 });
		this.logger.info(this.ctx, "WSS has been created");
	}

	public init(): void {
		this.wss.on("connection", (ws) => {
			ws.send("hello!");
		});
	}
}