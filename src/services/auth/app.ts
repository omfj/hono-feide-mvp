import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  FEIDE_PROVIDER_ID,
  feideAuth,
  getFeideUser,
} from "../../auth/providers/feide";
import { OAuth2RequestError, generateState } from "arctic";
import { serializeCookie } from "oslo/cookie";
import { db } from "../../db/drizzle";
import { and, eq } from "drizzle-orm";
import { lucia } from "../../auth/lucia";
import { generateId } from "lucia";
import { users } from "../../db/schemas";

const app = new Hono();

app.get("/me", async (c) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) {
    return c.text("Not logged in", {
      status: 401,
    });
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(c, sessionCookie.name, sessionCookie.value, {
      domain: sessionCookie.attributes.domain,
      httpOnly: sessionCookie.attributes.httpOnly,
      maxAge: sessionCookie.attributes.maxAge,
      path: sessionCookie.attributes.path,
      sameSite:
        sessionCookie.attributes.sameSite === "lax"
          ? "Lax"
          : sessionCookie.attributes.sameSite === "strict"
          ? "Strict"
          : "None",
      expires: sessionCookie.attributes.expires,
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    setCookie(c, sessionCookie.name, sessionCookie.value, {
      domain: sessionCookie.attributes.domain,
      httpOnly: sessionCookie.attributes.httpOnly,
      maxAge: sessionCookie.attributes.maxAge,
      path: sessionCookie.attributes.path,
      sameSite:
        sessionCookie.attributes.sameSite === "lax"
          ? "Lax"
          : sessionCookie.attributes.sameSite === "strict"
          ? "Strict"
          : "None",
      expires: sessionCookie.attributes.expires,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return c.json(user);
});

app.get("/logout", async (c) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) return c.text("Not logged in", { status: 401 });

  await lucia.invalidateSession(sessionId);

  setCookie(c, lucia.sessionCookieName, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  throw c.redirect("/", 302);
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

    const feideUser = await getFeideUser(tokens.accessToken);

    const existingUser = await db.query.users.findFirst({
      where: (user) =>
        and(
          eq(user.providerId, feideUser.user.userid),
          eq(user.provider, FEIDE_PROVIDER_ID)
        ),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const { name, value, attributes } = lucia.createSessionCookie(session.id);

      setCookie(c, name, value, {
        domain: attributes.domain,
        httpOnly: attributes.httpOnly,
        maxAge: attributes.maxAge,
        path: attributes.path,
        sameSite:
          attributes.sameSite === "lax"
            ? "Lax"
            : attributes.sameSite === "strict"
            ? "Strict"
            : "None",
        expires: attributes.expires,
        secure: process.env.NODE_ENV === "production",
      });
      return c.redirect("/", 302);
    }

    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      name: feideUser.user.name,
      email: feideUser.user.email,
      provider: FEIDE_PROVIDER_ID,
      providerId: feideUser.user.userid,
    });

    const session = await lucia.createSession(userId, {});
    const { name, attributes, value } = lucia.createSessionCookie(session.id);

    setCookie(c, name, value, {
      domain: attributes.domain,
      httpOnly: attributes.httpOnly,
      maxAge: attributes.maxAge,
      path: attributes.path,
      sameSite:
        attributes.sameSite === "lax"
          ? "Lax"
          : attributes.sameSite === "strict"
          ? "Strict"
          : "None",
      expires: attributes.expires,
      secure: process.env.NODE_ENV === "production",
    });

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
