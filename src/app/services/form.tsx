import { ScrollView,View, Text, TextInput,ActivityIndicator,Platform, Dimensions, FlatList,Button, TouchableOpacity,ViewStyle,TextStyle,StyleSheet} from 'react-native';

import DateTimePicker from 'react-native-ui-datepicker';
import { Ionicons } from '@expo/vector-icons'; 
import Modal from "react-native-modal";


import { useRouter,Slot} from 'expo-router';
import { useState,useMemo,useEffect} from 'react';

import { WebView } from 'react-native-webview';
import Autocomplete from 'react-native-autocomplete-input';
import { AttachmentField} from '@/services'; 
import {useThemedStyles} from '@/styles';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';

import { GestureDetectorBridge } from 'react-native-screens';

type KeyStyles = {
    StyleContainer?:TextStyle & ViewStyle,
    StyleRow?:ViewStyle,
    StyleLabel?:TextStyle,
    StyleInput?:TextStyle & ViewStyle
}
type GenericObject = Record<string, any>;

const FormContainer = ({children,AddStyle}:{children: React.ReactNode,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    return (
        <ScrollView style={[Form.container,AddStyle?.StyleContainer]} contentContainerStyle={{flex:1,alignItems: 'flex-start',maxWidth:600}}>{children}</ScrollView>
    )

};

const addOpacity = (hex: string, opacity: number) => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex + alpha;
};
const FormRow = ({styles,children}:{styles?: ViewStyle,children: React.ReactNode }) => {
    const {Form} = useThemedStyles();
    return (
        <View style={[Form.rowContainer,styles]}>{children}</View>
    )
}
const FormLabel = ({label,styles}:{label?:string,styles?:TextStyle}) => {
    const {Form} = useThemedStyles();
    return (
        <Text style={[Form.label,styles,{paddingTop:15,paddingBottom:15}]}>{label}</Text>
    )
}
const FormCommon = ({label,children,AddStyle}:{label?:string,children?:React.ReactNode,AddStyle?:KeyStyles}) => {
    return (
        <FormRow styles={AddStyle?.StyleRow}>
            <FormLabel label={label} styles={AddStyle?.StyleLabel}/>
            {children}
        </FormRow>
    )
}
const FormTextInput = ({label,def,disabled=false,onChange = () => {},AddStyle}:{label?:string,disabled?:boolean,def?:string,onChange?: (item: string) => void,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    const [temp,setTemp] = useState(def);
    const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
    const handleChange = (text:string) => {
        setTemp(text);
        debouncedOnChange(text)
    };
    
    return (
        <FormCommon label={label} AddStyle={AddStyle}>
            <View style={{height:'100%',flex:1}}>
            <TextInput editable={!disabled}  keyboardType="default" onChangeText={handleChange} value={temp} style={[Form.input,AddStyle?.StyleInput,{borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>
            </View>
        </FormCommon>
    )
}

const FormAttachFile = ({label,def,disabled=false,onChange = () => {},AddStyle}:{label?:string,def?:{uri: string,name: string,type: string},disabled?:boolean,onChange?: (item: any) => void,AddStyle?:KeyStyles}) => {
    
    return (
        <FormCommon label={label} AddStyle={AddStyle}>
            <AttachmentField disabled={disabled} defaultValue={def} onChange={onChange} style={AddStyle?.StyleInput}/>
        </FormCommon>
        
    )
}
const FormNumericInput = ({label,def,disabled = false,onChange = () => {},AddStyle}:{label?:string,def?:string,disabled?:boolean,onChange?: (item: string) => void,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    const [temp,setTemp] = useState(def)
    const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
    
    const handleChange = (text:string) => {
        // Allow only numbers
        const numericValue = text.replace(/[^0-9.]/g, "");
        setTemp(numericValue);
        debouncedOnChange(numericValue);
        
    };
    return (
        <FormCommon label={label} AddStyle={AddStyle}>
            <View style={{height:'100%',flex:1}}>
            <TextInput editable={!disabled} selectTextOnFocus={!disabled} inputMode="decimal" value={temp} onChangeText={handleChange} style={[Form.input,AddStyle?.StyleInput,{borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>
            </View>
        </FormCommon>
    )
}

const FormDateInput = ({label = 'Date',def={date:new Date(),startDate:new Date(),endDate:new Date()},mode="single",disabled = false,onChange = () => {},AddStyle}:{label?:string,def?:GenericObject,mode?:"single"|"range"|"multiple",disabled?:boolean,onChange?: (item: any) => void,AddStyle?:KeyStyles}) => {

    const {Form} = useThemedStyles();
    const [showDate, setShowDate] = useState(false);
    const [temp,setTemp] = useState<GenericObject>({})
    const {Theme} = useThemedStyles();
    
    
    const HandleChange = (selected:GenericObject) => {
        setTemp((prev) => {
            const updated = { ...prev, ...selected };
            if (isEqual(prev, updated)) {
                return prev;
            }
            onChange?.(updated);
            setShowDate(false);
            return updated;
        });
        
    }

    const Components = {
        IconNext:<Ionicons name='chevron-forward' style={{fontSize:30,color:Theme.background}}/>,
        IconPrev:<Ionicons name='chevron-back' style={{fontSize:30,color:Theme.background}}/>
    }
    const DateStyles = StyleSheet.create({
        
        selected: {backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_start:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_end:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_middle:{backgroundColor:addOpacity(Theme.mooreReverse,0.2)},
        
        month_selector_label:{fontSize:20,color:Theme.background},
        year_selector_label:{fontSize:20,color:Theme.background},
        weekday:{borderBottomWidth:1,borderColor:Theme.mooreReverse},
        weekday_label:{fontWeight:'bold',color:Theme.background}
    })

    useEffect(() => {
        setTemp((prev) => {
            
            return {...prev,...def}
        })
    },[def])

    return (
        <FormCommon label={label} AddStyle={AddStyle}>
            <TouchableOpacity disabled={disabled} style={[AddStyle?.StyleInput,{flex:1,borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]} onPress={() => setShowDate(true)} >
                 <Text style={[Form.input,AddStyle?.StyleInput]}>{temp.date?.toISOString().split('T')[0]??''}</Text>
            </TouchableOpacity>
            <Modal isVisible={showDate} >
                <View style={{backgroundColor:'white',flexDirection:'column'}}>
                    <TouchableOpacity onPress={() => setShowDate(false)} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>
                    
                    {mode === "single" ?
                    (<View style={{borderRadius:10,borderWidth:1,borderColor:Theme.background,marginHorizontal:8,marginBottom:8}}>
                        <DateTimePicker timeZone="UTC"  styles={DateStyles} components={Components} mode="single" date={def.date} onChange={(s) => {HandleChange(s)}}/>
                     </View>):
                    (<View style={{flexDirection:'column'}}>
                        <View style={{borderRadius:10,borderWidth:1,borderColor:Theme.background,marginHorizontal:8,marginBottom:8}}>
                          <DateTimePicker timeZone="UTC" styles={DateStyles} components={Components} mode="range" startDate={temp.startDate} endDate={temp.endDate} onChange={(s) => {setTemp((prev) => {return {...prev,...s}});}}/>
                        </View>
                        <View style={{flex:1,marginHorizontal:8,alignItems:'center'}}>
                            <Text style={{}}>{(temp.startDate?.toISOString().split('T')[0]??'') + ' - ' + (temp.endDate?.toISOString().split('T')[0]??'')}</Text>
                        </View>
                        <FormSubmit onPress={() => {onChange?.(temp);setShowDate(false);}}/>
                     </View>
                    )
                    }
                    
                </View>
            </Modal>
        </FormCommon>
    )
}
const FormSubmit = ({label = 'Submit',onPress = () => {},AddStyle}:{label?:string,onPress?: (item: any) => void,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    return (
        <FormRow styles={{justifyContent:'center',...AddStyle?.StyleRow}}>
            <View style={{paddingTop:15,paddingBottom:15}}>
            <Text style={[Form.button,AddStyle?.StyleInput]} onPress={onPress}>{label}</Text>
            </View>
        </FormRow>

    )
}

const FormAutoComplete = ({label = 'Select',def={id:'',name:''},disabled=false,onChange = () => {},items = [],loadList,AddStyle}:{label?:string,def?:GenericObject,disabled?:boolean,onChange?: (item: any) => void,items?:GenericObject[],loadList?: (item: any) => Promise<GenericObject[]>,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    const [modal, setModal] = useState(false);
    const [temp,setTemp] = useState(def);
    const [result,setResult] = useState<GenericObject[]>([]);
    const loadDropdown = async (q: string) => {
        if (q.length < 2) {
          setResult([]);
          return;
        }
        if (items?.length) {
            setResult(items.filter(items => items.name?.toLowerCase().includes(q.toLowerCase())));
            return;
        }
        if (loadList) {
            try {
                const data = await loadList(q);
                setResult(data);
            } catch (err) {
             console.error(err);
            } 

        }
    };

    return (
        <FormCommon label={label} AddStyle={AddStyle}>

            <TouchableOpacity disabled={disabled} style={[AddStyle?.StyleInput,{flex:1,borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]} onPress={() => setModal(true)} >
                <Text style={[Form.input,AddStyle?.StyleInput]}>{temp.name}</Text>
            </TouchableOpacity>
            <Modal isVisible={modal} >
                <View style={{backgroundColor:'white',flexDirection:'column'}}>
                    <TouchableOpacity onPress={() => setModal(false)} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>
                    
                    <TextInput placeholder={"Search " + label} defaultValue={temp.name} onChangeText={debounce(loadDropdown,500)}   style={{borderRadius:5,borderWidth:1,marginLeft:10,marginRight:10,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}}/>
                    {result.length > 0 && (
                        <FlatList
                        data={result}
                        keyExtractor={(item, index) => index.toString()}
                        
                        renderItem={({ item }) => (
                            <TouchableOpacity style={{paddingLeft:10,borderBottomWidth:1}} onPress={() => {setTemp(item);onChange?.(item);setResult([]);setModal(false)}}>
                                <Text style={{ padding: 8 }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        />
                    )}

                </View>
            </Modal>
        </FormCommon>
    )
}


export {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormCommon,FormAutoComplete,FormAttachFile};






