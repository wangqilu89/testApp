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
    horizontalRight:{justifyContent: 'flex-end'},
    verticalRight:{alignItems: 'flex-end'},
  })
  
  
  const ReactTag = StyleSheet.create({
    text:{marginTop: 20,color:Theme.text,backgroundColor:'transparent'},
    view:{...Align.horizontalCenter, flex: 1}
  })
  const Page = StyleSheet.create({
    container:{width:'100%',height:'100%',paddingBottom: 60,backgroundColor:Theme.pageBackground,...Align.horizontalCenter,...Align.verticalCenter},
    listContainer:{width:'100%'}
  })
  const Header = StyleSheet.create({
    container:{width:'100%',backgroundColor:Theme.background,padding:5,...Align.horizontalCenter},
    view: {...Align.verticalCenter,color:Theme.textReverse,fontSize: 24, fontWeight: 'bold'},
    text: {textAlign: 'center',color:Theme.textReverse,fontSize: 24, fontWeight: 'bold'},
    textReverse: {textAlign: 'center',color:Theme.text,fontSize: 24, fontWeight: 'bold'}
  })
  const CategoryButton = StyleSheet.create({
      container:{flexDirection: 'row',color:Theme.text,backgroundColor: 'transparent',padding: 20,borderBottomWidth: 1,borderBottomColor: Theme.text,marginTop:2,marginBottom:2},
      text:{...Align.horizontalLeft ,textAlign: 'left',color:Theme.mooreReverse,backgroundColor: 'transparent',fontSize: 18, fontWeight: 'bold' },
      icon:{...Align.horizontalLeft ,textAlign: 'left',color:Theme.mooreReverse,backgroundColor: 'transparent',fontSize: 24, fontWeight: 'bold'}
  })

  const Listing = StyleSheet.create({
    container:{flexDirection: 'row',padding: 15,borderBottomWidth: 1,borderBottomColor: Theme.text},
    text:{...Align.horizontalLeft ,textAlign: 'left',color:Theme.text,backgroundColor: 'transparent',fontSize: 14,flex:1},
    number:{...Align.horizontalRight ,textAlign: 'right',color:Theme.text,backgroundColor: 'transparent',fontSize: 14,flex:1}
  
  })
  const ListHeader = StyleSheet.create({
    container:{...Header.container,flexDirection: 'row',paddingVertical: 10,display:'flex'},
    text:{...Header.text,textAlign: 'center',backgroundColor: 'transparent',fontSize: 14, fontWeight: 'bold',flex:1}

  
  })
  const Form = StyleSheet.create({
    container:{flex:1,paddingLeft:15,paddingRight:15,width:'100%'},
    rowContainer:{flexDirection: 'row',width:'100%',backgroundColor: 'transparent',marginLeft:5,marginRight:20},
    label:{width:150,color:Theme.text,textAlign: 'left',fontSize: 16, fontWeight: 'bold',...Align.horizontalLeft},
    input:{flex:1,color:Theme.text,textAlign: 'left',fontSize: 16,padding:0,height:20},
    button:{backgroundColor:Theme.backgroundReverse,fontSize:16,paddingTop:7,paddingBottom:7,paddingLeft:20,paddingRight:20,fontWeight:'bold',borderRadius:10,color:Theme.textReverse}
  })

  return {Theme,ReactTag,Page, Header,CategoryButton,Listing,Form,ListHeader}
}






