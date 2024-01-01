import { LogLevel, PublicClientApplication } from "@azure/msal-browser";
import axios from "axios";

export const authRequest = {
  scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/user_impersonation`, "User.Read", "Mail.Send"],
};

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
    redirectUri: "/",
    postLogoutRedirectUri: "/signin",
  },
  cache: {
    // Store MSAL cache in session.
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    // TODO: Log all messages for debugging purposes.
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
});

// Configure interceptor for axios instance used by the auto-generated client.
// This automatically sets the access token in the request header if the user is logged in.
// You can avoid using this interceptor by creating a new axios instance.
axios.interceptors.request.use(async (config) => {
  if (msalInstance.getActiveAccount()) {
    const { accessToken: apiToken } = await msalInstance.acquireTokenSilent({
      ...authRequest,
      account: msalInstance.getActiveAccount()!,
    });
    config.headers.set("Authorization", `Bearer ${apiToken}`);

    // We also provide the Microsoft Graph API token to the backend server
    // so that it can access the user profile and send emails with that token.
    // See the following discussion for the motivation:
    // https://www.reddit.com/r/webdev/comments/v62e78/authenticate_in_the_frontend_and_send_a_token_to/
    const { accessToken: graphToken } = await msalInstance.acquireTokenSilent({
      scopes: ["User.Read", "Mail.Send"],
      account: msalInstance.getActiveAccount()!,
    });
    // Access token for Microsoft Graph API must be obtained per resource
    // i.e. We cannot acquire a single token instead of the two acquireTokenSilent() calls
    config.headers.set("X-Graph-Token", graphToken);
  }
  return config;
});
