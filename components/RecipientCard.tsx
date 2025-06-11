import React from 'react';
import { Recipient } from '../src/types/form';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';

interface RecipientCardProps {
  recipient: Recipient;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof Recipient, value: string) => void;
  onRemove: () => void;
  validationErrors: Record<string, string>;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  recipient,
  index,
  canRemove,
  onUpdate,
  onRemove,
  validationErrors,
}) => {
  return (
    <Card className="bg-gray-50 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-lg font-medium text-gray-900">
            🎯 Destinazione {index + 1}
          </h4>
          {canRemove && (
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-gray-800 mb-4 text-sm">📍 Informazioni di Consegna</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`destination-${recipient.id}`} className="text-sm font-medium text-gray-700">
                  Nome del Destinatario *
                </Label>
                <Input
                  id={`destination-${recipient.id}`}
                  value={recipient.destination}
                  onChange={(e) => onUpdate('destination', e.target.value)}
                  placeholder="es. Laboratorio Milano, Dr. Bianchi"
                  className={`border-gray-200 focus:border-blue-400 h-12 ${
                    validationErrors[`recipient-${index}-destination`] ? 'border-red-300 focus:border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors[`recipient-${index}-destination`] && (
                  <p className="text-sm text-red-600">{validationErrors[`recipient-${index}-destination`]}</p>
                )}
                {!validationErrors[`recipient-${index}-destination`] && (
                  <p className="text-xs text-gray-500">Nome del laboratorio o medico</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`phone-${recipient.id}`} className="text-sm font-medium text-gray-700">
                  Numero di Telefono *
                </Label>
                <div className={`h-12 ${validationErrors[`recipient-${index}-phone`] ? 'border border-red-300 rounded-md' : ''}`}>
                  <PhoneInput
                    id={`phone-${recipient.id}`}
                    international
                    defaultCountry="IT"
                    value={recipient.phoneNumber}
                    onChange={(value) => onUpdate('phoneNumber', value || '')}
                    placeholder="es. 02 1234567"
                    required
                    limitMaxLength={true}
                    countryCallingCodeEditable={false}
                    maxLength={17}
                  />
                </div>
                {validationErrors[`recipient-${index}-phone`] && (
                  <p className="text-sm text-red-600">{validationErrors[`recipient-${index}-phone`]}</p>
                )}
                {!validationErrors[`recipient-${index}-phone`] && (
                  <p className="text-xs text-gray-500">Per organizzare la consegna</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor={`address-${recipient.id}`} className="text-sm font-medium text-gray-700">
                Indirizzo di Consegna *
              </Label>
              <Textarea
                id={`address-${recipient.id}`}
                value={recipient.shippingAddress}
                onChange={(e) => onUpdate('shippingAddress', e.target.value)}
                placeholder="Via Verdi 456, 20121 Milano MI&#10;Primo piano, interno 3"
                rows={3}
                className={`border-gray-200 focus:border-blue-400 mt-2 ${
                  validationErrors[`recipient-${index}-address`] ? 'border-red-300 focus:border-red-400' : ''
                }`}
                required
              />
              {validationErrors[`recipient-${index}-address`] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors[`recipient-${index}-address`]}</p>
              )}
              {!validationErrors[`recipient-${index}-address`] && (
                <p className="text-xs text-gray-500 mt-2">Include dettagli come piano, interno, citofono</p>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white p-4 rounded border">
            <h5 className="font-medium text-gray-800 mb-4 text-sm">📝 Note Speciali (opzionale)</h5>
            <Textarea
              id={`instructions-${recipient.id}`}
              value={recipient.specialInstructions}
              onChange={(e) => onUpdate('specialInstructions', e.target.value)}
              placeholder="es. Consegnare solo al mattino, suonare al citofono Dr. Rossi"
              rows={3}
              className="border-gray-200 focus:border-blue-400"
            />
            <p className="text-xs text-gray-500 mt-2">
              Istruzioni speciali per questa consegna
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 