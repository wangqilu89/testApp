import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList,ViewStyle,TextStyle,StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import debounce from 'lodash.debounce';

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
  items?: GenericObject[],
  loadList?: (query: string) => Promise<GenericObject[]>,
  AddStyle?: KeyStyles,
  searchThreshold?: number
}

const MenuOption = ({onSelect,item}: {onSelect:() => void,item:GenericObject}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const DropdownMenu:React.FC<DropdownMenuProps> = ({label = 'Select',def = { id: '', name: '' },searchable=false,disabled = false,onChange = () => {},items = [],loadList,AddStyle,searchThreshold = 2}) => {
  const [modal, setModal] = useState(false);
  const [temp, setTemp] = useState(def);
  const [result, setResult] = useState<GenericObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState({x: 0, y: 0, width: 0});
  const triggerRef = useRef<View>(null)

  const fetchDropdown = async (q: string) => {
    if (q.length < searchThreshold) {
      setResult([]);
      return;
    }
    if (items.length > 0) {
      const filtered = items.filter(item => item.name?.toLowerCase().includes(q.toLowerCase()));
      setResult(filtered);
      return;
    }
    if (loadList) {
      try {
        setLoading(true);
        const data = await loadList(q);
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const debouncedFetch = debounce(fetchDropdown, 500);

  const handleClose = () => {
    setModal(false)
  }
  const handleSelect = (item: GenericObject) => {
    setTemp(item);
    onChange?.(item);
    setResult([]);
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
        setPosition({x: px,y: py+ height - 5,width: width});
      });
    }
  }, [modal]);
  return (
    <>
      <TextField />
      <Modal style={{margin:0,padding:0}} backdropOpacity={0} backdropColor="transparent" isVisible={modal}  onBackdropPress={handleClose} onBackButtonPress={handleClose}>
        {searchable ?
        (<>
        </>

        ):
        (<View style={[{position: 'absolute',backgroundColor: 'white',borderRadius: 5,padding: 10,shadowColor: '#000',shadowOffset: {width: 0, height:2},shadowOpacity: 0.2,shadowRadius: 4,elevation: 4,top: position.y,left: position.x ,width: position.width}]}>
            <FlatList 
                data={items} 
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <MenuOption onSelect={() => {handleSelect(item)}} item={item} />      
                )}
              />
        </View>)}
      </Modal>
      
    </>
  )
}

export {DropdownMenu}