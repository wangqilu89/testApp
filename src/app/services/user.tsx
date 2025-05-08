import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL,postFunc} from '@/services/common';
import { useRouter } from 'expo-router';

import { Platform, Dimensions } from 'react-native';

type User = {
  id: string;
  name: string;
  email: string;
  group: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  role: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);



const getConnectSid = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        const match = document.cookie.match(new RegExp('(^| )connect.sid=([^;]+)'));
        return match ? match[2] : null;
      } 
      else {
        const CookieManager = (await import('@react-native-cookies/cookies')).default;
        const cookies = await CookieManager.get(url);
        return cookies['connect.sid']?.value ?? null;
      }
    } catch (e) {
      console.error('Error getting cookies: ', e);
      return null;
    }
};
  
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    
    let refreshInterval: NodeJS.Timeout;

    const checkLoginStatus = async () => {
      
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const data = await postFunc(SERVER_URL + '/auth/status', {});
          console.log('Auth check:', data);

          if (data?.id && data.id !== 0) {
            
            setUser(data);
            await AsyncStorage.setItem('userSession', JSON.stringify(data));
            const sid = await getConnectSid(SERVER_URL);
            if (sid) {
                await AsyncStorage.setItem('connect.sid', sid);
            }
            setLoading(false);
            return;
          } 
          else {
            console.warn('Session expired, logging out.');
            logout(); // ✅ force logout if invalid
          }
        } 
        catch (err) {
          console.warn('Login status check failed:', err);
        }

        await new Promise((res) => setTimeout(res, 500));
      }
      await logout();
    };

    const init = async () => {
        await checkLoginStatus(); // First check on mount
    
        refreshInterval = setInterval(() => {
          checkLoginStatus();
        }, 24 * 60 * 60 * 1000); // ✅ Check once every 24 hours
    };


    init();

    return () => {
        
        clearInterval(refreshInterval); // ✅ Clear on unmount
      };
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('userSession', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
        await postFunc(SERVER_URL + '/auth/logout')

    } catch (error) {
        console.warn('Failed to logout from server:', error);
    }
    setUser(null);
    await AsyncStorage.multiRemove(['userSession', 'connect.sid']);
    router.replace('/'); 
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
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

export {
    UserProvider,
    useUser
}