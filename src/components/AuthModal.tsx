import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  KeyRound, 
  Fingerprint, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  UserPlus, 
  LogIn, 
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import { authService, StoredUser } from '../services/authService';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
}

type AuthTab = 'LOGIN' | 'SIGNUP' | 'RESET' | 'PROFILE';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, onAuthSuccess }) => {
  const [tab, setTab] = useState<AuthTab>(currentUser ? 'PROFILE' : 'LOGIN');
  
  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginSecret, setLoginSecret] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupWorkerId, setSignupWorkerId] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('ASHA_WORKER');
  const [signupFacility, setSignupFacility] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAnswer, setSignupAnswer] = useState('');
  const [signupPin, setSignupPin] = useState('');

  // Password Reset form state
  const [resetId, setResetId] = useState('');
  const [resetSecret, setResetSecret] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!loginId || !loginSecret) {
      setFeedback({ type: 'error', text: 'Please fill in both Worker ID/Email and password/PIN.' });
      return;
    }

    const res = authService.login(loginId, loginSecret);
    if (res.success && res.user) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleBiometricLogin = (user: StoredUser) => {
    const res = authService.biometricUnlock(user.id);
    if (res.success && res.user) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 400);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!signupName || !signupWorkerId || !signupFacility || !signupPhone || !signupPassword) {
      setFeedback({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    const res = authService.register({
      name: signupName,
      workerId: signupWorkerId,
      role: signupRole,
      facilityOrVillage: signupFacility,
      phone: signupPhone,
      email: signupEmail,
      password: signupPassword,
      securityAnswer: signupAnswer || 'field',
      emergencyPin: signupPin || '1234',
    });

    if (res.success && res.user) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!resetId || !resetSecret || !resetNewPassword) {
      setFeedback({ type: 'error', text: 'Please complete all fields to reset password.' });
      return;
    }

    const res = authService.resetPassword({
      identifier: resetId,
      securityAnswerOrPin: resetSecret,
      newPassword: resetNewPassword,
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setTab('LOGIN');
        setLoginId(resetId);
        setLoginSecret('');
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const presetUsers = authService.getAllPresetUsers();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900 max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Healthcare Security Vault</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 font-mono">ENCRYPTED</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Frontline Field Worker Access & Verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 bg-[#F5F6F8] p-1.5 gap-1 text-[11px] font-bold">
          {currentUser && (
            <button
              onClick={() => { setTab('PROFILE'); setFeedback(null); }}
              className={`flex-1 py-2 rounded-2xl transition-all ${
                tab === 'PROFILE' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              My Profile
            </button>
          )}
          <button
            onClick={() => { setTab('LOGIN'); setFeedback(null); }}
            className={`flex-1 py-2 rounded-2xl transition-all ${
              tab === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('SIGNUP'); setFeedback(null); }}
            className={`flex-1 py-2 rounded-2xl transition-all ${
              tab === 'SIGNUP' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('RESET'); setFeedback(null); }}
            className={`flex-1 py-2 rounded-2xl transition-all ${
              tab === 'RESET' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Reset PIN
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 text-xs bg-white">
          
          {feedback && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              feedback.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
              <span className="font-medium">{feedback.text}</span>
            </div>
          )}

          {/* TAB: PROFILE */}
          {tab === 'PROFILE' && currentUser && (
            <div className="flex flex-col gap-3.5">
              <div className="bg-[#F5F6F8] p-4 rounded-3xl border border-slate-100 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{currentUser.name}</h3>
                  <p className="text-[11px] font-mono text-slate-600 font-bold">{currentUser.workerId} · {currentUser.role}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.facilityOrVillage}</p>
                </div>
              </div>

              <div className="space-y-2 bg-[#F5F6F8] p-3.5 rounded-3xl border border-slate-100 text-[11px]">
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> Contact:</span>
                  <span className="font-mono font-bold text-slate-900">{currentUser.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-slate-400" /> Facility:</span>
                  <span className="text-slate-900 font-bold">{currentUser.facilityOrVillage}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 flex items-center gap-1.5"><Fingerprint className="w-3 h-3 text-blue-600" /> Biometrics:</span>
                  <span className="text-slate-900 font-bold">Ultrasonic 3D Active</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    authService.logout();
                    setTab('LOGIN');
                    setFeedback({ type: 'success', text: 'Successfully signed out.' });
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  Sign Out Session
                </button>
              </div>
            </div>
          )}

          {/* TAB: LOGIN */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Healthcare Worker ID or Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. ASHA-704 or +91 98480 23145"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    Password or 4-Digit Field PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('RESET')}
                    className="text-[10px] text-blue-600 font-semibold underline hover:text-blue-800"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Enter password or 4-digit PIN"
                  value={loginSecret}
                  onChange={(e) => setLoginSecret(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1.5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Verify & Sign In</span>
              </button>

              {/* 1-Tap Demo Switcher for fast verification */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Fast Switch Demo Accounts:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {presetUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleBiometricLogin(u)}
                      className="p-2.5 rounded-2xl bg-[#F5F6F8] hover:bg-slate-200/80 border border-slate-200 hover:border-slate-300 text-left transition-all flex items-center gap-2 group shadow-xs"
                    >
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.avatarInitials}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{u.workerId}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB: SIGNUP */}
          {tab === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kavitha Reddy"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Worker ID / Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASHA-905"
                    value={signupWorkerId}
                    onChange={(e) => setSignupWorkerId(e.target.value)}
                    className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    App Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-2.5 py-2 text-slate-900 text-xs focus:outline-none font-medium"
                  >
                    <option value="ASHA_WORKER">ASHA Field Worker</option>
                    <option value="TRANSIT_RELAY">Transit Courier</option>
                    <option value="PHC_DOCTOR">PHC Medical Officer</option>
                    <option value="DISTRICT_ADMIN">District Health Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Village / Facility Center
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gundlapally Sub-Centre"
                  value={signupFacility}
                  onChange={(e) => setSignupFacility(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Emergency PIN (4 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 5566"
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value)}
                    className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Create Password (min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Field Worker Account</span>
              </button>
            </form>
          )}

          {/* TAB: RESET */}
          {tab === 'RESET' && (
            <form onSubmit={handleReset} className="flex flex-col gap-3">
              <div className="bg-[#F5F6F8] p-3.5 rounded-3xl border border-slate-200 text-[11px] text-slate-700">
                <p className="font-bold text-slate-900">Offline PIN Reset Protocol</p>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Enter your Worker ID and your pre-configured 4-digit Emergency PIN or Village Security Key to establish a new password.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Worker ID or Registered Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. ASHA-704"
                  value={resetId}
                  onChange={(e) => setResetId(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Emergency PIN or Security Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7041 or gundlapally"
                  value={resetSecret}
                  onChange={(e) => setResetSecret(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1.5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Authorize & Update Password</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
