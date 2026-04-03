import { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import { IndianRupee, Users, Clock, ShieldAlert, ChevronDown, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const customers = await db.get('customers');
      const loans = await db.get('loans');

      const active = loans.filter((l: any) => l.status === 'Active');
      const totalAmt = active.reduce((acc: number, l: any) => acc + Number(l.loanAmount), 0);

      setStats({
        totalCustomers: customers.length,
        totalLoans: loans.length,
        activeLoans: active.length,
        totalAmount: totalAmt
      });
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Collections', value: `₹${stats.totalAmount.toLocaleString()}`, icon: IndianRupee, color: 'text-white', bg: 'bg-[#1b88f3]' },
    { title: 'Upcoming Collections', value: '0', icon: Clock, color: 'text-white', bg: 'bg-[#ee8c15]' },
    { title: 'Active Loans', value: stats.activeLoans.toString(), icon: Users, color: 'text-white', bg: 'bg-[#13b176]' },
    { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: ShieldAlert, color: 'text-white', bg: 'bg-[#554de0]' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area matching TrackFina */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.username || 'User'}</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Last 30 Days <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1b88f3] text-white rounded-md text-sm font-medium hover:bg-blue-600 shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Section matching TrackFina */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[#1b88f3]" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Installment Calendar</h2>
              <p className="text-sm text-gray-500">Monthly view of all installments for {user?.username}</p>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button className="px-4 py-1.5 bg-[#1b88f3] text-white text-sm font-medium rounded-md shadow-sm">Monthly</button>
            <button className="px-4 py-1.5 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-200">Weekly</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
              <CalendarIcon className="w-5 h-5 text-gray-400" /> Action Required
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 font-medium hover:bg-gray-50">Today</button>
              <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-6 bg-red-50/50 border-b border-red-100">
            <h3 className="text-red-500 font-medium mb-1">Unable to Load Calendar</h3>
            <p className="text-sm text-red-400">Access denied. You do not have the required permission.</p>
          </div>
          <div className="h-64 bg-white"></div>
        </div>
      </div>
    </div>
  );
}
