import { Client } from "pg";
import { config } from "./config";

const client = new Client(config);

client.connect()
	.then(async () => {
		await client.query("CREATE TABLE Messages (id SERIAL PRIMARY KEY, date TIMESTAMP NOT NULL DEFAULT current_timestamp, email text NOT NULL, message varchar(200) NOT NULL)");
		await client.query("CREATE TABLE Users (email text PRIMARY KEY, pass text NOT NULL, ids integer[])");
		await client.end();
	});