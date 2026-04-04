import { useEffect, useState, useMemo } from 'react';
import { 
  IndianRupee, Users, User, Clock, ChevronDown, 
  Download, Calendar as CalendarIcon, 
  Gem, X, Phone, ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export function Dashboard() {
  const { customers, loans, payments, isDataLoading } = useData();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    activeLoans: 0,
    outstandingAmount: 0,
    collectedToday: 0,
    overdueLoans: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [calendarView, setCalendarView] = useState<'weekly' | 'monthly' | 'list'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<any>(null);

  useEffect(() => {
    if (isDataLoading) return;

    const active = (loans as any[]).filter((l) => l.status === 'Active');
    const overdue = (loans as any[]).filter((l) => l.status === 'Overdue' || (l.status === 'Active' && l.dueDate && new Date(l.dueDate) < new Date()));
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
  }, [customers, loans, payments, isDataLoading]);

  // Calendar Logic
  const navigateDate = (dir: number) => {
    const next = new Date(currentDate);
    if (calendarView === 'weekly') next.setDate(next.getDate() + (dir * 7));
    else if (calendarView === 'monthly') next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  };

  const calendarData = useMemo(() => {
    if (isDataLoading) return { days: [], label: '' };

    if (calendarView === 'weekly') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      });
      return { 
        days, 
        label: `Week of ${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${days[6].getFullYear()}`
      };
    } else {
      const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDay = startOfToday.getDay();
      const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      
      const prevDays = Array.from({ length: startDay }, (_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDate - startDay + i + 1);
        return d;
      });
      const currentDays = Array.from({ length: endOfToday.getDate() }, (_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        return d;
      });
      const totalDays = [...prevDays, ...currentDays];
      const nextDaysCount = 42 - totalDays.length;
      const nextDays = Array.from({ length: nextDaysCount }, (_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i + 1);
        return d;
      });

      return { 
        days: [...totalDays, ...nextDays], 
        label: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
      };
    }
  }, [currentDate, calendarView, isDataLoading]);

  const getLoanStatusStyle = (loan: any) => {
    if (loan.status === 'Closed') return 'bg-[#10ac84] text-white'; // Paid
    if (new Date(loan.dueDate) < new Date()) return 'bg-[#ee5253] text-white'; // Overdue
    return 'bg-[#f39c12] text-white'; // Upcoming
  };

  const getDayCollections = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayPayments = payments.filter((p: any) => p.date?.includes(dateStr));
    return dayPayments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
  };

  const statCards = [
    { title: 'Total Collections', value: `₹${stats.collectedToday.toLocaleString()}`, icon: IndianRupee, bg: 'bg-[#1b88f3]' },
    { title: 'Overdue Ledger', value: stats.overdueLoans.toString(), icon: Clock, bg: 'bg-[#ee5253]' },
    { title: 'Active Portfolio', value: stats.activeLoans.toString(), icon: Users, bg: 'bg-[#10ac84]' },
    { title: 'Client Base', value: stats.totalCustomers.toString(), icon: User, bg: 'bg-[#5f27cd]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Management Hub</h1>
          <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em] border-l-2 border-blue-600 pl-3">Centralized Operations • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-gray-100 transition-all hover:scale-105">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} shadow-sm`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-gray-500 text-sm font-semibold truncate">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           {/* Section: Calendar */}
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">Collection Calendar</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Smart settlement & installment tracker</p>
                  </div>
                </div>
                <div className="flex bg-gray-100 p-1.5 border border-gray-100 rounded-2xl shrink-0">
                   {['weekly', 'monthly', 'list'].map((view) => (
                      <button 
                        key={view}
                        onClick={() => setCalendarView(view as any)}
                        className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${calendarView === view ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        {view}
                      </button>
                   ))}
                </div>
              </div>

              {calendarView === 'list' ? (
                 <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col min-h-[450px]">
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
                          <tbody className="divide-y divide-gray-50">
                             {loans.filter((l: any) => l.status === 'Active' && l.dueDate).slice(0, 10).map((l, i) => (
                               <tr key={i} className="hover:bg-gray-50/50 transition-colors group italic">
                                  <td className="px-8 py-5">
                                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[10px] font-black text-amber-600 uppercase not-italic">
                                        {new Date(l.dueDate).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-8 py-5 not-italic">
                                     <div className="font-black text-gray-900 uppercase text-xs">{l.customerName}</div>
                                  </td>
                                  <td className="px-8 py-5 not-italic">
                                     <div className="font-black text-gray-900 tracking-tighter text-sm">₹{Number(l.balanceAmount || l.loanAmount).toLocaleString()}</div>
                                  </td>
                                  <td className="px-8 py-5 text-right not-italic">
                                     <button className="p-2 hover:text-blue-600"><Phone className="w-4 h-4" /></button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col p-4 md:p-8">
                   <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600"><CalendarIcon className="w-5 h-5" /></div>
                         {calendarData.label}
                      </h3>
                      <div className="flex items-center gap-2">
                         <button onClick={() => navigateDate(-1)} className="p-3 bg-white hover:bg-gray-200 rounded-xl border border-gray-200 shadow-sm transition-all"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                         <button onClick={() => setCurrentDate(new Date())} className="px-6 py-3 bg-white hover:bg-gray-200 rounded-xl border border-gray-200 shadow-sm text-[11px] font-black uppercase tracking-widest transition-all">Today</button>
                         <button onClick={() => navigateDate(1)} className="p-3 bg-white hover:bg-gray-200 rounded-xl border border-gray-200 shadow-sm transition-all"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                      </div>
                   </div>

                   <div className={`grid gap-2 ${calendarView === 'weekly' ? 'grid-cols-7' : 'grid-cols-7'}`}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                         <div key={d} className="text-center py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
                      ))}
                      {calendarData.days.map((day: Date, i: number) => {
                         const isToday = day.toDateString() === new Date().toDateString();
                         const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                         const dayLoans = loans.filter((l: any) => l.dueDate && new Date(l.dueDate).toDateString() === day.toDateString());
                         const dayCollection = getDayCollections(day);
                         
                         return (
                            <div 
                              key={i} 
                              onClick={() => setSelectedDayDetail({ day, loans: dayLoans })}
                              className={`min-h-[100px] md:min-h-[140px] rounded-2xl p-2 md:p-3 border transition-all cursor-pointer group flex flex-col relative ${
                                isToday ? 'bg-blue-50/30 border-blue-200 ring-2 ring-blue-50' : 
                                isCurrentMonth ? 'bg-white border-gray-50 hover:border-gray-200' : 'bg-gray-50/50 border-transparent opacity-40'
                              }`}
                            >
                               <div className="flex justify-between items-start mb-2">
                                  <span className={`text-base font-black ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day.getDate()}</span>
                                  {dayCollection > 0 && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">₹{dayCollection.toLocaleString()}</span>}
                               </div>
                               
                               <div className="space-y-1 overflow-hidden">
                                  {dayLoans.slice(0, 3).map((l: any, j: number) => (
                                     <div key={j} className={`px-2 py-1 rounded-lg text-[8px] md:text-[9px] font-black truncate shadow-sm transition-all ${getLoanStatusStyle(l)}`}>
                                        {l.customerName}
                                     </div>
                                  ))}
                                  {dayLoans.length > 3 && <div className="text-[8px] font-black text-gray-400 text-center uppercase tracking-tighter">+{dayLoans.length - 3} more records</div>}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                   
                   {/* Legend */}
                   <div className="mt-8 flex flex-wrap gap-6 px-4 pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-[#10ac84]"></div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-[#ee5253]"></div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overdue</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-[#f39c12]"></div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming</span>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Feed */}
        <div className="lg:col-span-4 space-y-8">
           <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight px-2 flex items-center justify-between">
                 Operational Feed
                 <span className="text-[10px] font-black text-blue-500 tracking-widest italic animate-pulse">Live Feed</span>
              </h2>
              <div className="bg-white rounded-[40px] border-2 border-gray-50 p-8 space-y-6 shadow-sm min-h-[400px]">
                 {recentActivities.map((activity, i) => (
                    <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 group">
                       <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm`}>
                          <activity.icon className={`w-5 h-5 ${activity.text}`} />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-black text-gray-900 uppercase leading-snug">{activity.user}</p>
                          <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase italic leading-tight">{activity.action}</p>
                          <p className="text-[8px] font-black text-gray-400 mt-2 uppercase tracking-widest">{activity.time}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Date Detail Popup */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDayDetail(null)}></div>
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">Schedule Detail</h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{selectedDayDetail.day.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 </div>
                 <button onClick={() => setSelectedDayDetail(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                 {/* Scheduled Settlements Section */}
                 {selectedDayDetail.loans.length > 0 && (
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2">Scheduled Settlements</h5>
                       {selectedDayDetail.loans.map((l: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5">
                             <div className="flex gap-5 items-center">
                                <div className={`w-12 h-12 rounded-2xl ${getLoanStatusStyle(l)} flex items-center justify-center shadow-lg shadow-gray-200/50`}><User className="w-6 h-6" /></div>
                                <div>
                                   <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{l.customerName}</p>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getLoanStatusStyle(l).replace('bg-', 'border-').replace('text-white', '')} bg-white`}>{l.status || 'Active'}</span>
                                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ID: {l.customerId || 'CUST-XXXX'}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-lg font-black text-gray-900 tracking-tighter">₹{Number(l.balanceAmount || l.loanAmount).toLocaleString()}</p>
                                <button className="text-[9px] font-black text-blue-600 uppercase mt-1 tracking-widest flex items-center justify-end gap-1">Schedule View <ArrowUpRight className="w-3 h-3" /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}

                 {/* Received Collections Section */}
                 {payments.filter((p: any) => p.date?.includes(selectedDayDetail.day.toISOString().split('T')[0])).length > 0 && (
                    <div className="space-y-4 pt-4">
                       <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2">Received Collections</h5>
                       {payments.filter((p: any) => p.date?.includes(selectedDayDetail.day.toISOString().split('T')[0])).map((p: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5">
                             <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200"><IndianRupee className="w-5 h-5" /></div>
                                <div>
                                   <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{p.customerName || 'Anonymous Client'}</p>
                                   <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">{p.type || 'EMI Payment'}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-emerald-700 tracking-tight">+₹{Number(p.amount).toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}

                 {selectedDayDetail.loans.length === 0 && payments.filter((p: any) => p.date?.includes(selectedDayDetail.day.toISOString().split('T')[0])).length === 0 && (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100"><Clock className="w-8 h-8 text-gray-200" /></div>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Zero Activity Logged for this Date</p>
                    </div>
                 )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Daily Revenue: <span className="text-emerald-600 ml-2 font-black">₹{getDayCollections(selectedDayDetail.day).toLocaleString()}</span></p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
