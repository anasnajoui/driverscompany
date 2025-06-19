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
    <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8">
          <h4 className="text-2xl font-bold text-gray-900">
            Destinazione {index + 1}
          </h4>
          {canRemove && (
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200"
            >
              <X className="h-5 w-5 text-red-500 hover:text-red-600" />
            </Button>
          )}
        </div>

        <div className="space-y-8">
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
            <h5 className="font-bold text-gray-800 mb-6 text-lg pb-2 border-b border-gray-100">Informazioni di Consegna</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor={`destination-${recipient.id}`} className="text-lg font-semibold text-gray-800">
                  Nome del Destinatario *
                </Label>
                <Input
                  id={`destination-${recipient.id}`}
                  value={recipient.destination}
                  onChange={(e) => onUpdate('destination', e.target.value)}
                  placeholder="Es. Laboratorio Milano, Dr. Bianchi"
                  className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-14 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                    validationErrors[`recipient-${index}-destination`] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                  required
                />
                {validationErrors[`recipient-${index}-destination`] && (
                  <p className="text-base text-red-600 font-medium">{validationErrors[`recipient-${index}-destination`]}</p>
                )}
                {!validationErrors[`recipient-${index}-destination`] && (
                  <p className="text-sm text-gray-500">Nome del laboratorio o medico</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor={`phone-${recipient.id}`} className="text-lg font-semibold text-gray-800">
                  Numero di Telefono *
                </Label>
                <div className={`h-14 border-2 rounded-xl transition-all duration-200 ${validationErrors[`recipient-${index}-phone`] ? 'border-red-300' : 'border-gray-200'}`}>
                  <PhoneInput
                    id={`phone-${recipient.id}`}
                    international
                    defaultCountry="IT"
                    value={recipient.phoneNumber}
                    onChange={(value) => onUpdate('phoneNumber', value || '')}
                    placeholder="Es. 02 1234567"
                    required
                    limitMaxLength={true}
                    countryCallingCodeEditable={false}
                    maxLength={17}
                  />
                </div>
                {validationErrors[`recipient-${index}-phone`] && (
                  <p className="text-base text-red-600 font-medium">{validationErrors[`recipient-${index}-phone`]}</p>
                )}
                {!validationErrors[`recipient-${index}-phone`] && (
                  <p className="text-sm text-gray-500">Per organizzare la consegna</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor={`address-${recipient.id}`} className="text-lg font-semibold text-gray-800">
                Indirizzo di Consegna *
              </Label>
              <Textarea
                id={`address-${recipient.id}`}
                value={recipient.shippingAddress}
                onChange={(e) => onUpdate('shippingAddress', e.target.value)}
                placeholder="Es. Via Verdi 456, 20121 Milano MI&#10;Primo piano, interno 3"
                rows={4}
                className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mt-3 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                  validationErrors[`recipient-${index}-address`] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                }`}
                required
              />
              {validationErrors[`recipient-${index}-address`] && (
                <p className="text-base text-red-600 mt-3 font-medium">{validationErrors[`recipient-${index}-address`]}</p>
              )}
              {!validationErrors[`recipient-${index}-address`] && (
                <p className="text-sm text-gray-500 mt-3">Include dettagli come piano, interno, citofono</p>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
            <h5 className="font-bold text-gray-800 mb-6 text-lg pb-2 border-b border-gray-100">Note Speciali (opzionale)</h5>
            <Textarea
              id={`instructions-${recipient.id}`}
              value={recipient.specialInstructions}
              onChange={(e) => onUpdate('specialInstructions', e.target.value)}
              placeholder="Es. Consegnare solo al mattino, suonare al citofono Dr. Rossi"
              rows={4}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 rounded-xl transition-all duration-200"
            />
            <p className="text-sm text-gray-500 mt-3">
              Istruzioni speciali per questa consegna
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 