import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

interface TriageRequest {
  patientName?: string;
  age?: number;
  gender?: string;
  symptoms: string[];
  rawNotes?: string;
  voiceTranscript?: string;
  vitals?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    bloodSugar?: number;
  };
  ashaId?: string;
  location?: string;
}

// Deterministic offline clinical heuristic evaluator (simulates on-device NPU quantized model)
function evaluateHeuristicTriage(req: TriageRequest) {
  const symptomsText = (req.symptoms || []).join(' ').toLowerCase();
  const notesText = `${req.rawNotes || ''} ${req.voiceTranscript || ''}`.toLowerCase();
  const allText = `${symptomsText} ${notesText}`;

  const flags: string[] = [];
  const immediateActions: string[] = [];
  const vitalAlerts: string[] = [];
  let urgencyTier: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE' = 'ROUTINE';
  let urgencyScore = 20;

  const vitals = req.vitals || {};
  if (vitals.spo2 && vitals.spo2 < 90) {
    vitalAlerts.push(`Severe Hypoxemia: SpO2 ${vitals.spo2}%`);
    flags.push('CRITICAL_HYPOXEMIA');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 95);
  } else if (vitals.spo2 && vitals.spo2 <= 93) {
    vitalAlerts.push(`Low SpO2: ${vitals.spo2}%`);
    flags.push('RESPIRATORY_DISTRESS');
    urgencyTier = 'HIGH';
    urgencyScore = Math.max(urgencyScore, 75);
  }

  if (vitals.systolic && (vitals.systolic < 85 || (vitals.systolic < 90 && (vitals.pulse && vitals.pulse > 110)))) {
    vitalAlerts.push(`Decompensated Shock: BP ${vitals.systolic}/${vitals.diastolic || 50}`);
    flags.push('HEMODYNAMIC_SHOCK');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 98);
  } else if (vitals.systolic && vitals.systolic >= 160) {
    vitalAlerts.push(`Severe Hypertension: BP ${vitals.systolic}/${vitals.diastolic || 100}`);
    flags.push('HYPERTENSIVE_CRISIS');
    if (urgencyTier !== 'CRITICAL') urgencyTier = 'HIGH';
    urgencyScore = Math.max(urgencyScore, 80);
  }

  if (vitals.temperature && vitals.temperature >= 103.5) {
    vitalAlerts.push(`Hyperpyrexia: Temp ${vitals.temperature}°F`);
    flags.push('HIGH_GRADE_PYREXIA');
    if (urgencyTier !== 'CRITICAL') urgencyTier = 'HIGH';
    urgencyScore = Math.max(urgencyScore, 70);
  }

  // Clinical symptom checks
  if (allText.includes('bleeding') || allText.includes('hemorrhage') || allText.includes('pph') || allText.includes('placenta') || allText.includes('postpartum')) {
    flags.push('MATERNAL_PPH');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 99);
    immediateActions.push('Immediate oxytocin/misoprostol protocol & emergency transport to CHC/FRU');
  }

  if (allText.includes('snake') || allText.includes('bite') || allText.includes('envenomation') || allText.includes('neurotoxic') || allText.includes('ptosis')) {
    flags.push('SNAKEBITE_ENVENOMATION');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 96);
    immediateActions.push('ASV (Anti-Snake Venom) preparedness, keep limb immobilized, rapid transit');
  }

  if (allText.includes('chest pain') || allText.includes('heart attack') || allText.includes('crushing') || allText.includes('radiating to jaw')) {
    flags.push('ACUTE_CORONARY_SYNDROME');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 94);
    immediateActions.push('Aspirin 300mg chewable + Sorbitrate if systolic > 100, expedited ambulance');
  }

  if (allText.includes('unconscious') || allText.includes('altered sensorium') || allText.includes('seizure') || allText.includes('convulsion') || allText.includes('coma')) {
    flags.push('NEUROLOGICAL_EMERGENCY');
    urgencyTier = 'CRITICAL';
    urgencyScore = Math.max(urgencyScore, 92);
    immediateActions.push('Maintain airway, recovery position, check glucometer urgently');
  }

  if (allText.includes('severe dehydration') || allText.includes('cholera') || allText.includes('sunken eyes') || (allText.includes('vomiting') && allText.includes('diarrhea') && (vitals.pulse || 0) > 100)) {
    flags.push('SEVERE_DEHYDRATION');
    if (urgencyTier !== 'CRITICAL') urgencyTier = 'HIGH';
    urgencyScore = Math.max(urgencyScore, 82);
    immediateActions.push('IV Ringer Lactate immediately, ORS continuous sips');
  }

  if (allText.includes('breathless') || allText.includes('wheezing') || allText.includes('stridor') || allText.includes('chest indrawing') || allText.includes('asthma')) {
    flags.push('ACUTE_RESPIRATORY_DISTRESS');
    if (urgencyTier !== 'CRITICAL') urgencyTier = 'HIGH';
    urgencyScore = Math.max(urgencyScore, 85);
    immediateActions.push('Oxygen concentrator/cylinder if available, Salbutamol nebulization');
  }

  if (urgencyTier === 'ROUTINE' && req.symptoms.length > 0) {
    urgencyTier = 'MODERATE';
    urgencyScore = 45;
  }

  if (immediateActions.length === 0) {
    if (urgencyTier === 'CRITICAL') {
      immediateActions.push('Urgent triage by Medical Officer upon arrival; prepare stabilization bay');
    } else if (urgencyTier === 'HIGH') {
      immediateActions.push('Priority consultation within 4 hours; ensure vital monitoring');
    } else if (urgencyTier === 'MODERATE') {
      immediateActions.push('Standard PHC outpatient queue review; symptomatic management');
    } else {
      immediateActions.push('Routine ASHA follow-up; record in maternal-child health register');
    }
  }

  const patientDesc = `${req.age ? `${req.age}y` : ''} ${req.gender || 'Pt'}`.trim();
  const primarySymp = req.symptoms.slice(0, 3).join(', ') || 'General malaise';
  const vitalSnippet = [
    vitals.systolic ? `BP ${vitals.systolic}/${vitals.diastolic || 60}` : null,
    vitals.pulse ? `HR ${vitals.pulse}` : null,
    vitals.spo2 ? `SpO2 ${vitals.spo2}%` : null,
    vitals.temperature ? `T ${vitals.temperature}°F` : null,
  ].filter(Boolean).join(' | ');

  const summary = `${urgencyTier}: ${patientDesc} with ${primarySymp}.${vitalSnippet ? ` [${vitalSnippet}]` : ''} ${flags.join(', ')}.`;

  const rawBytes = JSON.stringify(req).length + (req.voiceTranscript ? req.voiceTranscript.length * 2 : 0) + 1200; // raw form + uncompressed audio overhead
  const compressedBytes = Math.min(180, Math.max(76, Math.round(summary.length * 0.95 + flags.length * 4 + 40)));

  return {
    urgencyTier,
    urgencyScore,
    structuredSummary: summary,
    conditionFlags: flags.length ? flags : ['SYMPTOMATIC_REVIEW'],
    immediateActions,
    vitalAlerts,
    npuInferenceTimeMs: Math.floor(14 + Math.random() * 9), // Simulated 14-23ms Hexagon NPU execution time
    compressedPayloadBytes: compressedBytes,
    rawPayloadBytes: rawBytes,
    source: 'hexagon_npu_offline',
  };
}

// Triage endpoint: leverages Gemini 3.8 Flash if API key present, or fallback heuristic
app.post('/api/triage-summarize', async (req, res) => {
  const triageInput: TriageRequest = req.body;
  const gemini = getGeminiClient();

  if (!gemini) {
    const offlineResult = evaluateHeuristicTriage(triageInput);
    return res.json(offlineResult);
  }

  try {
    const prompt = `You are the LastMile Link on-device clinical triage engine running on an ASHA/ANM health worker's mobile phone in a remote rural Indian dead zone.
Your task is to convert raw unstructured intake data, vitals, and worker notes into a compact, hop-relayable clinical summary and assign an urgency tier.

Patient:
- Name: ${triageInput.patientName || 'Anonymous'}
- Age: ${triageInput.age || 'Unknown'}, Gender: ${triageInput.gender || 'Unknown'}
- Primary Symptoms: ${(triageInput.symptoms || []).join(', ')}
- Vitals: ${JSON.stringify(triageInput.vitals || {})}
- Notes: ${triageInput.rawNotes || 'None'}
- Voice Note Transcript: ${triageInput.voiceTranscript || 'None'}
- Worker: ${triageInput.ashaId || 'ASHA Node'}

Output STRICT JSON only matching this schema:
{
  "urgencyTier": "CRITICAL" | "HIGH" | "MODERATE" | "ROUTINE",
  "urgencyScore": number (1-100),
  "structuredSummary": "Dense, clinical, hop-sized summary maximum 22 words",
  "conditionFlags": ["STRING_UPPERCASE_FLAGS"],
  "immediateActions": ["Short action 1", "Short action 2"],
  "vitalAlerts": ["Alert 1 if any abnormal vitals"]
}`;

    const startTime = Date.now();
    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const elapsed = Date.now() - startTime;
    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    const rawBytes = JSON.stringify(triageInput).length + 1500;
    const summaryStr = parsed.structuredSummary || '';
    const compressedBytes = Math.min(220, Math.max(80, Math.round(summaryStr.length + (parsed.conditionFlags?.length || 1) * 8 + 35)));

    return res.json({
      urgencyTier: parsed.urgencyTier || 'MODERATE',
      urgencyScore: parsed.urgencyScore || 50,
      structuredSummary: parsed.structuredSummary || 'Clinical review needed.',
      conditionFlags: parsed.conditionFlags || ['UNSPECIFIED_TRIAGE'],
      immediateActions: parsed.immediateActions || ['Standard clinical evaluation upon arrival'],
      vitalAlerts: parsed.vitalAlerts || [],
      npuInferenceTimeMs: Math.min(24, Math.floor(elapsed / 10)), // Simulated on-device NPU equivalent execution
      compressedPayloadBytes: compressedBytes,
      rawPayloadBytes: rawBytes,
      source: 'gemini_cloud_accelerated',
    });
  } catch (err) {
    console.warn('Gemini triage fallback triggered:', err);
    const offlineResult = evaluateHeuristicTriage(triageInput);
    return res.json(offlineResult);
  }
});

// Chat & Multi-Step Booking Copilot endpoint
app.post('/api/chat', async (req, res) => {
  const { messages = [], userProfile = {} } = req.body;
  const gemini = getGeminiClient();

  // If no Gemini client or key, provide structured offline response
  if (!gemini) {
    return res.json({
      reply: "I am Astra, your offline field assistant. I have logged your request locally. For multi-step bookings, please provide: 1) Patient Name & Village, 2) Service needed (Ambulance 108 / ICU Bed / Blood Unit), 3) Urgency Level.",
      suggestedActions: ["Book 108 Ambulance", "Reserve ICU Bed", "Check Clinical Protocol"],
      source: "offline_npu_copilot"
    });
  }

  try {
    const formattedContents = messages.map((m: { sender: string; text: string }) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const systemInstruction = `You are 'Astra', an AI Clinical and Emergency Booking Copilot embedded inside the LastMile Link mobile app for rural healthcare workers (ASHA/ANM, PHC Medical Officers, and Transit Couriers).
The current user is ${userProfile.name || 'Healthcare Worker'} (${userProfile.role || 'ASHA_WORKER'}) stationed at ${userProfile.facilityOrVillage || 'Rural Field Station'}.

YOUR CAPABILITIES:
1. Multi-Step Emergency Bookings:
   - 108 Emergency Ambulance: Prompt user step-by-step for Patient Name, Exact Village/Landmark, Condition/Vitals, Oxygen/Stretcher need, and Contact Number.
   - Referral Hospital ICU Bed & Blood Units: Prompt for Target Hospital, Blood Type/Units needed, Bed Type (ICU/Pediatric/Isolation), and ETA.
   - Medical Courier / Anti-Snake Venom transit: Dispatch transit couriers along rural routes.
2. Clinical Field Guidance:
   - Emergency protocols for Postpartum Hemorrhage (PPH), Pediatric Respiratory Distress, Snakebite Envenomation, Severe Dehydration.

CONVERSATION CONTEXT & RULES:
- You REMEMBER previous turns in this conversation. NEVER ask for information the user already provided earlier in the chat.
- Keep answers crisp, empathetic, actionable, and suitable for a mobile screen.
- When all required booking parameters are collected, confirm the booking clearly, provide a Booking Reference (e.g. #EMG-8821 or #BED-4412), state the estimated arrival/ready time, and include a JSON booking object block if appropriate.
- Format responses cleanly with bolding and bullet points.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const replyText = response.text || "I am processing your field request.";

    // Parse potential booking details if confirmed
    let bookingData = undefined;
    if (replyText.includes('Booking Reference') || replyText.includes('#EMG-') || replyText.includes('#BED-')) {
      const isAmbulance = replyText.toLowerCase().includes('ambulance');
      bookingData = {
        bookingId: `BOOK-${Math.floor(1000 + Math.random() * 9000)}`,
        type: isAmbulance ? 'AMBULANCE_108' : 'ICU_BED',
        status: 'CONFIRMED',
        patientName: userProfile.lastPatient || 'Field Patient',
        pickupLocation: userProfile.facilityOrVillage || 'Gundlapally Village',
        destinationFacility: 'Malkapur Primary Health Centre',
        urgency: 'CRITICAL',
        contactPhone: userProfile.phone || '+91 98480 23145',
        confirmedAt: new Date().toISOString(),
        estimatedArrivalMin: 18,
      };
    }

    return res.json({
      reply: replyText,
      bookingData,
      suggestedActions: [
        "Confirm Dispatch",
        "View PHC Triage Queue",
        "Check Patient Vitals"
      ],
      source: "gemini_3.8_flash"
    });
  } catch (err) {
    console.error('Gemini chat error:', err);
    return res.json({
      reply: "Astra Field Copilot (Offline Mode): I have recorded your field instruction. If you are requesting an emergency ambulance, please state the patient's name, village landmark, and current vital signs.",
      suggestedActions: ["Book 108 Ambulance", "Reserve ICU Bed", "Emergency Protocols"],
      source: "offline_fallback"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LastMile Link server running on port ${PORT}`);
  });
}

startServer();
