import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, Home, User } from 'lucide-react';

export function Dealers() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
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
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No dealers found. Click 'Add Dealer' to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <div className="text-xs text-[#1b88f3] font-medium">{d.shopName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{d.mobile}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-xs truncate max-w-xs">{d.address}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteDealer(d.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
