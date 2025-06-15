import { useState, useEffect, useCallback } from 'react';
import { usePrompt } from '@/components/AlertModal';
import {FetchData} from '@/services';

type GenericObject = Record<string, any>;

interface UseGetListOptions {
  withLoading?:boolean,
  loadObj?: GenericObject,
  items?:GenericObject[]
}
const defaultOptions = {withLoading:true,items:[],loadObj:{}}

const useGetList = (options: UseGetListOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
    const { ShowLoading, HideLoading } = usePrompt();
    const [list, setList] = useState<GenericObject[]>([]);
    const [loadObj,setLoadObj] = useState(finalOptions.loadObj)
    const [items,setItems] = useState(finalOptions.items)
    
    const load = useCallback(async () => {
        if (finalOptions.withLoading) {
          ShowLoading({msg:'Loading...'});
        }  
        try {
          const data = await FetchData(loadObj);
          setList(data ?? []);
        } 
        catch (err) {
          console.error(err);
        } 
        finally {
          if (finalOptions.withLoading) {
            HideLoading({});
          }
        }
      }, [loadObj]);
    
    useEffect(() => {
        if (items.length > 0) {
            setList(items)
        }
        else {
            load()
        }

    }, [loadObj,items]);
    return {
      list
    };
}

export {useGetList}