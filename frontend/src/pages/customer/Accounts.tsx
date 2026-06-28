import { useState } from 'react';
import { ACCOUNTS, TRANSACTIONS } from '../../data/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Accounts() {
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const txns = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Accounts</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {ACCOUNTS.map(a => (
          <div key={a.accountId} className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-200 text-xs mb-1">{a.type} Account</p>
            <p className="text-3xl font-bold mb-3">₹{a.balance.toLocaleString('en-IN')}</p>
            <p className="text-blue-300 font-mono text-sm">{a.accountNumber}</p>
            <div className="flex justify-between mt-4">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{a.currency}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'Active' ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30'}`}>{a.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
          <div className="flex gap-2">
            {(['all', 'debit', 'credit'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {txns.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {t.type === 'credit' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.desc}</p>
                  <p className="text-xs text-gray-400">{t.cat} · {t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">Bal: ₹{t.balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
