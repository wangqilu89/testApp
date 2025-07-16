import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView, ViewStyle,Dimensions} from 'react-native';
import { useEffect, useState,useMemo} from 'react';
import { useRouter, usePathname} from 'expo-router';
import { useWebCheck,FetchData,ProperCase,NumberComma} from '@/services'; // 👈 functions
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



const GetWeekDates = (t:string,d:Date) => {
  let e = new Date(d)
  if (t == 'start') {
    e.setDate(e.getDate() - e.getDay());
  }
  else if (t === 'end') {
    e.setDate(e.getDate() - e.getDay() + 7)
  }
  return e
}

const TimesheetMain = ({user,BaseObj,scheme}: PageProps) =>{
  const { Page, Header, Listing, Form, CategoryButton, Theme,StatusColors } = ThemedStyles(scheme);
  const today = new Date();
  const startDate = GetWeekDates('start',today)
  const endDate  = GetWeekDates('end',today)
  const [temp,setTemp] = useState<GenericObject>({date:today,startDate:startDate,endDate:endDate})

  const { ShowPrompt,HidePrompt,visibility} = usePrompt();
  const DatePickerChange = (s:GenericObject) => {
    const updated = {date:s.date,startDate:GetWeekDates('start',s.date),endDate:GetWeekDates('end',s.date)};
    if (!isEqual(updated,temp)) {
      HidePrompt(updated)
    }
    setTemp(updated)
  }
  const ShowCalendar = () => {
    return ShowPrompt({
      msg:(
      <View style={{flex:1,maxWidth:350}}>
        <DatePicker Mode='single' Dates={temp} Change={(s) => {DatePickerChange(s)}} scheme={scheme} />
      </View>
      ),
      icon:{visible:false,label:<></>},
      input:{visible:false},
      ok:{visible:false},
      cancel:{visible:false}

    })
  }

  return (
    <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
      <View style={{flex:1,maxWidth:450,flexDirection:'column',minWidth:0}} >
        <WeekPicker Mode='single' Dates={temp} scheme={scheme} Change={(s) => {setTemp((prev) => ({...prev,date:s}))}} HeaderButton={() => ShowCalendar()}/>
      </View>
      
    </View>
    
  )
}

const SubmitTime = ({ category,id, user,BaseObj,scheme}: PageProps) => {

  /*Declarations */
  const { Page, Header, Listing, Form, ListHeader, CategoryButton, Theme } = ThemedStyles(scheme);
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date()
  const isWeb = useWebCheck(); 
  const [currentLine, setCurrentLine] = useState(0);
  const [showLine,setShowLine]= useState(false);
  const [claim,setClaim] = useState<{internalid:string,date:Date,document_number:string,employee:GenericObject,line:GenericObject[]}>({internalid:'',date:today,document_number:'To Be Generated',employee:{},line:[]});
  const [line,setLine] = useState<LineItem>({number:'0',date:today,expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),internalid:claim.internalid + '.0',project:null,task:null,category:null,memo:'',val_amount:'0',file:null});
  const [lineTask,setLineTask] = useState<GenericObject|null>(null);
  const memoTask = useMemo(() => line, [line.project]);

  
  const { ShowLoading,HideLoading} = usePrompt();
  
  
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'number'},
    {internalid:'expense_date'},
    {internalid:'project'},
    {internalid:'val_amount',value:{handle:NumberComma}}
  ]

  const DefaultLine:LineItem = {number:'0',date:today,expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),internalid:claim.internalid + '.0',project:null,task:null,category:null,memo:'',val_amount:'0',file:null}
  /* Props */
  interface LineItem {
    number: string,
    expense_date:string,
    date: Date,
    internalid: string,
    project: GenericObject|null,
    task:GenericObject|null,
    category: GenericObject|null,
    memo: string,
    val_amount: string,
    file: any
  };
  
  interface ColProps extends Omit<PageInfoRowProps,'columns'> {
    'columns': PageInfoColProps
  }

  /* Functions */
  const updateLine = (key:keyof typeof line,value: any) => {
    setLine((prev) => {
      return {...prev, [key]: value }
    })
  }
  const updateMain = (key:keyof typeof claim,value: any) => {
    setClaim((prev) => {
      return {...prev, [key]: value }
    })
    
  }
  const loadData = async (id:string|undefined) => {
    ShowLoading({msg:'Loading List...'})
    try {
      let data = null
      let lineNo = 0
      if (id != '0') {
        data = await FetchData({...BaseObj,command:`HR : Get Expense Report`,data:{internalid:id}})
      }
      if (data) {
        
        data = data[0]
        let refDate = data.date.split('/')
        data.date = new Date(refDate[2],parseInt(refDate[1]) - 1,refDate[0])
        data.line.forEach(function (i:GenericObject) {
          i.expense_date = i.date
          refDate = i.date.split('/')
          i.date = new Date(refDate[2],parseInt(refDate[1]) - 1,refDate[0])
          lineNo = parseInt(i.number)
        })
        
      }
      else {
        data = {internalid:'0',date:today,document_number:'To be Generated',employee:{id:BaseObj.user,name:user?.name},line:[]}
        lineNo += 1
      }
      
      setClaim(data)
      setCurrentLine(lineNo)
      
    } 
    catch (err) {
      console.error(`Failed to fetch ${category} :`, err);
    } 
    finally {
      HideLoading({confirmed: true, value: ''})
    }
  };
  const submitLine = (item:LineItem) => {
      const refDate = item.date;
      item.expense_date = refDate.getDate() + '/' + (refDate.getMonth() + 1) + '/' + refDate.getFullYear();
      setClaim((prev) => {
        const existingIndex = prev.line.findIndex(i => i.number === item.number);
        let updatedLine;
        if (existingIndex === -1) {
          // Add new
          updatedLine = [...prev.line, item];
          setCurrentLine(currentLine + 1)
        } 
        else {
          updatedLine = [...prev.line];
          updatedLine[existingIndex] = { ...updatedLine[existingIndex], ...item };
        }
    
        return { ...prev, line: updatedLine };
    
      })
      
  }
  
  /* Node Functions */
  const ColInfo = ({columns,index,item}: ColProps) => {
    return (
        <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
            <View style={[{width:150},columns?.format?.StyleContainer]}>
              <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},columns?.format?.StyleLabel]}>
                {columns?.name??ProperCase(columns.internalid.replace('val_',''))}
              </Text>
            </View>
            <View style={{flex:1}}>
                <Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                  {columns?.value?.handle?columns.value.handle((typeof item[columns.internalid] === 'object')
                     ?(item[columns.internalid]['name']??''):(item[columns.internalid]??''))
                     :(typeof item[columns.internalid] === 'object')?(item[columns.internalid]['name']??''):(item[columns.internalid]??'')
                  }
                </Text>
              </View>
        </View>
    )
  }
  const RowInfo = ({item,columns}:PageInfoRowProps) => {
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:30,marginRight:30}} onPress={() => {setLine(item as LineItem);setShowLine(true)}}>
            {Array.isArray(columns)?
              columns.map((colName, index) => (
                <ColInfo columns={colName} index={index} item={item}/>
              )):<></>
          }
        </TouchableOpacity>
      </View>
    );
  };

  const ExpenseHeader = () => {
    return (
      <FormContainer scheme={scheme}>
        <FormTextInput label="ID " def={claim.internalid} onChange={(text) => {updateMain('internalid', text)}} AddStyle={{StyleRow:{display:'none'}}} scheme={scheme}/>
        <FormDateInput disabled={true} label='Date ' def={{date:claim.date}} onChange={({date})=>{updateMain('date',date)}} scheme={scheme}/>
        <FormTextInput disabled={true} label="Document Number " key={claim.document_number} def={claim.document_number} onChange={(text) => {updateMain('document_number', text)}} scheme={scheme}/>
        <FormAutoComplete 
          label="Employee "  
          def={claim.employee} 
          searchable={false} 
          disabled={true} 
          onChange={(item)=>{updateMain('employee', item)}} 
          LoadObj={{ ...BaseObj, command: "HR : Get Employee Listing",data:{keyword:BaseObj.user}}} 
          AddStyle={{StyleInput:{flex:1,marginRight:0}}}
          scheme={scheme}
        />
        
        <FlatList
          style={[Form.container,{paddingHorizontal:0}]}
          data={claim.line}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
                <View style={[ListHeader.container,{marginTop:20,flexDirection:'row',backgroundColor:Theme.backgroundReverse}]}>
                    <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:-1,fontSize:23,color:Theme.backgroundReverse}]} />
                    <Text style={[ListHeader.text,{fontSize:18,flex:1}]}>Line Items</Text>
                    <TouchableOpacity style={{flex:-1}}  onPress={() => {setLine(DefaultLine);setShowLine(true)}}>
                      <Ionicons name="add" style={[CategoryButton.icon,Listing.text,{fontSize:23,color:Theme.textReverse}]} />     
                    </TouchableOpacity>                     
                </View>
            }
          keyExtractor={(item) => item.internalid}
          renderItem={({ item }) => {
            return (
              <RowInfo item={item} columns={COLUMN_CONFIG} />
            )
          }}
          
        />
        {claim.line.length > 0 && (<FormSubmit onPress={()=>{}} scheme={scheme}/>)}
      </FormContainer>
    )
  }
  const ExpenseLine = () => {
    
    const SearchFunc = (i:GenericObject[], keyword:string) => {
      
      return i.filter((item: GenericObject) =>
        Object.values(item).some((val) =>
          String(typeof val === 'object' ? val?.name ?? '' : val)
            .toLowerCase()
            .includes(keyword)
        )
      );
    }
    return (
      <FormContainer scheme={scheme}>
        <FormTextInput label="ID " def={line.internalid} onChange={(text) => updateLine('internalid', text)} AddStyle={{StyleRow:{display:'none'}}} scheme={scheme}/>
        <FormDateInput 
           label='Date ' 
           mandatory={true} 
           def={{date:line.date}} 
           onChange={({date})=>{updateLine('date',date);updateLine('expense_date',date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())}}
           scheme={scheme}
        />
        <FormAutoComplete 
           label="Project "  
           mandatory={true} 
           def={line.project??{}} 
           searchable={true} 
           onChange={(item)=>{updateLine('project',item);updateLine('task',null)}} 
           SearchObj={{ ...BaseObj, command: "HR : Get Project Listing" }}
           AddStyle={{StyleInput:{flex:1,marginRight:0}}}
           scheme={scheme}
        />
        <FormAutoComplete 
           label="Task "  
           mandatory={true} 
           def={line.task??{}} 
           searchable={true} 
           onChange={(item)=>{updateLine('task',item)}} 
           SearchFunction={SearchFunc} 
           LoadObj={lineTask} 
           AddStyle={{StyleInput:{flex:1,marginRight:0}}}
           scheme={scheme}
        />
        <FormAutoComplete 
           label="Category "  
           mandatory={true} 
           def={line.category??{}} 
           searchable={true} 
           onChange={(item)=>{updateLine('category',item)}}  
           SearchObj={{ ...BaseObj, command: "HR : Get Category Listing" }} 
           AddStyle={{StyleInput:{flex:1,marginRight:0}}}
           scheme={scheme}
         />
        <FormTextInput label="Memo " mandatory={true} def={line.memo} onChange={(text) => updateLine('memo', text)} scheme={scheme}/>
        <FormNumericInput label="Value " mandatory={true} def={line.val_amount} onChange={(text) => updateLine('val_amount', text)} scheme={scheme} />
        <FormAttachFile label="Attach File " def={line.file} onChange={(file) => {updateLine('file',file)}} scheme={scheme} />
        <View style={{flex:1}} />
        <FormSubmit label={currentLine == parseInt(line.number)?'Add':'Update'} onPress={()=>{submitLine(line);setShowLine(false);}} scheme={scheme}/>
      </FormContainer>
    )
  }

  useEffect(() => {
    setLineTask(line.project?{ ...BaseObj, command: "HR : Get task Listing",data:{project:line.project}}:null)
  },[memoTask])

  useEffect(() => {
      loadData(id);
  }, [id]);

  return (
      <View style={[Page.container]}>
            {!isWeb ? (
              <>
              <View style={[Header.container,{flexDirection:'row'}]}>
                  <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => {if (showLine) {setLine(DefaultLine);setShowLine(false);} else {router.replace({pathname:pathname as any})}}}>
                      <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                  </TouchableOpacity>
                  <Text style={[Header.text,{flex:1,width:'auto'}]}> {showLine ? ('Line : ' + line.number) : 'Expense Claim'}</Text>
              </View>
              {showLine ? (<ExpenseLine />):(<ExpenseHeader />)}
              </>
            ) : (
              <View style={{flexDirection:'column'}}>
                <ExpenseHeader />
                {showLine && (<ExpenseLine />)}
              </View>
            )
            
            
            }
      </View>
  )
}

export const Timesheet = ({ category, id, user,BaseObj,scheme}: PageProps) => {

  switch (category) {
    case 'submit-timesheet':
        return <SubmitTime category={category} id={id} user={user} BaseObj={BaseObj} scheme={scheme??'light'} />
    default :
        return <TimesheetMain user={user} BaseObj={BaseObj} scheme={scheme??'light'}  />
  }
}
