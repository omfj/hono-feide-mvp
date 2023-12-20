import { baseURL } from "../../utils";
import { Feide } from "./feide-provider";

type FeideUser = {
  user: {
    userid_sec: [];
    userid: string;
    name: string;
    email: string;
    profilephoto: string;
  };
  audience: string;
};

export const feideAuth = new Feide(
  process.env.FEIDE_CLIENT_ID!,
  process.env.FEIDE_CLIENT_SECRET!,
  {
    redirectURI: `${baseURL}/auth/feide/callback`,
  }
);

export async function getFeideUser(
  accessToken: string
): Promise<{ id: string; email: string; name: string }> {
  const feideUser: FeideUser = await fetch(
    "https://auth.dataporten.no/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((r) => r.json());

  return {
    id: feideUser.user.userid,
    email: feideUser.user.email,
    name: feideUser.user.name,
  };
}
