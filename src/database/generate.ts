import { Client } from "pg";
import { config } from "./config";

const client = new Client(config);

client.connect()
    .then(async () => {
        await client.query("CREATE TABLE Messages (id SERIAL PRIMARY KEY, username text NOT NULL, message varchar(200) NOT NULL)");
        await client.end();
    });