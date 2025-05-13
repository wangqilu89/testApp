import { useColorScheme,StyleSheet,ViewStyle,TextStyle } from 'react-native';
import {Colors} from './app-colors';



export const useThemedStyles = () => {
  
  const colorScheme = useColorScheme();
  const Theme = Colors[colorScheme ?? 'light']
 
  const Align = StyleSheet.create({
    horizontalCenter:{justifyContent: 'center'},
    verticalCenter:{alignItems: 'center'},
    horizontalLeft:{justifyContent: 'flex-start'},
    verticalLeft:{alignItems: 'flex-start'},
  })
  
  
  /*
  const CommonItems = StyleSheet.create({
    view:{justifyContent: 'center',alignItems: 'center', flex: 1},
    row: {justifyContent: 'center',alignItems: 'center', flexDirection: 'row'},
    text:{ marginTop: 20,color:Theme.text,backgroundColor:'transparent'},
    spaced: {marginVertical: 8},
    theme:defaultTheme,
    reverseTheme:reverseTheme
  })
  */

  const ReactTag = StyleSheet.create({
    text:{marginTop: 20,color:Theme.text,backgroundColor:'transparent'},
    view:{...Align.horizontalCenter, flex: 1}
  })
  const Page = StyleSheet.create({
    container:{width:'100%',height:'100%',backgroundColor:Theme.pageBackground,...Align.horizontalCenter,...Align.verticalCenter},
    listContainer:{width:'100%'}
  })
  const Header = StyleSheet.create({
    container:{width:'100%',backgroundColor:Theme.background,padding:5,...Align.horizontalCenter},
    text: {textAlign: 'center',color:Theme.textReverse,fontSize: 24, fontWeight: 'bold'},
    textReverse: {textAlign: 'center',color:Theme.text,fontSize: 24, fontWeight: 'bold'}
  })
  const CategoryButton = StyleSheet.create({
      container:{flexDirection: 'row',color:Theme.text,backgroundColor: 'transparent',padding: 20,borderBottomWidth: 1,borderBottomColor: Theme.text,marginTop:2,marginBottom:2},
      text:{...Align.horizontalLeft ,textAlign: 'left',color:Theme.mooreReverse,backgroundColor: 'transparent',fontSize: 18, fontWeight: 'bold' },
      icon:{...Align.horizontalLeft ,textAlign: 'left',color:Theme.mooreReverse,backgroundColor: 'transparent',fontSize: 24, fontWeight: 'bold'}
  })
  

  


  return {Theme,ReactTag,Page, Header,CategoryButton}
}






