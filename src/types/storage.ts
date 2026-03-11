import { FormData } from '../types/form';

export interface SavedSubmission {
  id: string;
  timestamp: string;
  formData: FormData;
  recipientCount: number;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;  // "HH:MM" format
  closeTime: string; // "HH:MM" format
}

export interface StructuredHours {
  lunedi: DaySchedule;
  martedi: DaySchedule;
  mercoledi: DaySchedule;
  giovedi: DaySchedule;
  venerdi: DaySchedule;
  sabato: DaySchedule;
  domenica: DaySchedule;
}

export interface SenderProfile {
  companyName: string;
  email: string;
  companyPhone: string;
  studioHours: string;           // serialized string for webhook compat
  structuredHours: StructuredHours;
  pickupLocation: string;
  billingClient?: string;
  lastUpdated: string;           // ISO timestamp
}

export interface SavedRecipient {
  id: string;                    // unique ID
  destination: string;
  phoneNumber: string;
  shippingAddress: string;
  deliveryTime: string;
  specialInstructions: string;
  lastUsed: string;              // ISO timestamp
}



export interface BillingConfig {
  costPerDelivery: number;       // EUR
  costPerPickup: number;         // EUR
  lastUpdated: string;           // ISO timestamp
}

export interface StorageSchema {
  version: number;
  senderProfile: SenderProfile | null;
  addressBook: SavedRecipient[];

  submissions: SavedSubmission[];
  billingConfig: BillingConfig;
}
