import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../store/authStore';
import { AI_RESPONSES } from '../../data/mockData';
import { Send, Mic, Bot, User } from 'lucide-react';

interface Msg { id: string; role: 'user' | 'bot'; text: string; agent?: string; time: string; }

function getReply(msg: string): { text: string; agent: string } {
  const lower = msg.toLowerCase();
  for (const key of Object.keys(AI_RESPONSES)) {
    if (lower.includes(key)) return AI_RESPONSES[key];
  }
  return { text: `Thank you for your query. I'm ArthaMind AI, your personal banking assistant. I can help you with account balances, card management, loans, fixed deposits, and much more. Please ask me anything specific about your banking needs!`, agent: 'FAQ Agent' };
}

export default function AIChat() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', role: 'bot', text: `Hello ${user?.name?.split(' ')[0]}! 👋 I'm ArthaMind, your AI banking assistant powered by Gemini 2.5 Flash.\n\nI can help you with:\n• Account balances & transactions\n• Card management\n• Loan eligibility & EMI\n• Fixed deposits\n• Fraud alerts\n\nHow can I help you today?`, agent: 'Router Agent', time: 'now' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: input, time: 'now' };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    const reply = getReply(input);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now().toString(), role: 'bot', text: reply.text, agent: reply.agent, time: 'now' }]);
    }, 700);
  };

  const suggestions = ['Check my balance', 'Block my card', 'Loan eligibility', 'FD rates', 'Recent transactions'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">ArthaMind AI Assistant</p>
          <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online · Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'bot' ? 'bg-blue-600' : 'bg-gray-600'}`}>
              {m.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-md ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              {m.agent && <span className="text-xs text-blue-500 mb-1 ml-1">{m.agent}</span>}
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${m.role === 'bot' ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'bg-blue-600 text-white'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex gap-1 items-center">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {/* Suggestions */}
      <div className="bg-white border-t px-4 pt-3 flex gap-2 overflow-x-auto">
        {suggestions.map(s => (
          <button key={s} onClick={() => { setInput(s); }} className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white p-4 flex gap-3 border-t">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask me anything about your banking..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition" title="Voice (coming soon)">
          <Mic className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={send} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
