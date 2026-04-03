import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Coins, Briefcase, BarChart3, Menu, X, ChevronDown, Search, Plus, UserPlus, FileText } from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
    setIsQuickActionsOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['admin'] },
    { name: 'Loans', path: '/loans', icon: Coins, roles: ['admin', 'user'] },
    { name: 'Dealers', path: '/dealers', icon: Briefcase, roles: ['admin'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] }
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role as any)
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#1c4587] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Company Switcher Box */}
        <div className="p-4 bg-[#12316ax] flex items-center justify-between cursor-pointer hover:bg-[#12316a] transition-colors relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-white truncate">Kanak Gold</span>
            </div>
          </div>
          
          
          <button 
            className="lg:hidden absolute top-2 right-2 p-1 rounded-md text-white/70 hover:bg-white/10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto mt-2">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#2b58b4] text-white shadow-sm' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Logo */}
        <div className="p-6 bg-[#0f285c] flex items-center justify-start">
            <span className="font-bold text-2xl text-white tracking-tighter">KanakGold</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col w-full relative">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 shrink-0 relative">
           <div className="flex items-center gap-3 w-full lg:w-auto">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
             >
               <Menu className="w-6 h-6" />
             </button>
           </div>
           
           {/* Center Search Bar & Quick Actions */}
           <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8 gap-3">
              <div className="w-full flex items-center border border-gray-300 rounded-md bg-white overflow-hidden transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full px-4 py-2 text-sm text-gray-700 outline-none" 
                 />
                 <button className="px-3 text-gray-400 hover:text-gray-600">
                    <Search className="w-4 h-4"/>
                 </button>
              </div>
              
              <div className="relative">
                <button 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors focus:outline-none"
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                >
                   <Plus className="w-4 h-4"/>
                </button>

                {isQuickActionsOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionsOpen(false)}></div>
                   <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden transform origin-top-right">
                     <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                       <span className="text-[13px] font-bold text-gray-900">Quick Actions</span>
                     </div>
                     <div className="py-1">
                       <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                         <UserPlus className="w-4 h-4 text-gray-500" />
                         Add Customer
                       </button>
                       <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                         <FileText className="w-4 h-4 text-gray-500" />
                         Add Loan
                       </button>
                       <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                         <UserPlus className="w-4 h-4 text-gray-500" />
                         Add Agent
                       </button>
                     </div>
                   </div>
                 </>
                )}
              </div>
           </div>
           
           {/* Right Profile Dropdown */}
           <div className="relative ml-auto">
             <button 
               className="flex items-center gap-3 focus:outline-none rounded-lg hover:bg-gray-50 p-1 pr-2 transition-colors"
               onClick={() => setIsProfileOpen(!isProfileOpen)}
             >
               <div className="w-9 h-9 rounded-full bg-[#1b88f3] flex items-center justify-center text-white text-[15px] font-medium shadow-sm">
                 {user?.username?.[0]?.toUpperCase() || 'S'}
               </div>
               <span className="text-[15px] font-medium text-[#111827] hidden sm:block">
                 {user?.username || 'Suvithra'}
               </span>
             </button>

             {isProfileOpen && (
               <>
                 <div 
                   className="fixed inset-0 z-40" 
                   onClick={() => setIsProfileOpen(false)}
                 ></div>
                 
                 <div className="absolute right-0 mt-2 w-[220px] bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 z-50 py-1 overflow-hidden transform origin-top-right">
                   <div className="px-4 py-2.5">
                     <p className="text-[13px] font-bold text-gray-900">{user?.username || 'Suvithras'} - My Account</p>
                   </div>
                   
                   <div className="h-px bg-gray-100"></div>
                   
                   <div className="py-1">
                     <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                       Profile
                     </button>
                     <NavLink 
                       to="/settings"
                       className={({ isActive }) => 
                         `block px-4 py-2 text-sm transition-colors mx-1 rounded ${isActive ? 'bg-[#1b64f3] text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`
                       }
                     >
                       Settings
                     </NavLink>
                   </div>
                   
                   <div className="h-px bg-gray-100"></div>
                   
                   <div className="py-1">
                     <button 
                       onClick={logout}
                       className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                     >
                       Logout
                     </button>
                   </div>
                 </div>
               </>
             )}
           </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f5f6f8]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
