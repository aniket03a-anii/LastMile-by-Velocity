export type UrgencyTier = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE';

export interface Vitals {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  bloodSugar?: number;
}

export interface AiTriageResult {
  urgencyTier: UrgencyTier;
  urgencyScore: number; // 1-100
  structuredSummary: string;
  conditionFlags: string[];
  immediateActions: string[];
  vitalAlerts: string[];
  npuInferenceTimeMs: number;
  compressedPayloadBytes: number;
  rawPayloadBytes: number;
  source: 'hexagon_npu_offline' | 'gemini_cloud_accelerated';
}

export interface HopTrace {
  deviceId: string;
  deviceName: string;
  role: 'ASHA_ORIGIN' | 'TRANSIT_RELAY' | 'PHC_RECEIVER';
  timestamp: string;
  rssi: number; // dBm e.g. -64
  protocol: 'BLE_5.2_ADV' | 'WIFI_DIRECT_P2P';
}

export interface MeshPacket {
  packetId: string;
  hash: string;
  originDeviceId: string;
  currentHops: number;
  maxTtl: number; // e.g. 5 hops
  hopTraces: HopTrace[];
  deliveryStatus: 'ORIGIN_BUFFER' | 'IN_TRANSIT' | 'DELIVERED_TO_PHC';
  deliveredAt?: string;
  rawPayloadSize: number;
  compressedSize: number;
}

export interface HealthCase {
  id: string;
  caseNumber: string;
  ashaId: string;
  workerName: string;
  village: string;
  recordedAt: string;
  patientName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  symptoms: string[];
  vitals: Vitals;
  rawNotes: string;
  hasVoiceNote: boolean;
  voiceDurationSec?: number;
  voiceTranscript?: string;
  aiTriage: AiTriageResult;
  meshPacket: MeshPacket;
}

export type AppRole = 
  | 'HOME_DASHBOARD' 
  | 'ASHA_CAPTURE' 
  | 'RELAY_NODE' 
  | 'PHC_QUEUE' 
  | 'AI_CHATBOT' 
  | 'LIVE_DEMO' 
  | 'NPU_BENCHMARKS';

export type UserRole = 'ASHA_WORKER' | 'TRANSIT_RELAY' | 'PHC_DOCTOR' | 'DISTRICT_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  workerId: string;
  role: UserRole;
  facilityOrVillage: string;
  phone: string;
  email?: string;
  avatarInitials: string;
  biometricEnabled: boolean;
  registeredAt: string;
}

export type NotificationType = 
  | 'CRITICAL_ALERT' 
  | 'MESH_RELAY' 
  | 'DISPATCH_108' 
  | 'BOOKING_CONFIRMED' 
  | 'GATEWAY_SYNC';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  actionTargetRole?: AppRole;
  caseId?: string;
  bookingRef?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  bookingData?: BookingRecord;
  suggestedActions?: string[];
  isMultiStep?: boolean;
}

export interface BookingRecord {
  bookingId: string;
  type: 'AMBULANCE_108' | 'ICU_BED' | 'BLOOD_BANK' | 'MED_COURIER';
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED';
  patientName: string;
  pickupLocation: string;
  destinationFacility: string;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  contactPhone: string;
  notes?: string;
  estimatedArrivalMin?: number;
  confirmedAt?: string;
}
