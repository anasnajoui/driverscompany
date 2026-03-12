import React, { useState, useEffect } from 'react';
import { FormData } from '../src/types/form';
import { StructuredHours } from '../src/types/storage';
import { CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { COMMITTENTI } from '../src/constants/formOptions';
import PhoneInput from 'react-phone-number-input';
import { StudioHoursSelector, defaultStructuredHours, serializeHours } from './StudioHoursSelector';
import { getSenderProfile } from '../src/services/localStorage';

const COMMITTENTI_API_URL = 'https://n8n.madani.agency/webhook/committenti';

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
  const [structuredHours, setStructuredHours] = useState<StructuredHours>(defaultStructuredHours);
  const [committentiList, setCommittentiList] = useState<string[]>(COMMITTENTI);
  const [committentiLoading, setCommittentiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(COMMITTENTI_API_URL)
      .then(res => res.json())
      .then((data: { committenti?: string[] }) => {
        if (!cancelled && Array.isArray(data.committenti) && data.committenti.length > 0) {
          setCommittentiList(data.committenti);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) setCommittentiLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const profile = getSenderProfile();
    if (profile?.structuredHours) {
      setStructuredHours(profile.structuredHours);
      onInputChange('studioHours', serializeHours(profile.structuredHours));
    } else {
      onInputChange('studioHours', serializeHours(defaultStructuredHours));
    }
  }, []);

  const handleHoursChange = (hours: StructuredHours) => {
    setStructuredHours(hours);
    onInputChange('studioHours', serializeHours(hours));
  };

  return (
    <>
      <CardHeader className="border-b border-gray-100 p-6 sm:p-10">
        <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
          Informazioni Mittente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-10 space-y-6">
        {/* Company Name */}
        <div>
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Nome dell&apos;azienda *
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            placeholder="Es. Studio Dentistico Dr. Rossi"
            className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
              validationErrors.companyName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            }`}
            required
          />
          {validationErrors.companyName && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.companyName}</p>
          )}
        </div>

        {/* Laboratorio Committente (opzionale) */}
        <div>
          <Label htmlFor="billingClient" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Laboratorio committente <span className="text-gray-400 font-normal">(opzionale)</span>
          </Label>
          <select
            id="billingClient"
            value={formData.billingClient}
            onChange={(e) => onInputChange('billingClient', e.target.value)}
            className="w-full px-4 h-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200"
          >
            <option value="">— Seleziona (se applicabile) —</option>
            {committentiLoading ? (
              <option value="" disabled>Caricamento...</option>
            ) : (
              committentiList.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))
            )}
          </select>
          <p className="text-sm text-gray-400 mt-1">
            A quale laboratorio fatturare questo servizio?
          </p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="Es. info@studiodentistico.it"
              className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
                validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
              }`}
              required
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            )}
            {!validationErrors.email && (
              <p className="text-sm text-gray-400 mt-1">Vi invieremo qui la conferma</p>
            )}
          </div>

          <div>
            <Label htmlFor="companyPhone" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Telefono *
            </Label>
            <div className={`border rounded-xl transition-all duration-200 ${validationErrors.companyPhone ? 'border-red-300' : 'border-gray-200'}`}>
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
              <p className="text-sm text-red-600 mt-1">{validationErrors.companyPhone}</p>
            )}
            {!validationErrors.companyPhone && (
              <p className="text-sm text-gray-400 mt-1">Per organizzare il ritiro</p>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div>
          <Label htmlFor="studioHours" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Quando siete aperti? *
          </Label>
          <StudioHoursSelector
            value={structuredHours}
            onChange={handleHoursChange}
          />
          {!validationErrors.studioHours && (
            <p className="text-sm text-gray-400 mt-1.5">I nostri orari di ritiro</p>
          )}
        </div>

        {/* Pickup Address */}
        <div>
          <Label htmlFor="pickupLocation" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Indirizzo dell&apos;ufficio *
          </Label>
          <Textarea
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) => onInputChange('pickupLocation', e.target.value)}
            placeholder="Es. Via Roma 123, 20100 Milano MI&#10;Secondo piano, interno 5"
            rows={3}
            className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 rounded-xl transition-all duration-200 ${
              validationErrors.pickupLocation ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            }`}
            required
          />
          {validationErrors.pickupLocation && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.pickupLocation}</p>
          )}
          {!validationErrors.pickupLocation && (
            <p className="text-sm text-gray-400 mt-1">
              Include dettagli come piano, interno, citofono se necessario
            </p>
          )}
        </div>

        {/* Pickup Date & Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="pickupDate" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Quale giorno? *
            </Label>
            <Input
              id="pickupDate"
              type="date"
              value={formData.pickupDate}
              onChange={(e) => onInputChange('pickupDate', e.target.value)}
              min={today}
              className={`border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 rounded-xl transition-all duration-200 ${
                validationErrors.pickupDate ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
              }`}
              required
            />
            {validationErrors.pickupDate && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.pickupDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pickupTime" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Che orario preferite?
            </Label>
            <select
              id="pickupTime"
              value={formData.pickupTime}
              onChange={(e) => onInputChange('pickupTime', e.target.value)}
              className="w-full px-4 h-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-700 transition-all duration-200"
            >
              <option value="standard">Standard (entro le 18:00)</option>
              <option value="morning">Mattina (8:00-12:00)</option>
              <option value="afternoon">Pomeriggio (14:00-18:00)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Note generali <span className="text-gray-400 font-normal">(opzionale)</span>
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Es. Informazioni aggiuntive per il ritiro o la consegna"
            rows={2}
            className="border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 rounded-xl transition-all duration-200"
          />
          <p className="text-sm text-gray-400 mt-1">Eventuali note aggiuntive per il nostro team</p>
        </div>
      </CardContent>
    </>
  );
};
