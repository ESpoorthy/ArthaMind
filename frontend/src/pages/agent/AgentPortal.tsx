import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { SUPPORT_TICKETS } from '../../data/mockData';
import { Building2, LogOut, CheckCircle } from 'lucide-react';

const pColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};
const sColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
};

interface SentMessage {
  role: 'agent';
  text: string;
  time: string;
}

export default function AgentPortal() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tickets, setTickets] = useState(SUPPORT_TICKETS);
  const [selected, setSelected] = useState(tickets[0]);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Record<string, SentMessage[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selected.id]);

  const resolve = (id: string) => {
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t)));
    setSelected((s) => (s.id === id ? { ...s, status: 'resolved' } : s));
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selected.id]: [
        ...(prev[selected.id] || []),
        { role: 'agent', text: reply, time: 'Just now' },
      ],
    }));
    setReply('');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-green-800">
          <Building2 className="w-6 h-6 text-white" />
          <div>
            <p className="text-white font-bold">ArthaMind</p>
            <p className="text-green-300 text-xs">Agent Portal</p>
          </div>
        </div>
        <div className="p-4 border-b border-green-800">
          <p className="text-green-300 text-xs">Logged in as</p>
          <p className="text-white font-semibold">{user?.name}</p>
          <span className="text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full">
            Support Agent
          </span>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="text-green-400 text-xs font-medium px-2 mb-2">
            TICKET QUEUE ({tickets.filter((t) => t.status !== 'resolved').length} open)
          </p>
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left p-3 rounded-lg mb-1.5 transition ${selected.id === t.id ? 'bg-white/20' : 'hover:bg-green-800'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pColors[t.priority]}`}
                >
                  {t.priority}
                </span>
                <span className="text-green-400 text-xs">{t.time}</span>
              </div>
              <p className="text-white text-sm font-medium truncate">{t.customer}</p>
              <p className="text-green-300 text-xs truncate">{t.issue}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            logout();
            nav('/login');
          }}
          className="m-3 flex items-center gap-2 text-green-300 hover:text-white text-sm p-3 rounded-lg hover:bg-green-800 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{selected.customer}</p>
            <p className="text-sm text-gray-500">{selected.issue}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${pColors[selected.priority]}`}
            >
              {selected.priority}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${sColors[selected.status]}`}
            >
              {selected.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Customer · {selected.time}</p>
                <p className="text-gray-800">{selected.issue}</p>
              </div>
              {/* AI Suggested Reply */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" /> AI Suggested Reply
                </p>
                <p className="text-sm text-gray-700">{selected.aiReply}</p>
                <button
                  onClick={() => setReply(selected.aiReply)}
                  className="mt-2 text-xs text-yellow-700 font-medium hover:text-yellow-800 underline"
                >
                  Use this reply
                </button>
              </div>
              {/* Sent agent messages */}
              {(messages[selected.id] || []).map((msg, i) => (
                <div key={i} className="flex justify-end">
                  <div className="max-w-sm">
                    <p className="text-xs text-gray-400 text-right mb-1">You · {msg.time}</p>
                    <div className="bg-green-600 text-white rounded-xl rounded-tr-sm px-4 py-3 text-sm">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            {/* Reply box */}
            <div className="bg-white border-t p-4 flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder="Type your reply..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-500"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={sendReply}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Send
                </button>
                <button
                  onClick={() => resolve(selected.id)}
                  disabled={selected.status === 'resolved'}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
              </div>
            </div>
          </div>

          {/* Customer info panel */}
          <div className="w-64 bg-white border-l p-4 overflow-y-auto shrink-0">
            <p className="font-semibold text-gray-900 mb-3">Customer Info</p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-sm">{selected.customer}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-medium text-sm">{selected.cat}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Reported</p>
                <p className="font-medium text-sm">{selected.time}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Ticket ID</p>
                <p className="font-mono text-xs text-gray-700">{selected.id.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
