import React, { useState, useRef, useEffect,useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList,ViewStyle,TextStyle,StyleSheet,ActivityIndicator} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import debounce from 'lodash.debounce';
import { useListFilter } from '@/hooks/useListFilter'
import {NoRecords} from '@/services'
import { useListGet } from '@/hooks/useListGet'

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

  LoadObj?:GenericObject|null,
  Defined?: GenericObject[]
  SearchObj?:GenericObject|null
  SearchFunction?:((items: GenericObject[], keyword: string) => GenericObject[]) | null
}

const defaultDropProps = {label:'Select',def:{id:'',name:''},searchable:false,disabled:false,onChange:()=>{},LoadObj:null,Defined:[],SearchObj:null,SearchFunction:null}
const MenuOption = ({onSelect,item}: {onSelect:() => void,item:GenericObject}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const DropdownMenu:React.FC<DropdownMenuProps> = React.memo((options = {}) => {

  //const finalOptions = useMemo(() => ({ ...defaultDropProps, ...options }), [options]);
  const finalOptions = { ...defaultDropProps, ...options };
  const {label,def,disabled,onChange,AddStyle,Defined,searchable,SearchFunction,LoadObj,SearchObj} = finalOptions;
  const [temp, setTemp] = useState(def);
  const [modal, setModal] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0, width: 0});
  
  const triggerRef = useRef<View>(null)
  
  const {list,search,setSearch,loading,UpdateLoad} = useListFilter({LoadObj:LoadObj,LoadModal:false,Defined:Defined, SearchFunction: SearchFunction,SearchObj:SearchObj,Enabled:true})
  
  //const [search,setSearch] = useState('')
  //const {list,loading,UpdateLoad} = useListGet({LoadModal:false,Defined:Defined,LoadObj:LoadObj,Enabled:enabled})

  //Key Functions
  const debouncedFetch = debounce((keyword:string) => {if (keyword.length > 2) {setSearch(keyword)}}, 500);
  
  const handleOpen = () => {
    setModal(true);
  };
  
  const handleClose = () => {
    setModal(false);
  }

  const handleSelect = (item: GenericObject) => {
    setTemp(item);
    onChange?.(item);
    handleClose();
  };

  const ReferenceField = () => (
    <TouchableOpacity ref={triggerRef} disabled={disabled} style={[AddStyle?.StyleInput,{ flex: 1, borderRadius: 5, borderWidth: 1, paddingLeft: 10, marginTop: 10, paddingTop: 5, marginBottom: 10, paddingBottom: 5 }]} onPress={handleOpen}>
      <Text style={[AddStyle?.StyleInput]}>{temp?.name ?? ''}</Text>
    </TouchableOpacity>
  );  

  useEffect(() => {
    if (triggerRef.current && modal) {
      triggerRef.current.measure((fx, fy, width, height,px,py) => {
        setPosition({x: px,y: py+ height,width: width});
        if (!SearchObj && LoadObj) {
          UpdateLoad(LoadObj as GenericObject)
        }
      });

    }
  }, [modal]);
  
  return (
    <>
      <ReferenceField />
      <Modal animationIn="fadeIn" animationOut="fadeOut" style={{margin:0,padding:0}} backdropOpacity={0} backdropColor="transparent" isVisible={modal}  onBackdropPress={handleClose} onBackButtonPress={handleClose}>
        <View style={[{position: 'absolute',backgroundColor: 'white',borderRadius: 5,padding: 10,elevation: 4,top: position.y,left: position.x ,width: position.width}]}>
        {searchable && (<TextInput placeholder={"Search " + label} defaultValue={temp.name} onChangeText={debouncedFetch}  style={{borderRadius:5,borderWidth:1,marginLeft:10,marginRight:10,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}}/>)}
        {loading ? (
          <ActivityIndicator size="small" style={{ margin: 10,justifyContent:'center'}} />
        ):(list.length === 0?
            (<View style={{width:'100%',paddingBottom: 0,backgroundColor:'transparent',flex:1,height:'auto'}}>
              <Text style={{textAlign: 'center',color:'black',fontSize: 14, fontWeight: 'bold'}}>No records found.</Text>
              </View>):
            (<FlatList 
                data={list} 
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <MenuOption onSelect={() => {handleSelect(item)}} item={item} />      
                )}
              />
            ))}
        </View>
      </Modal>
      
    </>
  )
})

export {defaultDropProps,DropdownMenu}