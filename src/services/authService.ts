import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { IUser } from '../types';
import { msalConfig, requestScopes } from '../config/msalConfig';

/**
 * Authentication Service - Handles MSAL initialization and token management
 * Uses real Azure AD authentication via MSAL
 */
class AuthService {
  private msalInstance: PublicClientApplication | null = null;
  private initialized = false;
  private loginInProgress = false;
  private isAuthenticated = false;
  private accessToken: string | null = null;
  private currentUser: IUser | null = null;
  private account: AccountInfo | null = null;

  /**
   * Initialize MSAL with Azure credentials
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.msalInstance) {
      return;
    }

    try {
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      this.initialized = true;
      console.log('MSAL initialized successfully');

      const redirectResponse = await this.msalInstance.handleRedirectPromise();
      if (redirectResponse && redirectResponse.account) {
        this.account = redirectResponse.account;
        this.accessToken = redirectResponse.accessToken || null;
        this.isAuthenticated = true;
        await this.loadUserProfile();
        return;
      }

      // Check if user is already authenticated (from previous session)
      const account = this.msalInstance.getAllAccounts()[0];
      if (account) {
        this.account = account;
        this.isAuthenticated = true;
        await this.loadUserProfile();
      }
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
    }
  }

  /**
   * Silent login only (no popup)
   */
  async trySilentLogin(): Promise<boolean> {
    if (!this.msalInstance) {
      console.error('MSAL not initialized');
      return false;
    }

    try {
      const account = this.msalInstance.getAllAccounts()[0];
      if (account) {
        this.account = account;
        this.isAuthenticated = true;
        await this.loadUserProfile();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Silent login failed:', error);
      return false;
    }
  }

  /**
   * Interactive login via redirect
   */
  async login(): Promise<boolean> {
    if (!this.msalInstance) {
      console.error('MSAL not initialized');
      return false;
    }

    if (this.loginInProgress) {
      return false;
    }

    if (this.msalInstance.getAllAccounts().length > 0) {
      return this.trySilentLogin();
    }

    this.loginInProgress = true;

    try {
      await this.msalInstance.loginRedirect({
        scopes: requestScopes,
      });

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      this.loginInProgress = false;
    }
  }

  /**
   * Load user profile from current account
   */
  private async loadUserProfile(): Promise<void> {
    if (this.account) {
      try {
        const token = await this.getAccessToken();
        if (!token) return;

        // For now, use basic account info
        // You can enhance this by calling Graph API /me endpoint
        this.currentUser = {
          id: this.account.homeAccountId,
          displayName: this.account.name || 'User',
          mail: this.account.username || '',
          jobTitle: 'Teams User',
          officeLocation: 'Unknown',
        };
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
  }

  /**
   * Acquire access token for Graph API calls
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.msalInstance || !this.account) {
      console.error('MSAL not initialized or no account');
      return null;
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        scopes: requestScopes,
        account: this.account,
      });

      this.accessToken = response.accessToken;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      // Fall back to redirect if silent token acquisition fails
      try {
        await this.msalInstance.acquireTokenRedirect({
          scopes: requestScopes,
          account: this.account,
        });
        return null;
      } catch (redirectError) {
        console.error('Failed to acquire token via redirect:', redirectError);
        return null;
      }
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (!this.msalInstance) return;

    try {
      await this.msalInstance.logoutRedirect({
        account: this.account || undefined,
      });
      this.isAuthenticated = false;
      this.accessToken = null;
      this.currentUser = null;
      this.account = null;
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Get current authentication status
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  /**
   * Get cached access token (must call getAccessToken() first for fresh token)
   */
  getCachedAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get MSAL instance (advanced usage)
   */
  getMsalInstance(): PublicClientApplication | null {
    return this.msalInstance;
  }

  isLoginInProgress(): boolean {
    return this.loginInProgress;
  }
}

export const authService = new AuthService();
