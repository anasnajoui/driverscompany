import React from 'react';
import { Recipient } from '../src/types/form';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';

interface RecipientCardProps {
  recipient: Recipient;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof Recipient, value: string) => void;
  onRemove: () => void;
  validationErrors: Record<string, string>;
  addressBookSelect?: React.ReactNode;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  recipient,
  index,
  canRemove,
  onUpdate,
  onRemove,
  validationErrors,
  addressBookSelect,
}) => {
  return (
    <Card className="border border-gray-200 rounded-2xl shadow-sm">
      <CardContent className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-gray-900">
            Destinazione {index + 1}
          </h4>
          {canRemove && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Address book select */}
        {addressBookSelect && (
          <div className="mb-6">{addressBookSelect}</div>
        )}

        {/* Fields */}
        <div className="space-y-5">
          {/* Nome del Destinatario */}
          <div>
            <Label htmlFor={`destination-${recipient.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
              Nome del Destinatario *
            </Label>
            <Input
              id={`destination-${recipient.id}`}
              value={recipient.destination}
              onChange={(e) => onUpdate('destination', e.target.value)}
              placeholder="Es. Laboratorio Milano, Dr. Bianchi"
              className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                validationErrors[`recipient-${index}-destination`] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
              }`}
              required
            />
            {validationErrors[`recipient-${index}-destination`] && (
              <p className="text-sm text-red-600 mt-1">{validationErrors[`recipient-${index}-destination`]}</p>
            )}
          </div>

          {/* Indirizzo + Orario */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <Label htmlFor={`address-${recipient.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                Indirizzo di Consegna *
              </Label>
              <Textarea
                id={`address-${recipient.id}`}
                value={recipient.shippingAddress}
                onChange={(e) => onUpdate('shippingAddress', e.target.value)}
                placeholder="Via, civico, CAP, citt&#224;"
                rows={2}
                className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                  validationErrors[`recipient-${index}-address`] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                }`}
                required
              />
              {validationErrors[`recipient-${index}-address`] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors[`recipient-${index}-address`]}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`deliveryTime-${recipient.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                Orario di Consegna
              </Label>
              <select
                id={`deliveryTime-${recipient.id}`}
                value={recipient.deliveryTime}
                onChange={(e) => onUpdate('deliveryTime', e.target.value)}
                className="w-full px-4 h-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200"
              >
                <option value="standard">Standard (entro le 18:00)</option>
                <option value="morning">Mattina (8:00-12:00)</option>
                <option value="afternoon">Pomeriggio (14:00-18:00)</option>
              </select>
            </div>
          </div>

          {/* Note speciali — inline, no wrapper */}
          <div>
            <Label htmlFor={`instructions-${recipient.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
              Note per questa consegna <span className="text-gray-400 font-normal">(opzionale)</span>
            </Label>
            <Textarea
              id={`instructions-${recipient.id}`}
              value={recipient.specialInstructions}
              onChange={(e) => onUpdate('specialInstructions', e.target.value)}
              placeholder="Es. Suonare al citofono Dr. Rossi, primo piano"
              rows={2}
              className="border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 rounded-xl transition-all duration-200"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
