import React from 'react';
import { 
  AlertTriangle, 
  Radio, 
  Ambulance, 
  CheckCircle2, 
  Hospital, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PushNotification, AppRole } from '../types';

interface PushNotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
  onNavigate: (role: AppRole) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onNavigate,
}) => {
  if (!notification) return null;

  const isCritical = notification.priority === 'CRITICAL';

  const getIcon = () => {
    switch (notification.type) {
      case 'CRITICAL_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />;
      case 'MESH_RELAY':
        return <Radio className="w-4 h-4 text-blue-600" />;
      case 'DISPATCH_108':
        return <Ambulance className="w-4 h-4 text-amber-600" />;
      case 'BOOKING_CONFIRMED':
        return <Hospital className="w-4 h-4 text-emerald-600" />;
      case 'GATEWAY_SYNC':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleAction = () => {
    if (notification.actionTargetRole) {
      onNavigate(notification.actionTargetRole);
    }
    onDismiss();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div 
        onClick={handleAction}
        className={`p-3.5 rounded-3xl border shadow-xl backdrop-blur-xl cursor-pointer transition-all flex items-start gap-3 select-none animate-in slide-in-from-top-4 duration-300 ${
          isCritical 
            ? 'bg-white/95 border-rose-200 shadow-rose-900/10 ring-2 ring-rose-500/20' 
            : 'bg-white/95 border-slate-200/80 shadow-slate-900/10'
        }`}
      >
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
          isCritical 
            ? 'bg-rose-50 text-rose-600 border-rose-200' 
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {notification.type.replace('_', ' ')}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Just Now</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 leading-snug mt-0.5 truncate">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5">
            {notification.message}
          </p>

          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-1.5">
            <span>Tap to review</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
