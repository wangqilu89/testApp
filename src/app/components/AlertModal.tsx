  import React, { createContext, useContext, useState,ReactNode } from 'react';
  import { View, Text,  TouchableOpacity,ActivityIndicator} from 'react-native';
  import Modal from "react-native-modal";    
  import { Ionicons } from '@expo/vector-icons'; 
  import {useThemedStyles} from '@/styles';

  type AlertProps = {
      // Alert
      alertVisible:boolean,
      alertMessage: string | React.ReactNode,
      HideAlert: () => void,
      ShowAlert:(msg: string | React.ReactNode) => void,
      // Loading
      loadingVisible:boolean,
      loadingMessage : string | React.ReactNode,
      ShowLoading: (msg: string | React.ReactNode) => void,
      HideLoading: () => void,
  }

  const AlertContext = createContext<AlertProps | undefined>(undefined);

  const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      
      // Alert state
      const [alertMessage, setAlertMessage] = useState<string | ReactNode>('');
      const [alertVisible, setAlertVisible] = useState(false);

      // Loading state
      const [loadingMessage, setLoadingMessage] = useState<string | ReactNode>('');
      const [loadingVisible, setLoadingVisible] = useState(false);

      const ShowAlert = (msg: string | React.ReactNode) => {
        setAlertMessage(msg);
        setAlertVisible(true);
      };
    
      const HideAlert = () => {
        setAlertVisible(false);
        setAlertMessage('')
      };
      
      const ShowLoading = (msg: string | React.ReactNode) => {
        setLoadingMessage(msg);
        setLoadingVisible(true);
      };

      const HideLoading = () => {
        setLoadingVisible(false);
        setLoadingMessage('');
      };
     
      return (
        <AlertContext.Provider value={{alertMessage, alertVisible, HideAlert,ShowAlert,loadingMessage,loadingVisible,HideLoading,ShowLoading}}>
          {children}
          <ThrowAlert />
          <Loading />
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

  const ThrowAlert = () => {
      const {alertMessage,alertVisible,HideAlert} = useAlert();
      return (
          <Modal isVisible={alertVisible}  onBackdropPress={HideAlert} onBackButtonPress={HideAlert} >
              <View style={{backgroundColor:'white',flexDirection:'column'}}>
                  <TouchableOpacity onPress={HideAlert} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>           
                  {typeof alertMessage === 'string' ? (
                    <View style={{flexDirection:'column',alignItems:'center'}}>
                          <Ionicons name='alert-circle-outline' style={{fontSize:50,color:'red'}}/>
                          <View style={{marginVertical:20,paddingHorizontal:10}}>
                            <Text style={{ fontSize: 20,textAlign:'center'}}>{alertMessage}</Text>
                          </View>
                      </View>
                  ) : (
                    alertMessage
                  )}
              </View>
          </Modal>
      )
  }

  const Loading = () => {
    const {loadingMessage,loadingVisible} = useAlert();
    const {Header,ReactTag} = useThemedStyles();
    return (
        <Modal backdropColor={'white'} backdropOpacity={0.5} isVisible={loadingVisible}>
            <View style={{backgroundColor:'transparent',flexDirection:'column'}}>
              <ActivityIndicator size="large" />
              {typeof loadingMessage === 'string' ? (
                <Text style={[Header.text,ReactTag.text,{color:'#009FE3'}]}>{loadingMessage}</Text> 
              ):(loadingMessage)}
            </View>
        </Modal>
    )
  }

  export {AlertProvider,useAlert}