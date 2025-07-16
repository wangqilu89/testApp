  import { View,TextInput} from 'react-native';
  import { useState, useEffect,useMemo,useRef} from 'react';
  import { Ionicons } from '@expo/vector-icons'; 
  import {ThemedStyles} from '@/styles';
  import { KeyStyles} from '@/types';
  import debounce from 'lodash.debounce';

  
  export const SearchField = ({placeholder,def,onChange=()=>{},AddStyle,onFocus=false,scheme}:{placeholder?:string,def?:string,onChange?:(item: string) => void,AddStyle?:KeyStyles,onFocus?:boolean,scheme:'light'|'dark'|undefined}) => {
    const {Theme} = ThemedStyles(scheme??'light')
    const [temp,setTemp] = useState(def);
    const inputRef = useRef<TextInput>(null);
    const DebouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
    const HandleChange = (text:string) => {
        setTemp(text);
        DebouncedOnChange(text)
    };
    useEffect(() => {
        if (onFocus) {
          const Focus = setTimeout(() => {  
            inputRef.current?.focus();
          }, 300);
          return () => clearTimeout(Focus);
        }
      }, [onFocus]);
  
    return (
      <View style={[{height:'auto',flex:1,borderWidth: 1, padding: 8, margin: 10,borderRadius: 20,flexDirection:'row',justifyContent:'space-between',backgroundColor:'transparent',borderColor:Theme.text},AddStyle?.StyleContainer]}>
        <View style={{width:30}}><Ionicons name="search" style={[AddStyle?.StyleLabel]} color={Theme.text} size={20} /></View>
        <TextInput ref={inputRef} defaultValue={temp} onChangeText={HandleChange} placeholder={placeholder?placeholder:"Search..."} style={[{flex:1,color:Theme.text},AddStyle?.StyleInput]}/>
      </View>
    )
  }