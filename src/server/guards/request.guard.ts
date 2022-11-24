import { Response, NextFunction } from "express";
import { CustomRequest } from "../../common/customRequest.interface";
import { IMiddleware } from "../../common/middleware.interface";

export class RequestGuard implements IMiddleware {
	private readonly password = process.env.PASSWORD ?? "mama";
	exec(req: CustomRequest, res: Response, next: NextFunction): void {
		if (req.headers.passwrot == this.password) {
			return next();
		}
		
		res.status(418).send("No");
	}
}
