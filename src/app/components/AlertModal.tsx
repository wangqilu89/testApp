  import React, { createContext, useContext, useState,ReactNode } from 'react';
  import { View, Text,  TouchableOpacity,ActivityIndicator,TextInput} from 'react-native';
  import Modal from "react-native-modal";    
  import { Ionicons } from '@expo/vector-icons'; 
  import {useThemedStyles} from '@/styles';
  
  type GenericObject = Record<string, any>;
  type AlertProps = {
      // Alert
      ShowPrompt: ({msg,icon,input,ok,cancel}:{msg: string | React.ReactNode,icon?:GenericObject,input?:GenericObject,ok?:GenericObject,cancel?:GenericObject}) => void,
      HidePrompt: () => void,
      promptVisible:boolean,
      
      // Loading
      ShowLoading: (msg: string | React.ReactNode) => void,
      HideLoading: () => void,
      loadingVisible:boolean
  }

  type ModalProps = {
    message:string| ReactNode,
    visible:boolean,
    close?:() => void
    callback?:(value: string) => void
  }
  type PromptProps = {
    message:string| ReactNode,
    icon:GenericObject,
    input:GenericObject,
    proceed:GenericObject,
    cancel:GenericObject,
    visible:boolean,
    close?:() => void
  }
  

  const AlertContext = createContext<AlertProps | undefined>(undefined);

  const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      
      //New Prompt
      const [msg,setMsg] = useState<string | ReactNode>('');
      const [icon,setIcon] = useState<GenericObject>({});
      const [input,setInput] = useState<GenericObject>({});
      const [proceed,setProceed] = useState<GenericObject>({});
      const [cancel,setCancel] = useState<GenericObject>({});
      const [promptVisible, setPromptVisible] = useState(false);


      // Loading state
      const [loadingMessage, setLoadingMessage] = useState<string | ReactNode>('');
      const [loadingVisible, setLoadingVisible] = useState(false);


      const ShowPrompt = ({msg,icon,input,ok,cancel}:{msg: string | React.ReactNode,icon?:GenericObject,input?:GenericObject,ok?:GenericObject,cancel?:GenericObject}) => {
        const defaultIcon = { visible: true, label: 'alert-circle-outline' };
        const defaultInput = { visible: false, label: 'Input Here' };
        const defaultOk = { visible: true, label: 'OK', callback: (value:string) => {return value??'ok'} };
        const defaultCancel = { visible: true, label: 'Cancel', callback: () => {return 'Cancel'} };
        
        setMsg(msg);
        setIcon({...defaultIcon,...(icon??{})});
        setInput({...defaultInput,...(input??{})});
        setProceed({...defaultOk,...(ok??{})});
        setCancel({...defaultCancel,...(cancel??{})});
        setPromptVisible(true)
      }

      const HidePrompt = () => {
        setMsg('');
        setIcon({});
        setInput({});
        setProceed({});
        setCancel({});
        setPromptVisible(false)
      }

      const ShowLoading = (msg: string | React.ReactNode) => {
        setLoadingMessage(msg);
        setLoadingVisible(true);
      };

      const HideLoading = () => {
        setLoadingVisible(false);
        setLoadingMessage('');
      };
      

      return (
        <AlertContext.Provider value={{ShowPrompt,HidePrompt,promptVisible,HideLoading,ShowLoading,loadingVisible}}>
          {children}
          <NewPrompt message={msg} icon={icon} input={input} proceed={proceed} cancel={cancel} visible={promptVisible} close={HidePrompt}/>
  
          <Loading message={loadingMessage} visible={loadingVisible}/>
        </AlertContext.Provider>
      );
  };

  const useAlert = () => {
      const context = useContext(AlertContext);
      if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
      }
      return context;
  };

  const NewPrompt = ({message,icon,input,proceed,cancel,visible,close}:PromptProps) => {
    const [keyed,setKeyed] = useState('')

    const handleConfirm = () => {  
      proceed.callback(keyed);  // Pass value back
      close!();
    };
    const handleCancel = () => {  
      cancel.callback();  // Pass value back
      close!();
    };
    return (
        <Modal isVisible={visible}  onBackdropPress={handleCancel} onBackButtonPress={handleCancel} >
            <View style={{backgroundColor:'white',flexDirection:'column'}}>
                <TouchableOpacity onPress={handleCancel} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>           
                {typeof message === 'string' ? (
                  <View style={{flexDirection:'column',alignItems:'center'}}>
                    {icon.visible && (<Ionicons name={icon.label} style={{fontSize:50,color:'red'}}/>)}
                    <View style={{marginVertical:20,paddingHorizontal:10}}>
                      <Text style={{ fontSize: 20,textAlign:'center'}}>{message}</Text>
                    </View>
                    {input.visible && (<TextInput keyboardType="default" placeholder={input.label} value={keyed} onChangeText={setKeyed} style={[{flex:1,color:'black',textAlign: 'left',fontSize: 16,padding:0,height:20,borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>)}    
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
                ) : (
                  message
                )}
            </View>
        </Modal>
    )
  }

  const Loading = ({message,visible}:ModalProps) => {
    const {Header,ReactTag} = useThemedStyles();
    return (
        <Modal backdropColor={'white'} backdropOpacity={0.5} isVisible={visible}>
            <View style={{backgroundColor:'transparent',flexDirection:'column'}}>
              <ActivityIndicator size="large" />
              {typeof message === 'string' ? (
                <Text style={[Header.text,ReactTag.text,{color:'#009FE3'}]}>{message}</Text> 
              ):(message)}
            </View>
        </Modal>
    )
  }

  export {AlertProvider,useAlert}