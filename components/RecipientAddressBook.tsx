import React, { useState, useEffect } from 'react';
import { getAddressBook } from '../src/services/localStorage';
import { SavedRecipient } from '../src/types/storage';

interface RecipientAddressBookProps {
  onSelectRecipient: (recipient: {
    destination: string;
    phoneNumber: string;
    shippingAddress: string;
    deliveryTime: string;
    specialInstructions: string;
  }) => void;
}

export const RecipientAddressBook: React.FC<RecipientAddressBookProps> = ({
  onSelectRecipient,
}) => {
  const [recipients, setRecipients] = useState<SavedRecipient[]>([]);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    setRecipients(getAddressBook());
  }, []);

  if (recipients.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;

    const saved = recipients.find((r) => r.id === id);
    if (saved) {
      onSelectRecipient({
        destination: saved.destination,
        phoneNumber: saved.phoneNumber,
        shippingAddress: saved.shippingAddress,
        deliveryTime: saved.deliveryTime,
        specialInstructions: saved.specialInstructions,
      });
    }
    setSelectedValue('');
  };

  return (
    <select
      value={selectedValue}
      onChange={handleChange}
      className="w-full h-11 px-4 text-sm border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 text-blue-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    >
      <option value="">{String.fromCodePoint(0x1F4CB)} Seleziona dai contatti salvati ({recipients.length})</option>
      {recipients.map((r) => (
        <option key={r.id} value={r.id}>
          {r.destination} — {r.shippingAddress.split('\n')[0]}
        </option>
      ))}
    </select>
  );
};
