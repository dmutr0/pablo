import { ClientConfig } from "pg";

export const config: ClientConfig = {
    host: "localhost",
    port: 5432,
    user: "your_username",
    password: "your_pass",
    database: "your_db"
}