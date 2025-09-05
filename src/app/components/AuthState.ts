import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@/services';



const REDIRECT_URI = 'myapp://auth/callback';

const REFRESH_KEY = 'REFRESH_TOKEN';
const USER_KEY = 'USER';

// in-memory access token (never persist)
let accessTokenInMem: string | null = null;

const GetMemAccessToken = () => {
    return accessTokenInMem;
}

const SetMemAccessToken = (tok: string | null) => {
  accessTokenInMem = tok;
}

const GetRefreshToken = async () => {
  return AsyncStorage.getItem(REFRESH_KEY);
}

const SetRefreshToken = async (tok: string | null) => {
  if (tok) await AsyncStorage.setItem(REFRESH_KEY, tok);
  else await AsyncStorage.removeItem(REFRESH_KEY);
}

const SaveUser = async (user: any | null) =>  {
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  else await AsyncStorage.removeItem(USER_KEY);
}

const ReadUser = async (): Promise<any | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Refresh without using postFunc to avoid cycles */
const RefreshAccessToken = async (): Promise<string | null>  => {
  const rt = await GetRefreshToken();
  if (!rt) return null;

  const res = await fetch(`${SERVER_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-platform-native': '1' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) return null;
  const json = await res.json(); // { accessToken, refreshToken? }

  if (json.refreshToken) await SetRefreshToken(json.refreshToken);
  if (json.accessToken) {
    SetMemAccessToken(json.accessToken);
    return json.accessToken;
  }
  return null;
}

export {
    REDIRECT_URI,

    GetMemAccessToken,
    SetMemAccessToken,
    RefreshAccessToken,

    GetRefreshToken,
    SetRefreshToken,

    SaveUser,
    ReadUser
}