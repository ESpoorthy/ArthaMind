import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Fish,
  CreditCard,
  Phone,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TRANSACTIONS } from '../../data/mockData';

interface ThreatCard {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  expandedDetail: string;
}

const THREAT_CARDS: ThreatCard[] = [
  {
    id: 'phishing',
    icon: Fish,
    title: 'Phishing Attacks',
    desc: 'Fake SBI SMS/emails asking for OTP or card details. Never share OTP with anyone, including bank staff.',
    expandedDetail:
      'Common signs: Urgency in message, suspicious links (sbi-secure.xyz instead of onlinesbi.com), requests for OTP. If you receive such a message, report it to 1800-111-109.',
  },
  {
    id: 'skimming',
    icon: CreditCard,
    title: 'Card Skimming',
    desc: 'Card data stolen at ATMs using hidden devices. Always check ATM card slots before use.',
    expandedDetail:
      'Protect yourself: Cover the keypad when entering PIN, prefer ATMs in well-lit areas, use cardless cash withdrawal when possible.',
  },
  {
    id: 'vishing',
    icon: Phone,
    title: 'Vishing (Voice Fraud)',
    desc: 'Fraudsters call posing as bank officials asking for account details.',
    expandedDetail:
      'SBI will NEVER ask for: OTP, CVV, full card number, or net banking password over phone. Hang up and call 1800-11-2211 to verify.',
  },
];

const SAFE_PRACTICES = [
  'Never share OTP with anyone',
  'Check URL before entering banking credentials',
  'Use strong, unique passwords',
  'Enable transaction alerts on your phone',
  'Regularly check your account statements',
  'Verify caller identity before sharing any information',
];

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: "You receive an SMS saying 'Your SBI account will be blocked. Click here to verify: sbi-secure.xyz'. What should you do?",
    options: [
      'Click the link immediately',
      'Call the number in the SMS',
      'Delete the SMS and report to bank',
      'Share your OTP to verify',
    ],
    correct: 2,
    explanation:
      'This is a phishing attempt. SBI never sends links asking for personal details. Report to 1800-111-109.',
  },
  {
    q: "A person calls claiming to be an SBI officer and asks for your OTP to 'verify' your account. You should:",
    options: [
      "Give the OTP since they're from the bank",
      'Ask them to call back later',
      'Hang up immediately — banks never ask for OTP',
      'Give only the first 3 digits',
    ],
    correct: 2,
    explanation: 'Banks NEVER ask for OTP, CVV, or passwords over phone. This is a vishing attack.',
  },
  {
    q: 'Which of these is a sign of a fake banking website?',
    options: [
      'URL starts with https://',
      "URL is 'sbi-netbanking-secure.com'",
      'Website has SBI logo',
      'Page asks for username',
    ],
    correct: 1,
    explanation:
      'Always check the exact URL. Official SBI site is onlinesbi.sbi. Fake sites use similar-looking domains.',
  },
  {
    q: 'You notice a transaction of ₹15,000 you did not make. What is the FIRST thing to do?',
    options: [
      'Wait to see if it reverses',
      'Block your card immediately via the app',
      'Tell a friend',
      'Change your email password',
    ],
    correct: 1,
    explanation:
      'Block your card immediately to prevent further transactions. Then report to the bank within 24 hours.',
  },
  {
    q: 'Which practice makes your banking most secure?',
    options: [
      'Using the same password everywhere for easy memory',
      'Sharing credentials with trusted family',
      'Enabling 2FA and using unique strong passwords',
      'Writing passwords in a notebook',
    ],
    correct: 2,
    explanation:
      'Always use unique strong passwords with two-factor authentication. Never share credentials with anyone.',
  },
];

function getRiskBadge(txId: string): { label: string; color: string } {
  if (txId === 't1' || txId === 't2')
    return { label: 'Low Risk', color: 'bg-green-100 text-green-700' };
  if (txId === 't4') return { label: 'Safe', color: 'bg-blue-100 text-blue-700' };
  if (txId === 't9') return { label: 'Verified', color: 'bg-blue-100 text-blue-700' };
  return { label: 'Low Risk', color: 'bg-green-100 text-green-700' };
}

export default function FraudAwareness() {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const displayTransactions = TRANSACTIONS.slice(0, 5);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === QUIZ_QUESTIONS[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= QUIZ_QUESTIONS.length) {
      setQuizCompleted(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
    }
  };

  const handleRetake = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  const getScoreMessage = () => {
    if (score === 5) return 'Perfect! Outstanding!';
    if (score >= 4) return 'Excellent!';
    if (score >= 3) return 'Good job!';
    return 'Keep learning!';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛡️ Fraud Awareness Centre</h1>
        <p className="text-gray-500 text-sm">
          Stay protected with AI-powered fraud detection and education
        </p>
      </div>

      {/* Active Alert Banner */}
      {!alertDismissed && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-sm relative">
          <button
            onClick={() => setAlertDismissed(true)}
            className="absolute top-3 right-3 text-white hover:text-red-200 transition"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">⚠️ Suspicious Transaction Blocked</p>
              <p className="text-red-100 text-sm mt-1">
                A transaction of ₹45,000 from an unrecognised location was automatically blocked on
                Jun 27, 2026.
              </p>
              <p className="text-red-200 text-xs mt-2">
                Why was this flagged? Unusual location · High amount · Outside normal hours
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              It was me — Unblock
            </button>
            <button className="bg-red-700 hover:bg-red-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Confirm Fraud
            </button>
          </div>
          <div className="mt-4 bg-yellow-100 text-yellow-800 rounded-lg px-4 py-3 text-sm">
            💡 This is how AI fraud detection works: We analyse 50+ signals including location,
            device, time, and amount to protect you in real-time.
          </div>
        </div>
      )}

      {/* Threat Warning Cards */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 text-lg">Threat Warnings</h2>
        <div className="grid grid-cols-3 gap-4">
          {THREAT_CARDS.map((card) => {
            const Icon = card.icon;
            const isExpanded = expandedThreat === card.id;
            return (
              <div
                key={card.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">{card.desc}</p>
                {isExpanded && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-3 leading-relaxed">
                    {card.expandedDetail}
                  </p>
                )}
                <button
                  onClick={() => setExpandedThreat(isExpanded ? null : card.id)}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 transition"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" /> Learn More
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Banking Practices */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Safe Banking Practices</h2>
        <div className="grid grid-cols-2 gap-2">
          {SAFE_PRACTICES.map((practice, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm text-gray-700">{practice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History with AI Risk Scores */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">
          Transaction History with AI Risk Scores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-3 font-medium">Transaction</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">AI Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayTransactions.map((tx) => {
                const badge = getRiskBadge(tx.id);
                return (
                  <tr key={tx.id} className="py-3">
                    <td className="py-3 font-medium text-gray-800">{tx.desc}</td>
                    <td className="py-3 text-gray-500">{tx.date}</td>
                    <td
                      className={`py-3 font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <div className="relative group">
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            Analysed by Fraud Agent
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Knowledge Quiz */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Security Knowledge Quiz</h2>
            <p className="text-xs text-gray-500">
              Test your fraud awareness — earn the Security Savvy badge!
            </p>
          </div>
        </div>

        {quizCompleted ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {score}/{QUIZ_QUESTIONS.length}
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-2">{getScoreMessage()}</p>
            {score >= 4 && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                🏆 "Security Savvy" Badge Earned!
              </div>
            )}
            <p className="text-sm text-gray-500 mb-5">
              {score >= 4
                ? 'Excellent fraud awareness! Your account is in safe hands.'
                : 'Review the threat warnings above to improve your score.'}
            </p>
            <button
              onClick={handleRetake}
              className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>
                  Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span>{Math.round((currentQ / QUIZ_QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all"
                  style={{ width: `${(currentQ / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <p className="text-sm font-medium text-gray-900 mb-4 leading-relaxed">
              {QUIZ_QUESTIONS[currentQ].q}
            </p>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {QUIZ_QUESTIONS[currentQ].options.map((opt, idx) => {
                let btnClass = 'w-full text-left px-4 py-3 rounded-lg border text-sm transition ';
                if (selectedAnswer === null) {
                  btnClass +=
                    'border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700';
                } else if (idx === QUIZ_QUESTIONS[currentQ].correct) {
                  btnClass += 'border-green-500 bg-green-50 text-green-800 font-medium';
                } else if (idx === selectedAnswer) {
                  btnClass += 'border-red-500 bg-red-50 text-red-800';
                } else {
                  btnClass += 'border-gray-100 bg-gray-50 text-gray-400';
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} className={btnClass}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {selectedAnswer !== null && (
              <div
                className={`rounded-lg px-4 py-3 text-sm mb-4 ${selectedAnswer === QUIZ_QUESTIONS[currentQ].correct ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
              >
                <span className="font-medium">
                  {selectedAnswer === QUIZ_QUESTIONS[currentQ].correct
                    ? '✅ Correct! '
                    : '❌ Incorrect. '}
                </span>
                {QUIZ_QUESTIONS[currentQ].explanation}
              </div>
            )}

            {/* Next button */}
            {selectedAnswer !== null && (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                {currentQ + 1 >= QUIZ_QUESTIONS.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
