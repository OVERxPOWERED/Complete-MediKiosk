/**
 * MediKiosk Doctor Interface API Client
 * Connects Next.js Frontend with Django REST Backend (doctor-backend)
 */

import {
  PatientRecord,
  ConsultationOutcomeData,
  SyncAction,
  DoctorProfile,
  NoteTemplate,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
          else if (errData.message) errMessage = errData.message;
        } catch {
          // ignore non-json error responses
        }
        throw new Error(errMessage);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Patients & Queue ---
  async getQueue(params?: {
    q?: string;
    status?: string;
    sort_by?: string;
  }): Promise<PatientRecord[]> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.sort_by) query.set('sort_by', params.sort_by);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<PatientRecord[]>(`/doctor/queue/${queryString}`);
  }

  async scanPatient(token: string): Promise<{
    success: boolean;
    patient: PatientRecord;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      patient: PatientRecord;
      message: string;
    }>('/doctor/scan/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getPatientSummary(token: string): Promise<PatientRecord> {
    return this.request<PatientRecord>(`/doctor/patients/${token}/summary/`);
  }

  async updatePatientSummary(
    token: string,
    data: Partial<PatientRecord>
  ): Promise<{
    success: boolean;
    patient: PatientRecord;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      patient: PatientRecord;
      message: string;
    }>(`/doctor/patients/${token}/summary/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async confirmAndPushToHis(token: string): Promise<{
    success: boolean;
    patient: PatientRecord;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      patient: PatientRecord;
      message: string;
    }>(`/doctor/patients/${token}/confirm-his/`, {
      method: 'POST',
    });
  }

  // --- Annotations & Documents ---
  async addAnnotation(
    docId: string,
    annotation: {
      pageNumber: number;
      x: number;
      y: number;
      comment: string;
      author: string;
    }
  ): Promise<{ success: boolean; annotation: any }> {
    return this.request<{ success: boolean; annotation: any }>(
      `/doctor/documents/${docId}/annotations/`,
      {
        method: 'POST',
        body: JSON.stringify(annotation),
      }
    );
  }

  async flagDocumentRescan(
    docId: string,
    isFlagged: boolean,
    reason?: string
  ): Promise<{ success: boolean; isFlagged: boolean }> {
    return this.request<{ success: boolean; isFlagged: boolean }>(
      `/doctor/documents/${docId}/flag-rescan/`,
      {
        method: 'POST',
        body: JSON.stringify({ isFlagged, reason }),
      }
    );
  }

  // --- Consultations & Outcomes ---
  async recordOutcome(
    token: string,
    outcome: ConsultationOutcomeData
  ): Promise<{
    success: boolean;
    patient: PatientRecord;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      patient: PatientRecord;
      message: string;
    }>(`/consultations/${token}/outcome/`, {
      method: 'POST',
      body: JSON.stringify(outcome),
    });
  }

  async undoOutcome(token: string): Promise<{
    success: boolean;
    patient: PatientRecord;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      patient: PatientRecord;
      message: string;
    }>(`/consultations/${token}/undo/`, {
      method: 'POST',
    });
  }

  async getAuditTrail(token: string): Promise<{
    token: string;
    uhid: string;
    name: string;
    audit_logs: any[];
  }> {
    return this.request<{
      token: string;
      uhid: string;
      name: string;
      audit_logs: any[];
    }>(`/patients/${token}/audit-trail/`);
  }

  // --- Settings & Templates ---
  async getSettings(): Promise<{
    settings: any;
    templates: NoteTemplate[];
  }> {
    return this.request<{
      settings: any;
      templates: NoteTemplate[];
    }>('/settings/');
  }

  async updateSettings(settingsData: any): Promise<{
    success: boolean;
    settings: any;
  }> {
    return this.request<{
      success: boolean;
      settings: any;
    }>('/settings/', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async getTemplates(): Promise<NoteTemplate[]> {
    return this.request<NoteTemplate[]>('/settings/templates/');
  }

  async createTemplate(template: Omit<NoteTemplate, 'id'>): Promise<NoteTemplate> {
    return this.request<NoteTemplate>('/settings/templates/', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: string, template: Partial<NoteTemplate>): Promise<NoteTemplate> {
    return this.request<NoteTemplate>(`/settings/templates/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/settings/templates/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- Sync Service ---
  async getSyncStatus(): Promise<{
    is_online: boolean;
    pending_count: number;
    last_synced: string;
    sync_actions: SyncAction[];
  }> {
    return this.request<{
      is_online: boolean;
      pending_count: number;
      last_synced: string;
      sync_actions: SyncAction[];
    }>('/sync/status/');
  }

  async syncNow(): Promise<{
    success: boolean;
    synced_count: number;
    pending_count: number;
    last_synced: string;
    sync_actions: SyncAction[];
    message: string;
  }> {
    return this.request<{
      success: boolean;
      synced_count: number;
      pending_count: number;
      last_synced: string;
      sync_actions: SyncAction[];
      message: string;
    }>('/sync/now/', {
      method: 'POST',
    });
  }

  // --- Auth & HPR ---
  async hprLogin(hprId: string): Promise<{
    success: boolean;
    message: string;
    hpr_id: string;
    expires_in: number;
    resend_in: number;
    demo_otp: string;
  }> {
    return this.request<{
      success: boolean;
      message: string;
      hpr_id: string;
      expires_in: number;
      resend_in: number;
      demo_otp: string;
    }>('/auth/hpr-login/', {
      method: 'POST',
      body: JSON.stringify({ hpr_id: hprId }),
    });
  }

  async verifyOtp(
    hprId: string,
    otp: string
  ): Promise<{
    success: boolean;
    token: string;
    doctor: DoctorProfile;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      token: string;
      doctor: DoctorProfile;
      message: string;
    }>('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ hpr_id: hprId, otp }),
    });
  }

  async switchWorkspace(workspace: {
    department: string;
    desk: string;
    hospital: string;
  }): Promise<{ current: any }> {
    return this.request<{ current: any }>('/auth/switch-workspace/', {
      method: 'POST',
      body: JSON.stringify(workspace),
    });
  }
}

export const api = new ApiService();
