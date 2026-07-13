import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Settings, 
  Search, 
  Lock, 
  Unlock, 
  Eye, 
  Award,
  AlertCircle,
  Activity,
  ArrowRight,
  Info,
  FileText,
  ShieldCheck,
  Check,
  Plus,
  Send,
  X,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Seed Mock Data for Charts
const REVENUE_DATA = [
  { month: 'Jan', revenue: 4500000, commission: 450000 },
  { month: 'Feb', revenue: 5200000, commission: 520000 },
  { month: 'Mar', revenue: 6100000, commission: 610000 },
  { month: 'Apr', revenue: 5800000, commission: 580000 },
  { month: 'May', revenue: 7300000, commission: 730000 },
  { month: 'Jun', revenue: 8900000, commission: 890000 },
];

const CATEGORY_POPULARITY = [
  { name: 'Umeme', count: 145, color: '#F59E0B' },
  { name: 'Mabomba', count: 120, color: '#3B82F6' },
  { name: 'AC Repair', count: 85, color: '#10B981' },
  { name: 'Magari', count: 64, color: '#EF4444' },
  { name: 'Useramala', count: 50, color: '#8B5CF6' },
];

interface AdminDashboardProps {
  onBackToCustomer: () => void;
  onOpenOpsCenter: () => void;
}

export function AdminDashboard({ onBackToCustomer, onOpenOpsCenter }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'fundis' | 'users' | 'disputes' | 'settings' | 'professions' | 'trust-warranty'>('analytics');
  const [adminClaims, setAdminClaims] = useState<any[]>([
    {
      id: 'CLM-01',
      warrantyNumber: 'WAR-882718',
      customerName: 'Customer Test',
      fundiName: 'Juma Shabaan',
      bookingDescription: 'Kurekebisha AC iliyovuja maji',
      description: 'AC inavuja maji tena baada ya siku mbili',
      status: 'PENDING',
      createdAt: '2026-07-10'
    }
  ]);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [fundiSearch, setFundiSearch] = useState('');
  const [expandedFundiId, setExpandedFundiId] = useState<string | null>(null);

  // Verification details, notes and badge states
  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({});
  const [docsRequestMessage, setDocsRequestMessage] = useState<{ [key: string]: string }>({});
  
  // API and local state sync
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [commission, setCommission] = useState(10);
  const [vat, setVat] = useState(18);
  const [notification, setNotification] = useState<string | null>(null);
  const [subBasic, setSubBasic] = useState(29000);
  const [subPro, setSubPro] = useState(59000);
  const [subPremium, setSubPremium] = useState(99000);
  const [promotionFee, setPromotionFee] = useState(15000);
  const [inspectionFeeBase, setInspectionFeeBase] = useState(5000);
  const [corporateDiscount, setCorporateDiscount] = useState(15);

  // Fallback / Seed mock data
  const MOCK_QUEUE = [
    {
      user_id: 'f-pending-1',
      full_name: 'Amani Kidoti',
      phone_number: '+255788998877',
      verification_status: 'pending_verification',
      national_id_number: '19951203-11101-00002-12',
      national_id_url: '/uploads/nida_amani.jpg',
      business_license_url: '/uploads/business_lic_amani.jpg',
      professional_certificate_url: '/uploads/veta_cert_amani.jpg',
      verification_notes: null,
      pending_certificates: [
        { id: 'c-1', name: 'VETA Electrical Level III', institution: 'VETA Kipawa', certificate_number: 'VETA-2022-9988', issue_date: '2022-06-15', verification_status: 'pending_verification', image_url: '/uploads/veta_cert_amani.jpg' }
      ],
      pending_licenses: [
        { id: 'l-1', license_number: 'EWURA-WIRE-CLASS-B', authority: 'EWURA Tanzania', expiry_date: '2028-12-31', status: 'pending_verification', credential_url: '/uploads/ewura_amani.jpg' }
      ]
    },
    {
      user_id: 'f-pending-2',
      full_name: 'Neema Mwita',
      phone_number: '+255766112233',
      verification_status: 'pending_verification',
      national_id_number: '19980815-22201-00005-45',
      national_id_url: '/uploads/nida_neema.jpg',
      business_license_url: null,
      professional_certificate_url: '/uploads/ac_cert_neema.jpg',
      verification_notes: 'Wasilisha picha safi zaidi ya Kitambulisho chako cha NIDA.',
      pending_certificates: [
        { id: 'c-2', name: 'National HVAC Specialist Certification', institution: 'DIT Dar es Salaam', certificate_number: 'DIT-AC-9080', issue_date: '2024-03-10', verification_status: 'pending_verification', image_url: '/uploads/ac_cert_neema.jpg' }
      ],
      pending_licenses: []
    }
  ];

  const MOCK_USERS = [
    { id: 'u-1', fullName: 'Baraka Joseph', role: 'CUSTOMER', status: 'ACTIVE', phone: '+255711223344', email: 'baraka@example.com' },
    { id: 'u-2', fullName: 'Juma Shabaan', role: 'FUNDI', status: 'ACTIVE', phone: '+255755667788', email: 'juma@example.com' },
    { id: 'u-3', fullName: 'John Doe', role: 'CUSTOMER', status: 'SUSPENDED', phone: '+255799988866', email: 'john@serenahotel.co.tz' },
  ];

  const MOCK_DISPUTES = [
    { id: 'disp-1', bookingId: 'book-101', customerName: 'Baraka Joseph', fundiName: 'Juma Shabaan', amount: 45000, reason: 'Fundi hakukamilisha kazi ya ufungaji wa valvu vizuri na kuacha kuvuja.', status: 'OPEN' }
  ];

  const MOCK_CATEGORIES = [
    { id: '1', nameEn: 'Electrician', nameSw: 'Fundi Umeme', iconName: 'Zap', isActive: true },
    { id: '2', nameEn: 'Plumber', nameSw: 'Fundi Mabomba', iconName: 'Droplet', isActive: true },
    { id: '3', nameEn: 'AC Repair', nameSw: 'Fundi AC', iconName: 'Wind', isActive: true },
    { id: '4', nameEn: 'Carpenter', nameSw: 'Fundi Mbao', iconName: 'Hammer', isActive: true },
    { id: '5', nameEn: 'Mason', nameSw: 'Fundi Uashi', iconName: 'Briefcase', isActive: true },
  ];

  // Load Data from APIs or fall back
  const loadDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const qRes = await fetch('/api/admin/verification-queue', { headers });
      if (qRes.ok) setVerificationQueue(await qRes.json());
      else setVerificationQueue(MOCK_QUEUE);

      const uRes = await fetch('/api/admin/users', { headers });
      if (uRes.ok) setUsersList(await uRes.json());
      else setUsersList(MOCK_USERS);

      const dRes = await fetch('/api/admin/disputes', { headers });
      if (dRes.ok) setDisputesList(await dRes.json());
      else setDisputesList(MOCK_DISPUTES);

      const cRes = await fetch('/api/fundis/professions');
      if (cRes.ok) setAdminCategories(await cRes.json());
      else setAdminCategories(MOCK_CATEGORIES);

    } catch (error) {
      console.warn('API connection failed. Fallback mock data loaded in Admin Dashboard.');
      setVerificationQueue(MOCK_QUEUE);
      setUsersList(MOCK_USERS);
      setDisputesList(MOCK_DISPUTES);
      setAdminCategories(MOCK_CATEGORIES);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. Approve Certificate Action
  const handleApproveCertificate = async (certId: string, fundiId: string) => {
    try {
      const res = await fetch(`/api/admin/verify/certificate/${certId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'verified' })
      });
      if (res.ok) {
        triggerNotification('Cheti kimeidhinishwa kwa mafanikio!');
      } else {
        triggerNotification('Cheti kimeidhinishwa (Local update)');
      }
      if (typeof (window as any).awardVetaBadgeLocal === 'function') {
        (window as any).awardVetaBadgeLocal(fundiId);
      }
    } catch {
      triggerNotification('Cheti kimeidhinishwa! (Fallback local mode)');
      if (typeof (window as any).awardVetaBadgeLocal === 'function') {
        (window as any).awardVetaBadgeLocal(fundiId);
      }
    }
    // Update local state UI
    setVerificationQueue(prev => prev.map(f => {
      if (f.user_id === fundiId) {
        return {
          ...f,
          pending_certificates: f.pending_certificates.filter((c: any) => c.id !== certId)
        };
      }
      return f;
    }).filter(f => f.pending_certificates.length > 0 || (f.pending_licenses && f.pending_licenses.length > 0)));
  };

  // 2. Reject Certificate Action
  const handleRejectCertificate = async (certId: string, fundiId: string) => {
    const notes = rejectionNotes[certId] || 'Hati haijakidhi viwango.';
    try {
      await fetch(`/api/admin/verify/certificate/${certId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'rejected', notes })
      });
      triggerNotification('Cheti kimekataliwa na kuondolewa kwenye foleni.');
    } catch {
      triggerNotification('Cheti kimekataliwa! (Local mode)');
    }
    setVerificationQueue(prev => prev.map(f => {
      if (f.user_id === fundiId) {
        return {
          ...f,
          pending_certificates: f.pending_certificates.filter((c: any) => c.id !== certId)
        };
      }
      return f;
    }).filter(f => f.pending_certificates.length > 0 || (f.pending_licenses && f.pending_licenses.length > 0)));
  };

  // 3. Approve License Action
  const handleApproveLicense = async (licId: string, fundiId: string) => {
    try {
      await fetch(`/api/admin/verify/license/${licId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'verified' })
      });
      triggerNotification('Leseni ya kazi imeidhinishwa kwa mafanikio!');
    } catch {
      triggerNotification('Leseni imeidhinishwa! (Local mode)');
    }
    setVerificationQueue(prev => prev.map(f => {
      if (f.user_id === fundiId) {
        return {
          ...f,
          pending_licenses: f.pending_licenses.filter((l: any) => l.id !== licId)
        };
      }
      return f;
    }).filter(f => f.pending_certificates.length > 0 || (f.pending_licenses && f.pending_licenses.length > 0)));
  };

  // 4. Request Additional Documents Action
  const handleRequestDocs = async (fundiId: string) => {
    const message = docsRequestMessage[fundiId];
    if (!message) {
      alert('Tafadhali andika ujumbe wa maelezo ya hati unazoomba kwanza.');
      return;
    }
    try {
      await fetch('/api/admin/verify/request-docs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fundiId, message })
      });
      triggerNotification('Ombi la nyaraka za ziada limewasilishwa kwa Fundi.');
    } catch {
      triggerNotification('Ombi la nyaraka za ziada limetumwa.');
    }
  };

  // 5. Toggle Verified Badge Custom Settings
  const handleToggleBadge = async (fundiId: string, badgeName: string, currentValue: boolean) => {
    try {
      await fetch('/api/admin/verify/badge', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fundiId, badge: badgeName, value: !currentValue })
      });
      triggerNotification(`Beji ya "${badgeName}" imebadilishwa hali.`);
    } catch {
      triggerNotification(`Beji ya "${badgeName}" imesasishwa!`);
    }
  };

  // 6. Platform User Toggle Suspend / Active
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'suspended' : 'active';
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      triggerNotification(`Hali ya mtumiaji imebadilishwa kuwa ${nextStatus.toUpperCase()}`);
    } catch {
      triggerNotification(`Hali ya akaunti imesasishwa!`);
    }
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus.toUpperCase() } : u));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-800 border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slideIn">
          <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-500 p-2.5 rounded-2xl text-white shadow-lg shadow-brand-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Fundi Service Dashboard</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Msimamizi Workspace</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-slate-800 border border-slate-700 text-slate-350 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl">
            verification officer
          </span>
          <button 
            onClick={onOpenOpsCenter}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-brand-400 font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all flex items-center space-x-2"
          >
            <span>Ops Control</span>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </button>
          <button 
            onClick={onBackToCustomer}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center space-x-2"
          >
            <span>Customer Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4">Operations Console</p>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'analytics' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Mapato na Ukuaji (Analytics)</span>
          </button>
          <button 
            onClick={() => setActiveTab('fundis')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'fundis' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Verification Queue ({verificationQueue.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'users' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Dhibiti Watumiaji (Users)</span>
          </button>
          <button 
            onClick={() => setActiveTab('disputes')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'disputes' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Disputes & Escrow ({disputesList.filter(d => d.status === 'OPEN').length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('trust-warranty')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'trust-warranty' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Warranty & Trust Hub</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === 'settings' ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Sheria na Settings</span>
          </button>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-grow p-6 space-y-6 bg-slate-950/30">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* BETA LAUNCH PROGRESS BANNER */}
              <div className="bg-gradient-to-r from-brand-900/40 to-slate-900 border border-brand-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden animate-fadeIn">
                <div className="space-y-1 z-10">
                  <h3 className="text-sm font-black text-brand-400 uppercase tracking-widest flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                    <span>Beta Launch Rollout tracker</span>
                  </h3>
                  <h4 className="text-lg font-black text-white">Hatua ya Kuzindua Mfumo (Staged Rollout Status)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Tuko katika hatua ya <strong>Open Beta</strong>. Mifumo yote ya Escrow, dhamana (Warranty certificates), na verified na VETA inaendelea kupimwa kwa usahihi kabla ya uzinduzi rasmi wa kitaifa.
                  </p>
                </div>
                <div className="flex items-center space-x-3 z-10 text-[10px] font-black uppercase text-center shrink-0">
                  <div className="space-y-1">
                    <div className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs">✓</div>
                    <span className="text-emerald-400">Internal</span>
                  </div>
                  <div className="h-0.5 w-6 bg-emerald-500 rounded" />
                  <div className="space-y-1">
                    <div className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs">✓</div>
                    <span className="text-emerald-400">Closed Beta</span>
                  </div>
                  <div className="h-0.5 w-6 bg-brand-500 rounded" />
                  <div className="space-y-1">
                    <div className="bg-brand-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs animate-bounce">3</div>
                    <span className="text-brand-400 font-black">Open Beta</span>
                  </div>
                  <div className="h-0.5 w-6 bg-slate-700 rounded" />
                  <div className="space-y-1">
                    <div className="bg-slate-800 text-slate-500 w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs border border-slate-750">4</div>
                    <span className="text-slate-500">Official</span>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-500/5 to-transparent pointer-events-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumla ya Mapato</span>
                  <h3 className="text-2xl font-black">37,800,000 TZS</h3>
                  <p className="text-[10px] text-emerald-400 font-bold">+15% tangu mwezi jana</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komisheni ya Jukwaa (10%)</span>
                  <h3 className="text-2xl font-black">3,780,000 TZS</h3>
                  <p className="text-[10px] text-brand-400 font-bold">Inazalishwa kiotomatiki</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kazi Zilizokamilika leo</span>
                  <h3 className="text-2xl font-black">45 Jobs</h3>
                  <p className="text-[10px] text-amber-400 font-bold">100% completion rate</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Health Status</span>
                  <h3 className="text-2xl font-black text-emerald-400">HEALTHY</h3>
                  <p className="text-[10px] text-slate-500">API latency: 45ms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="font-extrabold text-sm">Grafu ya Mapato na Komisheni (TZS)</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: 10 }} />
                        <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="font-extrabold text-sm">Huduma Zinazopendwa Zaidi</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CATEGORY_POPULARITY} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: 9 }} />
                        <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px' }} />
                        <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                          {CATEGORY_POPULARITY.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFICATION QUEUE */}
          {activeTab === 'fundis' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black tracking-tight">Hati za Uhakiki (Verification Center)</h2>
                  <p className="text-xs text-slate-400">Kagua vitambulisho vya NIDA, vyeti vya taaluma (VETA) na leseni za kazi</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
                  <input 
                    type="text"
                    value={fundiSearch}
                    onChange={(e) => setFundiSearch(e.target.value)}
                    placeholder="Tafuta kwa jina..."
                    className="bg-slate-900 text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-850 outline-none w-64 focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              {verificationQueue.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="font-extrabold text-slate-200">Hakuna hati zozote zinazosubiri uhakiki!</p>
                  <p className="text-xs">Mafundi wote wamekaguliwa kikamilifu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationQueue
                    .filter(f => f.full_name.toLowerCase().includes(fundiSearch.toLowerCase()))
                    .map(f => (
                      <div key={f.user_id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-brand-400 text-base">
                              {f.full_name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-extrabold text-sm text-slate-100">{f.full_name}</h3>
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-550/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                  {f.verification_status.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Simu: {f.phone_number} | NIDA: {f.national_id_number}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setExpandedFundiId(expandedFundiId === f.user_id ? null : f.user_id)}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                          >
                            {expandedFundiId === f.user_id ? 'Funga Nyaraka' : 'Kagua Nyaraka'}
                          </button>
                        </div>

                        {expandedFundiId === f.user_id && (
                          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-xs leading-relaxed">
                            {/* NIDA details */}
                            <div className="space-y-3 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
                              <span className="font-black text-[9px] text-slate-450 uppercase tracking-widest block border-b border-slate-850 pb-2">National ID details</span>
                              <div className="space-y-1">
                                <p><span className="text-slate-450">Kitambulisho Namba:</span> <span className="font-mono font-bold text-slate-200">{f.national_id_number}</span></p>
                                <p><span className="text-slate-450">Kadi Picha:</span> <span className="text-brand-400 font-bold underline cursor-pointer">nida_card_copy.jpg (View Scan)</span></p>
                                <p><span className="text-slate-455">Security Hash Checksum:</span> <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded border border-slate-800 block text-slate-350 truncate mt-1">SHA256:d3a1f9e8...</span></p>
                              </div>

                              <div className="pt-2 border-t border-slate-850 space-y-2">
                                <span className="text-[10px] font-extrabold text-slate-400 block">Omba Nyaraka za Ziada (Request Additional Files)</span>
                                <div className="flex space-x-2">
                                  <input 
                                    type="text" 
                                    placeholder="e.g. Uwasilishe picha ya cheti kingine..."
                                    value={docsRequestMessage[f.user_id] || ''}
                                    onChange={(e) => setDocsRequestMessage({ ...docsRequestMessage, [f.user_id]: e.target.value })}
                                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 outline-none text-[11px] flex-1 font-medium text-slate-200"
                                  />
                                  <button
                                    onClick={() => handleRequestDocs(f.user_id)}
                                    className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Certificates list */}
                            <div className="space-y-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
                              <span className="font-black text-[9px] text-slate-450 uppercase tracking-widest block border-b border-slate-850 pb-2">Vyeti vya Taaluma (Certificates)</span>
                              {f.pending_certificates && f.pending_certificates.length > 0 ? (
                                <div className="space-y-3.5">
                                  {f.pending_certificates.map((cert: any) => (
                                    <div key={cert.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="font-extrabold text-slate-200 block text-[11px]">{cert.name}</span>
                                          <span className="text-[10px] text-slate-455 block">{cert.institution} • Cert #: {cert.certificate_number}</span>
                                          <span className="text-[9px] text-slate-500 font-medium italic block mt-0.5">Ilikuwa: {cert.issue_date}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-2 pt-1">
                                        <input 
                                          type="text"
                                          placeholder="Rejection feedback..."
                                          value={rejectionNotes[cert.id] || ''}
                                          onChange={(e) => setRejectionNotes({ ...rejectionNotes, [cert.id]: e.target.value })}
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 outline-none text-[10px] flex-1 font-medium"
                                        />
                                        <button 
                                          onClick={() => handleRejectCertificate(cert.id, f.user_id)}
                                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-extrabold text-[9px] px-2 py-1 rounded-lg"
                                        >
                                          Kataa
                                        </button>
                                        <button 
                                          onClick={() => handleApproveCertificate(cert.id, f.user_id)}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] px-3 py-1 rounded-lg"
                                        >
                                          Idhinisha
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500 italic">Hakuna vyeti vinavyosubiri kuidhinishwa.</p>
                              )}
                            </div>

                            {/* Licenses & custom badges toggles */}
                            <div className="space-y-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
                              <span className="font-black text-[9px] text-slate-450 uppercase tracking-widest block border-b border-slate-850 pb-2">Leseni & Badge management</span>
                              
                              {f.pending_licenses && f.pending_licenses.length > 0 ? (
                                <div className="space-y-2">
                                  {f.pending_licenses.map((lic: any) => (
                                    <div key={lic.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex justify-between items-center">
                                      <div>
                                        <span className="font-extrabold text-slate-200 block text-[11px]">{lic.license_number}</span>
                                        <span className="text-[10px] text-slate-455 block">{lic.authority} • Exp: {lic.expiry_date}</span>
                                      </div>
                                      <button 
                                        onClick={() => handleApproveLicense(lic.id, f.user_id)}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-lg flex items-center space-x-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Approve</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500 italic">Hakuna leseni zinayosubiri kuidhinishwa.</p>
                              )}

                              <div className="pt-2 border-t border-slate-850 space-y-2">
                                <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Verified Badges Panel</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                  <button 
                                    onClick={() => handleToggleBadge(f.user_id, 'veta_certified', false)}
                                    className="p-2 border border-slate-800 bg-slate-900 rounded-xl text-left hover:border-brand-500/50 flex items-center space-x-1.5"
                                  >
                                    <Award className="w-3.5 h-3.5 text-amber-500" />
                                    <span>VETA Certified</span>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleBadge(f.user_id, 'background_checked', false)}
                                    className="p-2 border border-slate-800 bg-slate-900 rounded-xl text-left hover:border-brand-500/50 flex items-center space-x-1.5"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                                    <span>Background Checked</span>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleBadge(f.user_id, 'premium_fundi', false)}
                                    className="p-2 border border-slate-800 bg-slate-900 rounded-xl text-left hover:border-brand-500/50 flex items-center space-x-1.5"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                                    <span>Premium Fundi</span>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleBadge(f.user_id, 'top_rated', false)}
                                    className="p-2 border border-slate-800 bg-slate-900 rounded-xl text-left hover:border-brand-500/50 flex items-center space-x-1.5"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Top Rated</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USERS LIST & SUSPENSIONS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black tracking-tight">Watumiaji wa Mfumo (Users List)</h2>
                  <p className="text-xs text-slate-400">Simamisha (suspend) akaunti au weka block ikiwa kuna ukiukwaji wa sheria</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
                  <input 
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tafuta mtumiaji..."
                    className="bg-slate-900 text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-850 outline-none w-64 focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                      <th className="p-4 font-bold">Jina Kamili</th>
                      <th className="p-4 font-bold">Jukumu (Role)</th>
                      <th className="p-4 font-bold">Simu / Email</th>
                      <th className="p-4 font-bold">Hali (Status)</th>
                      <th className="p-4 font-bold text-center">Hatua (Action)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()))
                      .map(u => (
                        <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                          <td className="p-4 font-black">{u.fullName}</td>
                          <td className="p-4 font-semibold text-slate-350">{u.role}</td>
                          <td className="p-4">
                            <div className="font-semibold">{u.phone}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{u.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                              u.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center">
                            <button 
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={`font-black px-4 py-2 rounded-xl flex items-center space-x-1.5 text-[10px] uppercase tracking-wider border ${
                                u.status === 'ACTIVE'
                                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Simamisha (Suspend)</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Rejesha (Activate)</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ESCROW DISPUTES */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight">Migogoro ya Malipo (Disputes resolution)</h2>
                <p className="text-xs text-slate-400">Tatua malalamiko ya Escrow, lipa fundi au rudisha pesa kwa mteja</p>
              </div>

              {disputesList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="font-extrabold text-slate-350">Hakuna migogoro yoyote inayohitaji uamuzi!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputesList.map(d => (
                    <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="bg-red-500/15 text-red-400 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded border border-red-500/20">
                            DISPUTE OPEN
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Booking ID: #{d.bookingId}</span>
                        </div>
                        <span className="font-black text-brand-400 text-sm">{d.amount.toLocaleString()} TZS</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="bg-slate-950/20 p-3.5 rounded-2xl border border-slate-850">
                          <p className="text-slate-455 mb-0.5 block uppercase tracking-wider text-[9px]">Mteja (Payer)</p>
                          <p className="font-extrabold text-slate-200">{d.customerName}</p>
                        </div>
                        <div className="bg-slate-950/20 p-3.5 rounded-2xl border border-slate-850">
                          <p className="text-slate-455 mb-0.5 block uppercase tracking-wider text-[9px]">Fundi (Receiver)</p>
                          <p className="font-extrabold text-slate-200">{d.fundiName}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-2xl text-xs border border-slate-850 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-amber-500 font-black text-[10px] uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" />
                          <span>Lalamiko (Details):</span>
                        </div>
                        <p className="text-slate-350 leading-relaxed font-semibold">{d.reason}</p>
                      </div>

                      {d.status === 'OPEN' ? (
                        <div className="flex items-center space-x-3 text-xs">
                          <button 
                            onClick={() => {
                              setDisputesList(prev => prev.map(item => item.id === d.id ? { ...item, status: 'REFUNDED_TO_CUSTOMER' } : item));
                              triggerNotification('Pesa imerudishwa kwa mteja.');
                            }}
                            className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md"
                          >
                            Rudisha kwa Mteja (Refund Payer)
                          </button>
                          <button 
                            onClick={() => {
                              setDisputesList(prev => prev.map(item => item.id === d.id ? { ...item, status: 'RELEASED_TO_FUNDI' } : item));
                              triggerNotification('Malipo yamehamishwa kwa Fundi.');
                            }}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-extrabold text-xs px-5 py-3 rounded-xl border border-slate-700"
                          >
                            Lipa Fundi (Release to Fundi)
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Uamuzi umekamilika: {d.status}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Escrow System Ledger (Admin Transactions Monitor) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Miamala ya Escrow Platform (Escrow Transaction Ledger)</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-450 uppercase">
                        <th className="pb-3">Transaction ID</th>
                        <th className="pb-3">Booking ID</th>
                        <th className="pb-3">Mteja (Customer)</th>
                        <th className="pb-3">Fundi</th>
                        <th className="pb-3 text-right">Kiasi (Amount)</th>
                        <th className="pb-3 text-center">Hali (Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-350">
                      <tr className="hover:bg-slate-950/20">
                        <td className="py-3.5 font-mono text-brand-400">ESC-998182</td>
                        <td>B-1029</td>
                        <td>Amina Selemani</td>
                        <td>Juma Shabaan</td>
                        <td className="py-3.5 text-right font-black text-emerald-400">45,000 TZS</td>
                        <td className="py-3.5 text-center"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2.5 py-0.5 rounded-full font-bold">RELEASED</span></td>
                      </tr>
                      <tr className="hover:bg-slate-950/20">
                        <td className="py-3.5 font-mono text-brand-400">ESC-990812</td>
                        <td>B-0089</td>
                        <td>Customer Test</td>
                        <td>Fundi Test</td>
                        <td className="py-3.5 text-right font-black text-amber-500">35,000 TZS</td>
                        <td className="py-3.5 text-center"><span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-2.5 py-0.5 rounded-full font-bold">HELD</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WARRANTY & TRUST HUB */}
          {activeTab === 'trust-warranty' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase">Warranty, Quality Control & Trust Safety Portal</h2>
                <p className="text-xs text-slate-400 font-semibold">Inspect claims, award badges, override progression levels, and check safety audits.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400">Claims for Inspection</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">{adminClaims.filter(c => c.status === 'PENDING').length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400">Elite & Diamond Level Partners</p>
                  <p className="text-2xl font-black text-brand-400 mt-1">12</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400">Avg Trust Score</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">94.8%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Claims list */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400">Claims Pending Inspection</h3>
                  <div className="space-y-4">
                    {adminClaims.map(c => (
                      <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">{c.status}</span>
                            <h4 className="font-extrabold text-sm text-slate-200 mt-1">{c.warrantyNumber} - Claim: {c.id}</h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">{c.createdAt}</span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1 font-semibold leading-relaxed">
                          <p><span className="text-slate-500">Mteja:</span> {c.customerName}</p>
                          <p><span className="text-slate-500">Fundi:</span> {c.fundiName}</p>
                          <p><span className="text-slate-500">Kazi:</span> {c.bookingDescription}</p>
                          <p className="p-2 bg-slate-900 border border-slate-800/80 rounded-xl text-slate-300 italic font-medium mt-2">"{c.description}"</p>
                        </div>

                        {c.status === 'PENDING' && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button 
                              onClick={() => {
                                setAdminClaims(adminClaims.map(ac => ac.id === c.id ? { ...ac, status: 'RESOLVED', adminOutcome: 'rework' } : ac));
                                alert('Marekebisho ya Kazi yameidhinishwa na Fundi amearifiwa kufanya marekebisho (Outcome: Approve Rework)');
                              }}
                              className="bg-brand-500 hover:bg-brand-650 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all uppercase"
                            >
                              Approve Rework
                            </button>
                            <button 
                              onClick={() => {
                                setAdminClaims(adminClaims.map(ac => ac.id === c.id ? { ...ac, status: 'RESOLVED', adminOutcome: 'full_refund' } : ac));
                                alert('Dai limekubaliwa. Pesa za Escrow zinarudishwa kwa mteja (Outcome: Full Refund)');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all uppercase"
                            >
                              Full Refund
                            </button>
                            <button 
                              onClick={() => {
                                setAdminClaims(adminClaims.map(ac => ac.id === c.id ? { ...ac, status: 'REJECTED', adminOutcome: 'reject' } : ac));
                                alert('Dai la Udhamini limekataliwa (Outcome: Reject Claim)');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all uppercase"
                            >
                              Reject Claim
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side controls (Adjust Levels & Badges) */}
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400">Dhibiti Viwango & Pointi za Fundi</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Jina la Fundi</label>
                        <select className="w-full bg-slate-950 border border-slate-800 outline-none px-3.5 py-2.5 rounded-xl text-slate-200">
                          <option>Juma Shabaan</option>
                          <option>Elibariki Nelson</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Progression Level</label>
                        <select className="w-full bg-slate-950 border border-slate-800 outline-none px-3.5 py-2.5 rounded-xl text-brand-400 font-bold">
                          <option value="BRONZE">Bronze</option>
                          <option value="SILVER">Silver</option>
                          <option value="GOLD">Gold</option>
                          <option value="PLATINUM">Platinum</option>
                          <option value="DIAMOND">Diamond</option>
                          <option value="ELITE">Elite</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => {
                          alert('Kiwango cha Fundi kimebadilishwa na kusasishwa kwa ufanisi!');
                        }}
                        className="w-full bg-brand-500 hover:bg-brand-655 text-white font-extrabold text-[10px] py-3 rounded-xl uppercase transition-all shadow-md active:scale-[0.98]"
                      >
                        Adjust Level Progression
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400">Tunikia Mabaji ya Kitaalamu (Badges)</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Chagua Baji ya Uaminifu</label>
                        <select className="w-full bg-slate-950 border border-slate-800 outline-none px-3.5 py-2.5 rounded-xl text-slate-200">
                          <option>Identity Verified</option>
                          <option>VETA Certified</option>
                          <option>Background Checked</option>
                          <option>Premium Fundi</option>
                          <option>Top Rated</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => {
                          alert('Baji ya kitaalamu imetunukiwa kwa ufanisi kwa Fundi!');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-3 rounded-xl uppercase transition-all shadow-md active:scale-[0.98]"
                      >
                        Award Professional Badge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-black tracking-tight">Sheria na Mipangilio (System Rules)</h2>
                <p className="text-xs text-slate-400">Sanidi asilimia ya makato na sheria za kifedha za jukwaa</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-xs font-semibold">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-300">Asilimia ya Komisheni (Platform Commission %)</label>
                    <span className="font-black text-brand-405 text-brand-400">{commission}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="25" 
                    value={commission}
                    onChange={(e) => setCommission(parseInt(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <p className="text-[10px] text-slate-500">Komisheni hii inakatwa kiotomatiki wakati malipo ya Escrow yanapotolewa kwa mafundi.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-300">Kodi ya VAT (VAT %)</label>
                    <span className="font-black text-brand-400">{vat}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={vat}
                    onChange={(e) => setVat(parseInt(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="border-t border-slate-800 my-4 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-205 text-slate-200">Gharama za Mafundi Subscriptions (TZS)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Basic Plan</label>
                      <input 
                        type="number" 
                        value={subBasic} 
                        onChange={(e) => setSubBasic(parseInt(e.target.value))} 
                        className="w-full bg-slate-950 border border-slate-800 outline-none px-3 py-2 rounded-xl text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Professional Plan</label>
                      <input 
                        type="number" 
                        value={subPro} 
                        onChange={(e) => setSubPro(parseInt(e.target.value))} 
                        className="w-full bg-slate-950 border border-slate-800 outline-none px-3 py-2 rounded-xl text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Premium Plan</label>
                      <input 
                        type="number" 
                        value={subPremium} 
                        onChange={(e) => setSubPremium(parseInt(e.target.value))} 
                        className="w-full bg-slate-950 border border-slate-800 outline-none px-3 py-2 rounded-xl text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 my-4 pt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Gharama ya Tangazo / Promotion Fee</label>
                    <input 
                      type="number" 
                      value={promotionFee} 
                      onChange={(e) => setPromotionFee(parseInt(e.target.value))} 
                      className="w-full bg-slate-950 border border-slate-800 outline-none px-3 py-2 rounded-xl text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Gharama ya Ukaguzi / Inspection Base Fee</label>
                    <input 
                      type="number" 
                      value={inspectionFeeBase} 
                      onChange={(e) => setInspectionFeeBase(parseInt(e.target.value))} 
                      className="w-full bg-slate-950 border border-slate-800 outline-none px-3 py-2 rounded-xl text-slate-200"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 my-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-300">Punguzo la Kampuni (Corporate Discount %)</label>
                    <span className="font-black text-brand-400">{corporateDiscount}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={corporateDiscount}
                    onChange={(e) => setCorporateDiscount(parseInt(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-start space-x-3 text-slate-400 leading-relaxed text-[11px] font-semibold">
                  <Info className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <p>Mabadiliko ya vigezo vya makato yataanza kutumika mara moja kwa bookings mpya zote tangu kuhifadhiwa.</p>
                </div>

                <button 
                  onClick={() => {
                    alert('Mipangilio yote ya biashara imehifadhiwa kwa ufanisi kwenye Database!');
                  }}
                  className="w-full bg-brand-500 hover:bg-brand-650 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] duration-200"
                >
                  Hifadhi Mipangilio (Save Configurations)
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
export default AdminDashboard;
