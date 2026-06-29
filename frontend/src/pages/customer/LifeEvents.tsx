import { useState } from 'react';
import { TrendingUp, Shield, Home, X, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  desc: string;
  cta: string;
  ctaColor: string;
}

interface LifeEventTrigger {
  id: string;
  label: string;
  products: Product[];
}

const RECOMMENDED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'SBI Bluechip SIP',
    desc: 'Start investing your extra ₹8,500/month. Expected return: 12% p.a. over 5 years → ₹6.9L',
    cta: 'Start SIP',
    ctaColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'p2',
    name: 'Term Life Insurance',
    desc: 'Protect your growing income. ₹1Cr cover at just ₹680/month',
    cta: 'Get Quote',
    ctaColor: 'bg-green-600 hover:bg-green-700 text-white',
  },
  {
    id: 'p3',
    name: 'Home Loan Pre-approval',
    desc: "Based on your income, you're pre-approved for up to ₹45L @ 8.25%",
    cta: 'Check Eligibility',
    ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
];

const LIFE_EVENT_TRIGGERS: LifeEventTrigger[] = [
  {
    id: 'le1',
    label: 'Got Married',
    products: [
      {
        id: 'lp1',
        name: 'Joint Savings Account',
        desc: 'Open a joint account for shared goals and expenses.',
        cta: 'Open Account',
        ctaColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      {
        id: 'lp2',
        name: 'Marriage Loan',
        desc: 'Up to ₹10L personal loan for wedding expenses @ 10.5%',
        cta: 'Apply Now',
        ctaColor: 'bg-green-600 hover:bg-green-700 text-white',
      },
    ],
  },
  {
    id: 'le2',
    label: 'Had a Child',
    products: [
      {
        id: 'lp3',
        name: 'Child Education SIP',
        desc: "Build a ₹50L corpus for your child's education in 18 years.",
        cta: 'Start SIP',
        ctaColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      {
        id: 'lp4',
        name: 'Child Life Insurance',
        desc: "Secure your child's future with comprehensive cover.",
        cta: 'Get Quote',
        ctaColor: 'bg-green-600 hover:bg-green-700 text-white',
      },
    ],
  },
  {
    id: 'le3',
    label: 'Planning Retirement',
    products: [
      {
        id: 'lp5',
        name: 'NPS Subscription',
        desc: 'Build a pension corpus with tax benefits up to ₹50,000.',
        cta: 'Open NPS',
        ctaColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      {
        id: 'lp6',
        name: 'Senior Citizen FD',
        desc: 'Earn 0.5% extra interest — up to 8.0% p.a.',
        cta: 'Open FD',
        ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
      },
    ],
  },
  {
    id: 'le4',
    label: 'Started a Business',
    products: [
      {
        id: 'lp7',
        name: 'Business Current Account',
        desc: 'Zero balance current account with free NEFT/RTGS.',
        cta: 'Open Account',
        ctaColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      {
        id: 'lp8',
        name: 'MSME Business Loan',
        desc: 'Up to ₹50L collateral-free loan at 11.5% p.a.',
        cta: 'Apply Now',
        ctaColor: 'bg-green-600 hover:bg-green-700 text-white',
      },
    ],
  },
];

const LIFE_STAGES = ['Student', 'Working', 'Family', 'Senior'];

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  p1: TrendingUp,
  p2: Shield,
  p3: Home,
};

const PRODUCT_ICON_COLORS: Record<string, string> = {
  p1: 'bg-blue-100 text-blue-600',
  p2: 'bg-green-100 text-green-600',
  p3: 'bg-orange-100 text-orange-600',
};

export default function LifeEvents() {
  const [eventDismissed, setEventDismissed] = useState(false);
  const [eventConfirmed, setEventConfirmed] = useState(false);
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);

  const toggleTrigger = (id: string) => {
    setExpandedTrigger((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Life Events &amp; Recommendations</h1>
        <p className="text-gray-500 text-sm">
          AI-detected life changes with personalised financial suggestions
        </p>
      </div>

      {/* Detected Event Banner */}
      {!eventDismissed && (
        <div
          className={`rounded-xl p-5 border transition-all ${eventConfirmed ? 'bg-green-50 border-green-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {eventConfirmed ? '✅ Event Confirmed' : 'Salary Increase Detected'}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {eventConfirmed
                    ? 'Great! Your recommendations have been updated based on your salary increase.'
                    : 'Your income grew 15% this month. We have personalized recommendations for you.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEventDismissed(true)}
              className="text-gray-400 hover:text-gray-600 transition ml-3"
              aria-label="Dismiss event"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {!eventConfirmed && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEventConfirmed(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                <CheckCircle className="w-4 h-4" /> Confirm this event
              </button>
              <button
                onClick={() => setEventDismissed(true)}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left — Recommended Products (2/3 width) */}
        <div className="col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Recommended Products</h2>
          {RECOMMENDED_PRODUCTS.map((product) => {
            const Icon = PRODUCT_ICONS[product.id];
            const iconClass = PRODUCT_ICON_COLORS[product.id];
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
              >
                {Icon && (
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{product.desc}</p>
                </div>
                <button
                  className={`shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition ${product.ctaColor}`}
                >
                  {product.cta}
                </button>
              </div>
            );
          })}

          {/* Life Event Triggers */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-2">
            <h2 className="font-semibold text-gray-900 mb-3">Other Life Event Triggers</h2>
            <div className="space-y-2">
              {LIFE_EVENT_TRIGGERS.map((trigger) => (
                <div key={trigger.id}>
                  <button
                    onClick={() => toggleTrigger(trigger.id)}
                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-700 text-sm font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    <span>{trigger.label}</span>
                    {expandedTrigger === trigger.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedTrigger === trigger.id && (
                    <div className="mt-2 space-y-2 pl-2">
                      {trigger.products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{p.desc}</p>
                          </div>
                          <button
                            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition ${p.ctaColor}`}
                          >
                            {p.cta}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Life Stage Timeline (1/3 width) */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-5">Life Stage</h2>
            <div className="relative flex flex-col gap-0">
              {LIFE_STAGES.map((stage, i) => {
                const isCurrent = stage === 'Working';
                const isPast = i < LIFE_STAGES.indexOf('Working');
                return (
                  <div key={stage} className="flex items-start gap-3 pb-6 last:pb-0 relative">
                    {/* Connector line */}
                    {i < LIFE_STAGES.length - 1 && (
                      <div className="absolute left-[13px] top-7 w-0.5 h-full bg-gray-200" />
                    )}
                    {/* Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        isCurrent
                          ? 'bg-blue-600 border-blue-600'
                          : isPast
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white border-gray-300'
                      }`}
                    >
                      {isCurrent && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      {isPast && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="pt-0.5">
                      <p
                        className={`text-sm font-semibold ${isCurrent ? 'text-blue-700' : isPast ? 'text-green-700' : 'text-gray-400'}`}
                      >
                        {stage}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {stage === 'Student' && 'Education & savings basics'}
                        {stage === 'Working' && 'Career growth & wealth building'}
                        {stage === 'Family' && "Protection & children's future"}
                        {stage === 'Senior' && 'Retirement & legacy planning'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
