import { HealthCase, HopTrace, MeshPacket } from '../types';
import { INITIAL_SEED_CASES } from '../data/seedCases';

const STORAGE_KEY = 'lastmile_link_cases_v2';
const DEDUP_CACHE_KEY = 'lastmile_link_seen_packet_hashes_v2';

export class MeshRelayEngine {
  private cases: HealthCase[] = [];
  private seenHashes: Set<string> = new Set();
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedHashes = localStorage.getItem(DEDUP_CACHE_KEY);

      if (stored) {
        this.cases = JSON.parse(stored);
      } else {
        this.cases = [...INITIAL_SEED_CASES];
        this.saveToStorage();
      }

      if (storedHashes) {
        this.seenHashes = new Set(JSON.parse(storedHashes));
      } else {
        this.seenHashes = new Set(this.cases.map(c => c.meshPacket.hash));
        this.saveSeenHashes();
      }
    } catch (e) {
      console.error('Failed to load from storage, using seed cases:', e);
      this.cases = [...INITIAL_SEED_CASES];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cases));
    } catch (e) {
      console.warn('Storage quota warning:', e);
    }
  }

  private saveSeenHashes() {
    try {
      localStorage.setItem(DEDUP_CACHE_KEY, JSON.stringify(Array.from(this.seenHashes)));
    } catch (e) {
      console.warn('Storage quota warning for hashes:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.saveSeenHashes();
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getCases(): HealthCase[] {
    return [...this.cases];
  }

  public getPhcQueue(): HealthCase[] {
    // Deliver & Act requirement (from Section 4 & 5 of the PDF):
    // "ordered by urgency tier — not by arrival time — so the most critical cases are seen first regardless of how long they took to arrive."
    const tierPriority = {
      CRITICAL: 1,
      HIGH: 2,
      MODERATE: 3,
      ROUTINE: 4,
    };

    return [...this.cases]
      .filter(c => c.meshPacket.deliveryStatus === 'DELIVERED_TO_PHC')
      .sort((a, b) => {
        const tierDiff = tierPriority[a.aiTriage.urgencyTier] - tierPriority[b.aiTriage.urgencyTier];
        if (tierDiff !== 0) return tierDiff;
        // Secondary sort: urgency score descending
        const scoreDiff = b.aiTriage.urgencyScore - a.aiTriage.urgencyScore;
        if (scoreDiff !== 0) return scoreDiff;
        // Tertiary sort: newer cases first
        return new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
      });
  }

  public getTransitCases(): HealthCase[] {
    return [...this.cases].filter(c => c.meshPacket.deliveryStatus === 'IN_TRANSIT' || c.meshPacket.deliveryStatus === 'ORIGIN_BUFFER');
  }

  public addCase(newCase: HealthCase): boolean {
    // Deduplication check
    if (this.seenHashes.has(newCase.meshPacket.hash)) {
      console.log(`[MeshRelay] Dropping duplicate packet hash: ${newCase.meshPacket.hash}`);
      return false;
    }

    this.seenHashes.add(newCase.meshPacket.hash);
    this.cases.unshift(newCase);
    this.notify();
    return true;
  }

  // Simulate hop progression from Origin -> Transit Relay Node
  public forwardToTransit(caseId: string, relayDeviceName: string = "Ramesh's Delivery Van (Hop 1)"): boolean {
    const target = this.cases.find(c => c.id === caseId);
    if (!target) return false;

    if (target.meshPacket.currentHops >= target.meshPacket.maxTtl) {
      console.warn('[MeshRelay] Packet reached TTL limit. Dropping.');
      return false;
    }

    const newHop: HopTrace = {
      deviceId: `NODE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      deviceName: relayDeviceName,
      role: 'TRANSIT_RELAY',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      rssi: Math.floor(-55 - Math.random() * 25),
      protocol: 'BLE_5.2_ADV',
    };

    target.meshPacket.currentHops += 1;
    target.meshPacket.hopTraces.push(newHop);
    target.meshPacket.deliveryStatus = 'IN_TRANSIT';
    this.notify();
    return true;
  }

  // Simulate arrival at PHC Receiving Station
  public deliverToPhc(caseId: string, phcName: string = 'Malkapur Primary Health Centre'): boolean {
    const target = this.cases.find(c => c.id === caseId);
    if (!target) return false;

    const finalHop: HopTrace = {
      deviceId: 'PHC-STATION-RECEIVER',
      deviceName: phcName,
      role: 'PHC_RECEIVER',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      rssi: Math.floor(-48 - Math.random() * 15),
      protocol: 'WIFI_DIRECT_P2P',
    };

    target.meshPacket.currentHops += 1;
    target.meshPacket.hopTraces.push(finalHop);
    target.meshPacket.deliveryStatus = 'DELIVERED_TO_PHC';
    target.meshPacket.deliveredAt = new Date().toISOString();
    this.notify();
    return true;
  }

  public resetToDefaultSeed() {
    this.cases = JSON.parse(JSON.stringify(INITIAL_SEED_CASES));
    this.seenHashes = new Set(this.cases.map(c => c.meshPacket.hash));
    this.notify();
  }

  public clearAll() {
    this.cases = [];
    this.seenHashes = new Set();
    this.notify();
  }
}

export const meshRelay = new MeshRelayEngine();
