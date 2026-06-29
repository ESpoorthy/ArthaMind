import { useState } from 'react';
import { Lock, Download, Trash2, Eye, Bell } from 'lucide-react';

interface ConsentToggle {
  id: string;
  label: string;
  desc: string;
  on: boolean;
}

interface PrivacyToggleBtnProps {
  on: boolean;
  onToggle: () => void;
}

function ToggleBtn({ on, onToggle }: PrivacyToggleBtnProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${on ? 'bg-blue-600' : 'bg-gray-300'}`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function PrivacyControls() {
  const [consents, setConsents] = useState<ConsentToggle[]>([
    {
      id: 'txn',
      label: 'Transaction Pattern Analysis',
      desc: 'AI analyses your spending to suggest products',
      on: true,
    },
    {
      id: 'invest',
      label: 'Investment Behavior Tracking',
      desc: 'Track investment patterns for SIP recommendations',
      on: true,
    },
    {
      id: 'bill',
      label: 'Bill Payment Intelligence',
      desc: 'Monitor payment patterns for autopay suggestions',
      on: true,
    },
    {
      id: 'location',
      label: 'Location-based Suggestions',
      desc: 'Use location context for travel insurance offers',
      on: false,
    },
  ]);

  const [exportRequested, setExportRequested] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const toggleConsent = (id: string) => {
    setConsents((prev) => prev.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 4000);
  };

  const privacyScore = 78;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔒 Privacy &amp; Data Controls</h1>
        <p className="text-gray-500 text-sm">
          Control how ArthaMind uses your data to personalise your experience
        </p>
      </div>

      {/* Consent Summary Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Your data helps us provide personalised banking. You have full control — toggle any
            setting off at any time. All data is encrypted and never shared with third parties.
          </p>
        </div>
      </div>

      {/* AI Personalisation Settings */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-1 text-lg">AI Personalisation Settings</h2>
        <div className="space-y-1">
          {consents.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div className="flex-1 pr-6">
                <p className="text-sm font-medium text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
              <ToggleBtn on={c.on} onToggle={() => toggleConsent(c.id)} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 italic">
          Turning off personalisation may reduce the relevance of product suggestions.
        </p>
      </div>

      {/* Data You've Shared */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Data You've Shared</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Transactions Analysed',
              value: '247',
              color: 'text-blue-700',
              bg: 'bg-blue-50',
            },
            {
              label: 'Behavioural Patterns',
              value: '12 detected',
              color: 'text-purple-700',
              bg: 'bg-purple-50',
            },
            {
              label: 'Recommendations Shown',
              value: '34',
              color: 'text-green-700',
              bg: 'bg-green-50',
            },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Data Rights */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4 text-lg">Your Data Rights</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Download */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">Download My Data</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Get a full export of your banking data and AI insights
            </p>
            {exportRequested ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✅ Export requested. You'll receive an email within 24 hours.
              </p>
            ) : (
              <button
                onClick={() => setExportRequested(true)}
                className="text-sm bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Request Export
              </button>
            )}
          </div>

          {/* Delete AI Profile */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">Delete AI Profile</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Remove all behavioural data and start fresh
            </p>
            {deleteSuccess ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✅ AI profile deleted. Personalisation has been reset.
              </p>
            ) : deleteConfirm ? (
              <div>
                <p className="text-xs text-gray-700 mb-2">
                  Are you sure? This will reset all personalisation.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteConfirm}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-sm border border-red-500 text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition"
              >
                Delete Profile
              </button>
            )}
          </div>

          {/* View Analysis History */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-gray-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">View Analysis History</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              See what patterns AI has detected about you
            </p>
            <button className="text-sm bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition">
              View History
            </button>
          </div>

          {/* Notification Preferences */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-gray-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">Notification Preferences</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Control which AI insights trigger notifications
            </p>
            <button className="text-sm bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition">
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Score */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-lg">Privacy Score</h2>
          <span className="text-sm font-bold text-blue-700">{privacyScore}/100 — Good</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
          <div
            className="h-3 rounded-full bg-blue-500 transition-all"
            style={{ width: `${privacyScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Enable 2FA and review location settings to improve your score.
        </p>
      </div>
    </div>
  );
}
