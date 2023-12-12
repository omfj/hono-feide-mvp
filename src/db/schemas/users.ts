import { pgTable, text, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions } from ".";

export const users = pgTable(
  "user",
  {
    id: text("id").notNull(),
    name: text("name"),
    email: text("email"),
    provider: text("provider"),
    providerId: text("provider_id"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id] }),
    uniqueEmailIdx: uniqueIndex("unique_email_idx").on(t.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export type User = (typeof users)["$inferSelect"];
export type UserInsert = (typeof users)["$inferInsert"];
