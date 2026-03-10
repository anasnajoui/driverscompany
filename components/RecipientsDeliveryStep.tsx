import React from 'react';
import { FormData, Recipient } from '../src/types/form';
import { CardHeader, CardTitle, CardContent } from './ui/card';
import { RecipientCard } from './RecipientCard';
import { RecipientAddressBook } from './RecipientAddressBook';
import { Plus } from 'lucide-react';

interface RecipientsDeliveryStepProps {
  formData: FormData;
  onInputChange: (field: keyof Omit<FormData, 'recipients'>, value: string) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (id: string) => void;
  onUpdateRecipient: (id: string, field: keyof Recipient, value: string) => void;
  validationErrors: Record<string, string>;
}

export const RecipientsDeliveryStep: React.FC<RecipientsDeliveryStepProps> = ({
  formData,
  onAddRecipient,
  onRemoveRecipient,
  onUpdateRecipient,
  validationErrors,
}) => {
  const handleSelectFromAddressBook = (
    recipientId: string,
    saved: {
      destination: string;
      phoneNumber: string;
      shippingAddress: string;
      deliveryTime: string;
      specialInstructions: string;
    }
  ) => {
    onUpdateRecipient(recipientId, 'destination', saved.destination);
    onUpdateRecipient(recipientId, 'phoneNumber', saved.phoneNumber);
    onUpdateRecipient(recipientId, 'shippingAddress', saved.shippingAddress);
    onUpdateRecipient(recipientId, 'deliveryTime', saved.deliveryTime);
    onUpdateRecipient(recipientId, 'specialInstructions', saved.specialInstructions);
  };

  return (
    <>
      <CardHeader className="border-b border-gray-100 p-6 sm:p-10">
        <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
          Destinatario
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-10 space-y-6">
        {formData.recipients.map((recipient, index) => (
          <RecipientCard
            key={recipient.id}
            recipient={recipient}
            index={index}
            canRemove={formData.recipients.length > 1}
            onUpdate={(field, value) => onUpdateRecipient(recipient.id, field, value)}
            onRemove={() => onRemoveRecipient(recipient.id)}
            validationErrors={validationErrors}
            addressBookSelect={
              <RecipientAddressBook
                onSelectRecipient={(saved) =>
                  handleSelectFromAddressBook(recipient.id, saved)
                }
              />
            }
          />
        ))}

        {/* Add destination — dashed outline pattern */}
        <button
          onClick={onAddRecipient}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          Aggiungi destinazione
        </button>

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
          <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">Privacy Policy</a>
          {" \u2022 "}
          <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">Terms of Service</a>
        </div>
      </CardContent>
    </>
  );
};
