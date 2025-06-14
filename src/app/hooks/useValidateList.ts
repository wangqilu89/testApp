import { useState, useEffect, useCallback } from 'react';
import { useAlert } from '@/components/AlertModal';
import { usePagedList } from '@/hooks/usePagedList'
import {FetchData} from '@/services';

type GenericObject = Record<string, any>;

interface UseValidateListOptions {
  loadData: GenericObject,
  postData: GenericObject,
  pageSize?: number;
  searchFields?: string[]; // optional: specify which fields to search
  searchFunction?: (items: GenericObject[], keyword: string) => GenericObject[]
}

const useValidateList = (options: UseValidateListOptions) => {
    const { ShowPrompt } = useAlert();
    const { list, displayList, search, setSearch, loadMore, reload, toggleCollapse, expandedKeys } = usePagedList(options);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const HandleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const isSelected = prev.includes(id);
            const newSelectedIds = isSelected ? prev.filter((i) => i !== id) : [...prev, id];
            return newSelectedIds;
        });
    };

    const HandleAction = async (action:string) => {
        const PostData = options.postData
        if (selectedIds.length === 0) {
            ShowPrompt({msg:"Please select at least one record."});
            return;
        }
        const NewObj = { ...PostData, command: PostData?.command??'' + action, data: selectedIds };
        await FetchData(NewObj);
    }

    return {list,displayList,search,setSearch,loadMore,reload,toggleCollapse,expandedKeys,HandleSelect}
}

export {usePagedList}