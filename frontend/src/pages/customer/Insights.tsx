import { Link } from 'react-router-dom';
import { Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface SpendCategory {
  label: string;
  pct: number;
  color: string;
  barColor: string;
}

interface AdoptionMetric {
  label: string;
  pct: number;
  status: string;
  statusColor: string;
  barColor: string;
}

interface AiTip {
  id: string;
  icon: string;
  text: string;
}

const SPEND_CATEGORIES: SpendCategory[] = [
  { label: 'Food & Dining', pct: 28, color: 'text-red-600', barColor: 'bg-red-400' },
  { label: 'Shopping', pct: 22, color: 'text-blue-600', barColor: 'bg-blue-400' },
  { label: 'Loan EMI', pct: 20, color: 'text-orange-600', barColor: 'bg-orange-400' },
  { label: 'Utilities', pct: 18, color: 'text-yellow-600', barColor: 'bg-yellow-400' },
  { label: 'Entertainment', pct: 12, color: 'text-purple-600', barColor: 'bg-purple-400' },
];

const ADOPTION_METRICS: AdoptionMetric[] = [
  {
    label: 'UPI Usage',
    pct: 45,
    status: 'Getting Started',
    statusColor: 'text-amber-600 bg-amber-50',
    barColor: 'bg-amber-400',
  },
  {
    label: 'Mobile Banking',
    pct: 78,
    status: 'Active',
    statusColor: 'text-green-600 bg-green-50',
    barColor: 'bg-green-500',
  },
  {
    label: 'Investment Activity',
    pct: 62,
    status: 'Growing',
    statusColor: 'text-blue-600 bg-blue-50',
    barColor: 'bg-blue-500',
  },
  {
    label: 'Bill Automation',
    pct: 30,
    status: 'Needs Attention',
    statusColor: 'text-red-600 bg-red-50',
    barColor: 'bg-red-400',
  },
];

const AI_TIPS: AiTip[] = [
  { id: 'tip1', icon: '⚡', text: 'Enable auto-pay for electricity bill — save late fees' },
  {
    id: 'tip2',
    icon: '✈️',
    text: 'Your travel spending is high — Travel Insurance could save ₹12,000/year',
  },
  { id: 'tip3', icon: '💰', text: 'You qualify for a higher FD rate — upgrade to 7.5% today' },
];

const PERSONALIZATION_SCORE = 82;

export default function Insights() {
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (PERSONALIZATION_SCORE / 100) * circumference;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Behavioral Intelligence</h1>
        <p className="text-gray-500 text-sm">
          AI-powered insights tailored to your banking behavior
        </p>
      </div>

      {/* Personalization Score + Smart Nudges */}
      <div className="grid grid-cols-3 gap-5">
        {/* Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#2563eb"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{PERSONALIZATION_SCORE}</span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
          </div>
          <p className="font-semibold text-gray-900 mt-3 text-center text-sm">
            Personalization Score
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Your banking profile is highly personalized
          </p>
        </div>

        {/* Smart Nudges */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> Smart Nudges
          </h2>
          <div className="space-y-3">
            {/* Nudge 1 */}
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <span className="text-lg shrink-0">🟡</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-800">UPI Usage Low</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  You haven't used UPI in 14 days. Try UPI for your next bill payment and earn 2x
                  points!
                </p>
              </div>
              <Link
                to="/dashboard/chat"
                className="shrink-0 text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
              >
                Set Up UPI
              </Link>
            </div>
            {/* Nudge 2 */}
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <span className="text-lg shrink-0">🟠</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-orange-800">Salary Just Credited!</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  ₹85,000 credited on Jun 25. Consider investing ₹10,000 in an SIP to grow your
                  wealth.
                </p>
              </div>
              <Link
                to="/dashboard/life-events"
                className="shrink-0 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
              >
                Explore SIP
              </Link>
            </div>
            {/* Nudge 3 */}
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <span className="text-lg shrink-0">🟢</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">Bill Payment Streak</p>
                <p className="text-xs text-green-700 mt-0.5">
                  You've paid 3 bills on time! Keep it up to earn the Bill Streak badge.
                </p>
              </div>
              <span className="shrink-0 text-xs bg-green-600 text-white font-medium px-3 py-1.5 rounded-lg">
                3/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Pattern */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-500" /> Spending Pattern Analysis
        </h2>
        <div className="space-y-3">
          {SPEND_CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-700 w-36 shrink-0">{cat.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${cat.barColor} transition-all`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-10 text-right shrink-0 ${cat.color}`}>
                {cat.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Adoption Score */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Digital Adoption Score
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {ADOPTION_METRICS.map((m) => (
            <div key={m.label} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">{m.label}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.statusColor}`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${m.barColor} transition-all`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-9 text-right shrink-0">
                  {m.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" /> AI Recommendations
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {AI_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4"
            >
              <span className="text-2xl">{tip.icon}</span>
              <p className="text-sm text-gray-700 mt-2">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
