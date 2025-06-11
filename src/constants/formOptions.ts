import { Item } from '../types/form';

export const createNewRecipient = () => ({
  id: Math.random().toString(36).substr(2, 9),
  destination: '',
  phoneNumber: '',
  shippingAddress: '',
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
  recipients: [createNewRecipient()],
  notes: '',
}; 