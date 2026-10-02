import React from 'react';
import { Manifest, Vehicle, Driver } from '../types';
import { FileCheck, Printer, Download, ShieldCheck, X, QrCode, AlertTriangle } from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface DigitalBolModalProps {
  manifest: Manifest | null;
  vehicle: Vehicle | null;
  driver: Driver | null;
  onClose: () => void;
}

export const DigitalBolModal: React.FC<DigitalBolModalProps> = ({
  manifest,
  vehicle,
  driver,
  onClose,
}) => {
  if (!manifest) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl font-sans text-xs text-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block">
                Electronic Consignment Note (e-CMR)
              </span>
              <span className="text-[11px] text-blue-600 font-mono font-semibold">
                {manifest.ecmr_number}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* e-CMR Document Canvas */}
        <div className="p-6 space-y-4 overflow-y-auto bg-white">
          {/* Header section with International CMR Treaty Designation */}
          <div className="border-b border-slate-200 pb-3 flex flex-wrap justify-between items-start gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">
                Convention relative au contrat de transport international de marchandises par route (CMR)
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                International Consignment Note // Lettre de Voiture Internationale
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Geneva e-CMR Protocol 2008 // EU Mobility Package I Compliant</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 font-mono">
                e-CMR #: {manifest.ecmr_number}
              </div>
              <div className="text-[11px] text-slate-500">
                EU Community License: EU-AUTH/DE-2026/8849
              </div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase">
                Electronically Countersigned & Certified
              </div>
            </div>
          </div>

          {/* CMR Box 1 & Box 2: Shipper & Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                1. Expéditeur / Consignor (Origin):
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">{manifest.origin}</div>
              <div className="text-[11px] text-slate-500 font-mono">Hub Code: {manifest.origin_code}</div>
              <div className="text-xs text-slate-700 mt-1">
                Departure Window: <strong>{manifest.pickup_slot}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                2. Destinataire / Consignee (Destination):
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">{manifest.destination}</div>
              <div className="text-[11px] text-slate-500 font-mono">Depot Code: {manifest.destination_code}</div>
              <div className="text-xs text-slate-700 mt-1">
                Delivery Window: <strong>{manifest.delivery_slot}</strong>
              </div>
            </div>
          </div>

          {/* CMR Box 6, 8, 16: Carrier, Vehicle & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-200 pb-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">16. Carrier / Haulier:</span>
              <div className="font-bold text-slate-900">STACKY EU LOGISTICS</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Vehicle: {vehicle ? `${vehicle.vehicle_id} (${vehicle.plate_number})` : 'Unassigned'}
              </div>
              <div className="text-[11px] text-slate-500">
                Tractor: {vehicle ? vehicle.make_model : '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Driver & Tachograph:</span>
              <div className="font-bold text-slate-900">
                {driver ? `${driver.driver_name} (${driver.country})` : 'Unassigned'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                Card: {driver ? driver.tachograph_card_id : '—'}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {driver ? driver.driver_qualification_card_cqc : 'Code 95 Valid'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Trailer & Cabotage:</span>
              <div className="font-bold text-slate-900">
                {vehicle ? vehicle.trailer_spec.type : '13.6m Standard Euro-Trailer'}
              </div>
              <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
                Staging: {manifest.staging_rule} (Door Sequence)
              </div>
              <div className="text-[11px] text-slate-500">
                Cabotage Run: {manifest.cabotage_operation_count} / 3 Allowed (EC 1072/2009)
              </div>
            </div>
          </div>

          {/* CMR Box 10, 11, 12: Package Specifications & EPAL Pallet Metrics */}
          <div className="space-y-2 border-b border-slate-200 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase">
                Commodity & Package Specifications (Directive 96/53/EC)
              </span>
              <span className="text-xs font-semibold text-blue-700">
                Euro-Pallet Standard: EUR-EPAL 1 (1200 &times; 800 mm)
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2 px-3">Cargo Designation</th>
                  <th className="py-2 px-3">Euro-Pallets</th>
                  <th className="py-2 px-3">Gross Mass (kg / t)</th>
                  <th className="py-2 px-3">Volume</th>
                  <th className="py-2 px-3">Max Unit Dims (L&times;W&times;H)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">{manifest.cargo_description}</td>
                  <td className="py-2 px-3 text-blue-700 font-bold">{manifest.metrics.euro_pallets_count} EPAL</td>
                  <td className="py-2 px-3 text-slate-900 font-bold">{formatMass(manifest.metrics.total_mass_kg)}</td>
                  <td className="py-2 px-3 text-slate-700">{formatVolume(manifest.metrics.total_volume_m3)}</td>
                  <td className="py-2 px-3 text-slate-500">
                    {manifest.metrics.max_unit_dimensions_m.length}m &times; {manifest.metrics.max_unit_dimensions_m.width}m &times; {manifest.metrics.max_unit_dimensions_m.height}m
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CMR Box 13 & 14: Special Handling */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              Special Handling Instructions & CMR Liability:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">ATP Temperature:</span>
                <span className={manifest.handling_requirements.refrigerated ? 'text-blue-700 font-bold' : 'text-slate-500'}>
                  {manifest.handling_requirements.refrigerated ? 'Yes // FRC Certified' : 'Non-Refrigerated'}
                </span>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">ADR Dangerous Goods:</span>
                <span className={manifest.handling_requirements.adr_dangerous_goods ? 'text-amber-800 font-bold' : 'text-slate-500'}>
                  {manifest.handling_requirements.adr_dangerous_goods
                    ? manifest.handling_requirements.adr_class || 'ADR Classified'
                    : 'Non-Hazardous'}
                </span>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block">Double-Stackable:</span>
                <span className={manifest.handling_requirements.stackable ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                  {manifest.handling_requirements.stackable ? 'Allowed (EPAL Interlock)' : 'Single Tier Only'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-800">CMR Convention Article 23 Liability:</strong> Carrier liability for loss or damage is strictly capped at 8.33 SDR (Special Drawing Rights) per kilogram of gross weight short. Governed by European Community road transport treaties.
            </div>
          </div>

          {/* Digital Signature Footer */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Smart Tachograph & In-Cab Sync: 2026-10-02T14:30:00 CET // Verified</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-900 font-mono font-bold">
                  SHA-256-EU-{manifest.ecmr_number.slice(-8)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Verified by EU Tachograph CA
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white p-1 flex items-center justify-center font-mono text-[9px] font-bold">
                eCMR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
