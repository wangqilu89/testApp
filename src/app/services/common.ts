const postFunc = async (URL:string,options: object) => {
    try {
      const response = await fetch(URL,options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling NetSuite:', error);
      throw error;
    }
  };

  const GetPostObject = (body:object) => {
    const newObj = {    method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'OAuth ...',
                        },
                        body: JSON.stringify(body),
                    }
    return newObj

  }


export {
    
    postFunc,
    GetPostObject
  };