
import { Tabs,useRouter,Slot  } from 'expo-router';
import React, { useState,useRef } from 'react';
import { Ionicons } from '@expo/vector-icons'; 

import { useWebCheck} from '@/services'; // 👈 update path
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type MenuItem = {
  id: string;
  label: string;
  navigate?: string;
  details?: MenuItem[];
};
type GenericObject = Record<string, any>;

const WebData:MenuItem[] = [
  {id:'1',label:'Home',navigate:'/home'},
  {id:'2',label:'Approve',details:[{ id: '2.1', label: 'Timesheets',navigate:'/approve/timesheets'},{ id: '2.2', label: 'Expense Claims',navigate:'/approve/expenses'},{ id: '2.3', label: 'Leaves' ,navigate:'/approve/leave'}, { id: '2.4', label: 'Invoices' ,navigate:'/approve/invoices'},{ id: '2.5', label: 'Lost Clients' ,navigate:'/approve/lost'}]}
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
        <Tabs.Screen name="hr-main" options={{ title: 'HR',tabBarIcon:({ color, size }) => (<Ionicons name="person" color={color} size={size} />) }} />
        <Tabs.Screen name="approve-main" options={{ title: 'Approve',tabBarIcon:({ color, size }) => (<Ionicons name="checkbox" color={color} size={size} />) }} />
        <Tabs.Screen name="resource-main" options={{ title: 'Resources',tabBarIcon:({ color, size }) => (<Ionicons name="people" color={color} size={size} />) }} />
        <Tabs.Screen name="more-main" options={{ title: 'More',tabBarIcon:({ color, size }) => (<Ionicons name="ellipsis-horizontal" color={color} size={size} />)}} />
        {/* ❗️Hide dynamic subpages from bottom tabs */}
        <Tabs.Screen name="approve/[category]" options={{ href: null }} />
        <Tabs.Screen name="index" options={{ href: null }} />
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
        hoveredItem = (hoveredItem.find((item) => item.id === refStr)?.details || [])
        refStr += '.'
        if (hoveredItem.length == 0) {
          break;
        }
      }
      return (
        <div style={menuStyle}>
          <ul style={{listStyleType: 'none', padding: 0, margin: 0 }}>
          {hoveredItem.map((sub) => (
            <li key={sub.id}>
              <HoverButton refkey={sub.id} label={sub.label} navigate={sub.navigate || null} >
                {listItem(sub.id)}
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
        <HoverButton refkey={item.id} label={item.label} navigate={item.navigate || null} >
          {listItem(item.id)}
        </HoverButton>
        )
      })}
        
  </div>
)}

export default function TabLayout() {
  const isWeb = useWebCheck();
  return isWeb ? <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><WebTabs /><div style={{ flex: 1, overflow: 'auto' }}><Slot /></div></div>: <MobileTabs />;
}
