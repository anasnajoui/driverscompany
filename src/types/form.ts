export interface Item {
  id: string;
  description: string;
}

export interface Recipient {
  id: string;
  destination: string;
  phoneNumber: string;
  shippingAddress: string;
  specialInstructions: string;
}

export interface FormData {
  // Studio Information
  companyName: string;
  email: string;
  companyPhone: string;
  studioHours: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  
  // Recipients
  recipients: Recipient[];
  
  // Notes
  notes: string;
}

export interface ItemType {
  value: string;
  label: string;
} 