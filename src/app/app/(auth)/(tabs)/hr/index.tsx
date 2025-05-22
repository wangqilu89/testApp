
import { View, Text, TouchableOpacity, FlatList, Button,Platform,TextInput} from 'react-native';
import { useEffect, useState,useCallback} from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useUser,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,FetchData} from '@/services'; // 👈 functions
import { LoadingScreen, NoRecords, MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import {FormContainer,FormSubmit,FormDateInput,FormTextInput,FormNumericInput,FormAutoComplete,FormAttachFile} from '@/services';
import debounce from 'lodash.debounce';

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
    
    const router = useRouter();
    const {Page,Header,Listing,Form} = useThemedStyles();
    
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
        
        const [page, setPage] = useState(1);
        const pageSize = 10; // Show 10 items at a time
        const isWeb = useWebCheck(); // Only "true web" if wide   
        const COLUMN_CONFIG: { web: string[]; mobile: string[] } = {
            web: ["date","category","project","memo","val_amount","status","link"],
            mobile: ["date","category","project","val_amount","status"]
        };
        const pattern  = new RegExp('val')
        
        
        
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
        const AnimatedRow = ({item,colNames}:AnimatedRowProps) => {
            
            return (
            <TouchableOpacity onPress={() => router.push({pathname: '/hr' as any, params: { url: encodeURIComponent(item.url),doc:item.doc} })}>
                <Animated.View style={[Listing.container]}>
                <>
                    {colNames.map((colName, index) => {
                        let val = item[colName]
                        if (typeof val === 'object' && val !== null) {
                            val = val.name ?? '';
                        }
                        if (pattern.test(colName)) {
                            return (<Text key={index} style={[Listing.number]}>{val ?? ''}</Text>)
                        }
                            return (<Text key={index} style={[Listing.text]}>{val ?? ''}</Text>)
                    })} 
                </>   
            
                </Animated.View>
            </TouchableOpacity>
            );
        };

        const ListRow = (data:GenericObject) => {
            const [collapsed,setCollapsed] = useState(false)
            data.value.forEach
            return (
                <>
                    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
                        <View style={[Header.container, {backgroundColor: '#ccc'}]}>
                        <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>{data.key} {collapsed ? '▼' : '▲'}</Text>
                        </View>
                    </TouchableOpacity>
                    {collapsed && data.value.map((item: GenericObject, index: number) => (
                        <AnimatedRow item={item} colNames={COLUMN_CONFIG[isWeb ? 'web' : 'mobile']}/> 
                    ))
                    }
                </>
            )
        }

        useEffect(() => {
        
            loadList();
        
        }, []);
        if (list.length == 0) {
            return (
              <NoRecords />
            );
        }
        if (loading) {
            return (
              <LoadingScreen txt="Loading..."/>
              
            );
        }
        return (
        <View style={[Page.container]}>
            {/*HEADER */}
            <View style={[Header.container]}><Text style={[Header.text]}>List of Claims</Text></View>
            {/*LISTING*/}
            <FlatList
                style={[Page.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={
                    <View style={[Header.container]}>
                        {COLUMN_CONFIG[isWeb ? 'web' : 'mobile'].map((title, index) => {
                            const RawStr = title.split('_')
                            const FinalStr = toProperCase(RawStr[RawStr.length - 1])
                            return (
                                <Text key={index} style={[Header.text]}>{FinalStr}</Text>
                            )
                        })}
                    </View>
                }
                renderItem={({ item }) => {
                    return (
                        <ListRow data={item} />
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
    
    const ClaimForm = ({id}:{id:string}) => {

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
                <View style={[Header.container]}><Text style={[Header.text]}>Expense Claim</Text></View>
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

