import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL} from '@/services/_common';

const REDIRECT_URI = 'myapp://auth/callback';
const REFRESH_KEY = 'REFRESH_TOKEN';
const USER_KEY = 'USER';

// in-memory access token (never persist)
let accessTokenInMem: string | null = null;

function setAccessTokenInMem(tok: string | null) {
  accessTokenInMem = tok;
}

async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}

async function setRefreshToken(tok: string | null) {
  if (tok) await AsyncStorage.setItem(REFRESH_KEY, tok);
  else await AsyncStorage.removeItem(REFRESH_KEY);
}

async function saveUser(user: any | null) {
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  else await AsyncStorage.removeItem(USER_KEY);
}

async function readUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function refreshAccessToken(): Promise<string | null> {
  const rt = await getRefreshToken();
  if (!rt) return null;

  const res = await fetch(`${SERVER_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-platform-native': '1' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) return null;
  const json = await res.json(); // { accessToken, refreshToken? }

  if (json.refreshToken) await setRefreshToken(json.refreshToken);
  if (json.accessToken) {
    setAccessTokenInMem(json.accessToken);
    return json.accessToken;
  }
  return null;
}

/**
 * apiFetch: attaches Authorization, refreshes on 401, retries once
 */
async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { absolute?: boolean } = {}
): Promise<T> {
  const url = opts.absolute ? path : `${SERVER_URL}${path}`;
  const headers = new Headers(opts.headers || {});
  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && opts.body && typeof opts.body !== 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (accessTokenInMem) headers.set('Authorization', `Bearer ${accessTokenInMem}`);

  let res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      res = await fetch(url, { ...opts, headers });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text as T; }
}

async function exchangeOneTimeCode(code: string) {
  return apiFetch<{ accessToken: string; refreshToken: string; user: any }>(
    '/auth/exchange',
    { method: 'POST', body: JSON.stringify({ code }) }
  );
}

async function serverLogout() {
  const rt = await getRefreshToken();
  try {
    await fetch(`${SERVER_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-platform-native': '1' },
      body: JSON.stringify({ refreshToken: rt }),
    });
  } catch {}
  setAccessTokenInMem(null);
  await setRefreshToken(null);
  await saveUser(null);
}


export {
    REDIRECT_URI,
    setAccessTokenInMem,
    getRefreshToken,
    setRefreshToken,
    saveUser,
    readUser,
    refreshAccessToken,
    apiFetch,
    exchangeOneTimeCode,
    serverLogout
}