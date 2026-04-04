import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { useData } from '../../context/DataContext';
import { Search, Plus, Trash2, Edit2, User, Phone, LayoutGrid, List, Eye, Mail, ShieldCheck } from 'lucide-react';

export function Customers() {
  const navigate = useNavigate();
  const { customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const deleteCustomer = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer? All associated data will be removed.')) {
      await db.delete('customers', id);
      // Loans will be updated automatically via onSnapshot in DataContext
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile?.includes(searchTerm) ||
    c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Manage your client specialized dossiers & KYC.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/customers/new')}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] shadow-lg flex items-center gap-2 transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Enroll New Client
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by Name, Mobile or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all text-sm font-bold bg-white"
            />
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-black border-b border-gray-100 uppercase text-[10px] tracking-[0.15em]">
                <tr>
                  <th className="px-6 py-5">Client Profile</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Identity Status</th>
                  <th className="px-6 py-5">Active Balance</th>
                  <th className="px-6 py-5 text-right">Dossier Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[11px]">
                      No matched client records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group not-italic">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {c.customerPhoto || c.photo ? (
                            <img src={c.customerPhoto || c.photo} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <button 
                              onClick={() => navigate(`/admin/customers/view/${c.id}`)}
                              className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight text-left"
                            >
                              {c.name}
                            </button>
                            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                               REF: {c.customerId || 'CUST-XXXX'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <Phone className="w-3 h-3 text-gray-400" /> {c.mobile}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                              <Mail className="w-3 h-3" /> {c.email || 'N/A'}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          c.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          c.kycStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                           <ShieldCheck className="w-3 h-3" />
                           {c.kycStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${Number(c.amountActive) > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-50'}`}>
                           {Number(c.amountActive) > 0 ? `₹${Number(c.amountActive).toLocaleString()}` : 'ZERO EXPOSURE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/customers/view/${c.id}`)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent shadow-sm"
                            title="View Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/admin/customers/edit/${c.id}`)} className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCustomer(c.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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
               <div className="col-span-full py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No records detected</div>
            ) : (
              filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-start">
                    <div className="flex gap-4">
                      {c.customerPhoto || c.photo ? (
                        <img src={c.customerPhoto || c.photo} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-50 flex items-center justify-center text-gray-200 shadow-sm">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <button 
                          onClick={() => navigate(`/admin/customers/view/${c.id}`)}
                          className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs text-left block"
                        >
                          {c.name}
                        </button>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">{c.occupation || 'Trade Professional'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      c.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      c.kycStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {c.kycStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="p-6 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile</span>
                          <p className="text-xs font-bold text-gray-900">{c.mobile}</p>
                       </div>
                       <div className="space-y-1 text-right">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                          <p className="text-xs font-bold text-gray-900 uppercase truncate">{c.city || 'Chennai'}</p>
                       </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Outstanding Exposure</span>
                       <span className="text-sm font-black text-blue-600">₹{Number(c.amountActive || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => navigate(`/admin/customers/view/${c.id}`)}
                      className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Dossier
                    </button>
                    <button 
                      onClick={() => deleteCustomer(c.id)}
                      className="p-3.5 rounded-2xl bg-white border border-gray-100 text-gray-300 hover:text-red-500 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
