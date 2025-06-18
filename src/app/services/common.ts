import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const { SERVER_URL, RESTLET,REACT_ENV,USER_ID} = Constants.expoConfig?.extra || {};


const postFunc = async (URL:string,payload: object = {},method:string="POST") => {
    try {
      
      method = method.toUpperCase()
      const options = await GetPostOptions(payload,method);
      const response = await fetch(URL,options);
      const data = await response.json();
      //console.log(data)
      return data.success.data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
};
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
  
const GetPostOptions = async (payload:object,method:string) => {
    const sid = await AsyncStorage.getItem('connect.sid');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(sid ? { Cookie: `connect.sid=${sid}` } : {}),
    };
    
    const options: RequestInit = {
      method: method,
      credentials:'include',
      headers,
    };

    if (Object.keys(payload).length > 0 && method != 'GET') {
      options.body = JSON.stringify(payload);
    }
  
    return options;
}

const ProperCase = (str:string) => {
  return str.toLowerCase().split(/_/g).map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
} 

const NumberComma = (str:string|number) => {
  if (typeof str == 'string') {
      return parseFloat(str).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  return str.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


export {
    postFunc,
    RESTLET,
    SERVER_URL,
    REACT_ENV,
    USER_ID,
    FetchData,
    ProperCase,
    NumberComma
};