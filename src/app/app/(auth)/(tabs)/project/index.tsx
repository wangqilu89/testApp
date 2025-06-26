
import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView,StyleSheet,LayoutChangeEvent,findNodeHandle,NativeSyntheticEvent,NativeScrollEvent} from 'react-native';
import Modal from "react-native-modal";
import { useEffect, useState,useMemo,useRef} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import { useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData,SearchField,ProperCase,NumberComma,ProjectSearchPage,NumberPercent} from '@/services'; // 👈 functions
import { NoRecords, MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import { usePrompt } from '@/components/AlertModal';
import { useUser } from '@/components/User';
import { useListFilter } from '@/hooks/useListFilter'

import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps, KeyStyles} from '@/types';



function ProjectOverview({data,styles,user}:{data:GenericObject[],styles:GenericObject,user:User|null}) {
    const {Listing} = styles
    const item = data[0]
    const COLUMN_CONFIG: PageInfoColConfig= {
        base:[
            {internalid:'parent',name:"Parent Company"},
            {internalid:'service',name:'Service Line'},
            {internalid:'year'},
            {internalid:'partner'},
            {internalid:'manager'},
            {internalid:'status'}
        ],
        budget:[
            {internalid:'val_budget_revenue',name:'Budget Revenue',value:{handle:NumberComma}},
            {internalid:'val_budget_cost',name:'Budget Cost',value:{handle:NumberComma}},
            {internalid:'val_budget_recovery',name:'Budget Recovery',value:{handle:NumberPercent}},
        ],
        finance:[
            {internalid:'val_total_revenue',name:'Total Revenue',value:{handle:NumberComma}},
            {internalid:'val_total_cost',name:'Total Cost',value:{handle:NumberComma}},
            {internalid:'val_total_recovery',name:'Total Recovery',value:{handle:NumberPercent}},
        ]
    }

    return (
        <View>
            
            {/*Base */}
            <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1}}>
            {COLUMN_CONFIG.base.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item?.[colName.internalid] ?? '')):(item?.[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
            </View>
            {/*Budget */}
            <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1}}>
            {COLUMN_CONFIG.budget.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item?.[colName.internalid] ?? '')):(item?.[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
            </View>
            {/*Actual */}
            <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1}}>
            {COLUMN_CONFIG.finance.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item?.[colName.internalid] ?? '')):(item?.[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
            </View>
            
        </View>
    )
}

function ProjectList ({data,styles,user,HandleSelect}:{data:GenericObject[],styles:GenericObject,user:User|null,HandleSelect:(item:any) => void}) {
    
    const {Listing,Form,Theme,CategoryButton} = styles
    const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
    const { list,displayList,loadMore,expandedKeys,HandleExpand} = useListFilter({
        Defined:data,
    });
    const COLUMN_CONFIG: PageInfoColConfig= [
        {internalid:'projectid',name:"Project ID"},
        {internalid:'project',name:'Project'},
        {internalid:'status'},
        {internalid:'service',name:'Service Line'},
        {internalid:'year'},
        {internalid:'partner'},
        {internalid:'manager'},
        {internalid:'val_total_revenue',name:'Total Revenue',value:{handle:NumberComma}},
        {internalid:'val_total_cost',name:'Total Cost',value:{handle:NumberComma}},
        {internalid:'val_total_recovery',name:'Total Recovery',value:{handle:NumberPercent}},
    ]
    const ProjectListRow = ({expanded,item,columns}:PageInfoRowProps) => {
        const newCol = useMemo(() => {
          return Array.isArray(columns)?
             ((columns.length > 3 && !expanded)?
              [...columns.slice(0, 3), ...columns.slice(-1)]:
              columns.slice())
             :[];
        }, [expanded, columns]);
        
        
        return (
          <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
            <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {HandleSelect(item.internalid);}}>
                {newCol.map((colName, index) => (
                  <View key={index} style={{flexDirection:'row',marginLeft:30,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                    <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                    <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}</Text></View>
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
        <FlatList
            style={[Form.container]}
            data={displayList}
            keyExtractor={(item) => item.internalid}
            renderItem={({ item }) => {
            return (
                <ProjectListRow expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG} />
            )
            }}
            onEndReached={() => {
                if (displayList.length < list.length) {
                    loadMore();
                }
            }}
            onEndReachedThreshold={0.5}
            />
    )

}


const LoadData = async (Payload:GenericObject,options:GenericObject) => {
    const {ShowLoading,HideLoading} = options
    try {
        ShowLoading({msg:'Loading...'});
        const data = await FetchData(Payload);
        return data
    } 
      catch (err) {
        console.error(err);
    } 
    finally {
        HideLoading({});

      }
      
}
export default function ProjectScreen() {
    const {id = '0'} = useLocalSearchParams<Partial<{ category: string; id: string; url: string; doc: string }>>();
    const [openSearch,setOpenSearch] = useState(false);
    const TabList = ['Overview','Projects','Invoices','Expenses']
    type TabKey = typeof TabList[number];
    const [pageData,setPageData] = useState<Record<TabKey,any[]>>({Overview:[],Projects:[],Invoices:[],Expenses:[]})
    const CloseSearch = () => {setOpenSearch(false)};
    const [projectTab,setProjectTab] = useState('Overview');
    
    const { user} = useUser(); 
    const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

    
    const DefinedStyles = useThemedStyles();
    const {Page,Header,Theme} = DefinedStyles
    const [projectPageHeight, setProjectPageHeight] = useState(0);
    const [projectSelect, setProjectSelect] = useState('')
    
    const scrollRef = useRef<ScrollView>(null);

    const SelectProject = (item: any) => {
       setProjectSelect(item.customerId);
       scrollRef.current?.scrollTo({ y: projectPageHeight * 2, animated: true });
    };

    const onContentLayout = (e: LayoutChangeEvent) => {
        setProjectPageHeight(e.nativeEvent.layout.height);
    };
    
    const HandleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const pageIndex = Math.round(offsetY / projectPageHeight);
        setProjectTab(TabList[pageIndex]);
    };

    const ProjectTabs = () => {
        
        return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[Header.container,{flex:-1,justifyContent:'flex-start',backgroundColor:'transparent',flexDirection:'row',paddingTop:20}]}
            >
            {TabList.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setProjectTab(tab)} style={{flex:-1,alignItems:'flex-start',marginHorizontal:20}} >
                <View style={{alignItems:'center',justifyContent:'center',borderBottomColor:((projectTab === tab)?Theme.mooreReverse:'transparent'),borderBottomWidth:1}}>
                    <Text style={[Header.text,{color:((projectTab === tab)?Theme.mooreReverse:Theme.text)}]}>{ProperCase(tab)}</Text>
                </View>
                {projectTab === tab && (<View style={{height: 3,backgroundColor:Theme.mooreReverse,borderRadius: 2,alignItems:'flex-start',justifyContent:'flex-start'}}></View>)}
            </TouchableOpacity>
            ))}
        </ScrollView>
        )
    }
    const promptOptions = usePrompt();
    useEffect(() => {
        const fetchData = async () => {
            if (!id || id == '0'|| !user || !user.id ) {
                setPageData({Overview:[],Projects:[],Invoices:[],Expenses:[]});
                return;
            }

            if (pageData[projectTab].length == 0) {
                let payload = {...BaseObj,command:'',data:{}}
                switch(projectTab) {
                    case 'Overview':
                        payload = {...BaseObj,command:'Project : Get Project Overview',data:{internalid:id}}
                    break;
                    case 'Projects':
                        payload = {...BaseObj,command:'Project : Get Project List',data:{internalid:id}}
                    break;
                }
                const result = await LoadData(payload,promptOptions)
                setPageData((prev) => {
                    return {...prev,[projectTab]:result}
                })
            }
        }
        fetchData()
    },[user, id, projectTab])
    
    useEffect(() => {
        const TabIndex = TabList.findIndex((item) => item === projectTab)
        
        const timeout = setTimeout(() => {
            scrollRef.current?.scrollTo({ y: projectPageHeight * TabIndex, animated: true });
        }, 200); 
        clearTimeout(timeout)
    },[projectTab])
    return (
    <View style={[Page.container,{height:'auto',flex:1,maxWidth:600,flexDirection:'column',justifyContent:'flex-start'}]}>
        {/*Search*/}
        {openSearch?(
            <ProjectSearchPage SearchObj={{...BaseObj,command:'Project : Get Project Listing'}} HandleClose={CloseSearch}/>
        ) : (
               <TouchableOpacity  onPress={() => {setOpenSearch(true)}} style={{alignSelf:'stretch',marginLeft:50,marginRight:50}}>
                  <SearchField />
               </TouchableOpacity>
        )}
        {(id != '0' || !id) && 
            (<View style={{flex:1,width:'100%',flexDirection:'column'}} >
                <View style={{height:70}}>
                   <ProjectTabs />
                </View>
                <View style={{flex: 1,overflow: 'hidden'}} onLayout={onContentLayout}>
                    <ScrollView 
                        ref={scrollRef} 
                        horizontal={false}              
                        snapToInterval={projectPageHeight}
                        decelerationRate="fast"
                        scrollEventThrottle={16}
                        onScroll={HandleScroll}
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{ height: projectPageHeight * 4 }}>
                           
                                <View key={0} style={{height:projectPageHeight,width:'100%'}}>
                                    <ProjectOverview data={pageData.Overview} styles={DefinedStyles} user={user}/>
                                </View>
                                <View key={1} style={{height:projectPageHeight,width:'100%'}}>
                                    <ProjectList data={pageData.Projects} styles={DefinedStyles} HandleSelect={SelectProject} user={user}/>
                                </View>
                            
                            
                            {/*
                            <View style={{height:projectPageHeight}}>
                                <Invoice id={id} styles={DefinedStyles}/>
                            </View>
                            <View style={{height:projectPageHeight}}>
                                <Expense id={id} styles={DefinedStyles}/>
                            </View>
                            */}
                    </ScrollView>
                </View>
            </View>)
        }
    </View>
    )
  
}