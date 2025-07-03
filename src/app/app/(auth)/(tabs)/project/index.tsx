
import { View, Text, TouchableOpacity, FlatList, Linking,ScrollView,StyleSheet,LayoutChangeEvent,findNodeHandle,NativeSyntheticEvent,NativeScrollEvent} from 'react-native';

import { useEffect, useState,useMemo,useRef} from 'react';
import { useLocalSearchParams} from 'expo-router';
import { useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData,SearchField,ProperCase,NumberComma,ProjectSearchPage,NumberPercent} from '@/services'; // 👈 functions

import { usePrompt } from '@/components/AlertModal';
import { useUser } from '@/components/User';
import { useListFilter } from '@/hooks/useListFilter'

import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps, KeyStyles} from '@/types';

import { DropdownMenu } from '@/components/DropdownMenu';


const TabList = [
    {internalid:'Overview',name:'Overview'},
    {internalid:'Projects',name:'Projects'},
    {internalid:'Invoices',name:'Invoices'},
    {internalid:'Expenses',name:'Expenses'},
    {internalid:'Time',name:'Time Costs'}
];
type TabKey = typeof TabList[number]



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

function ProjectDetails ({tab,data,styles,HandleSelect}:{tab?:GenericObject,data:GenericObject[],styles:GenericObject,HandleSelect:(item:any) => void}) {
    
    const {Listing,Form,Theme,CategoryButton,Header} = styles
    const [selectMode,setSelectMode] = useState(false);
    const [totalDropdown,setTotalDropdown] = useState<GenericObject>({internalid:'total',other:'num',value:{handle:NumberComma}})
    const { list,displayList,LoadMore,expandedKeys,HandleExpand,search,setSearch,selectAll,selectedKeys,HandleSelect : AddSelectKey,HandleSelectAll,ResetSelectAll,LoadAll} = useListFilter({
        Defined:data,
        SearchFunction: (i, keyword) => {
          return i.filter((item: GenericObject) =>
            Object.values(item).some((val) =>{
              return (typeof val === 'object' ? (val?.name ?? '') : val.toString())
                .toLowerCase()
                .includes(keyword)
            }
            )
        )}
    });

    const COLUMN_CONFIG: PageInfoColConfig = {Invoices:[
            {internalid:'company',name:'Customer'},
            {internalid:'date',name:'Date'},
            {internalid:'name',name:'Document Number'},
            {internalid:'type',name:'Record Type',value:{handle:ProperCase}},
            {internalid:'status',name:'Status'},
            {internalid:'feeincome',name:'Fee Income',other:'num',value:{handle:NumberComma}},
            {internalid:'disbursement',name:'OPE',other:'num',value:{handle:NumberComma}},
            {internalid:'total',name:'Total',other:'num',value:{handle:NumberComma}}
        ],
        Expenses:[
            {internalid:'company',name:'Entity'},
            {internalid:'date',name:'Date'},
            {internalid:'name',name:'Document Number'},
            {internalid:'type',name:'Record Type',value:{handle:ProperCase}},
            {internalid:'currency',name:'Memo'},
            {internalid:'status',name:'Status'},
            {internalid:'feeincome',name:'Expenses',other:'num',value:{handle:NumberComma}},
            {internalid:'total',name:'Total',other:'num',value:{handle:NumberComma}}
        ],
        Time:[
            {internalid:'company',name:'Employee'},
            {internalid:'date',name:'Date'},
            {internalid:'name',name:'Billing Class'},
            {internalid:'status',name:'Status'},
            {internalid:'feeincome',name:'Hours',other:'num',value:{handle:NumberComma}},
            {internalid:'total',name:'Total',other:'num',value:{handle:NumberComma}}

        ]
    }

    const ProjectListRow = ({expanded,item,columns}:PageInfoRowProps) => {
        const newCol = useMemo(() => {
          return Array.isArray(columns)?
             ((columns.length > 3 && !expanded)?
              [...columns.slice(0, 3), ...columns.slice(-1)]:
              columns.slice())
             :[];
        }, [expanded, columns]);
        
        
        return (
          <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8,borderWidth:1,borderRadius:10}}>
            {selectMode && (
            <TouchableOpacity style={{flexDirection:'column',height:'100%'}} onPress={() => {AddSelectKey(item.internalid);}}>
                <Text style={[Listing.text,{fontSize:15}]}>{selectedKeys.includes(item.internalid) ? '☑️' : '⬜'}</Text>
            </TouchableOpacity>
            )}
            <TouchableOpacity style={{flexDirection:'column',flex:1}} onLongPress={() => {setSelectMode(true);AddSelectKey(item.internalid)}} onPress={() => {HandleSelect(item.internalid);}}>
                {newCol.map((colName, index) => (
                  <View key={index} style={{flexDirection:'row',marginRight:5,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                    <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                    <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}</Text></View>
                  </View>
                ))}
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1,height:'100%'}} onPress={() => HandleExpand(item.internalid)}>
              <Ionicons name={expanded?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
            </TouchableOpacity>
          </View>
        );
    };
    return (
        <>  
            <View style={{flexDirection:'row'}}>
                
                {selectMode && (
                <TouchableOpacity onPress={HandleSelectAll} style={{alignItems:'center',justifyContent:'center',marginRight:10}}>
                    <Ionicons name={selectAll?"square-outline":"checkbox-outline"} style={[{fontSize:20}]} />
                </TouchableOpacity>
                )}
                <View style={{flex:1}}>
                {list.length > 5 && (
                    <SearchField def={search} onChange={setSearch} AddStyle={{StyleContainer:{flex:-1}}}/>
                )}
                </View>
                {selectMode && (
                <TouchableOpacity onPress={() => {ResetSelectAll();setSelectMode(false)}} style={{alignItems:'center',justifyContent:'center',marginRight:10}}>
                    <Text style={[{fontSize:15}]}>Cancel</Text>
                </TouchableOpacity>
                )}
                
            </View>
            <FlatList
                style={[Form.container,{marginBottom:((displayList.length < list.length)?0:20)}]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                renderItem={({ item }) => {
                return (
                    <ProjectListRow expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG[tab?.internalid]} />
                )
                }}
                onEndReached={() => {
                    if (displayList.length < list.length) {
                        LoadMore();
                    }
                }}
                stickyHeaderIndices={[0]}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={() => {
                    if (selectedKeys.length == 0) {
                        return (<></>)
                    }
                    const columns = COLUMN_CONFIG[tab?.internalid] ?? [];
                    const DropdownList = columns.filter(col => col.other === 'num')
                    const numericKeys = DropdownList.map(col => col.internalid);
                    const totals = list
                        .filter(item => selectedKeys.includes(item.internalid))
                        .reduce((acc, item) => {
                          numericKeys.forEach(key => {
                            acc[key] = (acc[key] ?? 0) + Number(item[key] ?? 0);
                          });
                          return acc;
                        }, {} as Record<string, number>);

                    return (
                    
                        <View key={0} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,backgroundColor:Theme.containerBackground}}>
                            <View style={[{width:50}]}>
                                <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Total</Text>
                            </View>
                            <View style={[{width:150}]}>
                                <DropdownMenu showdrop={true} def={totalDropdown} Defined={DropdownList} label={''} searchable={false} AddStyle={{StyleInput:{borderWidth:0,fontSize:14,fontWeight:'bold',margin:0,padding:0}}} onChange={(item) => setTotalDropdown(item as any)}/>
                            </View>
                            <View style={[{flex:1,alignItems:'flex-end'}]}>
                                <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(totals[totalDropdown.internalid])}</Text>
                            </View>
                            
                        </View>
                        
                    )
                }}
            />
            {displayList.length < list.length && (
            <TouchableOpacity onPress={() => {LoadAll()}} style={[Form.container,{flex:-1,alignItems:'center',marginVertical:5,marginBottom:20}]}>
                <Text style={{fontWeight:'bold'}}>Show All</Text>
            </TouchableOpacity>
            )}
        </>
    )
};

function ProjectOverview({data,styles}:{data:GenericObject[],styles:GenericObject}) {
    const {Listing,Theme} = styles
    const { list} = useListFilter({
        Defined:data,
    });
    const [overview,setOverview] = useState('revenue')
    const [overviewData,setOverviewData] = useState<GenericObject[]>([])
    const COLUMN_CONFIG: PageInfoColConfig= {
        base:[
            {internalid:'parent',name:"Parent Company"},
            {internalid:'service',name:'Service Line'},
            {internalid:'year'},
            {internalid:'partner'},
            {internalid:'manager'},
            {internalid:'status'}
        ],
        finance:[
            {internalid:'revenue',name:'Revenue',value:{handle:NumberComma}},
            {internalid:'cost',name:'Cost',value:{handle:NumberComma}},
            {internalid:'recovery',name:'Recovery %',value:{handle:NumberPercent}}
        ]
        
    }
    useEffect(() => {
        if (data) {
            setOverviewData(data[0]?.moreinfo??[])
        }
        
    },[data])

    return (
        <View style={{height:'100%'}}>
            {/*Base */}
            <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1}}>
            {COLUMN_CONFIG.base.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(list[0]?.[colName.internalid] ?? '')):(list[0]?.[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
            </View>
            {/*Financials*/}
            <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1}}>
                {/*Header */}
                <View key={0} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                    <View style={[{width:100}]}>
                        <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>&nbsp;</Text>
                    </View>
                    <View style={[{flex:1,alignItems:'flex-end'}]}>
                        <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Budget</Text>
                    </View>
                    <View style={[{flex:1,alignItems:'flex-end'}]}>
                        <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Actual</Text>
                    </View>
                </View>
                {COLUMN_CONFIG.finance.map((colName, index) => (
                <TouchableOpacity onPress={() => setOverview(colName.internalid)}>
                    <View key={index + 1} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                        <View style={[{width:100},colName?.format?.StyleContainer]}>
                            <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'},colName?.value?.format?.StyleContainer]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(list[0]?.['val_budget_' + colName.internalid] ?? '')):(list[0]?.['val_budget_' + colName.internalid] ?? '')}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'},colName?.value?.format?.StyleContainer]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(list[0]?.['val_total_' + colName.internalid] ?? '')):(list[0]?.['val_total_' + colName.internalid] ?? '')}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                ))}
            </View>
            {/*Summary*/}
            {overview === 'revenue' && (
               <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1,flex:1,marginBottom:20}}>
                  
                  <FlatList
                    
                    data={overviewData.filter((item) => item.category === overview)}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={() => {
                        const total = overviewData.filter((item) => item.category === overview)
                                         .reduce((acc,item) => ({budget:acc.budget + (item.budget || 0),actual:acc.actual+(item.actual || 0)}),{budget:0,actual:0})
                        return (
                        <>
                            <View key={0} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:200}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>&nbsp;</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Budget</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Actual</Text>
                                </View>
                            </View>
                            <View key={1} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:1,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:200}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Total</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.budget??0)}</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.actual??0)}</Text>
                                </View>
                            </View>
                        </>
                        )
                    }}
                    keyExtractor={(item) => item.internalid}
                    renderItem={({ item,index }) => {
                    return (
                    <View key={index + 2} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                        <View style={[{width:200}]}>
                            <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{item?.name}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.budget??0)}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.actual??0)}</Text>
                        </View>
                    </View>
                    )
                    }}
                    
                  />
               </View>
            )}
            {overview === 'cost' && (
               <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1,flex:1,marginBottom:20}}>
                  <FlatList
                    data={overviewData.filter((item) => item.category === overview)}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={() => {
                        const total = overviewData.filter((item) => item.category === overview)
                                         .reduce((acc,item) => ({budget_hours:acc.budget_hours + (item.budget_hours || 0),actual_hours:acc.actual_hours+(item.actual_hours || 0),budget:acc.budget + (item.budget || 0),actual:acc.actual+(item.actual || 0)}),{budget:0,budget_hours:0,actual:0,actual_hours:0})
                        return (
                        <>
                            <View key={0} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:100}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>&nbsp;</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Budget Hours</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Actual Hours</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Budget</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Actual</Text>
                                </View>
                            </View>
                            <View key={1} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:1,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:100}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Total</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.budget_hours??0)}</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.actual_hours??0)}</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.budget??0)}</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberComma(total?.actual??0)}</Text>
                                </View>
                            </View>
                        </>
                        )
                    }}
                    keyExtractor={(item) => item.internalid}
                    renderItem={({ item,index }) => {
                    return (
                    <View key={index + 2} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                        <View style={[{width:100}]}>
                            <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{item?.name}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.budget_hours??0)}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.actual_hours??0)}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.budget??0)}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberComma(item?.actual??0)}</Text>
                        </View>
                    </View>
                    )
                    }}
                    
                  />
                  
               </View>

            )}
            {overview === 'recovery' && (
               <View style={{marginVertical:10,padding:10,borderRadius:10,borderWidth:1,flex:1,marginBottom:20}}>
                  <FlatList
                    //style={[Form.container]}
                    data={overviewData.filter((item) => item.category === overview)}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={() => {
                        const total = overviewData.filter((item) => item.category === overview)
                                         .reduce((acc,item) => ({
                                            budget_revenue:acc.budget_revenue + (item.budget_revenue || 0),
                                            budget_cost:acc.budget_cost + (item.budget_cost || 0),
                                            total_cost:acc.total_cost+(item.total_cost || 0),
                                            total_revenue:acc.total_revenue+(item.total_revenue || 0)}),
                                            {budget_revenue:0,budget_cost:0,total_cost:0,total_revenue:0})
                        const budget = ((total.budget_cost == '0')?100:(total.budget_revenue/total.budget_cost * 100))
                        const actual = ((total.total_cost == '0')?100:(total.total_revenue/total.total_cost * 100))
                        return (
                        <>
                            <View key={0} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:200}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>&nbsp;</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Budget</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Actual</Text>
                                </View>
                            </View>
                            <View key={1} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:1,backgroundColor:Theme.containerBackground}}>
                                <View style={[{width:200}]}>
                                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>Total</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberPercent(budget)}</Text>
                                </View>
                                <View style={[{flex:1,alignItems:'flex-end'}]}>
                                    <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{NumberPercent(actual)}</Text>
                                </View>
                            </View>
                        </>       
                        )
                    }}
                    keyExtractor={(item) => item.internalid}
                    renderItem={({ item,index }) => {
                    return (
                    <View key={index + 2} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3}}>
                        <View style={[{width:200}]}>
                            <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{item?.name}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberPercent(item?.budget??0)}</Text>
                        </View>
                        <View style={[{flex:1,alignItems:'flex-end'}]}>
                            <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{NumberPercent(item?.actual??0)}</Text>
                        </View>
                    </View>
                    )
                    }}
                    
                  />
               </View>
            )}
        </View>
    )
};

function ProjectList ({data,styles,HandleSelect}:{data:GenericObject[],styles:GenericObject,HandleSelect:(item:any) => void}) {
    
    const {Listing,Form,Theme,CategoryButton} = styles
    
    const { list,displayList,LoadMore,expandedKeys,HandleExpand,search,setSearch,LoadAll} = useListFilter({
        Defined:data,
        SearchFunction: (i, keyword) => {
            
            return i.filter((item: GenericObject) =>
              Object.values(item).some((val) => 
                (typeof val === 'object' ? (val?.name ?? '') : val.toString())
                   .toLowerCase()
                   .includes(keyword)
              )
          )}
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
          <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8,borderWidth:1,borderRadius:10}}>
            <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {HandleSelect(item.internalid);}}>
                {newCol.map((colName, index) => (
                  <View key={index} style={{flexDirection:'row',marginRight:5,paddingHorizontal:7,paddingVertical:3}}>
                    <View style={[{width:150},colName?.format?.StyleContainer]}>
                        <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text>
                    </View>
                    <View style={[{flex:1},colName?.value?.format?.StyleContainer]}>
                        <Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}</Text>
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
        <>
        {/*Search*/}
        {list.length > 5 && (<SearchField def={search} onChange={setSearch} AddStyle={{StyleContainer:{flex:-1}}}/>)}
        <FlatList
            style={[Form.container,{marginBottom:((displayList.length < list.length)?0:20)}]}
            data={displayList}
            keyExtractor={(item) => item.internalid}
            renderItem={({ item }) => {
            return (
                <ProjectListRow expanded={expandedKeys.includes(item.internalid)} item={item} columns={COLUMN_CONFIG} />
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
            <TouchableOpacity onPress={() => {LoadAll()}} style={[Form.container,{flex:-1,alignItems:'center',marginVertical:5,marginBottom:20}]}>
                <Text style={{fontWeight:'bold'}}>Show All</Text>
            </TouchableOpacity>
        )}
        </>
    )

};


export default function ProjectScreen() {
    const {id = '0'} = useLocalSearchParams<Partial<{ category: string; id: string; url: string; doc: string }>>();

    const { user,BaseObj} = useUser(); 
    const DefinedStyles = useThemedStyles();
    const {Page,Header,Theme,CategoryButton,Listing} = DefinedStyles;
    const promptOptions = usePrompt();
    const NavScrollRef = useRef<ScrollView>(null);
    const NavScroll = useRef(true)

    const [openSearch,setOpenSearch] = useState(false);
    const [projectPageHeight, setProjectPageHeight] = useState(0);
    const [projectSelect, setProjectSelect] = useState('');
    const [pageData,setPageData] = useState<Record<TabKey['internalid'],GenericObject[]>>({Overview:[],Projects:[],Invoices:[],Expenses:[],Time:[]});
    const [projectNav,setProjectNav] = useState<TabKey>({internalid:'Overview',name:'Overview'});
    
    const CloseSearch = () => {setOpenSearch(false)};

    const SelectProject = (item: any) => {
       setProjectSelect(item.customerId);
       NavScrollRef.current?.scrollTo({ y: projectPageHeight * 2, animated: true });
    };

    const onContentLayout = (e: LayoutChangeEvent) => {
        setProjectPageHeight(e.nativeEvent.layout.height);
    };
    
    const HandleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (NavScroll.current) {
            const offsetY = e.nativeEvent.contentOffset.y;
            const pageIndex = Math.round(offsetY / projectPageHeight);
            setProjectNav(TabList[pageIndex]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id || id == '0'|| !user || !user.id ) {
                setPageData({Overview:[],Projects:[],Invoices:[],Expenses:[],Time:[]});
                return;
            }
            
            if (pageData[projectNav.internalid].length == 0) {
                let payload = {...BaseObj,command:'',data:{}}
                switch(projectNav.internalid) {
                    case 'Overview':
                        payload = {...BaseObj,command:'Project : Get Project Overview',data:{internalid:id}}
                    break;
                    case 'Projects':
                        payload = {...BaseObj,command:'Project : Get Project List',data:{internalid:id}}
                    break;
                    case 'Invoices':
                        payload = {...BaseObj,command:'Project : Get Invoice List',data:{internalid:id}}
                    break;
                    case 'Expenses':
                        payload = {...BaseObj,command:'Project : Get Expense List',data:{internalid:id}}
                    break;
                    case 'Time':
                        payload = {...BaseObj,command:'Project : Get Time List',data:{internalid:id}}
                    break;
                }
                const result = await LoadData(payload,promptOptions)
                setPageData((prev) => {
                    return {...prev,[projectNav.internalid]:result}
                })
            }
            
            if (NavScrollRef.current) {
                const TabIndex = TabList.findIndex((item) => item.internalid === projectNav.internalid)
                NavScrollRef.current.scrollTo({ y: projectPageHeight * TabIndex, animated: true });
            }
            setTimeout(() => {NavScroll.current = true;}, 500); 
        }
        NavScroll.current = false;
        fetchData();
    },[user, id, projectNav])
    
    return (
    <View style={[Page.container,{backgroundColor:'transparent',height:'auto',flex:1,flexDirection:'column',justifyContent:'flex-start'}]}>
        <ProjectSearchPage SearchObj={{...BaseObj,command:'Project : Get Project Listing'}} >
            {(id != '0' || !id) && (
               <View style={{flex:1,width:'100%',flexDirection:'column',backgroundColor:Theme.background,borderRadius:20,borderTopLeftRadius:10,borderTopRightRadius:10}}>
                  <DropdownMenu showdrop={true} def={projectNav} Defined={TabList} label={''} searchable={false} AddStyle={{StyleInput:{...Header.text,borderWidth:0,flex:-1}}} onChange={(item) => setProjectNav(item as any)}/>
                     <View style={{flex: 1,overflow: 'hidden',backgroundColor:Theme.containerBackground,borderRadius:20,paddingTop:10,paddingLeft:20,paddingRight:20}} onLayout={onContentLayout}>
                        <ScrollView 
                                ref={NavScrollRef} 
                                horizontal={false}              
                                snapToInterval={projectPageHeight}
                                decelerationRate="fast"
                                scrollEventThrottle={16}
                                onScroll={HandleScroll}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ height: projectPageHeight * 5 }}>
                                
                                        <View key={0} style={{height:projectPageHeight,width:'100%'}}>
                                            <ProjectOverview data={pageData.Overview} styles={DefinedStyles} />
                                        </View>
                                        <View key={1} style={{height:projectPageHeight,width:'100%'}}>
                                            <ProjectList data={pageData.Projects} styles={DefinedStyles} HandleSelect={SelectProject} />
                                        </View>
                                        <View key={2} style={{height:projectPageHeight,width:'100%'}}>
                                            <ProjectDetails tab={TabList[2]} data={pageData.Invoices} styles={DefinedStyles} HandleSelect={(item:any) => {}} />
                                        </View>
                                        <View key={3} style={{height:projectPageHeight,width:'100%'}}>
                                            <ProjectDetails tab={TabList[3]} data={pageData.Expenses} styles={DefinedStyles} HandleSelect={(item:any) => {}} />
                                        </View>
                                        <View key={4} style={{height:projectPageHeight,width:'100%'}}>
                                            <ProjectDetails tab={TabList[4]} data={pageData.Time} styles={DefinedStyles} HandleSelect={(item:any) => {}} />
                                        </View>
                            </ScrollView>
                        </View>
               </View>   
            )}
        </ProjectSearchPage>
    </View>
    )
  
}