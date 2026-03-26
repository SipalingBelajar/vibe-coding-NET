import { sqlserverTable, serial, varchar, datetime } from "drizzle-orm/sqlserver-core";

export const users = sqlserverTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }), // ADMIN / EMPLOYEE
});

export const attendances = sqlserverTable("attendances", {
  id: serial("id").primaryKey(),
  userId: serial("user_id"),
  clockIn: datetime("clock_in"),
  status: varchar("status", { length: 50 }),
});

export const submissions = sqlserverTable("submissions", {
  id: serial("id").primaryKey(),
  reason: varchar("reason", { length: 1000 }),
  valid: varchar("valid", { length: 10 }), // "true" / "false"
  createdAt: datetime("created_at"),
});
