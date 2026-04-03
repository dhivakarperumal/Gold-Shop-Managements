import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left">
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="w-8 h-8 bg-[#1b88f3] rounded flex items-center justify-center text-white font-bold">K</div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Kanak Gold</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Premium gold loan management platform for Indian markets.</p>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Platform</h4>
          <ul className="space-y-2 text-sm font-medium text-gray-500">
            <li><Link to="/" className="hover:text-[#1b88f3]">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-[#1b88f3]">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-[#1b88f3]">Security</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Company</h4>
          <ul className="space-y-2 text-sm font-medium text-gray-500">
            <li><Link to="/" className="hover:text-[#1b88f3]">About Us</Link></li>
            <li><Link to="/" className="hover:text-[#1b88f3]">Contact</Link></li>
            <li><Link to="/" className="hover:text-[#1b88f3]">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Contact</h4>
          <p className="text-sm font-medium text-gray-500">
            support@kanakgold.com<br/>
            +91 90802 81344
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-gray-200/50 text-center text-xs text-gray-400 font-bold">
        &copy; 2026 Kanak Gold Management. All Rights Reserved.
      </div>
    </footer>
  );
}
