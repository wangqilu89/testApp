import { ScrollView,View, Text, TextInput,TouchableOpacity,ViewStyle,TextStyle} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import Modal from "react-native-modal";
import { useState,useMemo,useEffect,useCallback} from 'react';
import {defaultDropProps,DropdownMenu } from '@/components/DropdownMenu';
import { AttachmentField } from '@/components/AttachmentField';
import {ThemedStyles} from '@/styles';
import debounce from 'lodash.debounce';
import isEqual from 'lodash/isEqual';
import { KeyStyles,GenericObject,DropdownMenuProps} from '@/types';
import { DatePicker } from '@/components/DatePicker';


const FormContainer = ({children,AddStyle,scheme}:{children: React.ReactNode,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light')
    return (
        <ScrollView style={[Form.container,AddStyle?.StyleContainer]} contentContainerStyle={{flex:1,alignItems: 'flex-start',maxWidth:600}}>{children}</ScrollView>
    )
};
const FormRow = ({children,AddStyle,scheme}:{children: React.ReactNode,AddStyle?: ViewStyle,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light');
    return (
        <View style={[Form.rowContainer,AddStyle]}>{children}</View>
    )
}
const FormLabel = ({label,mandatory=false,AddStyle,scheme}:{label?:string,mandatory?:boolean,AddStyle?:TextStyle,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light');
    return (
        <Text style={[Form.label,AddStyle,{paddingTop:15,paddingBottom:15}]}>{label + ' '}{mandatory && <Text style={{ color: 'red' }}>*</Text>}</Text>
    )
}
const FormCommon = ({label,mandatory=false,children,AddStyle,scheme}:{label?:string,mandatory?:boolean,children?:React.ReactNode,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    return (
        <FormRow AddStyle={AddStyle?.StyleRow} scheme={scheme}>
            <FormLabel mandatory={mandatory} label={label} AddStyle={AddStyle?.StyleLabel} scheme={scheme}/>
            {children}
        </FormRow>
    )
}
const FormTextInput = ({label,mandatory,def,disabled=false,onChange = () => {},AddStyle,scheme}:{mandatory?:boolean,label?:string,disabled?:boolean,def?:string,onChange?: (item: string) => void,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light');
    const [temp,setTemp] = useState(def);
    const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
    const handleChange = (text:string) => {
        setTemp(text);
        debouncedOnChange(text)
    };
    
    return (
        <FormCommon mandatory={mandatory} label={label} AddStyle={AddStyle} scheme={scheme}>
            <View style={{height:'100%',flex:1}}>
            <TextInput editable={!disabled}  keyboardType="default" onChangeText={handleChange} value={temp} style={[Form.input,AddStyle?.StyleInput,{borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>
            </View>
        </FormCommon>
    )
}
const FormAttachFile = ({label,mandatory,def,disabled=false,onChange = () => {},AddStyle,scheme}:{label?:string,mandatory?:boolean,def?:{uri: string,name: string,type: string},disabled?:boolean,onChange?: (item: any) => void,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    
    return (
        <FormCommon label={label} mandatory={mandatory} AddStyle={AddStyle} scheme={scheme}>
            <AttachmentField disabled={disabled} defaultValue={def} onChange={onChange} style={AddStyle?.StyleInput} scheme={scheme}/>
        </FormCommon>
        
    )
}
const FormNumericInput = ({label,mandatory,def,disabled = false,onChange = () => {},AddStyle,scheme}:{label?:string,mandatory?:boolean,def?:string,disabled?:boolean,onChange?: (item: string) => void,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light');
    const [temp,setTemp] = useState(def)
    const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
    
    const handleChange = (text:string) => {
        // Allow only numbers
        const numericValue = text.replace(/[^0-9.]/g, "");
        setTemp(numericValue);
        debouncedOnChange(numericValue);
        
    };
    return (
        <FormCommon label={label} mandatory={mandatory} AddStyle={AddStyle} scheme={scheme}>
            <View style={{height:'100%',flex:1}}>
            <TextInput editable={!disabled} selectTextOnFocus={!disabled} inputMode="decimal" value={temp} onChangeText={handleChange} style={[Form.input,AddStyle?.StyleInput,{borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]}/>
            </View>
        </FormCommon>
    )
}

const FormDateInput = ({label = 'Date',mandatory,def={date:new Date(),startDate:new Date(),endDate:new Date()},mode="single",disabled = false,onChange = () => {},AddStyle,scheme}:{label?:string,mandatory?:boolean,def?:GenericObject,mode?:"single"|"range"|"multiple",disabled?:boolean,onChange?: (item: any) => void,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {

    const {Form,Theme} = ThemedStyles(scheme);
    const [showDate, setShowDate] = useState(false);
    const [temp,setTemp] = useState<GenericObject>({})    
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


    useEffect(() => {
        setTemp((prev) => {
            
            return {...prev,...def}
        })
    },[def])

    return (
        <FormCommon mandatory={mandatory} label={label} AddStyle={AddStyle} scheme={scheme}>
            <TouchableOpacity disabled={disabled} style={[AddStyle?.StyleInput,{flex:1,borderRadius:5,borderWidth:1,paddingLeft:10,marginTop:10,paddingTop:5,marginBottom:10,paddingBottom:5}]} onPress={() => setShowDate(true)} >
                 <Text style={[Form.input,AddStyle?.StyleInput]}>{temp.date?.toISOString().split('T')[0]??''}</Text>
            </TouchableOpacity>
            <Modal isVisible={showDate} >
                <View style={{backgroundColor:'white',flexDirection:'column'}}>
                    <TouchableOpacity onPress={() => setShowDate(false)} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>
                    
                    {mode === "single" ?
                    (<View style={{borderRadius:10,borderWidth:1,borderColor:Theme.background,marginHorizontal:'auto',marginBottom:8,justifyContent:'center',alignItems:'center'}}>
                        <View style={{maxWidth:350}}>
                            <DatePicker Mode='single' Dates={temp} Change={(s) => {HandleChange(s,CloseDate)}} scheme={scheme} />
                        </View>
                     </View>):
                    (<View style={{flexDirection:'column'}}>
                        
                        <View style={{borderRadius:10,borderWidth:1,borderColor:Theme.background,marginHorizontal:'auto',marginBottom:8,justifyContent:'center',alignItems:'center'}}>
                        <View style={{maxWidth:350}}>
                            <DatePicker Mode='range' Dates={temp} Change={(s) => {HandleChange(s)}} scheme={scheme} />
                        </View>
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
                        <FormSubmit label="Ok" onPress={() => {CloseDate(temp)}} scheme={scheme}/>
                     </View>
                    )
                    }
                    
                </View>
            </Modal>
        </FormCommon>
    )
}

const FormSubmit = ({label = 'Submit',onPress = () => {},AddStyle,scheme}:{label?:string,onPress?: (item: any) => void,AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
    const {Form} = ThemedStyles(scheme??'light');
    return (
        <FormRow AddStyle={{justifyContent:'center',...AddStyle?.StyleRow}} scheme={scheme}>
            <View style={{paddingTop:15,paddingBottom:15}}>
            <Text style={[Form.button,AddStyle?.StyleInput]} onPress={onPress}>{label}</Text>
            </View>
        </FormRow>

    )
}

interface FormAutoProps extends DropdownMenuProps {
    mandatory ?:boolean,
    scheme:'light'|'dark'|undefined
}

const FormAutoComplete:React.FC<FormAutoProps> = (options = {scheme:'light'}) => {
    const finalOptions = useMemo(() => ({ ...defaultDropProps, ...options }), [options]);
    
    const {label,def,disabled,AddStyle,Defined,searchable,SearchFunction,LoadObj,SearchObj,mandatory,scheme} = finalOptions;
    const [loadObj,setLoadObj] = useState(LoadObj)
    const onChange = useCallback((item:any) => finalOptions.onChange(item), [finalOptions.onChange]);

    useEffect(() => {
        setLoadObj(LoadObj)
      },[LoadObj])

    return (
        <FormCommon mandatory={mandatory} label={label} AddStyle={AddStyle} scheme={scheme}>
            <DropdownMenu label={label} def={def} searchable={searchable} disabled={disabled} onChange={onChange} AddStyle={AddStyle} LoadObj={loadObj} Defined={Defined} SearchObj={SearchObj} SearchFunction={SearchFunction}/>
        </FormCommon>
    )
}


export {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormCommon,FormAutoComplete,FormAttachFile};






