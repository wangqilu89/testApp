import React, { useState, useRef, useEffect,useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList,ViewStyle,TextStyle,StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import debounce from 'lodash.debounce';
import { usePagedList } from '@/hooks/usePagedList'

type GenericObject = Record<string, any>;
type KeyStyles = {
  StyleContainer?:TextStyle & ViewStyle,
  StyleRow?:ViewStyle,
  StyleLabel?:TextStyle,
  StyleInput?:TextStyle & ViewStyle
}

type DropdownMenuProps = {
  label?: string,
  def?: GenericObject,
  searchable?:boolean,
  disabled?: boolean,
  onChange?: (item: GenericObject) => void,
  AddStyle?: KeyStyles,
  searchThreshold?: number,
  loadList?: (query: string) => Promise<GenericObject[]>

  pageSize?:number,
  loadObj?:GenericObject,
  items?: GenericObject[]
}

const defaultOptions = {label:'Select',def:{id:'',name:''},searchable:false,disabled:false,onChange:()=>{},searchThreshold:2,pageSize:1,items:[],loadObj:{}}
const MenuOption = ({onSelect,item}: {onSelect:() => void,item:GenericObject}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const DropdownMenu:React.FC<DropdownMenuProps> = (options = {}) => {
  const finalOptions = { ...defaultOptions, ...options };

  const {label,def,searchable,disabled,onChange,AddStyle,searchThreshold,loadList,loadObj,pageSize,items} = finalOptions;
  const [modal, setModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [temp, setTemp] = useState(def);
  const baseLoadObj = useMemo(() => ({ ...loadObj }), [loadObj]);

  const LoadObj = useMemo(() => ({
    ...baseLoadObj,
    data: { keyword: keyword }
  }), [keyword]);
  
  const { list } = usePagedList({loadObj:LoadObj,withLoading:false,items:items,searchFunction: (items, keyword) => {return items.filter(item => item.name?.toLowerCase().includes(keyword.toLowerCase()))}})
  
  const [loading, setLoading] = useState(false);

  const [position, setPosition] = useState({x: 0, y: 0, width: 0});
  const triggerRef = useRef<View>(null)

  const debouncedFetch = debounce(setKeyword, 500);

  const handleClose = () => {
    setModal(false)
  }
  const handleSelect = (item: GenericObject) => {
    setTemp(item);
    onChange?.(item);
    handleClose();
  };

  const TextField = () => (
    <TouchableOpacity ref={triggerRef} disabled={disabled} style={[AddStyle?.StyleInput,{ flex: 1, borderRadius: 5, borderWidth: 1, paddingLeft: 10, marginTop: 10, paddingTop: 5, marginBottom: 10, paddingBottom: 5 }]} onPress={() => setModal(true)}>
      <Text style={[AddStyle?.StyleInput]}>{temp?.name ?? ''}</Text>
    </TouchableOpacity>
  );  
  useEffect(() => {
    if (triggerRef.current && modal) {
      
      triggerRef.current.measure((fx, fy, width, height,px,py) => {
        setPosition({x: px,y: py+ height,width: width});
      });
    }
  }, [modal]);
  return (
    <>
      <TextField />
      <Modal style={{margin:0,padding:0}} backdropOpacity={0} backdropColor="transparent" isVisible={modal}  onBackdropPress={handleClose} onBackButtonPress={handleClose}>
        <View style={[{position: 'absolute',backgroundColor: 'white',borderRadius: 5,padding: 10,shadowColor: '#000',shadowOffset: {width: 0, height:2},shadowOpacity: 0.2,shadowRadius: 4,elevation: 4,top: position.y,left: position.x ,width: position.width}]}>
        {searchable && (<TextInput placeholder={"Search " + label} defaultValue={temp.name} onChangeText={debouncedFetch}   style={{borderRadius:5,borderWidth:1,marginLeft:10,marginRight:10,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}}/>)}
        
        <FlatList 
                data={list} 
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <MenuOption onSelect={() => {handleSelect(item)}} item={item} />      
                )}
              />
      
        </View>
      </Modal>
      
    </>
  )
}

export {DropdownMenu}