import { LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { CLIENT_ID, TENANT_ID } from "./env";

export const queryClient = new QueryClient();

export const authRequest = {
  scopes: [`api://${CLIENT_ID}/user_impersonation`, "User.Read", "Mail.Send"],
};

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
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
  const account = msalInstance.getAllAccounts()[0];
  if (account !== undefined) {
    // Set CSRF token in custom header if the request method is not safe.
    if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(config.method!.toUpperCase())) {
      config.headers.set("x-csrftoken", Cookies.get("csrftoken"));
    }

    // Set Azure access token in Authorization header.
    const { accessToken: apiToken } = await msalInstance.acquireTokenSilent({
      ...authRequest,
      account,
    });
    config.headers.set("Authorization", `Bearer ${apiToken}`);

    // We also provide the Microsoft Graph API token to the backend server
    // so that it can access the user profile and send emails with that token.
    // See the following discussion for the motivation:
    // https://www.reddit.com/r/webdev/comments/v62e78/authenticate_in_the_frontend_and_send_a_token_to/
    // Access token for Microsoft Graph API must be obtained per resource
    // i.e. We cannot acquire a single token instead of the two acquireTokenSilent() calls
    const { accessToken: graphToken } = await msalInstance.acquireTokenSilent({
      scopes: ["User.Read", "Mail.Send"],
      account,
    });
    config.headers.set("X-Graph-Token", graphToken);
  }
  return config;
});

axios.interceptors.response.use(undefined, (error) => {
  // CSRF token in cookie can be expired if CSRF secret changes in the backend.
  if (error.response.status === 403 && error.response.data === "CSRF token verification failed") {
    Cookies.remove("csrftoken");
    window.location.reload();
  }
  return Promise.reject(error);
});
