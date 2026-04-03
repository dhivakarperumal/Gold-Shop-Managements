import { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import { IndianRupee, Users, Clock, ShieldAlert, ChevronDown, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    activeLoans: 0,
    outstandingAmount: 0,
    collectedToday: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const customers = await db.get('customers');
      const loans = await db.get('loans');
      const payments = await db.get('payments');

      const active = loans.filter((l: any) => l.status === 'Active');
      const outstanding = active.reduce((acc: number, l: any) => acc + (Number(l.balanceAmount) || Number(l.loanAmount)), 0);
      
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = payments.filter((p: any) => p.date?.includes(today));
      const collected = todayPayments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);

      setStats({
        totalCustomers: customers.length,
        totalLoans: loans.length,
        activeLoans: active.length,
        outstandingAmount: outstanding,
        collectedToday: collected
      });
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Outstanding', value: `₹${stats.outstandingAmount.toLocaleString()}`, icon: IndianRupee, color: 'text-white', bg: 'bg-[#1b88f3]' },
    { title: 'Collected Today', value: `₹${stats.collectedToday.toLocaleString()}`, icon: TrendingUp, color: 'text-white', bg: 'bg-[#13b176]' },
    { title: 'Active Pledges', value: stats.activeLoans.toString(), icon: Clock, color: 'text-white', bg: 'bg-[#ee8c15]' },
    { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-white', bg: 'bg-[#554de0]' },
  ];

  const recentActivities = [
    { user: 'Babu', action: 'pledged 8.5g Gold', time: '2 mins ago', icon: Wallet, bg: 'bg-blue-50', text: 'text-blue-600' },
    { user: 'Senthil', action: 'paid ₹2,500 Interest', time: '15 mins ago', icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { user: 'Rani', action: 'settled Loan #4829', time: '1 hour ago', icon: ShieldAlert, bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Shop Overview</h1>
          <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest">Business Performance Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">
            Last 30 Days <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1b88f3] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-lg transition-all">
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Calendar Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Due Reminders</h2>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-100">
              <button className="px-5 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase rounded-lg shadow-sm">Monthly</button>
              <button className="px-5 py-1.5 text-gray-500 text-[10px] font-black uppercase rounded-lg hover:bg-gray-200">Weekly</button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-2 text-gray-800 font-black text-sm uppercase tracking-wide">
                <CalendarIcon className="w-4 h-4 text-gray-400" /> Collection Calendar
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white transition-all">Today</button>
                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-10 h-10 text-gray-300" />
               </div>
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Collections Scheduled for Today</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Activity</h2>
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 space-y-6 shadow-sm">
             {recentActivities.map((activity, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-gray-50 pl-4 relative">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${activity.text.replace('text', 'bg')}`}></div>
                   </div>
                   <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.text}`} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-900">
                         {activity.user} <span className="text-gray-500 font-medium">{activity.action}</span>
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{activity.time}</p>
                   </div>
                </div>
             ))}
             <button className="w-full py-3 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all mt-4 border border-gray-100">
                View All Activity
             </button>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 opacity-10">
                <TrendingUp className="w-48 h-48" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Month Growth</p>
             <h4 className="text-3xl font-black mt-2">+12.5%</h4>
             <p className="text-xs font-medium mt-4 opacity-80 leading-relaxed">Your shop is performing better than last month. 8 new pledges this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
