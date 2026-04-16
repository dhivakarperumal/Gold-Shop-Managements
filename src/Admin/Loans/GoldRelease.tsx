import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { useData } from '../../context/DataContext';
import { IndianRupee, CheckCircle, User, ShieldCheck, Gem, Receipt, ArrowLeft, AlertCircle, Camera, CreditCard, Clock } from 'lucide-react';

export function GoldRelease() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, customers } = useData();
  
  const [loan, setLoan] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Release Process State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isThirdParty, setIsThirdParty] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerRelation, setPayerRelation] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [checks, setChecks] = useState({
    receiptVerified: false,
    ornamentMatched: false,
    weightVerified: false
  });

  useEffect(() => {
    if (id && loans.length > 0) {
      const found = loans.find(l => l.id === id);
      if (found) {
        setLoan(found);
        setPaymentAmount(Number(found.balanceAmount || found.loanAmount));
      }
    }
  }, [id, loans]);

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Gem className="w-16 h-16 text-gray-200 mb-4 animate-pulse" />
        <h2 className="text-xl font-black text-gray-900 uppercase">Searching System Cache...</h2>
        <button onClick={() => navigate('/admin/loans')} className="mt-4 text-blue-500 font-bold uppercase text-xs">Back to Loan Manager</button>
      </div>
    );
  }

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% quality
      };
    });
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const amountPaid = Number(paymentAmount);
      let newBalance = Math.max(0, (Number(loan.balanceAmount) || Number(loan.loanAmount)) - amountPaid);
      let newStatus = newBalance === 0 ? 'Closed' : 'Active';
      let newPrincipalPaid = (Number(loan.paidAmount) || 0) + amountPaid;

      // Save Transaction
      const transaction = {
        loanId: loan.id,
        customerId: loan.customerId,
        customerName: loan.customerName,
        amount: amountPaid,
        type: newBalance === 0 ? 'Full Settlement' : 'Partial Payment',
        balance: newBalance,
        date: new Date().toISOString(),
        isThirdParty,
        payerName: isThirdParty ? payerName : loan.customerName,
        payerRelation: isThirdParty ? payerRelation : 'Self',
        idVerified: idNumber,
        idDocument: idImage
      };
      await db.add('payments', transaction);

      // Update Loan
      await db.update('loans', loan.id, {
        balanceAmount: newBalance,
        paidAmount: newPrincipalPaid,
        status: newStatus,
        closedDate: newStatus === 'Closed' ? new Date().toISOString() : null,
        releasedTo: isThirdParty ? payerName : loan.customerName
      });

      // Update Customer Balance
      if (newStatus === 'Closed') {
        const customer = customers.find(c => c.id === loan.customerId);
        if (customer) {
          const currentActive = Number(customer.amountActive || 0);
          await db.update('customers', loan.customerId, {
            amountActive: Math.max(0, currentActive - Number(loan.loanAmount))
          });
        }
      }

      setStep(6); // Success Step
    } catch (error) {
       console.error(error);
       alert('Operation failed. Check system console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/admin/loans')} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Gold Release Gateway</h1>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Loan Ref: #{loan.id?.slice(-8).toUpperCase()} | {loan.customerName}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-12">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`flex-1 h-2 rounded-full transition-all ${step >= s ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-gray-100'}`} />
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-50 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* STEP 1: Verify Metadata */}
        {step === 1 && (
          <div className="p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Step 1: Audit Prep</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Initialize the release audit by verifying document possession.</p>
               </div>
               <Gem className="w-12 h-12 text-blue-500 bg-blue-50 p-3 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer group" onClick={() => setChecks({...checks, receiptVerified: !checks.receiptVerified})}>
                 <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${checks.receiptVerified ? 'bg-blue-600' : 'bg-white shadow-sm border border-gray-100 group-hover:bg-blue-50'}`}>
                    <Receipt className={`w-5 h-5 ${checks.receiptVerified ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                 </div>
                 <h4 className="font-black text-xs text-gray-900 uppercase">Original Receipt</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{checks.receiptVerified ? 'Verified' : 'Required'}</p>
               </div>
               
               <div className="p-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer group" onClick={() => setChecks({...checks, ornamentMatched: !checks.ornamentMatched})}>
                 <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${checks.ornamentMatched ? 'bg-blue-600' : 'bg-white shadow-sm border border-gray-100 group-hover:bg-blue-50'}`}>
                    <Gem className={`w-5 h-5 ${checks.ornamentMatched ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                 </div>
                 <h4 className="font-black text-xs text-gray-900 uppercase">Ornament Match</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{checks.ornamentMatched ? 'Matched' : 'Check Physical'}</p>
               </div>

               <div className="p-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer group" onClick={() => setChecks({...checks, weightVerified: !checks.weightVerified})}>
                 <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${checks.weightVerified ? 'bg-blue-600' : 'bg-white shadow-sm border border-gray-100 group-hover:bg-blue-50'}`}>
                    <ShieldCheck className={`w-5 h-5 ${checks.weightVerified ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                 </div>
                 <h4 className="font-black text-xs text-gray-900 uppercase">Weight Audit</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{checks.weightVerified ? 'Verified' : 'Required'}</p>
               </div>
            </div>

            <button 
              disabled={!checks.receiptVerified || !checks.ornamentMatched || !checks.weightVerified}
              onClick={() => setStep(2)}
              className="w-full py-6 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 transition-all hover:bg-black active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              Confirm Initial Audit
            </button>
          </div>
        )}

        {/* STEP 2: Financial Calculation */}
        {step === 2 && (
          <div className="p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Step 2: Financials</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Evaluate the final settlement amount including interest.</p>
             </div>

             <div className="bg-blue-50/30 rounded-[32px] p-8 border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Principal + Interest</span>
                   <div className="text-5xl font-black text-blue-900 flex items-center tracking-tighter">
                      <IndianRupee className="w-8 h-8 mr-1 text-blue-300" />
                      {(loan.balanceAmount || loan.loanAmount).toLocaleString()}
                   </div>
                </div>

                <div className="text-center md:text-right space-y-2">
                   <div className="px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Rate: {loan.interestRate}% Monthly</div>
                   <div className="text-[10px] text-blue-400 font-bold uppercase">Duration: {Math.ceil((new Date().getTime() - new Date(loan.loanDate).getTime()) / (1000 * 3600 * 24))} Days</div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Settlement Amount Received (₹)</label>
                <div className="relative">
                   <IndianRupee className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                   <input 
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-16 pr-6 py-6 bg-white border-2 border-gray-100 rounded-[24px] focus:border-emerald-500 outline-none text-2xl font-black text-gray-900 shadow-inner"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep(1)} className="py-6 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-3xl transition-all">Previous</button>
                <button 
                  disabled={paymentAmount <= 0}
                  onClick={() => setStep(3)}
                  className="py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-105"
                >
                  Verify Payment
                </button>
             </div>
          </div>
        )}

        {/* STEP 3: Identification */}
        {step === 3 && (
          <div className="p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
             <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Step 3: Identity Check</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Secure identity verification for safe collateral release.</p>
               </div>
               <ShieldCheck className="w-12 h-12 text-emerald-500 bg-emerald-50 p-3 rounded-2xl" />
             </div>

             <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase">Third-Party Redemption?</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Is someone else collecting the gold?</p>
                    </div>
                    <button 
                      onClick={() => setIsThirdParty(!isThirdParty)}
                      className={`w-14 h-8 rounded-full transition-all relative p-1 ${isThirdParty ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${isThirdParty ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {isThirdParty && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Collector Name</label>
                        <input 
                          type="text" 
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Relation to {loan.customerName}</label>
                        <input 
                          type="text" 
                          value={payerRelation}
                          onChange={(e) => setPayerRelation(e.target.value)}
                          placeholder="e.g. Son, Brother"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                        />
                     </div>
                  </div>
                )}

                <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col md:flex-row gap-8 items-center">
                   <div className="w-full md:w-48 aspect-video bg-white rounded-2xl border-2 border-emerald-200 flex flex-col items-center justify-center text-emerald-500 cursor-pointer overflow-hidden relative group" onClick={() => document.getElementById('id-upload')?.click()}>
                      {isCompressing ? (
                         <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : idImage ? (
                        <img src={idImage} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 mb-2" />
                          <span className="text-[9px] font-black uppercase">Capture/Upload ID</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        id="id-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsCompressing(true);
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const compressed = await compressImage(reader.result as string);
                              setIdImage(compressed);
                              setIsCompressing(false);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                   </div>
                   <div className="flex-1 w-full">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Government ID Number</label>
                      <input 
                        type="text" 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="AADHAR / PAN / VOTER ID"
                        className="w-full bg-transparent border-b-2 border-emerald-200/50 focus:border-emerald-500 outline-none py-2 text-xl font-black text-emerald-900 tracking-widest"
                      />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep(2)} className="py-6 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-3xl transition-all">Previous</button>
                <button 
                  disabled={!idNumber || !idImage || (isThirdParty && (!payerName || !payerRelation))}
                  onClick={() => setStep(4)}
                  className="py-6 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                >
                  Confirm KYC & Document
                </button>
             </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Step 4: Final Review</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Verify all details before finalizing the system closure.</p>
             </div>

             <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 rounded-3xl">
                     <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Customer Profile</span>
                     <p className="text-sm font-black text-gray-900 uppercase leading-none">{loan.customerName}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl">
                     <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Release Protocol</span>
                     <p className="text-sm font-black text-blue-600 uppercase leading-none">{isThirdParty ? 'Third Party' : 'Primary Owner'}</p>
                  </div>
                </div>
                
                <div className="p-8 bg-blue-600 rounded-[32px] text-white flex justify-between items-center shadow-2xl shadow-blue-200">
                   <div>
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Settlement Collection</span>
                      <div className="text-4xl font-black flex items-center">
                         <IndianRupee className="w-6 h-6 mr-1" />
                         {paymentAmount.toLocaleString()}
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Remaining Balance</span>
                      <div className="text-xl font-black opacity-60">₹{Math.max(0, (loan.balanceAmount || loan.loanAmount) - paymentAmount).toLocaleString()}</div>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                <p className="text-[11px] font-bold text-amber-900 leading-relaxed uppercase">
                  By clicking "Finalize Release", I confirm that the gold ornaments have been physically handed over to the collector after successfully receiving the full repayment amount.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setStep(3)} className="py-6 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-3xl transition-all">Go Back</button>
                <button 
                  onClick={handleFinalize}
                  className="py-6 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-300 transition-all hover:bg-black group"
                >
                  Finalize Release <CheckCircle className="w-4 h-4 inline-block ml-2 group-hover:scale-125 transition-all" />
                </button>
             </div>
          </div>
        )}

        {/* STEP 6: Success */}
        {step === 6 && (
           <div className="p-20 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
              <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 relative">
                 <CheckCircle className="w-20 h-20 text-emerald-600 animate-in bounce-in" />
                 <div className="absolute inset-0 rounded-full border-4 border-emerald-600 animate-ping opacity-20" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-4">Collateral Released</h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] max-w-sm">Loan #{loan.id?.slice(-8).toUpperCase()} has been successfully closed and ornaments returned.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-md">
                 <button onClick={() => navigate('/admin/payments')} className="py-4 bg-gray-50 text-xs font-black text-gray-600 uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-white transition-all">View Receipt</button>
                 <button onClick={() => navigate('/admin/loans')} className="py-4 bg-blue-600 text-xs font-black text-white uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Back to Home</button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
