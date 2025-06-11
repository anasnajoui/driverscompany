import React from 'react';
import { FormData } from '../src/types/form';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Building2, Calendar, MapPin, Clock } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';

interface StudioInformationStepProps {
  formData: FormData;
  onInputChange: (field: keyof Omit<FormData, 'recipients'>, value: any) => void;
  validationErrors: Record<string, string>;
}

export const StudioInformationStep: React.FC<StudioInformationStepProps> = ({
  formData,
  onInputChange,
  validationErrors,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <CardHeader className="border-b border-blue-50 p-8">
        <CardTitle className="text-2xl font-semibold text-gray-900 mb-3">
          👋 Iniziamo dalla vostra azienda
        </CardTitle>
        <p className="text-base text-gray-600 leading-relaxed">
          Bastano pochi dettagli per organizzare tutto. Ci vogliono solo 2 minuti per completare la richiesta.
        </p>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Studio Contact Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">✨ Come vi chiamate?</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-base font-medium text-gray-700 mb-2 block">
                  Nome dell'azienda *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => onInputChange('companyName', e.target.value)}
                  placeholder="Studio Dentistico Dr. Rossi"
                  className={`border-gray-200 focus:border-blue-400 h-14 text-base ${
                    validationErrors.companyName ? 'border-red-300 focus:border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors.companyName && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.companyName}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">📧 Come possiamo contattarvi?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-2 block">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  placeholder="info@studio.it"
                  className={`border-gray-200 focus:border-blue-400 h-14 text-base ${
                    validationErrors.email ? 'border-red-300 focus:border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                )}
                {!validationErrors.email && (
                  <p className="text-sm text-gray-500 mt-2">Vi invieremo qui la conferma</p>
                )}
              </div>

              <div>
                <Label htmlFor="companyPhone" className="text-base font-medium text-gray-700 mb-2 block">
                  Telefono *
                </Label>
                <div className={validationErrors.companyPhone ? 'border border-red-300 rounded-md' : ''}>
                  <PhoneInput
                    id="companyPhone"
                    international
                    defaultCountry="IT"
                    value={formData.companyPhone}
                    onChange={(value) => onInputChange('companyPhone', value || '')}
                    placeholder="02 1234567"
                    required
                    limitMaxLength={true}
                    countryCallingCodeEditable={false}
                    maxLength={17}
                  />
                </div>
                {validationErrors.companyPhone && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.companyPhone}</p>
                )}
                {!validationErrors.companyPhone && (
                  <p className="text-sm text-gray-500 mt-2">Per organizzare il ritiro</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="studioHours" className="text-base font-medium text-gray-700 mb-2 block">
              Quando siete aperti? *
            </Label>
            <Input
              id="studioHours"
              value={formData.studioHours}
              onChange={(e) => onInputChange('studioHours', e.target.value)}
              placeholder="Lun-Ven 9:00-18:00, Sab 9:00-13:00"
              className={`border-gray-200 focus:border-blue-400 h-14 text-base ${
                validationErrors.studioHours ? 'border-red-300 focus:border-red-400' : ''
              }`}
              required
            />
            {validationErrors.studioHours && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.studioHours}</p>
            )}
            {!validationErrors.studioHours && (
              <p className="text-sm text-gray-500 mt-2">I nostri orari di ritiro</p>
            )}
          </div>
        </div>

        {/* Pickup Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">📍 Dove dobbiamo venire?</h3>
            <div>
              <Label htmlFor="pickupLocation" className="text-base font-medium text-gray-700 mb-2 block">
                Indirizzo dell'ufficio *
              </Label>
              <Textarea
                id="pickupLocation"
                value={formData.pickupLocation}
                onChange={(e) => onInputChange('pickupLocation', e.target.value)}
                placeholder="Via Roma 123, 20100 Milano MI&#10;Secondo piano, interno 5"
                rows={3}
                className={`border-gray-200 focus:border-blue-400 text-base ${
                  validationErrors.pickupLocation ? 'border-red-300 focus:border-red-400' : ''
                }`}
                required
              />
              {validationErrors.pickupLocation && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.pickupLocation}</p>
              )}
              {!validationErrors.pickupLocation && (
                <p className="text-sm text-gray-500 mt-2">
                  Include dettagli come piano, interno, citofono se necessario
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">📅 Quando?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pickupDate" className="text-base font-medium text-gray-700 mb-2 block">
                  Quale giorno? *
                </Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => onInputChange('pickupDate', e.target.value)}
                  min={today}
                  className={`border-gray-200 focus:border-blue-400 h-14 text-base ${
                    validationErrors.pickupDate ? 'border-red-300 focus:border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors.pickupDate && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.pickupDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pickupTime" className="text-base font-medium text-gray-700 mb-2 block">
                  Che orario preferite?
                </Label>
                <select
                  id="pickupTime"
                  value={formData.pickupTime}
                  onChange={(e) => onInputChange('pickupTime', e.target.value)}
                  className="w-full text-base px-4 py-4 h-14 border border-gray-200 rounded-md focus:border-blue-400 focus:outline-none"
                >
                  <option value="standard">Standard (entro le 18:00)</option>
                  <option value="morning">Mattina (8:00-12:00)</option>
                  <option value="afternoon">Pomeriggio (14:00-18:00)</option>
                  <option value="urgent">Urgente (entro 2 ore)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Friendly Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <div className="text-base text-blue-800">
            <p className="font-medium mb-2">✅ Perfetto! Quasi pronti</p>
            <p className="text-sm text-blue-600">
              Nel prossimo passaggio vi chiederemo cosa ritirare e dove consegnare
            </p>
          </div>
        </div>
      </CardContent>
    </>
  );
}; 