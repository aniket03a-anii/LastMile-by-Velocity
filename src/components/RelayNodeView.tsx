import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Bluetooth, 
  Wifi, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Cpu, 
  BatteryCharging, 
  Repeat, 
  CheckCircle2, 
  ExternalLink,
  SignalHigh,
  Navigation
} from 'lucide-react';
import { HealthCase } from '../types';
import { meshRelay } from '../services/meshRelayEngine';

interface RelayNodeViewProps {
  onSelectCaseDetail: (healthCase: HealthCase) => void;
  onForwardToPhc: (caseId: string) => void;
}

export const RelayNodeView: React.FC<RelayNodeViewProps> = ({ onSelectCaseDetail, onForwardToPhc }) => {
  const [transitCases, setTransitCases] = useState<HealthCase[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  useEffect(() => {
    const updateCases = () => {
      setTransitCases(meshRelay.getTransitCases());
    };
    updateCases();
    return meshRelay.subscribe(updateCases);
  }, []);

  const handleForwardHop = (caseId: string) => {
    setForwardingId(caseId);
    setTimeout(() => {
      onForwardToPhc(caseId);
      setForwardingId(null);
    }, 600);
  };

  const nearbyPeers = [
    { name: 'Sunita\'s Phone (ASHA Origin)', role: 'ASHA Field Node', rssi: -64, protocol: 'BLE 5.2 (Advertising)', distance: '~8m' },
    { name: 'Panchayat Secretary Handset', role: 'Transit Peer Node', rssi: -78, protocol: 'Wi-Fi Direct P2P', distance: '~22m' },
    { name: 'PHC Malkapur Perimeter Station', role: 'Receiving Gateway', rssi: -56, protocol: 'Wi-Fi Direct P2P', distance: '~45m' },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 text-slate-900 pb-12 bg-[#F5F6F8] font-sans">
      {/* Relay Node Identity Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Transit Relay Node</span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                Phone B
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Ramesh (Milk Van Transport) · Moving toward Block PHC</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Relay Active
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Cellular: OFF</span>
        </div>
      </div>

      {/* BLE Radar & Radio State */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              P2P Mesh Discovery Radar
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">BLE 5.2 + Wi-Fi Direct</span>
        </div>

        {/* Live Peer Nodes Detected */}
        <div className="flex flex-col gap-2">
          {nearbyPeers.map((peer, idx) => (
            <div
              key={idx}
              className="bg-[#F5F6F8] p-2.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <p className="font-bold text-slate-900">{peer.name}</p>
                  <p className="text-[10px] text-slate-500">{peer.role} · {peer.protocol}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-900 font-bold">{peer.rssi} dBm</span>
                <span className="text-[10px] text-slate-400 block">{peer.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mesh Routing Engine Telemetry */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Carried</span>
          <span className="text-lg font-mono font-extrabold text-slate-900">{transitCases.length}</span>
          <span className="text-[9px] text-slate-400">Local SQLite</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Deduplication</span>
          <span className="text-lg font-mono font-extrabold text-emerald-600">100%</span>
          <span className="text-[9px] text-slate-400">Zero Loop Loops</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Survive-Boot</span>
          <span className="text-lg font-mono font-extrabold text-slate-900">ACTIVE</span>
          <span className="text-[9px] text-slate-400">Persistent Disk</span>
        </div>
      </div>

      {/* Packets Currently in Transit */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
            Relay Buffer Queue ({transitCases.length})
          </span>
          <span className="text-[10px] text-slate-400">Auto-forwarding on proximity</span>
        </div>

        {transitCases.length === 0 ? (
          <div className="p-8 bg-white border border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="text-xs text-slate-700 font-bold">All transit cases delivered to PHC</p>
            <p className="text-[10px] text-slate-400">Capture a new case from Phone A to populate transit relay</p>
          </div>
        ) : (
          transitCases.map((c) => {
            const isCritical = c.aiTriage.urgencyTier === 'CRITICAL';
            return (
              <div
                key={c.id}
                className={`bg-white border rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm transition-all ${
                  isCritical ? 'border-rose-200 ring-1 ring-rose-200' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {c.aiTriage.urgencyTier}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-[11px] text-slate-400">({c.age}y {c.gender[0]})</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 font-medium">
                    TTL: {c.meshPacket.maxTtl - c.meshPacket.currentHops} hops left
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {c.aiTriage.structuredSummary}
                </p>

                {/* Packet payload telemetry line */}
                <div className="bg-[#F5F6F8] px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>ID: {c.meshPacket.packetId}</span>
                  <span>Size: {c.aiTriage.compressedPayloadBytes} B</span>
                  <span>Hops: {c.meshPacket.currentHops}/{c.meshPacket.maxTtl}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectCaseDetail(c)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-all border border-slate-200"
                  >
                    <span>Inspect Payload</span>
                  </button>

                  <button
                    onClick={() => handleForwardHop(c.id)}
                    disabled={forwardingId === c.id}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm"
                  >
                    {forwardingId === c.id ? (
                      <span className="animate-spin">🔄</span>
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-[#A3E635]" />
                    )}
                    <span>Deliver to PHC</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
