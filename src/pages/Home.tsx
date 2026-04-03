import { Link } from 'react-router-dom';
import { IndianRupee, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
              Smarter <span className="text-[#1b88f3]">Gold Loan</span> Management.
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium">
               Track your collections, manage installment calendars, and secure your gold business with a unified platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to={user ? "/dashboard" : "/register"} className="bg-[#1b88f3] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all font-sans">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="relative group perspective-1000 hidden lg:block">
            <div className="bg-gradient-to-tr from-[#1b88f3] to-blue-400 rounded-3xl p-12 transform rotate-3 shadow-2xl transition-transform hover:rotate-0 duration-500">
               <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-inner space-y-6">
                 <div className="h-4 w-3/4 bg-gray-200 rounded-full"></div>
                 <div className="h-4 w-1/2 bg-gray-200 rounded-full"></div>
                 <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="h-20 bg-[#1b88f3]/20 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-emerald-100 rounded-lg animate-pulse delay-75"></div>
                    <div className="h-20 bg-orange-100 rounded-lg animate-pulse delay-150"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid md:grid-cols-3 gap-8 mt-40">
           <div className="p-8 bg-gray-50 rounded-2xl space-y-4 hover:bg-[#1b88f3]/5 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b88f3] group-hover:scale-110 transition-transform">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Total Transparency</h3>
              <p className="text-gray-600 font-medium">Real-time calculations for all your gold loans and installment collections.</p>
           </div>
           
           <div className="p-8 bg-gray-50 rounded-2xl space-y-4 hover:bg-[#1b88f3]/5 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enterprise Security</h3>
              <p className="text-gray-600 font-medium">Secure your user data with Firebase-level protection and role-based access.</p>
           </div>
           
           <div className="p-8 bg-gray-50 rounded-2xl space-y-4 hover:bg-[#1b88f3]/5 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Scheduled Actions</h3>
              <p className="text-gray-600 font-medium">Automated repayment tracking through installment calendars.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
