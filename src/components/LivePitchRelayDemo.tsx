import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Radio, 
  Layers, 
  Hospital, 
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LivePitchRelayDemoProps {
  onSwitchToView: (view: 'ASHA_CAPTURE' | 'RELAY_NODE' | 'PHC_QUEUE') => void;
}

interface DemoBeat {
  timeCode: string;
  title: string;
  subtitle: string;
  speakerScript: string;
  actionLabel: string;
  activePhone: 'PhoneA' | 'PhoneB' | 'PhoneC' | 'All';
  highlightType: 'problem' | 'capture' | 'ai_reorder' | 'npu' | 'impact';
}

const DEMO_BEATS: DemoBeat[] = [
  {
    timeCode: '0:00 – 0:20',
    title: 'The Hook & The Operating Reality',
    subtitle: 'Zero signal is not an outage for 1 million ASHA workers — it is Tuesday.',
    speakerScript: 'Frontline health workers in India routinely operate with zero cellular signal for hours or days. When an emergency happens in a dead zone, time-sensitive clinical information sits idle when minutes matter most.',
    actionLabel: 'Advance to Problem Context',
    activePhone: 'PhoneA',
    highlightType: 'problem',
  },
  {
    timeCode: '0:20 – 0:50',
    title: 'The Dead Zone Conundrum',
    subtitle: 'Existing mesh apps move raw bytes, but lack clinical intelligence.',
    speakerScript: 'Existing mesh apps like Bridgefy just blast raw text. Telemedicine platforms fail completely without cloud sync. LastMile Link adds the crucial missing layer: On-Device AI that structures, prioritizes, and hop-compresses health data.',
    actionLabel: 'Trigger Phone A Case Capture',
    activePhone: 'PhoneA',
    highlightType: 'capture',
  },
  {
    timeCode: '0:50 – 1:30',
    title: 'Stage 1 & 2: Capture & Automatic Peer Pick-up',
    subtitle: 'Phone A (Airplane Mode) -> Phone B picks up payload via BLE 5.2.',
    speakerScript: 'Watch Phone A: Sunita records a patient in a total dead zone. Hexagon NPU compresses the case note down to 134 bytes in 16ms. When Ramesh\'s milk van passes within 30 meters, Phone B detects the BLE beacon and carries the packet forward hop-by-hop!',
    actionLabel: 'Deliver Hop & Trigger Critical AI Reorder',
    activePhone: 'PhoneB',
    highlightType: 'capture',
  },
  {
    timeCode: '1:30 – 2:00',
    title: 'The "AI Moment": Visible Urgency Queue Reordering',
    subtitle: 'Critical PPH case arrives hours later and jumps straight to the top!',
    speakerScript: 'Here is the breakthrough: on Phone C (PHC Receiver), notice how the critical maternal hemorrhage case—even though arriving much later than routine cases—visibly jumps directly above them! The delivery queue is ordered strictly by clinical urgency, not arrival time.',
    actionLabel: 'Inspect Hexagon NPU Benchmarks',
    activePhone: 'PhoneC',
    highlightType: 'ai_reorder',
  },
  {
    timeCode: '2:00 – 2:30',
    title: 'Hardware Integration: Hexagon NPU',
    subtitle: '16ms inference at 0.002% battery drain per hop.',
    speakerScript: 'Because this runs on the Hexagon NPU, the health worker’s phone can relay cases all day without killing the battery. Quantized inference is 24x more power-efficient than CPU, with 100% on-device privacy—no patient data touches the cloud.',
    actionLabel: 'View Impact & Grand Finale',
    activePhone: 'All',
    highlightType: 'npu',
  },
  {
    timeCode: '2:30 – 3:00',
    title: 'Scale & Closing Pitch',
    subtitle: 'When the network dies, the data still moves.',
    speakerScript: 'LastMile Link requires no new cell towers, no expensive satellite kits, and no servers in the dead zone. Every phone is a relay node. When the network dies, the data still moves.',
    actionLabel: 'Restart Interactive Pitch Demo',
    activePhone: 'All',
    highlightType: 'impact',
  },
];

export const LivePitchRelayDemo: React.FC<LivePitchRelayDemoProps> = ({ onSwitchToView }) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  const beat = DEMO_BEATS[currentBeatIndex];

  const handleNextBeat = () => {
    if (currentBeatIndex < DEMO_BEATS.length - 1) {
      setCurrentBeatIndex(prev => prev + 1);
    } else {
      setCurrentBeatIndex(0);
    }
  };

  const handlePrevBeat = () => {
    if (currentBeatIndex > 0) {
      setCurrentBeatIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 text-slate-900 pb-12 bg-[#F5F6F8] font-sans">
      {/* 3-Minute Pitch Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">Live 3-Minute Pitch Demo</span>
              <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                BEAT {currentBeatIndex + 1}/6
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Rural Health Dead-Zone Demonstration Flow</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentBeatIndex(0)}
          className="p-2.5 rounded-2xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs border border-slate-200 shadow-xs"
          title="Restart Demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual 3-Node Physical Mesh Diagram */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" /> Physical Relay Architecture
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-[#F5F6F8] px-2 py-0.5 rounded-full border border-slate-200">Airplane Mode ON</span>
        </div>

        {/* The 3 Physical Phones in Relay Chain */}
        <div className="grid grid-cols-3 gap-2 relative py-1">
          {/* Node A: Field Origin */}
          <div 
            onClick={() => onSwitchToView('ASHA_CAPTURE')}
            className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
              beat.activePhone === 'PhoneA' || beat.activePhone === 'All'
                ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                : 'border-slate-200/80 bg-[#F5F6F8] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className={`w-5 h-5 mb-1 ${beat.activePhone === 'PhoneA' || beat.activePhone === 'All' ? 'text-white' : 'text-slate-500'}`} />
            <span className="text-xs font-bold">Phone A</span>
            <span className={`text-[10px] font-medium ${beat.activePhone === 'PhoneA' || beat.activePhone === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>ASHA Worker</span>
            <span className={`text-[9px] mt-0.5 ${beat.activePhone === 'PhoneA' || beat.activePhone === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>Dead Zone (0 bars)</span>
          </div>

          {/* Node B: Transit Hop */}
          <div 
            onClick={() => onSwitchToView('RELAY_NODE')}
            className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
              beat.activePhone === 'PhoneB' || beat.activePhone === 'All'
                ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                : 'border-slate-200/80 bg-[#F5F6F8] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Layers className={`w-5 h-5 mb-1 ${beat.activePhone === 'PhoneB' || beat.activePhone === 'All' ? 'text-white' : 'text-slate-500'}`} />
            <span className="text-xs font-bold">Phone B</span>
            <span className={`text-[10px] font-medium ${beat.activePhone === 'PhoneB' || beat.activePhone === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>Transit Relay</span>
            <span className={`text-[9px] mt-0.5 ${beat.activePhone === 'PhoneB' || beat.activePhone === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>Milk Van / BLE 5.2</span>
          </div>

          {/* Node C: Receiving PHC */}
          <div 
            onClick={() => onSwitchToView('PHC_QUEUE')}
            className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
              beat.activePhone === 'PhoneC' || beat.activePhone === 'All'
                ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                : 'border-slate-200/80 bg-[#F5F6F8] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Hospital className={`w-5 h-5 mb-1 ${beat.activePhone === 'PhoneC' || beat.activePhone === 'All' ? 'text-white' : 'text-slate-500'}`} />
            <span className="text-xs font-bold">Phone C</span>
            <span className={`text-[10px] font-medium ${beat.activePhone === 'PhoneC' || beat.activePhone === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>PHC Station</span>
            <span className={`text-[9px] mt-0.5 ${beat.activePhone === 'PhoneC' || beat.activePhone === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>Urgency Re-order</span>
          </div>
        </div>

        {/* Hop Connection Wave Indicator */}
        <div className="bg-[#F5F6F8] p-2.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <span className="flex items-center gap-1 text-slate-900 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> BLE Adv
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span className="text-slate-800 font-medium">P2P Relay (TTL: 5)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span className="text-slate-900 font-bold">MO Triage Queue</span>
        </div>
      </div>

      {/* Active Demo Beat Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {beat.timeCode}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Live Presentation Script
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            {beat.title}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {beat.subtitle}
          </p>
        </div>

        {/* Presenter / Stage Script Callout */}
        <div className="bg-[#F5F6F8] p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans relative">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-amber-500" /> Speaking Prompt
          </div>
          "{beat.speakerScript}"
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {currentBeatIndex > 0 && (
            <button
              onClick={handlePrevBeat}
              className="py-3 px-3.5 rounded-2xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleNextBeat}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{beat.actionLabel}</span>
            <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
