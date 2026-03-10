import {
  BillingConfig,
  SavedRecipient,

  SenderProfile,
  StorageSchema,
  StructuredHours,
} from '../types/storage';

const STORAGE_KEY = 'drivers_company_data';
const STORAGE_VERSION = 1;


const getDefaultStructuredHours = (): StructuredHours => ({
  lunedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  martedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  mercoledi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  giovedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  venerdi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sabato: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
  domenica: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
});

export const getDefaultStorage = (): StorageSchema => ({
  version: STORAGE_VERSION,
  senderProfile: null,
  addressBook: [],

  billingConfig: {
    costPerDelivery: 0,
    costPerPickup: 0,
    lastUpdated: '',
  },
});

export const getStorage = (): StorageSchema => {
  if (typeof window === 'undefined') {
    return getDefaultStorage();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultStorage();
    }

    const parsed = JSON.parse(stored) as StorageSchema;

    if (parsed.version !== STORAGE_VERSION) {
      return getDefaultStorage();
    }

    return parsed;
  } catch {
    return getDefaultStorage();
  }
};

export const saveStorage = (data: StorageSchema): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail on quota exceeded or other storage errors
  }
};

export const getSenderProfile = (): SenderProfile | null => {
  const storage = getStorage();
  const profile = storage.senderProfile;
  if (!profile) return null;
  return {
    ...profile,
    billingClient: profile.billingClient || '',
  };
};

export const saveSenderProfile = (profile: SenderProfile): void => {
  const storage = getStorage();
  storage.senderProfile = {
    ...profile,
    lastUpdated: new Date().toISOString(),
  };
  saveStorage(storage);
};

export const getAddressBook = (): SavedRecipient[] => {
  const storage = getStorage();
  return storage.addressBook;
};

export const saveRecipient = (recipient: SavedRecipient): void => {
  const storage = getStorage();
  const existingIndex = storage.addressBook.findIndex((r) => r.id === recipient.id);

  const updatedRecipient: SavedRecipient = {
    ...recipient,
    lastUsed: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    storage.addressBook[existingIndex] = updatedRecipient;
  } else {
    storage.addressBook.push(updatedRecipient);
  }

  saveStorage(storage);
};

export const removeRecipient = (id: string): void => {
  const storage = getStorage();
  storage.addressBook = storage.addressBook.filter((r) => r.id !== id);
  saveStorage(storage);
};



export const getBillingConfig = (): BillingConfig => {
  const storage = getStorage();
  return storage.billingConfig;
};

export const saveBillingConfig = (config: BillingConfig): void => {
  const storage = getStorage();
  storage.billingConfig = {
    ...config,
    lastUpdated: new Date().toISOString(),
  };
  saveStorage(storage);
};

export const clearAll = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
};
