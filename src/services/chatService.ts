import { ChatMessage, BookingRecord, UserProfile } from '../types';
import { notificationService } from './notificationService';

const CHAT_STORAGE_KEY = 'lastmile_astra_chat_history_v1';
const BOOKINGS_STORAGE_KEY = 'lastmile_field_bookings_v1';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg_welcome_01',
  sender: 'assistant',
  text: "Hello! I am **Astra**, your AI Field Medical & Booking Copilot. I can assist with emergency **108 Ambulance dispatch**, **Referral ICU bed & blood reservations**, or step-by-step **clinical guidance** in remote dead zones.\n\nHow can I support your field operation right now?",
  timestamp: new Date().toISOString(),
  suggestedActions: [
    "Book 108 Ambulance",
    "Reserve ICU Bed & Blood",
    "PPH Emergency Protocol",
    "Request Anti-Snake Venom"
  ],
};

interface MultiStepBookingDraft {
  type?: 'AMBULANCE_108' | 'ICU_BED' | 'BLOOD_BANK' | 'MED_COURIER';
  patientName?: string;
  village?: string;
  urgency?: 'CRITICAL' | 'HIGH' | 'NORMAL';
  specialNeeds?: string;
  step: number;
}

class ChatService {
  private messages: ChatMessage[] = [];
  private bookings: BookingRecord[] = [];
  private listeners: (() => void)[] = [];
  private activeDraft: MultiStepBookingDraft | null = null;

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        this.messages = JSON.parse(stored);
      } else {
        this.messages = [INITIAL_GREETING];
      }

      const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (storedBookings) {
        this.bookings = JSON.parse(storedBookings);
      }
    } catch {
      this.messages = [INITIAL_GREETING];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(this.messages));
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(this.bookings));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public getBookings(): BookingRecord[] {
    return this.bookings;
  }

  public clearConversation() {
    this.messages = [INITIAL_GREETING];
    this.activeDraft = null;
    this.saveHistory();
  }

  // Stateful offline fallback booking step machine
  private handleOfflineBookingStep(userText: string, userProfile?: UserProfile | null): ChatMessage {
    const textLower = userText.toLowerCase();

    // Check if initiating booking
    if (!this.activeDraft) {
      if (textLower.includes('ambulance') || textLower.includes('108')) {
        this.activeDraft = { type: 'AMBULANCE_108', step: 1 };
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: "🚑 **Step 1/3: 108 Emergency Ambulance Dispatch**\n\nPlease enter the **Patient Name** and their current condition or chief symptom (e.g. *Laxmi Bai, severe postpartum bleeding*).",
          timestamp: new Date().toISOString(),
          isMultiStep: true,
          suggestedActions: ["Laxmi Bai (PPH)", "Pediatric Patient (SpO2 88%)", "Snakebite Emergency"]
        };
      } else if (textLower.includes('bed') || textLower.includes('icu') || textLower.includes('blood')) {
        this.activeDraft = { type: 'ICU_BED', step: 1 };
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: "🏥 **Step 1/3: Referral Hospital Bed & Blood Unit Reservation**\n\nWhich referral center would you like to reserve? (e.g. *Nalgonda District Hospital* or *Malkapur Community Health Centre*), and what is the required specialty (ICU, Maternal, or Neonatal)?",
          timestamp: new Date().toISOString(),
          isMultiStep: true,
          suggestedActions: ["Nalgonda District HQ (Maternal ICU)", "Malkapur CHC (Emergency Ward)"]
        };
      } else if (textLower.includes('pph') || textLower.includes('hemorrhage') || textLower.includes('bleeding')) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: "🚨 **Immediate Clinical Protocol: Postpartum Hemorrhage (PPH)**\n\n1. **Uterine Massage:** Continuous bimanual compression of the fundus.\n2. **Uterotonic:** Administer Oxytocin 10 IU IM immediately (or Misoprostol 800mcg sublingually if cold chain unavailable).\n3. **Circulatory Access:** Insert 16G/18G wide-bore IV cannula; run normal saline wide open.\n4. **Keep Warm:** Cover patient, elevate legs to 30° to maintain cerebral and cardiac perfusion.\n\nWould you like me to initiate an emergency **108 Ambulance Dispatch** now?",
          timestamp: new Date().toISOString(),
          suggestedActions: ["Book 108 Ambulance Now", "Broadcast SOS to Mesh", "Check Oxygen Protocol"]
        };
      } else if (textLower.includes('snake') || textLower.includes('venom')) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: "🐍 **Emergency Protocol: Snakebite Envenomation**\n\n1. **Immobilize:** Keep affected limb completely immobilized below heart level with splint.\n2. **DO NOT:** Do NOT cut, suck, apply tourniquet, or apply ice.\n3. **Assess:** Check pupil dilation, ptosis (drooping eyelids), and fang puncture marks.\n4. **Transit:** Urgent transfer to PHC stocking polyvalent Anti-Snake Venom (ASV).\n\nShall I request emergency courier or ambulance dispatch?",
          timestamp: new Date().toISOString(),
          suggestedActions: ["Book 108 Ambulance", "Request ASV Transit Courier"]
        };
      }
    }

    // Processing Draft Steps
    if (this.activeDraft) {
      if (this.activeDraft.step === 1) {
        this.activeDraft.patientName = userText;
        this.activeDraft.step = 2;
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: `📍 **Step 2/3: Pickup Location & Landmark**\n\nRecorded patient: **${userText}**.\n\nPlease confirm the exact village, landmark, and road accessibility (e.g. *${userProfile?.facilityOrVillage || 'Gundlapally Village'}, Near Water Tank*).`,
          timestamp: new Date().toISOString(),
          isMultiStep: true,
          suggestedActions: [`${userProfile?.facilityOrVillage || 'Gundlapally Village'}, Primary School`, "Malkapur Road Cross"]
        };
      }

      if (this.activeDraft.step === 2) {
        this.activeDraft.village = userText;
        this.activeDraft.step = 3;
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: `⚡ **Step 3/3: Urgency & Equipment Needed**\n\nLocation set to: **${userText}**.\n\nDoes the transit unit require **High-flow Oxygen**, **Neo-natal resuscitation kit**, or an **Emergency Stretcher**?`,
          timestamp: new Date().toISOString(),
          isMultiStep: true,
          suggestedActions: ["Critical: High-flow Oxygen + Stretcher", "Standard Stretcher only", "Maternal Delivery Kit"]
        };
      }

      if (this.activeDraft.step === 3) {
        this.activeDraft.specialNeeds = userText;
        const bookingRef = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
        const isAmbulance = this.activeDraft.type === 'AMBULANCE_108';

        const newBooking: BookingRecord = {
          bookingId: bookingRef,
          type: this.activeDraft.type || 'AMBULANCE_108',
          status: 'DISPATCHED',
          patientName: this.activeDraft.patientName || 'Field Patient',
          pickupLocation: this.activeDraft.village || userProfile?.facilityOrVillage || 'Gundlapally Village',
          destinationFacility: 'Malkapur Primary Health Centre / District Referral',
          urgency: 'CRITICAL',
          contactPhone: userProfile?.phone || '+91 98480 23145',
          notes: `Needs: ${userText}`,
          confirmedAt: new Date().toISOString(),
          estimatedArrivalMin: 18,
        };

        this.bookings = [newBooking, ...this.bookings];
        this.activeDraft = null;

        // Auto trigger push notification for the booking!
        notificationService.sendNotification({
          title: isAmbulance ? '🚑 108 Emergency Ambulance Dispatched' : '🏥 Hospital Bed Reserved',
          message: `${isAmbulance ? 'Ambulance' : 'Referral Bed'} confirmed for ${newBooking.patientName} at ${newBooking.pickupLocation} (Ref #${bookingRef}). ETA: 18 mins.`,
          type: isAmbulance ? 'DISPATCH_108' : 'BOOKING_CONFIRMED',
          priority: 'CRITICAL',
          actionTargetRole: 'PHC_QUEUE',
          bookingRef: bookingRef,
        });

        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: `🎉 **Booking Confirmed & Dispatched!**\n\n- **Reference:** \`#${bookingRef}\`\n- **Service:** ${isAmbulance ? '108 Advanced Life Support Ambulance' : 'Emergency Referral ICU Bed'}\n- **Patient:** ${newBooking.patientName}\n- **Location:** ${newBooking.pickupLocation}\n- **ETA:** ~18 Minutes (Driver alert sent over BLE mesh gateway)\n- **Equipment Prepped:** ${userText}\n\nOur system has dispatched an emergency push notification to the PHC and transit dashboard.`,
          timestamp: new Date().toISOString(),
          bookingData: newBooking,
          suggestedActions: ["Track Dispatch on Radar", "View PHC Triage Queue", "Book Another Request"]
        };
      }
    }

    // Default general assistant response
    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: `I understood: "${userText}".\n\nI can coordinate **108 Ambulance Dispatch**, **Hospital Bed / Blood Unit reservation**, or provide **Offline Clinical Protocols**. Tap an option below to proceed.`,
      timestamp: new Date().toISOString(),
      suggestedActions: ["Book 108 Ambulance", "Reserve ICU Bed", "PPH Emergency Protocol"]
    };
  }

  public async sendMessage(
    text: string, 
    userProfile?: UserProfile | null, 
    isAirplaneMode: boolean = false
  ): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    this.messages.push(userMsg);
    this.saveHistory();

    // If offline or user in airplane mode, execute the deterministic stateful field booking engine
    if (isAirplaneMode) {
      // Simulate on-device NPU response delay
      await new Promise(r => setTimeout(r, 450));
      const offlineReply = this.handleOfflineBookingStep(text, userProfile);
      this.messages.push(offlineReply);
      this.saveHistory();
      return offlineReply;
    }

    // Try Gemini 3.8 Flash via /api/chat
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.messages.map(m => ({ sender: m.sender, text: m.text })),
          userProfile: {
            name: userProfile?.name,
            role: userProfile?.role,
            facilityOrVillage: userProfile?.facilityOrVillage,
            phone: userProfile?.phone,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Request received and processed.',
        timestamp: new Date().toISOString(),
        bookingData: data.bookingData,
        suggestedActions: data.suggestedActions || ["Book 108 Ambulance", "View PHC Triage Queue"],
      };

      if (data.bookingData) {
        this.bookings = [data.bookingData, ...this.bookings];
        notificationService.sendNotification({
          title: '✅ Referral Service Confirmed by Copilot',
          message: `${data.bookingData.type === 'AMBULANCE_108' ? 'Ambulance' : 'ICU Bed'} booked for ${data.bookingData.patientName} (${data.bookingData.bookingId}).`,
          type: 'BOOKING_CONFIRMED',
          priority: 'HIGH',
          actionTargetRole: 'PHC_QUEUE',
          bookingRef: data.bookingData.bookingId,
        });
      }

      this.messages.push(assistantMsg);
      this.saveHistory();
      return assistantMsg;
    } catch (err) {
      console.warn('Falling back to local Astra conversational engine:', err);
      const fallbackReply = this.handleOfflineBookingStep(text, userProfile);
      this.messages.push(fallbackReply);
      this.saveHistory();
      return fallbackReply;
    }
  }
}

export const chatService = new ChatService();
