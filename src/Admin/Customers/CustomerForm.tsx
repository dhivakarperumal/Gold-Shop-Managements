import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/db';
import { 
  User, Phone, Mail, CreditCard, MapPin, Briefcase, 
  Users, Save, X, Camera, ShieldCheck, ChevronRight,
  Landmark, Info, FileText, Smartphone
} from 'lucide-react';

export function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    customerId: '',
    name: '',
    mobile: '',
    altPhone: '',
    email: '',
    aadharNo: '',
    panNo: '',
    voterId: '',
    kycStatus: 'Pending',
    permanentAddress: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    occupation: '',
    companyName: '',
    monthlyIncome: '',
    businessType: '',
    bankAccountNo: '',
    ifscCode: '',
    fatherSpouseName: '',
    nomineeName: '',
    nomineeRelation: '',
    emergencyContactNo: '',
    referenceName: '',
    referenceMobile: '',
    customerPhoto: '',
    aadharFront: '',
    aadharBack: '',
    panPhoto: '',
    amountActive: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const customers = await db.get('customers');
        const customer = customers.find((c: any) => c.id === id);
        if (customer) {
          setFormData(customer);
        }
      } else {
        // Generate Customer ID for new entries
        const customers = await db.get('customers');
        const nextId = (customers.length + 1).toString().padStart(4, '0');
        setFormData((prev: any) => ({ ...prev, customerId: `CUST-${nextId}` }));
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await db.update('customers', id, formData);
      } else {
        await db.add('customers', formData);
      }
      navigate('/admin/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
    { id: 'kyc', label: 'KYC Details', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
    { id: 'financial', label: 'Financial', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'family', label: 'Reference', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {id ? 'EDIT CUSTOMER PROFILE' : 'NEW CUSTOMER ONBOARDING'}
          </h1>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">
             Customer Management &bull; Full Feature Design
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/customers')}
          className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Sidebar */}
        <div className="md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2' 
                  : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <form onSubmit={handleSubmit} className="p-8 flex-1">
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Customer ID</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="text" 
                        name="customerId" 
                        value={formData.customerId} 
                        readOnly 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 focus:border-blue-500 outline-none transition-all shadow-inner bg-gray-50/30" 
                        placeholder="Ex: John Doe" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        type="tel" 
                        name="mobile" 
                        value={formData.mobile} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 focus:border-blue-500 outline-none shadow-inner bg-gray-50/30" 
                        placeholder="Primary Number" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Alternate Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="tel" 
                        name="altPhone" 
                        value={formData.altPhone} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:border-blue-500 outline-none shadow-inner bg-gray-50/30" 
                        placeholder="Optional" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:border-blue-500 outline-none shadow-inner bg-gray-50/30" 
                        placeholder="example@email.com (Optional)" 
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="pt-6 border-t border-gray-50">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 block mb-4">Customer profile photo</span>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-all shadow-inner">
                      {formData.customerPhoto ? (
                        <img src={formData.customerPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-gray-300" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoUpload(e, 'customerPhoto')} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Upload Headshot</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">Clear photo for identity verification. <br/> Supported: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Aadhaar Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        type="text" 
                        name="aadharNo" 
                        value={formData.aadharNo} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 outline-none bg-gray-50/30" 
                        placeholder="12-digit number" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">PAN Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        type="text" 
                        name="panNo" 
                        value={formData.panNo} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 outline-none bg-gray-50/30 uppercase" 
                        placeholder="ABCDE1234F" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Voter ID / Driving License</label>
                    <input 
                      type="text" 
                      name="voterId" 
                      value={formData.voterId} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 outline-none bg-gray-50/30" 
                      placeholder="Optional ID" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">KYC Status</label>
                    <select 
                      name="kycStatus" 
                      value={formData.kycStatus} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-900 outline-none bg-gray-50/30 appearance-none"
                    >
                      <option value="Pending">🕒 PENDING</option>
                      <option value="Verified">✅ VERIFIED</option>
                      <option value="Rejected">❌ REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                  {[
                    { key: 'aadharFront', label: 'AADHAAR FRONT' },
                    { key: 'aadharBack', label: 'AADHAAR BACK' },
                    { key: 'panPhoto', label: 'PAN CARD PHOTO' }
                  ].map(doc => (
                    <div key={doc.key} className="space-y-3">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">{doc.label}</span>
                       <div className="h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-all">
                          {formData[doc.key] ? (
                            <img src={formData[doc.key]} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-8 h-8 text-gray-200" />
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handlePhotoUpload(e, doc.key)} 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Permanent Residential Address</label>
                    <textarea 
                      required 
                      name="permanentAddress" 
                      rows={2} 
                      value={formData.permanentAddress} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-700 outline-none bg-gray-50/30" 
                      placeholder="Street, Area, Building Name..."
                    ></textarea>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Current Address</label>
                    <textarea 
                      required 
                      name="currentAddress" 
                      rows={2} 
                      value={formData.currentAddress} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-700 outline-none bg-gray-50/30" 
                      placeholder="Same as permanent or different..."
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="000 000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Landmark</label>
                    <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Near Temple / Mall" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Occupation</label>
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Software Engineer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Company / Workplace</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="TCS / Private Business" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Monthly Income (₹)</label>
                      <div className="relative">
                        <Info className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="50000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Business type</label>
                      <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Wholesale / Retail (If self-emp)" />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                       <Landmark className="w-4 h-4" /> Bank Account Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Account Number</label>
                          <input type="text" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-mono font-bold text-gray-600" placeholder="XXXX XXXX XXXX" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">IFSC Code</label>
                          <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-mono font-bold text-gray-600" placeholder="SBIN0001234" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Father / Spouse Name</label>
                      <input type="text" name="fatherSpouseName" value={formData.fatherSpouseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Guardian Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nominee Name</label>
                      <input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Full Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nominee Relation</label>
                      <input type="text" name="nomineeRelation" value={formData.nomineeRelation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Spouse / Son / Friend" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Emergency contact (2nd Mobile)</label>
                      <input type="tel" name="emergencyContactNo" value={formData.emergencyContactNo} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-black text-gray-800" placeholder="Second Number" />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                       <Users className="w-4 h-4" /> Personal Reference
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Reference Person Name</label>
                          <input type="text" name="referenceName" value={formData.referenceName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-bold text-gray-700" placeholder="Friend / Business Partner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Reference Mobile</label>
                          <input type="tel" name="referenceMobile" value={formData.referenceMobile} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50/30 border-2 border-gray-100 rounded-xl font-bold text-gray-700" placeholder="Mobile Number" />
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </form>

          {/* Sticky Action Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => navigate('/admin/customers')}
              className="px-6 py-3 rounded-2xl font-black text-[11px] text-gray-400 uppercase tracking-[0.2em] hover:bg-white hover:text-gray-600 transition-all border border-transparent hover:border-gray-200"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.mobile || !formData.aadharNo}
              className="px-10 py-3 rounded-2xl font-black text-[11px] text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-[0_12px_24px_rgba(37,99,235,0.25)] uppercase tracking-[0.2em] flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {id ? 'UPDATE CUSTOMER RECORD' : 'SAVE NEW CUSTOMER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
