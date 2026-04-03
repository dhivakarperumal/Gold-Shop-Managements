import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, Edit2, User, Phone, CreditCard, LayoutGrid, List, History, X } from 'lucide-react';

export function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const loadCustomers = async () => {
    const data = await db.get('customers');
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const deleteCustomer = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer?')) {
      await db.delete('customers', id);
      loadCustomers();
    }
  };

  const viewHistory = async (customer: any) => {
    const allLoans = await db.get('loans');
    const customerLoans = allLoans.filter((l: any) => l.customerId === customer.id);
    setSelectedHistory(customerLoans);
    setIsHistoryOpen(true);
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile?.includes(searchTerm) ||
    c.aadhar?.includes(searchTerm) ||
    c.aadharNo?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage KYC, view loan history and documentation.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/customers/new')}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-sm mb-4 sm:mb-0">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name, mobile or Aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
            />
          </div>

          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Aadhaar / ID</th>
                  <th className="px-6 py-4">Current Exposure</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No customers records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {c.customerPhoto || c.photo ? (
                            <img src={c.customerPhoto || c.photo} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">{c.name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5" /> {c.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-xs font-bold">{c.aadharNo || c.aadhar}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate uppercase font-bold italic">{c.permanentAddress || c.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          Number(c.amountActive) > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                           {Number(c.amountActive) > 0 ? `₹${Number(c.amountActive).toLocaleString()}` : 'SEEK FREE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button onClick={() => viewHistory(c)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Loan History">
                            <History className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/admin/customers/edit/${c.id}`)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Customer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCustomer(c.id)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-400">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-black uppercase tracking-widest text-[10px]">No Registered Customers found</p>
               </div>
            ) : (
              filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                  <div className="p-5 flex items-start gap-4">
                     {c.customerPhoto || c.photo ? (
                      <img src={c.customerPhoto || c.photo} className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate uppercase leading-tight">{c.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-blue-500 font-mono text-[10px] font-bold">
                        <Phone className="w-3 h-3" />
                        <span>{c.mobile}</span>
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {c.customerId || 'LEGACY-USER'}</div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50/30 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 font-black uppercase tracking-widest">Document UID</span>
                      <span className="font-mono font-black text-gray-900 px-2 py-0.5 rounded-lg bg-white border border-gray-100 italic">{c.aadharNo || c.aadhar}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Exposure</span>
                      <span className={`text-sm font-black ${Number(c.amountActive) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {Number(c.amountActive) > 0 ? `₹${Number(c.amountActive).toLocaleString()}` : 'SAFE'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto p-4 flex gap-2 border-t border-gray-100 bg-white">
                    <button 
                      onClick={() => viewHistory(c)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
                    >
                      <History className="w-3.5 h-3.5" /> History
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/customers/edit/${c.id}`)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteCustomer(c.id)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
                   <div className="p-2 bg-blue-600 rounded-lg text-white">
                     <History className="w-4 h-4" />
                   </div>
                   Loan Disbursement History
                </h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20">
                <div className="grid grid-cols-1 gap-4">
                  {selectedHistory.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 items-center justify-center flex flex-col space-y-3">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                          <History className="w-8 h-8 opacity-20" />
                       </div>
                       <p className="font-black uppercase tracking-widest text-[10px]">No historical records found for this customer</p>
                    </div>
                  ) : (
                    selectedHistory.map((l, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loan Ref: {l.id?.slice(-8).toUpperCase()}</span>
                          </div>
                          <div className="font-black text-gray-900 text-xl tracking-tighter">₹{Number(l.loanAmount).toLocaleString()}</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                            l.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {l.status}
                          </span>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{new Date(l.startDate).toLocaleDateString()} &bull; {l.duration} Months</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
