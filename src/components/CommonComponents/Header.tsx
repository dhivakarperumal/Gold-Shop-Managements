import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Heart, User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-10 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between font-sans h-16">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#1b88f3] rounded flex items-center justify-center text-white font-bold">K</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Kanak Gold</span>
      </Link>

      {/* Center: Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
        <Link to="/" className="hover:text-[#1b88f3] transition-colors">Home</Link>
        <Link to="/about" className="hover:text-[#1b88f3] transition-colors">About</Link>
        <Link to="/products" className="hover:text-[#1b88f3] transition-colors">Products</Link>
        <Link to="/contact" className="hover:text-[#1b88f3] transition-colors">Contact</Link>
      </nav>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-5">
        {/* Cart & Fav Icons */}
        <button className="relative text-gray-600 hover:text-[#1b88f3] transition-colors">
          <Heart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
        </button>
        <button className="relative text-gray-600 hover:text-[#1b88f3] transition-colors">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-[#1b88f3] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

        {/* User Account / Login */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none group bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-full transition-all border border-gray-100"
            >
              <div className="w-7 h-7 rounded-full bg-[#1b88f3] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden lg:block">{user.username}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#1b88f3] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                ></div>
                
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{user.username}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{user.email}</p>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1b88f3] transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  <Link 
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1b88f3] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Account
                  </Link>
                  
                  <div className="h-px bg-gray-50 mx-2 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-[#1b88f3] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#1569c7] transition-all shadow-md text-sm"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
