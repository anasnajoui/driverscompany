export const normalizeCommittenteName = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toUpperCase();

export const normalizeCommittenteKey = (value: string): string =>
  normalizeCommittenteName(value).replace(/[^A-Z0-9]/g, '');

export const normalizeCommittentiList = (names: string[]): string[] => {
  const seen = new Set<string>();

  return names.reduce<string[]>((acc, name) => {
    const normalizedName = normalizeCommittenteName(name);
    if (!normalizedName) {
      return acc;
    }

    const normalizedKey = normalizeCommittenteKey(normalizedName);
    if (seen.has(normalizedKey)) {
      return acc;
    }

    seen.add(normalizedKey);
    acc.push(normalizedName);
    return acc;
  }, []);
};

export const createNewRecipient = () => ({
  id: Math.random().toString(36).slice(2, 11),
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
  'BRAVIN',
  'CREATTIVA',
  'DELPIN',
  'DENTALICA',
  'DENTALLINE',
  'DENTALTRE',
  'LOVATO',
  'MANGIONE',
  'ORODENTAL',
  'ORTOLAB',
  'PASCOLO',
  'SACCHER',
  'SYNTESIS',
  'UNIDENT',
];
