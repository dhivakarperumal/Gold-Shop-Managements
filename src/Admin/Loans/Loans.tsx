import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/db';
import { useData } from '../../context/DataContext';
import { Search, Plus, Trash2, IndianRupee, Calendar, Gem, Wallet, CheckCircle, Clock, AlertCircle, Receipt, LayoutGrid, List } from 'lucide-react';

export function Loans() {
  const navigate = useNavigate();
  const { loans, customers } = useData();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const isReturnMode = searchParams.get('mode') === 'return';

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState('Interest');

  // Third Party Payment State
  const [isThirdParty, setIsThirdParty] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerRelation, setPayerRelation] = useState('');

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const amountPaid = Number(paymentAmount);
    let newBalance = Number(selectedLoan.balanceAmount) || Number(selectedLoan.loanAmount);
    let newInterestPaid = Number(selectedLoan.interestPaid) || 0;
    let newPrincipalPaid = Number(selectedLoan.paidAmount) || 0;
    let newStatus = selectedLoan.status;

    if (paymentType === 'Full') {
      newBalance = 0;
      newPrincipalPaid = Number(selectedLoan.loanAmount);
      newStatus = 'Closed';
    } else if (paymentType === 'Interest') {
      newInterestPaid += amountPaid;
    } else if (paymentType === 'Partial') {
      newBalance = Math.max(0, newBalance - amountPaid);
      newPrincipalPaid += amountPaid;
      if (newBalance === 0) newStatus = 'Closed';
    }

    // Save transaction
    const transaction = {
      loanId: selectedLoan.id,
      customerId: selectedLoan.customerId,
      customerName: selectedLoan.customerName,
      amount: amountPaid,
      type: paymentType,
      balance: newBalance,
      date: new Date().toISOString(),
      isThirdParty,
      payerName: isThirdParty ? payerName : selectedLoan.customerName,
      payerRelation: isThirdParty ? payerRelation : 'Self'
    };
    await db.add('payments', transaction);

    // Update loan
    await db.update('loans', selectedLoan.id, {
      balanceAmount: newBalance,
      paidAmount: newPrincipalPaid,
      interestPaid: newInterestPaid,
      status: newStatus
    });

    // Update customer balance if settled
    if (newStatus === 'Closed') {
      const customer = customers.find(c => c.id === selectedLoan.customerId);
      if (customer) {
        const currentActive = Number(customer.amountActive || 0);
        await db.update('customers', selectedLoan.customerId, {
          amountActive: Math.max(0, currentActive - Number(selectedLoan.loanAmount))
        });
      }
    }

    setIsPaymentModalOpen(false);
    setSelectedLoan(null);
    setPaymentAmount(0);
    setIsThirdParty(false);
    setPayerName('');
    setPayerRelation('');
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
    }
  };

  const filtered = loans.filter(l => {
    const matchesSearch = l.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id?.includes(searchTerm);
    
    if (isReturnMode) {
      return matchesSearch && l.status !== 'Closed';
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedLoans = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">
            {isReturnMode ? 'Gold Return & Release' : 'Advanced Loan Manager'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
            {isReturnMode ? 'Select an active loan to begin the release protocol.' : 'Multi-item pledging & interest tracking.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsProcessModalOpen(true)}
            className="bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-2xl font-black text-[11px] shadow-sm flex items-center gap-2 transition-all uppercase tracking-widest"
          >
            <AlertCircle className="w-4 h-4" />
            Process Guide
          </button>
          <button 
            onClick={() => navigate('/admin/loans/new')}
            className="bg-[#1b88f3] hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] shadow-lg flex items-center gap-2 transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create New Pledge
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID, Customer Name or CUST-ID..."
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
                  <th className="px-6 py-5">S.No</th>
                  <th className="px-6 py-5">Loan Ref / Date</th>
                  <th className="px-6 py-5">Customer Profile</th>
                  <th className="px-6 py-5">Pledged Objects</th>
                  <th className="px-6 py-5">Financial Details</th>
                  <th className="px-6 py-5">Workflow</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[11px]">
                      No active loan records detected in system.
                    </td>
                  </tr>
                ) : (
                  paginatedLoans.map((l, index) => (
                    <tr key={l.id} className="hover:bg-gray-50/80 transition-colors group not-italic">
                      <td className="px-6 py-5 text-[10px] font-black text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-mono text-[10px] font-black text-blue-500 mb-1 leading-none uppercase">#{l.id?.slice(-8).toUpperCase()}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(l.startDate || l.loanDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs">{l.customerName}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{l.customerId || 'CUST-XXXX'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="flex -space-x-2 overflow-hidden">
                              {l.goldItems?.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm overflow-hidden">
                                   {item.photo || item.image ? <img src={item.photo || item.image} className="w-full h-full object-cover" /> : <Gem className="w-4 h-4 opacity-30" />}
                                </div>
                              ))}
                           </div>
                           <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                              {l.goldItems?.length} items ({l.goldItems?.reduce((acc: number, i: any) => acc + (Number(i.weight) || 0), 0).toFixed(2)}g)
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-gray-900 font-black text-sm">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-400" />
                          {Number(l.loanAmount).toLocaleString()}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 mt-1">
                           Rate: {l.interestRate}% ({l.interestType || 'Simple'})
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          l.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          l.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                           {l.status === 'Active' ? <Clock className="w-3 h-3" /> : 
                            l.status === 'Overdue' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                           {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {l.status !== 'Closed' && (
                            <button 
                              onClick={() => navigate(`/admin/loans/release/${l.id}`)}
                              className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100 shadow-sm"
                              title="Begin Gold Return Process"
                            >
                               <Wallet className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteLoan(l.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent">
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
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-black uppercase tracking-widest">No active system records detect</p>
               </div>
            ) : (
              paginatedLoans.map((l) => (
                <div key={l.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[9px] text-blue-500 font-black uppercase tracking-tighter leading-none mb-1">REF: #{l.id?.slice(-8).toUpperCase()}</div>
                      <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs leading-none">{l.customerName}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      l.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      l.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {l.status}
                    </span>
                  </div>

                  <div className="p-6 flex-1 space-y-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">Principal Value</span>
                        <div className="text-2xl font-black text-gray-900 flex items-center tracking-tighter">
                          <IndianRupee className="w-4 h-4 mr-0.5 text-gray-400" />
                          {Number(l.loanAmount).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1 font-mono">{l.customerId || 'CUST-XXXX'}</span>
                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          @ {l.interestRate}% ({l.interestType || 'Simple'})
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-50/50 space-y-3">
                       <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] block">Asset Information</span>
                       <div className="flex items-center justify-between">
                          <div className="flex -space-x-2 overflow-hidden">
                            {l.goldItems?.slice(0, 4).map((item: any, idx: number) => (
                              <div key={idx} className="w-9 h-9 rounded-xl border-2 border-white bg-white flex items-center justify-center shadow-sm overflow-hidden">
                                {item.photo || item.image ? <img src={item.photo || item.image} className="w-full h-full object-cover" /> : <Gem className="w-4 h-4 text-blue-200" />}
                              </div>
                            ))}
                          </div>
                          <div className="text-right">
                             <div className="text-xs font-black text-blue-900">{l.goldItems?.reduce((acc: number, i: any) => acc + (Number(i.weight) || 0), 0).toFixed(2)}g</div>
                             <div className="text-[8px] text-blue-400 font-bold uppercase">{l.goldItems?.length} Pledged Items</div>
                          </div>
                       </div>
                    </div>

                    {l.balanceAmount !== undefined && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Repayment Balance</span>
                        <span className={l.balanceAmount > 0 ? 'text-amber-600 italic' : 'text-emerald-600'}>
                          ₹{l.balanceAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-gray-50/50 border-t border-gray-50 flex gap-3">
                    {l.status !== 'Closed' && (
                      <button 
                        onClick={() => navigate(`/admin/loans/release/${l.id}`)}
                        className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-4 h-4" /> Start Return Process
                      </button>
                    )}
                    <button 
                      onClick={() => deleteLoan(l.id)}
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

        {/* Pagination Controls */}
        {filtered.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} entries
             </div>
             <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                   {[...Array(totalPages)].map((_, i) => (
                     <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-white border border-transparent'}`}
                     >
                       {i + 1}
                     </button>
                   ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  Next
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Repayment Modal Removed - Replaced by GoldRelease Page */}

      {/* Process Guide Modal */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-50 bg-amber-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-amber-900 tracking-tighter uppercase">Gold Return Standard Process</h2>
                <p className="text-[11px] font-bold text-amber-700/60 uppercase tracking-widest mt-1">Official Step-by-Step Security Protocol</p>
              </div>
              <button onClick={() => setIsProcessModalOpen(false)} className="bg-white text-gray-400 hover:text-gray-600 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-light shadow-sm border border-gray-100">&times;</button>
            </div>
            
            <div className="p-10 grid gap-6">
              {[
                { step: 1, title: 'Visit the Shop', desc: 'Borrower or authorized representative visits the counter.' },
                { step: 2, title: 'Verify Loan Details', desc: 'Audit loan receipt, customer profile, and physical gold item.' },
                { step: 3, title: 'Pay Loan Amount', desc: 'Collection of Principal + Interest + Additional charges.' },
                { step: 4, title: 'Identity Verification', desc: 'Validate government-issued ID and capture acknowledgment.' },
                { step: 5, title: 'Gold Release', desc: 'Hand over ornaments and mark the loan as "Closed" in system.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-600 font-black text-xl group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
               <button 
                onClick={() => setIsProcessModalOpen(false)}
                className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
               >
                 I Understand the Protocol
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
