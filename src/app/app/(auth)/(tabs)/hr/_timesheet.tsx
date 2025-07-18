import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView, ViewStyle,Dimensions} from 'react-native';
import { useEffect, useState,useMemo} from 'react';
import { useRouter, usePathname} from 'expo-router';
import { useWebCheck,FetchData,ProperCase,NumberComma,GetWeekDates,DateCompare} from '@/services'; // 👈 functions
import { NoRecords,} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { usePrompt } from '@/components/AlertModal';
import { useListFilter } from '@/hooks/useListFilter'
import { Ionicons } from '@expo/vector-icons'; 
import {ThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps} from '@/types';
import { SearchField } from '@/components/SearchField';
import { DatePicker } from '@/components/DatePicker';
import { WeekPicker } from '@/components/WeekPicker';
import { useDefaultStyles as CalendarStyle } from 'react-native-ui-datepicker';
import { isEqual } from 'lodash';

interface TimesheetProps extends PageProps {
  date?:string
}
interface TimeData {
  internalid: string,
  date: Date;
  project: GenericObject | null,
  task: GenericObject | null,
  duration: string,
  type: GenericObject | null,
  status: GenericObject | null,
  memo: string
}


const TimesheetMain = ({BaseObj,scheme,date}: TimesheetProps) =>{
  
  const { Page, Header, Listing, Form, CategoryButton, Theme,StatusColors } = ThemedStyles(scheme);
  const pathname = usePathname();
  const router = useRouter();
  const refdate = date?date:new Date().toISOString().split('T')[0]
  const today = GetWeekDates('now',new Date(refdate + 'T00:00:00.000Z'))
  const startDate = GetWeekDates('start',today)
  const endDate  = GetWeekDates('end',today)
  const [temp,setTemp] = useState<GenericObject>({date:today,startDate:startDate,endDate:endDate});
 
  const toRefresh = useMemo(() => {return temp},[temp.startDate.getTime(),temp.endDate.getTime()])
  const toFilter = useMemo(() => {return temp},[temp.date.getTime()])

  const { list, displayList,setSearch,UpdateLoad,LoadAll,LoadMore,expandedKeys,HandleExpand} = useListFilter({
    LoadObj:null,
    SearchFunction: (l, keyword) => {
      return l.filter((i: GenericObject) =>
        {return ((DateCompare(temp.date,temp.startDate) <= 1 && DateCompare(temp.endDate,temp.date) <= 1  )?(i.date.toLowerCase().includes(keyword)):i) }
      );
    }
  });
 
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'name',name:'Project'},
    {internalid:'task',name:'Project Task'},
    {internalid:'date'},
    {internalid:'status'},
    {internalid:'val_duration',value:{handle:NumberComma}}
  ]

  const RowInfo = ({expanded,item,columns}:PageInfoRowProps) => {
    const newCol = useMemo(() => {
      return Array.isArray(columns)?
         ((columns.length > 3 && !expanded)?
          [...columns.slice(0, 3), ...columns.slice(-1)]:
          columns.slice())
         :[];
    }, [expanded, columns]);
    return (
      <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {return router.replace({ pathname:pathname as any,params: {category: 'submit-time',id:item.internalid,date:item.date} })} }>
            {newCol.map((colName, index) => (
                <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                  <View style={{width:150}}>
                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                      {colName?.name??ProperCase(colName.internalid.replace('val_',''))}
                    </Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                      {colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}
                    </Text>
                  </View>
                </View>
              )
            )}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',height:'100%'}} onPress={() => HandleExpand(item.internalid)}>
          <Ionicons name={expanded?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      </View>
    );
  };



  const UpdateTemp = (s:GenericObject) => {
    const updated = {...temp,...s};
    if (!isEqual(updated,temp)) {
        setTemp(updated)
    }
  }

  useEffect(() => {
    UpdateLoad({...BaseObj,command: 'HR : Get Timebill List',data: temp})
  },[toRefresh])

  useEffect(() => {
    const DateStr = temp.date.getFullYear() + '-' + (temp.date.getMonth() + 1).toString().padStart(2,'0') + '-' + temp.date.getDate().toString().padStart(2,'0')  
    setSearch(DateStr)
  },[toFilter])

  return (
    <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
      <View style={{maxWidth:450,flexDirection:'column',minWidth:0}} >
        <WeekPicker Mode='single' Dates={temp} scheme={scheme} Change={(s) => {UpdateTemp(s)}} />
      </View>
      <View style={{flex:1,width:'100%'}}>
        <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                
                renderItem={({ item }) => {
                  return (
                    <RowInfo expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG} />
                  )
                }}
                onEndReached={() => {
                  if (displayList.length < list.length) {
                    LoadMore();
                  }
                }}
                onEndReachedThreshold={0.5}
              />

      </View>
       
    </View>
    
  )
}


const SubmitTime = ({ id='0', user,BaseObj,scheme,date}:TimesheetProps) => {
  const DateStr = date?.split('-')??''
  
  const { Page, Header, Listing, Form, CategoryButton, Theme } = ThemedStyles(scheme);
  const isWeb = useWebCheck();
  const router = useRouter();
  const pathname = usePathname();


  const [data, setData] = useState<TimeData>({
    internalid:id,
    date:(DateStr?new Date(parseInt(DateStr[0]),parseInt(DateStr[1])-1,parseInt(DateStr[2])):new Date()),
    project:null,
    task:null,
    duration:'0',
    type:null,
    status:null,
    memo:''
  });
  const [taskLoad,setTaskLoad] = useState<GenericObject|null>(null)
  const memoTask = useMemo(() => data, [data.project]);
  
  const InitData = async () => {
    let RawData = await FetchData({ ...BaseObj, command: "HR : Get Saved Timebill",data:{internalid:id,date:date}})
    RawData = RawData[0]
    RawData.date = new Date(RawData.date + 'T00:00:00.000Z')
    console.log('Raw Duration',RawData.duration)
    setData(RawData)
   
  }

  const UpdateData = (s:GenericObject) => {
    const updated = {...data,...s};
    if (!isEqual(updated,data)) {
        setData(updated)
    }
    
  };

  const SearchFunc = (i:GenericObject[], keyword:string) => {
      
    return i.filter((item: GenericObject) =>
      Object.values(item).some((val) =>
        String(typeof val === 'object' ? val?.name ?? '' : val)
          .toLowerCase()
          .includes(keyword)
      )
    );
  };

  useEffect(() => {
    setTaskLoad(data.project?{ ...BaseObj, command: "HR : Get task Listing",data:{project:data.project}}:null)
  },[memoTask])

  useEffect(()=> {
    
    if (id != '0') {
      InitData()

    }
  },[])
  
  return (
    <>
    {!isWeb && (
      <View style={[Header.container,{flexDirection:'row'}]}>
          <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({pathname:pathname as any,params: { category: 'timesheet',date:date} })}>
              <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
          </TouchableOpacity>
          <Text style={[Header.text,{flex:1,width:'auto'}]}>{id == '0'?'Create':'Update'} Time</Text>
          <TouchableOpacity disabled={true} style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({ pathname:pathname as any,params: { category: 'submit-leave' } })}>
              <Ionicons name="add" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30,color:Theme.background}]} />
          </TouchableOpacity>
      </View>
    )}
    <FormContainer scheme={scheme}>
      <FormDateInput 
        mode="single"
        disabled={true}
        mandatory={true} 
        label="Start Date" 
        def={{ date: data.date}}
        onChange={({date}) => { UpdateData({date:GetWeekDates('now',date)}) }} 
        scheme={scheme}
      />
      <FormAutoComplete 
           label="Project "  
           mandatory={true} 
           def={data.project??{}} 
           searchable={true} 
           onChange={(item)=>{ UpdateData({project:item});UpdateData({task:null});}} 
           SearchObj={{ ...BaseObj, command: "HR : Get Project Listing" }}
           AddStyle={{StyleInput:{flex:1,marginRight:0}}}
           scheme={scheme}
        />
        <FormAutoComplete 
           label="Task "  
           mandatory={true} 
           def={data.task??{}} 
           searchable={true} 
           onChange={(item)=>{UpdateData({task:item})}} 
           SearchFunction={SearchFunc} 
           LoadObj={taskLoad} 
           AddStyle={{StyleInput:{flex:1,marginRight:0}}}
           scheme={scheme}
        />
        <FormAutoComplete 
           label="Type " 
           AddStyle={{StyleInput:{marginRight:0,flex:1}}} 
           mandatory={true} 
           def={data.type??{internalid:'1',name:'Regular'}} 
           searchable={false} 
           onChange={(item) => UpdateData({type:item})} 
           Defined={[{internalid:'1',name:'Regular'}, {internalid:'2',name:'Over Time'}]} 
           scheme={scheme}
         />
        <FormAutoComplete 
           label="Status " 
           AddStyle={{StyleInput:{marginRight:0,flex:1}}} 
           mandatory={true} 
           def={data.status??{internalid:'1',name:'Regular'}} 
           searchable={false} 
           onChange={(item) => UpdateData({type:item})} 
           LoadObj={{ ...BaseObj, command: "HR : Get Time Status List" }}
           scheme={scheme}
         />
        <FormNumericInput 
            label="Duration " 
            mandatory={true} 
            def={data.duration} 
            onChange={(text) => UpdateData({duration:text})} 
            scheme={scheme} 
        />
        <FormTextInput 
            label="Memo" 
            mandatory={true} 
            key={data.memo} 
            def={data.memo} 
            onChange={(text) => UpdateData({memo:text})} 
            scheme={scheme} 
        />
      <View style={{flex:1}} />
      <FormSubmit onPress={()=>{}} scheme={scheme}/>
    </FormContainer>
    </>
  );
  
}



export const Timesheet = ({ category, id, user,BaseObj,scheme,date}: TimesheetProps) => {

  switch (category) {
    case 'submit-time':
        return <SubmitTime category={category} id={id} user={user} BaseObj={BaseObj} scheme={scheme??'light'} date={date} />
    default :
        return <TimesheetMain user={user} BaseObj={BaseObj} scheme={scheme??'light'} date={date} />
  }
}
