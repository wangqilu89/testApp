import React, { createContext, useContext, useState,ReactNode,useRef} from 'react';
import { View, Text,  TouchableOpacity,ActivityIndicator,TextInput} from 'react-native';
import Modal from "react-native-modal";    
import { Ionicons } from '@expo/vector-icons'; 

type GenericObject = Record<string, any>;
type PromptContext = {
    // Alert
    ShowPrompt: ({msg,icon,input,ok,cancel}: PromptConfig) => Promise<GenericObject>,
    HidePrompt: (item:GenericObject) => void,
    ShowLoading: ({msg,icon,input,ok,cancel}: PromptConfig) => Promise<GenericObject>,
    HideLoading: (item:GenericObject) => void,
    visibility:boolean
}

type PromptConfig = {
  msg: string | React.ReactNode,
  icon?:GenericObject,
  input?:GenericObject,
  ok?:GenericObject,
  cancel?:GenericObject,
  container?:GenericObject
}

type PromptProps = {
  message:string| ReactNode,
  icon:GenericObject,
  input:GenericObject,
  proceed:GenericObject,
  cancel:GenericObject,
  visible:boolean,
  onClose: (item: GenericObject) => void,
  thematic:GenericObject
}


const PromptContext = createContext<PromptContext | undefined>(undefined);

const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const resolverRef = useRef<(result: GenericObject) => void>();
    //New Prompt
    const [msg,setMsg] = useState<string | ReactNode>('');
    const [icon,setIcon] = useState<GenericObject>({});
    const [input,setInput] = useState<GenericObject>({});
    const [proceed,setProceed] = useState<GenericObject>({});
    const [cancel,setCancel] = useState<GenericObject>({});
    const [visibility, setVisibility] = useState(false);
    const [thematic,setThematic] = useState<GenericObject>({});

    const defaults:GenericObject =  {
      icon:{ visible: true, label: 'alert-circle-outline' },
      input:{ visible: false, label: 'Input Here' },
      ok:{ visible: true, label: 'OK'},
      cancel:{ visible: true, label: 'Cancel'},
      container:{backdropColor:"black",backdropOpacity:0.7,containerColor:'white'}
    }

    const ShowPrompt = ({msg,icon,input,ok,cancel,container}:PromptConfig): Promise<GenericObject> => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;  
        
        
        setMsg(msg);
        setIcon({...defaults.icon,...(icon??{})});
        setInput({...defaults.input,...(input??{})});
        setProceed({...defaults.ok,...(ok??{})});
        setCancel({...defaults.cancel,...(cancel??{})});
        setThematic({...defaults.container,...(container??{})})
        setVisibility(true)
      })      
    }

    const HidePrompt = (item:GenericObject) => {
      resolverRef.current?.(item);
      resolverRef.current = undefined;
      setMsg('');
      setIcon({});
      setInput({});
      setProceed({});
      setCancel({});
      setThematic({});
      setVisibility(false);
    }

    const ShowLoading = ({msg,icon,input,ok,cancel}:PromptConfig): Promise<GenericObject> => {
      
      return ShowPrompt({
        msg:msg,
        icon:{visible: true, label: <ActivityIndicator size="large" />,...(icon??{})},
        input:{ visible: false, label: 'Input Here' ,...(input??{})},
        ok:{ visible: false, label: 'OK',...(ok??{})},
        cancel:{ visible: false, label: 'Cancel',...(cancel??{})},
        container:{backdropColor:"white",backdropOpacity:0.5,containerColor:'transparent'}
      })
          
    }

    const HideLoading = (item:GenericObject) => {
      HidePrompt(item)
    }

    return (
      <PromptContext.Provider value={{ShowPrompt,HidePrompt,visibility,ShowLoading,HideLoading}}>
        {children}
        <Prompt message={msg} icon={icon} input={input} proceed={proceed} cancel={cancel} visible={visibility} onClose={HidePrompt} thematic={thematic}  />
      </PromptContext.Provider>
    );
};

const usePrompt = () => {
    const context = useContext(PromptContext);
    if (!context) {
      throw new Error("usePrompt must be used within an PromptProvider");
    }
    return context;
};

const Prompt = ({message,icon,input,proceed,cancel,visible,onClose,thematic}:PromptProps) => {
  
  const [keyed,setKeyed] = useState('')

  const handleConfirm = () => {  
    onClose({ confirmed: true, value: keyed });
  };
  const handleCancel = () => {  
    if (cancel.visible) {
      onClose({ confirmed: false, value: keyed  })
    }
  };
  return (
      <Modal backdropColor={thematic.backdropColor} backdropOpacity={thematic.backdropOpacity}isVisible={visible}  onBackdropPress={handleCancel} onBackButtonPress={handleCancel} >
          <View style={{backgroundColor:thematic.containerColor,flexDirection:'column'}}>
            {cancel.visible && 
               (<TouchableOpacity onPress={handleCancel} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>)
            }
            <View style={{flexDirection:'column',alignItems:'center'}}>
               {icon.visible && (
                  typeof icon.label === 'string'?
                  (<Ionicons name={icon.label as any} style={{fontSize:50,color:'red'}}/>):
                  (icon.label)
                )}
                {typeof message === 'string' ? (
                  <View style={{marginVertical:20,paddingHorizontal:10}}>
                     <Text style={{ fontSize: 20,textAlign:'center'}}>{message}</Text>
                  </View>
                ):(
                  message
                )}
                {input.visible && (
                  <TextInput keyboardType="default" placeholder={input.label} value={keyed} onChangeText={setKeyed} style={[{flex:1,color:'black',textAlign: 'left',fontSize: 16,padding:0,height:20,borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>
                )}    
                <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                  {proceed.visible && 
                    (<TouchableOpacity onPress={handleConfirm} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                       <Text style={{ color: 'white', fontWeight: 'bold' }}>{proceed.label}</Text>
                     </TouchableOpacity>)}
                  {cancel.visible && 
                    (<TouchableOpacity onPress={handleCancel} style={{ backgroundColor: '#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                       <Text style={{ color: 'white', fontWeight: 'bold' }}>{cancel.label}</Text>
                     </TouchableOpacity>)}
                </View>
            </View>
          </View>
      </Modal>
  )
}


export {PromptProvider,usePrompt}