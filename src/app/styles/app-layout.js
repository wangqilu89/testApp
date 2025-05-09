import { StyleSheet,useColorScheme } from 'react-native';
import {Colors} from './app-colors';



export const useThemedStyles = () => {
  
  const colorScheme = useColorScheme();
  const Theme = Colors[colorScheme ?? 'light']
  const defaultTheme = {color:Theme.mooreDefault,backgroundColor:Theme.background}
  const reverseTheme = {color:Theme.mooreReverse,backgroundColor:Theme.backgroundReverse}
  
   
  const CommonItems = StyleSheet.create({
    container:{justifyContent: 'center',width:'100%',height:'100%',padding:20, flex: 1},
    view:{justifyContent: 'center',alignItems: 'center', flex: 1},
    row: {justifyContent: 'center',alignItems: 'center', flexDirection: 'row'},
    text:{ marginTop: 20,color:Theme.text,backgroundColor:'transparent'},
    header:{ fontSize: 24, fontWeight: 'bold',reverseTheme},
    screen: {flex: 1,padding: 16},
    spaced: {marginVertical: 8},
    theme:defaultTheme,
    reverseTheme:reverseTheme
  })

  const Header = StyleSheet.create({
    container:{justifyContent: 'center',alignItems: 'center',padding:5,...reverseTheme},
    text: {justifyContent: 'center',alignItems: 'center', fontSize: 24, fontWeight: 'bold',...reverseTheme}
  
  })
  const CategoryButton = StyleSheet.create({
      container:{...CommonItems.row,...defaultTheme,color:Theme.text,backgroundColor: 'transparent',padding: 20,borderBottomWidth: 1,borderBottomColor: Theme.text,marginTop:2,marginBottom:2},
      text:{...defaultTheme,backgroundColor: 'transparent',fontSize: 18, fontWeight: 'bold', textAlign: 'left' }
  })
  

  


  return {Theme,CommonItems, Header,CategoryButton}
}






