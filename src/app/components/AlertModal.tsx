import React, { createContext, useContext, useState,ReactNode,useRef,useEffect} from 'react';
import {View, Text,  TouchableOpacity,ActivityIndicator,TextInput} from 'react-native';
import Modal from "react-native-modal";    
import { Ionicons } from '@expo/vector-icons'; 
import { GenericObject,PromptContextType,PromptProps,PromptConfig } from '@/types';

const PromptContext = createContext<PromptContextType | undefined>(undefined);

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
        <Prompt msg={msg} icon={icon} input={input} ok={proceed} cancel={cancel} visible={visibility} onClose={HidePrompt} container={thematic}  />
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

const Prompt = ({msg,icon,input,ok,cancel,visible,onClose,container}:PromptProps) => {
  
  const [keyed,setKeyed] = useState('')

  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {  
    onClose({ confirmed: true, value: keyed });
  };
  const handleCancel = () => {  
    if (cancel.visible) {
      onClose({ confirmed: false, value: keyed  })
    }
  };

  useEffect(() => {
    if (visible && input.visible) {
      const Focus = setTimeout(() => {  
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(Focus);
    }
    if (!visible) {
      setKeyed('')
    }
  }, [visible]);

  return (
      <Modal backdropColor={container.backdropColor} backdropOpacity={container.backdropOpacity} isVisible={visible}  onBackdropPress={handleCancel} onBackButtonPress={handleCancel} >
          <View style={{backgroundColor:container.containerColor,flexDirection:'column',maxHeight:"85%"}}>
            <TouchableOpacity disabled={!cancel.visible} onPress={handleCancel} style={{alignItems:'flex-end'}}>
              <Ionicons name='close-outline' style={[{fontSize:30},{color:cancel.visible?'red':container.containerColor}]}/>
            </TouchableOpacity>
            <View style={{flexDirection:'column',alignItems:'center',flex:1}}>
               {icon.visible && (
                  typeof icon.label === 'string'?
                  (<Ionicons name={icon.label as any} style={{fontSize:50,color:'red'}}/>):
                  (icon.label)
                )}
                {typeof msg === 'string' ? (
                  <View style={{marginVertical:20,paddingHorizontal:10}}>
                     <Text style={{ fontSize: 20,textAlign:'center'}}>{msg}</Text>
                  </View>
                ):(
                  msg
                )}
                {input.visible && (
                  <View style={{alignSelf:'stretch',flex:1,margin:10,borderRadius:5,borderWidth:1}}>
                    <TextInput ref={inputRef} keyboardType="default" placeholder={input.label} value={keyed} onChangeText={setKeyed} style={[{color:'black',height:25,textAlign: 'left',paddingHorizontal:10,marginVertical:5,fontSize: 16}]}/>
                  </View>
                )}    
                <View style={{flexDirection:'row',justifyContent:'space-around',width:'100%'}}>
                  {ok.visible && 
                    (<TouchableOpacity onPress={handleConfirm} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                       <Text style={{ color: 'white', fontWeight: 'bold' }}>{ok.label}</Text>
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
};


export {PromptProvider,usePrompt}