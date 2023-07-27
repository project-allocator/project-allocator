import { LogLevel, PublicClientApplication } from "@azure/msal-browser";
import axios, { AxiosError } from "axios";

export const authRequest = {
  scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/user_impersonation`]
};

export const tokenRequest = {
  scopes: ['User.Read']
}

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
    redirectUri: '/',
    postLogoutRedirectUri: '/signin',
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
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
      }
    }
  }
});

// Configure interceptor for axios instance used by the auto-generated client.
// This automatically sets the access token in the request header if the user is logged in.
// You can avoid using this interceptor by creating a new axios instance.
axios.interceptors.request.use(async (config) => {
  const { accessToken: apiToken } = await msalInstance.acquireTokenSilent({
    ...authRequest,
    account: msalInstance.getActiveAccount()!,
  });
  config.headers.set('Authorization', `Bearer ${apiToken}`);

  // See the following discussion for the motivation behind sending access token for Microsoft Graph API
  // https://www.reddit.com/r/webdev/comments/v62e78/authenticate_in_the_frontend_and_send_a_token_to/
  const { accessToken: graphToken } = await msalInstance.acquireTokenSilent({
    scopes: ["User.Read", "Mail.Send"],
    account: msalInstance.getActiveAccount()!,
  });
  config.headers.set('X-Graph-Token', graphToken);

  return config;
});

// This ignores the error if the user is unauthenticated.
// In React Router v6, loader functions can be called before the pages are rendered,
// which results in unauthenticated users making requests to protected API endpoints.
// Frontend routes should be protected with route components
// https://stackoverflow.com/questions/74267693/prevent-falsy-request-from-react-router-loader-function
axios.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401) {
    return Promise.resolve({ status: 200, data: null });
  }
  return Promise.reject(error);
})