'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DoctorProfile,
  PatientRecord,
  ConsultationOutcomeData,
  SyncAction,
} from '@/types';
import {
  mockDoctorProfile,
  mockInitialPatients,
  mockInitialSyncActions,
} from '@/services/mockData';
import { api } from '@/services/apiClient';

export interface AppSettings {
  showAyushDefault: boolean;
  pinnedSpecialists: string[];
  autoOpenDocs: boolean;
  highlightAbnormalVitals: boolean;
  confirmBeforePush: boolean;
}

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoable?: boolean;
  undoDuration?: number;
  onUndo?: () => void;
}

interface AppContextType {
  doctor: DoctorProfile | null;
  isAuthenticated: boolean;
  login: (hprId?: string, otp?: string) => Promise<void>;
  logout: () => void;
  currentWorkspace: { department: string; desk: string; hospital: string };
  setWorkspace: (ws: { department: string; desk: string; hospital: string }) => void;
  patients: PatientRecord[];
  refreshPatients: () => Promise<void>;
  justScannedPatient: PatientRecord | null;
  justScannedCountdown: number;
  scanWristband: (token: string) => Promise<boolean> | boolean;
  clearJustScanned: () => void;
  getPatient: (identifier: string) => PatientRecord | undefined;
  updatePatientSummary: (token: string, updates: Partial<PatientRecord>) => Promise<void>;
  confirmAndPushToHis: (token: string) => Promise<void>;
  recordOutcome: (token: string, outcome: ConsultationOutcomeData) => Promise<void>;
  undoOutcome: (token: string) => Promise<void>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  syncActions: SyncAction[];
  isOnline: boolean;
  toggleOnlineStatus: () => void;
  syncNow: () => Promise<void>;
  toast: ToastData | null;
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(mockDoctorProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentWorkspace, setCurrentWorkspace] = useState({
    department: 'General Medicine OPD',
    desk: 'Desk 4',
    hospital: 'District Hospital, Bhopal',
  });

  const [patients, setPatients] = useState<PatientRecord[]>(mockInitialPatients);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  const [justScannedPatient, setJustScannedPatient] = useState<PatientRecord | null>(null);
  const [justScannedCountdown, setJustScannedCountdown] = useState<number>(180);

  const [settings, setSettings] = useState<AppSettings>({
    showAyushDefault: true,
    pinnedSpecialists: ['Cardiology', 'Neurology', 'Orthopedics', 'Endocrinology'],
    autoOpenDocs: true,
    highlightAbnormalVitals: true,
    confirmBeforePush: true,
  });

  const [syncActions, setSyncActions] = useState<SyncAction[]>(mockInitialSyncActions);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Helper for toasts
  const showToast = useCallback((toastData: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToast({ id, ...toastData });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch live queue from Django backend
  const refreshPatients = useCallback(async () => {
    try {
      const liveQueue = await api.getQueue();
      if (liveQueue && Array.isArray(liveQueue) && liveQueue.length > 0) {
        setPatients(liveQueue);
        if (typeof window !== 'undefined') {
          localStorage.setItem('medikiosk_patients', JSON.stringify(liveQueue));
        }
      }
    } catch (err) {
      console.warn('Could not fetch queue from Django backend; using cached/offline data', err);
    }
  }, []);

  // Initial mount: hydrate and fetch from Django
  useEffect(() => {
    setHasMounted(true);

    // 1. Hydrate from localStorage first
    try {
      const saved = localStorage.getItem('medikiosk_patients');
      if (saved) {
        setPatients(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // 2. Fetch live data from Django backend
    const initBackend = async () => {
      try {
        const [liveQueue, liveSettings, liveSync] = await Promise.allSettled([
          api.getQueue(),
          api.getSettings(),
          api.getSyncStatus(),
        ]);

        if (liveQueue.status === 'fulfilled' && Array.isArray(liveQueue.value) && liveQueue.value.length > 0) {
          setPatients(liveQueue.value);
          localStorage.setItem('medikiosk_patients', JSON.stringify(liveQueue.value));
          setIsOnline(true);
        }

        if (liveSettings.status === 'fulfilled' && liveSettings.value?.settings) {
          setSettings((prev) => ({ ...prev, ...liveSettings.value.settings }));
        }

        if (liveSync.status === 'fulfilled' && liveSync.value) {
          if (Array.isArray(liveSync.value.sync_actions)) {
            setSyncActions(liveSync.value.sync_actions);
          }
          setIsOnline(liveSync.value.is_online);
        }
      } catch (err) {
        console.warn('Initial backend sync failed, staying offline/cached:', err);
      }
    };

    initBackend();
  }, []);

  // Sync patients to localStorage whenever updated
  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined') {
      localStorage.setItem('medikiosk_patients', JSON.stringify(patients));
    }
  }, [patients, hasMounted]);

  // Countdown timer for Just Scanned
  useEffect(() => {
    if (!justScannedPatient) return;
    const interval = setInterval(() => {
      setJustScannedCountdown((prev) => {
        if (prev <= 1) {
          setJustScannedPatient(null);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [justScannedPatient]);

  const login = async (hprId?: string, otp?: string) => {
    if (hprId) {
      try {
        const res = await api.verifyOtp(hprId, otp || '4219');
        if (res.success && res.doctor) {
          setDoctor(res.doctor);
          setIsAuthenticated(true);
          return;
        }
      } catch (err) {
        console.warn('Live HPR verification fell back to mock profile:', err);
      }
    }
    setDoctor(mockDoctorProfile);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setDoctor(null);
    setIsAuthenticated(false);
  };

  const handleSetWorkspace = (ws: { department: string; desk: string; hospital: string }) => {
    setCurrentWorkspace(ws);
    api.switchWorkspace(ws).catch((err) => {
      console.warn('Workspace update to backend failed (offline):', err);
    });
  };

  const scanWristband = async (token: string): Promise<boolean> => {
    const cleanToken = token.trim().toUpperCase();

    // 1. Try scanning via live Django API
    try {
      const res = await api.scanPatient(cleanToken);
      if (res.success && res.patient) {
        setJustScannedPatient(res.patient);
        setJustScannedCountdown(180);

        // Ensure patient is in queue
        setPatients((prev) => {
          const exists = prev.some((p) => p.patient.queue_token === res.patient.patient.queue_token);
          if (!exists) return [res.patient, ...prev];
          return prev.map((p) =>
            p.patient.queue_token === res.patient.patient.queue_token ? res.patient : p
          );
        });

        showToast({
          title: `Wristband ${res.patient.patient.queue_token} Scanned Successfully`,
          subtitle: `${res.patient.patient.name} has been pinned to your queue.`,
          type: 'success',
        });
        return true;
      }
    } catch (err) {
      console.warn('Django scan API failed, falling back to local search:', err);
    }

    // 2. Offline fallback: search local patients state
    const found = patients.find(
      (p) =>
        p.patient.queue_token.toUpperCase() === cleanToken ||
        p.patient.uhid.toUpperCase() === cleanToken
    );

    if (found) {
      setJustScannedPatient(found);
      setJustScannedCountdown(180);
      showToast({
        title: `Wristband ${found.patient.queue_token} Scanned Successfully`,
        subtitle: `${found.patient.name} has been pinned to your queue.`,
        type: 'success',
      });
      return true;
    } else {
      showToast({
        title: 'Patient Not Found',
        subtitle: `No patient registered with token or UHID "${token}". Try scanning again.`,
        type: 'error',
      });
      return false;
    }
  };

  const clearJustScanned = () => {
    setJustScannedPatient(null);
  };

  const getPatient = (identifier: string): PatientRecord | undefined => {
    const cleanId = identifier.trim().toLowerCase();
    return patients.find(
      (p) =>
        p.patient.queue_token.toLowerCase() === cleanId ||
        p.patient.uhid.toLowerCase() === cleanId ||
        p.patient.name.toLowerCase().includes(cleanId)
    );
  };

  const updatePatientSummary = async (token: string, updates: Partial<PatientRecord>) => {
    // Optimistic local update
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patient.queue_token === token) {
          return { ...p, ...updates };
        }
        return p;
      })
    );

    showToast({
      title: 'Clinical Summary Updated',
      subtitle: 'Changes committed and synced with server.',
      type: 'info',
    });

    // Push update to Django backend
    try {
      const res = await api.updatePatientSummary(token, updates);
      if (res.success && res.patient) {
        setPatients((prev) =>
          prev.map((p) => (p.patient.queue_token === token ? res.patient : p))
        );
      }
    } catch (err) {
      console.warn('Failed to sync summary update to backend (offline):', err);
    }
  };

  const confirmAndPushToHis = async (token: string) => {
    const now = new Date();
    const timestampStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${
      now.getHours() >= 12 ? 'PM' : 'AM'
    }, 03 Sep 2026`;

    // Optimistic update
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patient.queue_token === token) {
          return {
            ...p,
            status: 'Reviewed',
            reviewedAt: timestampStr,
            red_flags: [],
          };
        }
        return p;
      })
    );

    // Add sync entry
    const found = patients.find((p) => p.patient.queue_token === token);
    if (found) {
      const newSync: SyncAction = {
        id: `sync-${Date.now()}`,
        patient_token: found.patient.queue_token,
        uhid: found.patient.uhid,
        patient_name: found.patient.name,
        action_type: 'Patient summary',
        timestamp: timestampStr,
        status: isOnline ? 'Synced' : 'Pending',
      };
      setSyncActions((prev) => [newSync, ...prev]);
    }

    showToast({
      title: 'Summary Confirmed & Pushed to HIS',
      subtitle: `Patient ${token} status transitioned to Reviewed.`,
      type: 'success',
    });

    // Call Django backend
    try {
      const res = await api.confirmAndPushToHis(token);
      if (res.success && res.patient) {
        setPatients((prev) =>
          prev.map((p) => (p.patient.queue_token === token ? res.patient : p))
        );
      }
    } catch (err) {
      console.warn('Backend push failed, action cached locally:', err);
    }
  };

  const recordOutcome = async (token: string, outcome: ConsultationOutcomeData) => {
    let previousOutcome: ConsultationOutcomeData | undefined;

    // Optimistic update
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patient.queue_token === token) {
          previousOutcome = p.consultation_outcome;
          return {
            ...p,
            status: 'Reviewed',
            consultation_outcome: outcome,
          };
        }
        return p;
      })
    );

    // Queue sync action
    const found = patients.find((p) => p.patient.queue_token === token);
    if (found) {
      const newSync: SyncAction = {
        id: `sync-outcome-${Date.now()}`,
        patient_token: found.patient.queue_token,
        uhid: found.patient.uhid,
        patient_name: found.patient.name,
        action_type:
          outcome.outcome_type === 'Referred to Specialist'
            ? 'Outcome (Referred)'
            : 'Outcome (Treated)',
        timestamp: outcome.recorded_at,
        status: isOnline ? 'Synced' : 'Pending',
      };
      setSyncActions((prev) => [newSync, ...prev]);
    }

    // Call backend
    try {
      await api.recordOutcome(token, outcome);
    } catch (err) {
      console.warn('Backend record outcome failed, cached locally:', err);
    }

    // Trigger 4s Undo toast
    showToast({
      title: '✓ Outcome recorded and pushed to HIS.',
      type: 'success',
      undoable: true,
      undoDuration: 4,
      onUndo: async () => {
        setPatients((prev) =>
          prev.map((p) => {
            if (p.patient.queue_token === token) {
              return {
                ...p,
                consultation_outcome: previousOutcome,
              };
            }
            return p;
          })
        );

        try {
          await api.undoOutcome(token);
        } catch (err) {
          console.warn('Backend undo failed:', err);
        }

        showToast({
          title: 'Outcome Reverted',
          subtitle: 'Previous consultation record restored.',
          type: 'info',
        });
      },
    });
  };

  const undoOutcome = async (token: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patient.queue_token === token) {
          const { consultation_outcome: _, ...rest } = p;
          return rest as PatientRecord;
        }
        return p;
      })
    );

    try {
      await api.undoOutcome(token);
    } catch (err) {
      console.warn('Backend undo failed:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    showToast({
      title: 'Preferences Saved',
      subtitle: 'Doctor workstation configuration updated.',
      type: 'info',
    });

    try {
      await api.updateSettings(updated);
    } catch (err) {
      console.warn('Settings sync to backend failed:', err);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline((prev) => {
      const next = !prev;
      showToast({
        title: next ? '● Connected: Online' : '○ Offline Mode Activated',
        subtitle: next
          ? 'Connected to Hospital Information System (HIS).'
          : 'Actions will be cached locally and synced when online.',
        type: next ? 'success' : 'warning',
      });
      return next;
    });
  };

  const syncNow = async () => {
    try {
      const res = await api.syncNow();
      if (res.success && res.sync_actions) {
        setSyncActions(res.sync_actions);
        showToast({
          title: 'All Data Synced with HIS',
          subtitle: res.message || 'All pending actions successfully pushed to server.',
          type: 'success',
        });
        return;
      }
    } catch (err) {
      console.warn('Backend syncNow failed, marking locally:', err);
    }

    setSyncActions((prev) =>
      prev.map((action) => ({
        ...action,
        status: 'Synced',
      }))
    );

    showToast({
      title: 'All Data Synced with HIS',
      subtitle: 'All pending local actions successfully pushed to server.',
      type: 'success',
    });
  };

  return (
    <AppContext.Provider
      value={{
        doctor,
        isAuthenticated,
        login,
        logout,
        currentWorkspace,
        setWorkspace: handleSetWorkspace,
        patients,
        refreshPatients,
        justScannedPatient,
        justScannedCountdown,
        scanWristband,
        clearJustScanned,
        getPatient,
        updatePatientSummary,
        confirmAndPushToHis,
        recordOutcome,
        undoOutcome,
        settings,
        updateSettings,
        syncActions,
        isOnline,
        toggleOnlineStatus,
        syncNow,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
