import { View, Text, FlatList, TouchableOpacity} from 'react-native';
import { useState, useEffect,useRef } from 'react';
import Modal from "react-native-modal";

type GenericObject = Record<string, any>;

type DropdownMenuProps = {
  visible: boolean;
  handleClose: () => void;
  handleSelect: (item:any) => void;
  items: GenericObject[];
  dropdownWidth?: number;
  trigger:React.ReactNode;
}

const MenuOption = ({onSelect,item}: {onSelect:() => void,item:GenericObject}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const DropdownMenu:React.FC<DropdownMenuProps> =({visible,handleClose,handleSelect,items,trigger,dropdownWidth=150}) => {
  const [position, setPosition] = useState({x: 0, y: 0, width: 0});
  const triggerRef = useRef<View>(null)
  useEffect(() => {
    if (triggerRef.current && visible) {
      
      triggerRef.current.measure((fx, fy, width, height,px,py) => {
        
        setPosition({
          x: px-35,
          y: py-35,
          width: width,
        });
      });
    }
  }, [visible]);
  return (
    <>
      <View ref={triggerRef} style={{position:'relative'}}>
        {trigger}
      </View>
      <Modal style={{margin:0,padding:0}} backdropOpacity={0} backdropColor="transparent" isVisible={visible}  onBackdropPress={handleClose} onBackButtonPress={handleClose}>
        <View style={[{position: 'absolute',backgroundColor: 'white',borderRadius: 5,padding: 10,shadowColor: '#000',shadowOffset: {width: 0, height:2},shadowOpacity: 0.2,shadowRadius: 4,elevation: 4,top: position.y,left: position.x ,width: dropdownWidth}]}>
            <FlatList 
                data={items} 
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