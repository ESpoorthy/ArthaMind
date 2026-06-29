import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Building2, UserCircle, Headphones, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = (role: 'customer' | 'agent' | 'manager', path: string) => {
    login(role);
    nav(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Building2 className="w-9 h-9 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">ArthaMind</h1>
          <p className="text-blue-200 mt-1">Agentic AI Banking Simulator</p>
          <p className="text-blue-300 text-xs mt-1">SBI Hackathon 2026</p>
        </div>

        {/* Demo Login Cards */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
          <p className="text-white text-center text-sm font-medium mb-5">
            Select a demo portal to explore
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handle('customer', '/dashboard')}
              className="w-full bg-white text-blue-900 rounded-xl p-4 flex items-center gap-4 hover:bg-blue-50 transition-all shadow font-medium"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-blue-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Customer Portal</p>
                <p className="text-xs text-gray-500">Priya Sharma · Savings Account</p>
              </div>
            </button>

            <button
              onClick={() => handle('agent', '/agent')}
              className="w-full bg-white/90 text-blue-900 rounded-xl p-4 flex items-center gap-4 hover:bg-white transition-all shadow font-medium"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Headphones className="w-6 h-6 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Human Agent Portal</p>
                <p className="text-xs text-gray-500">Ravi Kumar · Support Agent</p>
              </div>
            </button>

            <button
              onClick={() => handle('manager', '/manager')}
              className="w-full bg-white/90 text-blue-900 rounded-xl p-4 flex items-center gap-4 hover:bg-white transition-all shadow font-medium"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Manager Dashboard</p>
                <p className="text-xs text-gray-500">Anita Verma · Branch Manager</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          Powered by Gemini 2.5 Flash · LangGraph Multi-Agent Architecture
        </p>
      </div>
    </div>
  );
}
