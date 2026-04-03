import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="loans" element={<div className="p-4"><h1 className="text-2xl font-bold">Loans</h1><p>Module coming soon.</p></div>} />
            <Route path="dealers" element={<div className="p-4"><h1 className="text-2xl font-bold">Dealers</h1><p>Module coming soon.</p></div>} />
            <Route path="reports" element={<div className="p-4"><h1 className="text-2xl font-bold">Reports</h1><p>Module coming soon.</p></div>} />
            <Route path="settings" element={<div className="p-4"><h1 className="text-2xl font-bold">Settings</h1><p>Module coming soon.</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
