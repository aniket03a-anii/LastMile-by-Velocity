import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Radio, 
  Ambulance, 
  Hospital, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { PushNotification, AppRole } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationShadeProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onNavigate: (role: AppRole) => void;
}

export const NotificationShade: React.FC<NotificationShadeProps> = ({
  isOpen,
  onClose,
  notifications,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleNotificationClick = (notif: PushNotification) => {
    notificationService.markAsRead(notif.id);
    if (notif.actionTargetRole) {
      onNavigate(notif.actionTargetRole);
    }
    onClose();
  };

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'CRITICAL_ALERT':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'MESH_RELAY':
        return <Radio className="w-3.5 h-3.5 text-blue-600" />;
      case 'DISPATCH_108':
        return <Ambulance className="w-3.5 h-3.5 text-amber-600" />;
      case 'BOOKING_CONFIRMED':
        return <Hospital className="w-3.5 h-3.5 text-emerald-600" />;
      case 'GATEWAY_SYNC':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Field Notifications</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold font-mono">
                  {notifications.filter(n => !n.read).length} Unread
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">BLE Mesh Dispatches & Clinical Urgency Alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <button
                onClick={() => notificationService.markAllAsRead()}
                title="Mark all as read"
                className="p-1.5 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 text-[10px] flex items-center gap-1 px-2.5 font-bold"
              >
                <Check className="w-3 h-3" />
                <span>Read All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Scenario Trigger Station */}
        <div className="p-3 bg-[#F5F6F8] border-b border-slate-100">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Test Push Notification Scenarios:
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Instant Trigger</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => notificationService.triggerScenario('CRITICAL_PPH')}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all flex items-center gap-2 group shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-900 truncate">1. Maternal Shock</p>
                <p className="text-[8px] text-slate-500 truncate">PPH Score 94 to PHC</p>
              </div>
            </button>

            <button
              onClick={() => notificationService.triggerScenario('MESH_HANDSHAKE')}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all flex items-center gap-2 group shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-900 truncate">2. Hop Handshake</p>
                <p className="text-[8px] text-slate-500 truncate">RTC Bus 4 peer relay</p>
              </div>
            </button>

            <button
              onClick={() => notificationService.triggerScenario('AMBULANCE_108')}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all flex items-center gap-2 group shadow-xs"
            >
              <Ambulance className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-900 truncate">3. 108 Dispatch ETA</p>
                <p className="text-[8px] text-slate-500 truncate">Ambulance to Village</p>
              </div>
            </button>

            <button
              onClick={() => notificationService.triggerScenario('BED_BOOKING')}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all flex items-center gap-2 group shadow-xs"
            >
              <Hospital className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-900 truncate">4. Bed & Blood Booked</p>
                <p className="text-[8px] text-slate-500 truncate">District ICU confirmed</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-2 bg-[#F5F6F8]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-bold text-slate-600">No notifications yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Use the scenario buttons above to simulate field dispatches.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-3xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                  !notif.read 
                    ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' 
                    : 'bg-white/60 border-slate-100 opacity-60'
                }`}
              >
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-3.5 right-3.5 animate-pulse" />
                )}

                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border ${
                  notif.priority === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-slate-100 border-slate-200'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center px-4">
            <span className="text-[10px] text-slate-400 font-mono font-medium">Push Daemon: Active</span>
            <button
              onClick={() => notificationService.clearAll()}
              className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
