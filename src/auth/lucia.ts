import { Lucia, Session } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../db/drizzle";
import { User, sessions, users } from "../db/schemas";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
  interface DatabaseUserAttributes extends Omit<User, "id"> {}
  interface DatabaseSessionAttributes extends Partial<Session> {}
}

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getUserAttributes: (user) => ({
    ...user,
  }),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});
