import { Request } from "express";


export interface CustomRequest extends Request {
    headers: {
        passwrot?: string
    }
}