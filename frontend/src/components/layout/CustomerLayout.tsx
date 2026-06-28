import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Building2, LayoutDashboard, CreditCard, Landmark, PiggyBank, MessageSquare, Bell, LogOut, Wallet } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/mockData';

const NAV = [
  { to: '/dashboard',          label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/dashboard/accounts', label: 'Accounts',        icon: Wallet },
  { to: '/dashboard/cards',    label: 'Cards',           icon: CreditCard },
  { to: '/dashboard/loans',    label: 'Loans',           icon: Landmark },
  { to: '/dashboard/fd',       label: 'Fixed Deposits',  icon: PiggyBank },
  { to: '/dashboard/chat',     label: 'AI Assistant',    icon: MessageSquare },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-900 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-blue-800">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-800" />
          </div>
          <span className="text-white font-bold text-lg">ArthaMind</span>
        </div>

        <div className="p-4 border-b border-blue-800">
          <p className="text-blue-200 text-xs">Welcome back,</p>
          <p className="text-white font-semibold text-sm">{user?.name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? 'bg-white text-blue-900 font-semibold' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {label === 'Notifications' && unread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => { logout(); nav('/login'); }}
          className="m-3 flex items-center gap-2 text-blue-300 hover:text-white text-sm p-3 rounded-lg hover:bg-blue-800 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
