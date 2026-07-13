import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Map, 
  RefreshCw, 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Wrench, 
  TrendingUp, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertOctagon, 
  UserCheck, 
  UserX, 
  FileDown, 
  Info, 
  Bell, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  X,
  Database,
  Cpu,
  Mail,
  Smartphone,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface Props {
  onBackToAdmin: () => void;
}

export function OpsCenter({ onBackToAdmin }: Props) {
  // 1. RBAC simulator state
  const [selectedRole, setSelectedRole] = useState<string>('Super Admin');
  const [activeTab, setActiveTab] = useState<string>('map');
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'critical', text: 'Database Replication Delay: Slave DB 2 is lagging behind by 1400ms', time: '1 min ago' },
    { id: 2, type: 'warning', text: 'M-Pesa Webhook processing latency is currently higher than 400ms', time: '5 mins ago' }
  ]);
  const [toast, setToast] = useState<string | null>(null);

  // Simulated Database states
  const [dispatches, setDispatches] = useState<any[]>([
    { id: 'JOB-9021', customer: 'Amani Kente', category: 'Fundi Umeme', fundi: 'Juma Shabaan', status: 'MATCHING', eta: '6 mins', responseTime: '45s', failed: false },
    { id: 'JOB-9022', customer: 'Diana Lowassa', category: 'Fundi Mabomba', fundi: 'Kelvin Massawe', status: 'ON_WAY', eta: '12 mins', responseTime: '30s', failed: false },
    { id: 'JOB-9023', customer: 'Baraka Mushi', category: 'Air Conditioning Repair', fundi: 'Hajagawiwa', status: 'PENDING', eta: '--', responseTime: '--', failed: false },
    { id: 'JOB-9024', customer: 'Peter Temu', category: 'Solar Power Install', fundi: 'Hajagawiwa', status: 'FAILED', eta: '--', responseTime: '--', failed: true }
  ]);

  const [incidents, setIncidents] = useState<any[]>([
    { id: 'INC-204', title: 'TigoPesa API Gateway Timeout', severity: 'critical', status: 'investigating', assignee: 'Joseph Kiprotich', postmortem: '' },
    { id: 'INC-203', title: 'Socket.IO Client Connection drops in Temeke region', severity: 'high', status: 'resolved', assignee: 'Sarah Munuo', postmortem: 'Increased KeepAlive timeout on server to 45s.' }
  ]);

  const [payments, setPayments] = useState<any[]>([
    { id: 'PAY-1002', user: 'Peter Temu', amount: 350000, type: 'escrow_hold', status: 'success', time: '11:10 AM' },
    { id: 'PAY-1003', user: 'Amina Selemani', amount: 15000, type: 'withdrawal', status: 'failed', time: '11:05 AM' },
    { id: 'PAY-1004', user: 'Diana Lowassa', amount: 45000, type: 'commission', status: 'success', time: '10:55 AM' }
  ]);

  const [fraudProfiles, setFraudProfiles] = useState<any[]>([
    { userId: 'u_989', name: 'Baraka Mushi', riskScore: 94, reason: 'Fake GPS Coordinate simulation detected', device: 'TECNO Camon 20', suspended: false },
    { userId: 'u_1012', name: 'Diana Lowassa', riskScore: 82, reason: 'Duplicate hardware IMEI signature detected', device: 'Samsung Galaxy A54', suspended: false }
  ]);

  const [tickets, setTickets] = useState<any[]>([
    { id: 'TCK-401', customer: 'Neema Kessy', text: 'Escrow payment refund request for incomplete repair', assignee: 'Unassigned', status: 'open' },
    { id: 'TCK-402', customer: 'Peter Temu', text: 'Complaint: AC unit making abnormal noise post-repair', assignee: 'Jane Malima', status: 'in-progress' }
  ]);

  // Form parameters
  const [reassignTarget, setReassignTarget] = useState({ jobId: '', fundiName: '' });
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'high', assignee: '' });
  const [postmortemForm, setPostmortemForm] = useState({ id: '', text: '' });
  
  // Real-time animation simulator
  const [fundiLocations, setFundiLocations] = useState<any[]>([
    { id: 'f_loc_1', lat: 35, lng: 45, name: 'Kelvin M.', status: 'ON_WAY' },
    { id: 'f_loc_2', lat: 60, lng: 25, name: 'Juma S.', status: 'MATCHING' },
    { id: 'f_loc_3', lat: 20, lng: 70, name: 'Baraka M.', status: 'IDLE' }
  ]);

  // RBAC permissions rules mapping
  const rolePermissions: Record<string, string[]> = {
    'Super Admin': ['map', 'dispatch', 'payments', 'fraud', 'support', 'health', 'incidents', 'executive', 'alerts', 'reporting'],
    'Operations Manager': ['map', 'dispatch', 'health', 'incidents', 'alerts', 'reporting'],
    'Support Agent': ['map', 'support', 'incidents', 'alerts'],
    'Finance Manager': ['payments', 'executive', 'reporting'],
    'Fraud Analyst': ['map', 'fraud', 'alerts'],
    'Executive': ['executive', 'health', 'reporting', 'alerts']
  };

  const allowedTabs = rolePermissions[selectedRole] || [];

  // Effect to handle dynamic coordinate updates (Socket simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setFundiLocations(prev => prev.map(loc => ({
        ...loc,
        lat: loc.lat + (Math.random() - 0.5) * 2,
        lng: loc.lng + (Math.random() - 0.5) * 2
      })));
      
      // Randomly inject updates
      if (Math.random() > 0.8) {
        const id = Math.floor(Math.random() * 9000) + 1000;
        setNotifications(prev => [
          { id, type: 'info', text: `Live Dispatch Update: Auto-matched Booking JOB-${id} in Kinondoni area.`, time: 'Just now' },
          ...prev.slice(0, 4)
        ]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleManualReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget.jobId || !reassignTarget.fundiName) return;

    setDispatches(prev => prev.map(d => {
      if (d.id === reassignTarget.jobId) {
        return { ...d, fundi: reassignTarget.fundiName, status: 'REASSIGNED', eta: '10 mins' };
      }
      return d;
    }));
    triggerToast(`Manual override successful: Assigned job ${reassignTarget.jobId} to ${reassignTarget.fundiName}`);
    setReassignTarget({ jobId: '', fundiName: '' });
  };

  const handleUserSuspend = (userId: string) => {
    setFraudProfiles(prev => prev.map(f => {
      if (f.userId === userId) {
        return { ...f, suspended: true };
      }
      return f;
    }));
    triggerToast(`Security Lockout: Account ${userId} has been suspended immediately.`);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title) return;

    const loggedInc = {
      id: `INC-${Math.floor(Math.random() * 900) + 200}`,
      title: newIncident.title,
      severity: newIncident.severity,
      status: 'investigating',
      assignee: newIncident.assignee || 'On-Call Engineer',
      postmortem: ''
    };

    setIncidents(prev => [loggedInc, ...prev]);
    setNewIncident({ title: '', severity: 'high', assignee: '' });
    triggerToast(`Outage recorded: ${loggedInc.id} has been opened and assigned.`);
  };

  const handlePostmortemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postmortemForm.id || !postmortemForm.text) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === postmortemForm.id) {
        return { ...inc, status: 'resolved', postmortem: postmortemForm.text };
      }
      return inc;
    }));
    triggerToast(`Postmortem generated and saved for incident ${postmortemForm.id}`);
    setPostmortemForm({ id: '', text: '' });
  };

  const handleReportExport = (format: string, type: string) => {
    triggerToast(`Generating ${type} report. Exporting as ${format.toUpperCase()}...`);
    
    const element = document.createElement("a");
    const file = new Blob([`Fundi Service Tanzania - ${type.toUpperCase()} REPORT\nGenerated by: Ops Control Tower\nFormat: ${format.toUpperCase()}\n`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `ops_${type}_report_${Date.now()}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-brand-500 text-white p-3 rounded-2xl animate-pulse shadow-lg shadow-brand-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">OPS CONTROL TOWER</h1>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Enterprise Operations Command Center</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={onBackToAdmin}
            className="text-xs bg-slate-900 border border-slate-850 hover:bg-slate-800 py-2.5 px-4 rounded-xl font-bold transition-all text-slate-300"
          >
            Rudi Kwenye Admin Dashboard
          </button>

          {/* Role Switcher */}
          <div className="bg-slate-900 border border-slate-850 px-3 py-2 rounded-xl flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Ops Role:</span>
            <select 
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                triggerToast(`Role simulated successfully: ${e.target.value}`);
              }}
              className="bg-transparent text-xs text-brand-400 font-bold outline-none cursor-pointer"
            >
              <option value="Super Admin" className="bg-slate-900 text-slate-200">Super Admin (All Modules)</option>
              <option value="Operations Manager" className="bg-slate-900 text-slate-200">Operations Manager</option>
              <option value="Support Agent" className="bg-slate-900 text-slate-200">Support Agent</option>
              <option value="Finance Manager" className="bg-slate-900 text-slate-200">Finance Manager</option>
              <option value="Fraud Analyst" className="bg-slate-900 text-slate-200">Fraud Analyst</option>
              <option value="Executive" className="bg-slate-900 text-slate-200">Executive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast Alert pop-up */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900/95 border border-brand-500/30 text-slate-200 text-xs font-bold py-3 px-5 rounded-2xl flex items-center space-x-2 shadow-2xl z-50 animate-fadeIn">
          <Activity className="w-4 h-4 text-brand-400 animate-spin" />
          <span>{toast}</span>
        </div>
      )}

      {/* TABBED MODULE NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
        {allowedTabs.includes('map') && (
          <button 
            onClick={() => setActiveTab('map')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'map' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Live Operations Map
          </button>
        )}
        {allowedTabs.includes('dispatch') && (
          <button 
            onClick={() => setActiveTab('dispatch')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'dispatch' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Dispatch Monitor
          </button>
        )}
        {allowedTabs.includes('payments') && (
          <button 
            onClick={() => setActiveTab('payments')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Payment Center
          </button>
        )}
        {allowedTabs.includes('fraud') && (
          <button 
            onClick={() => setActiveTab('fraud')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'fraud' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Fraud Monitor
          </button>
        )}
        {allowedTabs.includes('support') && (
          <button 
            onClick={() => setActiveTab('support')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'support' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Customer Support
          </button>
        )}
        {allowedTabs.includes('health') && (
          <button 
            onClick={() => setActiveTab('health')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'health' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            System Health
          </button>
        )}
        {allowedTabs.includes('incidents') && (
          <button 
            onClick={() => setActiveTab('incidents')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'incidents' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Incident Management
          </button>
        )}
        {allowedTabs.includes('executive') && (
          <button 
            onClick={() => setActiveTab('executive')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'executive' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Executive Dashboard
          </button>
        )}
        {allowedTabs.includes('reporting') && (
          <button 
            onClick={() => setActiveTab('reporting')}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all ${activeTab === 'reporting' ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            Reporting Exports
          </button>
        )}
      </div>

      {/* DASHBOARD MODULE CONTENT */}
      <div className="space-y-6">

        {/* 1. LIVE OPERATIONS MAP */}
        {activeTab === 'map' && allowedTabs.includes('map') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center space-x-2">
                  <Map className="w-4 h-4 text-brand-400" />
                  <span>Dar es Salaam Live Grid Operations</span>
                </span>
                <span className="text-emerald-500 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-1.5"></span>
                  Realtime Telemetry Emitter Active
                </span>
              </div>

              {/* Dynamic Coordinate Map canvas representation */}
              <div className="bg-slate-950 h-96 rounded-2xl relative border border-slate-850 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                
                {/* Traffic Grid Overlays */}
                <div className="absolute top-10 left-20 w-32 h-32 rounded-full bg-brand-500/10 blur-xl"></div>
                <div className="absolute bottom-16 right-36 w-44 h-44 rounded-full bg-emerald-500/10 blur-xl animate-pulse"></div>

                {/* Moving GPS Marker Kelvin */}
                <div 
                  className="absolute flex flex-col items-center transition-all duration-1000"
                  style={{ top: `${fundiLocations[0].lat}%`, left: `${fundiLocations[0].lng}%` }}
                >
                  <div className="bg-brand-500 text-white p-1.5 rounded-full border border-slate-950 shadow-2xl">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] bg-slate-900/90 border border-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-extrabold mt-1 shadow-lg">{fundiLocations[0].name} ({fundiLocations[0].status})</span>
                </div>

                {/* Moving GPS Marker Juma */}
                <div 
                  className="absolute flex flex-col items-center transition-all duration-1000"
                  style={{ top: `${fundiLocations[1].lat}%`, left: `${fundiLocations[1].lng}%` }}
                >
                  <div className="bg-emerald-500 text-white p-1.5 rounded-full border border-slate-950 shadow-2xl">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] bg-slate-900/90 border border-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-extrabold mt-1 shadow-lg">{fundiLocations[1].name} ({fundiLocations[1].status})</span>
                </div>

                {/* Moving GPS Marker Baraka */}
                <div 
                  className="absolute flex flex-col items-center transition-all duration-1000"
                  style={{ top: `${fundiLocations[2].lat}%`, left: `${fundiLocations[2].lng}%` }}
                >
                  <div className="bg-slate-700 text-white p-1.5 rounded-full border border-slate-950 shadow-2xl">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] bg-slate-900/90 border border-slate-800 text-slate-350 px-1.5 py-0.5 rounded font-extrabold mt-1 shadow-lg">{fundiLocations[2].name} ({fundiLocations[2].status})</span>
                </div>

                <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-850 p-3.5 rounded-2xl space-y-2 text-[10px] font-bold shadow-2xl">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                    <span>Completed Booking location (Mikocheni)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-brand-500 rounded-full"></span>
                    <span>Active Matching (Sinza B)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    <span>Emergency Outage Signal (Kinondoni)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live alerts sidebar (Alert Center) */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                <Bell className="w-4 h-4 text-brand-500" />
                <h3 className="font-extrabold text-sm">Alert Center Panel</h3>
              </div>

              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3.5 rounded-2xl border ${
                    n.type === 'critical' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                  } space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider">{n.type} telemetry alert</span>
                      <span className="text-[9px] text-slate-450">{n.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed font-semibold text-slate-200">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE DISPATCH MONITOR */}
        {activeTab === 'dispatch' && allowedTabs.includes('dispatch') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black">Live Matching Engine Queue</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-slate-350">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-450 uppercase text-[10px]">
                      <th className="py-3">Job ID</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Assigned Fundi</th>
                      <th>Response Time</th>
                      <th>ETA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {dispatches.map(d => (
                      <tr key={d.id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="py-4 text-brand-400 font-extrabold">{d.id}</td>
                        <td>{d.customer}</td>
                        <td>{d.category}</td>
                        <td>{d.fundi}</td>
                        <td>{d.responseTime}</td>
                        <td>{d.eta}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            d.failed ? 'bg-red-500/10 text-red-500' : d.status === 'MATCHING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Override Action panel */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-brand-400 border-b border-slate-800 pb-2">Manual Dispatch Override</h3>
              <form onSubmit={handleManualReassign} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-bold uppercase">Select Target Booking</label>
                  <select 
                    value={reassignTarget.jobId}
                    onChange={(e) => setReassignTarget(prev => ({ ...prev, jobId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold"
                    required
                  >
                    <option value="">Choose a job</option>
                    {dispatches.map(d => (
                      <option key={d.id} value={d.id}>{d.id} - {d.customer} ({d.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-bold uppercase">Reassign To (Fundi Name)</label>
                  <input 
                    type="text"
                    value={reassignTarget.fundiName}
                    onChange={(e) => setReassignTarget(prev => ({ ...prev, fundiName: e.target.value }))}
                    placeholder="e.g. Kelvin Massawe"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all"
                >
                  Force Reassignment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. LIVE PAYMENT CENTER */}
        {activeTab === 'payments' && allowedTabs.includes('payments') && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black">Escrow Escrow & Ledgers Feed</h3>
              <div className="flex items-center space-x-4 text-xs font-bold">
                <span className="text-emerald-500">Collected Commission: TZS 345,000</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-350">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-450 uppercase text-[10px]">
                    <th className="py-3">Transaction ID</th>
                    <th>User Profile</th>
                    <th>Amount</th>
                    <th>Transaction Type</th>
                    <th>Status</th>
                    <th>Execution Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="py-4 text-brand-400 font-extrabold">{p.id}</td>
                      <td>{p.user}</td>
                      <td className="font-bold text-slate-200">TZS {p.amount.toLocaleString()}</td>
                      <td className="capitalize">{p.type.replace('_', ' ')}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          p.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-slate-450">{p.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. FRAUD MONITOR */}
        {activeTab === 'fraud' && allowedTabs.includes('fraud') && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black border-b border-slate-800 pb-2">High Risk Flagged Accounts</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-350">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-450 uppercase text-[10px]">
                    <th className="py-3">Profile ID</th>
                    <th>Risk Score</th>
                    <th>Flag Reason</th>
                    <th>User Device</th>
                    <th>Status</th>
                    <th>Operations Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {fraudProfiles.map(f => (
                    <tr key={f.userId} className="hover:bg-slate-850/30 transition-colors">
                      <td className="py-4 font-extrabold text-slate-200">{f.name} <span className="text-[10px] text-slate-450 font-normal">({f.userId})</span></td>
                      <td>
                        <span className={`font-black ${f.riskScore > 85 ? 'text-red-500' : 'text-amber-500'}`}>
                          {f.riskScore}% Risk
                        </span>
                      </td>
                      <td>{f.reason}</td>
                      <td>{f.device}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${f.suspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {f.suspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        {!f.suspended ? (
                          <button 
                            onClick={() => handleUserSuspend(f.userId)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold text-[10px] py-1.5 px-3 rounded-lg border border-red-500/20 transition-all"
                          >
                            Lock Profile
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Enforced Lock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CUSTOMER SUPPORT CENTER */}
        {activeTab === 'support' && allowedTabs.includes('support') && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black border-b border-slate-800 pb-2">Support & Refund Request Tickets</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-350">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-450 uppercase text-[10px]">
                    <th className="py-3">Ticket ID</th>
                    <th>Customer Name</th>
                    <th>Complaint / Issue</th>
                    <th>Status</th>
                    <th>Assigned Agent</th>
                    <th>Triage Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {tickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="py-4 text-brand-400 font-extrabold">{t.id}</td>
                      <td>{t.customer}</td>
                      <td className="text-slate-200">{t.text}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>{t.assignee}</td>
                      <td>
                        {t.assignee === 'Unassigned' ? (
                          <button 
                            onClick={() => {
                              setTickets(prev => prev.map(tick => tick.id === t.id ? { ...tick, assignee: 'Sarah Munuo', status: 'in-progress' } : tick));
                              triggerToast(`Assigned ticket ${t.id} to Sarah Munuo`);
                            }}
                            className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all"
                          >
                            Assign to Sarah
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-450">Triage Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SYSTEM HEALTH */}
        {activeTab === 'health' && allowedTabs.includes('health') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">API GATEWAY LAYER</span>
                <Cpu className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-500">HEALTHY</span>
                <span className="text-xs text-slate-450 font-semibold">12 ms latency</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">POSTGRES DATABASE</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-500">HEALTHY</span>
                <span className="text-xs text-slate-450 font-semibold">4 ms latency</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">REDIS DISTRIBUTED CACHE</span>
                <Cpu className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-500">HEALTHY</span>
                <span className="text-xs text-slate-450 font-semibold">1 ms latency</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">QUEUE WORKERS TIMELINES</span>
                <Cpu className="w-4 h-4 text-amber-500 animate-spin" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-500">LAGGING</span>
                <span className="text-xs text-slate-455 font-semibold">12s queue delay</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. INCIDENT MANAGEMENT */}
        {activeTab === 'incidents' && allowedTabs.includes('incidents') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black border-b border-slate-800 pb-2">Active Engineering Incidents</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-slate-350">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-450 uppercase text-[10px]">
                      <th className="py-3">Incident ID</th>
                      <th>Outage Description</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Assignee Lead</th>
                      <th>Postmortem report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {incidents.map(inc => (
                      <tr key={inc.id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="py-4 text-brand-400 font-extrabold">{inc.id}</td>
                        <td>{inc.title}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            inc.severity === 'critical' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            inc.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td>{inc.assignee}</td>
                        <td className="text-slate-450 italic">{inc.postmortem || 'Pending write-up'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Open Incident & Write Postmortem panels */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
                <h4 className="font-extrabold text-xs text-brand-400 border-b border-slate-800 pb-2">Declare operational Outage</h4>
                <form onSubmit={handleIncidentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase">Incident Title</label>
                    <input 
                      type="text"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. database replica failure"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 font-bold uppercase">Assignee Engineer</label>
                    <input 
                      type="text"
                      value={newIncident.assignee}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, assignee: e.target.value }))}
                      placeholder="e.g. Sarah Munuo"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all"
                  >
                    Open Incident
                  </button>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
                <h4 className="font-extrabold text-xs text-emerald-400 border-b border-slate-800 pb-2">Submit Incident Postmortem</h4>
                <form onSubmit={handlePostmortemSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase">Target Incident ID</label>
                    <select 
                      value={postmortemForm.id}
                      onChange={(e) => setPostmortemForm(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold"
                      required
                    >
                      <option value="">Select Incident</option>
                      {incidents.filter(i => i.status !== 'resolved').map(i => (
                        <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 font-bold uppercase">Resolution / Summary</label>
                    <textarea 
                      value={postmortemForm.text}
                      onChange={(e) => setPostmortemForm(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Cause: Memory leak in worker processes. Fixed: Allocated larger VPS RAM buffer."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs py-2.5 px-3 rounded-xl outline-none font-bold resize-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all"
                  >
                    Resolve & Save Postmortem
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 8. EXECUTIVE DASHBOARD */}
        {activeTab === 'executive' && allowedTabs.includes('executive') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] text-slate-450 font-extrabold uppercase block">Monthly Revenue</span>
                <span className="text-2xl font-black text-slate-100">TZS 3,450,000</span>
                <span className="text-[10px] text-emerald-500 font-bold block">+14.2% MoM</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] text-slate-455 font-extrabold uppercase block">Net Profit Earnings</span>
                <span className="text-2xl font-black text-slate-100">TZS 345,000</span>
                <span className="text-[10px] text-slate-500 font-bold block">10.0% fixed commission fee</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] text-slate-450 font-extrabold uppercase block">Customer Retention</span>
                <span className="text-2xl font-black text-slate-100">88.5%</span>
                <span className="text-[10px] text-emerald-500 font-bold block">East Africa benchmark high</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] text-slate-450 font-extrabold uppercase block">Platform Growth Rate</span>
                <span className="text-2xl font-black text-slate-100">22.4%</span>
                <span className="text-[10px] text-emerald-500 font-bold block">+8.2% YoY increase</span>
              </div>
            </div>

            {/* Geographic Split & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black border-b border-slate-800 pb-2">Revenue Share By City</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Dar es Salaam</span>
                      <span>70%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full w-[70%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Arusha</span>
                      <span>20%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[20%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Mwanza</span>
                      <span>10%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[10%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-3 text-xs">
                <h3 className="font-black border-b border-slate-800 pb-2 text-[11px] uppercase tracking-wider text-slate-450">Top Service Sectors</h3>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="font-bold text-slate-350">1. Plumber Services</span>
                  <span className="font-extrabold text-slate-200">45%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="font-bold text-slate-350">2. Electrical Installations</span>
                  <span className="font-extrabold text-slate-200">30%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-bold text-slate-350">3. AC Repairs</span>
                  <span className="font-extrabold text-slate-200">25%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-3 text-xs">
                <h3 className="font-black border-b border-slate-800 pb-2 text-[11px] uppercase tracking-wider text-slate-455">High Performer Fundis</h3>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="font-bold text-slate-350">Kelvin Massawe</span>
                  <span className="font-extrabold text-emerald-500">4.92 rating</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="font-bold text-slate-350">Juma Shabaan</span>
                  <span className="font-extrabold text-emerald-500">4.85 rating</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-bold text-slate-350">Baraka Mushi</span>
                  <span className="font-extrabold text-emerald-500">4.80 rating</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. REPORTING */}
        {activeTab === 'reporting' && allowedTabs.includes('reporting') && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-base font-black">Export Operations Ledger Reports</h3>
              <p className="text-xs text-slate-450 font-semibold">Generate structured reports for audit and compliance teams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-800 p-5 rounded-2xl text-center space-y-4">
                <FileText className="w-8 h-8 text-brand-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-xs">CSV Spreadsheet File</h4>
                  <p className="text-[10px] text-slate-450">Complete raw transaction ledger rows export.</p>
                </div>
                <button 
                  onClick={() => handleReportExport('csv', 'annual')}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-2 px-4 rounded-xl w-full flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="border border-slate-800 p-5 rounded-2xl text-center space-y-4">
                <FileText className="w-8 h-8 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-xs">Excel Document</h4>
                  <p className="text-[10px] text-slate-450">Calculated growth spreadsheet workbook.</p>
                </div>
                <button 
                  onClick={() => handleReportExport('xlsx', 'monthly')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2 px-4 rounded-xl w-full flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>
              </div>

              <div className="border border-slate-800 p-5 rounded-2xl text-center space-y-4">
                <FileText className="w-8 h-8 text-red-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-xs">PDF Document Report</h4>
                  <p className="text-[10px] text-slate-455">Official signed operations PDF report.</p>
                </div>
                <button 
                  onClick={() => handleReportExport('pdf', 'quarterly')}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-2 px-4 rounded-xl w-full flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
