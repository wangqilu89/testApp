import AsyncStorage from '@react-native-async-storage/async-storage';

const postFunc = async (URL:string,payload: object = {}) => {
    try {
      const options = await GetPostOptions(payload);
      const response = await fetch(URL,options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };



const GetPostOptions = async (payload:object) => {
    const sid = await AsyncStorage.getItem('connect.sid');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(sid ? { Cookie: `connect.sid=${sid}` } : {}),
    };
    
    const options: RequestInit = {
      method: 'POST',
      credentials:'include',
      headers,
    };

    if (Object.keys(payload).length > 0) {
      options.body = JSON.stringify(payload);
    }
  
    return options;
}



export {
    postFunc
  };