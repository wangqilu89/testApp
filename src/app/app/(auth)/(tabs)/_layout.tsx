
import { Tabs,useRouter,Slot  } from 'expo-router';
import React, { useState,useRef } from 'react';
import { Ionicons } from '@expo/vector-icons'; 

import { useWebCheck} from '@/services'; // 👈 update path
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GenericObject,MenuOption } from '@/types';


const WebData:MenuOption[] = [
  {internalid:'1',name:'Home',navigate:'/home'},
  {internalid:'2',name:'Approve',details:[
    { internalid: '2.1', name: 'Timesheets',navigate:'/approve?category=timesheet'},
    { internalid: '2.2', name: 'Expense Claims',navigate:'/approve?category=expense'},
    { internalid: '2.3', name: 'Leaves' ,navigate:'/approve?category=leave'}, 
    { internalid: '2.4', name: 'Invoices' ,navigate:'/approve?category=invoice'},
    { internalid: '2.5', name: 'Lost Clients' ,navigate:'/approve?category=lost'}
  ]},
  {internalid:'3',name:'HR',details:[
    { internalid: '3.1', name: 'Key Information',navigate:'/hr?category=personal'},
    { internalid: '3.2', name: 'Leaves',navigate:'/hr?category=leave'},
    { internalid: '3.3', name: 'Claims Listing' ,navigate:'/hr?category=expense'},
    { internalid: '3.4', name: 'Timesheets' ,navigate:'/hr?category=timesheet'}, 
    { internalid: '3.5', name: 'Pay Slip' ,navigate:'/hr?category=payslip'}
  ]}
]




const MobileTabs = () => {
  const colorScheme = useColorScheme();
  return (
      <Tabs screenOptions={{tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: { position: 'absolute',height: 55}
         
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home',tabBarIcon:({ color, size }) => (<Ionicons name="home" color={color} size={size} />)}} />
        <Tabs.Screen name="hr/index" options={{href:'/hr',title: 'HR',tabBarIcon:({ color, size }) => (<Ionicons name="person" color={color} size={size} />) }} />
        <Tabs.Screen name="approve/index" options={{href:'/approve',title: 'Approve',tabBarIcon:({ color, size }) => (<Ionicons name="checkbox" color={color} size={size} />) }} />
        <Tabs.Screen name="resource/index" options={{href:null}} />
        {/*<Tabs.Screen name="resource/index" options={{href:'/resource',title: 'Resource',tabBarIcon:({ color, size }) => (<Ionicons name="people" color={color} size={size} />) }} />*/}
        <Tabs.Screen name="project/index" options={{href:'/project',title: 'More',tabBarIcon:({ color, size }) => (<Ionicons name="ellipsis-horizontal" color={color} size={size} />)}} />
        <Tabs.Screen name="hr/_claim" options={{href:null}} />
        <Tabs.Screen name="hr/_leave" options={{href:null}} />
        <Tabs.Screen name="hr/_payslip" options={{href:null }} />
        <Tabs.Screen name="hr/_timesheet" options={{href:null}} />
        {/* ❗️Hide dynamic subpages from bottom tabs */}
        <Tabs.Screen name="index" options={{ href: null}} />
      </Tabs>
  );
}

const WebTabs = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  
  const [submenuDirection, setSubmenuDirection] = useState<'left' | 'right'>('right');
  const [rectObj,setRectObj] = useState<GenericObject>({top:38,right:0,bottom:0,left:0,width:0,height:0,x:0,y:0});
   
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#777', // grey background
    overflowX: 'auto',
    zIndex: 9999,
    //margin: '20px',
  };

  const mainButtonStyle: React.CSSProperties = {
    color: 'white',
    backgroundColor: '#878787', // dark highlight if active
    border: '1px solid white',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    width:'150px',
    maxWidth:'150px',
  };
  
  const HoverButton = ({refkey,label,navigate,children}:{refkey:string,label:string,navigate:string|null,children?: React.ReactNode}) => {
    const ids = refkey.split('.')
    const parent = ((ids.length > 1 )? ids.slice(0, -1).join('.') : null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (event:React.MouseEvent) => {
        
        const rect = event.currentTarget.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right;
        setSubmenuDirection(spaceRight < 200 ? 'left' : 'right');
        
        if (navigate) {
          setHoveredId(parent)
        }
        else {
          setParentId(parent)
          setHoveredId(refkey)
          if (parent) {
            setRectObj(rect)
          }
        }
    }
    const handleClick = () => {
      if (navigate) {
          router.push(navigate as any)
      }
    }
    const handleMouseLeave = () => {
      setHoveredId(null);
      setParentId(null);
      
      
    };
    return (
      <div onMouseEnter={(event) => handleMouseEnter(event)}  onMouseLeave={handleMouseLeave}>
      
      <button onClick={handleClick} style={{...mainButtonStyle}} >{label}</button>
      {children}
      </div>
    )
  }

  const listItem = (key:string) => {
    if (hoveredId === key) {
      const ids = key.split('.')
      const parent = ((ids.length > 1 )? ids.slice(0, -1).join('.') : null);
      const menuStyle: React.CSSProperties = {position:'fixed',top: `${rectObj.top}px`,width:'150px',maxWidth:'150px',marginBottom: '10px',borderRadius: 6,whiteSpace: 'nowrap',...(parent ? { [submenuDirection]: '100%' } : {})}

      let refStr = ''
      let hoveredItem = WebData
      for (var i=0; i < ids.length; i++) {
        refStr += ids[i]
        hoveredItem = (hoveredItem.find((item) => item.internalid === refStr)?.details || [])
        refStr += '.'
        if (hoveredItem.length == 0) {
          break;
        }
      }
      return (
        <div style={menuStyle}>
          <ul style={{listStyleType: 'none', padding: 0, margin: 0 }}>
          {hoveredItem.map((sub) => (
            <li key={sub.internalid}>
              <HoverButton refkey={sub.internalid} label={sub.name} navigate={sub.navigate || null} >
                {listItem(sub.internalid)}
              </HoverButton>
            </li>
            
          ))}
        </ul>
        </div>
      )
    }
    else {
      return null;
    }
  }

  return (
    <div style={containerStyle}>
      {WebData.map((item) => {
        
        return (
        <HoverButton refkey={item.internalid} label={item.name} navigate={item.navigate || null} >
          {listItem(item.internalid)}
        </HoverButton>
        )
      })}
        
  </div>
)}

export default function TabLayout() {
  const isWeb = useWebCheck();
  if (isWeb) {
    return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WebTabs />
      <div style={{ flex: 1, overflow: 'auto' }}><Slot /></div>
    </div>
    )
  }
  return (
    <MobileTabs />
  )

  
}
