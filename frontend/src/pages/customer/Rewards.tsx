import { Trophy, CheckCircle, TrendingUp, Shield, Lock } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  earned: boolean;
}

interface Challenge {
  id: string;
  name: string;
  desc: string;
  current: number;
  total: number;
  unit: string;
  reward: number;
}

interface PointEvent {
  id: string;
  date: string;
  activity: string;
  points: number;
  type: 'earned' | 'redeemed';
}

const BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Digital Pioneer',
    desc: 'First UPI payment',
    icon: Trophy,
    iconColor: 'text-yellow-500',
    earned: true,
  },
  {
    id: 'b2',
    name: 'Bill Master',
    desc: 'First bill payment',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    earned: true,
  },
  {
    id: 'b3',
    name: 'Investor Initiate',
    desc: 'First investment',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
    earned: true,
  },
  {
    id: 'b4',
    name: 'Security Savvy',
    desc: 'Completed fraud quiz',
    icon: Shield,
    iconColor: 'text-purple-500',
    earned: true,
  },
  {
    id: 'b5',
    name: 'SIP Champion',
    desc: '3 months of SIP',
    icon: Lock,
    iconColor: 'text-gray-400',
    earned: false,
  },
  {
    id: 'b6',
    name: 'Travel Pro',
    desc: 'Booked travel insurance',
    icon: Lock,
    iconColor: 'text-gray-400',
    earned: false,
  },
];

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    name: 'UPI Master',
    desc: 'Complete 10 UPI transactions',
    current: 7,
    total: 10,
    unit: '',
    reward: 200,
  },
  {
    id: 'c2',
    name: 'Save Smart',
    desc: 'Save ₹5,000 this month',
    current: 3200,
    total: 5000,
    unit: '₹',
    reward: 350,
  },
  {
    id: 'c3',
    name: 'Bill Streak',
    desc: 'Pay 3 bills on time',
    current: 2,
    total: 3,
    unit: '',
    reward: 150,
  },
];

const POINT_HISTORY: PointEvent[] = [
  { id: 'p1', date: 'Jun 27, 2026', activity: 'UPI Payment — Amazon', points: 50, type: 'earned' },
  { id: 'p2', date: 'Jun 25, 2026', activity: 'Salary Credit Bonus', points: 200, type: 'earned' },
  {
    id: 'p3',
    date: 'Jun 22, 2026',
    activity: 'Bill Payment — Electricity',
    points: 30,
    type: 'earned',
  },
  {
    id: 'p4',
    date: 'Jun 20, 2026',
    activity: 'Cashback Redemption',
    points: -150,
    type: 'redeemed',
  },
  { id: 'p5', date: 'Jun 18, 2026', activity: 'FD Opening Bonus', points: 100, type: 'earned' },
];

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const CURRENT_POINTS = 2340;
const NEXT_TIER_POINTS = 5000;
const CURRENT_TIER = 'Silver';

export default function Rewards() {
  const progressPct = Math.round((CURRENT_POINTS / NEXT_TIER_POINTS) * 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards &amp; Gamification</h1>
        <p className="text-gray-500 text-sm">Earn points, unlock badges, and climb the tiers</p>
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-1">
              {CURRENT_TIER} Tier
            </span>
            <p className="text-gray-700 font-medium">
              {CURRENT_POINTS.toLocaleString('en-IN')} / {NEXT_TIER_POINTS.toLocaleString('en-IN')}{' '}
              points to Gold
            </p>
          </div>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>

        {/* Tier bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-2">
            {TIERS.map((tier, i) => (
              <span
                key={tier}
                className={`text-xs font-semibold ${i <= 1 ? 'text-blue-700' : 'text-gray-400'}`}
              >
                {tier}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 relative">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {progressPct}% of the way to Gold ·{' '}
            {(NEXT_TIER_POINTS - CURRENT_POINTS).toLocaleString('en-IN')} pts remaining
          </p>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Points', value: '2,340', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'This Month', value: '+480', color: 'text-green-700', bg: 'bg-green-50' },
          {
            label: 'Cashback Earned',
            value: '₹1,240',
            color: 'text-purple-700',
            bg: 'bg-purple-50',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Your Badges</h2>
        <div className="grid grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-4 border text-center transition ${
                  badge.earned
                    ? 'border-gray-200 bg-white hover:shadow-md'
                    : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.earned ? 'bg-gray-100' : 'bg-gray-100'}`}
                  >
                    <Icon className={`w-6 h-6 ${badge.iconColor}`} />
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {badge.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
                {badge.earned ? (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Earned
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Active Challenges</h2>
        <div className="space-y-4">
          {CHALLENGES.map((c) => {
            const pct = Math.round((c.current / c.total) * 100);
            const displayCurrent =
              c.unit === '₹' ? `₹${c.current.toLocaleString('en-IN')}` : `${c.current}`;
            const displayTotal =
              c.unit === '₹' ? `₹${c.total.toLocaleString('en-IN')}` : `${c.total}`;
            return (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.desc}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2.5 py-1 rounded-full">
                    {c.reward} pts
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {displayCurrent} / {displayTotal} · {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Loyalty Points History</h2>
        <div className="divide-y">
          {POINT_HISTORY.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{event.activity}</p>
                <p className="text-xs text-gray-400">{event.date}</p>
              </div>
              <span
                className={`text-sm font-bold ${event.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}
              >
                {event.type === 'earned' ? '+' : ''}
                {event.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
