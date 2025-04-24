import AsyncStorage from '@react-native-async-storage/async-storage';

const postFunc = async (URL:string,payload: object = {},method:string="POST") => {
    try {
      method = method.toUpperCase()
      const options = await GetPostOptions(payload,method);
      const response = await fetch(URL,options);
      const data = await response.json();
      return data.success.data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
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



export {
    postFunc
  };