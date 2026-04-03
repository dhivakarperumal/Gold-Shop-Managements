import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function Login() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Dummy authentication
    if (username.length > 0 && password.length > 0) {
      login(username, username === 'admin' ? 'Admin' : 'Staff');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-brand-500 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kanak Gold</h1>
          <p className="text-brand-100 mt-2 text-sm font-medium">Loan Management System</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:ring-4 focus:ring-brand-500/50 transition-all"
            >
              Sign In
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">Demo accounts: admin/password or staff/password</p>
          </form>
        </div>
      </div>
    </div>
  );
}
