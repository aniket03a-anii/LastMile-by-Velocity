# LastMile Link 📡

> **Offline, AI-Prioritized Healthcare Data Relay for Connectivity Dead Zones**  
> *Enabling frontline health workers to transmit life-saving triage packets phone-to-phone across BLE mesh networks when cellular signals drop to zero.*

---

## 🌍 The Problem

In rural and remote regions across the globe—such as underserved districts in India—more than **1 million frontline health workers (ASHA and ANM staff)** routinely operate in total cellular dead zones for hours or days. 

When a critical medical emergency occurs (such as maternal postpartum hemorrhage, neonatal asphyxia, or snakebite envenomation), time-sensitive clinical information sits stranded on a mobile device because:
- **Existing mesh apps** (e.g., Bridgefy) simply blast uncompressed text without clinical intelligence or urgency triage.
- **Traditional telemedicine apps** fail completely without live internet or cloud synchronization.
- **Hours of delay** in dispatching emergency 108 ambulances or securing blood units lead to preventable fatalities.

---

## ⚡ The Solution: LastMile Link

**LastMile Link** adds the crucial missing layer: **On-Device AI and Opportunistic Bluetooth Low Energy (BLE) Mesh Relays**.

When a health worker records a patient case in airplane mode:
1. **On-Device AI (Hexagon NPU)** structures the voice notes and clinical vitals into an emergency triage packet, compressing it down to **~134 bytes in just 16ms**.
2. **Opportunistic BLE 5.2 Hop**: As milk delivery vans, local buses, or transit couriers pass within 30 meters, their phones automatically pick up the encrypted beacon packet in the background without user intervention.
3. **Clinical Priority Queue at PHC**: When the packet arrives at the Primary Health Centre (PHC), the medical officer's triage queue dynamically re-orders itself by **clinical urgency score** rather than arrival time. A critical PPH case arriving hours later instantly jumps straight to the top.

---

## ✨ Key Features

### 1. 🪪 Healthcare Worker Authentication Vault
- **Frontline Field Access**: Multi-role support for ASHA Workers, Transit Relays, PHC Medical Officers, and District Health Administrators.
- **Offline PIN & Security Reset**: Password recovery using pre-configured 4-digit emergency PINs and village security keys without requiring cloud access.
- **1-Tap Demo Switcher**: Instant switching between simulated frontline personas with biometric verification badges.

### 2. 📱 iOS Wallet-Style Mobile Experience
- **Crystal Clear UI**: Built with a clean, high-contrast aesthetic (`#F5F6F8` light canvas, pure white card containers, delicate border framing, and `rounded-3xl` surfaces).
- **Physical Phone Frame**: High-fidelity hardware emulation complete with a dynamic island status bar, signal/battery monitoring, and haptic toast alerts.
- **Card-Based Dashboard**: Fast access to emergency triage capture, courier mesh nodes, PHC queues, AI copilot, and hardware benchmarks.

### 3. 🔔 Push Notification Daemon & Scenario Simulator
- **Live Dispatch Alerts**: Immediate notifications for critical maternal shock, peer-to-peer BLE hop handshakes, 108 emergency ambulance dispatches, and ICU bed confirmations.
- **Dynamic In-App Toast**: Pill-shaped top banners with urgency indicators and 1-tap navigation directly into case review.
- **Interactive Notification Center**: Full notification shade with unread counters, scenario triggers, and audit log history.

### 4. 🤖 Context-Aware AI Copilot (Astra)
- **Multi-Turn Clinical Assistant**: Remembers conversational context across multiple interactions.
- **Step-by-Step Emergency Bookings**: Guides workers through reserving district ICU beds and matched O-negative blood units.
- **Offline Protocol Fallback**: Provides immediate offline guidance for maternal hemorrhage, neonatal resuscitation, and shock management.

### 5. 🔬 Hardware NPU & BLE Architecture Inspector
- **Hexagon NPU Benchmarking**: Compares 16.4ms dedicated NPU inference against standard 412ms CPU processing (25x faster, 94.5% bandwidth reduction).
- **Hop Packet Inspector**: Inspects raw, signed 134-byte JSON payloads configured to fit within a single BLE 5.2 Extended Advertising frame.
- **Live 3-Minute Pitch Simulator**: Step-through interactive demonstration flow walking judges through the 3-node physical relay chain (Phone A ➡️ Phone B ➡️ Phone C).

---

## 🏗️ Architecture Flow

```text
[ PHONE A: Dead Zone (ASHA) ]
        │
        ▼  Voice Note + Vitals
   Hexagon NPU (~16ms)
        │
        ▼  Signed 134-byte packet
   BLE 5.2 Extended Adv Beacon (TTL: 5)
        │
        ▼  (P2P range ~30m)
[ PHONE B: Transit Courier (Milk Van) ]
        │
        ▼  Carries packet along rural transit corridor
[ PHONE C: PHC Doctor / Station ]
        │
        ▼  BLE Packet Decrypted & Verified
   Urgency-Ranked Medical Officer Queue
        │
   🚨 High Urgency (Score 90+) jumps to TOP of queue
   🚑 Automated 108 Ambulance Dispatch & ICU Bed Booking
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Backend / API**: Express 4, Node.js, `tsx`
- **AI Integration**: Google Gemini API (`@google/genai`) with offline fallback triage rules
- **Build System**: Vite 8, esbuild bundle, TypeScript 7

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lastmile-link.git
   cd lastmile-link
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Privacy-by-Architecture Guarantee

In rural health networks, patient dignity and clinical privacy are paramount:
- **Zero Raw Voice Transmission**: Raw audio notes never leave the originating phone.
- **Zero Cloud Storage in Transit**: Bypass intermediary servers; data travels node-to-node across ephemeral peer handshakes.
- **Encrypted Triage Digests**: Only compact, hashed, and cryptographically signed triage packets are relayed across bystander nodes.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
