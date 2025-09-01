import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView} from 'react-native';
import { useEffect, useState,useMemo,useRef} from 'react';
import { useRouter, usePathname} from 'expo-router';
import { useWebCheck,FetchData,ProperCase,NumberComma} from '@/services'; // 👈 functions
import { NoRecords,} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { usePrompt } from '@/components/AlertModal';
import { useListPost } from '@/hooks/useListPost'
import { Ionicons } from '@expo/vector-icons'; 
import {ThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps} from '@/types';
import { SearchField } from '@/components/SearchField';

const ExpenseMain = ({user,BaseObj,scheme}: PageProps) =>{

  interface RowProps extends Omit<PageInfoRowProps,'columns'> {
    'columns': PageInfoColProps
  }
  const { visibility,ShowPrompt } = usePrompt();
  const pathname = usePathname();
  const router = useRouter();
  const { Page, Header, Listing, Form, CategoryButton, Theme,StatusColors } = ThemedStyles(scheme);
  const isWeb = useWebCheck();

  const { list, displayList,expandedKeys, search,setSearch, LoadMore,LoadAll,HandleSelect,selectedKeys,HandleSelectAll,selectAll,HandleAction} = useListPost({
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
    header: [{internalid:'employee'},{internalid:'date'},{internalid:'name',name:'Document No'},{internalid:'val_amount',value:{handle:NumberComma}}],
    line: [{internalid:'category'},{internalid:'date'},{internalid:'project'},{internalid:'memo'},{internalid:'name',name:'Status'},{internalid:'val_amount'}]
  };

  
  const ColumnInfo = ({columns,index,item,expanded}: RowProps) => {
    return (
        <View key={index} style={{flex:1,flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index == '0'?1:0}}>
            <View style={[{width:150},columns?.format?.StyleContainer]}>
              <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},columns?.format?.StyleLabel]}>
                {columns?.name??ProperCase(columns.internalid.replace('val_',''))}
              </Text>
            </View>
            <View style={[{flex:1},columns?.value?.format?.StyleContainer]}>
              <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},columns?.value?.format?.StyleLabel]}>
                {columns?.value?.handle?(columns.value.handle(item[columns.internalid] ?? '')):(item[columns.internalid] ?? '')}
              </Text>
            </View>
        </View>
    )
  }

  const ButtonAction = async (action:string,command:string,refresh:boolean,PromptObj:GenericObject) => {
    if (selectedKeys.length === 0) {
      ShowPrompt({msg:"Please select at least one record."});
      return;
    }
    else {
      let result:GenericObject
      let proceed:boolean
      do {
        proceed = true
        result = await ShowPrompt(PromptObj as any)
        proceed = (!result.value && result.confirmed && PromptObj.input.visible)?false:true
      } while (!proceed)
      if (result.confirmed) {
        const itemcmd = command.split(':')[1].trim()
        let data:GenericObject[] = []
        selectedKeys.forEach((id:string) => {
          const item = list.find((i: GenericObject) => i.internalid === id);
          if (item) {
            data.push({internalid:id,command:itemcmd,reason:result.value,transtype:item.transtype})
          }
        })
        const response = await HandleAction(action,command,refresh,data)
      }
      
    }
  }

  const PromptObj = {
      msg: selectedKeys.length + ' claims will be submited.',
      icon:{label:<Ionicons name="help-outline"style={{fontSize:50,color:'orange'}}/>,visible:true},
      input:{visible:false}
    }

  const RowInfo = ({selected,expanded,item,columns}:PageInfoRowProps) => {
    
    const DocColor = (StatusColors[item?.status]??Theme.text)
    const ExpenseLine = <ScrollView>
                          <FlatList style={[Form.container,{backgroundColor:Theme.containerBackground}]}
                                  data={item.line}
                                  keyExtractor={(lineitem) => lineitem.internalid}
                                  showsVerticalScrollIndicator={true}
                                  keyboardShouldPersistTaps="handled"
                                  renderItem={({ item }) => {
                                      const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)
                                      const DocColor = (StatusColors[item?.status]??Theme.text)
                                      return (
                                          <View style={{backgroundColor:Theme.pageBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
                                              <TouchableOpacity disabled={WithFile} style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => Linking.openURL(item.file)}>
                                                  <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23},WithFile?{color:Theme.pageBackground}:{}]} />
                                              </TouchableOpacity>
                                              <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}}  onPress={() => Linking.openURL(item.file)}>
                                                  {COLUMN_CONFIG.line.map((colName, index) => {
                                                      let finalCol = colName
                                                      if (finalCol.internalid == 'name') {
                                                        finalCol = {...colName,value:{format:{StyleLabel:{color:DocColor}}}}
                                                      }
                                                      return (<ColumnInfo columns={finalCol} index={index} item={item} expanded={true} />)
                                                  })}
                                              </TouchableOpacity>
                                          </View>
                                      )
                                  }}
                              />
                        </ScrollView>
    const ShowExpenseLines = () => {
      if ((item?.status??'0') == '0') {
        return router.replace({ pathname:pathname as any,params: { category: 'submit-expense',id:item.internalid } })
      }
      else {
        return ShowPrompt({
          msg:ExpenseLine,
          icon:{visible:false,label:<></>},
          input:{visible:false},
          ok:{visible:true},
          cancel:{visible:true}
  
        })
      }
      
    }
    
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
         {((item?.status??'0') === '0') && (
          <TouchableOpacity style={{alignItems:'flex-start',flexDirection:'column',height:'100%'}} onPress={() => HandleSelect(item.internalid)}>
            <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          </TouchableOpacity>
        )}
       
        <TouchableOpacity style={{flex: 1,alignSelf: 'stretch',flexDirection:'column',marginLeft:((item?.status??'0') === '0')?15:30,marginRight:30}} onPress={ShowExpenseLines}>
          {Array.isArray(columns) ?
                columns.map((colName, index) => {
                  let finalCol = colName
                  if (finalCol.internalid == 'name') {
                    finalCol = {...colName,value:{format:{StyleLabel:{color:DocColor}}}}
                  }
                  return (<ColumnInfo columns={finalCol} index={index} item={item} expanded={expanded}/>)
                })
                :<></>
              }
        </TouchableOpacity>   
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
                <View style={{marginLeft:50,marginRight:50}}><SearchField def={search} onChange={setSearch} scheme={scheme}/></View>
                {/*LISTING*/}
                
                <FlatList
                    style={[Form.container]}
                    data={displayList}
                    keyExtractor={(item) => item.internalid}
                    renderItem={({ item }) => {
                        return (
                          <RowInfo selected={selectedKeys.includes(item.internalid)} key={item.internalid} expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG['header']} />
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

                {(selectedKeys.length > 0) && (
                  <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10}}>
                    <TouchableOpacity onPress={() => ButtonAction('Submit','HR : Submit Expense Claim',true,PromptObj)} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit Claims</Text>
                    </TouchableOpacity>
                  </View>
                )}

            </View>
      ) : (!visibility && 
          <View style={{flex:1,flexDirection:'column',width:'100%'}}>
              <NoRecords scheme={scheme}/>
          </View>

      )}
      </>
    </View>
    
  )
}

const ApplyClaim = ({ category,id, user,BaseObj,scheme}: PageProps) => {

  //Defaults
  const [currentLine, setCurrentLine] = useState(0);
  const today = new Date()
  const DefaultHeader =  {internalid:(id??'0').toString(),status:'Open',date:today,name:'To be Generated',employee:{id:BaseObj.user,name:user?.name},line:[]}
  const DefaultLine:LineItem = {number:(currentLine + 1).toString(),date:today,expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),internalid:(id??'0') + '.' + (currentLine + 1),project:null,task:null,category:null,memo:'',val_amount:'0',file:null,edited:'F'}
  
  /*Declarations */
  const { Page, Header, Listing, Form, ListHeader, CategoryButton, Theme } = ThemedStyles(scheme);
  const router = useRouter();
  const pathname = usePathname();
  const pageInit = useRef(true);
  
  const isWeb = useWebCheck(); 
  
  const [showLine,setShowLine]= useState(false);
  const [claim,setClaim] = useState<ExpenseReport>(DefaultHeader);
  const [line,setLine] = useState<LineItem>({number:'0',date:today,expense_date:today.getDate() + '/' + (today.getMonth() + 1) + '/'+ today.getFullYear(),internalid:claim.internalid + '.0',project:null,task:null,category:null,memo:'',val_amount:'0',file:null,edited:'F'});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [lineTask,setLineTask] = useState<GenericObject|null>(null);
  const memoTask = useMemo(() => line, [line.project]);

  
  const { ShowLoading,HideLoading,ShowPrompt} = usePrompt();
  
  const HandleSelect = (key: string) => {
    setSelectedKeys((prev) => {
        const isSelected = prev.includes(key);
        const newSelectedIds = isSelected ? prev.filter((i) => i !== key) : [...prev, key];
        return newSelectedIds;
    });
    
  };
  const RejectObj = {
    msg:'Do you want to delete ' + selectedKeys.length + ' items?',
    icon:{label:<Ionicons name="help-outline"style={{fontSize:50,color:'orange'}}/>,visible:true}
  }
  const ConfirmObj = {
    msg:'Expense Claim Saved',
    icon:{label:<Ionicons name="checkmark"style={{fontSize:50,color:'green'}}/>,visible:true},
    cancel:{visible:false}
  };

  const ButtonAction = async (action:string) => {
    if (action === 'submit') {
      const LinePayload:GenericObject[] = []
      claim.line.forEach((item:GenericObject)=> {
        LinePayload.push({...item,date:item.date.toISOString().split('T')[0]})
      })
      const newClaim:ExpensePayload = {...claim,line:LinePayload,date:claim.date.toISOString().split('T')[0]}
      ShowLoading({msg:'Loading...'});
      const NewObj = {...BaseObj,command:'HR : Save Claim',data:newClaim}
      const final = await FetchData(NewObj);
      HideLoading({confirmed: true, value: ''})
      let result = await ShowPrompt(ConfirmObj)
      router.replace({ pathname:pathname as any,params: { category: 'expense' } })
    }
    else {
      let result:GenericObject
      let proceed:boolean
      
      do {
        proceed = true
        result = await ShowPrompt(RejectObj as any)
        proceed = (!result.value && result.confirmed)?false:true
      } while (!proceed)

      if (result.confirmed) {
        
        const newClaim = {...claim}
        selectedKeys.forEach(function (internalid) {
          const idx = newClaim.line.findIndex((i: GenericObject) => i.internalid === internalid);
          if (idx !== -1) {
            newClaim.line[idx].edited = 'D';
          }
        })
        setClaim(newClaim)
      
      }
      
    }
  }
  
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'number'},
    {internalid:'expense_date'},
    {internalid:'project'},
    {internalid:'val_amount',value:{handle:NumberComma}}
  ]

  
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
    file: any,
    edited:string
  };
  
  interface ExpenseReport {
    internalid:string,
    date:Date,
    name:string,
    status:string,
    employee:GenericObject,
    line:GenericObject[]
  }
  interface ExpensePayload extends Omit<ExpenseReport,'date'> {
    'date': string
  }
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
        let refDate = data.date + 'T00:00:00Z'
        data.date = new Date(refDate)
        data.line.forEach(function (i:GenericObject) {
          i.expense_date = i.date
          refDate = i.date+ 'T00:00:00Z'
          i.date = new Date(refDate)
          lineNo = parseInt(i.number)
        })
      }
      else {
        data = DefaultHeader
        setLine(DefaultLine);
        setShowLine(true);
        pageInit.current = false;
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
  const RowInfo = ({item,columns,selected}:PageInfoRowProps) => {
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{alignItems:'flex-start',flexDirection:'column',height:'100%'}} onPress={() => HandleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
        </TouchableOpacity>
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
        {/*<FormDateInput disabled={true} label='Date ' def={{date:claim.date}} onChange={({date})=>{updateMain('date',date)}} scheme={scheme}/>
        <FormTextInput disabled={true} label="Document Number " key={claim.name} def={claim.name} onChange={(text) => {updateMain('name', text)}} scheme={scheme}/>
        <FormAutoComplete 
          label="Employee "  
          def={claim.employee} 
          searchable={false} 
          disabled={true} 
          onChange={(item)=>{updateMain('employee', item)}} 
          LoadObj={{ ...BaseObj, command: "HR : Get Employee Listing",data:{keyword:BaseObj.user}}} 
          AddStyle={{StyleInput:{flex:1,marginRight:0}}}
          scheme={scheme}
        />*/}
        <FormTextInput disabled={true} label="Status " key={claim.status} def={claim.status} onChange={(text) => {updateMain('status', text)}} scheme={scheme}/>
        
        <FlatList
          style={[Form.container,{paddingHorizontal:0}]}
          data={claim.line.filter((item:GenericObject)=> {return item.edited != 'D'})}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
                <TouchableOpacity onPress={() => {setLine(DefaultLine);setShowLine(true)}} style={[ListHeader.container,{marginTop:20,flexDirection:'row',backgroundColor:Theme.backgroundReverse}]}>
                    <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:-1,fontSize:23,color:Theme.backgroundReverse}]} />
                    <Text style={[ListHeader.text,{fontSize:18,flex:1}]}>Line Items</Text>
                    <Ionicons name="add" style={[CategoryButton.icon,Listing.text,{fontSize:23,color:Theme.textReverse,flex:-1}]} />     
                </TouchableOpacity> 
            }
          keyExtractor={(item) => item.internalid}
          renderItem={({ item }) => {
            return (
              <RowInfo item={item} columns={COLUMN_CONFIG} selected={selectedKeys.includes(item.internalid)} />
            )
          }}
          
        />
        {/*Button */}
       <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10,flex:-1}}>
        {(claim.status == 'Open') && (
          <>
          {(selectedKeys.length > 0) && (
          <TouchableOpacity onPress={() => ButtonAction('reject')} style={{ backgroundColor:'#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete Lines</Text>
          </TouchableOpacity>
          )}


          {(selectedKeys.length == 0) && (
            <TouchableOpacity onPress={() => {setLine(DefaultLine);setShowLine(true)}} style={{ backgroundColor:Theme.backgroundReverse,width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Item</Text>
            </TouchableOpacity>
          )}
          
            {(selectedKeys.length == 0 && claim.line.length > 0) && (
              <TouchableOpacity onPress={() => {ButtonAction('submit')}} style={{ backgroundColor:'#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            )}
          
          </>
          )
        }       
        </View>
         
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
    };
    
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
        <FormSubmit label={currentLine == parseInt(line.number)?'Add':'Update'} onPress={()=>{updateLine('edited','T');submitLine(line);setShowLine(false);}} scheme={scheme}/>
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
                  <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => {if (showLine) {setLine(DefaultLine);setShowLine(false);} else {router.replace({pathname:pathname as any,params: {category: 'expense'}})}}}>
                      <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                  </TouchableOpacity>
                  <Text style={[Header.text,{flex:1,width:'auto'}]}> {showLine ? ('Line : ' + line.number) : claim.name}</Text>
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

export const ExpenseClaim = ({ category, id, user,BaseObj,scheme}: PageProps) => {

  switch (category) {
    case 'submit-expense':
        return <ApplyClaim category={category} id={id??'0'} user={user} BaseObj={BaseObj} scheme={scheme??'light'} />
    default :
        return <ExpenseMain user={user} BaseObj={BaseObj} scheme={scheme??'light'}  />
  }
}
