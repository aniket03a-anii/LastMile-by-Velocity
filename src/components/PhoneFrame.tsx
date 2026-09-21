import React, { useState, useEffect } from 'react';
import { 
  Signal, 
  Battery, 
  Bluetooth, 
  Radio, 
  ShieldAlert, 
  Smartphone, 
  Maximize2, 
  Activity,
  Layers,
  Hospital,
  PlayCircle,
  Cpu,
  Home,
  Bot,
  Bell,
  User,
  Zap,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { AppRole, UserProfile } from '../types';

interface PhoneFrameProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  children: React.ReactNode;
  airplaneMode: boolean;
  onToggleAirplaneMode: () => void;
  bleActive: boolean;
  onToggleBle: () => void;
  queueCount: {
    critical: number;
    total: number;
  };
  currentUser: UserProfile | null;
  unreadNotificationsCount: number;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  currentRole,
  onSelectRole,
  children,
  airplaneMode,
  onToggleAirplaneMode,
  bleActive,
  onToggleBle,
  queueCount,
  currentUser,
  unreadNotificationsCount,
  onOpenAuth,
  onOpenNotifications,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: AppRole; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    { id: 'HOME_DASHBOARD', label: 'Wallet', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'ASHA_CAPTURE', label: 'Intake', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'RELAY_NODE', label: 'Relay', icon: <Layers className="w-3.5 h-3.5" /> },
    { 
      id: 'PHC_QUEUE', 
      label: 'PHC Queue', 
      icon: <Hospital className="w-3.5 h-3.5" />, 
      badge: queueCount.critical > 0 ? `${queueCount.critical}` : queueCount.total > 0 ? `${queueCount.total}` : undefined,
      badgeColor: queueCount.critical > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'
    },
    { id: 'AI_CHATBOT', label: 'Copilot', icon: <Bot className="w-3.5 h-3.5" />, badge: 'AI', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'LIVE_DEMO', label: 'Demo', icon: <PlayCircle className="w-3.5 h-3.5" /> },
    { id: 'NPU_BENCHMARKS', label: 'NPU Lab', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  // Mobile bottom tab bar items matching the screenshot
  const bottomTabs: { id: AppRole; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'HOME_DASHBOARD', label: 'Wallet', icon: <Home className="w-5 h-5" /> },
    { id: 'ASHA_CAPTURE', label: 'Intake', icon: <Activity className="w-5 h-5" /> },
    { id: 'RELAY_NODE', label: 'Relay', icon: <Layers className="w-5 h-5" /> },
    { id: 'PHC_QUEUE', label: 'Casualty', icon: <Hospital className="w-5 h-5" />, badge: queueCount.critical },
    { id: 'AI_CHATBOT', label: 'Copilot', icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#EEF1F5] text-slate-900 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 transition-all duration-300 font-sans selection:bg-[#A3E635] selection:text-black">
      
      {/* Top Application Bar & Controls */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-3 py-2 px-3 sm:px-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm">
        
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#A3E635] text-slate-950 flex items-center justify-center shadow-sm font-bold">
            <Radio className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-base">LastMile Link</span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#A3E635]/30 text-slate-900 border border-[#A3E635]/60 font-mono">
                P2P MESH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Offline AI-Prioritized Mesh Relay for Frontline Healthcare Dead Zones
            </p>
          </div>
        </div>

        {/* Action Controls & Radio Toggles */}
        <div className="flex items-center gap-2 text-xs">
          
          {/* User Profile Chip */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all shadow-sm group"
            title="User Profile & Authentication"
          >
            <div className="w-5 h-5 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-[10px]">
              {currentUser?.avatarInitials || 'HW'}
            </div>
            <span className="font-bold text-[11px] hidden md:inline">
              {currentUser?.name?.split(' ')[0] || 'Worker'}
            </span>
          </button>

          {/* Notification Center Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all shadow-sm"
            title="Notifications & Simulation Station"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white font-mono">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Airplane Mode / Dead Zone Radio Toggle */}
          <button
            onClick={onToggleAirplaneMode}
            id="toggle-airplane-mode-btn"
            title="Toggle Airplane Mode (Simulates Connectivity Dead Zone)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              airplaneMode 
                ? 'bg-amber-50 text-amber-900 font-bold border-amber-300 shadow-sm' 
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${airplaneMode ? 'text-amber-600' : 'text-slate-500'}`} />
            <span className="font-bold text-[11px]">{airplaneMode ? 'Dead Zone (Airplane)' : 'Cellular Active'}</span>
          </button>

          {/* BLE Mesh Radio Toggle */}
          <button
            onClick={onToggleBle}
            id="toggle-ble-mesh-btn"
            title="Toggle Bluetooth Low Energy 5.2 Mesh"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              bleActive 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${bleActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="font-semibold text-[11px] hidden sm:inline">{bleActive ? 'BLE 5.2' : 'Mesh Off'}</span>
          </button>

          {/* Viewport Switcher */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            id="toggle-viewport-size-btn"
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
            title={isExpanded ? 'Switch to Smartphone Frame' : 'Expand to Full Canvas'}
          >
            {isExpanded ? <Smartphone className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Role Navigation Bar (Clean Pill Bar) */}
      <nav className="w-full max-w-5xl mb-3 flex items-center justify-between overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = currentRole === item.id;
          return (
            <button
              key={item.id}
              id={`nav-role-${item.id.toLowerCase()}`}
              onClick={() => onSelectRole(item.id)}
              className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold tracking-tight transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-[#A3E635] text-slate-950' : (item.badgeColor || 'bg-slate-100 text-slate-600')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main App Canvas Container */}
      <main className="w-full flex justify-center items-start flex-1 pb-4">
        <div 
          className={`transition-all duration-300 ease-out ${
            isExpanded 
              ? 'w-full max-w-5xl bg-[#F5F6F8] border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xl overflow-hidden' 
              : 'w-full max-w-[400px] rounded-[52px] bg-[#F5F6F8] border-[10px] border-[#18181B] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col min-h-[820px] max-h-[92vh]'
          }`}
        >
          {/* Smartphone Hardware Notch / Status Bar (Light iOS Theme) */}
          {!isExpanded && (
            <div className="w-full bg-[#F5F6F8] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-900 select-none z-30 shrink-0">
              <span className="font-semibold tracking-tight text-xs">{timeStr}</span>

              {/* Dynamic Island */}
              <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-white tracking-wider">OFFLINE</span>
              </div>

              {/* Hardware Status Icons */}
              <div className="flex items-center gap-1.5 text-slate-800">
                {airplaneMode ? (
                  <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-200/80 px-1 py-0.2 rounded">
                    ✈ NO CELL
                  </span>
                ) : (
                  <Signal className="w-3 h-3" />
                )}
                <Wifi className="w-3 h-3 text-slate-400" />
                <div className="flex items-center gap-0.5 ml-0.5">
                  <div className="w-5 h-2.5 rounded-[4px] border border-slate-800 p-0.5 flex items-center">
                    <div className="h-full w-full bg-[#10B981] rounded-[2px]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child Views Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#F5F6F8]">
            {children}
          </div>

          {/* Smartphone Bottom Navigation Bar (Matching screenshot bottom tab bar) */}
          {!isExpanded && (
            <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2 px-3 flex items-center justify-around shrink-0 shadow-lg z-20">
              {bottomTabs.map((tab) => {
                const isActive = currentRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectRole(tab.id)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative group transition-all"
                  >
                    <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {tab.icon}
                    </div>
                    <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-slate-900 mt-0.5" />
                    )}
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Smartphone Bottom Home Gesture Bar */}
          {!isExpanded && (
            <div className="w-full pb-1 pt-0.5 bg-white flex items-center justify-center shrink-0">
              <div 
                className="w-32 h-1 bg-slate-300 hover:bg-slate-400 transition-colors rounded-full cursor-pointer" 
                onClick={() => onSelectRole('HOME_DASHBOARD')} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

