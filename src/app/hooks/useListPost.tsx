import { usePrompt } from '@/components/AlertModal';
import { useListFilter } from '@/hooks/useListFilter'
import { Ionicons } from '@expo/vector-icons';
import { GenericObject,UseListPostOptions } from '@/types';
import { FetchData } from '@/services';


const defaultOptions = {LoadModal:true,LoadObj:null,Defined:[],SearchFunction:null,SearchObj:null,PostObj:null}

const useListPost = (options: UseListPostOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
  const {LoadObj,PostObj} = finalOptions;
  const {list,displayList,setSearch,search,loading,LoadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleSelectAll,selectAll,UpdateLoad,ResetLoad,ResetSelectAll,LoadAll} = useListFilter(finalOptions);
  const { ShowPrompt } = usePrompt();
  
  const HandleAction = async (action:string,command:string,refresh:boolean,data?:GenericObject[]) => {
    const NewObj= {...PostObj,command:command,data:data}
    const final = await FetchData(NewObj);
    const ConfirmObj = {
        msg:action + ' performed successfully.',
        icon:{label:<Ionicons name="checkmark"style={{fontSize:50,color:'green'}}/>,visible:true},
        cancel:{visible:false}
      };
    let result = await ShowPrompt(ConfirmObj)
    if (refresh && LoadObj) {
      ResetLoad()
    }
  }

  return {list,displayList,setSearch,search,loading,LoadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleSelectAll,selectAll,UpdateLoad,ResetLoad,HandleAction,ResetSelectAll,LoadAll}
}

export {useListPost}