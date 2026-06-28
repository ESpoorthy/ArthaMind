import { useState } from 'react';
import { FIXED_DEPOSITS } from '../../data/mockData';
import { PiggyBank } from 'lucide-react';

export default function FixedDeposits() {
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);
  const rates: Record<number, number> = { 6: 6.5, 12: 7.1, 24: 7.5, 36: 7.25 };
  const rate = rates[tenure] ?? 7.0;
  const maturity = Math.round(amount * (1 + (rate / 100) * (tenure / 12)));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fixed Deposits</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {FIXED_DEPOSITS.map(fd => (
          <div key={fd.fdId} className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-purple-200" />
              <span className="text-purple-200 text-sm">Fixed Deposit</span>
              <span className="ml-auto text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full">{fd.status}</span>
            </div>
            <p className="text-3xl font-bold mb-1">₹{fd.amount.toLocaleString('en-IN')}</p>
            <p className="text-purple-200 text-sm mb-4">{fd.rate}% p.a. · {fd.tenure} months</p>
            <div className="flex justify-between bg-white/10 rounded-xl p-3">
              <div><p className="text-xs text-purple-300">Maturity Amount</p><p className="font-bold">₹{fd.maturity.toLocaleString('en-IN')}</p></div>
              <div className="text-right"><p className="text-xs text-purple-300">Matures On</p><p className="font-bold text-sm">{fd.end}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* New FD */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-5">Create New FD</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tenure</label>
            <select value={tenure} onChange={e => setTenure(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              {Object.entries(rates).map(([m, r]) => <option key={m} value={m}>{m} months — {r}% p.a.</option>)}
            </select>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center">
          <div><p className="text-xs text-purple-600">Maturity Amount</p><p className="text-2xl font-bold text-purple-900">₹{maturity.toLocaleString('en-IN')}</p></div>
          <div><p className="text-xs text-purple-600">Earnings</p><p className="text-xl font-bold text-purple-700">+₹{(maturity - amount).toLocaleString('en-IN')}</p></div>
          <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Open FD</button>
        </div>
      </div>
    </div>
  );
}
