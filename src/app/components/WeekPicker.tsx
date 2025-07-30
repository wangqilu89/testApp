import React,{ useEffect,useState,useMemo} from 'react'
import {StyleSheet,Dimensions,View,Text,TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { addOpacity} from '@/services'; 
import {ThemedStyles} from '@/styles';
import { DatePickerProps,GenericObject } from '@/types';
import { usePrompt } from '@/components/AlertModal';
import { DatePicker } from '@/components/DatePicker';
import { isEqual } from 'lodash';
import { GetWeekDates } from '@/services';


const screenWidth = Dimensions.get('window').width;

const DaysOfWeek = ['Su','Mo','Tu','We','Th','Fr','Sa']

const MonthName = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface WeeklyPickerProps extends DatePickerProps {
    StatusMap?: GenericObject; // ← new
}

export const WeekPicker:React.FC<WeeklyPickerProps> = React.memo(({Mode,Dates={date:new Date(),startDate:new Date(),endDate:new Date()},scheme,Change,StatusMap}) => {
   
    const [temp,setTemp] = useState(() =>
        Object.fromEntries(
          Object.entries(Dates).map(([key, value]) => [key, GetWeekDates('now', value as Date)])
        )
      );
      
    const {ShowPrompt,HidePrompt} = usePrompt()
    const {Theme} = ThemedStyles(scheme??'light')

    const DateStyles = StyleSheet.create({
        selected: {backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_fill:{backgroundColor:addOpacity(Theme.mooreReverse,0.2)},
        range_start:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        range_end:{backgroundColor:addOpacity(Theme.mooreReverse,0.5)},
        month_selector_label:{fontSize:20,color:Theme.background},
        year_selector_label:{fontSize:20,color:Theme.background},
        weekday:{borderBottomWidth:1,borderColor:Theme.mooreReverse},
        weekday_label:{fontWeight:'bold',color:Theme.background},
        outside_label:{color:'#999DA0'},
        circle_label:{marginTop: 4,width: 8,height: 8,borderRadius: 4}
    })


    const UpdateTemp = (s:GenericObject) => {
        const updated = {...temp,...s};
        if (!isEqual(updated,temp)) {
            setTemp(updated)
        }
    }
    
    const CalendarChange = (s:GenericObject) => {
        const updated = {date:s.date,startDate:GetWeekDates('start',s.date),endDate:GetWeekDates('end',s.date)};
        
        if (!isEqual(updated,temp)) {
            UpdateTemp(updated)
            HidePrompt(updated)
        }
    }
    
    const DateChange = (s:GenericObject) => {
        console.log(s)
        UpdateTemp(s)
    }

    const WeekChange = (action:string) => {
        let start = new Date(temp.startDate);
        let end = new Date(temp.endDate);
        start.setDate(start.getDate() + (action === 'forward'?7:-7))
        end.setDate(end.getDate() + (action === 'forward'?7:-7))
        UpdateTemp({startDate:start,endDate:end})
    }
  
    
    const ShowCalendar = () => {
        return ShowPrompt({
          msg:(
          <View style={{flex:1,maxWidth:350}}>
            <DatePicker Mode='single' Dates={temp} Change={(s) => {CalendarChange(s)}} scheme={scheme} />
          </View>
          ),
          icon:{visible:false,label:<></>},
          input:{visible:false},
          ok:{visible:false},
          cancel:{visible:false}
    
        })
    }

    useEffect(() => {
        Change?.(temp)
    },[temp])

    
    return (
        <View style={{width:'100%'}}>
            <View style={{width:screenWidth}}></View>
            <View style={{width:'100%',justifyContent:'space-evenly'}}>
                <TouchableOpacity style={{flexDirection:'row',justifyContent:'center',marginVertical:10}} onPress={() => {ShowCalendar()}}>
                    <View style={{alignItems:'center',marginHorizontal:5}}>
                        <Text style={[DateStyles.month_selector_label]}>{MonthName[temp.startDate.getMonth()]}</Text>
                    </View>
                    <View style={{alignItems:'center',marginHorizontal:5}}>
                        <Text style={[DateStyles.year_selector_label]}>{temp.startDate.getFullYear()}</Text>
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
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}} onPress={() => {WeekChange('backward')}} >
                    <Ionicons name='chevron-back' style={{fontSize:18,color:Theme.background}}/>
                </TouchableOpacity>
                {DaysOfWeek.map((_,index) => {
                    let refdate = new Date(temp.startDate);
                    refdate.setDate(refdate.getDate() - refdate.getDay()  + index)
                    const dateKey = refdate.toISOString().split('T')[0];
                    const status = StatusMap?.[dateKey]??'transparent';
                    return (
                        <TouchableOpacity style={[{flex:1,justifyContent:'center',alignItems:'center',minHeight: 46},((isEqual(GetWeekDates('now',refdate),GetWeekDates('now',temp.date)))?DateStyles.selected:{})]} onPress={() => {DateChange({date:refdate})}}>
                            <Text>{refdate.getDate()}</Text>
                            <View style={[DateStyles.circle_label,{backgroundColor:status}]} />
                        </TouchableOpacity>
                    )
                }
                )}
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}} onPress={() => {WeekChange('forward')}} >
                    <Ionicons name='chevron-forward' style={{fontSize:18,color:Theme.background}}/>
                </TouchableOpacity>
            </View>
        </View>
   )

})