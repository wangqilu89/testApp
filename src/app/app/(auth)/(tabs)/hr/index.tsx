
import { View, Text, TouchableOpacity, FlatList, Button,Platform,TextInput} from 'react-native';
import { useEffect, useState,useCallback,useRef} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import Animated from 'react-native-reanimated';
import { useUser,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData,SearchField} from '@/services'; // 👈 functions
import { LoadingScreen, NoRecords, MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import debounce from 'lodash.debounce';
import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';




const approvals = [
  { id: 'personal', title: 'Personal Information',icon:'person-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'expense', title: 'Claims',icon:'card-outline'},
  { id: 'payslip', title: 'Download Pay Slip',icon:'document-text-outline'}
];
type GenericObject = Record<string, any>;
type AnimatedRowProps = {item: any,colNames: string[]}


function MainScreen() {
  return (
    <MainPage redirect="hr" pages={approvals} title="HR"/>
  );
}

function ExpenseClaim({ category,id,user}: { category: string, id:string,user:GenericObject|null}) {
    
    const pathname = usePathname();
    const router = useRouter();
    const {Page,Header,Listing,Form,ListHeader,CategoryButton} = useThemedStyles();
    
    const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};
    
    const toProperCase = (str:string) => {
        return str.toLowerCase().split(/_/g).map(function(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }  
    
    {/*Screens*/}
    const ExpenseMain = () => {
        const [loading, setLoading] = useState(true);
        const [list, setList] = useState<GenericObject[]>([]);
        const [displayList, setDisplayList] = useState<GenericObject[]>([]); // ✅ Add this
        const [search, setSearch] = useState('');
        const [page, setPage] = useState(1);
        const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
        const pageSize = 10; // Show 10 items at a time
        const isWeb = useWebCheck(); // Only "true web" if wide   
        const COLUMN_CONFIG: { web: string[]; mobile: string[] } = {
            web: ["date","category","project","memo","status","val_amount"],
            mobile: ["date","category","project","status","val_amount"]
        };
        const pattern  = new RegExp('val')

        
        /*Function */
        const loadMore = () => {
            const nextPage = page + 1;
            const nextItems = list.slice(0, nextPage * pageSize); // Expand by another 20 items
            setDisplayList(nextItems);
            setPage(nextPage);
        };
        
        const loadList = async () => {
            setLoading(true);
            const data = await FetchData({...BaseObj,command:'HR : Get Expense List'});
            if (data) {
                setList(data);
                
                setDisplayList(data.slice(0, pageSize)); // Show only first 20 items initially
                
            }
            setLoading(false);
        }

        const toggleCollapse = (key: string) => {
            setExpandedKeys((prev) =>
              prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
            );
        };

        /*React Objects */
        const AnimatedRow = ({item,colNames}:AnimatedRowProps) => {
            
            return (
            <TouchableOpacity onPress={() => {}}>
                <View style={[Listing.container]}>
                    {colNames.map((colName, index) => {
                        let val = item[colName]
                        if (typeof val === 'object' && val !== null) {
                            val = val.name ?? '';
                        }
                        if (pattern.test(colName)) {
                            return (<Text numberOfLines={2} ellipsizeMode="tail" key={index} style={[Listing.number]} accessibilityHint={val ?? ''}>{val ?? ''}</Text>)
                        }
                            return (<Text numberOfLines={2} ellipsizeMode="tail" key={index} style={[Listing.text]} accessibilityHint={val ?? ''}>{val ?? ''}</Text>)
                    })} 
                </View>
            </TouchableOpacity>
            );
        };

        const ListRow = ({data, isCollapsed, toggleCollapse }:{data:GenericObject,isCollapsed:boolean,toggleCollapse: () => void}) => {
            return (
                <>
                    <TouchableOpacity onPress={toggleCollapse}>
                        <View style={[Header.container, {backgroundColor: '#ccc',flexDirection:'row',justifyContent:'space-between',paddingVertical:10,paddingHorizontal:20,borderBottomWidth:1}]}>
                            <Text style={{flex:1,fontWeight: 'bold',textAlign:'left'}}>{data.key}</Text>
                            <Text style={{flex:1,fontWeight: 'bold',textAlign:'right'}}>{data['val_amount']}</Text>
                        </View>
                    </TouchableOpacity>
                    {isCollapsed && data.value.map((item: GenericObject, index: number) => (
                        <AnimatedRow item={item} colNames={COLUMN_CONFIG[isWeb ? 'web' : 'mobile']}/> 
                    ))
                    }
                </>
            )
        }
        
        useEffect(() => {
            loadList();
        
        }, []);
        useEffect(() => {
            setExpandedKeys([]);
          }, [search]);
          
        useEffect(() => {
            const keyword = search.trim().toLowerCase();
           
            
            if (keyword === '') {
                const paginated = list.slice(0, page * pageSize);
                setDisplayList(paginated);
                
            } 
            else {
                
                const filtered = list.flatMap((i) => {
                    const newArry = i.value.filter((item: GenericObject) =>
                      Object.values(item).some((val) =>
                        String(typeof val === 'object' ? val?.name ?? '' : val)
                          .toLowerCase()
                          .includes(keyword)
                      )
                    );
                  
                    return newArry.length > 0 ? [{ key: i.key, value: newArry,val_amount:i['val_amount']}] : [];
                });
                  
                setDisplayList(filtered);  
                
                
               
            }
            
        }, [search,page,list]);
        
        if (loading) {
            return (
              <LoadingScreen txt="Loading..."/>
              
            );
        }
        return (
        <View style={[Page.container,{flexDirection:'column'}]}>
            {/*HEADER */}
            {!isWeb && (
            <View style={[Header.container,{flexDirection:'row'}]}>
                <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                </TouchableOpacity>
                <Text style={[Header.text,{flex:1,width:'auto'}]}>List of Claims</Text>
                <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.replace({ pathname:pathname as any,params: { category: 'submit-expense' } })}>
                    <Ionicons name="add" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                </TouchableOpacity>
            </View>
            )}
            {list.length > 0 ? (
                <View style={{flex:1,flexDirection:'column',width:'100%'}}>
                    {/*Search*/}
                    <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
                    
            
                    {/*LISTING*/}
                    
                    <FlatList
                        style={[Form.container]}
                        
                        data={displayList}
                        keyExtractor={(item) => item.key}
                        stickyHeaderIndices={[0]}
                        ListHeaderComponent={
                            <View style={[ListHeader.container,{borderTopRightRadius:10,borderTopLeftRadius:10}]}>
                                {COLUMN_CONFIG[isWeb ? 'web' : 'mobile'].map((title, index) => {
                                    const RawStr = title.split('_')
                                    const FinalStr = toProperCase(RawStr[RawStr.length - 1])
                                    return (
                                        <Text key={title} style={[ListHeader.text]}>{FinalStr}</Text>
                                    )
                                })}
                            </View>
                        }
                        renderItem={({ item }) => {
                            
                            return (
                                <ListRow data={item} isCollapsed={expandedKeys.includes(item.key)} toggleCollapse={() => toggleCollapse(item.key)}/>
                                
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
            ) : (
                <View style={{flex:1,flexDirection:'column',width:'100%'}}>
                    <NoRecords />
                </View>

            )}
             
        </View>
        
        )
    }
    
    const ClaimForm = ({id}:{id:string}) => {
        const isWeb = useWebCheck(); 
        const [loading, setLoading] = useState(false);
        const [formData, setFormData] = useState({date: new Date(),id,project:{},category: {},value: '',file: null as any});
        const [showDate, setShowDate] = useState(false);
        const [tempData,setTempData] = useState('')
        
        const updateData = (key:keyof typeof formData,value: any) => {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
        
        if (loading) {
            return (
              <LoadingScreen txt="Loading..."/>
              
            );
        }
        
        return (
            <View style={[Page.container]}>
                {!isWeb && (
                <View style={[Header.container,{flexDirection:'row'}]}>
                    <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                    </TouchableOpacity>
                    <Text style={[Header.text,{flex:1,width:'auto'}]}>Expense Claim</Text>
                
                </View>
                )}
                <FormContainer>
                

                    <FormTextInput label="ID " def={formData.id} onChange={(text) => updateData('id', text)} AddStyle={{StyleRow:{display:'none'}}}/>
                    <FormDateInput label='Date ' def={formData.date} onChange={(selectedDate)=>{updateData('date',selectedDate.date)}}/>
                    <FormAutoComplete label="Project " def={formData.project} onChange={(item)=>{updateData('project',item)}} loadList={(query: string) => FetchData({ ...BaseObj, command: "HR : Get Project Listing",keyword:query})}/>
                    <FormAutoComplete label="Category " def={formData.category} onChange={(item)=>{updateData('category',item)}} loadList={(query: string) => FetchData({ ...BaseObj, command: "HR : Get Category Listing",keyword:query})}/>
                 
                    <FormNumericInput label="Value " def={formData.value} onChange={debounce((text) => updateData('value', text),500)} />
                    <FormAttachFile label="Attach File " def={formData.file} onChange={(file) => {updateData('file',file)}}/>
                    
                    <FormSubmit onPress={()=>{}}/>
                    
                </FormContainer>
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
        
        case 'submit-expense':
        case 'expense' :
            return <ExpenseClaim category={category} id={id} user={user}/>;
            
        default:
            return <MainScreen />;
    }
    
}

