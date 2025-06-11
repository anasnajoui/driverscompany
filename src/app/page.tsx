'use client';

import React, { useState } from 'react';
import { FormData, Recipient } from '../types/form';
import { initialFormData, createNewRecipient } from '../constants/formOptions';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StudioInformationStep } from '../../components/StudioInformationStep';
import { RecipientsDeliveryStep } from '../../components/RecipientsDeliveryStep';
import { SubmissionRecap } from '../../components/SubmissionRecap';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js';

const DentalLogisticsForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.trim() === '') return false;
    
    try {
      // Use libphonenumber-js for proper validation
      return isValidPhoneNumber(phone);
    } catch (error) {
      return false;
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = 'Nome azienda obbligatorio';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email obbligatoria';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato email non valido';
    }

    if (!formData.companyPhone.trim()) {
      errors.companyPhone = 'Telefono obbligatorio';
    } else if (!validatePhone(formData.companyPhone)) {
      errors.companyPhone = 'Numero di telefono non valido';
    }

    if (!formData.studioHours.trim()) {
      errors.studioHours = 'Orari studio obbligatori';
    }

    if (!formData.pickupDate) {
      errors.pickupDate = 'Data ritiro obbligatoria';
    }

    if (!formData.pickupLocation.trim()) {
      errors.pickupLocation = 'Indirizzo ritiro obbligatorio';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    formData.recipients.forEach((recipient, index) => {
      if (!recipient.destination.trim()) {
        errors[`recipient-${index}-destination`] = 'Nome destinatario obbligatorio';
      }
      
      if (!recipient.phoneNumber.trim()) {
        errors[`recipient-${index}-phone`] = 'Telefono destinatario obbligatorio';
      } else if (!validatePhone(recipient.phoneNumber)) {
        errors[`recipient-${index}-phone`] = 'Numero di telefono non valido';
      }
      
      if (!recipient.shippingAddress.trim()) {
        errors[`recipient-${index}-address`] = 'Indirizzo consegna obbligatorio';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form navigation with validation
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form data handlers
  const handleInputChange = (field: keyof Omit<FormData, 'recipients'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    // Real-time validation for phone numbers
    if (field === 'companyPhone' && value) {
      if (!validatePhone(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: 'Formato telefono non valido'
        }));
      }
    }

    // Real-time validation for email
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: 'Formato email non valido'
        }));
      }
    }
  };

  // Recipient management
  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, createNewRecipient()]
    }));
  };

  const removeRecipient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient.id !== id)
    }));
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map(recipient =>
        recipient.id === id ? { ...recipient, [field]: value } : recipient
      )
    }));

    // Clear validation errors for this recipient field
    const recipientIndex = formData.recipients.findIndex(r => r.id === id);
    const errorKey = `recipient-${recipientIndex}-${field === 'phoneNumber' ? 'phone' : field === 'shippingAddress' ? 'address' : field}`;
    
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }

    // Real-time validation for recipient phone numbers
    if (field === 'phoneNumber' && value) {
      if (!validatePhone(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [errorKey]: 'Formato telefono non valido'
        }));
      }
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }

    console.log('🚀 Starting form submission...');
    setIsLoading(true);
    
    try {
      console.log('📋 Form data to submit:', formData);
      
      const n8nWebhookUrl = 'https://n8n.madani.agency/webhook/dental-logistics';
      console.log('📡 Sending to:', n8nWebhookUrl);
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (response.ok) {
        const responseText = await response.text();
        console.log('✅ Response body:', responseText);
        console.log('✅ Form submitted successfully to n8n');
        setIsSubmitted(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`Si è verificato un errore durante l'invio: ${errorMessage}\n\nControllare la console per dettagli.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form - clears all data and goes back to step 1
  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
    setValidationErrors({});
  };

  // Show submission recap if form is submitted
  if (isSubmitted) {
    return <SubmissionRecap data={formData} onReset={resetForm} />;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🚚 Logistica Professionale Semplificata
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-4">
            <strong className="text-gray-800">Risparmiate tempo prezioso.</strong> Ritiamo dal vostro ufficio e consegniamo ovunque serva - fornitori, clienti, partner. 
          </p>
          <p className="text-base text-blue-600 font-medium">
            ✅ Ritiro in giornata • ✅ Tracciamento completo • ✅ Assicurazione inclusa
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4 text-xs sm:text-sm">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="hidden sm:inline">Informazioni Azienda</span>
                <span className="sm:hidden">Azienda</span>
              </div>
              <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="hidden sm:inline">Destinazioni</span>
                <span className="sm:hidden">Consegne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white shadow-sm border border-blue-100">
          {/* Step Content */}
          {currentStep === 1 && (
            <StudioInformationStep
              formData={formData}
              onInputChange={handleInputChange}
              validationErrors={validationErrors}
            />
          )}

          {currentStep === 2 && (
            <RecipientsDeliveryStep
              formData={formData}
              onInputChange={handleInputChange}
              onAddRecipient={addRecipient}
              onRemoveRecipient={removeRecipient}
              onUpdateRecipient={updateRecipient}
              validationErrors={validationErrors}
            />
          )}

          {/* Navigation */}
          <div className="border-t border-blue-50 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {currentStep > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  className="border-gray-300 text-gray-600 hover:bg-gray-100 h-14 px-8 w-full sm:w-auto rounded-xl text-lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Indietro
                </Button>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              {currentStep < 2 ? (
                <div className="text-center w-full sm:w-auto">
                  <Button 
                    onClick={nextStep} 
                    className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-lg font-medium w-full sm:w-auto rounded-xl shadow-lg"
                  >
                    <span className="hidden sm:inline">Avanti 👉</span>
                    <span className="sm:hidden">Avanti 👉</span>
                    <ArrowRight className="h-5 w-5 ml-3" />
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">Completa tutti i campi per continuare</p>
                </div>
              ) : (
                <div className="text-center w-full sm:w-auto space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white h-14 px-8 text-lg font-medium w-full sm:w-auto rounded-xl shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <span className="hidden sm:inline">Invio in corso...</span>
                        <span className="sm:hidden">Invio...</span>
                        <div className="h-5 w-5 ml-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Invia richiesta ✅</span>
                        <span className="sm:hidden">Invia ✅</span>
                        <Package className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-gray-500 mt-3">
                    {isLoading ? 'Elaborazione in corso...' : 'Vi contatteremo per confermare'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DentalLogisticsForm; 