import { Platform,Dimensions } from 'react-native';
import { useState,useEffect } from 'react';

import Constants from 'expo-constants';
import { GenericObject } from '@/types';

import { GetMemAccessToken,RefreshAccessToken } from '@/components/AuthState';


const { SERVER_URL, RESTLET,REACT_ENV,USER_ID} = Constants.expoConfig?.extra || {};


const postFunc = async <T = any>(path: string, payload:object,method:string = "POST",absolute: boolean = false ) : Promise<T> => {
  method = method.toUpperCase()
  const url = absolute ? path : `${SERVER_URL}${path}`;
  let {options:opts,headers} = await GetPostOptions(payload,method)
  let res = await fetch(url, opts);
  if (res.status === 401) {
    const newAccess = await RefreshAccessToken();
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      opts = { ...opts, headers }
      res = await fetch(url, opts);
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text as T; }
}

const GetPostOptions = async (payload:object,method:string) => {
    const headers = new Headers({})
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    const accessTokenInMem = GetMemAccessToken()
    if (accessTokenInMem) {
        headers.set('Authorization', `Bearer ${accessTokenInMem}`);
    }
    
    const options: RequestInit = {
        method: method,
        headers
    };
    if (Object.keys(payload).length > 0 && method != 'GET') {
        options.body = JSON.stringify(payload);
    }
    
    return {options,headers};
    
}


const FetchData = async (o:Record<string, any>) => {
  o.restlet ??= RESTLET;
  o.user ??= USER_ID;
  o.middleware ??= SERVER_URL + '/netsuite/send?acc=1'
  try {
    let data = await postFunc(o.middleware,o);
    data = data|| []
    return data
  } 
  catch (err) {
    console.error(`Failed to fetch command - ${o.command}:`, err);
  } 
  
};



const ProperCase = (str:string|number) => {
  
  return str.toString().toLowerCase().split(/_/g).map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
} 

const NumberComma = (str:string|number) => {
  let num = ((typeof str == 'string')?(parseFloat(str)):str)
  num = isNaN(num)?0:num
  return ((num < 0 )?('(' + Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ')'):num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","))

}

const NumberPercent = (str:string|number) => {
  return NumberComma(str) + ' %'
}

const addOpacity = (hex: string, opacity: number) => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex + alpha;
};

const useWebCheck = () => {
  const getPlatformState = () => {return ((Platform.OS === 'web') &&  (Dimensions.get('window').width >= 768))}
  const [isWeb, setIsWeb] = useState(getPlatformState());
  useEffect(() => {
    const updateState = () => {
      setIsWeb(getPlatformState());
    };
    // Listen to window resize events
    const subscription = Dimensions.addEventListener('change', updateState);
    return () => subscription.remove?.(); // Remove listener cleanly
  }, []);
  
  return isWeb;
    
}; 

const GetWeekDates = (t:string,d:Date) => {
  const DateStr = d.toISOString().split('T')[0] + 'T00:00:00.000Z'
  let e = new Date(DateStr)
  if (t == 'start') {
    e.setDate(e.getDate() - e.getDay());
  }
  else if (t === 'end') {
    e.setDate(e.getDate() - e.getDay() + 6)
  }
  return e
}

const DateCompare = (D1:Date,D2:Date) => {
  return ((D1>D2)?1:((D2>D1)?2:0))

}

const GetTotal = (list:GenericObject[],field:string) => {
  let Total = 0
  list.forEach((item) => {
    Total += isNaN(Number(item[field])) ? 0 : Number(item[field]);
  })
  return Total
}

export {
    postFunc,
    RESTLET,
    SERVER_URL,
    REACT_ENV,
    USER_ID,
    FetchData,
    ProperCase,
    NumberComma,
    NumberPercent,
    addOpacity,
    useWebCheck,
    GetWeekDates,
    DateCompare,
    GetTotal
};