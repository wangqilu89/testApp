import { usePrompt } from '@/components/AlertModal';
import { useListFilter } from '@/hooks/useListFilter'
import { Ionicons } from '@expo/vector-icons';
import { GenericObject,UseListPostOptions } from '@/types';


const defaultOptions = {LoadModal:true,LoadObj:null,Defined:[],SearchFunction:null,SearchObj:null,PostObj:null}

const useListPost = (options: UseListPostOptions) => {
  const finalOptions = { ...defaultOptions, ...options };
  const {LoadObj,PostObj} = finalOptions;
  const {list,displayList,setSearch,search,loading,LoadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleSelectAll,selectAll,UpdateLoad,ResetLoad,ResetSelectAll,LoadAll} = useListFilter(finalOptions);
  const { ShowPrompt } = usePrompt();
  
  const HandleAction = async (action:string,PromptObj:GenericObject,refresh:boolean) => {
    if (selectedKeys.length === 0) {
        ShowPrompt({msg:"Please select at least one record."});
        return;
    }
    let result:GenericObject
    let proceed:boolean
    do {
      proceed = true
      result = await ShowPrompt(PromptObj as any)
      proceed = (!result.value && result.confirmed && PromptObj.input.visible)?false:true
    } while (!proceed)

    if (result.confirmed) {
      
      console.log('Post Obj',PostObj)
      //const NewObj = { ...PostObj, command: (PostObj?.command??'') + action, data:{action:action,value:result.value,data:selectedKeys}};
      //const final = await FetchData(NewObj);
      const ConfirmObj = {
        msg:action + ' performed successfully.',
        icon:{label:<Ionicons name="checkmark"style={{fontSize:50,color:'green'}}/>,visible:true},
        cancel:{visible:false}
      };
      result = await ShowPrompt(ConfirmObj)
    }
    
    if (refresh && LoadObj) {
      ResetLoad()
    }

  }

  return {list,displayList,setSearch,search,loading,LoadMore,HandleExpand,expandedKeys,HandleSelect,selectedKeys,HandleSelectAll,selectAll,UpdateLoad,ResetLoad,HandleAction,ResetSelectAll,LoadAll}
}

export {useListPost}