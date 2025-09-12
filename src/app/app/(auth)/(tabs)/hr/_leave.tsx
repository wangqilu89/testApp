
import { View, Text, TouchableOpacity, FlatList} from 'react-native';

import { useEffect, useState,useMemo,useRef} from 'react';
import { useRouter, usePathname} from 'expo-router';
import { useWebCheck,FetchData,ProperCase,NumberComma} from '@/services'; // 👈 functions

import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { usePrompt } from '@/components/AlertModal';

import { useListFilter } from '@/hooks/useListFilter'

import { Ionicons } from '@expo/vector-icons'; 
import {ThemedStyles} from '@/styles';
import { GenericObject,PageInfoColConfig,PageInfoRowProps} from '@/types';  
import { SearchField } from '@/components/SearchField';
import { PageProps } from '@/types';

  
  interface LeaveProps extends PageProps {
    leave?:string
    today?:Date
  }

  const LeaveMain = ({user,BaseObj,scheme}: LeaveProps) => {
    const {Page,Header,CategoryButton,Theme} = ThemedStyles(scheme);
    const pathname = usePathname();
    const router = useRouter();
    const today = new Date();
    const tabs : string[] = ['balance','application']
    const [activeTab, setActiveTab] = useState<string>('balance');
    const isWeb = useWebCheck();
    
  
    return (
      <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          {/*HEADER */}
          {!isWeb && (
          <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              <Text style={[Header.text,{flex:1,width:'auto'}]}>Leave Information</Text>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({ pathname:pathname as any,params: { category: 'submit-leave' } })}>
                  <Ionicons name="add" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
          </View>
          )}
          {/*Tabs */}
          <View style={[Header.container,{justifyContent:'flex-start',backgroundColor:'transparent',flexDirection:'row',paddingTop:20}]}>
              {tabs.map((tab) => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{alignItems:'flex-start',marginHorizontal:20}} >
                      <View style={{alignItems:'center',justifyContent:'center'}}><Text style={[Header.text,{color:((activeTab === tab)?Theme.mooreReverse:Theme.text)}]}>{ProperCase(tab)}</Text></View>
                      {activeTab === tab && (<View style={{width: 70,height: 3,backgroundColor:Theme.mooreReverse,borderRadius: 2,alignItems:'flex-start',justifyContent:'flex-start'}}></View>)}
                  </TouchableOpacity>
              ))}
          </View>
          {activeTab === 'balance'  && (
            <LeaveMainBal user={user} today={today} BaseObj={BaseObj} scheme={scheme} />
          )}
          {activeTab === 'application'  && (
            <LeaveMainApply user={user} today={today} BaseObj={BaseObj} scheme={scheme}/>
          )}
      </View>   
    )
  }
  
  const LeaveMainBal = ({user,today,BaseObj,scheme}: LeaveProps) => {
    const { Listing, Form,Theme } = ThemedStyles(scheme);
    const pathname = usePathname();
    const router = useRouter();
      
    const { list} = useListFilter({LoadObj:{...BaseObj,data:{date:today!.getFullYear()},command: "HR : Get Leave balance" }});
  
    return (
      <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1,marginTop:20}}>
      {/*LISTING*/} 
      <FlatList
          style={[Form.container]}
          data={list}
          keyExtractor={(item) => item.internalid}
          renderItem={({ item }) => {
              return (
                <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:8,marginBottom:8,padding:15}}>
                  <TouchableOpacity style={{flexDirection:'column',alignItems:'flex-start',flex:1,paddingLeft:30}} onPress={() => {router.replace({pathname:pathname as any,params: {category: 'submit-leave',leave:item.internalid}})}}>
                    <Text style={[Listing.text,{fontSize: 20}]}>{item.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => {router.replace({pathname:pathname as any,params: {category: 'submit-leave',leave:item.internalid}})}}>
                      <Text style={[Listing.text,{fontFamily: 'Righteous_400Regular', fontSize: 20}]}>{item.balance}</Text>
                  </TouchableOpacity>
                      
                </View>
              )
          }}
          
          onEndReachedThreshold={0.5}
      />
      </View>
    )
  
  }
  
  const LeaveMainApply =  ({user,today,BaseObj,scheme}:LeaveProps) => {
    const {Listing,Form,CategoryButton,Theme,StatusColors} = ThemedStyles(scheme);
   
  
    const {list,displayList,expandedKeys, search, setSearch, LoadMore,HandleExpand,LoadAll} = useListFilter({
      LoadObj:{...BaseObj,data:{date:today!.getFullYear()},command:'HR : Get Leave application' },
      SearchFunction: (i, keyword) => {
        return i.filter((item: GenericObject) =>
          Object.values(item).some((val) =>
            String(typeof val === 'object' ? val?.name ?? '' : val)
              .toLowerCase()
              .includes(keyword)
          )
        );
      }
    });
  
    const COLUMN_CONFIG: PageInfoColConfig=[
      {internalid:'employee'},
      {internalid:'leave_type'},
      {internalid:'leave_period'},
      {internalid:'date_requested'},
      {internalid:'name',name:'Leave No'},
      {internalid:'memo'},
      {internalid:'val_days',value:{handle:NumberComma}}
    ]
    const RowInfo = ({expanded,item,columns}:PageInfoRowProps) => {
      const DocColor = (StatusColors[item?.status]??Theme.text)
      const newCol = useMemo(() => {
        return Array.isArray(columns)?
           ((columns.length > 3 && !expanded)?
            [...columns.slice(0, 3), ...columns.slice(-1)]:
            columns.slice())
           :[];
      }, [expanded, columns]);
      const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)
  
      return (
        <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
          <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => {}}>
              <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23},item.file?{}:{color:Theme.containerBackground}]} />
          </TouchableOpacity>
          <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}} onPress={() => {}}>
              {newCol.map((colName, index) => {
                let finalCol = colName
                if (finalCol.internalid == 'leave_type') {
                  finalCol = {...colName,value:{format:{StyleLabel:{color:DocColor}}}}
                }
                return (
                <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                  <View style={{width:150}}>
                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},finalCol?.format?.StyleLabel]}>
                      {colName?.name??ProperCase(colName.internalid.replace('val_',''))}
                    </Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},finalCol?.value?.format?.StyleLabel]}>
                      {finalCol?.value?.handle?(finalCol.value.handle(item[finalCol.internalid] ?? '')):(item[finalCol.internalid] ?? '')}
                    </Text>
                  </View>
                </View>
              )})}
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => HandleExpand(item.internalid)}>
            <Ionicons name={expanded?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
          </TouchableOpacity>
        
        </View>
      );
    };
    
    return (
      <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1,marginTop:20}}>
          {/*Search*/}
          <View style={{marginLeft:50,marginRight:50}}><SearchField def={search} onChange={setSearch} scheme={scheme} /></View>
          {/*LISTING*/} 
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
          {displayList.length < list.length && (
            <TouchableOpacity onPress={() => {LoadAll()}} style={[Form.container,{flex:-1,alignItems:'center',marginVertical:5}]}>
                <Text style={{fontWeight:'bold'}}>Show All</Text>
            </TouchableOpacity>
           )}
      </View>
    )
  }
  
  const ApplyLeave = ({ id, user,BaseObj,scheme,leave}: LeaveProps) => {
    const { ShowLoading,HideLoading} = usePrompt();
    const { Page, Header, Listing, Form, CategoryButton, Theme } = ThemedStyles(scheme);
    const isWeb = useWebCheck();
    const router = useRouter();
    const pathname = usePathname();
    const { ShowPrompt } = usePrompt();
    const pageInit = useRef(true);
    
    const [year, setYear] = useState('');
    const [apply, setApply] = useState<GenericObject>({
      employee:user?.id,
      shift:user?.shift,
      subsidiary: user?.subsidiary,
      startdate: new Date(),
      enddate: new Date(),
      startam: {internalid:'3',name:'Full Day'},
      endam: {internalid:'3',name:'Full Day'},
      day: 1,
      leave: {},
      file:null
    });
    const [leaveList, setLeaveList] = useState({...BaseObj,...({data: { date: apply.startdate.getFullYear(), shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: 'HR : Get Leave balance'})});
    const [support, setSupport] = useState<{ public: GenericObject[] , working: GenericObject[] }>({
      public: [],
      working: []
    });
    const memoApply = useMemo(() => apply, [apply.startdate, apply.enddate, apply.startam, apply.endam]);
  
    const updateApply = (key: keyof typeof apply, value: any) => {
      setApply((prev) => ({ ...prev, [key]: value }));
    };
  
    const CompareDates = (date1: Date, date2: Date) => {
      if (date1 > date2) return 1;
      else if (date1 < date2) return 2;
      else return 0;
    };
  
    const HandleDate = (ref:Date) => {
      return new Date(ref.toISOString().split('T')[0] + 'T00:00:00.000Z')
    }
  
    const GetLeavePeriod = (NewList: { public: GenericObject[], working: GenericObject[] }) => {
      
      const startdate = new Date(apply.startdate);
      const enddate = new Date(apply.enddate);
      let totalapplied = 0;
      let refdate = new Date(startdate);
      refdate.setDate(refdate.getDate() - 1);
      
      do {
        let applied = 0;
        refdate.setDate(refdate.getDate() + 1);
        const dayofweek = refdate.getDay();
  
        if (CompareDates(refdate, startdate) === 0) {
          applied = parseInt(NewList.working[dayofweek]?.day ?? 0) * (apply.startam.internalid == '3' ? 1 : 0.5);
        } 
        else if (CompareDates(refdate, enddate) === 0) {
          applied = parseInt(NewList.working[dayofweek]?.day ?? 0) * (apply.endam.internalid == '3' ? 1 : 0.5);
        } 
        else {
          applied = NewList.working[dayofweek]?.day ?? 0;
        }
        
        
        for (const hol of NewList.public) {
          let phdate = hol.date.split('/');
          phdate = new Date(phdate[2], parseInt(phdate[1]) - 1, phdate[0]);
          if (CompareDates(phdate, refdate) === 0) {
            applied = 0;
            break;
          }
        }
        
        totalapplied += applied;
        
      } while (CompareDates(refdate, enddate) === 2);
  
      updateApply('day', totalapplied && !isNaN(totalapplied) ? totalapplied : 0);
    };
  
    const GetSupport = async () => {
      const updatedList: GenericObject = {};
      const YearStr = apply.startdate.getFullYear().toString();
      for (const key of Object.keys(support)) {
        let cmd = '';
        switch (key) {
          case 'balance':
            cmd = 'HR : Get Leave balance';
          break;
          case 'public':
            cmd = 'HR : Get Public Holiday';
            break;
          case 'working':
            cmd = 'HR : Get Working day';
            break;
        }
        const LoadObj = {...BaseObj,...({data: { date: YearStr, shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: cmd})}
        const data = await FetchData(LoadObj);
        updatedList[key] = data;
      }
      setLeaveList({...BaseObj,...({data: { date: YearStr, shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: 'HR : Get Leave balance'})});
      
      setSupport(prev => ({ ...prev, ...updatedList }));
      GetLeavePeriod({ ...support, ...updatedList });
    };
    
    const InitialLoad = async (leave:string) => {
      
      const YearStr = apply.startdate.getFullYear().toString();
      
      const LoadObj = {...BaseObj,...({data: { date: YearStr, shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: 'HR : Get Leave balance'})}
      const data = await FetchData(LoadObj);
      const item = data.find((i: GenericObject) => i.internalid === leave);
      if (item) {
        updateApply('leave', item);
        updateApply('balance', item.balance);
      }

      setYear(YearStr);
    }

    const HandleSubmit = async () => {
      ShowLoading({msg:'Loading...'});
      const DataObj:GenericObject= {...apply,startdate:apply.startdate.toISOString().split('T')[0],enddate:apply.enddate.toISOString().split('T')[0]}
      const NewObj = {...BaseObj,command:'HR : Submit Leave',data:apply}
      const final = await FetchData(NewObj);
      const ConfirmObj = {
          msg:'Leave Request Submitted',
          icon:{label:<Ionicons name="checkmark"style={{fontSize:50,color:'green'}}/>,visible:true},
          cancel:{visible:false}
        };
      HideLoading({confirmed: true, value: ''})
      let result = await ShowPrompt(ConfirmObj)
      router.replace({ pathname:pathname as any,params: { category: 'leave' } })
    }


    useEffect(() => {
      if (apply.startdate.getFullYear() !== apply.enddate.getFullYear()) {
        setSupport({ public: [], working: [] });
        ShowPrompt({msg:'The leaves selected cross calendar year. Please change your dates.'});
        return;
      }
      if (apply.startdate.getFullYear() != year) {
        setYear(apply.startdate.getFullYear().toString())
        return;
      }
      GetLeavePeriod(support);
      
    }, [memoApply]);
  
    useEffect(()=> {
      GetSupport()
    },[year])
  
    useEffect(() => {
      if (pageInit.current && leave && leave != '0') {
        InitialLoad(leave);
        pageInit.current = false;
      }
      
    },[leave])
    
    
    return (
      <>
      {!isWeb && (
        <View style={[Header.container,{flexDirection:'row'}]}>
            <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({pathname:pathname as any,params: { category: 'leave' } })}>
                <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
            </TouchableOpacity>
            <Text style={[Header.text,{flex:1,width:'auto'}]}>Apply Leave</Text>
            <TouchableOpacity disabled={true} style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({ pathname:pathname as any,params: { category: 'submit-leave' } })}>
                <Ionicons name="add" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30,color:Theme.background}]} />
            </TouchableOpacity>
        </View>
        )}
      <FormContainer scheme={scheme}>
        <FormDateInput 
          mode="range" 
          mandatory={true} 
          label="Start Date" 
          def={{ date: apply.startdate, startDate: apply.startdate, endDate: apply.enddate }}
          onChange={({ startDate, endDate }) => { updateApply('startdate', HandleDate(startDate)); updateApply('enddate', HandleDate(endDate)); }} 
          scheme={scheme}
        />
        <FormAutoComplete 
           label="AM/PM " 
           AddStyle={{StyleInput:{marginRight:0,flex:1}}} 
           mandatory={true} 
           def={apply.startam} 
           searchable={false} 
           onChange={(item) => updateApply('startam', item)} 
           Defined={[{internalid:'3',name:'Full Day'}, {internalid:'1',name:'AM'}, {internalid:'2',name:'PM'}]} 
           scheme={scheme}
         />
        
        <FormDateInput 
          mode="range" 
          mandatory={true} 
          label="End Date" 
          def={{ date: apply.enddate, startDate: apply.startdate, endDate: apply.enddate }}
          onChange={({ startDate, endDate }) => { updateApply('startdate', HandleDate(startDate)); updateApply('enddate', HandleDate(endDate)); }} 
          scheme={scheme} 
        />
        <FormAutoComplete 
           label="AM/PM "  
           AddStyle={{StyleInput:{flex:1,marginRight:0}}} 
           mandatory={true} 
           def={apply.startam} 
           searchable={false} 
           onChange={(item) => updateApply('endam', item)} 
           Defined={[{internalid:'3',name:'Full Day'}, {internalid:'1',name:'AM'}, {internalid:'2',name:'PM'}]}
           scheme={scheme}
          />
        <FormTextInput disabled label="Days Applied" key={apply.day} def={apply.day} onChange={(text) => updateApply('day', text)} scheme={scheme}/>
        <FormAutoComplete 
           label="Leave Type " 
           AddStyle={{StyleInput:{flex:1,marginRight:0}}} 
           mandatory={true} 
           def={apply.leave} 
           searchable={false} 
           onChange={(item) => {updateApply('leave', item);updateApply('balance',item.balance)}} 
           LoadObj={leaveList}
           scheme={scheme} 
         />
        <FormTextInput disabled label="Leave Balance" key={apply.balance} def={apply.balance} onChange={(text) => updateApply('balance', text)} scheme={scheme}/>
        <FormTextInput label="Reason" mandatory={true} key={apply.reason} def={apply.reason} onChange={(text) => updateApply('reason', text)} scheme={scheme} />
        <FormAttachFile label="Attach File " mandatory={apply.leave?.mandatory??false}  def={apply.file} onChange={(file) => {updateApply('file',file)}} scheme={scheme} />
        <View style={{flex:1}} />
        <FormSubmit onPress={()=> {return HandleSubmit()}} scheme={scheme}/>
      </FormContainer>
      </>
    );
    
  }
  
  export const Leave = ({ category, id, user,BaseObj,scheme,leave}: LeaveProps) => {
    const { Page } = ThemedStyles(scheme??'light');
    
  
    switch (category) {
      case 'submit-leave':
          return (
          <View style={[Page.container]}>
            {/*HEADER */}
            
            <ApplyLeave id={id} user={user} BaseObj={BaseObj} scheme={scheme??'light'} leave={leave??'0'}/>
          </View>
          )
      default :
          return <LeaveMain user={user} BaseObj={BaseObj} scheme={scheme??'light'} />
    }
  }
  