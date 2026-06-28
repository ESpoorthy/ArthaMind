import { useState } from 'react';
import { LOANS } from '../../data/mockData';

function calcEMI(p: number, r: number, n: number) {
  const mr = r / (12 * 100);
  if (!mr) return p / n;
  return Math.round((p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1));
}

export default function Loans() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(36);
  const emi = calcEMI(amount, rate, tenure);
  const total = emi * tenure;
  const interest = total - amount;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Loans</h1>

      {/* Active loans */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {LOANS.map(l => {
          const pct = Math.round((l.paid / l.tenure) * 100);
          return (
            <div key={l.loanId} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{l.type}</p>
                  <p className="text-xs text-gray-500">{l.rate}% p.a. · {l.tenure} months</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <div><p className="text-gray-400 text-xs">Outstanding</p><p className="font-bold text-gray-900">₹{l.outstanding.toLocaleString('en-IN')}</p></div>
                <div className="text-right"><p className="text-gray-400 text-xs">Monthly EMI</p><p className="font-bold text-blue-700">₹{l.emi.toLocaleString('en-IN')}</p></div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Repaid {pct}%</span><span>Next due: {l.nextDue}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMI Calculator */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-5">EMI Calculator</h2>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Loan Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Interest Rate (% p.a.)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tenure (months)</label>
            <input type="number" value={tenure} onChange={e => setTenure(+e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 bg-blue-50 rounded-xl p-4">
          <div className="text-center"><p className="text-xs text-blue-600 mb-1">Monthly EMI</p><p className="text-2xl font-bold text-blue-900">₹{emi.toLocaleString('en-IN')}</p></div>
          <div className="text-center"><p className="text-xs text-blue-600 mb-1">Total Interest</p><p className="text-2xl font-bold text-blue-900">₹{interest.toLocaleString('en-IN')}</p></div>
          <div className="text-center"><p className="text-xs text-blue-600 mb-1">Total Amount</p><p className="text-2xl font-bold text-blue-900">₹{total.toLocaleString('en-IN')}</p></div>
        </div>
      </div>
    </div>
  );
}
