import { useState, useEffect, useCallback } from 'react';
import { usePrompt } from '@/components/AlertModal';
import {FetchData} from '@/services';

type GenericObject = Record<string, any>;

interface UseListGetOptions {
  LoadModal?:boolean,
  LoadObj?:GenericObject|null,
  Defined?:GenericObject[],
  Enabled?:boolean
}
const defaultOptions = {LoadModal:true,Defined:[],LoadObj:null,Enabled:true}

const useListGet = (options: UseListGetOptions) => {
 
  const finalOptions = { ...defaultOptions, ...options };

  const {LoadModal,LoadObj,Defined,Enabled} = finalOptions
  const { ShowLoading, HideLoading } = usePrompt();
  
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<GenericObject[]>([]);
  const [loadObj,setLoadObj] = useState(LoadObj)
  const [items,setItems] = useState(Defined)
    
  const load = useCallback(async (override?:GenericObject) => {
    try {
      setLoading(true);
      if (LoadModal) {
        ShowLoading({msg:'Loading...'});
      }
      
      const toLoad = override ?? loadObj;
      let data: GenericObject[] = []
      console.log('In Mount')
      if (toLoad) {
        //data = await FetchData(toLoad);
      }
      setList(data ?? []);
    } 
    catch (err) {
      console.error(err);
    } 
    finally {
      setLoading(false);
      HideLoading({});
    }
  }, [loadObj]);
  useEffect(() => {
      console.log("Get Moutned",finalOptions);
    }, []);  
  useEffect(() => {
    if (items.length > 0) {
      setList(items)
    }
    else if (loadObj && Enabled) {
      load()
    }
    else {
      setList([])
    }
  }, [loadObj,items,Enabled]);
  
  const UpdateLoad = (newObj: GenericObject) => {
    
    setLoadObj(newObj);
    load(newObj);
  };
  return {list,loading,UpdateLoad};
}

export {useListGet}