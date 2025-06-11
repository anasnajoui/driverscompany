import React from 'react';
import { FormData, Recipient } from '../src/types/form';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RecipientCard } from './RecipientCard';
import { Plus } from 'lucide-react';

interface RecipientsDeliveryStepProps {
  formData: FormData;
  onInputChange: (field: keyof Omit<FormData, 'recipients'>, value: any) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (id: string) => void;
  onUpdateRecipient: (id: string, field: keyof Recipient, value: string) => void;
  validationErrors: Record<string, string>;
}

export const RecipientsDeliveryStep: React.FC<RecipientsDeliveryStepProps> = ({
  formData,
  onInputChange,
  onAddRecipient,
  onRemoveRecipient,
  onUpdateRecipient,
  validationErrors,
}) => {
  return (
    <>
      <CardHeader className="border-b border-blue-50 p-8">
        <CardTitle className="text-2xl font-semibold text-gray-900 mb-3">
          📦 Dove dobbiamo portare il materiale?
        </CardTitle>
        <p className="text-base text-gray-600 leading-relaxed">
          Indicateci semplicemente dove dobbiamo portare il materiale che ritireremo dalla vostra azienda
        </p>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {formData.recipients.map((recipient, index) => (
          <RecipientCard
            key={recipient.id}
            recipient={recipient}
            index={index}
            canRemove={formData.recipients.length > 1}
            onUpdate={(field, value) => onUpdateRecipient(recipient.id, field, value)}
            onRemove={() => onRemoveRecipient(recipient.id)}
            validationErrors={validationErrors}
          />
        ))}

        <div className="text-center py-6">
          <Button
            onClick={onAddRecipient}
            className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
          >
            <Plus className="h-5 w-5 mr-3" />
            Aggiungi un'altra consegna
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Dovete consegnare in più posti? Aggiungete tutte le destinazioni che volete
          </p>
        </div>

        <div className="text-center text-xs text-gray-500">
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          {" | "}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        </div>
      </CardContent>
    </>
  );
}; 