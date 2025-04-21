const postFunc = async (URL:string,options: object) => {
    try {
        if (!options.hasOwnProperty('credentials')) {
            options.credentials = 'include' ; // ✅ Force session cookies
        }  
      const response = await fetch(URL,options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };


const GetPostOptions = (payload:object) => {
    return {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    }
}
  

export {
    postFunc,
    GetPostOptions
  };