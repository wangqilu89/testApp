import { View, Text, ActivityIndicator,Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import {useThemedStyles} from '@/styles';

const useWebCheck = () => {
  const getPlatformState = () => {return ((Platform.OS === 'web') &&  (Dimensions.get('window').width >= 768))}
  const [isWeb, setIsWeb] = useState(getPlatformState());
  useEffect(() => {
    const updateState = () => {
      setIsWeb(getPlatformState());
    };
    // Listen to window resize events
    const subscription = Dimensions.addEventListener('change', updateState);
    return () => subscription.remove?.(); // Remove listener cleanly
  }, []);
  
  return isWeb;
    
  
}; 
const LoadingScreen = ({txt}:{txt:string}) => {
  const {CommonItems} = useThemedStyles();
  return (
    <View style={[CommonItems.view,CommonItems.container]}>
      <ActivityIndicator size="large" />
      <Text style={CommonItems.text}>{txt}</Text>
    </View>
  )
}

export {
  useWebCheck,
  LoadingScreen
};