import { Hono } from "hono";
import { getUser } from "../../auth/utils";
import { db } from "../../db/drizzle";
import { users } from "../../db/schemas";

const app = new Hono();

app.get("/me", async (c) => {
  const user = await getUser(c);

  if (!user) {
    return c.text("Not logged in", { status: 401 });
  }

  return c.json(user);
});

export default app;
