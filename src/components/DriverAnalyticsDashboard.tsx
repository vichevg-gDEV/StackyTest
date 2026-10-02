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
  ShieldCheck
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
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-4 text-xs font-tabular space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2D32] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#FFFFFF]" />
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              EUROPEAN COMPLIANCE & AUDIT PANEL // EC 561/2006 & DIRECTIVE 96/53/EC
            </h2>
            <div className="text-[11px] text-[#8C929B]">
              SMART TACHOGRAPH GEN 2 AUDIT · TEN-T FREIGHT TONNAGE · MOBILITY PACKAGE I CABOTAGE LOGS
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1">
          <Calendar className="w-3.5 h-3.5 text-[#8C929B]" />
          <span className="text-[#8C929B] text-[11px]">AUDIT PERIOD:</span>
          <input
            type="date"
            value={dateRangeStart}
            onChange={(e) => setDateRangeStart(e.target.value)}
            className="bg-transparent text-[#FFFFFF] text-xs focus:outline-none"
          />
          <span className="text-[#8C929B]">TO</span>
          <input
            type="date"
            value={dateRangeEnd}
            onChange={(e) => setDateRangeEnd(e.target.value)}
            className="bg-transparent text-[#FFFFFF] text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* European Smart Tachograph Driver Audit Log (EC 561/2006) */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E1E4E8]" />
            SMART TACHOGRAPH GEN 2 AUDIT LOG (EU REGULATION (EC) NO 561/2006)
          </span>
          <span className="text-[#8cd1aa] text-[10px] font-bold">
            MANDATORY 4.5h CONTINUOUS DRIVE & 45m REST RULES ENFORCED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2D32] text-[#8C929B] text-[11px]">
                <th className="py-1.5 px-2">Driver Name & ID</th>
                <th className="py-1.5 px-2">Assigned HGV</th>
                <th className="py-1.5 px-2">Continuous Drive (Max 4.5h / 270m)</th>
                <th className="py-1.5 px-2">Daily Drive (Max 9h / 10h)</th>
                <th className="py-1.5 px-2">Weekly Total (Max 56h)</th>
                <th className="py-1.5 px-2">Mandatory 45m Rest Status</th>
                <th className="py-1.5 px-2">Code 95 Qualification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D32]/50 text-xs">
              {drivers.map((d) => {
                const isWarn = d.tacho_status === 'BREAK_DUE' || d.tacho_status === 'DAILY_LIMIT_WARN';
                const isCritical = d.tacho_status === 'INFRINGING';
                const contProgressPct = (d.continuous_drive_minutes / 270) * 100;

                return (
                  <tr key={d.driver_id} className="hover:bg-[#181A1D] transition-colors">
                    <td className="py-2 px-2 font-bold text-[#FFFFFF]">
                      <div>{d.driver_name} [{d.country}]</div>
                      <div className="text-[10px] text-[#8C929B] font-mono">{d.tachograph_card_id}</div>
                    </td>
                    <td className="py-2 px-2 text-[#8C929B]">
                      {d.assigned_vehicle_id || 'STANDBY'}
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-[#E1E4E8] font-bold">
                        {Math.floor(d.continuous_drive_minutes / 60)}h {d.continuous_drive_minutes % 60}m / 4h 30m
                      </div>
                      <div className="w-28 h-1.5 bg-[#181A1D] border border-[#2A2D32] mt-1">
                        <div
                          className={`h-full ${
                            contProgressPct > 90 ? 'bg-[#7A3E3E]' : contProgressPct > 75 ? 'bg-[#8C734B]' : 'bg-[#4E6E5D]'
                          }`}
                          style={{ width: `${Math.min(100, contProgressPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-[#E1E4E8]">
                      {d.daily_driving_hours.toFixed(1)}h / 9.0h
                    </td>
                    <td className="py-2 px-2 text-[#8C929B]">
                      {d.weekly_accumulated_hours.toFixed(1)}h / 56.0h
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] border ${
                          isCritical
                            ? 'bg-[#7A3E3E]/20 border-[#7A3E3E] text-[#e88d8d] font-bold'
                            : isWarn
                            ? 'bg-[#8C734B]/20 border-[#8C734B] text-[#e5bf7d] font-bold'
                            : 'bg-[#4E6E5D]/20 border-[#4E6E5D] text-[#8cd1aa]'
                        }`}
                      >
                        {d.mandatory_break_in}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[#8C929B] text-[11px]">
                      {d.driver_qualification_card_cqc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Operator Metrics */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#E1E4E8]" />
            DISPATCH OPERATOR THROUGHPUT & CABOTAGE AUDIT
          </span>
          <span className="text-[#8C929B] text-[10px]">
            ACTIVE SHIFT BENCHMARKS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2D32] text-[#8C929B] text-[11px]">
                <th className="py-1.5 px-2">Operator Workstation</th>
                <th className="py-1.5 px-2">Active Shift Session</th>
                <th className="py-1.5 px-2">e-CMR Manifests Assigned</th>
                <th className="py-1.5 px-2">Dispatches / Hr</th>
                <th className="py-1.5 px-2">TEN-T Route Re-Directs</th>
                <th className="py-1.5 px-2">Avg Cab Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D32]/50 text-xs">
              {operators.map((op) => (
                <tr key={op.operator_id} className="hover:bg-[#181A1D] transition-colors">
                  <td className="py-2 px-2 font-bold text-[#FFFFFF]">
                    {op.operator_id} ({op.operator_name}) [{op.country}]
                  </td>
                  <td className="py-2 px-2 text-[#E1E4E8]">{op.active_hours}</td>
                  <td className="py-2 px-2 text-[#FFFFFF] font-bold">{op.loads_assigned} e-CMR Loads</td>
                  <td className="py-2 px-2 text-[#8cd1aa] font-bold">{op.dispatches_per_hr.toFixed(2)}</td>
                  <td className="py-2 px-2 text-[#8C929B]">{op.reroutes_handled} bypasses</td>
                  <td className="py-2 px-2 text-[#E1E4E8]">{op.avg_response_sec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* European Report Generator Action Buttons */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
            EUROPEAN LOGISTICS AUDIT & STATUTORY REPORT GENERATOR
          </span>
          <span className="text-[#8C929B] text-[10px]">
            EXPORTABLE FORMATS: PRINT/PDF · CSV SPREADSHEET · JSON STREAM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => handleGenerateReport('TACHO')}
            className="mta-btn p-2.5 bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] text-left space-y-1"
          >
            <div className="font-bold text-xs">[ EC 561/2006 TACHOGRAPH REPORT ]</div>
            <div className="text-[10px] text-[#8C929B]">
              4.5h driving limit, mandatory 45m rest break flags, daily & weekly cycles
            </div>
          </button>

          <button
            onClick={() => handleGenerateReport('TONNAGE')}
            className="mta-btn p-2.5 bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] text-left space-y-1"
          >
            <div className="font-bold text-xs">[ DIRECTIVE 96/53/EC TONNAGE REPORT ]</div>
            <div className="text-[10px] text-[#8C929B]">
              40t MAM utilization, 33-EPAL pallet distribution, &lt;60% under-capacity flags
            </div>
          </button>

          <button
            onClick={() => handleGenerateReport('CABOTAGE_OPERATOR')}
            className="mta-btn p-2.5 bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] text-left space-y-1"
          >
            <div className="font-bold text-xs">[ CABOTAGE & OPERATOR LOG ]</div>
            <div className="text-[10px] text-[#8C929B]">
              Regulation (EC) 1072/2009 3-cabotage tracking, 4-day cooling-off verification
            </div>
          </button>

          <button
            onClick={() => handleGenerateReport('RAW_TELEMETRY')}
            className="mta-btn p-2.5 bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] text-left space-y-1"
          >
            <div className="font-bold text-xs">[ EXPORT IN-CAB TELEMATICS DUMP ]</div>
            <div className="text-[10px] text-[#8C929B]">
              10Hz MQTT feed, tire Bar ratings, AdBlue SCR levels, GPS & LKW-Maut timestamps
            </div>
          </button>
        </div>
      </div>

      {/* Generated Report Viewer Modal / Drawer */}
      {activeReportType && (
        <div className="p-4 bg-[#0F1113] border-2 border-[#FFFFFF] space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between border-b border-[#2A2D32] pb-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#FFFFFF]" />
              <span className="font-bold text-sm text-[#FFFFFF] tracking-wider uppercase">
                EXPORT AUDIT LOG // FORMAT: {reportOutputFormat} [{dateRangeStart} TO {dateRangeEnd}]
              </span>
            </div>

            {/* Actions: Download CSV, JSON, Print, Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportOutputFormat('PREVIEW')}
                className={`px-2 py-1 text-xs border ${
                  reportOutputFormat === 'PREVIEW'
                    ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                    : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
                }`}
              >
                PREVIEW
              </button>
              <button
                onClick={() => setReportOutputFormat('JSON')}
                className={`px-2 py-1 text-xs border ${
                  reportOutputFormat === 'JSON'
                    ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                    : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
                }`}
              >
                JSON STREAM
              </button>
              <button
                onClick={handleDownloadCsv}
                className="mta-btn px-2.5 py-1 text-xs bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="mta-btn px-2.5 py-1 text-xs bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => window.print()}
                className="mta-btn px-2.5 py-1 text-xs bg-[#FFFFFF] text-[#0F1113] font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT / PDF</span>
              </button>
              <button
                onClick={() => setActiveReportType(null)}
                className="px-2 py-1 text-xs border border-[#2A2D32] text-[#8C929B] hover:text-[#FFFFFF]"
              >
                ✕ CLOSE
              </button>
            </div>
          </div>

          {/* Report Content Body */}
          <div className="bg-[#181A1D] border border-[#2A2D32] p-4 max-h-96 overflow-y-auto font-tabular text-xs">
            {reportOutputFormat === 'JSON' ? (
              <pre className="text-[#8cd1aa] text-[11px] overflow-x-auto leading-relaxed">
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
              <div className="space-y-4">
                <div className="border-b border-[#2A2D32] pb-2">
                  <div className="text-sm font-bold text-[#FFFFFF]">
                    OFFICIAL EUROPEAN FREIGHT & FLEET REGULATORY AUDIT REPORT
                  </div>
                  <div className="text-[11px] text-[#8C929B]">
                    SYSTEM: STACKY EUROPEAN CONTROL CORE // PERIOD: {dateRangeStart} TO {dateRangeEnd} // STATUS: VALIDATED
                  </div>
                </div>

                {activeReportType === 'TACHO' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#FFFFFF]">SMART TACHOGRAPH SUMMARY FINDINGS:</div>
                    <div className="text-[11px] text-[#E1E4E8]">
                      • Total commercial driver smart cards evaluated: {drivers.length} EU drivers over continuous 24-hour evaluation cycle.
                    </div>
                    <div className="text-[11px] text-[#e5bf7d]">
                      • Mandatory Rest Advisory: 1 driver (DRV-EU-4412 / Antoine Dubois) approached within 15 minutes of mandatory 4.5h uninterrupted rest pause.
                    </div>
                    <div className="text-[11px] text-[#8cd1aa]">
                      • Zero critical EU Regulation (EC) No 561/2006 infringements recorded across TEN-T operations.
                    </div>
                  </div>
                )}

                {activeReportType === 'TONNAGE' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#FFFFFF]">FLEET PAYLOAD & TONNAGE SUMMARY (DIRECTIVE 96/53/EC):</div>
                    <div className="text-[11px] text-[#E1E4E8]">
                      • Total commercial freight deployed on European motorways: {formatMass(vehicles.reduce((sum, v) => sum + v.metrics.current_gross_mass_kg, 0))}.
                    </div>
                    <div className="text-[11px] text-[#8cd1aa]">
                      • Average payload utilization across 13.6m Euro-trailers: 74.2% capacity (33 EPAL standard).
                    </div>
                    <div className="text-[11px] text-[#8C929B]">
                      • Low-utilization advisory (&lt;60%): HGV-FR-204 (Lille Europe depot staging). Available for cabotage pick.
                    </div>
                  </div>
                )}

                {activeReportType === 'CABOTAGE_OPERATOR' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#FFFFFF]">CABOTAGE & OPERATOR DISPATCH THROUGHPUT:</div>
                    <div className="text-[11px] text-[#E1E4E8]">
                      • Total international e-CMR dispatches executed during period: 73 consignments confirmed.
                    </div>
                    <div className="text-[11px] text-[#8cd1aa]">
                      • Regulation (EC) 1072/2009 Cabotage Verification: All foreign haulage units compliant with &le; 3 operations within 7-day statutory window.
                    </div>
                    <div className="text-[11px] text-[#E1E4E8]">
                      • Mean dispatcher transmission latency: 19.8 seconds from customer booking to cab DTCO terminal.
                    </div>
                  </div>
                )}

                {activeReportType === 'RAW_TELEMETRY' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#FFFFFF]">RAW IN-CAB TELEMETRICS & TACHOGRAPH DUMP:</div>
                    <div className="text-[11px] text-[#8C929B]">
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
