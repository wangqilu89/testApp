import { useState, useEffect, useCallback } from 'react';
import { usePrompt } from '@/components/AlertModal';
import { useListFilter } from '@/hooks/useListFilter'
import {FetchData} from '@/services';

type GenericObject = Record<string, any>;

interface UseListPostOptions {
  LoadModal?:boolean,
  LoadObj?:GenericObject|null,
  Defined?:GenericObject[]
  SearchFunction?: ((items: GenericObject[], keyword: string) => GenericObject[]) | null,
  SearchObj?:GenericObject|null,
  PostObj?:GenericObject
}
const defaultOptions = {LoadModal:true,LoadObj:null,Defined:[],SearchFunction:null,SearchObj:null}

const useListPost = (options: UseListPostOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
  const {PostObj} = finalOptions;
  const {list,displayList,setSearch,search,loading,loadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,UpdateLoad} = useListFilter(finalOptions);
  const { ShowPrompt } = usePrompt();
  
  const HandleAction = async (action:string) => {
    if (selectedKeys.length === 0) {
        ShowPrompt({msg:"Please select at least one record."});
        return;
    }
    const NewObj = { ...PostObj, command: PostObj?.command??'' + action, data: selectedKeys };
    await FetchData(NewObj);
  }

  return {list,displayList,setSearch,search,loading,loadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleAction,UpdateLoad}
}

export {useListPost}