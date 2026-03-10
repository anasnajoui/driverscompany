import { Item } from '../types/form';

export const createNewRecipient = () => ({
  id: Math.random().toString(36).substr(2, 9),
  destination: '',
  phoneNumber: '',
  shippingAddress: '',
  deliveryTime: 'standard',
  specialInstructions: '',
});

export const initialFormData = {
  companyName: '',
  email: '',
  companyPhone: '',
  studioHours: '',
  pickupDate: '',
  pickupTime: 'standard',
  pickupLocation: '',
  billingClient: '',
  recipients: [createNewRecipient()],
  notes: '',
}; 

export const COMMITTENTI = [
  'Bravin',
  'Creattiva',
  'Delpin',
  'Dentalica',
  'Dentalline',
  'Dentaltre',
  'Lovato',
  'Mangione',
  'Orodental',
  'Ortolab',
  'Pascolo',
  'Saccher',
  'Syntesis',
  'Unident',
];