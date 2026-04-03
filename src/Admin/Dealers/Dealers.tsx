import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, Home, User, LayoutGrid, List, Phone, MapPin } from 'lucide-react';

export function Dealers() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const loadData = async () => {
    const data = await db.get('dealers');
    setDealers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDealer = {
      name: formData.get('name'),
      shopName: formData.get('shopName'),
      mobile: formData.get('mobile'),
      address: formData.get('address'),
      createdAt: new Date().toISOString()
    };
    await db.add('dealers', newDealer);
    setIsModalOpen(false);
    loadData();
  };

  const deleteDealer = async (id: string) => {
    if(confirm('Are you sure you want to delete this dealer?')) {
      await db.delete('dealers', id);
      loadData();
    }
  };

  const filtered = dealers.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dealers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner shops and gold dealers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Dealer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
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
                  <th className="px-6 py-4">Dealer/Shop</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 uppercase font-black text-[10px] tracking-widest">
                      No dealers found. Click 'Add Dealer' to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{d.name}</div>
                        <div className="text-[11px] text-blue-500 font-black uppercase tracking-tighter">{d.shopName}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs font-bold">{d.mobile}</td>
                      <td className="px-6 py-4 text-gray-400">
                        <div className="text-[10px] truncate max-w-xs uppercase font-extrabold">{d.address}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteDealer(d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <Home className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-black uppercase tracking-widest text-[10px]">No Registered Dealers found</p>
               </div>
            ) : (
              filtered.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                      <Home className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={() => deleteDealer(d.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase leading-none">{d.name}</h3>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{d.shopName}</p>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center gap-3 text-xs text-gray-600 font-bold border-b border-gray-50 pb-2">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                          <span>{d.mobile}</span>
                       </div>
                       <div className="flex items-start gap-3 text-[10px] text-gray-400 font-black uppercase tracking-tighter leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span>{d.address}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Add New Dealer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dealer Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required name="name" type="text" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Name</label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required name="shopName" type="text" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Kanak Gold Mart" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                <input required name="mobile" type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <textarea required name="address" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Shop #123, Gold Bazaar, City"></textarea>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-medium text-white bg-[#1b88f3] hover:bg-blue-600 transition-colors shadow-sm">Save Dealer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
