
import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView,StyleSheet} from 'react-native';
import { useFonts, Righteous_400Regular } from '@expo-google-fonts/righteous';
import Modal from "react-native-modal";
import { useEffect, useState,useMemo} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import Animated from 'react-native-reanimated';
import { useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData,SearchField} from '@/services'; // 👈 functions
import { NoRecords, MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { useAlert } from '@/components/AlertModal';
import { useUser } from '@/components/User';

import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';
import DateTimePicker,{DateType} from 'react-native-ui-datepicker';
import { DatePickerMultipleProps } from 'react-native-ui-datepicker/lib/typescript/datetime-picker';

const approvals = [
  { id: 'personal', title: 'Personal Information',icon:'person-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'expense', title: 'Claims',icon:'card-outline'},
  { id: 'payslip', title: 'Download Pay Slip',icon:'document-text-outline'}
];

const toProperCase = (str:string) => {
    return str.toLowerCase().split(/_/g).map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
} 
const pattern  = new RegExp('val')

const NumberComma = (str:string|number) => {
    if (typeof str == 'string') {
        return parseFloat(str).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    return str.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

type GenericObject = Record<string, any>;

function MainScreen() {
  return (
    <MainPage redirect="hr" pages={approvals} title="HR"/>
  );
}

function ExpenseClaim({ category,id,user}: { category: string, id:string,user:GenericObject|null}) {
    const { ShowAlert,ShowLoading,HideLoading,loadingVisible} = useAlert();
    const pathname = usePathname();
    const router = useRouter();
    const {Page,Header,Listing,Form,ListHeader,CategoryButton,Theme} = useThemedStyles();
    const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
    
    

    {/*Screens*/}
    const ExpenseMain = () => {
        const [list, setList] = useState<GenericObject[]>([]);
        const [displayList, setDisplayList] = useState<GenericObject[]>([]); // ✅ Add this
        const [expandedKeys,setExpandedKeys] = useState<string[]>([]);
        const [search, setSearch] = useState('');
        const [page, setPage] = useState(1);
        const pageSize = 10; // Show 10 items at a time
        const isWeb = useWebCheck(); // Only "true web" if wide   
        const COLUMN_CONFIG: { header: string[]; line: string[] } = {
            header: ['employee','date','document_no','val_amount'],
            line: ["category","date","project","memo","status","val_amount"]
        };
        
        
        /*Function */
        const loadData = async () => {
            ShowLoading('Loading List...')
            try {
                let data = await FetchData({...BaseObj,command:'HR : Get Expense List'});
                data = data|| []
                setList(data);
                setDisplayList(data); // Show only first 20 items initially
            } 
            catch (err) {
                console.error(`Failed to fetch ${category} :`, err);
            } 
            finally {
                HideLoading();
            }
        }
        
        const loadMore = () => {
            const nextPage = page + 1;
            const nextItems = list.slice(0, nextPage * pageSize); // Expand by another 20 items
            setDisplayList(nextItems);
            setPage(nextPage);
        };

        const toggleCollapse = (key: string) => {
            setExpandedKeys((prev) =>
              prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
            );
        };

        /*React Objects */
        const AnimatedRow = ({isExpanded,item,colNames}:{isExpanded:boolean,item:GenericObject,colNames:string[]}) => {
            const RowInfo = ({colName,index,item,isExpanded}: {colName:string,index:number,item:GenericObject,isExpanded:boolean}) => {
                return (
                    <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                        <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{toProperCase(colName.replace('val_',''))}</Text></View>
                        <View style={{flex:1}}><Text numberOfLines={isExpanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{(pattern.test(colName)?NumberComma(item[colName]??0):(item[colName] ?? ''))}</Text></View>
                    </View>
                )
                
            }
            return (
              <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
                <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:30,marginRight:30}} onPress={() => toggleCollapse(item.internalid)}>
                    {colNames.map((colName, index) => (
                        <RowInfo colName={colName} index={index} item={item} isExpanded={isExpanded}/>
                    ))}
                </TouchableOpacity>
                <Modal isVisible={isExpanded} >
                    <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',maxHeight:"85%"}}>
                        <TouchableOpacity onPress={() => toggleCollapse(item.internalid)} style={{alignItems:'flex-end'}}><Ionicons name='close-outline' style={{fontSize:30}}/></TouchableOpacity>
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
                                                    <RowInfo colName={colName} index={index} item={item} isExpanded={true} />
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

        useEffect(() => {
            loadData();
        
        }, []);
        useEffect(() => {
            setExpandedKeys([]);
          }, [search]);
          
        useEffect(() => {
            const keyword = search.trim().toLowerCase();
            if (keyword === '') {
                const paginated = list.slice();
                setDisplayList(paginated);
            } 
            else {
                
                const filtered = list.flatMap((i) => {
                    const CheckA = Object.values(i).some((val) => 
                        String(typeof val === 'object' ? '' : val).toLowerCase().includes(keyword)
                    )
                    const newArry = (CheckA)?(i.line):(i.line?.filter((item: GenericObject) =>
                      Object.values(item).some((val) =>
                        String(typeof val === 'object' ? val?.name ?? '' : val)
                          .toLowerCase()
                          .includes(keyword)
                      )
                    ));
                    return newArry.length > 0 ? [{...i,line:newArry}] : [];
                    
                });  
                setDisplayList(filtered);  
            }
            
        }, [search,page,list]);
        
        
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
                              <AnimatedRow isExpanded={expandedKeys.includes(item.internalid)} item={item} colNames={COLUMN_CONFIG['header']} />
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
            ) : (!loadingVisible && 
                <View style={{flex:1,flexDirection:'column',width:'100%'}}>
                    <NoRecords />
                </View>

            )}
            </>
        </View>
        
        )
    }
    
    const ClaimForm = ({id}:{id:string}) => {
        type LineItem = {number: string;expense_date:string,date: Date;internalid: string;project: GenericObject;category: GenericObject;memo: string;val_amount: string;file: any};
        const today = new Date()
        const isWeb = useWebCheck(); 
        const [currentLine, setCurrentLine] = useState(0);
        const [showLine,setShowLine]= useState(false);
        const [claim,setClaim] = useState<{internalid:string,date:Date,document_number:string,employee:GenericObject,line:GenericObject[]}>({internalid:'',date:today,document_number:'To Be Generated',employee:{},line:[]});
        const [line,setLine] = useState({number:'0',expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),date:today,internalid:id + '.0',project:{},category: {},memo:'','val_amount':'0',file: null as any});

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

        const AnimatedRow = ({item,colNames}:{item:GenericObject,colNames:string[]}) => {
          const RowInfo = ({colName,index,item}: {colName:string,index:number,item:GenericObject}) => {
              return (
                  <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                      <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{toProperCase(colName.replace('val_',''))}</Text></View>
                      {typeof item[colName] == 'object' 
                      ? (<View style={{flex:1}}><Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{(pattern.test(colName)?NumberComma(item[colName]['name']??0):(item[colName]['name'] ?? ''))}</Text></View>) 
                      : (<View style={{flex:1}}><Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{(pattern.test(colName)?NumberComma(item[colName]??0):(item[colName] ?? ''))}</Text></View>)
                      }
                      
                  </View>
              )
              
          }
          return (
            <View style={{backgroundColor:Theme.containerBackground,flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
              <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:30,marginRight:30}} onPress={() => {setLine(item as LineItem);setShowLine(true)}}>
                  {colNames.map((colName, index) => (
                      <RowInfo colName={colName} index={index} item={item}/>
                  ))}
              </TouchableOpacity>
            </View>
          );
        };
        
        const loadData = async (id:string) => {
          ShowLoading('Loading List...')
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
            HideLoading()
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
              <FormAutoComplete disabled={true} label="Employee " key={claim.employee.name} def={claim.employee} onChange={(item)=>{updateMain('employee', item)}} loadList={() => FetchData({ ...BaseObj, command: "HR : Get Employee Listing",keyword:BaseObj.user})}/>
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
                    <AnimatedRow item={item} colNames={['number','expense_date','project','val_amount']} />

                    
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
              <FormAutoComplete label="Project " def={line.project} onChange={(item)=>{updateLine('project',item)}} loadList={(query: string) => FetchData({ ...BaseObj, command: "HR : Get Project Listing",keyword:query})}/>
              <FormAutoComplete label="Category " def={line.category} onChange={(item)=>{updateLine('category',item)}} loadList={(query: string) => FetchData({ ...BaseObj, command: "HR : Get Category Listing",keyword:query})}/>
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
    
    switch (category) {
        case 'submit-expense':
            return <ClaimForm id={id} />
        default :
            return <ExpenseMain />
    }

}

function Leave({ category,id,user}: { category: string, id:string,user:GenericObject|null}) {
    const { ShowAlert,ShowLoading,HideLoading} = useAlert();
    const pathname = usePathname();
    const router = useRouter();
    const {Page,Header,Listing,Form,ListHeader,CategoryButton,Theme} = useThemedStyles();
    const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
    

    const LeaveMain = () => {
        const [fontsLoaded] = useFonts({Righteous_400Regular});
        const [leaveData, setLeaveData] = useState<{balance: GenericObject[],application: GenericObject[];}>({balance: [],application: []});
        const [activeTab, setActiveTab] = useState<keyof typeof leaveData>('balance');

        const isWeb = useWebCheck(); // Only "true web" if wide
        const tabs : (keyof typeof leaveData)[] = ['balance','application']
        const today = new Date()      

        const [expandedKeys,setExpandedKeys] = useState<string[]>([]);
        const [search, setSearch] = useState('');
        const [page, setPage] = useState(1);
        const pageSize = 10; // Show 10 items at a time
        
        
        const updateData = (key:keyof typeof leaveData,value: any) => {
            setLeaveData(prev => ({ ...prev, [key]: value }));
        }

        const loadData = async (cmd:keyof typeof leaveData ="balance") => {
            if (leaveData[cmd].length == 0) {
              ShowLoading('Loading List...')
              try {
                  let data = await FetchData({...BaseObj,data:{date:today.getFullYear()},command:"HR : Get Leave " + cmd});
                  data = data|| []
                  updateData(cmd,data)
              } 
              catch (err) {
                  console.error(`Failed to fetch ${category} :`, err);
              } 
              finally {
                  HideLoading()
              }
            }
            
        }
        
        const AnimatedRow = ({isExpanded,item,colNames}:{isExpanded:boolean,item:GenericObject,colNames:string[]}) => {
            
            const newCol = useMemo(() => {
              return isExpanded ? colNames.slice() : (colNames.length > 3?[...colNames.slice(0, 3), ...colNames.slice(-1)]:colNames.slice());
            }, [isExpanded, colNames]);
            
            const toggleCollapse = (key: string) => {
                setExpandedKeys((prev) =>
                  prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                );
            };

            const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)

            return (
              <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
                <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => {}}>
                    <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23},item.file?{}:{color:Theme.containerBackground}]} />
                </TouchableOpacity>
                <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}} onPress={() => {}}>
                    {newCol.map((colName, index) => (
                      <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                        <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{toProperCase(colName.replace('val_',''))}</Text></View>
                        <View style={{flex:1}}><Text numberOfLines={isExpanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{item[colName] ?? ''}</Text></View>
                      </View>
                    ))}
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => toggleCollapse(item.internalid)}>
                  <Ionicons name={isExpanded?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
                </TouchableOpacity>
              
              </View>
            );
        };

        useEffect(() => {
            loadData(activeTab);
        }, [activeTab]);

        
        
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
                        <View style={{alignItems:'center',justifyContent:'center'}}><Text style={[Header.text,{color:((activeTab === tab)?Theme.mooreReverse:Theme.text)}]}>{toProperCase(tab)}</Text></View>
                        {activeTab === tab && (<View style={{width: 70,height: 3,backgroundColor:Theme.mooreReverse,borderRadius: 2,alignItems:'flex-start',justifyContent:'flex-start'}}></View>)}
                    </TouchableOpacity>
                ))}
            </View>
            {/*Balance */}
            {activeTab === 'balance'  && (
                <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1,marginTop:20}}>
                {/*LISTING*/} 
                <FlatList
                    style={[Form.container]}
                    data={leaveData.balance}
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
            )}
            
            {/*Application */}
            {activeTab === 'application'  && (
                <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1,marginTop:20}}>
                    {/*LISTING*/} 
                    <FlatList
                        style={[Form.container]}
                        data={leaveData.application}
                        keyExtractor={(item) => item.internalid}
                        renderItem={({ item }) => {
                            return (
                              <AnimatedRow isExpanded={expandedKeys.includes(item.internalid)} item={item} colNames={['employee','leave_type','leave_period','date_requested','leave_no','memo','val_days']} />
                            )
                        }}
                        
                        onEndReachedThreshold={0.5}
                    />
                </View>
            )}
             
        </View>
        )
    }

    const ApplyLeave = ({id}:{id:string}) => {
      
      const isWeb = useWebCheck(); 
      const [year,setYear] = useState('')
      const [apply,setApply] = useState<GenericObject>({startdate:new Date(),enddate:new Date(),startam:1,endam:1,day:1,leave:{}});
      const [list,setList] = useState<{public:GenericObject[],balance:GenericObject[],working:GenericObject[]}>({public:[],balance:[],working:[]})
      const memoApply = useMemo(() => apply, [apply.startdate, apply.enddate, apply.startam, apply.endam])
      
      
      const updateApply = (key:keyof typeof apply,value: any) => {
        setApply((prev) => {
          return {...prev, [key]: value }
        })
      };

      const CompareDates = (date1:Date,date2:Date) => {
        if (date1 > date2) {
          return 1
        } 
        else if (date1 < date2) {
          return 2
        } 
        else {
          return 0
        }
      };
      
      const GetLeavePeriod = (NewList:{public:GenericObject[],balance:GenericObject[],working:GenericObject[]}) => {
        
        const startdate = new Date(apply.startdate.getFullYear(),apply.startdate.getMonth(),apply.startdate.getDate())
        const enddate = new Date(apply.enddate.getFullYear(),apply.enddate.getMonth(),apply.enddate.getDate())
        let totalapplied = 0
        let refdate = new Date(startdate)
        refdate.setDate(refdate.getDate() - 1)
        
        do {
          let applied = 0
          refdate.setDate(refdate.getDate() + 1)
          const dayofweek = refdate.getDay()
          if (CompareDates(refdate,startdate) === 0 ) {
            //Start Date
            applied = NewList.working[dayofweek]?.day??0 * (apply.startam === 1?1:0.5)
          }
          else if (CompareDates(refdate,enddate) === 0) {
            //End Date
            applied = NewList.working[dayofweek]?.day??0 *(apply.startpm === 1?1:0.5)
          }
          else {
            applied = NewList.working[dayofweek]?.day??0 * 1
          }
          
          
          //PH Check
          
          for (const hol of NewList.public) {
            let phdate = hol.date.split('/')
            phdate = new Date(phdate[2],parseInt(phdate[1]) - 1,phdate[0])
            if (CompareDates(phdate,refdate) === 0) {
              applied = 0
              break;
            }
          }
          totalapplied += applied
        } while (CompareDates(refdate,enddate) === 2)
        
        updateApply('day',totalapplied && !isNaN(totalapplied) ? totalapplied : 0)
      };

      const GetBalance = async () => {
        const updatedList:GenericObject = {}
        const YearStr = apply.startdate.getFullYear().toString()
        if (YearStr != year) {
          setYear(YearStr)
          for (const key of Object.keys(list)) {
            let cmd = ''
            switch (key) {
              case 'balance':
                cmd = "HR : Get Leave balance"
              break;
              
              case 'public':
                cmd = "HR : Get Public Holiday"
              break;
              case 'working':
                cmd = "HR : Get Working day"
              break;
            }
            let data = await FetchData({...BaseObj,data:{date:apply.startdate.getFullYear(),shift:user?.shift??0,subsidiary:user?.subsidiary??0},command:cmd});
            updatedList[key] = data
            
          }
          setList((prev) => {
            const newList = { ...prev, ...updatedList };
            return newList;
          });
          
        }
        GetLeavePeriod({...list,...updatedList})
      };
      
      useEffect(() => {
        if (apply.startdate.getFullYear() != apply.enddate.getFullYear()) {
          setList({public:[],balance:[],working:[]});
          ShowAlert("The leaves selected cross calendar year.Please change your dates.");
          return
        }
        GetBalance();
      },[memoApply]);

      

      return (
        <FormContainer>
            <FormDateInput mode="range" label='Start Date ' def={{date:apply.startdate,startDate:apply.startdate,endDate:apply.enddate}} onChange={({startDate,endDate})=>{updateApply('startdate',startDate);updateApply('enddate',endDate);}}/>
            <FormAutoComplete label="AM/PM " def={apply.startam} onChange={(item)=>{updateApply('startam',item)}} items={[{name:'Full Day',id:1},{name:'AM',id:2},{name:'PM',id:3}]}/>
            <FormDateInput mode="range" label='End Date ' def={{date:apply.enddate,startDate:apply.startdate,endDate:apply.enddate}} onChange={({startDate,endDate})=>{updateApply('startdate',startDate);updateApply('enddate',endDate)}}/>
            <FormAutoComplete label="AM/PM " def={apply.endam} onChange={(item)=>{updateApply('endam',item)}} items={[{name:'Full Day',id:1},{name:'AM',id:2},{name:'PM',id:3}]}/>
            <FormTextInput disabled={true} label="Days Applied " key={apply.day} def={apply.day} onChange={(text) => {updateApply('day', text)}}/>
            <FormAutoComplete label="Leave Type " def={apply.leave} onChange={(item)=>{updateApply('leave',item)}} items={list.balance}/>
            <FormTextInput label="Reason " key={apply.reason} def={apply.reason} onChange={(text) => {updateApply('reason', text)}}/>
        </FormContainer>
      )
    }


    switch (category) {
        case 'submit-leave':
            return (
            <View style={[Page.container]}>
              <ApplyLeave id={id}/>
            </View>
            )
        default :
            return <LeaveMain />
    }
}

function PaySlip({ category,user}: { category: string,user:GenericObject|null}) {
  const { ShowAlert,ShowLoading,HideLoading,loadingVisible} = useAlert();
  const pathname = usePathname();
  const router = useRouter();
  const [list, setList] = useState<GenericObject[]>([]);
  const [displayList, setDisplayList] = useState<GenericObject[]>([]); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [massSelect, setmassSelect] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Show 10 items at a time
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,ListHeader,Page,Header,Theme,CategoryButton} = useThemedStyles()
  const BaseObj = {user:(user?.id??'0'),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
  const BaseURL = 'https://6134818.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1325&deploy=2&compid=6134818&ns-at=AAEJ7tMQJ3SMaw4sy0kmPgB70YakOyRxtZWjGXjhVrFJF6GqVtI&recordType=payslip&recordId='
  const COLUMN_CONFIG: string[] = ['employee','period','val_salary']

  const loadData = async () => {
    ShowLoading('Load List...')
    try {
      let data = await FetchData({...BaseObj,command:`HR : Get ${category} List`});
      data = data|| []
      setList(data);
      setDisplayList(data.slice(0, pageSize)); // Show only first 20 items initially
    } 
    catch (err) {
      console.error(`Failed to fetch ${category} :`, err);
    } 
    finally {
      HideLoading()
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextItems = list.slice(0, nextPage * pageSize); // Expand by another 20 items
    setDisplayList(nextItems);
    setPage(nextPage);
  };

  const AnimatedRow = ({item,selected,colNames}:{item:GenericObject,selected:boolean,colNames:string[]}) => {
   
    return (
      <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => toggleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          {item.file &&  (
            <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {Linking.openURL(BaseURL + item.internalid)}}>
            {colNames.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{toProperCase(colName.replace('val_',''))}</Text></View>
                <View style={{flex:1}}><Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{item[colName] ?? ''}</Text></View>
              </View>
            ))}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',justifyContent:'center',alignItems:'center',flex:-1,height:'100%'}} onPress={() => Linking.openURL(BaseURL + item.internalid)}>
          <Ionicons name="chevron-forward" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      
      </View>
    );
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
        const isSelected = prev.includes(id);
        const newSelectedIds = isSelected ? prev.filter((i) => i !== id) : [...prev, id];
        return newSelectedIds;

    });
  };

  const selectAll = () => {
    displayList.forEach((item) => {
        if (selectedIds.includes(item.internalid) != massSelect) {
            toggleSelect(item['internalid'])
        }
    })
    setmassSelect(!massSelect)
    
  };
  
  const handleDownload = async () => {
    if (selectedIds.length === 0) {
        ShowAlert('Please select at least one record.')
        return;
    }
    Linking.openURL(BaseURL + selectedIds.join('|'))
  };
  
  
  useEffect(() => {
    if (category && category != 'index') {
      loadData();
    }
  }, [category]);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    if (keyword === '') {
      const paginated = list.slice(0, page * pageSize);
      setDisplayList(paginated);
    } 
    else {
      const filtered = list.filter((item: GenericObject) =>
        Object.values(item).some((val) =>
          String(typeof val === 'object' ? val?.name ?? '' : val)
            .toLowerCase()
            .includes(keyword)
        )
      );
      setDisplayList(filtered);  
    }
            
  }, [search,page,list]);
  
  
  return (

        <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          {/*HEADER */}
          {!isWeb && (
            <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center',flex:-1,marginLeft:5}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              <Text style={[Header.text,{flex:1,width:'auto'}]}>{category.toUpperCase()}</Text>
              <TouchableOpacity onPress={selectAll} style={{alignItems:'center',justifyContent:'center',flex:-1,marginRight:10}}>
                <Ionicons name={massSelect?"square-outline":"checkbox-outline"} style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                
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
                    <AnimatedRow item={item} selected={selectedIds.includes(item.internalid)} colNames={COLUMN_CONFIG} />
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
              {selectedIds.length > 0 && (
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'center', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Download</Text>
                  </TouchableOpacity>
                  
                </View>
              )}

            </View>
          ):(!loadingVisible && 
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
            return <ExpenseClaim category={category} id={id} user={user}/>;
        
        case 'leave' :
        case 'submit-leave':
          return <Leave category={category} id={id} user={user}/>;

        case 'payslip'  :
            return <PaySlip category={category} user={user}/>;

        default:
            return <MainScreen />;
    }
    
}

