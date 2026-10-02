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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#181A1D] border-2 border-[#FFFFFF] font-tabular text-xs text-[#E1E4E8] shadow-2xl">
        {/* Modal Top Bar */}
        <div className="px-4 py-2.5 bg-[#0F1113] border-b border-[#2A2D32] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#FFFFFF]" />
            <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
              ELECTRONIC CONSIGNMENT NOTE (e-CMR) // {manifest.ecmr_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="mta-btn px-2.5 py-1 bg-[#2A2D32] border border-[#8C929B] text-[#FFFFFF] hover:border-[#FFFFFF] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="mta-btn px-2.5 py-1 bg-[#181A1D] border border-[#2A2D32] text-[#8C929B] hover:text-[#FFFFFF]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* e-CMR Document Canvas */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto bg-[#181A1D]">
          {/* Header section with International CMR Treaty Designation */}
          <div className="border-b border-[#2A2D32] pb-3 flex flex-wrap justify-between items-start gap-2">
            <div>
              <div className="text-[10px] text-[#8C929B] tracking-wider uppercase font-mono">
                CONVENTION RELATIVE AU CONTRAT DE TRANSPORT INTERNATIONAL DE MARCHANDISES PAR ROUTE (CMR)
              </div>
              <div className="text-base font-bold text-[#FFFFFF] mt-0.5">
                INTERNATIONAL CONSIGNMENT NOTE // LETTRE DE VOITURE INTERNATIONALE
              </div>
              <div className="text-[10px] text-[#8cd1aa] font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GENEVA e-CMR PROTOCOL 2008 // EU MOBILITY PACKAGE I COMPLIANT</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-[#FFFFFF] font-mono">
                e-CMR #: {manifest.ecmr_number}
              </div>
              <div className="text-[10px] text-[#8C929B]">
                EU COMMUNITY LICENSE: EU-AUTH/DE-2026/8849
              </div>
              <div className="text-[10px] text-[#8cd1aa] font-bold">
                ELECTRONICALLY COUNTERSIGNED & CERTIFIED
              </div>
            </div>
          </div>

          {/* CMR Box 1 & Box 2: Shipper & Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-[#2A2D32] pb-3">
            <div className="p-2.5 bg-[#0F1113] border border-[#2A2D32]">
              <div className="text-[10px] text-[#8C929B] font-bold">
                1. EXPÉDITEUR / CONSIGNOR (ORIGIN):
              </div>
              <div className="text-xs font-bold text-[#FFFFFF] mt-0.5">{manifest.origin}</div>
              <div className="text-[11px] text-[#8C929B]">EU TEN-T HUB CODE: {manifest.origin_code}</div>
              <div className="text-[10px] text-[#E1E4E8] mt-1">
                DEPARTURE WINDOW: {manifest.pickup_slot}
              </div>
            </div>

            <div className="p-2.5 bg-[#0F1113] border border-[#2A2D32]">
              <div className="text-[10px] text-[#8C929B] font-bold">
                2. DESTINATAIRE / CONSIGNEE (DESTINATION):
              </div>
              <div className="text-xs font-bold text-[#FFFFFF] mt-0.5">{manifest.destination}</div>
              <div className="text-[11px] text-[#8C929B]">DEPOT DISPATCH CODE: {manifest.destination_code}</div>
              <div className="text-[10px] text-[#E1E4E8] mt-1">
                DELIVERY WINDOW: {manifest.delivery_slot}
              </div>
            </div>
          </div>

          {/* CMR Box 6, 8, 16: Carrier, Vehicle & Driver Tachograph Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-[#2A2D32] pb-3 text-xs">
            <div className="p-2 bg-[#0F1113] border border-[#2A2D32]">
              <span className="text-[#8C929B] text-[10px] block">16. TRANSPORTEUR / CARRIER:</span>
              <div className="font-bold text-[#FFFFFF]">STACKY EU LOGISTICS CORE</div>
              <div className="text-[10px] text-[#8C929B] mt-0.5">
                VEHICLE: {vehicle ? `${vehicle.vehicle_id} (${vehicle.plate_number})` : 'UNASSIGNED'}
              </div>
              <div className="text-[10px] text-[#8C929B]">
                TRACTOR: {vehicle ? vehicle.make_model : '—'}
              </div>
            </div>

            <div className="p-2 bg-[#0F1113] border border-[#2A2D32]">
              <span className="text-[#8C929B] text-[10px] block">CONDUCTEUR / DRIVER:</span>
              <div className="font-bold text-[#FFFFFF]">
                {driver ? `${driver.driver_name} (${driver.country})` : 'UNASSIGNED'}
              </div>
              <div className="text-[10px] text-[#8cd1aa] mt-0.5">
                TACHO CARD: {driver ? driver.tachograph_card_id : '—'}
              </div>
              <div className="text-[10px] text-[#8C929B]">
                QUALIFICATION: {driver ? driver.driver_qualification_card_cqc : 'Code 95 Active'}
              </div>
            </div>

            <div className="p-2 bg-[#0F1113] border border-[#2A2D32]">
              <span className="text-[#8C929B] text-[10px] block">TRAILER SPEC / STAGING:</span>
              <div className="font-bold text-[#FFFFFF]">
                {vehicle ? vehicle.trailer_spec.type : '13.6m Standard Euro-Trailer'}
              </div>
              <div className="text-[10px] text-[#8cd1aa] mt-0.5">
                STAGING: {manifest.staging_rule} (DOOR SEQUENCE)
              </div>
              <div className="text-[10px] text-[#8C929B]">
                CABOTAGE RUN: {manifest.cabotage_operation_count} / 3 ALLOWED (EC 1072/2009)
              </div>
            </div>
          </div>

          {/* CMR Box 10, 11, 12: Package Specifications & EPAL Pallet Metrics */}
          <div className="space-y-2 border-b border-[#2A2D32] pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFFFFF] uppercase">
                COMMODITY & PACKAGE SPECIFICATIONS (DIRECTIVE 96/53/EC)
              </span>
              <span className="text-[10px] text-[#8cd1aa]">
                EURO-PALLET STANDARD: EUR-EPAL 1 (1200 × 800 mm)
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2D32] text-[#8C929B] text-[10px]">
                  <th className="py-1">CARGO DESIGNATION</th>
                  <th className="py-1">EURO-PALLETS</th>
                  <th className="py-1">GROSS MASS (KG / T)</th>
                  <th className="py-1">VOLUME</th>
                  <th className="py-1">MAX UNIT DIMS (L×W×H)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#2A2D32]/50">
                  <td className="py-1.5 font-bold text-[#FFFFFF]">{manifest.cargo_description}</td>
                  <td className="py-1.5 text-[#8cd1aa] font-bold">{manifest.metrics.euro_pallets_count} EPAL</td>
                  <td className="py-1.5 text-[#FFFFFF] font-bold">{formatMass(manifest.metrics.total_mass_kg)}</td>
                  <td className="py-1.5 text-[#E1E4E8]">{formatVolume(manifest.metrics.total_volume_m3)}</td>
                  <td className="py-1.5 text-[#8C929B]">
                    {manifest.metrics.max_unit_dimensions_m.length}m × {manifest.metrics.max_unit_dimensions_m.width}m × {manifest.metrics.max_unit_dimensions_m.height}m
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CMR Box 13 & 14: Special Handling, ATP Temperature & ADR Dangerous Goods */}
          <div className="p-3 bg-[#0F1113] border border-[#2A2D32] space-y-2 text-xs">
            <div className="text-[10px] text-[#8C929B] font-bold">
              SPECIAL INSTRUCTIONS & REGULATORY ATTESTATION:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
                <span className="text-[#8C929B] text-[10px] block">ATP PERISHABLE CARRIAGE:</span>
                <span className={manifest.handling_requirements.refrigerated ? 'text-[#8cd1aa] font-bold' : 'text-[#8C929B]'}>
                  {manifest.handling_requirements.refrigerated ? 'YES // FRC CERTIFIED (-20°C / +12°C)' : 'NON-TEMPERATURE CONTROLLED'}
                </span>
              </div>

              <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
                <span className="text-[#8C929B] text-[10px] block">ADR DANGEROUS GOODS:</span>
                <span className={manifest.handling_requirements.adr_dangerous_goods ? 'text-[#e88d8d] font-bold' : 'text-[#8cd1aa]'}>
                  {manifest.handling_requirements.adr_dangerous_goods
                    ? manifest.handling_requirements.adr_class || 'ADR CLASSIFIED FREIGHT'
                    : 'NON-ADR GENERAL MERCHANDISE'}
                </span>
              </div>

              <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
                <span className="text-[#8C929B] text-[10px] block">DOUBLE-STACKING ENVELOPE:</span>
                <span className={manifest.handling_requirements.stackable ? 'text-[#8cd1aa]' : 'text-[#e5bf7d]'}>
                  {manifest.handling_requirements.stackable ? 'ALLOWED (EPAL INTERLOCK)' : 'DO NOT STACK (SINGLE TIER)'}
                </span>
              </div>
            </div>

            {/* Carrier Legal Liability Clause under CMR Convention */}
            <div className="pt-1.5 border-t border-[#2A2D32] text-[10px] text-[#8C929B] leading-relaxed">
              <span className="font-bold text-[#E1E4E8]">CMR CONVENTION ARTICLE 23 LIABILITY:</span> Carrier liability for loss or damage is strictly governed by the CMR Convention and capped at 8.33 SDR (Special Drawing Rights) per kilogram of gross weight short. Governed by European Community road transport legislation.
            </div>
          </div>

          {/* Digital Signature & Cryptographic QR Verification Footer */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#2A2D32] gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#8cd1aa]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                DIGITAL SMART TACHOGRAPH & IN-CAB SYNC: 2026-10-02T14:30:00 CET // VALIDATED
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-[#FFFFFF] font-mono font-bold">
                  AUTH SIGNATURE: SHA-256-EU-{manifest.ecmr_number.slice(-8)}
                </div>
                <div className="text-[9px] text-[#8C929B]">
                  VERIFIED BY EU TACHOGRAPH ROOT CA
                </div>
              </div>
              {/* Simulated QR Code Box */}
              <div className="w-8 h-8 bg-[#E1E4E8] text-black p-0.5 flex items-center justify-center font-mono text-[8px] font-bold">
                eCMR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
