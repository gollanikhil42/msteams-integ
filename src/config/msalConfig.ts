import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL Configuration with Azure App Registration Credentials
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: '0cde0c31-6f02-4a1f-b989-0d19eae2f01d',
    authority: 'https://login.microsoftonline.com/f88459b4-714f-4f53-a96c-5e20d3aee8e2',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        console.log(`[MSAL] ${message}`);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    },
  },
};

/**
 * Scopes required for Microsoft Graph API calls
 */
export const graphScopes = {
  userRead: 'User.Read',
  onlineMeetingsReadWrite: 'OnlineMeetings.ReadWrite',
  channelMessageSend: 'ChannelMessage.Send',
  teamsReadAll: 'Team.ReadBasic.All',
  channelsReadAll: 'Channel.ReadBasic.All',
};

/**
 * Combined scopes array for token requests
 */
export const requestScopes = [
  'https://graph.microsoft.com/' + graphScopes.userRead,
  'https://graph.microsoft.com/' + graphScopes.onlineMeetingsReadWrite,
  'https://graph.microsoft.com/' + graphScopes.channelMessageSend,
  'https://graph.microsoft.com/' + graphScopes.teamsReadAll,
  'https://graph.microsoft.com/' + graphScopes.channelsReadAll,
];

/**
 * Microsoft Graph API Base URL
 */
export const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
