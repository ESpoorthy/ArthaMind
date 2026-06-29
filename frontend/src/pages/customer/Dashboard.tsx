import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { ACCOUNTS, TRANSACTIONS, LOANS, FIXED_DEPOSITS } from '../../data/mockData';
import { Wallet, CreditCard, Landmark, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const fdValue = FIXED_DEPOSITS.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">Here's your financial overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Balance"
          value={`₹${totalBalance.toLocaleString('en-IN')}`}
          icon={Wallet}
          color="bg-blue-600"
        />
        <StatCard label="Active Cards" value="2" icon={CreditCard} color="bg-green-600" />
        <StatCard
          label="Active Loans"
          value={`${LOANS.length}`}
          icon={Landmark}
          color="bg-orange-500"
        />
        <StatCard
          label="FD Value"
          value={`₹${fdValue.toLocaleString('en-IN')}`}
          icon={PiggyBank}
          color="bg-purple-600"
        />
      </div>

      {/* Accounts + Recent Transactions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Your Accounts</h2>
          {ACCOUNTS.map((a) => (
            <div
              key={a.accountId}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-sm text-gray-800">{a.type} Account</p>
                <p className="text-xs text-gray-500">{a.accountNumber}</p>
              </div>
              <p className="font-bold text-gray-900">₹{a.balance.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {TRANSACTIONS.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2.5 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  {t.type === 'credit' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.desc}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
              </div>
              <p
                className={`font-semibold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}
              >
                {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: 'Block Card',
              to: '/dashboard/cards',
              color: 'bg-red-50 text-red-700 border-red-200',
            },
            {
              label: 'Pay EMI',
              to: '/dashboard/loans',
              color: 'bg-orange-50 text-orange-700 border-orange-200',
            },
            {
              label: 'New FD',
              to: '/dashboard/fd',
              color: 'bg-purple-50 text-purple-700 border-purple-200',
            },
            {
              label: 'Chat with AI',
              to: '/dashboard/chat',
              color: 'bg-blue-50 text-blue-700 border-blue-200',
            },
            {
              label: 'My Rewards',
              to: '/dashboard/rewards',
              color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            },
            {
              label: 'Life Events',
              to: '/dashboard/life-events',
              color: 'bg-pink-50 text-pink-700 border-pink-200',
            },
            {
              label: 'Fraud Safety',
              to: '/dashboard/fraud-awareness',
              color: 'bg-red-50 text-red-700 border-red-200',
            },
            {
              label: 'Bill Autopay',
              to: '/dashboard/bill-autopay',
              color: 'bg-teal-50 text-teal-700 border-teal-200',
            },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-xl border text-sm font-medium transition hover:shadow-sm ${a.color}`}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-base mb-2">🧠 Your AI is working for you</p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                Silver Tier · 2,340 pts
              </span>
              <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                3 Smart Nudges
              </span>
              <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                82/100 Insight Score
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/insights"
            className="shrink-0 bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition ml-4"
          >
            View Insights →
          </Link>
        </div>
      </div>
    </div>
  );
}
