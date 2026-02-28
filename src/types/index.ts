export interface IUser {
  id: string;
  displayName: string;
  mail: string;
  mobilePhone?: string;
  jobTitle?: string;
  officeLocation?: string;
}

export interface ITeam {
  id: string;
  displayName: string;
  description?: string;
  visibility: 'private' | 'public';
  memberCount?: number;
}

export interface IChannel {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime?: string;
}

export interface IChatMessage {
  id: string;
  from: string;
  content: string;
  createdDateTime: string;
}

export interface IMSALConfig {
  auth: {
    clientId: string;
    authority?: string;
    redirectUri?: string;
  };
  cache?: {
    cacheLocation: string;
  };
}
