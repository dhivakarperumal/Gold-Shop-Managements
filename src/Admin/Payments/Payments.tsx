import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, IndianRupee, Calendar, User, Download, Printer, CheckCircle, Wallet, Filter, X } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const loadData = async () => {
    const paymentData = await db.get('payments');
    const loanData = await db.get('loans');
    setPayments(paymentData);
    setLoans(loanData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const printReceipt = (payment: any) => {
    setSelectedReceipt(payment);
    setIsReceiptOpen(true);
    // In a real app, we might trigger window.print() here or use a library
  };

  const filtered = payments.filter(p => {
    const matchesSearch = p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.loanId?.includes(searchTerm);
    const matchesType = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment & EMI History</h1>
          <p className="text-sm text-gray-500 mt-1">Track collections, interest payments and settlements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold text-xs shadow-sm flex items-center gap-2 transition-colors uppercase tracking-wider">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by Customer or Loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
               {['All', 'Interest', 'Partial', 'Settlement'].map(type => (
                 <button 
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${
                    filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Loan Ref</th>
                <th className="px-6 py-4">Payment Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-10" />
                    No payment history found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-gray-400 mb-1 uppercase">#{p.id?.slice(-8).toUpperCase()}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(p.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{p.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-[10px] text-gray-500 font-bold border border-gray-200 px-1.5 py-0.5 rounded italic">
                         {p.loanId?.slice(-6).toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.type === 'Settlement' ? 'bg-emerald-100 text-emerald-700' :
                        p.type === 'Interest' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                         {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 font-black">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-400" />
                        {Number(p.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => printReceipt(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Receipt">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {isReceiptOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col p-8 relative print-container">
             <button onClick={() => setIsReceiptOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 text-2xl no-print">&times;</button>
             
             {/* Receipt Header */}
             <div className="text-center border-b-2 border-gray-100 pb-6 mb-6">
                <h2 className="text-3xl font-black text-blue-600 tracking-tighter">KANAK GOLD</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Certified Gold Loan & Valuations</p>
                <div className="mt-4 inline-block px-4 py-1.5 bg-blue-50 rounded-full text-[11px] font-black text-blue-600 uppercase">
                   Payment Receipt
                </div>
             </div>

             {/* Receipt Info */}
             <div className="space-y-4">
                <div className="flex justify-between text-xs">
                   <span className="font-extrabold text-gray-400 uppercase">Receipt No:</span>
                   <span className="font-mono font-bold text-gray-900">REC-{selectedReceipt.id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="font-extrabold text-gray-400 uppercase">Date:</span>
                   <span className="font-bold text-gray-900">{new Date(selectedReceipt.date).toLocaleString()}</span>
                </div>
                
                <div className="py-6 border-y-2 border-dashed border-gray-100 my-6 space-y-3">
                   <div className="flex justify-between">
                      <span className="text-xs font-black text-gray-500 uppercase">Customer</span>
                      <span className="text-sm font-black text-gray-900">{selectedReceipt.customerName}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs font-black text-gray-500 uppercase">Loan Reference</span>
                      <span className="text-xs font-mono font-bold text-gray-900">LOAN-{selectedReceipt.loanId?.slice(-8).toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs font-black text-gray-500 uppercase">Payment Type</span>
                      <span className="text-xs font-black text-blue-600 uppercase tracking-wider">{selectedReceipt.type}</span>
                   </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center">
                   <span className="text-sm font-black text-gray-500 uppercase">Amount Paid</span>
                   <div className="text-3xl font-black text-gray-900 flex items-baseline">
                      <span className="text-lg mr-1 text-gray-400">₹</span>
                      {Number(selectedReceipt.amount).toLocaleString()}
                   </div>
                </div>

                {selectedReceipt.balance !== undefined && (
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Remaining Balance</span>
                     <span className="text-sm font-black text-red-500">₹{Number(selectedReceipt.balance).toLocaleString()}</span>
                  </div>
                )}
             </div>

             {/* Footer */}
             <div className="mt-12 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-500 mb-6">
                   <CheckCircle className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">Transaction Verified</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">This is a computer generated receipt and does not require a physical signature.</p>
                
                <div className="flex gap-4 mt-8 no-print">
                   <button onClick={() => window.print()} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                      <Printer className="w-4 h-4" /> Print Receipt
                   </button>
                   <button onClick={() => setIsReceiptOpen(false)} className="px-6 py-3 border-2 border-gray-100 text-gray-400 font-black text-xs rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-colors">
                      Done
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
