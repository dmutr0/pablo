import { inject, injectable } from "inversify";
import { WebSocket, WebSocketServer } from "ws";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";
import { IWSS } from "./wss.interface";
import { createCtx } from "../createCtx";
import { Queue } from "../queue/queue.service";

@injectable()
export class WSS implements IWSS {
	private readonly wss: WebSocketServer;
	private readonly ctx = createCtx(WSS.name);
	private connected: WebSocket | null = null;

	constructor(@inject(TYPES.Logger) private readonly logger: ILogger, @inject(TYPES.Queue) private readonly queue: Queue) {
		this.wss = new WebSocket.Server({ port: Number(process.env.PORT) || 8000 });
		this.logger.info(this.ctx, "WSS has been created");
	}

	public init(): void {
		this.wss.on("connection", ws => {
			if (this.connected) return ws.close();
			this.connected = ws;
			ws.on("message", () => {
				this.send(this.queue.next());
			});

			ws.on("close", () => {
				this.connected = null;
			});
		});
	}

	protected send(msg: string) {
		this.connected?.send(msg);
	}
}