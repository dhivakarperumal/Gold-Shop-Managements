import { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import { 
  IndianRupee, Users, Clock, ShieldAlert, ChevronDown, 
  Download, Calendar as CalendarIcon, 
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Gem, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    activeLoans: 0,
    outstandingAmount: 0,
    collectedToday: 0,
    overdueLoans: 0,
    collectionGrowth: 15.2,
    customerGrowth: 8.4
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingCollections, setUpcomingCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const customers = await db.get('customers');
      const loans = await db.get('loans');
      const payments = await db.get('payments');

      const active = (loans as any[]).filter((l) => l.status === 'Active');
      const overdue = (loans as any[]).filter((l) => l.status === 'Overdue' || (l.status === 'Active' && new Date(l.dueDate) < new Date()));
      const outstanding = active.reduce((acc, l) => acc + (Number(l.balanceAmount) || Number(l.loanAmount)), 0);
      
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = (payments as any[]).filter((p) => p.date?.includes(today));
      const collected = todayPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      setStats(prev => ({
        ...prev,
        totalCustomers: customers.length,
        totalLoans: loans.length,
        activeLoans: active.length,
        outstandingAmount: outstanding,
        collectedToday: collected,
        overdueLoans: overdue.length
      }));

      // Map dynamic activities
      const allActivities = [
        ...(loans as any[]).map(l => ({ 
          user: l.customerName || 'UNKNOWN', 
          action: `pledged ${l.goldItems?.reduce((acc: number, i: any) => acc + Number(i.weight), 0).toFixed(2) || '0.00'}g Gold`, 
          time: new Date(l.createdAt || l.startDate || l.loanDate).toLocaleString(), 
          timestamp: new Date(l.createdAt || l.startDate || l.loanDate).getTime(),
          icon: Gem, bg: 'bg-amber-50', text: 'text-amber-600' 
        })),
        ...(payments as any[]).map(p => ({ 
          user: p.customerName || 'UNKNOWN', 
          action: `repaid ₹${p.amount?.toLocaleString() || '0'} (${p.type || 'EMI'})`, 
          time: new Date(p.date).toLocaleString(), 
          timestamp: new Date(p.date).getTime(),
          icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-600' 
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
      
      setRecentActivities(allActivities);

      // Upcoming collections
      const upcoming = active
        .filter((l) => l.dueDate && new Date(l.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      setUpcomingCollections(upcoming);
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Outstanding', value: `₹${stats.outstandingAmount.toLocaleString()}`, change: '+12.5%', icon: IndianRupee, color: 'text-white', bg: 'bg-blue-600' },
    { title: 'Overdue Ledger', value: stats.overdueLoans.toString(), change: '+2', icon: AlertTriangle, color: 'text-white', bg: 'bg-red-500' },
    { title: 'Today\'s Liquidity', value: `₹${stats.collectedToday.toLocaleString()}`, change: '+5.2%', icon: Wallet, color: 'text-white', bg: 'bg-emerald-500' },
    { title: 'Active Portfolio', value: stats.activeLoans.toString(), change: '+8', icon: Users, color: 'text-white', bg: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Global Shop Overview</h1>
          <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-[0.2em] border-l-2 border-blue-600 pl-3">Executive Summary Dashboard • {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all hover:border-blue-100">
            Current Session <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <button className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors"></div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform relative z-10`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="mt-6 space-y-1 relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                 <span className={`text-[10px] font-black flex items-center gap-0.5 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
           {/* Section 1: Collection Calendar */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Imminent Collections</h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest hidden sm:block">Next 7 Business Days</div>
                   <div className="flex bg-gray-100 p-1.5 border border-gray-100 rounded-2xl">
                      <button className="px-5 py-2 bg-white text-blue-600 text-[10px] font-black uppercase rounded-xl shadow-sm">Calendar View</button>
                      <button className="px-5 py-2 text-gray-500 text-[10px] font-black uppercase rounded-xl hover:bg-gray-200 transition-all">List View</button>
                   </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-50 rounded-[40px] shadow-sm overflow-hidden flex flex-col min-h-[450px]">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                         <tr>
                            <th className="px-8 py-5">Due Date</th>
                            <th className="px-8 py-5">Customer Profile</th>
                            <th className="px-8 py-5">Projected Value</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 italic font-medium">
                         {upcomingCollections.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="px-8 py-32 text-center not-italic">
                                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <Clock className="w-8 h-8 text-gray-200" />
                                 </div>
                                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Zero Collections Scheduled for Today</p>
                              </td>
                           </tr>
                         ) : (
                           upcomingCollections.map((l: any, i: number) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition-colors group not-italic">
                                <td className="px-8 py-5">
                                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[10px] font-black text-amber-600 uppercase">
                                      {new Date(l.dueDate).toLocaleDateString()}
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="font-black text-gray-900 uppercase text-xs">{l.customerName}</div>
                                   <div className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-tighter">ID: {l.customerId || 'CUST-XXXX'}</div>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tighter text-sm">₹{Number(l.balanceAmount || l.loanAmount).toLocaleString()}</div>
                                   <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" /> Inc. Interest
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-blue-600 shadow-lg shadow-gray-200 transition-all opacity-0 group-hover:opacity-100">Contact User</button>
                                </td>
                             </tr>
                           ))
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
           </div>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight px-2 flex items-center justify-between">
               Operational Feed
               <span className="text-[10px] font-black text-blue-500 tracking-widest italic animate-pulse">Live Now</span>
            </h2>
            <div className="bg-white rounded-[40px] border-2 border-gray-50 p-8 space-y-8 shadow-sm">
               {recentActivities.length === 0 ? (
                 <div className="py-10 text-center text-gray-400 font-black uppercase text-[10px]">No recent data points</div>
               ) : (
                 recentActivities.map((activity, i) => (
                    <div key={i} className="flex gap-5 items-start border-l-2 border-gray-100 pl-6 relative">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${activity.text.replace('text', 'bg')}`}></div>
                       </div>
                       <div className={`w-11 h-11 rounded-2xl ${activity.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                          <activity.icon className={`w-5 h-5 ${activity.text}`} />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-black text-gray-900 uppercase leading-snug truncate">
                             {activity.user}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5 tracking-tighter leading-tight italic">
                             {activity.action}
                          </p>
                          <p className="text-[8px] font-black text-gray-400 uppercase mt-2 tracking-widest">{activity.time}</p>
                       </div>
                    </div>
                 ))
               )}
               <button className="w-full py-4 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all mt-4 border border-gray-100 shadow-sm active:scale-95">
                  View Comprehensive Ledger
               </button>
            </div>
          </div>

          {/* Premium Analytics Teaser Card */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                <TrendingUp className="w-64 h-64" />
             </div>
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
             
             <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <ShieldAlert className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Portfolio Growth</p>
                      <h4 className="text-4xl font-black tracking-tighter">+12.5%</h4>
                   </div>
                </div>
                
                <p className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-wide">Business performance is scaling above quarterly targets. 8 system authorized pledges initiated this settlement cycle.</p>
                
                <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                   Deep Dive Analytics
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
