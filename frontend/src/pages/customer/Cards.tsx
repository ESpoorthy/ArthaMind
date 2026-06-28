import { useState } from 'react';
import { CARDS } from '../../data/mockData';
import { Shield, ShieldOff, Wifi } from 'lucide-react';

export default function Cards() {
  const [cards, setCards] = useState(CARDS);

  const toggle = (id: string) =>
    setCards(cs => cs.map(c => c.cardId === id ? { ...c, status: c.status === 'Active' ? 'Blocked' : 'Active' } : c));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cards</h1>
      <div className="grid grid-cols-2 gap-6">
        {cards.map(card => (
          <div key={card.cardId} className="space-y-3">
            {/* Visual card */}
            <div className={`relative rounded-2xl p-6 shadow-xl overflow-hidden h-48 ${card.type === 'Debit' ? 'bg-gradient-to-br from-blue-700 to-indigo-900' : 'bg-gradient-to-br from-gray-800 to-gray-950'}`}>
              {/* Chip */}
              <div className="w-10 h-8 bg-yellow-400/80 rounded-md mb-4" />
              {card.status === 'Blocked' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                  <span className="text-white font-bold text-lg tracking-widest">BLOCKED</span>
                </div>
              )}
              <Wifi className="absolute top-5 right-5 text-white/50 w-5 h-5 rotate-90" />
              <p className="text-white font-mono text-lg tracking-widest mb-2">{card.number}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-xs">EXPIRES</p>
                  <p className="text-white text-sm font-medium">{card.expiryDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">{card.type} · {card.network}</p>
                  {card.limit && <p className="text-white text-sm font-medium">Limit: ₹{card.limit.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            </div>

            {/* Card actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{card.type} Card</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {card.status}
                  </span>
                </div>
                <button onClick={() => toggle(card.cardId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${card.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}>
                  {card.status === 'Active' ? <><ShieldOff className="w-4 h-4" /> Block</> : <><Shield className="w-4 h-4" /> Unblock</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
