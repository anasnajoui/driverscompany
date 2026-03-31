'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, X, Building2, AlertCircle, Check } from 'lucide-react';
import { normalizeCommittenteKey, normalizeCommittenteName } from '../src/constants/formOptions';

// --- Constants ---

const COMMITTENTI_API_URL = 'https://n8n.madani.agency/webhook/committenti';
const MANAGE_API_URL = 'https://n8n.madani.agency/webhook/committenti-manage';

interface CommittenteEntry {
  rawName: string;
  displayName: string;
}

const normalizeCommittenteEntries = (names: string[]): CommittenteEntry[] => {
  const seen = new Set<string>();

  return names.reduce<CommittenteEntry[]>((acc, name) => {
    const rawName = name.trim();
    const displayName = normalizeCommittenteName(rawName);

    if (!rawName || !displayName) {
      return acc;
    }

    const normalizedKey = normalizeCommittenteKey(displayName);
    if (seen.has(normalizedKey)) {
      return acc;
    }

    seen.add(normalizedKey);
    acc.push({ rawName, displayName });
    return acc;
  }, []);
};

// --- Component ---

export const GestioneCommittenti: React.FC = () => {
  const [committenti, setCommittenti] = useState<CommittenteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingName, setRemovingName] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch committenti list
  const fetchCommittenti = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(COMMITTENTI_API_URL);
      if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
      const data: { committenti: string[] } = await response.json();
      setCommittenti(normalizeCommittenteEntries(data.committenti));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Impossibile caricare i committenti: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommittenti();
  }, [fetchCommittenti]);

  // Auto-dismiss messages
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Add handler
  const handleAdd = async () => {
    const trimmed = normalizeCommittenteName(newName);
    if (!trimmed) {
      showError('Il nome non può essere vuoto');
      return;
    }
    setIsAdding(true);
    try {
      const response = await fetch(MANAGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', name: trimmed }),
      });
      const data: { success: boolean; committenti?: string[]; error?: string } = await response.json();
      if (data.success && data.committenti) {
        setCommittenti(normalizeCommittenteEntries(data.committenti));
        setNewName('');
        showSuccess(`"${trimmed}" aggiunto con successo`);
      } else {
        showError(data.error || 'Errore durante l\'aggiunta');
      }
    } catch {
      showError('Errore di rete. Riprova.');
    } finally {
      setIsAdding(false);
    }
  };

  // Remove handler
  const handleRemove = async ({ rawName, displayName }: CommittenteEntry) => {
    setRemovingName(displayName);
    try {
      const response = await fetch(MANAGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', name: rawName }),
      });
      const data: { success: boolean; committenti?: string[]; error?: string } = await response.json();
      if (data.success && data.committenti) {
        setCommittenti(normalizeCommittenteEntries(data.committenti));
        showSuccess(`"${displayName}" rimosso con successo`);
      } else {
        showError(data.error || 'Errore durante la rimozione');
      }
    } catch {
      showError('Errore di rete. Riprova.');
    } finally {
      setRemovingName(null);
    }
  };

  // --- Render: Loading ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Caricamento committenti...</p>
        </div>
      </div>
    );
  }

  // --- Render: Error ---
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={fetchCommittenti} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  // --- Render: Main ---
  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestione Committenti</h2>
          <span className="ml-auto bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
            {committenti.length} committenti
          </span>
        </div>

        {/* Success/Error messages */}
        {successMessage && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Add new committente */}
        <div className="flex gap-3 mb-8">
          <Input
            value={newName}
            onChange={(e) => setNewName(normalizeCommittenteName(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Nome del committente..."
            className="border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-12 transition-all duration-200"
            disabled={isAdding}
          />
          <Button
            onClick={handleAdd}
            disabled={isAdding || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? 'Aggiunta...' : 'Aggiungi'}
          </Button>
        </div>

        {/* Committenti list */}
        {committenti.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nessun committente configurato</p>
          </div>
        ) : (
          <div className="space-y-2">
            {committenti.map((entry) => (
              <div
                key={entry.displayName}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-800 font-medium">{entry.displayName}</span>
                <button
                  onClick={() => handleRemove(entry)}
                  disabled={removingName === entry.displayName}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-colors disabled:opacity-40"
                  aria-label={`Rimuovi ${entry.displayName}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
