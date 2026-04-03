import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Search, Plus, UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 shrink-0 relative">
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Center Search Bar & Quick Actions */}
      <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8 gap-3">
        <div className="w-full flex items-center border border-gray-300 rounded-md bg-white overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden transform origin-top-right animate-in fade-in zoom-in duration-150">
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
            {user?.username || 'Guest'}
          </span>
        </button>

        {isProfileOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsProfileOpen(false)}
            ></div>
            
            <div className="absolute right-0 mt-2 w-[220px] bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 z-50 py-1 overflow-hidden transform origin-top-right animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2.5">
                <p className="text-[13px] font-bold text-gray-900">{user?.username || 'Account'} - My Account</p>
              </div>
              
              <div className="h-px bg-gray-100"></div>
              
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                  Profile
                </button>
                <NavLink 
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
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
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
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
  );
}
