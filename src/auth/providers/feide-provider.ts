import { OAuth2Client } from "oslo/oauth2";
import { OAuth2Provider } from "arctic";

const authorizeEndpoint = "https://auth.dataporten.no/oauth/authorization";
const tokenEndpoint = "https://auth.dataporten.no/oauth/token";

export class Feide implements OAuth2Provider {
  private client: OAuth2Client;
  private clientSecret: string;

  constructor(
    clientId: string,
    clientSecret: string,
    options?: {
      redirectURI?: string;
    }
  ) {
    this.client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
      redirectURI: options?.redirectURI,
    });
    this.clientSecret = clientSecret;
  }

  public async createAuthorizationURL(
    state: string,
    options?: {
      scopes?: string[];
    }
  ): Promise<URL> {
    const url = await this.client.createAuthorizationURL({
      scopes: options?.scopes ?? [],
    });
    url.searchParams.set("state", state);
    return url;
  }

  public async validateAuthorizationCode(code: string): Promise<FeideTokens> {
    const result = await this.client.validateAuthorizationCode(code, {
      authenticateWith: "request_body",
      credentials: this.clientSecret,
    });
    const tokens: FeideTokens = {
      accessToken: result.access_token,
    };
    return tokens;
  }
}

export interface FeideTokens {
  accessToken: string;
}
