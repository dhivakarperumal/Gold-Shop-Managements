import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { 
  User, Search, Gem, IndianRupee, Percent, Calculator, 
  Calendar, ShieldCheck, Plus, Trash2, Camera, Info, 
  ChevronRight, ChevronLeft, CheckCircle, FileText, Wallet
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Loan Data
  const [loanData, setLoanData] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    goldItems: [] as GoldItem[],
    marketRate: 6500, // Default market rate
    ltv: 75, // Loan to Value default
    loanAmount: 0,
    interestRate: 2.0, // Monthly rate
    interestType: 'Simple',
    duration: 12, // Months
    processingFee: 0,
    valuationCharges: 0,
    gst: 0,
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active'
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.get('customers');
      setCustomers(data);
    };
    fetchData();
  }, []);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
          newItem.valuation = Math.round(newItem.weight * newItem.rate * purityMult);
          return newItem;
        }
        return item;
      });
      return { ...prev, goldItems };
    });
  };

  const totalValuation = loanData.goldItems.reduce((acc, item) => acc + item.valuation, 0);
  const maxLoanAmt = Math.round(totalValuation * (loanData.ltv / 100));

  useEffect(() => {
     setLoanData(prev => ({ ...prev, loanAmount: Math.min(prev.loanAmount, maxLoanAmt) || maxLoanAmt }));
  }, [totalValuation, loanData.ltv]);

  // Interest Calculations
  const calculateTotalPayable = () => {
     const { loanAmount, interestRate, duration, interestType } = loanData;
     let totalInterest = 0;

     if (interestType === 'Simple' || interestType === 'Bullet') {
        totalInterest = (loanAmount * (interestRate / 100) * duration);
     } else if (interestType === 'Monthly Flat') {
        totalInterest = (loanAmount * (interestRate / 100) * duration);
     } else if (interestType === 'Reducing') {
        // Reducing balance logic
        let balance = loanAmount;
        for (let i = 0; i < duration; i++) {
           totalInterest += (balance * (interestRate / 100));
           balance -= (loanAmount / duration);
        }
     } else if (interestType === 'Compound') {
        totalInterest = loanAmount * Math.pow((1 + (interestRate / 100)), duration) - loanAmount;
     }

     const totalCharges = Number(loanData.processingFee) + Number(loanData.valuationCharges) + Number(loanData.gst);
     return {
        interestAmount: Math.round(totalInterest),
        charges: totalCharges,
        total: Math.round(loanAmount + totalInterest + totalCharges)
     };
  };

  const totals = calculateTotalPayable();

  const handleDisburse = async () => {
    setLoading(true);
    try {
      const finalLoan = {
        ...loanData,
        ...totals,
        balanceAmount: loanData.loanAmount,
        paidAmount: 0,
        createdAt: new Date().toISOString()
      };
      await db.add('loans', finalLoan);
      
      // Update customer exposure
      const customer = customers.find(c => c.id === loanData.customerId);
      if (customer) {
        await db.update('customers', customer.id, {
          amountActive: (customer.amountActive || 0) + loanData.loanAmount
        });
      }
      
      navigate('/admin/loans');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile?.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Advanced Pledge Onboarding</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2 border-l-2 border-blue-500 pl-3">Step {currentStep} of 4: {['Customer Identification', 'Asset Valuation', 'Financial Terms', 'Verification & Summary'][currentStep - 1]}</p>
           </div>
           
           <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(step => (
                <div 
                  key={step} 
                  className={`w-10 h-1.5 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-blue-600 w-16' : step < currentStep ? 'bg-emerald-500' : 'bg-gray-100'}`} 
                />
              ))}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col transition-all">
        <div className="flex-1 p-8 md:p-12">
          
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
               <div className="max-w-xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                     <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto shadow-inner">
                        <User className="w-8 h-8" />
                     </div>
                     <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Identify Customer</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select an existing customer or go back to register a new one.</p>
                  </div>

                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search by Name, Mobile or Aadhaar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-3xl font-bold text-gray-700 outline-none focus:border-blue-500 shadow-inner transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {filteredCustomers.length === 0 ? (
                       <div className="text-center py-10 text-gray-400 font-black uppercase text-[10px]">No matches found</div>
                     ) : (
                       filteredCustomers.map(c => (
                         <div 
                           key={c.id} 
                           onClick={() => setLoanData(prev => ({ ...prev, customerId: c.id, customerName: c.name, customerMobile: c.mobile }))}
                           className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${loanData.customerId === c.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-white hover:border-blue-200'}`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${loanData.customerId === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                  {c.name?.[0].toUpperCase()}
                               </div>
                               <div>
                                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-tight">{c.name}</h3>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.mobile}</p>
                               </div>
                            </div>
                            {loanData.customerId === c.id && <CheckCircle className="w-6 h-6 text-blue-600" />}
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* Step 2: Gold Details */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
               <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Gem className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase">Collateral Assessment</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Weight, Purity & Verification Photo</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Market Rate (22K)</p>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">₹</span>
                        <input 
                          type="number" 
                          value={loanData.marketRate}
                          onChange={(e) => setLoanData(prev => ({ ...prev, marketRate: Number(e.target.value) }))}
                          className="w-20 bg-transparent text-lg font-black text-gray-900 focus:outline-none border-b-2 border-gray-200"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  {loanData.goldItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/30">
                       <Plus className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Start By Adding a Gold Item</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                       {loanData.goldItems.map((item, index) => (
                         <div key={item.id} className="p-8 bg-white border-2 border-gray-100 rounded-[32px] flex flex-col md:flex-row gap-8 relative hover:border-blue-100 transition-all shadow-sm">
                            <button 
                              onClick={() => removeGoldItem(item.id)}
                              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                            
                            <div className="w-full md:w-32 h-32 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden group">
                               {item.photo ? (
                                 <img src={item.photo} className="w-full h-full object-cover" />
                               ) : (
                                 <Camera className="w-8 h-8 text-gray-300" />
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

                            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Item Category</label>
                                  <select 
                                    value={item.type} 
                                    onChange={(e) => updateGoldItem(item.id, { type: e.target.value })}
                                    className="w-full border-b-2 border-gray-100 py-1.5 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 uppercase text-xs"
                                  >
                                     {['Jewelry', 'Coin', 'Bar'].map(t => <option key={t}>{t}</option>)}
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gross Weight (G)</label>
                                  <input 
                                    type="number" 
                                    value={item.weight}
                                    onChange={(e) => updateGoldItem(item.id, { weight: Number(e.target.value) })}
                                    className="w-full border-b-2 border-gray-100 py-1.5 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 text-lg"
                                    placeholder="0.00"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Purity (K)</label>
                                  <select 
                                    value={item.purity} 
                                    onChange={(e) => updateGoldItem(item.id, { purity: e.target.value })}
                                    className="w-full border-b-2 border-gray-100 py-1.5 focus:border-blue-500 outline-none bg-transparent font-black text-gray-900 uppercase text-xs"
                                  >
                                     {['24K', '22K', '20K', '18K'].map(k => <option key={k}>{k}</option>)}
                                  </select>
                               </div>
                               <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                  <span className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Item Valuation</span>
                                  <div className="text-emerald-700 font-extrabold text-lg">₹{item.valuation.toLocaleString()}</div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                  <button 
                    onClick={addGoldItem}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl hover:bg-gray-50 transition-all font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner"
                  >
                     <Plus className="w-4 h-4" /> Add Next Object
                  </button>
               </div>
            </div>
          )}

          {/* Step 3: Financial Terms */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left: Input Fields */}
                  <div className="lg:col-span-2 space-y-10">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
                           <Calculator className="w-5 h-5 text-blue-600" />
                           <h3 className="text-sm font-black text-gray-900 uppercase">Loan Parameters</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                                Loan-to-Value (LTV) <span>{loanData.ltv}%</span>
                             </label>
                             <input 
                              type="range" 
                              min="10" max="90" 
                              value={loanData.ltv} 
                              onChange={(e) => setLoanData(prev => ({ ...prev, ltv: Number(e.target.value) }))}
                              className="w-full accent-blue-600" 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Interest Category</label>
                             <select 
                              value={loanData.interestType}
                              onChange={(e) => setLoanData(prev => ({ ...prev, interestType: e.target.value }))}
                              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 shadow-inner"
                             >
                                <option value="Simple">Simple Interest</option>
                                <option value="Monthly Flat">Monthly Flat Interest</option>
                                <option value="Reducing">Reducing Balance</option>
                                <option value="Bullet">Bullet Interest</option>
                                <option value="Compound">Compound Interest</option>
                             </select>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Principal Disbursed (₹)</label>
                             <input 
                              type="number" 
                              value={loanData.loanAmount}
                              onChange={(e) => setLoanData(prev => ({ ...prev, loanAmount: Number(e.target.value) }))}
                              max={maxLoanAmt}
                              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 text-2xl shadow-inner"
                             />
                             <p className="text-[9px] font-bold text-emerald-500 tracking-wider">MAX POSSIBLE: ₹{maxLoanAmt.toLocaleString()}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Monthly %</label>
                                <input 
                                  type="number" step="0.1" 
                                  value={loanData.interestRate}
                                  onChange={(e) => setLoanData(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 shadow-inner"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Period (Mo)</label>
                                <input 
                                  type="number" 
                                  value={loanData.duration}
                                  onChange={(e) => setLoanData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-blue-500 shadow-inner"
                                />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
                           <Percent className="w-5 h-5 text-emerald-500" />
                           <h3 className="text-sm font-black text-gray-900 uppercase">Service Charges & GST</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Processing</label>
                             <input type="number" value={loanData.processingFee} onChange={(e) => setLoanData(prev => ({ ...prev, processingFee: Number(e.target.value) }))} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none shadow-inner" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Valuation</label>
                             <input type="number" value={loanData.valuationCharges} onChange={(e) => setLoanData(prev => ({ ...prev, valuationCharges: Number(e.target.value) }))} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none shadow-inner" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Tax (GST)</label>
                             <input type="number" value={loanData.gst} onChange={(e) => setLoanData(prev => ({ ...prev, gst: Number(e.target.value) }))} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 outline-none shadow-inner" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right: Summary Card */}
                  <div className="lg:col-span-1">
                     <div className="bg-gray-900 rounded-[32px] p-8 text-white sticky top-12 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">Payable Projection</h4>
                        
                        <div className="space-y-6">
                           <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-xs font-bold text-white/50 uppercase">Principal Loan</span>
                              <span className="text-sm font-black">₹{loanData.loanAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-xs font-bold text-white/50 uppercase">Calculated Interest</span>
                              <span className="text-sm font-black text-amber-400">₹{totals.interestAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-xs font-bold text-white/50 uppercase">Service Fees</span>
                              <span className="text-sm font-black">₹{totals.charges.toLocaleString()}</span>
                           </div>
                           
                           <div className="pt-8">
                              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Total Redemption Amount</p>
                              <div className="text-4xl font-black text-blue-400 tracking-tighter">₹{totals.total.toLocaleString()}</div>
                              <p className="text-[10px] font-bold text-white/40 mt-6 leading-relaxed italic">*Projection based on {loanData.duration} months tenure with {loanData.interestType} model.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Step 4: Summary & Verify */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12">
               <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                     <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Review & Confirm</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Verify all information before final disbursement</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Information
                     </h4>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Account Holder</p>
                           <p className="font-bold text-gray-900">{loanData.customerName}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Mobile Access</p>
                           <p className="font-bold text-gray-900">{loanData.customerMobile}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6">
                     <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                        <Gem className="w-4 h-4" /> Asset Statistics
                     </h4>
                     <div className="grid grid-cols-3 gap-6">
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Quantity</p>
                           <p className="font-bold text-gray-900">{loanData.goldItems.length} Objects</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Weight</p>
                           <p className="font-bold text-gray-900">{loanData.goldItems.reduce((acc, i) => acc + i.weight, 0).toFixed(2)}g</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Net Value</p>
                           <p className="font-bold text-gray-900">₹{totalValuation.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6 md:col-span-2">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Loan agreement Summary
                     </h4>
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Principal Amount</p>
                           <p className="text-xl font-black text-gray-900">₹{loanData.loanAmount.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Monthly Interest</p>
                           <p className="font-black text-amber-600 italic">@ {loanData.interestRate}% ({loanData.interestType})</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tenure Period</p>
                           <p className="font-bold text-gray-900">{loanData.duration} Months</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Repayment Date</p>
                           <p className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">{new Date(loanData.dueDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-blue-600 rounded-[32px] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <Calculator className="w-8 h-8" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Disbursed Balance</p>
                        <h3 className="text-4xl font-black tracking-tighter">₹{(loanData.loanAmount - totals.charges).toLocaleString()}</h3>
                        <p className="text-[10px] font-bold opacity-60 mt-1">₹{totals.charges.toLocaleString()} deducted for service & GST fees</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={prevStep}
                        className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/20"
                     >
                        Edit Details
                     </button>
                     <button 
                        onClick={handleDisburse}
                        disabled={loading}
                        className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                     >
                        {loading ? <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /> : <Wallet className="w-5 h-5" />}
                        Confirm & Disburse Funds
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep < 4 && (
          <div className="p-8 border-t border-gray-100 flex justify-between bg-gray-50/50">
            <button 
              onClick={() => currentStep === 1 ? navigate('/admin/loans') : prevStep()}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[11px] text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentStep === 1 ? 'Discard Entry' : 'Previous Step'}
            </button>
            <button 
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !loanData.customerId) || 
                (currentStep === 2 && loanData.goldItems.length === 0) ||
                (currentStep === 3 && loanData.loanAmount <= 0)
              }
              className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
