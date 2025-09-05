import React, { createContext, useContext, useState, useEffect,useMemo } from 'react';

import { SERVER_URL,postFunc,RESTLET,REACT_ENV,USER_ID} from '@/services/_common';
import { useRouter} from 'expo-router';
import { usePrompt } from '@/components/AlertModal';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { UserContextType,User } from '@/types';
import { useColorScheme,Alert} from 'react-native';
import { REDIRECT_URI,SetRefreshToken,RefreshAccessToken,SetMemAccessToken,SaveUser,ReadUser} from './AuthState';
import { exchangeOneTimeCode,serverLogout } from './AuthClient';




const UserContext = createContext<UserContextType | undefined>(undefined);

const platform = (Platform.OS === 'web' ? 'web' : 'mobile');
const AUTH_START = `${SERVER_URL}/auth/start?platform=${platform}`;

const getQueryParam = (url: string, name: string): string | null => {
  const m = new RegExp('[?&]' + name + '=([^&#]*)').exec(url);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
}

const GetCode = async () => {
  let code = null
  let weburl:string|null = ''
  for (var i=0; i < 3;i++) {
    switch (i) {
      case 0:
        weburl = window.location.href
      break;
      case 1:
        weburl = await Linking.getInitialURL();
      break;
      case 2:
        weburl = await new Promise<string>((resolve) => Linking.addEventListener('url', ({ url }) => {resolve(url)}))
      break;
    }
    code = getQueryParam(weburl || '','code') || null
    if (code) {
      return code
    }
  }
}



const OpenAuth = async () => {
  if (Platform.OS === 'web') {
    const origin = location.origin;
    location.href = `${AUTH_START}&origin=${encodeURIComponent(origin)}`;
  } 
  else {
    await WebBrowser.openAuthSessionAsync(AUTH_START, REDIRECT_URI);
  }
};


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
    await OpenAuth()
    
  };


  const BaseObj = useMemo(() => ({user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send'}),[user]);
  const safeAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // RN Alert can be flaky on web; use window.alert for debugging
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };
  
  
  // ---- initial bootstrap on mount (no infinite loops) ----
  useEffect(() => {
    const BootStrap = async () => {
      console.log('Mounting');
      ShowLoading({ msg: 'Checking authentication…' });
      try {
        const cached = await ReadUser();
        if (cached?.id) setUser(cached);
  
        // Try status with whatever access token is in memory (maybe none yet)
        try {
          const status = await postFunc<User>('/auth/status', {}, 'POST');
          if (status?.id) {
            await SaveUser(status);
            setUser(status);
            return;
          }
        } catch {}
  
        // Try refresh -> then status
        const newAccess = await RefreshAccessToken();
        if (newAccess) {
          const status = await postFunc<User>('/auth/status', {}, 'POST');
          if (status?.id) {
            await SaveUser(status);
            setUser(status);
            return;
          }
        }
        console.log('Not login')
        await OpenAuth()
        // Not logged in: DO NOTHING (no redirect/loop). Show your “Log in” UI.
        // You can call `openAuth()` from a button (see below).
        
      } 
      finally {
        HideLoading({ confirmed: true, value: '' });
        
      }
    };
    const LoadUser = async(code:string) => {
      console.log('Load User');
      ShowLoading({ msg: 'Finishing sign-in…' });
      try {
        const data = await exchangeOneTimeCode(code);
        console.log('Exchanged Data',data)
        
        if (data?.accessToken && data?.refreshToken) {
          SetMemAccessToken(data.accessToken);
          await SetRefreshToken(data.refreshToken);
          if (data.user) {
            await SaveUser(data.user);
            setUser(data.user);
          } 
          else {
            // Optionally verify via /auth/status
            const status = await postFunc<User>('/auth/status', {},'POST');
            await SaveUser(status);
            setUser(status);
          }
          
          //router.replace('/home');
        } 
        else {
          // fallback
          console.log('Failed User')
          //await serverLogout();
          
        }
       
      } catch (e) {
        console.warn('Exchange failed', e);
        //await serverLogout();
       
      } finally {
        HideLoading({ confirmed: true, value: '' });
      }
    }
    const Init = async() => {
      const code = await GetCode()
      console.log('code',code)
      safeAlert('Code',code || '')
      
      /*
      const code = await GetCode()
      console.log('code',code)
      if (code) {
        await LoadUser(code)
      }
      else {
        //await BootStrap();
      }
      */
    }
    
    Init()

    
  }, [router]);

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