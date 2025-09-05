import React, { createContext, useContext, useState, useEffect,useMemo } from 'react';

import { SERVER_URL,postFunc,RESTLET,REACT_ENV,USER_ID} from '@/services/_common';
import { useRouter} from 'expo-router';
import { usePrompt } from '@/components/AlertModal';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { UserContextType,User } from '@/types';
import { useColorScheme} from 'react-native';
import { REDIRECT_URI,SetRefreshToken,RefreshAccessToken,SetMemAccessToken,SaveUser,ReadUser} from './AuthState';
import { exchangeOneTimeCode,serverLogout } from './AuthClient';


const UserContext = createContext<UserContextType | undefined>(undefined);

const platform = (Platform.OS === 'web' ? 'web' : 'mobile');
const AUTH_START = `${SERVER_URL}/auth/start?platform=${platform}`;

const getQueryParam = (url: string, name: string): string | null => {
  const m = new RegExp('[?&]' + name + '=([^&#]*)').exec(url);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
}

  
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  
  const { ShowLoading, HideLoading } = usePrompt();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  let ColorScheme = useColorScheme();
  ColorScheme = ColorScheme??'light'

  
  
  const login = async (userData: User) => {
    setUser(userData);
    await SaveUser(userData);
  };

  const logout = async () => {
    try { await serverLogout(); } catch {}
    setUser(null);

    if (Platform.OS === 'web') {
      const origin = location.origin;
      const url = `${AUTH_START}&origin=${encodeURIComponent(origin)}`;
      location.href = url;
      return;
    } else {
      // Re-open OAuth flow
      await WebBrowser.openAuthSessionAsync(AUTH_START, REDIRECT_URI);
      // When the browser closes, the deep link handler below will process the code
    }
  };


  const BaseObj = useMemo(() => ({user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'}),[user]);

  

  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      const code = getQueryParam(url, 'code');
      if (!code) return;

      ShowLoading({ msg: 'Finishing sign-in…' });
      try {
        const data = await exchangeOneTimeCode(code);
        if (data?.accessToken && data?.refreshToken) {
          SetMemAccessToken(data.accessToken);
          await SetRefreshToken(data.refreshToken);
          if (data.user) {
            await SaveUser(data.user);
            setUser(data.user);
          } else {
            // Optionally verify via /auth/status
            const status = await postFunc<User>('/auth/status', { method: 'POST' });
            await SaveUser(status);
            setUser(status);
          }
          router.replace('/home');
        } else {
          // fallback
          await serverLogout();
          router.replace('/');
        }
      } catch (e) {
        console.warn('Exchange failed', e);
        await serverLogout();
        router.replace('/');
      } finally {
        HideLoading({ confirmed: true, value: '' });
      }
    });

    return () => sub.remove();
  }, [router, ShowLoading, HideLoading]);

  // ---- initial bootstrap on mount (no infinite loops) ----
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      ShowLoading({ msg: 'Checking authentication…' });

      try {
        // 1) If we already persisted a user (from a past session), set it optimistically
        const cached = await ReadUser();
        if (mounted && cached?.id) setUser(cached);

        // 2) Try status with whatever access token we have (maybe none yet)
        try {
          const status = await postFunc<User>('/auth/status', { method: 'POST' });
          if (mounted && status?.id) {
            await SaveUser(status);
            setUser(status);
            HideLoading({ confirmed: true, value: '' });
            return;
          }
        } catch {
          /* ignore; will refresh below */
        }

        // 3) Try refresh to obtain a new access token and then status
        const newAccess = await RefreshAccessToken();
        if (newAccess) {
          const status = await postFunc<User>('/auth/status', { method: 'POST' });
          if (mounted && status?.id) {
            await SaveUser(status);
            setUser(status);
            HideLoading({ confirmed: true, value: '' });
            return;
          }
        }

        // 4) Not logged in -> start OAuth
        if (Platform.OS === 'web') {
          const origin = location.origin;
          const url = `${AUTH_START}&origin=${encodeURIComponent(origin)}`;
          location.href = url;
        } else {
          await WebBrowser.openAuthSessionAsync(AUTH_START, REDIRECT_URI);
          // When it returns, deep link handler will set tokens/user
        }
      } catch (e) {
        console.warn('Bootstrap auth failed', e);
        await serverLogout();
        if (Platform.OS === 'web') {
          const origin = location.origin;
          const url = `${AUTH_START}&origin=${encodeURIComponent(origin)}`;
          location.href = url;
        } else {
          await WebBrowser.openAuthSessionAsync(AUTH_START, REDIRECT_URI);
        }
      } finally {
        HideLoading({ confirmed: true, value: '' });
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [ShowLoading, HideLoading]);

  return (
    <UserContext.Provider value={{ BaseObj,ColorScheme,user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}




const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export {UserProvider,useUser}