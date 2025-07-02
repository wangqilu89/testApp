import { useState, useEffect, useCallback } from 'react';
import { usePrompt } from '@/components/AlertModal';
import {FetchData} from '@/services';
import { GenericObject,UseListOptions } from '@/types';

const defaultOptions = {LoadModal:true,Defined:[],LoadObj:null,Enabled:true}

const useListGet = (options: UseListOptions) => {
 
  const finalOptions = { ...defaultOptions, ...options };

  const {LoadModal,LoadObj,Defined,Enabled} = finalOptions
  const { ShowLoading, HideLoading } = usePrompt();
  
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<GenericObject[]>([]);
  const [loadObj,setLoadObj] = useState(LoadObj)
  const [items,setItems] = useState<GenericObject[]>([])
  
  const onLoading = () => {
    setLoading(true);
    if (LoadModal) {
      ShowLoading({msg:'Loading...'});
    }
  }

  const offLoading = () => {
    setLoading(false);
    if (LoadModal) {
      HideLoading({});
    }
  }

  const load = useCallback(async (override?:GenericObject) => {
    try {
      onLoading()
      const toLoad = override ?? loadObj;
      let data: GenericObject[] = []
      if (toLoad) {
        console.log('Dummy Load',toLoad)
        data = await FetchData(toLoad);
      }
      setList(data ?? []);
    } 
    catch (err) {
      console.error(err);
    } 
    finally {
      offLoading()
    }
  }, [loadObj]);
   
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
  
  useEffect(() => {
    if (Defined && Defined.length > 0) {
      setItems(Defined)
    }
  },[Defined])
  const UpdateLoad = (newObj: GenericObject) => {
    setLoadObj(newObj);
  };
  return {list,loading,UpdateLoad};
}

export {useListGet}