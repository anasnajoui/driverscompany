import React from 'react';
import { FormData } from '../src/types/form';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface SubmissionRecapProps {
  data: FormData;
  onReset: () => void;
}

export const SubmissionRecap: React.FC<SubmissionRecapProps> = ({ data, onReset }) => {
  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-4xl bg-white shadow-sm border border-blue-100">
        <CardHeader className="text-center bg-green-50 border-b border-green-200">
          <CardTitle className="text-2xl font-bold text-green-800">Domanda Inviata!</CardTitle>
          <p className="text-green-600">Grazie, abbiamo ricevuto le tue informazioni.</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-3 border-b pb-2">Riepilogo Ritiro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><strong className="text-gray-600">Nome Azienda:</strong> {data.companyName}</div>
              <div><strong className="text-gray-600">Email:</strong> {data.email}</div>
              <div><strong className="text-gray-600">Telefono Azienda:</strong> {data.companyPhone}</div>
              <div><strong className="text-gray-600">Data Ritiro:</strong> {data.pickupDate}</div>
              <div><strong className="text-gray-600">Orario Studio:</strong> {data.studioHours}</div>
              <div><strong className="text-gray-600">Tempistiche Ritiro:</strong> {
                data.pickupTime === 'standard' ? 'Standard: Entro le 18:00' :
                data.pickupTime === 'morning' ? 'Mattina: 8:00-12:00' :
                data.pickupTime === 'afternoon' ? 'Pomeriggio: 14:00-18:00' : data.pickupTime
              }</div>
              <div className="sm:col-span-2"><strong className="text-gray-600">Indirizzo Ritiro:</strong> {data.pickupLocation}</div>
              <div className="sm:col-span-2"><strong className="text-gray-600">Tipo di Ritiro:</strong> {data.recipients.length > 1 ? 'Ritiro Multiplo' : 'Ritiro Singolo'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-3 border-b pb-2">Destinatari</h3>
            <div className="space-y-4">
              {data.recipients.map((recipient, index) => (
                <div key={recipient.id} className="p-4 bg-gray-50 rounded-md border border-gray-100">
                  <div className="mb-3">
                    <p className="font-semibold text-gray-700 text-base">Destinatario {index + 1}</p>
                    <div className="text-sm space-y-1 mt-2">
                      <p><strong className="text-gray-600">Nome:</strong> {recipient.destination}</p>
                      <p><strong className="text-gray-600">Telefono:</strong> {recipient.phoneNumber}</p>
                      <p><strong className="text-gray-600">Indirizzo:</strong> {recipient.shippingAddress}</p>
                    </div>
                  </div>
                  
                  {/* Special Instructions */}
                  {recipient.specialInstructions && (
                    <div className="border-t pt-3 mt-3">
                      <p className="font-medium text-gray-700 text-sm mb-1">Istruzioni Speciali:</p>
                      <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">{recipient.specialInstructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </CardContent>
        <div className="p-4 bg-gray-50 border-t">
            <Button onClick={onReset} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Invia una nuova domanda
            </Button>
        </div>
      </Card>
    </div>
  );
}; 