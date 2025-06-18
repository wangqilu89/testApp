
import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView} from 'react-native';
import Modal from "react-native-modal";
import { useEffect, useState,useMemo} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import { useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData,SearchField,ProperCase,NumberComma} from '@/services'; // 👈 functions
import { NoRecords, MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { usePrompt } from '@/components/AlertModal';
import { useUser } from '@/components/User';
import { useListFilter } from '@/hooks/useListFilter'

import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps} from '@/types';


const approvals:MenuOption[] = [
  { internalid: 'personal', name: 'Personal Information',icon:'person-outline'},
  { internalid: 'leave', name: 'Leaves',icon:'calendar-outline'},
  { internalid: 'expense', name: 'Claims',icon:'card-outline'},
  { internalid: 'payslip', name: 'Download Pay Slip',icon:'document-text-outline'}
];


function MainScreen() {
  return (
    <MainPage redirect="hr" pages={approvals} title="HR"/>
  );
}

//Expense CLaims
function ExpenseMain({user}: PageProps) {

  interface RowProps extends Omit<PageInfoRowProps,'columns'> {
    'columns': PageInfoColProps
  }

  const { visibility } = usePrompt();
  const pathname = usePathname();
  const router = useRouter();
  const { Page, Header, Listing, Form, CategoryButton, Theme } = useThemedStyles();
  const isWeb = useWebCheck();
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

  const { list, displayList,expandedKeys, search,setSearch, loadMore,HandleExpand} = useListFilter({
    LoadObj:{...BaseObj,command:'HR : Get Expense List' },
    SearchFunction: (i, keyword) => {
      return i.flatMap((j) => {
        const CheckA = Object.values(j).some((val) => 
            String(typeof val === 'object' ? '' : val).toLowerCase().includes(keyword)
        )
        const newArry = (CheckA)?(j.line):(j.line?.filter((item: GenericObject) =>
          Object.values(item).some((val) =>
            String(typeof val === 'object' ? val?.name ?? '' : val)
              .toLowerCase()
              .includes(keyword)
          )
        ));
        return newArry.length > 0 ? [{...i,line:newArry}] : [];
      });
    }
  });

  const COLUMN_CONFIG: PageInfoColConfig= {
    header: [{internalid:'employee'},{internalid:'date'},{internalid:'document_no'},{internalid:'val_amount',value:{handle:NumberComma}}],
    line: [{internalid:'category'},{internalid:'date'},{internalid:'project'},{internalid:'memo'},{internalid:'status'},{internalid:'val_amount'}]
  };

  
  const ColumnInfo = ({columns,index,item,expanded}: RowProps) => {
    return (
        <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index == '0'?1:0}}>
            <View style={{width:150}}>
              <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                {columns?.name??ProperCase(columns.internalid.replace('val_',''))}
              </Text>
            </View>
            <View style={{flex:1}}>
              <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                {columns?.value?.handle?.(item[columns.internalid] ?? '')}
              </Text>
            </View>
        </View>
    )
  }

  const RowInfo = ({expanded,item,columns}:PageInfoRowProps) => {
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:30,marginRight:30}} onPress={() => HandleExpand(item.internalid)}>
            {Array.isArray(columns) ?
              columns.map((colName, index) => (
                <ColumnInfo columns={colName} index={index} item={item} expanded={expanded}/>
              ))
              :<></>
            }
        </TouchableOpacity>
        <Modal isVisible={expanded} >
            <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',maxHeight:"85%"}}>
                <TouchableOpacity onPress={() => HandleExpand(item.internalid)} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>
                <ScrollView>
                <FlatList style={[Form.container,{backgroundColor:Theme.containerBackground}]}
                        data={item.line}
                        keyExtractor={(lineitem) => lineitem.internalid}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => {
                            const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)
                            return (
                                <View style={{backgroundColor:Theme.pageBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
                                    <TouchableOpacity disabled={WithFile} style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => Linking.openURL(item.file)}>
                                        <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23},WithFile?{color:Theme.pageBackground}:{}]} />
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}}  onPress={() => Linking.openURL(item.file)}>
                                        {COLUMN_CONFIG.line.map((colName, index) => (
                                            <ColumnInfo columns={colName} index={index} item={item} expanded={true} />
                                        ))}
                                    </TouchableOpacity>
                                </View>
                            )
                        }}
                    />
                </ScrollView>
            </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
      <>
      {!isWeb && (
          <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              <Text style={[Header.text,{flex:1,width:'auto'}]}>List of Claims</Text>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({ pathname:pathname as any,params: { category: 'submit-expense' } })}>
                  <Ionicons name="add" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
          </View>
      )}
      {list.length > 0 ? (
            <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1}}>
                {/*Search*/}
                <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
                {/*LISTING*/}
                
                <FlatList
                    style={[Form.container]}
                    data={displayList}
                    keyExtractor={(item) => item.internalid}
                    renderItem={({ item }) => {
                        return (
                          <RowInfo key={item.internalid} expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG['header']} selected={false} />
                        )
                    }}
                    onEndReached={() => {
                        if (displayList.length < list.length) {
                        loadMore();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                />
            </View>
      ) : (!visibility && 
          <View style={{flex:1,flexDirection:'column',width:'100%'}}>
              <NoRecords />
          </View>

      )}
      </>
    </View>
    
  )
}

function ApplyClaim({ category,id, user }: PageProps) {
  type LineItem = {
    number: string,
    expense_date:string,
    date: Date,
    internalid: string,
    project: GenericObject,
    category: GenericObject,
    memo: string,
    val_amount: string,
    file: any
  };

  const { Page, Header, Listing, Form, ListHeader, CategoryButton, Theme } = useThemedStyles();
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date()
  const isWeb = useWebCheck(); 
  const [currentLine, setCurrentLine] = useState(0);
  const [showLine,setShowLine]= useState(false);
  const [claim,setClaim] = useState<{internalid:string,date:Date,document_number:string,employee:GenericObject,line:GenericObject[]}>({internalid:'',date:today,document_number:'To Be Generated',employee:{},line:[]});
  const [line,setLine] = useState({number:'0',expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),date:today,internalid:id + '.0',project:{},category: {},memo:'','val_amount':'0',file: null as any});
  const { ShowLoading,HideLoading} = usePrompt();
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
  
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'number'},
    {internalid:'expense_date'},
    {internalid:'project'},
    {internalid:'val_amount',value:{handle:NumberComma}}
  ]

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
  
  interface RowProps extends Omit<PageInfoRowProps,'columns'> {
    'columns': PageInfoColProps
  }

  const RowInfo = ({columns,index,item}: RowProps) => {
    return (
        <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
            <View style={{width:150}}>
              <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                {columns?.name??ProperCase(columns.internalid.replace('val_',''))}
              </Text>
            </View>
            {typeof item[columns.internalid] == 'object' 
            ? (<View style={{flex:1}}><Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{columns?.value?.handle?.(item[columns.internalid]['name']??'')}</Text></View>) 
            : (<View style={{flex:1}}><Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{columns?.value?.handle?.(item[columns.internalid]??'')}</Text></View>)
            }
        </View>
    )
  }
  const AnimatedRow = ({item,columns}:PageInfoRowProps) => {
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:30,marginRight:30}} onPress={() => {setLine(item as LineItem);setShowLine(true)}}>
            {Array.isArray(columns)?
              columns.map((colName, index) => (
                <RowInfo columns={colName} index={index} item={item}/>
              )):<></>
          }
        </TouchableOpacity>
      </View>
    );
  };
  
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
  
  const ExpenseHeader = () => {
    
    return (
      <FormContainer>
        <FormTextInput label="ID " def={claim.internalid} onChange={(text) => {updateMain('internalid', text)}} AddStyle={{StyleRow:{display:'none'}}} />
        <FormDateInput disabled={true} label='Date ' def={{date:claim.date}} onChange={({date})=>{updateMain('date',date)}}/>
        <FormTextInput disabled={true} label="Document Number " key={claim.document_number} def={claim.document_number} onChange={(text) => {updateMain('document_number', text)}}/>
        <FormAutoComplete label="Employee "  def={claim.employee} searchable={false} disabled={true} onChange={(item)=>{updateMain('employee', item)}} LoadObj={{ ...BaseObj, command: "HR : Get Employee Listing",data:{keyword:BaseObj.user}}} />
        
        <FlatList
          style={[Form.container,{paddingHorizontal:0}]}
          data={claim.line}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
                <View style={[ListHeader.container,{marginTop:20,flexDirection:'row',backgroundColor:Theme.backgroundReverse}]}>
                    <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:-1,fontSize:23,color:Theme.backgroundReverse}]} />
                    <Text style={[ListHeader.text,{fontSize:18,flex:1}]}>Line Items</Text>
                    <TouchableOpacity style={{flex:-1}}  onPress={() => {setLine({number:currentLine.toString(),expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),date:today,internalid:claim.internalid + '.' + currentLine,project:{},category:{},memo:'',val_amount:'0',file:null});setShowLine(true)}}>
                      <Ionicons name="add" style={[CategoryButton.icon,Listing.text,{fontSize:23,color:Theme.textReverse}]} />     
                    </TouchableOpacity>                     
                </View>
            }
          keyExtractor={(item) => item.internalid}
          renderItem={({ item }) => {
            return (
              <AnimatedRow item={item} columns={COLUMN_CONFIG} />
            )
          }}
          
        />
        {claim.line.length > 0 && (<FormSubmit onPress={()=>{}}/>)}
      </FormContainer>
    )
  }

  const ExpenseLine = () => {
    
    return (
      <FormContainer>
        <FormTextInput label="ID " def={line.internalid} onChange={(text) => updateLine('internalid', text)} AddStyle={{StyleRow:{display:'none'}}}/>
        <FormDateInput label='Date ' def={{date:line.date}} onChange={({date})=>{updateLine('date',date)}}/>
        <FormAutoComplete label="Project "  def={line.project} searchable={true} onChange={(item)=>{updateLine('project',item)}} LoadObj={{ ...BaseObj, command: "HR : Get Project Listing" }} SearchObj={{ ...BaseObj, command: "HR : Get Project Listing" }} />
        <FormAutoComplete label="Category "  def={line.category} searchable={true} onChange={(item)=>{updateLine('category',item)}} LoadObj={{ ...BaseObj, command: "HR : Get Category Listing" }} SearchObj={{ ...BaseObj, command: "HR : Get Category Listing" }} />
        <FormTextInput label="Memo " def={line.memo} onChange={(text) => updateLine('memo', text)}/>
        <FormNumericInput label="Value " def={line.val_amount} onChange={(text) => updateLine('val_amount', text)} />
        <FormAttachFile label="Attach File " def={line.file} onChange={(file) => {updateLine('file',file)}} />
        <View style={{flex:1}} />
        <FormSubmit label={currentLine == parseInt(line.number)?'Add':'Update'} onPress={()=>{submitLine(line);setShowLine(false);}}/>
      </FormContainer>
    )
  }

  useEffect(() => {
      loadData(id);
  }, [id]);

  return (
      <View style={[Page.container]}>
            {!isWeb ? (
              <>
              <View style={[Header.container,{flexDirection:'row'}]}>
                  <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => {if (showLine) {setLine({number:'0',date:today,expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),internalid:claim.internalid + '.0',project:{},category:{},memo:'',val_amount:'0',file:null});setShowLine(false);} else {router.replace({pathname:pathname as any})}}}>
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

function ExpenseClaim({ category, id, user }: PageProps) {

  switch (category) {
    case 'submit-expense':
        return <ApplyClaim category={category} id={id} user={user} />
    default :
        return <ExpenseMain user={user}  />
  }
}


//Leave Functions
function LeaveMain({user}: { user: GenericObject | null;}) {
  const {Page,Header,CategoryButton,Theme} = useThemedStyles();
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
          <LeaveMainBal user={user} today={today}/>
        )}
        {activeTab === 'application'  && (
          <LeaveMainApply user={user} today={today}/>
        )}
    </View>   
  )
}

function LeaveMainBal ({user,today}: { user: GenericObject | null;today:Date}) {
  const { Listing, Form,Theme } = useThemedStyles();
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
    
  const { list} = useListFilter({LoadObj:{...BaseObj,data:{date:today.getFullYear()},command: "HR : Get Leave balance" }});

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
                <TouchableOpacity style={{flexDirection:'column',alignItems:'flex-start',flex:1,paddingLeft:30}} onPress={() => {}}>
                  <Text style={[Listing.text,{fontSize: 20}]}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => {}}>
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

function LeaveMainApply ({user,today}: { user: GenericObject | null;today:Date}) {
  const {Listing,Form,CategoryButton,Theme} = useThemedStyles();
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

  const {list,displayList,expandedKeys, search, setSearch, loadMore,HandleExpand} = useListFilter({
    LoadObj:{...BaseObj,data:{date:today.getFullYear()},command:'HR : Get Leave application' },
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
    {internalid:'leave_no'},
    {internalid:'memo'},
    {internalid:'val_days',value:{handle:NumberComma}}
  ]
  

  const RowInfo = ({expanded,item,columns}:PageInfoRowProps) => {    
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
            {newCol.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                <View style={{width:150}}>
                  <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                    {colName?.name??ProperCase(colName.internalid.replace('val_',''))}
                  </Text>
                </View>
                <View style={{flex:1}}>
                  <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                    {colName?.value?.handle?.(item[colName.internalid] ?? '')}
                  </Text>
                </View>
              </View>
            ))}
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
        <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
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
              loadMore();
              }
          }}
          onEndReachedThreshold={0.5}
          
        />
    </View>
  )
}

function ApplyLeave({ id, user }: { id: string; user: GenericObject | null }) {

  const { ShowPrompt } = usePrompt();

  const BaseObj = {user:(user?.id??'0'),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
  
  const [year, setYear] = useState('');
  const [apply, setApply] = useState<GenericObject>({
    startdate: new Date(),
    enddate: new Date(),
    startam: 1,
    endam: 1,
    day: 1,
    leave: {}
  });
  const [loadObj, setLoadObj] = useState({...BaseObj,...({data: { date: apply.startdate.getFullYear(), shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: 'HR : Get Leave balance'})});
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
        applied = NewList.working[dayofweek]?.day ?? 0 * (apply.startam === 1 ? 1 : 0.5);
      } 
      else if (CompareDates(refdate, enddate) === 0) {
        applied = NewList.working[dayofweek]?.day ?? 0 * (apply.startpm === 1 ? 1 : 0.5);
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
    setLoadObj({...BaseObj,...({data: { date: YearStr, shift: user?.shift ?? 0, subsidiary: user?.subsidiary ?? 0 },command: 'HR : Get Leave balance'})});
    
    setSupport(prev => ({ ...prev, ...updatedList }));
    GetLeavePeriod({ ...support, ...updatedList });
  };

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

  
  
  return (
    <FormContainer>
      <FormDateInput mode="range" label="Start Date" def={{ date: apply.startdate, startDate: apply.startdate, endDate: apply.enddate }}
        onChange={({ startDate, endDate }) => { updateApply('startdate', HandleDate(startDate)); updateApply('enddate', HandleDate(endDate)); }} />
      <FormAutoComplete label="AM/PM "  def={apply.startam} searchable={false} onChange={(item) => updateApply('startam', item)} Defined={[{ name: 'Full Day', id: 1 }, { name: 'AM', id: 2 }, { name: 'PM', id: 3 }]} />
      
      <FormDateInput mode="range" label="End Date" def={{ date: apply.enddate, startDate: apply.startdate, endDate: apply.enddate }}
        onChange={({ startDate, endDate }) => { updateApply('startdate', HandleDate(startDate)); updateApply('enddate', HandleDate(endDate)); }} />
      <FormAutoComplete label="AM/PM "  def={apply.startam} searchable={false} onChange={(item) => updateApply('startam', item)} Defined={[{ name: 'Full Day', id: 1 }, { name: 'AM', id: 2 }, { name: 'PM', id: 3 }]} />
      <FormTextInput disabled label="Days Applied" key={apply.day} def={apply.day} onChange={(text) => updateApply('day', text)} />
      <FormAutoComplete label="Leave Type "  def={apply.leave} searchable={false} onChange={(item) => updateApply('leave', item)} LoadObj={loadObj} />
      
      <FormTextInput label="Reason" key={apply.reason} def={apply.reason} onChange={(text) => updateApply('reason', text)} />
    </FormContainer>
  );
  
}

function Leave({ category, id, user }: { category: string; id: string; user: GenericObject | null }) {
  const { Page } = useThemedStyles();

  switch (category) {
    case 'submit-leave':
        return (
        <View style={[Page.container]}>
          <ApplyLeave id={id} user={user} />
        </View>
        )
    default :
        return <LeaveMain user={user} />
  }
}

//PaySlip

function PaySlip({ category,user}: { category: string,user:GenericObject|null}) {
  const { ShowPrompt} = usePrompt();
  const pathname = usePathname();
  const router = useRouter();
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,ListHeader,Page,Header,Theme,CategoryButton} = useThemedStyles()
  const BaseObj = {user:(user?.id??'0'),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
  const BaseURL = 'https://6134818.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1325&deploy=2&compid=6134818&ns-at=AAEJ7tMQJ3SMaw4sy0kmPgB70YakOyRxtZWjGXjhVrFJF6GqVtI&recordType=payslip&recordId='
  
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'employee'},
    {internalid:'period'},
    {internalid:'val_summary',value:{handle:NumberComma}}
  ]

  const {list,displayList,setSearch,search,loading,loadMore,HandleSelect,selectedKeys,HandleSelectAll,selectAll} = useListFilter({
    LoadObj:{...BaseObj,command:'HR : Get payslip List'},
    SearchFunction: (i, keyword) => {
      return i.flatMap((j) => {
        const CheckA = Object.values(j).some((val) => 
            String(typeof val === 'object' ? '' : val).toLowerCase().includes(keyword)
        )
        const newArry = (CheckA)?(j.line):(j.line?.filter((item: GenericObject) =>
          Object.values(item).some((val) =>
            String(typeof val === 'object' ? val?.name ?? '' : val)
              .toLowerCase()
              .includes(keyword)
          )
        ));
        return newArry.length > 0 ? [{...i,line:newArry}] : [];
      });
    }
  });

  const RowInfo = ({item,selected,columns}:PageInfoRowProps) => {
   
    return (
      <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => HandleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          {item.file &&  (
            <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {Linking.openURL(BaseURL + item.internalid)}}>
            {Array.isArray(columns)?
              columns.map((colName, index) => (
                <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                  <View style={{width:150}}>
                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                      {colName?.name??ProperCase(colName.internalid.replace('val_',''))}
                    </Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                      {colName?.value?.handle?.(item[colName.internalid] ?? '')}
                    </Text>
                  </View>
                </View>
              )):
              <></>
            }
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',justifyContent:'center',alignItems:'center',flex:-1,height:'100%'}} onPress={() => Linking.openURL(BaseURL + item.internalid)}>
          <Ionicons name="chevron-forward" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      
      </View>
    );
  };
  
  
  const HandleDownload = async () => {
    if (selectedKeys.length === 0) {
        ShowPrompt({msg:'Please select at least one record.'})
        return;
    }
    Linking.openURL(BaseURL + selectedKeys.join('|'))
  };
  
  return (

        <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          {/*HEADER */}
          {!isWeb && (
            <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center',flex:-1,marginLeft:5}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              <Text style={[Header.text,{flex:1,width:'auto'}]}>{category.toUpperCase()}</Text>
              <TouchableOpacity onPress={HandleSelectAll} style={{alignItems:'center',justifyContent:'center',flex:-1,marginRight:10}}>
                <Ionicons name={selectAll?"square-outline":"checkbox-outline"} style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                
              </TouchableOpacity>
            </View>
          )}
          {list.length > 0 ? (
          
            <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1}}>
              {/* Payslip List */}
              {/*Search*/}
              <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
              
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                
                renderItem={({ item }) => {
                  return (
                    <RowInfo item={item} selected={selectedKeys.includes(item.internalid)} columns={COLUMN_CONFIG} />
                  )
                }}
                onEndReached={() => {
                  if (displayList.length < list.length) {
                    loadMore();
                  }
                }}
                onEndReachedThreshold={0.5}
              />

              {/*Button */}
              {selectedKeys.length > 0 && (
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'center', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={HandleDownload} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Download</Text>
                  </TouchableOpacity>
                  
                </View>
              )}

            </View>
          ):(!loading && 
            <NoRecords/>

          )}

        </View>
    
  );
}

function DocumentView({url,doc}:{url:string,doc:string}) {

    return (
        <MainViewer url={url} doc={doc} />
    )

}

export default function HRScreen() {
    const {category,id = '0',url = '',doc = ''} = useLocalSearchParams<Partial<{ category: string; id: string; url: string; doc: string }>>();
    const { user} = useUser(); // ✅ Pull from context
    
    switch (category){
        case 'attachment':
            return <DocumentView url={url} doc={doc} />;
        
        case 'expense' :
        case 'submit-expense':
            return <ExpenseClaim category={category} id={id} user={user as User}/>;
        
        case 'leave' :
        case 'submit-leave':
          return <Leave category={category} id={id} user={user}/>;

        case 'payslip'  :
            return <PaySlip category={category} user={user}/>;

        default:
            return <MainScreen />;
    }
    
}

