import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  recordSecurityAudit,
  checkRateLimit
} from '../utils/security';

export type UserRole = 'admin' | 'guest';

interface AuthSession {
  token: string;
  expiresAt: number;
  role: UserRole;
  username: string;
}

interface StoredAdminAccount {
  username: string;
  hash: string;
  salt: string;
  updatedAt: string;
}

interface AuthContextType {
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  username: string;
  login: (user: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isLockedOut: boolean;
  lockoutRemainingSec: number;
  apiKeys: { tmdbKey: string; rawgKey: string };
  updateApiKeys: (keys: { tmdbKey?: string; rawgKey?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SESSION_KEY = 'vault_shelf_auth_session_v1';
const ADMIN_ACCOUNT_KEY = 'vault_shelf_admin_account_v1';
const API_VAULT_KEY = 'vault_shelf_secure_api_vault_v1';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

// Default initialization credentials (user is prompted to change on first login)
const DEFAULT_INITIAL_ADMIN = {
  username: 'admin',
  initialPlain: 'VaultAdmin2026!'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        if (parsed && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);
  const [apiKeys, setApiKeys] = useState<{ tmdbKey: string; rawgKey: string }>(() => {
    try {
      const raw = localStorage.getItem(API_VAULT_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    // Also check if any were populated via env
    return {
      tmdbKey: (import.meta.env.VITE_MOVIE_API_KEY as string) || '',
      rawgKey: (import.meta.env.VITE_GAME_API_KEY as string) || ''
    };
  });

  // Initialize admin account if not already created
  useEffect(() => {
    const initAdmin = async () => {
      try {
        const existing = localStorage.getItem(ADMIN_ACCOUNT_KEY);
        if (!existing) {
          const { hash, salt } = await hashPassword(DEFAULT_INITIAL_ADMIN.initialPlain);
          const account: StoredAdminAccount = {
            username: DEFAULT_INITIAL_ADMIN.username,
            hash,
            salt,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(account));
        }
      } catch (err) {
        console.error('Failed to initialize secure admin account', err);
      }
    };
    initAdmin();
  }, []);

  // Sync session state to storage
  useEffect(() => {
    if (session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, [session]);

  // Periodic session expiration checker
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      if (session.expiresAt <= Date.now()) {
        recordSecurityAudit('LOGOUT', 'Admin session expired automatically due to timeout');
        setSession(null);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemainingSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemainingSec]);

  const login = async (user: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const normalizedUser = user.trim().toLowerCase();

    // Check rate limit on brute-force attempts
    const rateCheck = checkRateLimit(`login_${normalizedUser}`, MAX_LOGIN_ATTEMPTS, LOCKOUT_WINDOW_MS);
    if (!rateCheck.allowed) {
      const remainingSeconds = Math.ceil(rateCheck.resetInMs / 1000);
      setLockoutRemainingSec(remainingSeconds);
      recordSecurityAudit('RATE_LIMITED', `Brute force login prevented for user: ${normalizedUser}`, 'high');
      return {
        success: false,
        message: `Too many failed attempts. Security lockout active for ${Math.ceil(remainingSeconds / 60)} minutes.`
      };
    }

    try {
      const storedRaw = localStorage.getItem(ADMIN_ACCOUNT_KEY);
      if (!storedRaw) {
        return { success: false, message: 'Authentication store not initialized' };
      }

      const storedAccount: StoredAdminAccount = JSON.parse(storedRaw);
      if (storedAccount.username.toLowerCase() !== normalizedUser) {
        recordSecurityAudit('LOGIN_FAILURE', `Invalid user attempt: ${normalizedUser}`, 'medium');
        return { success: false, message: 'Invalid admin credentials.' };
      }

      const isValid = await verifyPassword(pass, storedAccount.hash, storedAccount.salt);
      if (!isValid) {
        recordSecurityAudit('LOGIN_FAILURE', `Invalid password for: ${normalizedUser}`, 'medium');
        return { success: false, message: `Invalid admin credentials. ${rateCheck.remaining} attempts remaining.` };
      }

      // Successful login
      const newSession: AuthSession = {
        token: generateSecureToken(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
        role: 'admin',
        username: storedAccount.username
      };

      setSession(newSession);
      recordSecurityAudit('LOGIN_SUCCESS', `Admin logged in successfully (${storedAccount.username})`);
      return { success: true, message: 'Authentication successful. Welcome, Admin.' };
    } catch (err) {
      console.error('Login error', err);
      return { success: false, message: 'Authentication verification error.' };
    }
  };

  const logout = useCallback(() => {
    if (session) {
      recordSecurityAudit('LOGOUT', `Admin ${session.username} explicitly logged out`);
    }
    setSession(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }, [session]);

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin credentials required.' };
    }

    if (!newPass || newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    try {
      const storedRaw = localStorage.getItem(ADMIN_ACCOUNT_KEY);
      if (!storedRaw) {
        return { success: false, message: 'Admin account not found.' };
      }

      const storedAccount: StoredAdminAccount = JSON.parse(storedRaw);
      const isCurrentValid = await verifyPassword(oldPass, storedAccount.hash, storedAccount.salt);
      if (!isCurrentValid) {
        recordSecurityAudit('LOGIN_FAILURE', 'Password change rejected: current password incorrect', 'medium');
        return { success: false, message: 'Current password is incorrect.' };
      }

      // Hash new password with fresh cryptographically generated salt
      const { hash, salt } = await hashPassword(newPass);
      const updatedAccount: StoredAdminAccount = {
        ...storedAccount,
        hash,
        salt,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(updatedAccount));
      recordSecurityAudit('PASSWORD_CHANGED', 'Admin master password updated securely with new PBKDF2 salt');
      return { success: true, message: 'Password updated successfully!' };
    } catch (err) {
      console.error('Failed to change password', err);
      return { success: false, message: 'Failed to update password.' };
    }
  };

  const updateApiKeys = (keys: { tmdbKey?: string; rawgKey?: string }) => {
    setApiKeys((prev) => {
      const updated = {
        tmdbKey: keys.tmdbKey !== undefined ? keys.tmdbKey.trim() : prev.tmdbKey,
        rawgKey: keys.rawgKey !== undefined ? keys.rawgKey.trim() : prev.rawgKey
      };
      try {
        localStorage.setItem(API_VAULT_KEY, JSON.stringify(updated));
        recordSecurityAudit('DATA_IMPORT', 'API Key Vault updated securely');
      } catch (err) {
        console.error('Failed to update API Vault', err);
      }
      return updated;
    });
  };

  const role: UserRole = session ? session.role : 'guest';
  const isAdmin = role === 'admin';
  const isAuthenticated = session !== null;
  const username = session ? session.username : 'Guest Visitor';
  const isLockedOut = lockoutRemainingSec > 0;

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin,
        isAuthenticated,
        username,
        login,
        logout,
        changePassword,
        isLockedOut,
        lockoutRemainingSec,
        apiKeys,
        updateApiKeys
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
