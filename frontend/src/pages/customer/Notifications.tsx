import { useState } from 'react';
import { NOTIFICATIONS } from '../../data/mockData';
import { Bell, AlertTriangle, Info } from 'lucide-react';

const icons = { high: AlertTriangle, medium: Bell, low: Info, critical: AlertTriangle };
const colors = { high: 'text-red-600 bg-red-50', medium: 'text-orange-600 bg-orange-50', low: 'text-blue-600 bg-blue-50', critical: 'text-red-700 bg-red-100' };

export default function Notifications() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Mark all as read
        </button>
      </div>
      <div className="space-y-3">
        {notifs.map(n => {
          const Icon = icons[n.priority as keyof typeof icons] ?? Bell;
          const col = colors[n.priority as keyof typeof colors] ?? colors.low;
          return (
            <div key={n.id} onClick={() => markRead(n.id)} className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition hover:shadow-md ${n.read ? 'border-gray-100 opacity-70' : 'border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${col}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{n.time}</span>
                      {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.msg}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
