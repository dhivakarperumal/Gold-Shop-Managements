import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, IndianRupee, Calendar, User } from 'lucide-react';

export function Loans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    const loanData = await db.get('loans');
    const customerData = await db.get('customers');
    setLoans(loanData);
    setCustomers(customerData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerId = formData.get('customerId') as string;
    const customer = customers.find(c => c.id === customerId);

    const newLoan = {
      customerId,
      customerName: customer?.name || 'Unknown',
      loanAmount: formData.get('loanAmount'),
      interestRate: formData.get('interestRate'),
      duration: formData.get('duration'),
      startDate: formData.get('startDate'),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    await db.add('loans', newLoan);
    
    // Update customer's active loans amount (simple logic for now)
    if (customer) {
      const currentActive = Number(customer.amountActive || 0);
      await db.update('customers', customerId, {
        amountActive: currentActive + Number(newLoan.loanAmount)
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const deleteLoan = async (id: string) => {
    if(confirm('Are you sure you want to delete this loan record?')) {
      const loan = loans.find(l => l.id === id);
      if (loan) {
        const customer = customers.find(c => c.id === loan.customerId);
        if (customer) {
          const currentActive = Number(customer.amountActive || 0);
          await db.update('customers', loan.customerId, {
            amountActive: Math.max(0, currentActive - Number(loan.loanAmount))
          });
        }
      }
      await db.delete('loans', id);
      loadData();
    }
  };

  const filtered = loans.filter(l => 
    l.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.loanAmount?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loans Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all customer loans and installments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Loan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by customer or amount..."
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
                <th className="px-6 py-4">Loan ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Interest/Duration</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No loans found. Click 'Create New Loan' to start.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{l.id?.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{l.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 font-bold">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-400" />
                        {Number(l.loanAmount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{l.interestRate}% Interest</div>
                      <div className="text-xs text-gray-400">{l.duration} Months</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                        {new Date(l.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        l.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                         {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteLoan(l.id)} className="text-red-500 hover:text-red-700 p-1">
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
              <h2 className="text-lg font-bold text-gray-900">Create New Loan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Customer</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    required 
                    name="customerId" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white font-medium text-gray-700"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Loan Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required name="loanAmount" type="number" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="50000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Interest Rate (%)</label>
                  <input required name="interestRate" type="number" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="2.0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                  <input required name="duration" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="12" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required name="startDate" type="date" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-medium text-white bg-[#1b88f3] hover:bg-blue-600 transition-colors shadow-sm">Process Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
