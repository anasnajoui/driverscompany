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
      <CardHeader className="border-b border-gray-100 p-10">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Dove dobbiamo portare il materiale?
        </CardTitle>
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          Indicateci semplicemente dove dobbiamo portare il materiale che ritireremo dalla vostra azienda
        </p>
      </CardHeader>
      <CardContent className="p-10 space-y-10">
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

        <div className="text-center py-8">
          <Button
            onClick={onAddRecipient}
            className="h-16 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <Plus className="h-6 w-6 mr-4" />
            Aggiungi un'altra consegna
          </Button>
          <p className="text-base text-gray-500 mt-4 font-medium">
            Dovete consegnare in più posti? Aggiungete tutte le destinazioni che volete
          </p>
        </div>

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
          <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">Privacy Policy</a>
          {" • "}
          <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">Terms of Service</a>
        </div>
      </CardContent>
    </>
  );
}; 