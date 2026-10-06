```typescript
import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  TELEMEDICINE = 'TELEMEDICINE',
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  SPECIALIST_REFERRAL = 'SPECIALIST_REFERRAL',
  PRE_OPERATIVE = 'PRE_OPERATIVE',
  POST_OPERATIVE = 'POST_OPERATIVE',
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
  ON_HOLD = 'ON_HOLD',
  EXPIRED = 'EXPIRED',
}

export enum PrescriptionPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export enum MedicalRecordType {
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  LAB_RESULT = 'LAB_RESULT',
  IMAGING = 'IMAGING',
  VACCINATION = 'VACCINATION',
  REFERRAL = 'REFERRAL',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  OPERATIVE_NOTE = 'OPERATIVE_NOTE',
  PROGRESS_NOTE = 'PROGRESS_NOTE',
  ADMISSION_NOTE = 'ADMISSION_NOTE',
}

export enum VitalSignType {
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  HEART_RATE = 'HEART_RATE',
  RESPIRATORY_RATE = 'RESPIRATORY_RATE',
  TEMPERATURE = 'TEMPERATURE',
  OXYGEN_SATURATION = 'OXYGEN_SATURATION',
  WEIGHT = 'WEIGHT',
  HEIGHT = 'HEIGHT',
  BMI = 'BMI',
  PAIN_SCALE = 'PAIN_SCALE',
  GLUCOSE = 'GLUCOSE',
}

export enum LabResultStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum ImagingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REPORTED = 'REPORTED',
  CANCELLED = 'CANCELLED',
}

export enum ProcedureStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  COMPLICATION = 'COMPLICATION',
}

export enum VaccinationStatus {
  ADMINISTERED = 'ADMINISTERED',
  SCHEDULED = 'SCHEDULED',
  DECLINED = 'DECLINED',
  CONTRAINDICATED = 'CONTRAINDICATED',
  OVERDUE = 'OVERDUE',
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  PRESCRIPTION_READY = 'PRESCRIPTION_READY',
  LAB_RESULTS_AVAILABLE = 'LAB_RESULTS_AVAILABLE',
  IMAGING_RESULTS_AVAILABLE = 'IMAGING_RESULTS_AVAILABLE',
  REFERRAL_UPDATE = 'REFERRAL_UPDATE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  MESSAGE = 'MESSAGE',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  SHARE = 'SHARE',
}

// ============================================================================
// BASE TYPES (Shared with kiosk_interface)
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

// ============================================================================
// USER & DOCTOR TYPES
// ============================================================================

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
}

export interface Doctor extends User {
  role: UserRole.DOCTOR;
  licenseNumber: string;
  specialization: string[];
  subSpecialization?: string[];
  yearsOfExperience: number;
  qualifications: Qualification[];
  availability: DoctorAvailability[];
  departmentId: string;
  clinicIds: string[];
  consultationFee: number;
  followUpFee: number;
  telemedicineEnabled: boolean;
  languages: string[];
  bio?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  specialization?: string;
  isVerified: boolean;
}

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  appointmentType: App