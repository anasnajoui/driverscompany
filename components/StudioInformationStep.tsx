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
      <CardHeader className="border-b border-gray-100 p-10">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Iniziamo dalla vostra azienda
        </CardTitle>
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          Bastano pochi dettagli per organizzare tutto. Ci vogliono solo 2 minuti per completare la richiesta.
        </p>
      </CardHeader>
      <CardContent className="p-10 space-y-12">
        {/* Studio Contact Information */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 pb-2 border-b border-gray-100">Come vi chiamate?</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="companyName" className="text-lg font-semibold text-gray-800 mb-3 block">
                  Nome dell'azienda *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => onInputChange('companyName', e.target.value)}
                  placeholder="Es. Studio Dentistico Dr. Rossi"
                  className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-16 text-lg placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                    validationErrors.companyName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                  required
                />
                {validationErrors.companyName && (
                  <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.companyName}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 pb-2 border-b border-gray-100">Come possiamo contattarvi?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="email" className="text-lg font-semibold text-gray-800 mb-3 block">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  placeholder="Es. info@studiodentistico.it"
                  className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-16 text-lg placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                    validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                  required
                />
                {validationErrors.email && (
                  <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.email}</p>
                )}
                {!validationErrors.email && (
                  <p className="text-base text-gray-500 mt-3">Vi invieremo qui la conferma</p>
                )}
              </div>

              <div>
                <Label htmlFor="companyPhone" className="text-lg font-semibold text-gray-800 mb-3 block">
                  Telefono *
                </Label>
                <div className={`border-2 rounded-xl transition-all duration-200 ${validationErrors.companyPhone ? 'border-red-300' : 'border-gray-200'}`}>
                  <PhoneInput
                    id="companyPhone"
                    international
                    defaultCountry="IT"
                    value={formData.companyPhone}
                    onChange={(value) => onInputChange('companyPhone', value || '')}
                    placeholder="Es. 02 1234567"
                    required
                    limitMaxLength={true}
                    countryCallingCodeEditable={false}
                    maxLength={17}
                  />
                </div>
                {validationErrors.companyPhone && (
                  <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.companyPhone}</p>
                )}
                {!validationErrors.companyPhone && (
                  <p className="text-base text-gray-500 mt-3">Per organizzare il ritiro</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="studioHours" className="text-lg font-semibold text-gray-800 mb-3 block">
              Quando siete aperti? *
            </Label>
            <Input
              id="studioHours"
              value={formData.studioHours}
              onChange={(e) => onInputChange('studioHours', e.target.value)}
              placeholder="Es. Lun-Ven 9:00-18:00, Sab 9:00-13:00"
              className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-16 text-lg placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                validationErrors.studioHours ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
              }`}
              required
            />
            {validationErrors.studioHours && (
              <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.studioHours}</p>
            )}
            {!validationErrors.studioHours && (
              <p className="text-base text-gray-500 mt-3">I nostri orari di ritiro</p>
            )}
          </div>
        </div>

        {/* Pickup Information */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 pb-2 border-b border-gray-100">Dove dobbiamo venire?</h3>
            <div>
              <Label htmlFor="pickupLocation" className="text-lg font-semibold text-gray-800 mb-3 block">
                Indirizzo dell'ufficio *
              </Label>
              <Textarea
                id="pickupLocation"
                value={formData.pickupLocation}
                onChange={(e) => onInputChange('pickupLocation', e.target.value)}
                placeholder="Es. Via Roma 123, 20100 Milano MI&#10;Secondo piano, interno 5"
                rows={4}
                className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                  validationErrors.pickupLocation ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                }`}
                required
              />
              {validationErrors.pickupLocation && (
                <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.pickupLocation}</p>
              )}
              {!validationErrors.pickupLocation && (
                <p className="text-base text-gray-500 mt-3">
                  Include dettagli come piano, interno, citofono se necessario
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 pb-2 border-b border-gray-100">Quando?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="pickupDate" className="text-lg font-semibold text-gray-800 mb-3 block">
                  Quale giorno? *
                </Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => onInputChange('pickupDate', e.target.value)}
                  min={today}
                  className={`border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-16 text-lg rounded-xl transition-all duration-200 ${
                    validationErrors.pickupDate ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                  required
                />
                {validationErrors.pickupDate && (
                  <p className="text-base text-red-600 mt-3 font-medium">{validationErrors.pickupDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pickupTime" className="text-lg font-semibold text-gray-800 mb-3 block">
                  Che orario preferite?
                </Label>
                <select
                  id="pickupTime"
                  value={formData.pickupTime}
                  onChange={(e) => onInputChange('pickupTime', e.target.value)}
                  className="w-full text-lg px-6 py-4 h-16 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200"
                >
                  <option value="standard">Standard (entro le 18:00)</option>
                  <option value="morning">Mattina (8:00-12:00)</option>
                  <option value="afternoon">Pomeriggio (14:00-18:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Friendly Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center">
          <div className="text-lg text-blue-800">
            <p className="font-bold mb-3 text-xl">Perfetto! Quasi pronti</p>
            <p className="text-base text-blue-700 font-medium">
              Nel prossimo passaggio vi chiederemo cosa ritirare e dove consegnare
            </p>
          </div>
        </div>
      </CardContent>
    </>
  );
}; 