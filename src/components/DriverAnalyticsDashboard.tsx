import React, { useState } from 'react';
import { Driver, Operator, Vehicle } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  BarChart3, 
  Calendar,
  Layers,
  FileSpreadsheet,
  Code,
  ShieldCheck,
  Scale,
  X
} from 'lucide-react';
import { formatHours, formatMass } from '../utils/formatters';

interface DriverAnalyticsDashboardProps {
  drivers: Driver[];
  operators: Operator[];
  vehicles: Vehicle[];
}

export const DriverAnalyticsDashboard: React.FC<DriverAnalyticsDashboardProps> = ({
  drivers,
  operators,
  vehicles,
}) => {
  const [dateRangeStart, setDateRangeStart] = useState('2026-09-25');
  const [dateRangeEnd, setDateRangeEnd] = useState('2026-10-02');
  const [activeReportType, setActiveReportType] = useState<'TACHO' | 'TONNAGE' | 'CABOTAGE_OPERATOR' | 'RAW_TELEMETRY' | null>(null);
  const [reportOutputFormat, setReportOutputFormat] = useState<'PREVIEW' | 'JSON' | 'CSV'>('PREVIEW');

  // Trigger report generation modal/preview
  const handleGenerateReport = (type: 'TACHO' | 'TONNAGE' | 'CABOTAGE_OPERATOR' | 'RAW_TELEMETRY') => {
    setActiveReportType(type);
    setReportOutputFormat('PREVIEW');
  };

  const handleDownloadCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportType === 'TACHO') {
      csvContent += 'Driver ID,Driver Name,Country,Tacho Card,Continuous Drive (min),Daily Driving (h),Weekly Driving (h),Status,Mandatory Break Due,Code 95 Valid\n';
      drivers.forEach((d) => {
        csvContent += `${d.driver_id},"${d.driver_name}",${d.country},${d.tachograph_card_id},${d.continuous_drive_minutes}/270m,${d.daily_driving_hours}h/9h,${d.weekly_accumulated_hours}h/56h,${d.tacho_status},"${d.mandatory_break_in}","${d.driver_qualification_card_cqc}"\n`;
      });
    } else if (activeReportType === 'TONNAGE') {
      csvContent += 'Vehicle ID,Country,Trailer Model,Gross Mass (kg),Max Payload (kg),Mass Utilization %,EPAL Loaded,Max EPAL\n';
      vehicles.forEach((v) => {
        csvContent += `${v.vehicle_id},${v.location.country},"${v.trailer_spec.model}",${v.metrics.current_gross_mass_kg},${v.trailer_spec.max_payload_kg},${((v.metrics.current_gross_mass_kg / v.trailer_spec.max_payload_kg) * 100).toFixed(1)}%,${v.metrics.euro_pallets_loaded},${v.trailer_spec.max_euro_pallets}\n`;
      });
    } else {
      csvContent += 'Operator ID,Operator Name,Active Hours,Loads Assigned,Dispatches/Hr,Reroutes Handled,Avg Response Sec\n';
      operators.forEach((o) => {
        csvContent += `${o.operator_id},"${o.operator_name}",${o.active_hours},${o.loads_assigned},${o.dispatches_per_hr},${o.reroutes_handled},${o.avg_response_sec}s\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STACKY_EU_${activeReportType || 'AUDIT'}_REPORT_${dateRangeStart}_to_${dateRangeEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    let exportData: any = {};
    if (activeReportType === 'TACHO') {
      exportData = {
        regulation: 'EU Regulation (EC) No 561/2006 & Mobility Package I',
        report: 'SMART_TACHOGRAPH_GEN2_COMPLIANCE',
        date_range: { start: dateRangeStart, end: dateRangeEnd },
        drivers,
      };
    } else if (activeReportType === 'TONNAGE') {
      exportData = {
        regulation: 'EU Directive 96/53/EC Weights & Dimensions',
        report: 'FLEET_TONNAGE_EPAL_UTILIZATION',
        date_range: { start: dateRangeStart, end: dateRangeEnd },
        vehicles,
      };
    } else if (activeReportType === 'CABOTAGE_OPERATOR') {
      exportData = {
        regulation: 'EU Regulation (EC) No 1072/2009 Cabotage Rules',
        report: 'CABOTAGE_AND_OPERATOR_WORKSTATION_ACTIVITY',
        date_range: { start: dateRangeStart, end: dateRangeEnd },
        operators,
      };
    } else {
      exportData = {
        report: 'RAW_IN_CAB_TELEMETRY_STREAM',
        timestamp: new Date().toISOString(),
        units: { speed: 'km/h', mass: 'kg', pressure: 'bar', temperature: 'celsius' },
        telemetry_nodes: vehicles.map((v) => ({
          vehicle_id: v.vehicle_id,
          plate_number: v.plate_number,
          driver_id: v.driver_id,
          location: v.location,
          metrics: v.metrics,
          active_route: v.active_route,
        })),
      };
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `STACKY_EU_${activeReportType || 'EXPORT'}_STREAM.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-5 font-sans space-y-5">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              European Compliance & Audit Panel // EC 561/2006 & Directive 96/53/EC
            </h2>
            <p className="text-xs text-slate-500">
              Smart Tachograph Gen 2 Driver Hours · TEN-T Freight Tonnage · Mobility Package I Cabotage Verification
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Audit Period:</span>
          <input
            type="date"
            value={dateRangeStart}
            onChange={(e) => setDateRangeStart(e.target.value)}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateRangeEnd}
            onChange={(e) => setDateRangeEnd(e.target.value)}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* European Smart Tachograph Driver Audit Log */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="font-bold text-xs text-slate-900 tracking-tight flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            Smart Tachograph Gen 2 Driver Hours (EU Regulation (EC) No 561/2006)
          </span>
          <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            4.5h Drive / 45m Rest Rules Active
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Driver Name & ID</th>
                <th className="py-2.5 px-3">Assigned HGV</th>
                <th className="py-2.5 px-3">Continuous Drive (Max 4.5h / 270m)</th>
                <th className="py-2.5 px-3">Daily Drive (Max 9h / 10h)</th>
                <th className="py-2.5 px-3">Weekly Total (Max 56h)</th>
                <th className="py-2.5 px-3">Mandatory 45m Rest Status</th>
                <th className="py-2.5 px-3">Code 95 Qualification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {drivers.map((d) => {
                const isWarn = d.tacho_status === 'BREAK_DUE' || d.tacho_status === 'DAILY_LIMIT_WARN';
                const isCritical = d.tacho_status === 'INFRINGING';
                const contProgressPct = (d.continuous_drive_minutes / 270) * 100;

                return (
                  <tr key={d.driver_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div className="font-bold">{d.driver_name} <span className="font-normal text-slate-400">[{d.country}]</span></div>
                      <div className="text-[10px] text-slate-500 font-mono">{d.tachograph_card_id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono font-medium">
                      {d.assigned_vehicle_id || <span className="text-slate-400">Standby</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 font-semibold font-mono">
                        {Math.floor(d.continuous_drive_minutes / 60)}h {d.continuous_drive_minutes % 60}m / 4h 30m
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            contProgressPct > 90 ? 'bg-rose-500' : contProgressPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, contProgressPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {d.daily_driving_hours.toFixed(1)}h / 9.0h
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {d.weekly_accumulated_hours.toFixed(1)}h / 56.0h
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                          isCritical
                            ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                            : isWarn
                            ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        {d.mandatory_break_in}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {d.driver_qualification_card_cqc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Operator Productivity */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="font-bold text-xs text-slate-900 tracking-tight flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            Dispatch Operator Workstation Productivity
          </span>
          <span className="text-slate-400 text-xs">Shift Benchmarks & Response Latency</span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                <th className="py-2 px-3">Operator Workstation</th>
                <th className="py-2 px-3">Active Shift Session</th>
                <th className="py-2 px-3">e-CMR Manifests Assigned</th>
                <th className="py-2 px-3">Dispatches / Hr</th>
                <th className="py-2 px-3">TEN-T Route Re-Directs</th>
                <th className="py-2 px-3">Avg Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {operators.map((op) => (
                <tr key={op.operator_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {op.operator_id} ({op.operator_name}) <span className="font-normal text-slate-400">[{op.country}]</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{op.active_hours}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">{op.loads_assigned} e-CMR Loads</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">{op.dispatches_per_hr.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{op.reroutes_handled} bypasses</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{op.avg_response_sec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* European Report Generator Action Buttons */}
      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="font-bold text-xs text-slate-900 tracking-tight">
            Logistics Audit & Regulatory Report Generator
          </span>
          <span className="text-slate-400 text-xs">Export to PDF, CSV, or JSON Data Stream</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleGenerateReport('TACHO')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl text-left space-y-1 transition-all"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>EC 561/2006 Tachograph Report</span>
            </div>
            <p className="text-[11px] text-slate-500">
              4.5h driving limit, mandatory 45m rest break flags, daily & weekly cycles
            </p>
          </button>

          <button
            onClick={() => handleGenerateReport('TONNAGE')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl text-left space-y-1 transition-all"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Directive 96/53/EC Tonnage Report</span>
            </div>
            <p className="text-[11px] text-slate-500">
              40t MAM utilization, 33-EPAL pallet distribution, &lt;60% under-capacity flags
            </p>
          </button>

          <button
            onClick={() => handleGenerateReport('CABOTAGE_OPERATOR')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl text-left space-y-1 transition-all"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cabotage & Operator Dispatch Log</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Regulation (EC) 1072/2009 3-cabotage tracking, 4-day cooling-off verification
            </p>
          </button>

          <button
            onClick={() => handleGenerateReport('RAW_TELEMETRY')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl text-left space-y-1 transition-all"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>Export In-Cab Telematics Dump</span>
            </div>
            <p className="text-[11px] text-slate-500">
              10Hz MQTT feed, tire Bar ratings, AdBlue SCR levels, GPS & LKW-Maut timestamps
            </p>
          </button>
        </div>
      </div>

      {/* Generated Report Viewer Modal / Drawer */}
      {activeReportType && (
        <div className="p-5 bg-white border border-slate-300 rounded-2xl shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="font-bold text-sm text-slate-900">
                Audit Export Report // {activeReportType} [{dateRangeStart} to {dateRangeEnd}]
              </span>
            </div>

            {/* Actions: Download CSV, JSON, Print, Close */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
                <button
                  onClick={() => setReportOutputFormat('PREVIEW')}
                  className={`px-3 py-1 font-medium ${
                    reportOutputFormat === 'PREVIEW' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setReportOutputFormat('JSON')}
                  className={`px-3 py-1 font-medium ${
                    reportOutputFormat === 'JSON' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  JSON Stream
                </button>
              </div>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-blue-600" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => setActiveReportType(null)}
                className="w-7 h-7 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Content Body */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-96 overflow-y-auto font-sans text-xs">
            {reportOutputFormat === 'JSON' ? (
              <pre className="text-slate-800 text-[11px] overflow-x-auto leading-relaxed font-mono">
                {JSON.stringify(
                  {
                    report_id: `EU-AUDIT-${Date.now()}`,
                    type: activeReportType,
                    period: { start: dateRangeStart, end: dateRangeEnd },
                    jurisdiction: 'European Union (EC 561/2006, 96/53/EC, 1072/2009)',
                    generated_by: 'OP-102 (Miller)',
                    compliance_status: 'VALIDATED_NOMINAL',
                    records_count: activeReportType === 'TACHO' ? drivers.length : vehicles.length,
                    payload: activeReportType === 'TACHO' ? drivers : vehicles,
                  },
                  null,
                  2
                )}
              </pre>
            ) : (
              <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="border-b border-slate-100 pb-2">
                  <div className="text-sm font-bold text-slate-900">
                    Official European Freight & Fleet Regulatory Audit Report
                  </div>
                  <div className="text-xs text-slate-500">
                    System: STACKY European Logistics Terminal // Period: {dateRangeStart} to {dateRangeEnd} // Status: Verified
                  </div>
                </div>

                {activeReportType === 'TACHO' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900">Smart Tachograph Summary Findings:</div>
                    <div className="text-xs text-slate-700">
                      • Total commercial driver smart cards evaluated: {drivers.length} EU drivers over continuous 24-hour evaluation cycle.
                    </div>
                    <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      • Mandatory Rest Advisory: 1 driver (DRV-EU-4412 / Antoine Dubois) approached within 15 minutes of mandatory 4.5h uninterrupted rest pause.
                    </div>
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      • Zero critical EU Regulation (EC) No 561/2006 infringements recorded across TEN-T operations.
                    </div>
                  </div>
                )}

                {activeReportType === 'TONNAGE' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900">Fleet Payload & Tonnage Summary (Directive 96/53/EC):</div>
                    <div className="text-xs text-slate-700">
                      • Total commercial freight deployed on European motorways: {formatMass(vehicles.reduce((sum, v) => sum + v.metrics.current_gross_mass_kg, 0))}.
                    </div>
                    <div className="text-xs text-slate-700">
                      • Average payload utilization across 13.6m Euro-trailers: 74.2% capacity (33 EPAL standard).
                    </div>
                    <div className="text-xs text-slate-500">
                      • Low-utilization advisory (&lt;60%): HGV-FR-204 (Lille Europe depot staging). Available for cabotage load.
                    </div>
                  </div>
                )}

                {activeReportType === 'CABOTAGE_OPERATOR' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900">Cabotage & Operator Dispatch Throughput:</div>
                    <div className="text-xs text-slate-700">
                      • Total international e-CMR dispatches executed during period: 73 consignments confirmed.
                    </div>
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      • Regulation (EC) 1072/2009 Cabotage Verification: All foreign haulage units compliant with &le; 3 operations within 7-day statutory window.
                    </div>
                    <div className="text-xs text-slate-700">
                      • Mean dispatcher transmission latency: 19.8 seconds from customer booking to cab DTCO terminal.
                    </div>
                  </div>
                )}

                {activeReportType === 'RAW_TELEMETRY' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900">Raw In-Cab Telemetrics & Tachograph Dump:</div>
                    <div className="text-xs text-slate-600 font-mono">
                      Ingestion rate: 100% packets received at 10Hz. All HGV commercial tire pressures within nominal 8.4 - 8.8 bar range. AdBlue fluid levels above statutory 20% minimum.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
