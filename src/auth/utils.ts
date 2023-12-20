import type { CookieAttributes } from "oslo/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { lucia } from "./lucia";

/**
 *
 * @param cookieAttribues lucia session cookie attributes
 * @returns the same cookie attributes but matching the hono types
 */
export const lth = (cookieAttribues: CookieAttributes): CookieOptions => {
  return {
    ...cookieAttribues,
    sameSite:
      cookieAttribues.sameSite === "lax"
        ? "Lax"
        : cookieAttribues.sameSite === "strict"
        ? "Strict"
        : "None",
  };
};

/**
 *
 * @param c hono context
 * @param name name of the cookie
 */
export const setEmptyCookie = (c: Context, name: string) => {
  setCookie(c, name, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const getUser = async (c: Context) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) {
    return null;
  }

  const { user } = await lucia.validateSession(sessionId);

  return user;
};
