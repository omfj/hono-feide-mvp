import { pgTable, text, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts, sessions } from ".";

export const users = pgTable(
  "user",
  {
    id: text("id").notNull(),
    name: text("name"),
    email: text("email"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id] }),
    uniqueEmailIdx: uniqueIndex("unique_email_idx").on(t.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export type User = (typeof users)["$inferSelect"];
export type UserInsert = (typeof users)["$inferInsert"];
