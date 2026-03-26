import { drizzle } from "drizzle-orm/mssql";
import sql from "mssql";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

export const client = await sql.connect(connectionString);
export const db = drizzle(client, { schema });
