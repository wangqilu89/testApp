import { ScrollView,View, Text, TextInput,TouchableOpacity,ViewStyle,TextStyle,StyleSheet} from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import { Ionicons } from '@expo/vector-icons'; 
import Modal from "react-native-modal";
import { useState,useMemo,useEffect,useCallback} from 'react';
import {defaultDropProps,DropdownMenu } from '@/components/DropdownMenu';
import { AttachmentField} from '@/services'; 
import {useThemedStyles} from '@/styles';
import debounce from 'lodash.debounce';
import isEqual from 'lodash/isEqual';

import { KeyStyles,GenericObject,DropdownMenuProps} from '@/types';

const addOpacity = (hex: string, opacity: number) => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex + alpha;
};


const FormContainer = ({children,AddStyle}:{children: React.ReactNode,AddStyle?:KeyStyles}) => {
    const {Form} = useThemedStyles();
    return (
        <ScrollView style={[Form.container,AddStyle?.StyleContainer]} contentContainerStyle={{flex:1,alignItems: 'flex-start',maxWidth:600}}>{children}</ScrollView>
    )
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
    
    
    const HandleChange = (selected:GenericObject,addFunction?:(item: any) => void) => {
        const updated = { ...temp, ...selected };
        if (!isEqual(updated,temp)) {
           addFunction?.(updated)
        }
        setTemp(updated)
    }

    const CloseDate = (item:any) => {
        onChange?.(item);
        setShowDate(false);
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
                        <DateTimePicker timeZone="UTC"  styles={DateStyles} components={Components} mode="single" date={def.date} onChange={(s) => {HandleChange(s,CloseDate)}}/>
                     </View>):
                    (<View style={{flexDirection:'column'}}>
                        <View style={{borderRadius:10,borderWidth:1,borderColor:Theme.background,marginHorizontal:8,marginBottom:8}}>
                          <DateTimePicker timeZone="UTC" styles={DateStyles} components={Components} mode="range" startDate={temp.startDate} endDate={temp.endDate} onChange={(s) => {HandleChange(s)}}/>
                        </View>
                        <View style={{flex:1,marginHorizontal:8,alignItems:'center',flexDirection:'row'}}>
                            <View style={{flex:1,alignItems:'center',flexDirection:'column'}}>
                                <View style={{marginHorizontal:15,borderBottomWidth:1,alignSelf:'stretch',alignItems:'center'}}>
                                    <Text style={{fontWeight:'bold',fontSize:15}}>Start Date</Text>
                                </View>
                                <Text>{temp.startDate?.toISOString().split('T')[0]??''}</Text>
                            </View>
                            <View style={{flex:-1,alignItems:'center',flexDirection:'column'}}>
                                <Text>&nbsp;</Text>
                                <Text>-</Text>
                            </View>
                            <View style={{flex:1,alignItems:'center',flexDirection:'column'}}>
                                <View style={{marginHorizontal:15,borderBottomWidth:1,alignSelf:'stretch',alignItems:'center'}}>
                                    <Text style={{fontWeight:'bold',fontSize:15}}>End Date</Text>
                                </View>
                                <Text>{temp.endDate?.toISOString().split('T')[0]??''}</Text>
                            </View>
                            
                        </View>
                        <FormSubmit label="Ok" onPress={() => {CloseDate(temp)}}/>
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

const FormAutoComplete:React.FC<DropdownMenuProps> = (options = {}) => {
    const finalOptions = useMemo(() => ({ ...defaultDropProps, ...options }), [options]);
    
    const {label,def,disabled,AddStyle,Defined,searchable,SearchFunction,LoadObj,SearchObj} = finalOptions;
    const [loadObj,setLoadObj] = useState(LoadObj)
    const onChange = useCallback((item:any) => finalOptions.onChange(item), [finalOptions.onChange]);

    useEffect(() => {
        setLoadObj(LoadObj)
      },[LoadObj])

    return (
        <FormCommon label={label} AddStyle={AddStyle}>
            <DropdownMenu label={label} def={def} searchable={searchable} disabled={disabled} onChange={onChange} AddStyle={AddStyle} LoadObj={loadObj} Defined={Defined} SearchObj={SearchObj} SearchFunction={SearchFunction}/>
        </FormCommon>
    )
}


export {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormCommon,FormAutoComplete,FormAttachFile};






