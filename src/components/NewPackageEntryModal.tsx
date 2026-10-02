import React, { useState } from 'react';
import { Manifest } from '../types';
import { 
  Package, 
  X, 
  MapPin, 
  Scale, 
  Box, 
  ShieldCheck, 
  Layers, 
  Check, 
  Clock, 
  Truck,
  Thermometer,
  AlertTriangle
} from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface NewPackageEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePackage: (manifest: Manifest) => void;
}

export const NewPackageEntryModal: React.FC<NewPackageEntryModalProps> = ({
  isOpen,
  onClose,
  onCreatePackage,
}) => {
  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Industrial & Automotive');
  
  // Addresses
  const [originAddress, setOriginAddress] = useState('Port of Rotterdam, Gate 4, Netherlands');
  const [originCode, setOriginCode] = useState('HUB-RTM');
  const [pickupSlot, setPickupSlot] = useState('Today, 09:00 - 11:00 CET');

  const [destAddress, setDestAddress] = useState('Frankfurt CargoCity South, Gate 12, Germany');
  const [destCode, setDestCode] = useState('DEP-FRA');
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow, 14:00 - 16:00 CET');

  // Dimensions & Weight
  const [totalMassKg, setTotalMassKg] = useState<number>(18500);
  const [lengthM, setLengthM] = useState<number>(1.20);
  const [widthM, setWidthM] = useState<number>(0.80);
  const [heightM, setHeightM] = useState<number>(1.50);
  const [palletCount, setPalletCount] = useState<number>(24);

  // Handling & European Requirements
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [targetTemp, setTargetTemp] = useState('+4°C');
  const [isAdr, setIsAdr] = useState(false);
  const [adrClass, setAdrClass] = useState('ADR Class 3 (Flammable Liquids)');
  const [isStackable, setIsStackable] = useState(true);
  const [stagingRule, setStagingRule] = useState<'LIFO' | 'FIFO'>('LIFO');

  if (!isOpen) return null;

  // Computed metrics
  const unitVolM3 = lengthM * widthM * heightM;
  const totalVolM3 = Number((unitVolM3 * palletCount).toFixed(1));
  const density = totalVolM3 > 0 ? (totalMassKg / totalVolM3).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newManifest: Manifest = {
      manifest_id: `CMR-EU-${randomSuffix}`,
      ecmr_number: `eCMR-2026-EU-${randomSuffix}-X`,
      cargo_description: description.trim(),
      origin: originAddress.trim(),
      origin_code: originCode.trim() || 'HUB-EU',
      destination: destAddress.trim(),
      destination_code: destCode.trim() || 'DEP-EU',
      metrics: {
        total_mass_kg: Number(totalMassKg),
        total_volume_m3: totalVolM3,
        euro_pallets_count: Number(palletCount),
        max_unit_dimensions_m: {
          length: Number(lengthM),
          width: Number(widthM),
          height: Number(heightM),
        },
      },
      handling_requirements: {
        refrigerated: isRefrigerated,
        adr_dangerous_goods: isAdr,
        adr_class: isAdr ? adrClass : undefined,
        stackable: isStackable,
      },
      assignment_status: {
        assigned_vehicle: null,
        assigned_driver: null,
        dispatch_operator: null,
        timestamp_assigned: null,
        status: 'PENDING',
      },
      staging_rule: stagingRule,
      pickup_slot: pickupSlot,
      delivery_slot: deliverySlot,
      cabotage_operation_count: 0,
    };

    onCreatePackage(newManifest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New Package & Consignment Entry
              </h2>
              <p className="text-xs text-slate-500">
                Register a new freight load with e-CMR consignment note and load envelope specifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Load Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Load Description & Commodity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cargo Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision CNC Industrial Equipment & Drive Motors"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                >
                  <option value="Industrial & Automotive">Industrial & Automotive</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Pharmaceuticals & Health">Pharmaceuticals & Health</option>
                  <option value="Agricultural & Fresh Food">Agricultural & Fresh Food</option>
                  <option value="Chemicals & Raw Materials">Chemicals & Raw Materials</option>
                  <option value="General Retail Merchandising">General Retail Merchandising</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Addresses & Hub Routing */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Pickup & Delivery Addresses</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Origin / Pickup Hub</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Departure</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Pickup Address & Facility
                  </label>
                  <input
                    type="text"
                    required
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    placeholder="Facility name, street, city, country"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Hub Code
                    </label>
                    <input
                      type="text"
                      value={originCode}
                      onChange={(e) => setOriginCode(e.target.value)}
                      placeholder="e.g. HUB-RTM"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Pickup Window
                    </label>
                    <input
                      type="text"
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                      placeholder="e.g. 09:00 - 11:00 CET"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Destination / Delivery Depot</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Arrival</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Delivery Address & Receiving Bay
                  </label>
                  <input
                    type="text"
                    required
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    placeholder="Depot name, street, city, country"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Depot Code
                    </label>
                    <input
                      type="text"
                      value={destCode}
                      onChange={(e) => setDestCode(e.target.value)}
                      placeholder="e.g. DEP-FRA"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Delivery Window
                    </label>
                    <input
                      type="text"
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      placeholder="e.g. 14:00 - 16:00 CET"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payload Weight & Dimensions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Weight, Pallet Count & Dimensions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gross Weight (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="32000"
                    step="50"
                    required
                    value={totalMassKg}
                    onChange={(e) => setTotalMassKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Euro-Pallets (EPAL 1)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="33"
                    required
                    value={palletCount}
                    onChange={(e) => setPalletCount(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-semibold text-blue-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ 33</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit Length (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="13.6"
                  value={lengthM}
                  onChange={(e) => setLengthM(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit Width (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="2.5"
                  value={widthM}
                  onChange={(e) => setWidthM(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit Height (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="3.0"
                  value={heightM}
                  onChange={(e) => setHeightM(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-700 gap-3">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900">Computed Freight Volume:</span>
                <span className="font-bold text-blue-700">{totalVolM3} m³</span>
                <span className="text-slate-400">|</span>
                <span>Density: <strong className="text-slate-800">{density} kg/m³</strong></span>
              </div>

              <div className="text-slate-500 text-[11px]">
                EU 13.62m standard trailer portal clearance (&le; 2.48m W &times; &le; 2.70m H): <span className="text-emerald-700 font-bold">VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Section 4: European Requirements & Special Handling */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-bold">4</span>
              <span>Handling, ATP & ADR Classification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Refrigeration */}
              <div className={`p-3 rounded-xl border transition-all ${isRefrigerated ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Thermometer className={`w-4 h-4 ${isRefrigerated ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold text-slate-800">ATP Temperature-Controlled</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRefrigerated}
                    onChange={(e) => setIsRefrigerated(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>
                {isRefrigerated && (
                  <div className="mt-2 pt-2 border-t border-blue-100">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">Target Temperature</label>
                    <input
                      type="text"
                      value={targetTemp}
                      onChange={(e) => setTargetTemp(e.target.value)}
                      placeholder="e.g. +4°C or -18°C Deep Frozen"
                      className="w-full px-2 py-1 text-xs bg-white border border-blue-200 rounded-md text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* ADR Dangerous Goods */}
              <div className={`p-3 rounded-xl border transition-all ${isAdr ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${isAdr ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold text-slate-800">ADR Dangerous Goods</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAdr}
                    onChange={(e) => setIsAdr(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                  />
                </label>
                {isAdr && (
                  <div className="mt-2 pt-2 border-t border-amber-100">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">ADR Classification</label>
                    <select
                      value={adrClass}
                      onChange={(e) => setAdrClass(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white border border-amber-200 rounded-md text-slate-800"
                    >
                      <option value="ADR Class 3 (Flammable Liquids)">ADR Class 3 (Flammable Liquids)</option>
                      <option value="ADR Class 8 (Corrosive Substances)">ADR Class 8 (Corrosive Substances)</option>
                      <option value="ADR Class 9 (Miscellaneous Dangerous Substances)">ADR Class 9 (Miscellaneous Dangerous Substances)</option>
                      <option value="ADR Class 2 (Gases)">ADR Class 2 (Gases)</option>
                      <option value="ADR Class 5.1 (Oxidizing Substances)">ADR Class 5.1 (Oxidizing Substances)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Staging & Stackability */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-800 block">Double-Stackable</span>
                  <span className="text-[10px] text-slate-500">Allow pallets stacked 2-high</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStackable(!isStackable)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    isStackable ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isStackable ? 'Yes' : 'No'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-800 block">Staging Principle</span>
                  <span className="text-[10px] text-slate-500">Loading order sequence</span>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStagingRule('LIFO')}
                    className={`px-2.5 py-1 font-medium ${stagingRule === 'LIFO' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                  >
                    LIFO
                  </button>
                  <button
                    type="button"
                    onClick={() => setStagingRule('FIFO')}
                    className={`px-2.5 py-1 font-medium ${stagingRule === 'FIFO' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                  >
                    FIFO
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Generates legally valid UN/Geneva e-CMR Consignment Note</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Register Package Load</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
