
import {useLocalSearchParams} from 'expo-router';
import { MainPage,MainViewer} from '@/services'; // 👈 Common Screens
import { useUser } from '@/components/User';
import { GenericObject,MenuOption, User} from '@/types';
import { PaySlip } from './_payslip';
import { ExpenseClaim } from './_claim';
import { Leave } from './_leave';
import { Timesheet } from './_timesheet';

const approvals:MenuOption[] = [
  { internalid: 'personal', name: 'Personal Information',icon:'person-outline'},
  { internalid: 'leave', name: 'Leaves',icon:'calendar-outline'},
  { internalid: 'expense', name: 'Claims',icon:'card-outline'},
  { internalid: 'timesheet', name: 'Timesheets',icon:'time-outline'},
  { internalid: 'payslip', name: 'Download Pay Slip',icon:'document-text-outline'}
];


function MainScreen({scheme}:{scheme:'light'|'dark'}) {
  return (
    <MainPage redirect="hr" pages={approvals} title="HR" scheme={scheme}/>
  );
}


function DocumentView({url,doc,scheme}:{url:string,doc:string,scheme:'light'|'dark'}) {

    return (
        <MainViewer url={url} doc={doc} scheme={scheme}/>
    )

}

export default function HRScreen() {
    const {category,id = '0',url = '',doc = '',date = '',leave=''} = useLocalSearchParams<Partial<{ category: string; id: string; url: string; doc: string,date:string,leave:string}>>();
    const { user,BaseObj,ColorScheme} = useUser(); // ✅ Pull from context
    
    switch (category){
        case 'attachment':
            return <DocumentView url={url} doc={doc} scheme={ColorScheme??'light'}/>;
        
        case 'expense' :
        case 'submit-expense':
            return <ExpenseClaim category={category} id={id} user={user as User} BaseObj={BaseObj as GenericObject} scheme={ColorScheme??'light'}/>;
        
        case 'leave' :
        case 'submit-leave':
          return <Leave category={category} id={id} user={user} BaseObj={BaseObj as GenericObject} leave={leave} scheme={ColorScheme??'light'}/>;

        case 'payslip'  :
            return <PaySlip category={category} user={user} BaseObj={BaseObj as GenericObject} scheme={ColorScheme??'light'}/>;
        case 'timesheet':
        case 'submit-time':
            return <Timesheet category={category} id={id} user={user as User} BaseObj={BaseObj as GenericObject} date={date} scheme={ColorScheme??'light'}/>;
        default:
            return <MainScreen scheme={ColorScheme??'light'}/>;
    }
    
}

