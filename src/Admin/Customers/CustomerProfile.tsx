import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { 
  User, Phone, Mail, MapPin, CreditCard, Calendar, 
  History, Wallet, Gem, ShieldCheck,
  Edit2, Trash2, Printer, ArrowLeft, Download, Plus, CheckCircle
} from 'lucide-react';

export function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!id) return;
      const customers = await db.get('customers');
      const found = customers.find((c: any) => c.id === id);
      setCustomer(found);

      const allLoans = await db.get('loans');
      const customerLoans = allLoans.filter((l: any) => l.customerId === id);
      setLoans(customerLoans);

      const allPayments = await db.get('payments');
      const customerPayments = allPayments.filter((p: any) => p.customerId === id);
      setPayments(customerPayments);
      
      setLoading(false);
    };
    loadCustomerData();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!customer) return <div className="p-10 text-center font-black uppercase text-gray-400">Customer record not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/admin/customers')} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-blue-600 transition-all hover:bg-blue-50 group">
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
           </button>
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{customer.name}</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">{customer.customerId || 'PREMIUM CLIENT'}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
             className="px-6 py-3 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2"
           >
              <Edit2 className="w-4 h-4" /> Modify Profile
           </button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Full Archive
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Dossier */}
        <div className="lg:col-span-4 space-y-8">
           {/* Photo & Status */}
           <div className="bg-white rounded-[40px] border border-gray-100 p-10 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
              {customer.customerPhoto || customer.photo ? (
                <img src={customer.customerPhoto || customer.photo} className="w-32 h-32 rounded-[32px] object-cover mx-auto border-4 border-white shadow-xl relative z-10" />
              ) : (
                <div className="w-32 h-32 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200 border-4 border-white shadow-inner mx-auto relative z-10">
                   <User className="w-16 h-16" />
                </div>
              )}
              <div className="mt-6 flex flex-col items-center">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-2 ${
                   customer.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                 }`}>
                    KYC Status: {customer.kycStatus}
                 </span>
                 <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{customer.name}</h2>
                 <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic">{customer.occupation || 'Trade Professional'}</p>
              </div>
           </div>

           {/* Contact Details */}
           <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-blue-500" /> Identity Data
              </h4>
              <div className="divide-y divide-gray-50">
                 <div className="py-4 px-2 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                       <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document UID</p>
                       <p className="text-sm font-bold text-gray-900 uppercase italic">{customer.aadharNo || customer.aadhar}</p>
                    </div>
                 </div>
                 <div className="py-4 px-2 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                       <Phone className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Access</p>
                       <p className="text-sm font-bold text-gray-900">{customer.mobile}</p>
                    </div>
                 </div>
                 <div className="py-4 px-2 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                       <Mail className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Archive</p>
                       <p className="text-sm font-bold text-gray-900 lowercase truncate max-w-[200px]">{customer.email || 'No email on record'}</p>
                    </div>
                 </div>
                 <div className="py-4 px-2 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Zone Location</p>
                       <p className="text-[11px] font-bold text-gray-600 uppercase italic leading-tight">{customer.permanentAddress || customer.address || 'Chennai, Tamil Nadu'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Financial Exposure & History */}
        <div className="lg:col-span-8 space-y-8">
           {/* Overview Stats */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Exposure</p>
                 <div className="text-3xl font-black text-gray-900 tracking-tighter">₹{Number(customer.amountActive || 0).toLocaleString()}</div>
                 <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-1 bg-blue-100 rounded-full overflow-hidden">
                       <div className="w-1/2 h-full bg-blue-600"></div>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Gold Secured</span>
                 </div>
              </div>
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Pledges</p>
                 <div className="text-3xl font-black text-gray-900 tracking-tighter">{loans.filter(l => l.status === 'Active').length} <span className="text-sm text-gray-400">Certificates</span></div>
                 <div className="mt-3 text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Fully Verified Assets
                 </div>
              </div>
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lifetime Business</p>
                 <div className="text-3xl font-black text-gray-900 tracking-tighter">₹{loans.reduce((acc, l) => acc + Number(l.loanAmount), 0).toLocaleString()}</div>
                 <div className="mt-3 text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                    <History className="w-3 h-3" /> Loyalty Program Active
                 </div>
              </div>
           </div>

           {/* Tabbed Content: Loans vs Payments */}
           <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-50 px-8 pt-8">
                 <div className="flex gap-8 relative">
                    <button className="pb-6 border-b-4 border-blue-600 text-xs font-black text-blue-600 uppercase tracking-widest">Loan Portfolio ({loans.length})</button>
                    <button className="pb-6 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Revenue Stream ({payments.length})</button>
                 </div>
              </div>
              
              <div className="p-8">
                 <div className="space-y-4">
                    {loans.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 font-black uppercase text-[10px] tracking-widest">No active portfolio found</div>
                    ) : (
                      loans.map((l: any, i: number) => (
                        <div key={i} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-200 transition-all">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                                 <Gem className={`w-7 h-7 ${l.status === 'Active' ? 'text-blue-500' : 'text-emerald-500'}`} />
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1">CERTIFICATE: #{l.id?.slice(-8).toUpperCase()}</h5>
                                 <div className="text-lg font-black text-gray-900 tracking-tighter">₹{Number(l.loanAmount).toLocaleString()}</div>
                                 <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                       <Calendar className="w-3 h-3 opacity-30" /> {new Date(l.startDate || l.loanDate).toLocaleDateString()}
                                    </span>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase border ${
                                      l.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                       {l.status}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="text-right mr-4 hidden sm:block">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Interest Model</p>
                                 <p className="text-[10px] font-black text-gray-900 uppercase italic">@ {l.interestRate}% ({l.interestType || 'Simple'})</p>
                              </div>
                              <button className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-colors">
                                 Audit Trace
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>

           {/* Quick Actions Footer */}
           <div className="p-8 bg-gray-900 rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <Wallet className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black tracking-tighter uppercase leading-none">Instant Transaction</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Initiate loan or collect revenue</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95">
                    Collect Repayment
                 </button>
                 <button onClick={() => navigate('/admin/loans/new')} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Pledge
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
