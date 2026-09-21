import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { AshaCaptureView } from './components/AshaCaptureView';
import { RelayNodeView } from './components/RelayNodeView';
import { PhcQueueView } from './components/PhcQueueView';
import { SupportChatbotView } from './components/SupportChatbotView';
import { LivePitchRelayDemo } from './components/LivePitchRelayDemo';
import { HardwareNpuBenchmark } from './components/HardwareNpuBenchmark';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AuthModal } from './components/AuthModal';
import { NotificationShade } from './components/NotificationShade';
import { PushNotificationToast } from './components/PushNotificationToast';
import { AppRole, HealthCase, UserProfile, PushNotification } from './types';
import { meshRelay } from './services/meshRelayEngine';
import { authService } from './services/authService';
import { notificationService } from './services/notificationService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>('HOME_DASHBOARD');
  const [airplaneMode, setAirplaneMode] = useState<boolean>(true); // Default to True: "Dead Zone / Airplane Mode"
  const [bleActive, setBleActive] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<HealthCase | null>(null);
  const [queueCount, setQueueCount] = useState({ critical: 0, total: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Push Notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(notificationService.getNotifications());
  const [isNotifShadeOpen, setIsNotifShadeOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  const updateCounts = () => {
    const queue = meshRelay.getPhcQueue();
    const crit = queue.filter(c => c.aiTriage.urgencyTier === 'CRITICAL').length;
    setQueueCount({ critical: crit, total: queue.length });
  };

  useEffect(() => {
    updateCounts();
    const unsubMesh = meshRelay.subscribe(updateCounts);
    const unsubAuth = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    const unsubNotif = notificationService.subscribe(() => {
      setNotifications([...notificationService.getNotifications()]);
    });
    const unsubToast = notificationService.subscribeToast((notif) => {
      setActiveToast(notif);
    });

    return () => {
      unsubMesh();
      unsubAuth();
      unsubNotif();
      unsubToast();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCaseBroadcasted = (createdCase: HealthCase) => {
    triggerToast(`Broadcasted: ${createdCase.patientName} (${createdCase.aiTriage.urgencyTier}) to BLE Mesh`);
    
    // Auto push notification for the created case!
    if (createdCase.aiTriage.urgencyTier === 'CRITICAL') {
      notificationService.sendNotification({
        title: `🚨 Critical Alert: ${createdCase.patientName}`,
        message: `${createdCase.aiTriage.structuredSummary} (Score ${createdCase.aiTriage.urgencyScore}/100). Forwarding via BLE hops.`,
        type: 'CRITICAL_ALERT',
        priority: 'CRITICAL',
        actionTargetRole: 'PHC_QUEUE',
        caseId: createdCase.id,
      });
    } else {
      notificationService.sendNotification({
        title: `📡 New Mesh Case: ${createdCase.patientName}`,
        message: `${createdCase.patientName} (${createdCase.age}y) buffered in origin radio memory for relay transit.`,
        type: 'MESH_RELAY',
        priority: 'NORMAL',
        actionTargetRole: 'RELAY_NODE',
        caseId: createdCase.id,
      });
    }
  };

  const handleForwardToPhc = (caseId: string) => {
    const success = meshRelay.deliverToPhc(caseId);
    if (success) {
      triggerToast('Packet delivered to PHC Gateway! Queue re-ordered by clinical urgency.');
      notificationService.sendNotification({
        title: '🏥 Gateway Sync Confirmed',
        message: 'Packet delivered to Malkapur PHC. Doctor alerted and clinical triage re-sorted.',
        type: 'GATEWAY_SYNC',
        priority: 'HIGH',
        actionTargetRole: 'PHC_QUEUE',
      });
    }
  };

  const handleResetSeedData = () => {
    meshRelay.resetToDefaultSeed();
    triggerToast('Reset to default field clinical demo cases.');
  };

  return (
    <>
      {/* Native-like In-App Push Notification Drop-Down Toast */}
      <PushNotificationToast
        notification={activeToast}
        onDismiss={() => notificationService.dismissToast()}
        onNavigate={(role) => setCurrentRole(role)}
      />

      <PhoneFrame
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        airplaneMode={airplaneMode}
        onToggleAirplaneMode={() => {
          const next = !airplaneMode;
          setAirplaneMode(next);
          triggerToast(next ? 'Airplane Mode ON (Dead Zone active)' : 'Cellular Signal Restored');
        }}
        bleActive={bleActive}
        onToggleBle={() => {
          const next = !bleActive;
          setBleActive(next);
          triggerToast(next ? 'BLE 5.2 Mesh Activated' : 'BLE Mesh Radios Suspended');
        }}
        queueCount={queueCount}
        currentUser={currentUser}
        unreadNotificationsCount={notificationService.getUnreadCount()}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotifShadeOpen(true)}
      >
        {currentRole === 'HOME_DASHBOARD' && (
          <HomeScreen
            currentUser={currentUser}
            onNavigate={(role) => setCurrentRole(role)}
            airplaneMode={airplaneMode}
            bleActive={bleActive}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenNotifications={() => setIsNotifShadeOpen(true)}
            unreadNotificationCount={notificationService.getUnreadCount()}
          />
        )}

        {currentRole === 'ASHA_CAPTURE' && (
          <AshaCaptureView 
            onCaseBroadcasted={handleCaseBroadcasted}
            airplaneMode={airplaneMode}
          />
        )}

        {currentRole === 'RELAY_NODE' && (
          <RelayNodeView
            onSelectCaseDetail={setSelectedCase}
            onForwardToPhc={handleForwardToPhc}
          />
        )}

        {currentRole === 'PHC_QUEUE' && (
          <PhcQueueView
            onSelectCaseDetail={setSelectedCase}
            onResetSeedData={handleResetSeedData}
          />
        )}

        {currentRole === 'AI_CHATBOT' && (
          <SupportChatbotView
            currentUser={currentUser}
            airplaneMode={airplaneMode}
            onNavigateToRole={(role) => setCurrentRole(role)}
          />
        )}

        {currentRole === 'LIVE_DEMO' && (
          <LivePitchRelayDemo
            onSwitchToView={(view) => setCurrentRole(view)}
          />
        )}

        {currentRole === 'NPU_BENCHMARKS' && (
          <HardwareNpuBenchmark />
        )}
      </PhoneFrame>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-semibold tracking-tight">{toastMessage}</span>
        </div>
      )}

      {/* Clinical Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          healthCase={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {/* User Authentication & Profile Security Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          triggerToast(`Authenticated as ${user.name} (${user.workerId})`);
        }}
      />

      {/* Native Push Notification Drawer Shade */}
      <NotificationShade
        isOpen={isNotifShadeOpen}
        onClose={() => setIsNotifShadeOpen(false)}
        notifications={notifications}
        onNavigate={(role) => setCurrentRole(role)}
      />
    </>
  );
}
