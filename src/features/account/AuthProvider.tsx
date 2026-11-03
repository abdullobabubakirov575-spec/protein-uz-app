import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { fetchMe, login as loginRequest, register as registerRequest } from '@/api/account';
import { ApiError } from '@/api/client';
import type { AuthSession, User } from '@/api/types';
import { readJson, readToken, removeKey, StorageKeys, writeJson, writeToken } from '@/lib/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    writeToken(null);
    removeKey(StorageKeys.user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedToken, savedUser] = await Promise.all([readToken(), readJson<User>(StorageKeys.user)]);
      if (!savedToken || cancelled) return;
      setToken(savedToken);
      setUser(savedUser);
      try {
        const fresh = await fetchMe(savedToken);
        if (!cancelled && fresh) {
          setUser(fresh);
          writeJson(StorageKeys.user, fresh);
        }
      } catch (error) {
        if (!cancelled && error instanceof ApiError && error.isUnauthorized) signOut();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signOut]);

  const applySession = useCallback((session: AuthSession) => {
    setToken(session.token);
    setUser(session.user);
    writeToken(session.token);
    writeJson(StorageKeys.user, session.user);
  }, []);

  const signIn = useCallback(
    async (username: string, password: string) => applySession(await loginRequest(username, password)),
    [applySession],
  );

  const signUp = useCallback(
    async (username: string, password: string) => applySession(await registerRequest(username, password)),
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, signIn, signUp, signOut }),
    [user, token, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
