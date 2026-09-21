import React, { useState, useEffect } from 'react';
import { 
  Hospital, 
  Clock, 
  HeartPulse, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Ambulance, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { HealthCase, UrgencyTier } from '../types';
import { meshRelay } from '../services/meshRelayEngine';

interface PhcQueueViewProps {
  onSelectCaseDetail: (healthCase: HealthCase) => void;
  onResetSeedData: () => void;
}

export const PhcQueueView: React.FC<PhcQueueViewProps> = ({ onSelectCaseDetail, onResetSeedData }) => {
  const [phcCases, setPhcCases] = useState<HealthCase[]>([]);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  useEffect(() => {
    const updateCases = () => {
      setPhcCases(meshRelay.getPhcQueue());
    };
    updateCases();
    return meshRelay.subscribe(updateCases);
  }, []);

  const criticalCount = phcCases.filter((c) => c.aiTriage.urgencyTier === 'CRITICAL').length;
  const highCount = phcCases.filter((c) => c.aiTriage.urgencyTier === 'HIGH').length;

  const handleDispatchAmbulance = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    setDispatchedId(caseId);
    setTimeout(() => {
      alert('108 Emergency Ambulance Dispatched to Village coordinates with Blood Pack!');
      setDispatchedId(null);
    }, 400);
  };

  const getTierBadge = (tier: UrgencyTier) => {
    switch (tier) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold',
          dot: 'bg-rose-600 animate-ping',
          label: 'TIER 1 · CRITICAL',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
          dot: 'bg-amber-600',
          label: 'TIER 2 · HIGH',
        };
      case 'MODERATE':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'TIER 3 · MODERATE',
        };
      case 'ROUTINE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'TIER 4 · ROUTINE',
        };
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 text-slate-900 pb-12 bg-[#F5F6F8] font-sans">
      {/* Receiving PHC Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <Hospital className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Malkapur Primary Health Centre</span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                PHC Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Dr. K. Radhika (MO I/C) · Triage Receiving Queue</p>
          </div>
        </div>

        <button
          onClick={onResetSeedData}
          title="Reset Demo Cases"
          className="p-2.5 rounded-2xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs border border-slate-200 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Critical Triage Alert Banner */}
      {criticalCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-3.5 flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-rose-900">
                {criticalCount} Critical Immediate Evacuation {criticalCount === 1 ? 'Case' : 'Cases'}
              </p>
              <p className="text-[11px] text-rose-700">
                AI re-ordered to top of queue. Prioritized over older arrivals.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-sm font-mono">
            URGENT
          </span>
        </div>
      )}

      {/* Triage Urgency Distribution Metric Chips */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-rose-600 block font-bold">Tier 1 Crit</span>
          <span className="text-base font-extrabold font-mono text-slate-900">{criticalCount}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-amber-600 block font-bold">Tier 2 High</span>
          <span className="text-base font-bold font-mono text-slate-900">{highCount}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-blue-600 block font-bold">Tier 3 Mod</span>
          <span className="text-base font-bold font-mono text-slate-900">
            {phcCases.filter((c) => c.aiTriage.urgencyTier === 'MODERATE').length}
          </span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-emerald-600 block font-bold">Tier 4 Routine</span>
          <span className="text-base font-bold font-mono text-slate-900">
            {phcCases.filter((c) => c.aiTriage.urgencyTier === 'ROUTINE').length}
          </span>
        </div>
      </div>

      {/* Queue Section Heading */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5 pt-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
            AI Priority Delivery Queue ({phcCases.length})
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Sorted by Urgency Tier</span>
      </div>

      {/* Priority Ordered List */}
      <div className="flex flex-col gap-2.5">
        {phcCases.length === 0 ? (
          <div className="p-10 bg-white border border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-slate-300" />
            <p className="text-xs text-slate-600 font-bold">No cases received at PHC gateway yet</p>
            <p className="text-[10px] text-slate-400">Forward cases from Phone B or record a new case</p>
          </div>
        ) : (
          phcCases.map((c, index) => {
            const badge = getTierBadge(c.aiTriage.urgencyTier);
            const isCritical = c.aiTriage.urgencyTier === 'CRITICAL';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCaseDetail(c)}
                className={`group bg-white border rounded-3xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99] ${
                  isCritical 
                    ? 'border-rose-200 ring-1 ring-rose-200' 
                    : 'border-slate-100'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Score: {c.aiTriage.urgencyScore}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">{c.caseNumber}</span>
                </div>

                {/* Patient Summary */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {c.patientName} <span className="text-xs font-normal text-slate-400">({c.age}y, {c.gender})</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(c.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.village} · By {c.workerName}</p>
                </div>

                {/* AI Structured Summary */}
                <div className="bg-[#F5F6F8] p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-800 font-medium leading-relaxed">
                  {c.aiTriage.structuredSummary}
                </div>

                {/* Vital Alerts */}
                {c.aiTriage.vitalAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.aiTriage.vitalAlerts.map((alert, i) => (
                      <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-rose-500" /> {alert}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>Relayed via {c.meshPacket.hopTraces.length} hops ({c.meshPacket.compressedSize} B)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCritical && (
                      <button
                        onClick={(e) => handleDispatchAmbulance(e, c.id)}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Ambulance className="w-3 h-3" />
                        <span>Dispatch 108</span>
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-slate-800 group-hover:translate-x-0.5 transition-transform flex items-center">
                      Review <ChevronRight className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
