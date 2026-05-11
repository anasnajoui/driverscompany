'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, Loader2, Mail, RotateCcw } from 'lucide-react';

const CANCELLATION_WEBHOOK_URL = 'https://n8n.madani.agency/webhook/dental-logistics-cancel';

type CancellationState =
  | 'confirm'
  | 'loading'
  | 'success'
  | 'too-late'
  | 'already-cancelled'
  | 'not-found'
  | 'error';

interface CancellationResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

interface RequestCancellationViewProps {
  requestId: string;
  onBackToForm: () => void;
}

export const RequestCancellationView: React.FC<RequestCancellationViewProps> = ({
  requestId,
  onBackToForm,
}) => {
  const [state, setState] = useState<CancellationState>('confirm');
  const [message, setMessage] = useState('');

  const headline = useMemo(() => {
    switch (state) {
      case 'success':
        return 'Richiesta annullata';
      case 'too-late':
        return 'Annullamento non disponibile';
      case 'already-cancelled':
        return 'Richiesta già annullata';
      case 'not-found':
        return 'Richiesta non trovata';
      case 'error':
        return 'Errore durante l’annullamento';
      default:
        return 'Annulla richiesta di ritiro';
    }
  }, [state]);

  const description = useMemo(() => {
    if (message) {
      return message;
    }
    switch (state) {
      case 'success':
        return 'Abbiamo registrato correttamente l’annullamento della richiesta. Drivers Company riceverà una notifica automatica.';
      case 'too-late':
        return 'L’annullamento online è consentito solo fino al giorno prima del ritiro. Per assistenza contatta Drivers Company al numero 0432-526200.';
      case 'already-cancelled':
        return 'Questa richiesta risulta già annullata. Non è necessario procedere ulteriormente.';
      case 'not-found':
        return 'Non siamo riusciti a trovare la richiesta collegata a questo link. Verifica di aver aperto il link più recente, oppure contatta Drivers Company.';
      case 'error':
        return 'Si è verificato un problema tecnico. Ti invitiamo a contattare Drivers Company al numero 0432-526200.';
      default:
        return 'Stai per annullare la richiesta di ritiro qui sotto. L’annullamento è consentito solo fino al giorno prima del ritiro. Dopo la conferma, Drivers Company riceverà una notifica automatica.';
    }
  }, [message, state]);

  const handleCancellation = async () => {
    setState('loading');
    setMessage('');

    try {
      const response = await fetch(CANCELLATION_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      const responseText = await response.text();
      let parsed: CancellationResponse = {};

      if (responseText) {
        try {
          parsed = JSON.parse(responseText) as CancellationResponse;
        } catch {
          parsed = { message: responseText };
        }
      }

      if (response.ok && parsed.success !== false) {
        setState('success');
        setMessage(parsed.message || 'La richiesta è stata annullata con successo.');
        return;
      }

      switch (parsed.code) {
        case 'TOO_LATE':
          setState('too-late');
          break;
        case 'ALREADY_CANCELLED':
          setState('already-cancelled');
          break;
        case 'NOT_FOUND':
          setState('not-found');
          break;
        default:
          setState('error');
          break;
      }
      setMessage(parsed.message || 'Non è stato possibile completare l’annullamento.');
    } catch {
      setState('error');
      setMessage('Non è stato possibile contattare il servizio di annullamento. Verifica la connessione internet e riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-white text-center space-y-3 pt-8 pb-6">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-red-50 text-red-600">
            {state === 'loading' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : state === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : state === 'too-late' ||
              state === 'already-cancelled' ||
              state === 'not-found' ||
              state === 'error' ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <RotateCcw className="h-8 w-8" />
            )}
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">{headline}</CardTitle>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg mx-auto">
            {description}
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900 mb-1">Riferimento richiesta</div>
            <div className="break-all font-mono text-xs sm:text-sm text-gray-600">{requestId}</div>
          </div>

          {state === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Dopo l’annullamento, la richiesta non verrà più considerata attiva e Drivers Company riceverà una notifica automatica.
              </div>

              <Button
                onClick={handleCancellation}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-xl text-base sm:text-lg font-semibold"
              >
                Conferma annullamento
              </Button>

              <Button
                onClick={onBackToForm}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:bg-gray-50 h-12 rounded-xl text-sm text-gray-700"
              >
                Torna indietro
              </Button>
            </div>
          )}

          {state === 'loading' && (
            <div className="text-center text-sm text-gray-500">
              Stiamo annullando la richiesta...
            </div>
          )}

          {state !== 'confirm' && state !== 'loading' && (
            <div className="space-y-3">
              <Button
                onClick={onBackToForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl"
              >
                Torna alla home
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                Per assistenza: 0432-526200
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
