import { useState, useEffect, useMemo } from 'react';
import { useListGet } from '@/hooks/useListGet'
import { GenericObject,UseListFilterOptions } from '@/types';

const defaultOptions = {LoadModal:true,LoadObj:null,Defined:[],SearchFunction:null,SearchObj:null,Enabled:true}

const useListFilter = ( options: UseListFilterOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
  const {LoadObj,SearchFunction} = finalOptions
  const { list,loading,UpdateLoad} = useListGet(finalOptions);
  const [page, setPage] = useState(1);
  const pageSize = 10
  const [displayList, setDisplayList] = useState<GenericObject[]>([]);
  const [search, setSearch] = useState('');
  const [selectAll, setSelectAll] = useState(true);
  
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const SearchObj = useMemo(() => {
    if (finalOptions.SearchObj) {
      return {...finalOptions.SearchObj,data: { keyword: search }}
    }
    else {
      return null
    }
  }, [search]);

  
  
  const loadMore = () => setPage(prev => prev + 1);
  
  const HandleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const HandleSelect = (key: string) => {
    setSelectedKeys((prev) => {
        const isSelected = prev.includes(key);
        const newSelectedIds = isSelected ? prev.filter((i) => i !== key) : [...prev, key];
        return newSelectedIds;
    });
    
  };
  
  const HandleSelectAll = () => {
    
    setSelectAll(!selectAll)
  };

  const ResetSelectAll = () => {
    
    setSelectAll(true);
    setSelectedKeys([]);
  }
  const ResetLoad = () => {
    if (LoadObj) {
      UpdateLoad(LoadObj)
    }
    setSearch('');
    setExpandedKeys([]);
    ResetSelectAll();
  }

  useEffect(() => {
    let filtered = list;
    if (SearchFunction && search) {
      
      const keyword = search.trim().toLowerCase();
      filtered = SearchFunction(list,keyword)
      
    }
    setDisplayList(filtered.slice(0, page * pageSize))
  }, [list,search, page]);
  
  useEffect(() => {
    setExpandedKeys([]);
    if (SearchObj && search) {
      const toLoad = {...SearchObj,data:{keyword:search}}
      UpdateLoad(toLoad);
    }
  }, [search]);

  useEffect(() => {
    
    displayList.forEach((item) => {
      
      if (selectedKeys.includes(item.internalid) === selectAll) {
          HandleSelect(item['internalid'])
      }
    })
  },[selectAll])
  return {list,displayList,setSearch,search,loading,loadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleSelectAll,selectAll,UpdateLoad,ResetLoad,ResetSelectAll};
}

export {useListFilter}