import { useState } from 'react';
import { AlertCircle, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

interface Bill {
  id: string;
  icon: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Overdue' | 'Due Soon' | 'Upcoming';
  autopay: boolean;
}

const INITIAL_BILLS: Bill[] = [
  {
    id: 'b1',
    icon: '💡',
    name: 'Electricity (BESCOM)',
    amount: 3400,
    dueDate: 'Jul 5, 2026',
    status: 'Overdue',
    autopay: false,
  },
  {
    id: 'b2',
    icon: '📱',
    name: 'Mobile Recharge (Jio)',
    amount: 599,
    dueDate: 'Jul 8, 2026',
    status: 'Due Soon',
    autopay: true,
  },
  {
    id: 'b3',
    icon: '🌊',
    name: 'Water Board',
    amount: 280,
    dueDate: 'Jul 12, 2026',
    status: 'Upcoming',
    autopay: false,
  },
  {
    id: 'b4',
    icon: '📺',
    name: 'DTH (Tata Play)',
    amount: 450,
    dueDate: 'Jul 15, 2026',
    status: 'Upcoming',
    autopay: false,
  },
];

const BILL_HISTORY = [
  { date: 'Jun 18, 2026', name: 'Electricity (BESCOM)', amount: 3200, status: 'Paid', pts: 30 },
  { date: 'Jun 10, 2026', name: 'Mobile (Jio)', amount: 599, status: 'Autopay', pts: 30 },
  { date: 'May 18, 2026', name: 'Electricity (BESCOM)', amount: 3100, status: 'Paid', pts: 30 },
  { date: 'May 5, 2026', name: 'Water Board', amount: 265, status: 'Missed', pts: 0 },
];

function getStatusBadge(status: Bill['status']) {
  switch (status) {
    case 'Overdue':
      return 'bg-red-100 text-red-700';
    case 'Due Soon':
      return 'bg-yellow-100 text-yellow-700';
    case 'Upcoming':
      return 'bg-gray-100 text-gray-600';
  }
}

export default function BillAutopay() {
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [autopayToast, setAutopayToast] = useState<string | null>(null);

  // Reminder toggles
  const [remind7, setRemind7] = useState(true);
  const [remind3, setRemind3] = useState(true);
  const [remindDue, setRemindDue] = useState(false);

  const autopayCount = bills.filter((b) => b.autopay).length;

  const toggleAutopay = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next = !b.autopay;
          if (next) {
            setAutopayToast(id);
            setTimeout(() => setAutopayToast(null), 3000);
          }
          return { ...b, autopay: next };
        }
        return b;
      }),
    );
  };

  const ToggleBtn = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-300'}`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚡ Bill Payment &amp; Autopay</h1>
        <p className="text-gray-500 text-sm">
          Never miss a payment — set up smart reminders and autopay
        </p>
      </div>

      {/* Missed Payment Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800">
            You missed <strong>2 bill payments</strong> last month. Set up autopay to avoid{' '}
            <strong>₹450 in late fees!</strong>
          </p>
        </div>
        <a
          href="#autopay-section"
          className="shrink-0 ml-4 bg-orange-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Set Up Now
        </a>
      </div>

      {/* Bills Overview */}
      <div id="autopay-section">
        <h2 className="font-semibold text-gray-900 mb-3 text-lg">Bills Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          {bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bill.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{bill.name}</p>
                    <p className="text-xs text-gray-500">Due: {bill.dueDate}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(bill.status)}`}
                >
                  {bill.status}
                </span>
              </div>

              <p className="text-xl font-bold text-gray-900 mb-3">
                ₹{bill.amount.toLocaleString('en-IN')}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {bill.autopay ? (
                    <ToggleRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600">Autopay</span>
                  <ToggleBtn on={bill.autopay} onToggle={() => toggleAutopay(bill.id)} />
                </div>
              </div>

              {autopayToast === bill.id && (
                <div className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />✅ Autopay enabled! You'll earn
                  30 pts for each automated payment.
                </div>
              )}

              <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                Pay Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Autopay Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Autopay Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{autopayCount}</p>
            <p className="text-xs text-gray-600 mt-1">Bills on Autopay</p>
          </div>
          <div className="text-center bg-green-50 rounded-xl p-4">
            <div>
              <p className="text-2xl font-bold text-green-700">₹0</p>
              <p className="text-xs text-gray-600 mt-1">Late Fees Saved</p>
              <p className="text-xs text-gray-400 mt-0.5">(₹450 potential)</p>
            </div>
          </div>
          <div className="text-center bg-yellow-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-700">30 pts</p>
            <p className="text-xs text-gray-600 mt-1">Per Automated Payment</p>
          </div>
        </div>
      </div>

      {/* Payment Reminder Settings */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Payment Reminder Settings</h2>
        <div className="space-y-4">
          {[
            { label: '7 days before due date', on: remind7, toggle: () => setRemind7((v) => !v) },
            { label: '3 days before due date', on: remind3, toggle: () => setRemind3((v) => !v) },
            { label: 'On due date', on: remindDue, toggle: () => setRemindDue((v) => !v) },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm text-gray-700">{item.label}</span>
              <ToggleBtn on={item.on} onToggle={item.toggle} />
            </div>
          ))}
        </div>
      </div>

      {/* Bill Payment History */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Bill Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Bill</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {BILL_HISTORY.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-gray-500">{row.date}</td>
                  <td className="py-3 font-medium text-gray-800">{row.name}</td>
                  <td className="py-3 text-gray-700">₹{row.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-medium ${row.status === 'Missed' ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {row.status === 'Missed'
                        ? '❌ Missed'
                        : row.status === 'Autopay'
                          ? '✅ Autopay'
                          : '✅ Paid'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-medium ${row.pts > 0 ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      {row.pts > 0 ? `+${row.pts} pts` : '0 pts'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
