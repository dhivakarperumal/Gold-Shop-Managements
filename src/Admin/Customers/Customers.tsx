import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, Edit2, User, Phone, CreditCard, MapPin, Camera, X, History } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');

  const loadCustomers = async () => {
    const data = await db.get('customers');
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerData = {
      name: formData.get('name'),
      mobile: formData.get('mobile'),
      address: formData.get('address'),
      aadhar: formData.get('aadhar'),
      photo: photoBase64,
      amountActive: editingCustomer ? editingCustomer.amountActive : 0
    };

    if (editingCustomer) {
      await db.update('customers', editingCustomer.id, customerData);
    } else {
      await db.add('customers', customerData);
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    setPhotoBase64('');
    loadCustomers();
  };

  const deleteCustomer = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer?')) {
      await db.delete('customers', id);
      loadCustomers();
    }
  };

  const openEdit = (customer: any) => {
    setEditingCustomer(customer);
    setPhotoBase64(customer.photo || '');
    setIsModalOpen(true);
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
    c.aadhar?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage KYC, view loan history and documentation.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setPhotoBase64('');
            setIsModalOpen(true);
          }}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name, mobile or Aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
            />
          </div>
        </div>

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
                        {c.photo ? (
                          <img src={c.photo} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {c.mobile}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-xs">{c.aadhar}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate">{c.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold ${
                        Number(c.amountActive) > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                         {Number(c.amountActive) > 0 ? `₹${Number(c.amountActive).toLocaleString()}` : 'No Active Pledges'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewHistory(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Loan History">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors" title="Edit Customer">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCustomer(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
      </div>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <History className="w-5 h-5 text-blue-600" />
                   Loan History
                </h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No loan history available for this customer.</div>
                  ) : (
                    selectedHistory.map((l, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all bg-white shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">₹{Number(l.loanAmount).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{new Date(l.startDate).toLocaleDateString()} • {l.duration} Months</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors relative group">
                {photoBase64 ? (
                  <div className="relative">
                    <img src={photoBase64} className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white" />
                    <button 
                      type="button" 
                      onClick={() => setPhotoBase64('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                       <Camera className="w-8 h-8 text-blue-400" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Upload Customer Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input required name="name" type="text" defaultValue={editingCustomer?.name} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm" placeholder="Full Name" />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input required name="mobile" type="tel" defaultValue={editingCustomer?.mobile} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm" placeholder="Mobile Number" />
                </div>

                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input required name="aadhar" type="text" defaultValue={editingCustomer?.aadhar} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm" placeholder="Aadhaar / ID Card Number" />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea required name="address" rows={2} defaultValue={editingCustomer?.address} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm" placeholder="Complete Residential Address"></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-[13px] text-gray-500 hover:bg-gray-100 transition-colors">CANCEL</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg font-bold text-[13px] text-white bg-[#1b88f3] hover:bg-blue-600 transition-colors shadow-[0_4px_14px_rgba(27,136,243,0.39)] uppercase tracking-wider">
                   {editingCustomer ? 'UPDATE CUSTOMER' : 'SAVE CUSTOMER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
