import { Hono } from "hono";
import authService from "./services/auth/app";

export const app = new Hono();

app.route("/auth", authService);
