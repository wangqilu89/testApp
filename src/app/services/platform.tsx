import { Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

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


  export {
    useWebCheck
  };