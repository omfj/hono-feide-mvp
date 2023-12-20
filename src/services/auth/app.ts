import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { lucia } from "../../auth/lucia";
import { lth, setEmptyCookie } from "../../auth/utils";
import { generateState, OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { db } from "../../db/drizzle";
import { accounts, users } from "../../db/schemas";
import { feideAuth, getFeideUser } from "../../auth/providers/feide";

const app = new Hono();

app.get("/logout", async (c) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) return c.text("Not logged in", { status: 401 });

  await lucia.invalidateSession(sessionId);

  setEmptyCookie(c, lucia.sessionCookieName);

  return c.redirect("/", 302);
});

app.get("/feide", async (c) => {
  const state = generateState();
  const url = await feideAuth.createAuthorizationURL(state, {
    scopes: ["email", "openid", "profile"],
  });

  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return c.redirect(url.toString(), 302);
});

app.get("/feide/callback", async (c) => {
  const stateCookie = getCookie(c, "oauth_state");

  const url = new URL(c.req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!state || !stateCookie || !code || stateCookie !== state) {
    return c.text("Invalid state", { status: 400 });
  }

  try {
    const tokens = await feideAuth.validateAuthorizationCode(code);

    const providerUser = await getFeideUser(tokens.accessToken);

    const existingUser = await db
      .select()
      .from(users)
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .where(
        and(
          eq(accounts.provider, "feide"),
          eq(accounts.providerAccountId, providerUser.id)
        )
      )
      .then((res) => res[0] ?? null);

    if (existingUser) {
      const session = await lucia.createSession(existingUser.user.id, {});
      const { name, value, attributes } = lucia.createSessionCookie(session.id);

      setCookie(c, name, value, lth(attributes));
      return c.redirect("/", 302);
    }

    const userId = generateId(15);

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name: providerUser.name,
        email: providerUser.email,
      });

      await tx.insert(accounts).values({
        provider: "feide",
        providerAccountId: providerUser.id,
        userId,
        accessToken: tokens.accessToken,
        refreshToken: null,
        expiresAt: Math.floor(tokens.expiresAt),
        scope: tokens.scope,
        tokenType: tokens.tokenType,
        idToken: tokens.idToken,
      });
    });

    const session = await lucia.createSession(userId, {});
    const { name, attributes, value } = lucia.createSessionCookie(session.id);

    setCookie(c, name, value, lth(attributes));

    return c.redirect("/", 302);
  } catch (e) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      return c.text("Invalid code", { status: 400 });
    }
    return c.text("Internal server error", { status: 500 });
  }
});

export default app;
