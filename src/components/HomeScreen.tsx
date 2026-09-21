import React, { useState } from 'react';
import { 
  PlusCircle, 
  Radio, 
  Building2, 
  Bot, 
  Zap, 
  Play, 
  Cpu, 
  AlertTriangle, 
  ChevronRight, 
  ShieldAlert, 
  Ambulance, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Flame, 
  WifiOff,
  Bell,
  Sparkles,
  Search,
  ArrowUpRight,
  TrendingUp,
  ArrowDownRight,
  CreditCard,
  HeartPulse,
  Send,
  Hospital
} from 'lucide-react';
import { AppRole, UserProfile, HealthCase, PushNotification } from '../types';
import { meshRelay } from '../services/meshRelayEngine';
import { notificationService } from '../services/notificationService';

interface HomeScreenProps {
  currentUser: UserProfile | null;
  onNavigate: (role: AppRole) => void;
  airplaneMode: boolean;
  bleActive: boolean;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onNavigate,
  airplaneMode,
  bleActive,
  onOpenAuth,
  onOpenNotifications,
  unreadNotificationCount,
}) => {
  const [heroCardTab, setHeroCardTab] = useState<'CARD' | 'CHART'>('CARD');
  const queue = meshRelay.getPhcQueue();
  const criticalCases = queue.filter(c => c.aiTriage.urgencyTier === 'CRITICAL');
  const transitCount = meshRelay.getTransitCases().length;

  const handleQuickSos = () => {
    notificationService.triggerScenario('CRITICAL_PPH');
    onNavigate('PHC_QUEUE');
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6F8] text-slate-900 overflow-y-auto pb-6 select-none font-sans">
      
      {/* Top Bar matching the Wallet screen */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div 
          onClick={onOpenAuth}
          className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm hover:scale-105 transition-transform"
          title="Profile & ASHA ID"
        >
          {currentUser?.avatarInitials || 'SR'}
        </div>

        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
          Wallet
        </h1>

        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
          )}
        </button>
      </div>

      {/* Hero Section: Balance & Header */}
      <div className="px-5 pt-2 pb-3">
        <span className="text-xs text-slate-500 font-medium tracking-tight">
          Mesh Triage Balance
        </span>
        <div className="flex items-baseline justify-between mt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {queue.length + transitCount + 42}
            </span>
            <span className="text-sm font-bold text-slate-500">Packets</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <TrendingUp className="w-3 h-3" />
            <span>+14.05% offline</span>
          </div>
        </div>
      </div>

      {/* Hero Swappable Card: Lime Green Card OR Portfolio Growth Chart Card */}
      <div className="px-5 mb-2">
        {heroCardTab === 'CARD' ? (
          /* Signature Vivid Lime Green Card (from Left Phone in Image) */
          <div className="w-full bg-gradient-to-br from-[#A8FF35] via-[#9EFF00] to-[#8EE01D] text-slate-950 p-5 rounded-[28px] shadow-lg shadow-lime-400/20 relative overflow-hidden transition-all duration-300">
            {/* Subtle background glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                <span className="text-xs font-mono font-extrabold tracking-wider text-slate-900 uppercase">
                  BLE 5.2 MESH
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-800 bg-black/10 px-2 py-0.5 rounded-full">
                NODE-704
              </span>
            </div>

            <div className="my-3 font-mono text-sm font-bold tracking-widest text-slate-900 flex items-center gap-2">
              <span>(•)))</span>
              <span>•••• •••• •••• 3280</span>
            </div>

            <div className="flex items-end justify-between pt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-700 block tracking-tight">
                  Triage Priority Buffer
                </span>
                <span className="text-xs font-extrabold text-slate-950">
                  {criticalCases.length > 0 ? `${criticalCases.length} Critical Emergencies` : 'Ready · 134 B Frame'}
                </span>
              </div>

              {/* Iconic Black Pill Button matching "Pay now" in the image */}
              <button
                onClick={handleQuickSos}
                className="bg-black hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Quick SOS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Portfolio Growth Chart Card (from Right Phone in Image) */
          <div className="w-full bg-white border border-slate-200/80 p-5 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  Mesh Hop Efficiency
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Last 7 days
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Total Delivered</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900">48 Cases</span>
                  <span className="text-xs font-bold text-emerald-600">+14.05%</span>
                </div>
              </div>
            </div>

            {/* Vertical Pill Bar Chart (S M T W T F S) matching screenshot */}
            <div className="flex items-end justify-between gap-2 pt-2 px-1">
              {[
                { day: 'S', height: 'h-6', color: 'bg-emerald-500' },
                { day: 'M', height: 'h-4', color: 'bg-rose-400' },
                { day: 'T', height: 'h-7', color: 'bg-rose-400' },
                { day: 'W', height: 'h-10', color: 'bg-emerald-500' },
                { day: 'T', height: 'h-14', color: 'bg-emerald-500' },
                { day: 'F', height: 'h-16', color: 'bg-emerald-500' },
                { day: 'S', height: 'h-12', color: 'bg-emerald-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="h-20 w-full flex items-end justify-center">
                    <div className={`w-3.5 ${item.height} ${item.color} rounded-full transition-all duration-300`} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          <button
            onClick={() => setHeroCardTab('CARD')}
            className={`h-1.5 rounded-full transition-all ${heroCardTab === 'CARD' ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
          />
          <button
            onClick={() => setHeroCardTab('CHART')}
            className={`h-1.5 rounded-full transition-all ${heroCardTab === 'CHART' ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
          />
        </div>
      </div>

      {/* "Accounts >" Section styled identically to screenshot */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => onNavigate('ASHA_CAPTURE')}
            className="flex items-center gap-1 text-sm font-extrabold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Accounts</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-[11px] font-semibold text-slate-400">4 Channels</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Item 1: Checking (Blue squircle) -> Field Intake */}
          <div
            onClick={() => onNavigate('ASHA_CAPTURE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Field Intake (ASHA)</h4>
                <p className="text-[10px] text-slate-400">Voice Note & On-Device Triage</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">4 Cases</span>
                <span className="text-[10px] font-medium text-emerald-600">Active</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
            </div>
          </div>

          {/* Item 2: Savings (Green squircle) -> BLE Mesh Relay */}
          <div
            onClick={() => onNavigate('RELAY_NODE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Transit BLE Mesh</h4>
                <p className="text-[10px] text-slate-400">Ramesh Bus & Milk Van Hops</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">{transitCount || 2} Hops</span>
                <span className="text-[10px] font-medium text-slate-400">Relaying</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
            </div>
          </div>

          {/* Item 3: Crypto (Pink squircle) -> Astra Emergency Copilot */}
          <div
            onClick={() => onNavigate('AI_CHATBOT')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Astra Emergency Copilot</h4>
                <p className="text-[10px] text-slate-400">108 Dispatch & ICU Reservation</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">AI Agent</span>
                <span className="text-[10px] font-medium text-purple-600">Standby</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
            </div>
          </div>

          {/* Item 4: Casualty (Orange squircle) -> PHC Casualty Bay */}
          <div
            onClick={() => onNavigate('PHC_QUEUE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Hospital className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">PHC Casualty Bay</h4>
                <p className="text-[10px] text-slate-400">Urgency-Sorted Intake Queue</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">{queue.length} Patients</span>
                <span className={`text-[10px] font-bold ${criticalCases.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {criticalCases.length > 0 ? `${criticalCases.length} Critical` : 'Normal'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* "Watch list >" Section styled identically to Right Phone in screenshot */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => onNavigate('PHC_QUEUE')}
            className="flex items-center gap-1 text-sm font-extrabold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Watch list</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-[11px] font-semibold text-slate-400">Priority Triage</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Watchlist Item 1 (Bitcoin style: Orange squircle) */}
          <div
            onClick={() => onNavigate('PHC_QUEUE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF9500] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rani Bai</h4>
                <p className="text-[10px] text-slate-400 font-mono">PPH Maternal Hemorrhage</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 block">Score 94/100</span>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded font-mono">
                +18.4% (CRITICAL)
              </span>
            </div>
          </div>

          {/* Watchlist Item 2 (Ethereum style: Dark squircle) */}
          <div
            onClick={() => onNavigate('PHC_QUEUE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Venkataiah G.</h4>
                <p className="text-[10px] text-slate-400 font-mono">Russell Viper Snakebite</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 block">Score 88/100</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                +12.0% (HIGH)
              </span>
            </div>
          </div>

          {/* Watchlist Item 3 (Solana style: Purple squircle) */}
          <div
            onClick={() => onNavigate('PHC_QUEUE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">K. Suresh (7y)</h4>
                <p className="text-[10px] text-slate-400 font-mono">Acute Asthma SpO2 91%</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 block">Score 82/100</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-mono">
                +4.2% (HIGH)
              </span>
            </div>
          </div>

          {/* Watchlist Item 4 (USD Coin style: Blue squircle) */}
          <div
            onClick={() => onNavigate('PHC_QUEUE')}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Balram Naik</h4>
                <p className="text-[10px] text-slate-400 font-mono">Seasonal Viral Fever</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 block">Score 24/100</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                -5.1% (ROUTINE)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Floating Action */}
      <div className="px-5 mt-4">
        <button
          onClick={() => onNavigate('LIVE_DEMO')}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch 3-Minute Dead-Zone Pitch Demo</span>
        </button>
      </div>

    </div>
  );
};

