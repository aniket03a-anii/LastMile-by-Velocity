import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Square, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Cpu, 
  FileText, 
  Clock, 
  HeartPulse, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Share2
} from 'lucide-react';
import { HealthCase, UrgencyTier, Vitals, AiTriageResult } from '../types';
import { runClinicalTriage } from '../services/triageService';
import { meshRelay } from '../services/meshRelayEngine';

interface AshaCaptureViewProps {
  onCaseBroadcasted: (createdCase: HealthCase) => void;
  airplaneMode: boolean;
}

const PRESET_SCENARIOS = [
  {
    id: 'pph',
    label: 'Postpartum Bleeding (PPH)',
    icon: '⚡',
    name: 'Rani Bai',
    age: 23,
    gender: 'Female' as const,
    symptoms: ['Heavy postpartum bleeding', 'Severe dizziness', 'Extreme pallor', 'Cold clammy skin'],
    notes: 'Home delivery 3 hours ago. 4 pads soaked in 1 hour. Patient drowsy and shivering. Placenta expelled.',
    vitals: { systolic: 82, diastolic: 48, pulse: 128, temperature: 97.4, spo2: 93 },
    transcript: 'Doctor saheb, Rani Bai delivered baby 3 hours ago at home, heavy bleeding won\'t stop, she is fainting, pulse is very fast and BP down to 80/50, emergency 108 needed!',
  },
  {
    id: 'asthma',
    label: 'Pediatric Wheezing / SpO2 Drop',
    icon: '🫁',
    name: 'K. Suresh',
    age: 7,
    gender: 'Male' as const,
    symptoms: ['Acute breathlessness', 'Subcostal chest indrawing', 'Audible wheeze', 'Dry cough'],
    notes: 'Severe asthma flare after farm dust exposure. Child unable to speak full sentence.',
    vitals: { systolic: 98, diastolic: 62, pulse: 132, temperature: 99.1, spo2: 91 },
    transcript: 'Child Suresh 7 years old has severe breathlessness, chest indrawing noticed, oxygen saturation 91 percent.',
  },
  {
    id: 'snakebite',
    label: 'Viper Snakebite Envenomation',
    icon: '⚠️',
    name: 'Venkataiah G.',
    age: 41,
    gender: 'Male' as const,
    symptoms: ['Fang marks on right ankle', 'Local swelling spreading to knee', 'Gingival bleeding', 'Severe pain'],
    notes: 'Bitten by Russell viper in paddy field 45 mins ago. Tourniquet applied loosely by family.',
    vitals: { systolic: 104, diastolic: 70, pulse: 114, temperature: 98.6, spo2: 96 },
    transcript: 'Venkataiah bitten by snake on right foot, swelling spreading rapidly past knee, gum bleeding started, prepare anti-snake venom!',
  },
  {
    id: 'fever',
    label: 'Seasonal Viral Fever (Routine)',
    icon: '🩺',
    name: 'Balram Naik',
    age: 34,
    gender: 'Male' as const,
    symptoms: ['Mild fever', 'Headache', 'Body ache'],
    notes: 'Day 2 fever with malaise. Alert and oriented. Hydration adequate.',
    vitals: { systolic: 118, diastolic: 76, pulse: 78, temperature: 99.8, spo2: 98 },
    transcript: 'Patient Balram has mild body ache and low fever since yesterday. Gave paracetamol.',
  },
];

export const AshaCaptureView: React.FC<AshaCaptureViewProps> = ({ onCaseBroadcasted, airplaneMode }) => {
  const [patientName, setPatientName] = useState('Rani Bai');
  const [age, setAge] = useState<number | ''>(23);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [symptomsInput, setSymptomsInput] = useState('Heavy postpartum bleeding, severe dizziness, extreme pallor');
  const [rawNotes, setRawNotes] = useState('Home delivery 3 hours ago. 4 pads soaked in 1 hour. Patient drowsy and shivering.');
  
  // Vitals
  const [systolic, setSystolic] = useState<number | ''>(82);
  const [diastolic, setDiastolic] = useState<number | ''>(48);
  const [pulse, setPulse] = useState<number | ''>(128);
  const [spo2, setSpo2] = useState<number | ''>(93);
  const [temp, setTemp] = useState<number | ''>(97.4);
  const [bloodSugar, setBloodSugar] = useState<number | ''>('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasAudioClip, setHasAudioClip] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(
    'Doctor saheb, Rani Bai delivered baby 3 hours ago at home, heavy bleeding won\'t stop, she is fainting, pulse is very fast and BP down to 80/50, emergency 108 needed!'
  );

  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [triageResult, setTriageResult] = useState<AiTriageResult | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const timerRef = useRef<number | null>(null);

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setPatientName(preset.name);
    setAge(preset.age);
    setGender(preset.gender);
    setSymptomsInput(preset.symptoms.join(', '));
    setRawNotes(preset.notes);
    setSystolic(preset.vitals.systolic || '');
    setDiastolic(preset.vitals.diastolic || '');
    setPulse(preset.vitals.pulse || '');
    setSpo2(preset.vitals.spo2 || '');
    setTemp(preset.vitals.temperature || '');
    setBloodSugar('');
    setVoiceTranscript(preset.transcript);
    setHasAudioClip(true);
    setTriageResult(null);
    setBroadcastSuccess(false);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setHasAudioClip(true);
      if (!voiceTranscript) {
        setVoiceTranscript(`Field audio note recorded (${recordingSeconds}s): Patient ${patientName}, reporting severe symptoms in dead zone.`);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const simulatePlayAudio = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3000);
  };

  const handleRunTriage = async () => {
    setIsProcessingAi(true);
    setBroadcastSuccess(false);

    const symptomsList = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const vitals: Vitals = {
      systolic: typeof systolic === 'number' ? systolic : undefined,
      diastolic: typeof diastolic === 'number' ? diastolic : undefined,
      pulse: typeof pulse === 'number' ? pulse : undefined,
      spo2: typeof spo2 === 'number' ? spo2 : undefined,
      temperature: typeof temp === 'number' ? temp : undefined,
      bloodSugar: typeof bloodSugar === 'number' ? bloodSugar : undefined,
    };

    try {
      const result = await runClinicalTriage(
        {
          patientName: patientName || 'Anonymous',
          age: typeof age === 'number' ? age : 25,
          gender,
          symptoms: symptomsList,
          rawNotes,
          voiceTranscript: hasAudioClip ? voiceTranscript : undefined,
          vitals,
          ashaId: 'ASHA-TS-704',
          village: 'Gundlapally (Dead Zone)',
        },
        airplaneMode
      );
      setTriageResult(result);
    } catch (e) {
      console.error('Triage failed:', e);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleBroadcastToMesh = () => {
    if (!triageResult) return;

    const caseId = `case-${Date.now().toString(36)}`;
    const randomHex = Math.random().toString(16).substring(2, 6);
    const caseNumber = `LML-2026-${Math.floor(100 + Math.random() * 900)}`;

    const symptomsList = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newCase: HealthCase = {
      id: caseId,
      caseNumber,
      ashaId: 'ASHA-TS-704',
      workerName: 'Sunita Rathod',
      village: 'Gundlapally (Dead Zone)',
      recordedAt: new Date().toISOString(),
      patientName: patientName || 'Patient',
      age: typeof age === 'number' ? age : 30,
      gender,
      symptoms: symptomsList,
      vitals: {
        systolic: typeof systolic === 'number' ? systolic : undefined,
        diastolic: typeof diastolic === 'number' ? diastolic : undefined,
        pulse: typeof pulse === 'number' ? pulse : undefined,
        spo2: typeof spo2 === 'number' ? spo2 : undefined,
        temperature: typeof temp === 'number' ? temp : undefined,
        bloodSugar: typeof bloodSugar === 'number' ? bloodSugar : undefined,
      },
      rawNotes,
      hasVoiceNote: hasAudioClip,
      voiceDurationSec: recordingSeconds || 24,
      voiceTranscript: hasAudioClip ? voiceTranscript : undefined,
      aiTriage: triageResult,
      meshPacket: {
        packetId: `pkt-${randomHex}-mesh`,
        hash: `sha256-${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
        originDeviceId: 'iQOO-Neo9-ASHA-01',
        currentHops: 1,
        maxTtl: 5,
        hopTraces: [
          {
            deviceId: 'iQOO-Neo9-ASHA-01',
            deviceName: 'Sunita\'s Phone (Dead Zone Origin)',
            role: 'ASHA_ORIGIN',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            rssi: 0,
            protocol: 'BLE_5.2_ADV',
          },
        ],
        deliveryStatus: 'IN_TRANSIT',
        rawPayloadSize: triageResult.rawPayloadBytes,
        compressedSize: triageResult.compressedPayloadBytes,
      },
    };

    const added = meshRelay.addCase(newCase);
    if (added) {
      setBroadcastSuccess(true);
      onCaseBroadcasted(newCase);
      setTimeout(() => {
        setBroadcastSuccess(false);
      }, 4000);
    }
  };

  const getTierColor = (tier: UrgencyTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 font-extrabold border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 font-bold border-amber-200';
      case 'MODERATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ROUTINE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 text-slate-900 pb-12 bg-[#F5F6F8] font-sans">
      {/* Frontline Worker Location Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3.5 shadow-sm flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
            <Radio className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">ASHA Sunita Rathod</span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                TS-704
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Village: Gundlapally (Dead Zone)</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
            Dead Zone
          </span>
          <span className="text-[10px] text-slate-400 font-mono">BLE Mesh Ready</span>
        </div>
      </div>

      {/* Preset Quick Select for Rapid Demo */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">Quick Clinical Presets</span>
          <span className="text-[10px] text-slate-400">Tap to load</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md text-left transition-all group shadow-sm"
            >
              <span className="text-base">{preset.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-black">
                  {preset.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{preset.name}, {preset.age}y</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Patient Intake Form */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Stage 1: Case Capture
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            100% Offline Intake
          </span>
        </div>

        {/* Name, Age, Gender */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-6 flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-medium">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="bg-[#F5F6F8] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              placeholder="e.g. Rani Bai"
            />
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-medium">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-[#F5F6F8] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              placeholder="23"
            />
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="bg-[#F5F6F8] border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500 font-medium">Symptoms Observed</label>
          <input
            type="text"
            value={symptomsInput}
            onChange={(e) => setSymptomsInput(e.target.value)}
            className="bg-[#F5F6F8] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            placeholder="Comma separated symptoms"
          />
        </div>

        {/* Vitals Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-rose-500" /> Patient Vitals
          </label>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col gap-1 bg-[#F5F6F8] p-2 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-medium">BP (Sys/Dia)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="82"
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="48"
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 bg-[#F5F6F8] p-2 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-medium">Pulse (bpm)</span>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="128"
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 bg-[#F5F6F8] p-2 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-medium">SpO2 (%)</span>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="93"
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 bg-[#F5F6F8] p-2 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-medium">Temp (°F)</span>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="97.4"
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Free-form notes */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500 font-medium">Field Observations / Context</label>
          <textarea
            rows={2}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            className="bg-[#F5F6F8] border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
            placeholder="Describe clinical situation, onset, or urgency..."
          />
        </div>

        {/* Voice Note Module */}
        <div className="bg-[#F5F6F8] border border-slate-200 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-slate-900" /> Optional Voice Note
            </span>
            {hasAudioClip && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Audio Attached
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>

            {isRecording ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono text-slate-900 font-bold">
                  Recording {recordingSeconds}s
                </span>
                <div className="flex-1 flex items-center gap-1 h-4">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-500 rounded-full animate-bounce"
                      style={{ 
                        height: `${Math.max(4, (i % 4 + 1) * 3)}px`, 
                        animationDelay: `${i * 80}ms` 
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : hasAudioClip ? (
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={simulatePlayAudio}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs flex items-center gap-1.5 font-bold border border-slate-200 shadow-sm"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                  {isPlayingAudio ? 'Playing...' : 'Listen Clip (24s)'}
                </button>
                <div className="flex-1 text-[11px] text-slate-500 italic truncate">
                  "{voiceTranscript}"
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Tap mic to record voice note</span>
            )}
          </div>
        </div>

        {/* Action Button: AI Summarize & Prioritize */}
        <button
          onClick={handleRunTriage}
          disabled={isProcessingAi}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isProcessingAi ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>NPU Quantized Inference Running...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-[#A3E635]" />
              <span>On-Device Hexagon AI Triage & Compress</span>
            </>
          )}
        </button>
      </div>

      {/* Stage 2: AI Triage & Structured Relay Packet Preview */}
      {triageResult && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Stage 2: AI Structured Summary
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {triageResult.source === 'hexagon_npu_offline' ? 'Hexagon NPU' : 'Gemini AI'}
              </span>
            </div>

            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getTierColor(triageResult.urgencyTier)}`}>
              {triageResult.urgencyTier} ({triageResult.urgencyScore}/100)
            </span>
          </div>

          {/* Structured Note */}
          <div className="bg-[#F5F6F8] p-3 rounded-2xl border border-slate-200/80 flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Hop-Optimized Clinical Note</span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {triageResult.structuredSummary}
            </p>
          </div>

          {/* Condition Flags */}
          <div className="flex flex-wrap gap-1.5">
            {triageResult.conditionFlags.map((flag, i) => (
              <span key={i} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                #{flag}
              </span>
            ))}
          </div>

          {/* Immediate clinical actions */}
          {triageResult.immediateActions.length > 0 && (
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/70 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Recommended Immediate Protocol</span>
              <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5">
                {triageResult.immediateActions.map((act, idx) => (
                  <li key={idx} className="leading-snug">{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hop Payload Compression Stats */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F5F6F8] rounded-2xl border border-slate-200 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Raw Intake</span>
              <span className="font-mono text-slate-900 font-bold">{triageResult.rawPayloadBytes} B</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">AI Relay Packet</span>
              <span className="font-mono text-emerald-600 font-extrabold">{triageResult.compressedPayloadBytes} B</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">NPU Time</span>
              <span className="font-mono text-slate-900 font-bold">{triageResult.npuInferenceTimeMs} ms</span>
            </div>
          </div>

          {/* Broadcast to BLE mesh */}
          <button
            onClick={handleBroadcastToMesh}
            className="w-full py-3 px-4 rounded-2xl bg-[#A3E635] hover:bg-[#92D425] text-slate-950 font-black text-xs tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Broadcast Case to BLE / Wi-Fi Direct Mesh</span>
          </button>

          {broadcastSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Packet broadcasted! Stored locally; picked up by nearby relay nodes.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
