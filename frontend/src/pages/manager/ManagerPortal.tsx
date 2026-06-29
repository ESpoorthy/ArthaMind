import { useState } from 'react';
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

function OverviewSection({ a }: { a: typeof ANALYTICS }) {
  return (
    <>
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
    </>
  );
}

function AIPerformanceSection() {
  const agentRows = [
    { agent: 'FAQ Agent', queries: '1,240', rate: '94%', time: '0.8s', status: '🟢 Healthy' },
    { agent: 'Card Agent', queries: '890', rate: '88%', time: '1.2s', status: '🟢 Healthy' },
    { agent: 'Loan Agent', queries: '640', rate: '82%', time: '2.1s', status: '🟡 Moderate' },
    { agent: 'Fraud Agent', queries: '210', rate: '91%', time: '1.5s', status: '🟢 Healthy' },
    { agent: 'Investment Agent', queries: '430', rate: '85%', time: '1.8s', status: '🟢 Healthy' },
    { agent: 'Memory Agent', queries: '1,820', rate: '97%', time: '0.3s', status: '🟢 Healthy' },
    { agent: 'Router Agent', queries: '3,230', rate: '99%', time: '0.2s', status: '🟢 Healthy' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">AI Agent Performance Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Agent',
                  'Queries Resolved',
                  'Resolution Rate',
                  'Avg Response Time',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentRows.map((row) => (
                <tr key={row.agent} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{row.agent}</td>
                  <td className="px-5 py-3.5 text-gray-700">{row.queries}</td>
                  <td className="px-5 py-3.5 font-semibold text-blue-600">{row.rate}</td>
                  <td className="px-5 py-3.5 text-gray-700">{row.time}</td>
                  <td className="px-5 py-3.5">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Model Info
          </p>
          <p className="text-sm text-gray-700">
            Powered by Gemini 2.5 Flash · LangGraph v0.1 · ChromaDB v0.4
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Customer Satisfaction
          </p>
          <p className="text-4xl font-bold text-gray-900">4.6 / 5.0 ⭐</p>
          <p className="text-sm text-gray-500 mt-1">Based on 2,847 ratings</p>
        </div>
      </div>
    </div>
  );
}

function FraudAlertsSection({ a }: { a: typeof ANALYTICS }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fraud Monitoring Centre</h2>
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Blocked Today', value: '3', color: 'bg-red-50 text-red-700' },
            { label: 'Amount Saved', value: '₹1,65,000', color: 'bg-green-50 text-green-700' },
            { label: 'Auto-resolved', value: '1', color: 'bg-blue-50 text-blue-700' },
            { label: 'Under Review', value: '2', color: 'bg-yellow-50 text-yellow-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color.split(' ')[0]}`}>
              <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Amount', 'Risk Score', 'Type', 'Time', 'Status', 'Action'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {a.fraudAlertsList.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{f.customer}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-800">{f.amount}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-red-500"
                          style={{ width: `${f.risk}%` }}
                        />
                      </div>
                      <span className="text-xs text-red-600 font-bold">{f.risk}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{f.type}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{f.time}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${f.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button className="text-xs border border-red-500 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">
                        Investigate
                      </button>
                      <button className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded hover:bg-gray-50 transition">
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Fraud Trends</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              text: 'Phishing attempts ↑ 12% this week',
              color: 'bg-red-50 border-red-200 text-red-700',
            },
            {
              text: 'Card skimming reports ↓ 5%',
              color: 'bg-green-50 border-green-200 text-green-700',
            },
            {
              text: 'UPI fraud attempts ↑ 8%',
              color: 'bg-orange-50 border-orange-200 text-orange-700',
            },
          ].map((trend) => (
            <div
              key={trend.text}
              className={`rounded-xl p-4 border text-sm font-medium ${trend.color}`}
            >
              {trend.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Business Analytics</h2>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '₹2.4Cr' },
          { label: 'New Customers', value: '+847' },
          { label: 'Loan Disbursals', value: '₹18.6Cr' },
          { label: 'FD Deposits', value: '₹9.2Cr' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Customer Segment Breakdown</h3>
        {[
          { label: 'Salaried', pct: 58, color: 'bg-blue-500' },
          { label: 'Self-employed', pct: 22, color: 'bg-green-500' },
          { label: 'Students', pct: 12, color: 'bg-purple-500' },
          { label: 'Senior Citizens', pct: 8, color: 'bg-orange-500' },
        ].map((seg) => (
          <div key={seg.label} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{seg.label}</span>
              <span className="font-semibold text-gray-900">{seg.pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className={`h-3 rounded-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-900">Top Products This Month</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Product
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Applications
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { product: 'Home Loan', apps: 342 },
              { product: 'Personal Loan', apps: 891 },
              { product: 'FD Opening', apps: 1240 },
              { product: 'Credit Card', apps: 567 },
            ].map((row) => (
              <tr key={row.product} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3.5 font-medium text-gray-900">{row.product}</td>
                <td className="px-5 py-3.5 text-gray-700">{row.apps.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LiveActivitySection() {
  const activities = [
    { time: 'Just now', emoji: '💬', desc: 'Ravi Kumar resolved ticket TK-001 (Card Issue)' },
    { time: '1 min ago', emoji: '🤖', desc: 'FAQ Agent resolved query about FD rates' },
    { time: '2 min ago', emoji: '🚨', desc: 'Fraud alert triggered for Unknown User (₹45,000)' },
    { time: '3 min ago', emoji: '✅', desc: 'Priya Sharma completed KYC verification' },
    { time: '5 min ago', emoji: '💰', desc: 'New FD opened: ₹5,00,000 by Arjun Patel' },
    { time: '7 min ago', emoji: '🤖', desc: 'Card Agent blocked card for Sneha Reddy' },
    { time: '9 min ago', emoji: '📋', desc: 'New loan application: ₹8,00,000 Personal Loan' },
    { time: '12 min ago', emoji: '💬', desc: 'Human handoff: Meera Joshi escalated to agent' },
    { time: '15 min ago', emoji: '✅', desc: 'Rahul Singh SIP of ₹5,000 activated' },
    { time: '18 min ago', emoji: '🔐', desc: 'Security alert: unusual login attempt blocked' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Live Activity Feed</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" /> LIVE
          </span>
        </div>
        <button className="text-sm text-purple-700 border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition font-medium">
          Refresh Feed
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {activities.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition"
            >
              <span className="text-xs text-gray-400 w-20 shrink-0">{item.time}</span>
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                {item.emoji}
              </span>
              <span className="text-sm text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManagerPortal() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const a = ANALYTICS;
  const [activeSection, setActiveSection] = useState<string>('Overview');

  const navItems = ['Overview', 'AI Performance', 'Fraud Alerts', 'Analytics', 'Live Activity'];

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
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                activeSection === item
                  ? 'bg-white text-purple-900 font-semibold'
                  : 'text-purple-200 hover:bg-purple-800'
              }`}
            >
              {item}
            </button>
          ))}
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

        {activeSection === 'Overview' && <OverviewSection a={a} />}
        {activeSection === 'AI Performance' && <AIPerformanceSection />}
        {activeSection === 'Fraud Alerts' && <FraudAlertsSection a={a} />}
        {activeSection === 'Analytics' && <AnalyticsSection />}
        {activeSection === 'Live Activity' && <LiveActivitySection />}
      </main>
    </div>
  );
}
