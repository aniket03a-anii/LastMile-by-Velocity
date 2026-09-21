import React, { useState } from 'react';
import { 
  X, 
  HeartPulse, 
  Clock, 
  MapPin, 
  Layers, 
  Play, 
  ShieldAlert, 
  Ambulance, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Radio, 
  Activity,
  ArrowRight,
  Share2
} from 'lucide-react';
import { HealthCase, UrgencyTier } from '../types';

interface CaseDetailModalProps {
  healthCase: HealthCase | null;
  onClose: () => void;
  onMarkAttended?: (caseId: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ healthCase, onClose, onMarkAttended }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isAttended, setIsAttended] = useState(false);

  if (!healthCase) return null;

  const isCritical = healthCase.aiTriage.urgencyTier === 'CRITICAL';

  const handlePlayVoice = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3000);
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => {
      alert(`108 Emergency Ambulance dispatched to ${healthCase.village} for patient ${healthCase.patientName}!`);
    }, 300);
  };

  const handleAttend = () => {
    setIsAttended(true);
    if (onMarkAttended) onMarkAttended(healthCase.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-lg max-h-[90vh] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {healthCase.aiTriage.urgencyTier} (Score: {healthCase.aiTriage.urgencyScore}/100)
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">{healthCase.caseNumber}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 text-xs bg-[#F5F6F8]">
          {/* Patient Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {healthCase.patientName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {healthCase.age} Years · {healthCase.gender} · {healthCase.village}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                Recorded by ASHA: <span className="text-slate-900 font-bold">{healthCase.workerName}</span> ({healthCase.ashaId})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Reported At</span>
              <span className="font-mono text-slate-900 font-bold">
                {new Date(healthCase.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* AI Structured Clinical Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Triage Synthesis (On-Device Model)
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {healthCase.aiTriage.structuredSummary}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {healthCase.aiTriage.conditionFlags.map((flag, i) => (
                <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  #{flag}
                </span>
              ))}
            </div>
          </div>

          {/* Patient Vitals Table */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Recorded Vital Signs
            </span>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
              <div className="bg-[#F5F6F8] p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">BP</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {healthCase.vitals.systolic ? `${healthCase.vitals.systolic}/${healthCase.vitals.diastolic || 60}` : '--'}
                </span>
              </div>
              <div className="bg-[#F5F6F8] p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Pulse</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {healthCase.vitals.pulse ? `${healthCase.vitals.pulse} bpm` : '--'}
                </span>
              </div>
              <div className="bg-[#F5F6F8] p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {healthCase.vitals.spo2 ? `${healthCase.vitals.spo2}%` : '--'}
                </span>
              </div>
              <div className="bg-[#F5F6F8] p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Temp</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {healthCase.vitals.temperature ? `${healthCase.vitals.temperature}°F` : '--'}
                </span>
              </div>
              <div className="bg-[#F5F6F8] p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Glucose</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {healthCase.vitals.bloodSugar ? `${healthCase.vitals.bloodSugar} mg/dL` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Immediate Action Directives */}
          {healthCase.aiTriage.immediateActions.length > 0 && (
            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-800 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Immediate Medical Directives
              </span>
              <ul className="text-rose-950 list-disc list-inside space-y-1 font-medium">
                {healthCase.aiTriage.immediateActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Voice Note & Transcript */}
          {healthCase.hasVoiceNote && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Frontline Voice Note ({healthCase.voiceDurationSec || 24}s)
                </span>
                <button
                  onClick={handlePlayVoice}
                  className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1.5 hover:bg-black transition-all shadow-sm"
                >
                  <Play className={`w-3 h-3 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                  {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                </button>
              </div>

              {healthCase.voiceTranscript && (
                <p className="text-slate-600 text-xs italic bg-[#F5F6F8] p-3 rounded-xl border border-slate-200">
                  "{healthCase.voiceTranscript}"
                </p>
              )}
            </div>
          )}

          {/* Complete Multi-Hop Lineage Path */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Multi-Hop Relay Trace Lineage
            </span>

            <div className="flex flex-col gap-2">
              {healthCase.meshPacket.hopTraces.map((hop, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-[#F5F6F8] border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{hop.deviceName}</p>
                      <p className="text-[10px] text-slate-500">{hop.role} · {hop.protocol}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[10px] text-slate-500">
                    <p>{hop.timestamp}</p>
                    {hop.rssi !== 0 && <p className="text-slate-900 font-bold">{hop.rssi} dBm</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2.5">
          {isCritical && (
            <button
              onClick={handleDispatch}
              disabled={isDispatched}
              className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Ambulance className="w-4 h-4" />
              <span>{isDispatched ? 'Ambulance Dispatched!' : 'Dispatch 108 Ambulance'}</span>
            </button>
          )}

          <button
            onClick={handleAttend}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAttended ? 'Attended by Doctor' : 'Acknowledge Case'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
