import { PushNotification, NotificationType } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'lastmile_push_notifications_v1';

// Initial preloaded notifications to show immediate rich activity
const DEFAULT_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif_init_1',
    title: '⚠️ Critical Maternal Shock Alert',
    message: 'Laxmi Bai (24F) reported with severe postpartum hemorrhage. Urgency Score 94/100. Prioritized at top of PHC queue.',
    type: 'CRITICAL_ALERT',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    read: false,
    priority: 'CRITICAL',
    actionTargetRole: 'PHC_QUEUE',
    caseId: 'case_pph_01',
  },
  {
    id: 'notif_init_2',
    title: '📡 Peer Hop Forwarded via Transit Bus',
    message: 'Packet PKT-904 picked up by Ramesh Goud (RTC Bus #4) over BLE 5.2. En route to Malkapur PHC.',
    type: 'MESH_RELAY',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    read: false,
    priority: 'HIGH',
    actionTargetRole: 'RELAY_NODE',
  },
  {
    id: 'notif_init_3',
    title: '✅ Gateway Delivered & Decrypted',
    message: 'Pediatric Respiratory Distress case delivered to Dr. V. Sharma at Malkapur PHC. Oxygen cylinder prepped.',
    type: 'GATEWAY_SYNC',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: true,
    priority: 'NORMAL',
    actionTargetRole: 'PHC_QUEUE',
  },
];

class NotificationService {
  private notifications: PushNotification[] = [];
  private listeners: (() => void)[] = [];
  private activeToast: PushNotification | null = null;
  private toastListeners: ((notif: PushNotification | null) => void)[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...DEFAULT_NOTIFICATIONS];
        this.saveNotifications();
      }
    } catch {
      this.notifications = [...DEFAULT_NOTIFICATIONS];
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private notifyToast(notif: PushNotification | null) {
    this.activeToast = notif;
    this.toastListeners.forEach(cb => cb(notif));
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public subscribeToast(cb: (notif: PushNotification | null) => void): () => void {
    this.toastListeners.push(cb);
    return () => {
      this.toastListeners = this.toastListeners.filter(l => l !== cb);
    };
  }

  public getNotifications(): PushNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public getActiveToast(): PushNotification | null {
    return this.activeToast;
  }

  // Play crisp iQOO OriginOS-style chime via Web Audio API
  private playChime(isCritical: boolean = false) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime); // D5 or A5
      osc.frequency.exponentialRampToValueAtTime(isCritical ? 1174.66 : 880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio context might be restricted before interaction; safe to ignore
    }
  }

  public sendNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    priority?: 'CRITICAL' | 'HIGH' | 'NORMAL';
    actionTargetRole?: PushNotification['actionTargetRole'];
    caseId?: string;
    bookingRef?: string;
  }): PushNotification {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority || 'NORMAL',
      timestamp: new Date().toISOString(),
      read: false,
      actionTargetRole: data.actionTargetRole,
      caseId: data.caseId,
      bookingRef: data.bookingRef,
    };

    this.notifications = [newNotif, ...this.notifications].slice(0, 30);
    this.saveNotifications();
    this.playChime(data.priority === 'CRITICAL');

    // Trigger visual pop-down toast
    this.notifyToast(newNotif);
    setTimeout(() => {
      if (this.activeToast?.id === newNotif.id) {
        this.notifyToast(null);
      }
    }, 4500);

    return newNotif;
  }

  public dismissToast() {
    this.notifyToast(null);
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
  }

  public clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Pre-defined Scenario Simulations
  public triggerScenario(scenario: 'CRITICAL_PPH' | 'MESH_HANDSHAKE' | 'GATEWAY_DELIVERY' | 'AMBULANCE_108' | 'BED_BOOKING') {
    switch (scenario) {
      case 'CRITICAL_PPH':
        this.sendNotification({
          title: '🚨 Maternal Shock Warning (Score 94)',
          message: 'ASHA Sunita broadcasted Tier-1 Critical PPH for Laxmi Bai. Active bleeding, BP 78/48. Immediate IV fluids required.',
          type: 'CRITICAL_ALERT',
          priority: 'CRITICAL',
          actionTargetRole: 'PHC_QUEUE',
          caseId: 'case_pph_01',
        });
        break;

      case 'MESH_HANDSHAKE':
        this.sendNotification({
          title: '📡 BLE Mesh Peer Relay Detected',
          message: 'Packet PKT-704 forwarded via Ramesh Goud (RTC Bus #4, RSSI -64 dBm). 2nd hop confirmed.',
          type: 'MESH_RELAY',
          priority: 'HIGH',
          actionTargetRole: 'RELAY_NODE',
        });
        break;

      case 'GATEWAY_DELIVERY':
        this.sendNotification({
          title: '🏥 Malkapur PHC Gateway Received Case',
          message: 'Encrypted packet delivered to Dr. V. Sharma. Triage queue automatically reordered by clinical score.',
          type: 'GATEWAY_SYNC',
          priority: 'HIGH',
          actionTargetRole: 'PHC_QUEUE',
        });
        break;

      case 'AMBULANCE_108':
        this.sendNotification({
          title: '🚑 108 Emergency Ambulance Dispatched',
          message: 'Vehicle TS-08-EMG-108 dispatched from Nalgonda Depot to Gundlapally Village. ETA: 18 minutes.',
          type: 'DISPATCH_108',
          priority: 'CRITICAL',
          actionTargetRole: 'PHC_QUEUE',
        });
        break;

      case 'BED_BOOKING':
        this.sendNotification({
          title: '✅ Emergency Referral Bed Confirmed',
          message: 'ICU Bed #04 and 2 Units of O-Negative blood confirmed at Nalgonda District Hospital (Ref: #BOOK-9821).',
          type: 'BOOKING_CONFIRMED',
          priority: 'HIGH',
          actionTargetRole: 'AI_CHATBOT',
          bookingRef: 'BOOK-9821',
        });
        break;
    }
  }
}

export const notificationService = new NotificationService();
