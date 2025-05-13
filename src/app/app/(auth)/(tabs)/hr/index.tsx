import { MainPage} from '@/services'; // 👈 update path

const approvals = [
  { id: 'personal', title: 'Personal Information',icon:'person-outline'},
  { id: 'leave', title: 'Apply Leave',icon:'calendar-outline'},
  { id: 'expenses', title: 'Submit Claim',icon:'card-outline'},
  { id: 'payslip', title: 'Download Pay Slip',icon:'document-text-outline'}
];

export default function HRScreen() {
  return (
    <MainPage redirect="hr" pages={approvals} title="HR"/>
  );
}

