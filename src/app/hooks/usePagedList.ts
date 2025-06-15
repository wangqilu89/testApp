import { useState, useEffect, useCallback } from 'react';
import { useGetList } from '@/hooks/useGetList'

type GenericObject = Record<string, any>;

interface UsePagedListOptions {
  pageSize?: number,
  withLoading?:boolean,
  searchFunction?: (items: GenericObject[], keyword: string) => GenericObject[]
  items?:GenericObject[],
  loadObj?:GenericObject
}
const defaultOptions = {withLoading:true,pageSize:1,items:[],loadObj:{}}

const usePagedList = ( options: UsePagedListOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
  const { list } = useGetList(finalOptions);
  const [displayList, setDisplayList] = useState<GenericObject[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = finalOptions.pageSize
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    let filtered = list;
    const keyword = search.trim().toLowerCase();
    if (keyword && finalOptions?.searchFunction) {
      const searchFn = finalOptions.searchFunction;
      filtered = searchFn(list,keyword)
    }

    setDisplayList(filtered.slice(0, page * pageSize));
  }, [search, page, list]);
  
  useEffect(() => {
    setExpandedKeys([]);
  }, [search]);
  
  const loadMore = () => setPage(prev => prev + 1);
  
  const toggleCollapse = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return {
    list,
    displayList,
    search,
    setSearch,
    loadMore,
    toggleCollapse,
    expandedKeys
  };
}

export {usePagedList}