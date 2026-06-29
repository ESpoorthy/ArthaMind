import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { ANALYTICS } from '../../data/mockData';
import { Building2, LogOut, Users, Bot, Zap, ShieldAlert, TrendingUp } from 'lucide-react';

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export default function ManagerPortal() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const a = ANALYTICS;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-purple-900 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-purple-800">
          <Building2 className="w-6 h-6 text-white" />
          <div>
            <p className="text-white font-bold">ArthaMind</p>
            <p className="text-purple-300 text-xs">Manager</p>
          </div>
        </div>
        <div className="p-4 border-b border-purple-800">
          <p className="text-purple-300 text-xs">Branch Manager</p>
          <p className="text-white font-semibold text-sm">{user?.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {['Overview', 'AI Performance', 'Fraud Alerts', 'Analytics', 'Live Activity'].map(
            (item) => (
              <div
                key={item}
                className="text-purple-200 hover:bg-purple-800 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition"
              >
                {item}
              </div>
            ),
          )}
        </nav>
        <button
          onClick={() => {
            logout();
            nav('/login');
          }}
          className="m-3 flex items-center gap-2 text-purple-300 hover:text-white text-sm p-3 rounded-lg hover:bg-purple-800 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time AI performance and banking analytics</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Customers',
              value: a.totalCustomers.toLocaleString('en-IN'),
              icon: Users,
              color: 'bg-blue-600',
            },
            {
              label: 'AI Resolution Rate',
              value: `${a.aiResolutionRate}%`,
              icon: Bot,
              color: 'bg-green-600',
            },
            {
              label: 'Avg Response Time',
              value: `${a.avgResponseTime}s`,
              icon: Zap,
              color: 'bg-yellow-500',
            },
            {
              label: 'Fraud Alerts',
              value: `${a.fraudAlerts}`,
              icon: ShieldAlert,
              color: 'bg-red-600',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Agent performance */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" /> AI Agent Performance
            </h2>
            {a.agentPerformance.map((ap) => (
              <Bar key={ap.agent} label={ap.agent} value={ap.rate} max={100} color="bg-blue-500" />
            ))}
          </div>

          {/* Weekly transaction volume — CSS bar chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" /> Weekly Transaction Volume
            </h2>
            <div className="flex items-end justify-between gap-2 h-32">
              {a.weeklyVolume.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${(d.txns / 3000) * 100}%` }}
                    title={`${d.txns} txns`}
                  />
                  <span className="text-xs text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fraud alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
          <div className="p-5 border-b flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h2 className="font-semibold text-gray-900">Active Fraud Alerts</h2>
          </div>
          <div className="divide-y">
            {a.fraudAlertsList.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{f.customer}</p>
                  <p className="text-xs text-gray-500">
                    {f.type} · {f.time}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-800">{f.amount}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-red-500"
                        style={{ width: `${f.risk}%` }}
                      />
                    </div>
                    <span className="text-xs text-red-600 font-bold">{f.risk}%</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${f.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <h2 className="font-semibold text-gray-900">Gamification Analytics</h2>
          </div>
          <div className="p-5">
            {/* Stats chips */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Active Users', value: '18,420' },
                { label: 'Badges Awarded', value: '42,381' },
                { label: 'Challenges Completed', value: '8,940' },
                { label: 'Avg Points/User', value: '1,840' },
              ].map((s) => (
                <div key={s.label} className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-purple-700">{s.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Digital adoption bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  Digital Adoption ↑ 23% since gamification launch
                </span>
                <span className="font-bold text-green-700">78%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            {/* Top badges table */}
            <div>
              <p className="font-medium text-gray-800 text-sm mb-3">Top Badges Earned This Month</p>
              <div className="divide-y border rounded-xl overflow-hidden">
                {[
                  { rank: 1, badge: 'Digital Pioneer', count: '8,420' },
                  { rank: 2, badge: 'Bill Master', count: '6,230' },
                  { rank: 3, badge: 'Security Savvy', count: '4,810' },
                ].map((row) => (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                        {row.rank}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{row.badge}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{row.count} awarded</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
