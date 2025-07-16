import React,{ useEffect,useState,useMemo} from 'react'
import {StyleSheet,Dimensions,View,Text,TouchableOpacity} from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import { Ionicons } from '@expo/vector-icons'; 
import { addOpacity} from '@/services'; 
import {ThemedStyles} from '@/styles';
import { DatePickerProps,GenericObject } from '@/types';




const screenWidth = Dimensions.get('window').width;

export const DatePicker:React.FC<DatePickerProps> = React.memo(({Mode,Dates={date:new Date(),startDate:new Date(),endDate:new Date()},scheme,Change}) => {
    const [temp,setTemp] = useState<GenericObject>({})
    const {Theme} = ThemedStyles(scheme??'light')

    const HandleChange = (item:any) => {
        Change?.(item)
    }
    const DateStyles = StyleSheet.create({

        selected: {backgroundColor:addOpacity(Theme.mooreReverse,0.5)},

        range_fill:{backgroundColor:addOpacity(Theme.mooreReverse,0.2)},
        range_start:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_end:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        

        month_selector_label:{fontSize:20,color:Theme.background},
        year_selector_label:{fontSize:20,color:Theme.background},
        weekday:{borderBottomWidth:1,borderColor:Theme.mooreReverse},
        weekday_label:{fontWeight:'bold',color:Theme.background},
        outside_label:{color:'#999DA0'}
    })
    
    const Components = {
        IconNext:<Ionicons name='chevron-forward' style={{fontSize:30,color:Theme.background}}/>,
        IconPrev:<Ionicons name='chevron-back' style={{fontSize:30,color:Theme.background}}/>
    }
    useEffect(() => {
        setTemp((prev) => {
            return {...prev,...Dates}
        })
    },[Dates])
    return (<DateTimePicker showOutsideDays={true} timeZone="UTC"  styles={DateStyles} components={Components} mode={Mode} date={Dates.date} startDate={Dates.startDate} endDate={Dates.endDate} onChange={HandleChange}/>)

});



