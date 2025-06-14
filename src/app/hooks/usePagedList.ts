import { useState, useEffect, useCallback } from 'react';
import { useAlert } from '@/components/AlertModal';
import {FetchData} from '@/services';

type GenericObject = Record<string, any>;

interface UsePagedListOptions {
  loadData: GenericObject,
  pageSize?: number;
  searchFields?: string[]; // optional: specify which fields to search
  searchFunction?: (items: GenericObject[], keyword: string) => GenericObject[]
}

const usePagedList = (options: UsePagedListOptions) => {
    const { ShowLoading, HideLoading } = useAlert();
    const [list, setList] = useState<GenericObject[]>([]);
    const [displayList, setDisplayList] = useState<GenericObject[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = options?.pageSize ?? 10;
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const LoadData = options.loadData
    const load = useCallback(async () => {
      ShowLoading('Loading...');
      try {
        const data = await FetchData(LoadData);
        setList(data ?? []);
        setPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        HideLoading();
      }
    }, [LoadData]);
  
    useEffect(() => { load(); }, [load]);
  
    useEffect(() => {
      let filtered = list;
      const keyword = search.trim().toLowerCase();
      if (keyword && options?.searchFunction) {
        const searchFn = options.searchFunction;
        filtered = searchFn(list,keyword)
      }
  
      setDisplayList(filtered.slice(0, page * pageSize));
    }, [search, page, list, options]);
    
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
      reload: load,
      toggleCollapse,
      expandedKeys
    };
}

export {usePagedList}