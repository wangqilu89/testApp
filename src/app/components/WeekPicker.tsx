import React,{ useEffect,useState,useMemo} from 'react'
import {StyleSheet,Dimensions,View,Text,TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { addOpacity} from '@/services'; 
import {ThemedStyles} from '@/styles';
import { DatePickerProps,GenericObject } from '@/types';


const screenWidth = Dimensions.get('window').width;
interface WeekPickerProps extends DatePickerProps {
    HeaderButton?: () => void
}

export const WeekPicker:React.FC<WeekPickerProps > = React.memo(({Mode,Dates={date:new Date(),startDate:new Date(),endDate:new Date()},scheme,Change,HeaderButton}) => {

    const DaysOfWeek = ['Su','Mo','Tu','We','Th','Fr','Sa']
    const MonthName = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const [weekStart,setWeekStart] = useState(Dates.startDate)
    const [selected,setSelected]  = useState(Dates.date)
    const {Theme} = ThemedStyles(scheme??'light')
    

    const DateCompare = (date1:Date,date2:Date) => {
        date1 = new Date(date1.getFullYear(),date1.getMonth(),date1.getDate())
        date2 = new Date(date2.getFullYear(),date2.getMonth(),date2.getDate())
        return ((date1 > date2)?1:((date1 < date2)?2:0))
        
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

    const HandleChange = (item:any) => {
        setSelected(item)
        Change?.(item)
    }
    const HandleDates = (action:string) => {
        let refdate = new Date(weekStart);
        refdate.setDate(refdate.getDate() + (action === 'forward'?7:-7))
        setWeekStart(refdate)
    }
    useEffect(() => {
        setWeekStart(Dates.startDate);
        setSelected(Dates.date)
    },[Dates])
    
    return (
        <View style={{width:'100%'}}>
            <View style={{width:screenWidth}}></View>
            <View style={{width:'100%',justifyContent:'space-evenly'}}>
                <TouchableOpacity style={{flexDirection:'row',justifyContent:'center',marginVertical:10}} onPress={() => {HeaderButton?.()}}>
                    <View style={{alignItems:'center',marginHorizontal:5}}>
                        <Text style={[DateStyles.month_selector_label]}>{MonthName[weekStart.getMonth()]}</Text>
                    </View>
                    <View style={{alignItems:'center',marginHorizontal:5}}>
                        <Text style={[DateStyles.year_selector_label]}>{weekStart.getFullYear()}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{width:'100%',flexDirection:'row'}}>
                <View style={{flex:1,alignItems:'center'}}></View>
                {DaysOfWeek.map((item) => 
                   (<View style={[DateStyles.weekday,{flex:1,alignItems:'center'}]}><Text style={[DateStyles.weekday_label]}>{item}</Text></View>)
                )}
                <View style={{flex:1,alignItems:'center'}}></View>
            </View>
            <View style={{flex:1,width:'100%',flexDirection:'row'}}>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}} onPress={() => {HandleDates('backward')}} >
                    <Ionicons name='chevron-back' style={{fontSize:18,color:Theme.background}}/>
                </TouchableOpacity>
                {DaysOfWeek.map((_,index) => {
                    let refdate = new Date(weekStart);
                    refdate.setDate(refdate.getDate() - refdate.getDay()  + index)
                    return (<TouchableOpacity style={[{flex:1,justifyContent:'center',alignItems:'center',minHeight: 46},((DateCompare(refdate,selected) === 0)?DateStyles.selected:{})]} onPress={() => {HandleChange(refdate)}}><Text>{refdate.getDate()}</Text></TouchableOpacity>)
                }
                )}
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}} onPress={() => {HandleDates('forward')}} >
                    <Ionicons name='chevron-forward' style={{fontSize:18,color:Theme.background}}/>
                </TouchableOpacity>
            </View>
        </View>
   )

})