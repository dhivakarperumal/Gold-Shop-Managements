import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { 
  User, Search, Gem, IndianRupee, Percent, Calculator, 
  Calendar, ShieldCheck, Plus, Trash2, Camera, Info, 
  CheckCircle, FileText, Wallet
} from 'lucide-react';
import { useData } from '../../context/DataContext';

type GoldItem = {
  id: string;
  type: string;
  weight: number;
  purity: string;
  rate: number;
  valuation: number;
  photo?: string;
};

export function LoanForm() {
  const navigate = useNavigate();
  const { customers } = useData();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Loan Data
  const [loanData, setLoanData] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    goldItems: [] as GoldItem[],
    marketRate: 6500,
    ltv: 75,
    loanAmount: 0,
    interestRate: 2.0,
    interestType: 'Simple',
    duration: 12,
    processingFee: 0,
    valuationCharges: 0,
    gst: 0,
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active'
  });

  const addGoldItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Jewelry',
      weight: 0,
      purity: '22K',
      rate: loanData.marketRate,
      valuation: 0
    };
    setLoanData(prev => ({ ...prev, goldItems: [...prev.goldItems, newItem] }));
  };

  const removeGoldItem = (id: string) => {
    setLoanData(prev => ({
      ...prev,
      goldItems: prev.goldItems.filter(item => item.id !== id)
    }));
  };

  const updateGoldItem = (id: string, updates: Partial<GoldItem>) => {
    setLoanData(prev => {
      const goldItems = prev.goldItems.map(item => {
        if (item.id === id) {
          const newItem = { ...item, ...updates };
          const purityMult = newItem.purity === '24K' ? 1 
                          : newItem.purity === '22K' ? 0.92 
                          : newItem.purity === '20K' ? 0.83 : 0.75;
          newItem.valuation = Math.round((newItem.weight || 0) * (newItem.rate || 0) * purityMult);
          return newItem;
        }
        return item;
      });
      return { ...prev, goldItems };
    });
  };

  const totalValuation = loanData.goldItems.reduce((acc, item) => acc + (item.valuation || 0), 0);
  const maxLoanAmt = Math.round(totalValuation * (loanData.ltv / 100));

  useEffect(() => {
     setLoanData(prev => ({ ...prev, loanAmount: Math.min(prev.loanAmount, maxLoanAmt) || maxLoanAmt }));
  }, [totalValuation, loanData.ltv]);

  const calculateTotalPayable = () => {
     const { loanAmount, interestRate, duration, interestType } = loanData;
     let totalInterest = 0;

     const principal = Number(loanAmount) || 0;
     const rate = Number(interestRate) || 0;
     const tenure = Number(duration) || 0;

     if (interestType === 'Simple' || interestType === 'Bullet' || interestType === 'Monthly Flat') {
        totalInterest = (principal * (rate / 100) * tenure);
     } else if (interestType === 'Reducing') {
        let balance = principal;
        for (let i = 0; i < tenure; i++) {
           totalInterest += (balance * (rate / 100));
           balance -= (principal / tenure);
        }
     } else if (interestType === 'Compound') {
        totalInterest = principal * Math.pow((1 + (rate / 100)), tenure) - principal;
     }

     const totalCharges = Number(loanData.processingFee) + Number(loanData.valuationCharges) + Number(loanData.gst);
     return {
        interestAmount: Math.round(totalInterest),
        charges: totalCharges,
        total: Math.round(principal + totalInterest + totalCharges)
     };
  };

  const totals = calculateTotalPayable();

  const handleDisburse = async () => {
    if (!loanData.customerId) return alert('Please select a customer first.');
    if (loanData.goldItems.length === 0) return alert('Please add at least one gold item.');
    if (loanData.loanAmount <= 0) return alert('Loan amount must be greater than zero.');

    setLoading(true);
    try {
      // CLEAN DATA: Firebase doesn't like undefined or special objects in arrays
      const cleanedGoldItems = loanData.goldItems.map(item => ({
        id: item.id || '',
        type: item.type || '',
        weight: Number(item.weight) || 0,
        purity: item.purity || '',
        rate: Number(item.rate) || 0,
        valuation: Number(item.valuation) || 0,
        photo: item.photo || '' // Ensure no undefined
      }));

      const finalLoan = {
        customerId: loanData.customerId,
        customerName: loanData.customerName,
        customerMobile: loanData.customerMobile,
        goldItems: cleanedGoldItems,
        loanAmount: Number(loanData.loanAmount),
        interestRate: Number(loanData.interestRate),
        interestType: loanData.interestType,
        duration: Number(loanData.duration),
        processingFee: Number(loanData.processingFee),
        valuationCharges: Number(loanData.valuationCharges),
        gst: Number(loanData.gst),
        loanDate: loanData.loanDate,
        dueDate: loanData.dueDate,
        status: loanData.status,
        interestAmount: totals.interestAmount,
        charges: totals.charges,
        totalPayable: totals.total,
        balanceAmount: Number(loanData.loanAmount),
        paidAmount: 0,
        interestPaid: 0,
      };

      await db.add('loans', finalLoan);
      
      const customer = customers.find(c => c.id === loanData.customerId);
      if (customer) {
        await db.update('customers', customer.id, {
          amountActive: (Number(customer.amountActive) || 0) + Number(loanData.loanAmount)
        });
      }
      
      navigate('/admin/loans');
    } catch (e: any) {
      console.error("Disbursement Error:", e);
      alert(`Error during disbursement: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile?.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">New Pledge Entry</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest border-l-4 border-blue-600 pl-4">Single-Page Onboarding • Direct Fund Disbursement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Customer Identification */}
          <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Customer Identification</h2>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search existing customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
               {filteredCustomers.map(c => (
                 <div 
                   key={c.id} 
                   onClick={() => setLoanData(prev => ({ ...prev, customerId: c.id, customerName: c.name, customerMobile: c.mobile }))}
                   className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${loanData.customerId === c.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-white hover:border-blue-200'}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${loanData.customerId === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {c.name?.[0].toUpperCase()}
                       </div>
                       <div>
                          <h3 className="font-black text-gray-900 uppercase text-[11px] tracking-tight">{c.name}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{c.mobile}</p>
                       </div>
                    </div>
                    {loanData.customerId === c.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                 </div>
               ))}
            </div>
          </section>

          {/* Section 2: Gold Assets */}
          <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                  <Gem className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Asset Valuation</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Rate /g</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-gray-400">₹</span>
                  <input 
                    type="number" 
                    value={loanData.marketRate}
                    onChange={(e) => setLoanData(prev => ({ ...prev, marketRate: Number(e.target.value) }))}
                    className="w-20 bg-transparent text-lg font-black text-gray-900 focus:outline-none border-b-2 border-gray-100 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loanData.goldItems.map((item) => (
                <div key={item.id} className="p-6 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] flex flex-col md:flex-row gap-6 relative group hover:border-blue-100 transition-all">
                  <button 
                    onClick={() => removeGoldItem(item.id)}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="w-24 h-24 rounded-2xl bg-white flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden group">
                     {item.photo ? (
                       <img src={item.photo} className="w-full h-full object-cover" />
                     ) : (
                       <Camera className="w-6 h-6 text-gray-300" />
                     )}
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="absolute inset-0 opacity-0 cursor-pointer"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => updateGoldItem(item.id, { photo: reader.result as string });
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                  </div>

                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Type</label>
                        <select 
                          value={item.type} 
                          onChange={(e) => updateGoldItem(item.id, { type: e.target.value })}
                          className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 uppercase text-[11px]"
                        >
                           {['Jewelry', 'Coin', 'Bar'].map(t => <option key={t}>{t}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Weight (g)</label>
                        <input 
                          type="number" 
                          value={item.weight}
                          onChange={(e) => updateGoldItem(item.id, { weight: Number(e.target.value) })}
                          className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 text-sm"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Purity</label>
                        <select 
                          value={item.purity} 
                          onChange={(e) => updateGoldItem(item.id, { purity: e.target.value })}
                          className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 uppercase text-[11px]"
                        >
                           {['24K', '22K', '20K', '18K'].map(k => <option key={k}>{k}</option>)}
                        </select>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Value</div>
                        <div className="text-emerald-600 font-black text-lg">₹{item.valuation?.toLocaleString()}</div>
                     </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addGoldItem}
                className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                 <Plus className="w-5 h-5" /> Add Gold Asset
              </button>
            </div>
          </section>

          {/* Section 3: Financial Terms */}
          <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Loan Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                       LTV (Loan-to-Value) <span>{loanData.ltv}%</span>
                    </label>
                    <input 
                      type="range" min="10" max="90" value={loanData.ltv} 
                      onChange={(e) => setLoanData(prev => ({ ...prev, ltv: Number(e.target.value) }))}
                      className="w-full accent-blue-600" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Principal (₹)</label>
                        <input 
                          type="number" value={loanData.loanAmount}
                          onChange={(e) => setLoanData(prev => ({ ...prev, loanAmount: Number(e.target.value) }))}
                          max={maxLoanAmt}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        />
                        <p className="text-[9px] font-bold text-emerald-500">MAX: ₹{maxLoanAmt.toLocaleString()}</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Interest Rate (%)</label>
                        <input 
                          type="number" step="0.1" value={loanData.interestRate}
                          onChange={(e) => setLoanData(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Tenure (Months)</label>
                    <input 
                      type="number" value={loanData.duration}
                      onChange={(e) => setLoanData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Interest Calculation Model</label>
                    <select 
                      value={loanData.interestType}
                      onChange={(e) => setLoanData(prev => ({ ...prev, interestType: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    >
                       <option value="Simple">Simple Interest</option>
                       <option value="Monthly Flat">Monthly Flat</option>
                       <option value="Reducing">Reducing Balance</option>
                       <option value="Bullet">Bullet Interest</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing Fee</label>
                  <input type="number" value={loanData.processingFee} onChange={(e) => setLoanData(prev => ({ ...prev, processingFee: Number(e.target.value) }))} className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valuation Charges</label>
                  <input type="number" value={loanData.valuationCharges} onChange={(e) => setLoanData(prev => ({ ...prev, valuationCharges: Number(e.target.value) }))} className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tax (GST)</label>
                  <input type="number" value={loanData.gst} onChange={(e) => setLoanData(prev => ({ ...prev, gst: Number(e.target.value) }))} className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700 outline-none" />
               </div>
            </div>
          </section>
        </div>

        {/* Floating Summary Sidebar */}
        <div className="lg:col-span-4 sticky top-8 space-y-6">
           <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              
              <div className="space-y-8 relative z-10">
                 <div className="pb-6 border-b border-white/10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Summary Breakdown</p>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-white/50 font-bold uppercase">Principal</span>
                          <span className="font-black">₹{Number(loanData.loanAmount).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-white/50 font-bold uppercase">Proj. Interest</span>
                          <span className="font-black text-amber-400">₹{totals.interestAmount.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-white/50 font-bold uppercase">Service Fees</span>
                          <span className="font-black">₹{totals.charges.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Payback Amount</p>
                    <div className="text-5xl font-black text-blue-400 tracking-tighter">₹{totals.total.toLocaleString()}</div>
                 </div>

                 <div className="pt-2">
                    <p className="text-[9px] font-black text-white/50 uppercase mb-4 tracking-widest">Selected Client</p>
                    {loanData.customerName ? (
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                         <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-xs">{loanData.customerName[0]}</div>
                         <div className="truncate">
                            <p className="text-xs font-black uppercase text-white truncate">{loanData.customerName}</p>
                            <p className="text-[10px] font-bold text-white/40">{loanData.customerMobile}</p>
                         </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400 font-black italic">Select Customer...</p>
                    )}
                 </div>

                 <button 
                  onClick={handleDisburse}
                  disabled={loading}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/50 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                 >
                    {loading ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Complete Pledge
                      </>
                    )}
                 </button>
                 
                 <div className="text-center">
                    <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed">By clicking disburse, you authorize the dynamic creation of a new loan ledger in the system.</p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="text-[11px] font-black text-gray-900 uppercase">System Authorized</h4>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Verified Against Indian Gold Policy</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
