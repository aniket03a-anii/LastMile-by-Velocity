import { UserProfile, UserRole } from '../types';

export interface StoredUser extends UserProfile {
  passwordHash: string;
  securityAnswerHash: string;
  emergencyPin: string;
}

const STORAGE_USERS_KEY = 'lastmile_auth_users_v1';
const STORAGE_SESSION_KEY = 'lastmile_auth_session_v1';

// Simple deterministic hash simulation for offline client credential protection
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user_asha_704',
    name: 'Sunita Rathod',
    workerId: 'ASHA-704',
    role: 'ASHA_WORKER',
    facilityOrVillage: 'Gundlapally Village',
    phone: '+91 98480 23145',
    email: 'sunita.asha@health.gov.in',
    avatarInitials: 'SR',
    biometricEnabled: true,
    registeredAt: '2026-01-15T08:00:00Z',
    passwordHash: hashString('asha123'),
    securityAnswerHash: hashString('gundlapally'),
    emergencyPin: '7041',
  },
  {
    id: 'user_courier_12',
    name: 'Ramesh Goud',
    workerId: 'COURIER-12',
    role: 'TRANSIT_RELAY',
    facilityOrVillage: 'RTC Bus Route #4 (Village Transit)',
    phone: '+91 94401 55210',
    email: 'ramesh.courier@transit.in',
    avatarInitials: 'RG',
    biometricEnabled: true,
    registeredAt: '2026-02-01T09:30:00Z',
    passwordHash: hashString('relay123'),
    securityAnswerHash: hashString('bicycle'),
    emergencyPin: '1212',
  },
  {
    id: 'user_doc_901',
    name: 'Dr. Vikram Sharma',
    workerId: 'DOC-901',
    role: 'PHC_DOCTOR',
    facilityOrVillage: 'Malkapur Primary Health Centre',
    phone: '+91 98220 89123',
    email: 'dr.sharma@phc.malkapur.gov.in',
    avatarInitials: 'VS',
    biometricEnabled: true,
    registeredAt: '2025-11-20T10:00:00Z',
    passwordHash: hashString('doctor123'),
    securityAnswerHash: hashString('malkapur'),
    emergencyPin: '9011',
  },
  {
    id: 'user_admin_01',
    name: 'Dr. Ananya Rao',
    workerId: 'ADMIN-01',
    role: 'DISTRICT_ADMIN',
    facilityOrVillage: 'Nalgonda District Health Office',
    phone: '+91 99881 77665',
    email: 'ananya.rao@dho.telangana.gov.in',
    avatarInitials: 'AR',
    biometricEnabled: true,
    registeredAt: '2025-08-10T11:00:00Z',
    passwordHash: hashString('admin123'),
    securityAnswerHash: hashString('nalgonda'),
    emergencyPin: '0101',
  }
];

class AuthService {
  private users: StoredUser[] = [];
  private currentSession: UserProfile | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        this.users = [...DEFAULT_USERS];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
      }

      const session = localStorage.getItem(STORAGE_SESSION_KEY);
      if (session) {
        this.currentSession = JSON.parse(session);
      } else {
        // Default login as Sunita Rathod for smooth field experience
        const defaultUser = this.users[0];
        this.currentSession = this.toUserProfile(defaultUser);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
      }
    } catch {
      this.users = [...DEFAULT_USERS];
      this.currentSession = this.toUserProfile(this.users[0]);
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to persist users to localStorage', e);
    }
  }

  private saveSession(user: UserProfile | null) {
    this.currentSession = user;
    try {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to persist session to localStorage', e);
    }
    this.notify();
  }

  private toUserProfile(user: StoredUser): UserProfile {
    const { passwordHash, securityAnswerHash, emergencyPin, ...profile } = user;
    return profile;
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

  public getCurrentUser(): UserProfile | null {
    return this.currentSession;
  }

  public getAllPresetUsers(): StoredUser[] {
    return this.users;
  }

  // --- Login ---
  public login(identifier: string, secret: string): { success: boolean; message: string; user?: UserProfile } {
    const cleanId = identifier.trim().toLowerCase();
    const user = this.users.find(u => 
      u.workerId.toLowerCase() === cleanId || 
      (u.email && u.email.toLowerCase() === cleanId) ||
      u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
    );

    if (!user) {
      return { success: false, message: 'No registered healthcare worker found with this ID or Email.' };
    }

    // Check standard password or 4-digit emergency PIN
    const isPasswordMatch = user.passwordHash === hashString(secret);
    const isPinMatch = user.emergencyPin === secret;

    if (!isPasswordMatch && !isPinMatch) {
      return { success: false, message: 'Invalid password or emergency field PIN. Please retry.' };
    }

    const profile = this.toUserProfile(user);
    this.saveSession(profile);
    return { success: true, message: `Welcome back, ${user.name}!`, user: profile };
  }

  // --- Biometric Quick Unlock (Simulates iQOO 3D Ultrasonic Fingerprint / Face ID) ---
  public biometricUnlock(userId: string): { success: boolean; message: string; user?: UserProfile } {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Biometric profile not found on this device.' };
    }
    const profile = this.toUserProfile(user);
    this.saveSession(profile);
    return { success: true, message: `Biometric verification verified. Logged in as ${user.name}.`, user: profile };
  }

  // --- Sign Up ---
  public register(data: {
    name: string;
    workerId: string;
    role: UserRole;
    facilityOrVillage: string;
    phone: string;
    email?: string;
    password: string;
    securityAnswer: string;
    emergencyPin: string;
  }): { success: boolean; message: string; user?: UserProfile } {
    const existing = this.users.find(u => 
      u.workerId.toLowerCase() === data.workerId.trim().toLowerCase() ||
      (data.email && u.email?.toLowerCase() === data.email.trim().toLowerCase())
    );

    if (existing) {
      return { success: false, message: 'A worker with this ID or Email is already registered.' };
    }

    if (data.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const initials = data.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      name: data.name.trim(),
      workerId: data.workerId.trim().toUpperCase(),
      role: data.role,
      facilityOrVillage: data.facilityOrVillage.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      avatarInitials: initials || 'HW',
      biometricEnabled: true,
      registeredAt: new Date().toISOString(),
      passwordHash: hashString(data.password),
      securityAnswerHash: hashString(data.securityAnswer.trim().toLowerCase()),
      emergencyPin: data.emergencyPin.trim() || '1234',
    };

    this.users.push(newUser);
    this.saveUsers();

    const profile = this.toUserProfile(newUser);
    this.saveSession(profile);
    return { success: true, message: 'Account registered successfully! Signed in.', user: profile };
  }

  // --- Password Reset ---
  public resetPassword(data: {
    identifier: string;
    securityAnswerOrPin: string;
    newPassword: string;
  }): { success: boolean; message: string } {
    const cleanId = data.identifier.trim().toLowerCase();
    const userIndex = this.users.findIndex(u => 
      u.workerId.toLowerCase() === cleanId || 
      (u.email && u.email.toLowerCase() === cleanId)
    );

    if (userIndex === -1) {
      return { success: false, message: 'Healthcare worker profile not found.' };
    }

    const user = this.users[userIndex];
    const cleanAnswer = data.securityAnswerOrPin.trim().toLowerCase();
    const isAnswerValid = user.securityAnswerHash === hashString(cleanAnswer) || user.emergencyPin === cleanAnswer;

    if (!isAnswerValid) {
      return { success: false, message: 'Security verification failed. Invalid Security Answer or Emergency PIN.' };
    }

    if (data.newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    this.users[userIndex].passwordHash = hashString(data.newPassword);
    this.saveUsers();

    // If active session was this user, update
    if (this.currentSession && this.currentSession.id === user.id) {
      this.saveSession(this.toUserProfile(this.users[userIndex]));
    }

    return { success: true, message: 'Password updated successfully! You can now log in.' };
  }

  // --- Quick Switch Account (For Field Testing) ---
  public switchAccount(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.saveSession(this.toUserProfile(user));
    }
  }

  public logout() {
    this.saveSession(null);
  }
}

export const authService = new AuthService();
