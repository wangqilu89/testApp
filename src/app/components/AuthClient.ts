import { postFunc} from '@/services/_common';
import { SERVER_URL } from '@/services';
import {REDIRECT_URI,GetMemAccessToken,SetMemAccessToken,RefreshAccessToken,GetRefreshToken,SetRefreshToken,SaveUser,ReadUser} from './AuthState';



const exchangeOneTimeCode = async (code: string) => {
    // ✅ correct signature: payload object + 'POST'
    return postFunc<{ accessToken: string; refreshToken: string; user: any }>('/auth/exchange',{ code },'POST');
  }
  
const serverLogout = async () => {
    const rt = await GetRefreshToken();
    try {
      await fetch(`${SERVER_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-platform-native': '1' },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {}
    SetMemAccessToken(null);
    await SetRefreshToken(null);
    await SaveUser(null);
  }

export {exchangeOneTimeCode,serverLogout}