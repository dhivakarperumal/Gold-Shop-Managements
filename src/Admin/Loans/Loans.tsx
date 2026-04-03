import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Search, Plus, Trash2, IndianRupee, Calendar, User, Gem,Wallet, Camera, PlusCircle, CheckCircle, Clock, AlertCircle, CreditCard, X, Receipt } from 'lucide-react';

export function Loans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Loan Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [goldItems, setGoldItems] = useState<any[]>([]);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(2.0);
  const [duration, setDuration] = useState<number>(12);
  const [marketRate] = useState<number>(6500); // Default market rate per gram (22K)

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState('Interest');

  const loadData = async () => {
    const loanData = await db.get('loans');
    const customerData = await db.get('customers');
    setLoans(loanData);
    setCustomers(customerData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addGoldItem = () => {
    setGoldItems([...goldItems, { 
      id: Date.now(),
      type: 'Chain', 
      weight: '', 
      purity: '22K', 
      valuation: 0,
      image: '' 
    }]);
  };

  const updateGoldItem = (index: number, field: string, value: any) => {
    const updated = [...goldItems];
    updated[index][field] = value;
    
    // Auto-calculate valuation
    if (field === 'weight' || field === 'purity') {
      const weight = Number(updated[index].weight) || 0;
      const purityMult = updated[index].purity === '24K' ? 1 : 0.92;
      updated[index].valuation = Math.round(weight * marketRate * purityMult);
    }
    
    setGoldItems(updated);
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...goldItems];
        updated[index].image = reader.result as string;
        setGoldItems(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const totalValuation = goldItems.reduce((acc, item) => acc + (Number(item.valuation) || 0), 0);
  const maxLoanPossible = Math.round(totalValuation * 0.75);

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === selectedCustomerId);

    const newLoan = {
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Unknown',
      goldItems,
      totalValuation,
      loanAmount: Number(loanAmount),
      balanceAmount: Number(loanAmount),
      interestRate: Number(interestRate),
      duration: Number(duration),
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      paidAmount: 0,
      interestPaid: 0,
      totalPayableWeight: Math.round(loanAmount + (loanAmount * (interestRate/100) * duration)),
      createdAt: new Date().toISOString()
    };

    await db.add('loans', newLoan);
    
    // Update customer active balance
    if (customer) {
      const currentActive = Number(customer.amountActive || 0);
      await db.update('customers', selectedCustomerId, {
        amountActive: currentActive + Number(loanAmount)
      });
    }

    setIsModalOpen(false);
    resetForm();
    loadData();
  };

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const amountPaid = Number(paymentAmount);
    let newBalance = Number(selectedLoan.balanceAmount) || Number(selectedLoan.loanAmount);
    let newInterestPaid = Number(selectedLoan.interestPaid) || 0;
    let newPrincipalPaid = Number(selectedLoan.paidAmount) || 0;
    let newStatus = selectedLoan.status;

    if (paymentType === 'Settlement') {
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
      date: new Date().toISOString()
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
    loadData();
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setGoldItems([]);
    setLoanAmount(0);
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
    l.id?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loan & Gold Management</h1>
          <p className="text-sm text-gray-500 mt-1">Pledge gold items and manage active loans.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1b88f3] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Pledge
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID or Customer..."
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
                <th className="px-6 py-4">Loan Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Pledged Gold</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                    No active loan records found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-gray-400 mb-1 leading-none uppercase">#{l.id?.slice(-8).toUpperCase()}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{new Date(l.startDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{l.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden mb-1">
                        {l.goldItems?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm overflow-hidden">
                             {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : item.type[0]}
                          </div>
                        ))}
                        {l.goldItems?.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-600 shadow-sm">
                            +{l.goldItems.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">
                        {l.goldItems?.reduce((acc: number, i: any) => acc + (Number(i.weight) || 0), 0).toFixed(2)}g / {l.goldItems?.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 font-black text-sm">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-400" />
                        {Number(l.loanAmount).toLocaleString()}
                      </div>
                      {l.balanceAmount !== undefined && (
                        <div className={`text-[10px] font-bold mt-1 ${l.balanceAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                           {l.balanceAmount > 0 ? `Unpaid Balance: ₹${l.balanceAmount.toLocaleString()}` : 'Settled Full'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        l.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        l.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                         {l.status === 'Active' ? <Clock className="w-3 h-3" /> : 
                          l.status === 'Overdue' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                         {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {l.status !== 'Closed' && (
                          <button 
                            onClick={() => { setSelectedLoan(l); setIsPaymentModalOpen(true); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-200 shadow-sm bg-white"
                            title="Record Payment"
                          >
                             <Wallet className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteLoan(l.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedLoan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                   <h2 className="text-xl font-black text-gray-900 tracking-tighter">COLLECT PAYMENT</h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Ref: {selectedLoan.id?.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 text-2xl">&times;</button>
             </div>
             
             <form onSubmit={handlePaymentSubmit} className="p-8 space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div>
                         <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Customer</span>
                         <span className="text-sm font-black text-blue-900">{selectedLoan.customerName}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Current Balance</span>
                         <span className="text-sm font-black text-blue-900">₹{(selectedLoan.balanceAmount || selectedLoan.loanAmount).toLocaleString()}</span>
                      </div>
                   </div>

                   <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 px-1">Payment Category</label>
                      <div className="grid grid-cols-3 gap-2">
                         {['Interest', 'Partial', 'Settlement'].map(type => (
                           <button 
                            key={type}
                            type="button"
                            onClick={() => {
                              setPaymentType(type);
                              if (type === 'Settlement') setPaymentAmount(selectedLoan.balanceAmount || selectedLoan.loanAmount);
                            }}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                              paymentType === type ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                            }`}
                           >
                              {type}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 px-1">Amount to Collect</label>
                      <div className="relative">
                        <IndianRupee className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                        <input 
                          required 
                          type="number" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          disabled={paymentType === 'Settlement'}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none text-2xl font-black text-gray-900 shadow-inner bg-gray-50 transition-all"
                        />
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex gap-4">
                   <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                   <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white text-xs font-black uppercase rounded-2xl shadow-[0_10px_20px_rgba(5,150,105,0.3)] hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                     <CheckCircle className="w-4 h-4" /> Confirm Receipt
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Comprehensive Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none tracking-tighter">NEW PLEDGE FORM</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Customer Gold Item Valuation & Loan Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 text-3xl transition-transform hover:rotate-90 duration-200">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Customer & Goal */}
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">1. Select Customer</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      required 
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 outline-none appearance-none bg-white font-bold text-gray-700 shadow-sm transition-all text-sm"
                    >
                      <option value="">Search Customer...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 space-y-4 shadow-inner">
                   <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Valuation Summary</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] text-blue-700 font-bold tracking-tight uppercase">Current Mkt Rate (22K)</span>
                         <span className="text-sm font-black text-blue-900">₹{marketRate}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                         <span className="text-[10px] text-blue-700 font-bold uppercase">Total Items Value</span>
                         <span className="text-lg font-black text-blue-900">₹{totalValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 rounded-lg p-2 mt-2">
                         <span className="text-[9px] font-black uppercase">Max Loan Limit (75%)</span>
                         <span className="text-sm font-black tracking-tight">₹{maxLoanPossible.toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">3. Loan Parameters</label>
                  <div>
                    <span className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-tighter">Principal Loan Amount (₹)</span>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        type="number" 
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        max={maxLoanPossible + 5000}
                        className="w-full pl-10 pr-3 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 outline-none font-black text-gray-900 text-lg shadow-inner bg-gray-50" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-tighter">Interest % (Mo)</span>
                      <input 
                        required 
                        type="number" 
                        step="0.1" 
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 outline-none font-bold text-gray-700 shadow-sm" 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-tighter">Duration (Mo)</span>
                      <input 
                        required 
                        type="number" 
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 outline-none font-bold text-gray-700 shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gold Items */}
              <div className="lg:col-span-8 space-y-6">
                 <div className="flex items-center justify-between border-b pb-4">
                    <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">2. Itemized Pledges</label>
                    <button 
                      type="button" 
                      onClick={addGoldItem}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-tighter hover:bg-blue-100 transition-colors"
                    >
                       <PlusCircle className="w-4 h-4" /> Add Pledged Item
                    </button>
                 </div>

                 <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {goldItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50">
                         <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-inner">
                             <Gem className="w-10 h-10 text-blue-500" />
                         </div>
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Add Customer's Gold to Begin</p>
                      </div>
                    ) : (
                      goldItems.map((item, index) => (
                        <div key={item.id} className="p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all flex flex-col sm:flex-row gap-6 relative group border-l-[6px] border-l-blue-500">
                           <button 
                             type="button" 
                             onClick={() => setGoldItems(goldItems.filter((_, i) => i !== index))}
                             className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>

                           {/* Item Image Upload */}
                           <div className="w-full sm:w-28 h-28 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden group-hover:border-blue-400 shadow-inner">
                             {item.image ? (
                               <img src={item.image} className="w-full h-full object-cover" />
                             ) : (
                               <Camera className="w-8 h-8 text-gray-300" />
                             )}
                             <input 
                               type="file" 
                               accept="image/*" 
                               onChange={(e) => handlePhotoUpload(index, e)}
                               className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                           </div>

                           <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                              <div className="col-span-2 md:col-span-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-2 block">Item Type</span>
                                <select 
                                  value={item.type} 
                                  onChange={(e) => updateGoldItem(index, 'type', e.target.value)}
                                  className="w-full border-b border-gray-200 py-1.5 focus:border-blue-500 outline-none text-sm font-black text-gray-900 bg-transparent transition-colors"
                                >
                                  <option>Chain</option>
                                  <option>Ring</option>
                                  <option>Bracelet</option>
                                  <option>Necklace</option>
                                  <option>Earrings</option>
                                  <option>Coin</option>
                                </select>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-2 block">Weight (g)</span>
                                <input 
                                  required 
                                  type="number" 
                                  value={item.weight}
                                  onChange={(e) => updateGoldItem(index, 'weight', e.target.value)}
                                  className="w-full border-b border-gray-200 py-1.5 focus:border-blue-500 outline-none text-sm font-black text-gray-900 bg-transparent transition-colors"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-2 block">Purity</span>
                                <select 
                                  value={item.purity}
                                  onChange={(e) => updateGoldItem(index, 'purity', e.target.value)}
                                  className="w-full border-b border-gray-200 py-1.5 focus:border-blue-500 outline-none text-sm font-black text-gray-900 bg-transparent transition-colors"
                                >
                                  <option>22K</option>
                                  <option>24K</option>
                                  <option>20K</option>
                                  <option>18K</option>
                                </select>
                              </div>
                              <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter mb-1 block">Item Valuation</span>
                                <div className="text-emerald-700 font-extrabold text-sm">₹{item.valuation.toLocaleString()}</div>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              {/* Submit Row */}
              <div className="lg:col-span-12 pt-10 flex gap-6 items-end justify-end border-t border-gray-100">
                <div className="mr-auto hidden sm:block bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Estimated Full Settlement Cost</span>
                   <div className="text-2xl font-black text-gray-900">₹{Math.round(loanAmount + (loanAmount * (interestRate/100) * duration)).toLocaleString()}</div>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all uppercase tracking-widest">Discard Entry</button>
                <button 
                  type="submit" 
                  disabled={!selectedCustomerId || goldItems.length === 0 || loanAmount <= 0}
                  className="px-10 py-4 rounded-2xl font-black text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-[0_12px_24px_rgba(37,99,235,0.25)] uppercase tracking-[0.2em] hover:scale-105 active:scale-95"
                >
                   Finalize Pledge & Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
