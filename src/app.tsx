import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import authService from "./services/auth/app";
import userService from "./services/user/app";
import { NotFound } from "./views/NotFound";
import { Error } from "./views/Error";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.route("/auth", authService);
app.route("/user", userService);

app.notFound((c) => {
  return c.html(<NotFound />, 404);
});

app.onError((err, c) => {
  return c.html(<Error code={500} error={err.message} />, 500);
});

export default app;
