import { inject, injectable } from "inversify";
import { createTransport, Transporter } from "nodemailer";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";
import { createCtx } from "../createCtx";

@injectable()
export class MailService {
	private readonly transporter: Transporter;
	private readonly ctx = createCtx("Mail");

	constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
		this.transporter = createTransport({
			host: "smtp.gmail.com",
			auth: {
				user: "testbotaaa123@gmail.com",
				pass: "pazmyukepzlvribx"
			},
			secure: true
		});

		this.logger.info(this.ctx, "Connected to mail");
	}

	private validateEmail(mail: string): boolean {
		return mail.endsWith("@physmathschool12cn.ukr.education");
	}

	private genCode(): number {
		return Math.floor(Math.random() * (995745 - 116341)) + 116341;
	}

	public async sendCode(mail: string): Promise<number> {
		try {
			if (!this.validateEmail(mail)) return 0;
			const code = this.genCode();
			await this.transporter.sendMail({
				from: "testbotabc1234@gmail.com",
				to: mail,
				subject: "Verification",
				text: code.toString()
			});

			return code;
		} catch(e) {
			return 0;
		}
	}
}