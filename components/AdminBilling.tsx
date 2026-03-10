'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getBillingConfig, saveBillingConfig } from '../src/services/localStorage';
import { BillingConfig } from '../src/types/storage';
import {
  Building2,
  Package,
  Truck,
  Settings,
  RefreshCw,
  AlertCircle,
  Search,
  ChevronDown,
  MapPin,
  Clock,
  FileText,
} from 'lucide-react';

// --- Types for API response ---

interface DeliveryDetail {
  id: string;
  date: string;
  pickupDate: string;
  pickupAddress: string;
  pickupTime: string;
  destination: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryTime: string;
  specialInstructions: string;
  generalNotes: string;
  status: string;
  billingClient: string;
}

interface BillingClient {
  name: string;
  email: string;
  phone: string;
  deliveries: number;
  pickups: number;
  dates: string[];
  deliveryDetails: DeliveryDetail[];
  billingClient: string;
}

interface BillingResponse {
  month: string;
  totalClients: number;
  totalDeliveries: number;
  totalPickups: number;
  clients: BillingClient[];
}

// --- Helpers ---

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatCurrency = (amount: number): string => {
  return `€${amount.toFixed(2)}`;
};

// --- Component ---

export const AdminBilling: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [data, setData] = useState<BillingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [costPerDelivery, setCostPerDelivery] = useState(6.0);
  const [sortAlpha, setSortAlpha] = useState(true);

  // Load billing config from localStorage
  useEffect(() => {
    const config = getBillingConfig();
    if (config.costPerDelivery > 0) {
      setCostPerDelivery(config.costPerDelivery);
    }
  }, []);

  // Fetch billing data
  const fetchBillingData = useCallback(async (month: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://n8n.madani.agency/webhook/dental-logistics-billing?month=${month}`
      );

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const result: BillingResponse = await response.json();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Impossibile caricare i dati di fatturazione: ${message}`);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when month changes
  useEffect(() => {
    fetchBillingData(selectedMonth);
  }, [selectedMonth, fetchBillingData]);

  // Save cost config
  const handleSaveCostConfig = () => {
    const config: BillingConfig = {
      costPerDelivery,
      costPerPickup: 0,
      lastUpdated: new Date().toISOString(),
    };
    saveBillingConfig(config);
  };

  // --- Render: Loading ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-gray-500 font-medium">
            Caricamento dati di fatturazione...
          </p>
        </div>
      </div>
    );
  }

  // --- Render: Error ---
  if (error) {
    return (
      <div className="space-y-6">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-10 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Errore di caricamento
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => fetchBillingData(selectedMonth)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render: Empty ---
  if (!data || data.totalClients === 0) {
    return (
      <div className="space-y-6">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-10 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun dato disponibile
            </h3>
            <p className="text-gray-500">
              Non ci sono dati di fatturazione per il mese selezionato.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render: Dashboard ---
  const totalRevenue = data.totalDeliveries * costPerDelivery;

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Building2 className="h-6 w-6 text-blue-600" />}
          value={data.totalClients}
          label="Totale Clienti"
          bgClass="bg-blue-50"
          borderClass="border-blue-100"
        />
        <SummaryCard
          icon={<Package className="h-6 w-6 text-green-600" />}
          value={data.totalDeliveries}
          label="Totale Consegne"
          bgClass="bg-green-50"
          borderClass="border-green-100"
        />
        <SummaryCard
          icon={<Truck className="h-6 w-6 text-orange-600" />}
          value={data.totalPickups}
          label="Totale Ritiri"
          bgClass="bg-orange-50"
          borderClass="border-orange-100"
        />
        <SummaryCard
          icon={
            <span className="text-lg font-bold text-purple-600">€</span>
          }
          value={formatCurrency(totalRevenue)}
          label="Imponibile Totale"
          bgClass="bg-purple-50"
          borderClass="border-purple-100"
        />
      </div>

      {/* Cost Configuration Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfig(!showConfig)}
          className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurazione Costi
        </Button>
      </div>

      {/* Cost Configuration Panel */}
      {showConfig && (
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Configurazione Costi
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <label
                  htmlFor="costPerDelivery"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Costo per consegna (€)
                </label>
                <Input
                  id="costPerDelivery"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPerDelivery}
                  onChange={(e) =>
                    setCostPerDelivery(parseFloat(e.target.value) || 0)
                  }
                  className="rounded-xl border-2 border-gray-200 h-11 w-full sm:w-48"
                />
              </div>
              <Button
                onClick={handleSaveCostConfig}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6"
              >
                Salva
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Dettaglio Clienti
            </h2>
            <button
              onClick={() => setSortAlpha(!sortAlpha)}
              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors"
            >
              {sortAlpha ? 'A→Z' : 'Per consegne'}
            </button>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-2 border-gray-200 h-10 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const sortedClients = [...data.clients].sort((a, b) =>
              sortAlpha ? a.name.localeCompare(b.name) : b.deliveries - a.deliveries
            );
            const filtered = sortedClients.filter((client) =>
              client.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) {
              return (
                <div className="col-span-full text-center py-10 text-gray-400">
                  Nessun cliente trovato per "{searchQuery}"
                </div>
              );
            }
            return filtered.map((client, index) => (
              <ClientCard
                key={`${client.name}-${index}`}
                client={client}
                costPerDelivery={costPerDelivery}
              />
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const MonthSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-gray-900">Fatturazione</h2>
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
    />
  </div>
);

const SummaryCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  bgClass: string;
  borderClass: string;
}> = ({ icon, value, label, bgClass, borderClass }) => (
  <Card
    className={`${bgClass} border ${borderClass} shadow-lg rounded-2xl overflow-hidden`}
  >
    <CardContent className="p-5">
      <div className="flex items-center gap-3 mb-3">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-sm text-gray-600 mt-1 font-medium">{label}</div>
    </CardContent>
  </Card>
);

const ClientCard: React.FC<{
  client: BillingClient;
  costPerDelivery: number;
}> = ({ client, costPerDelivery }) => {
  const totalCost = client.deliveries * costPerDelivery;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-5">
        {/* Client Header */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900">{client.name}</h3>
          {client.email && (
            <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
          )}
          {client.phone && (
            <p className="text-sm text-gray-500">{client.phone}</p>
          )}
        </div>
        {client.billingClient && client.billingClient !== client.name && (
          <div className="mt-2">
            <span className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
              Fatturare a: {client.billingClient}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <Package className="h-3.5 w-3.5" />
            {client.deliveries} consegne
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <Truck className="h-3.5 w-3.5" />
            {client.pickups} ritiri
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">
            Totale dovuto
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalCost)}
          </span>
        </div>

        {/* Expandable Delivery Details */}
        {client.deliveryDetails && client.deliveryDetails.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-left group"
            >
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Dettaglio consegne ({client.deliveryDetails.length})
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expanded && (
              <div className="mt-3 space-y-3">
                {/* Ritiro info (orange) - show once from first detail */}
                {client.deliveryDetails[0]?.pickupAddress && (
                  <div className="bg-orange-50 rounded-xl p-3.5 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-3.5 w-3.5 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Ritiro</span>
                    </div>
                    <div className="space-y-1 text-sm text-orange-800">
                      {client.deliveryDetails[0].pickupAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-orange-500" />
                          <span>{client.deliveryDetails[0].pickupAddress}</span>
                        </div>
                      )}
                      {client.deliveryDetails[0].pickupTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                          <span>{client.deliveryDetails[0].pickupTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Consegne (green) */}
                {client.deliveryDetails.map((detail, i) => (
                  <div
                    key={detail.id || i}
                    className="bg-green-50 rounded-xl p-3.5 border border-green-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">
                          {detail.destination || 'Consegna ' + (i + 1)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {detail.deliveryAddress && (
                        <div className="flex items-start gap-2 text-green-800">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                          <span>{detail.deliveryAddress}</span>
                        </div>
                      )}
                      {detail.deliveryTime && (
                        <div className="flex items-center gap-2 text-green-800">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          <span>{detail.deliveryTime}</span>
                        </div>
                      )}
                      {detail.specialInstructions && (
                        <div className="flex items-start gap-2 text-green-800">
                          <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                          <span>{detail.specialInstructions}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-1 text-xs text-green-600">
                        {detail.id && <span>{detail.id}</span>}
                        {detail.date && <span>Richiesta: {detail.date}</span>}
                        {detail.pickupDate && <span>Ritiro: {detail.pickupDate}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
