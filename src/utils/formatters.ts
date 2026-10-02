export function formatMass(kg: number): string {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(2) + ' t (' + new Intl.NumberFormat('de-DE').format(Math.round(kg)) + ' kg)';
  }
  return new Intl.NumberFormat('de-DE').format(Math.round(kg)) + ' kg';
}

export function formatMassKgOnly(kg: number): string {
  return new Intl.NumberFormat('de-DE').format(Math.round(kg)) + ' kg';
}

export function formatVolume(m3: number): string {
  return m3.toFixed(1) + ' m³';
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export function formatCurrencyEur(eur: number): string {
  return `€${eur.toFixed(2)}`;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'ON-ROUTE':
    case 'NOMINAL':
    case 'BALANCED':
    case 'IN_TRANSIT':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'WARNING':
    case 'IN-TRANS':
    case 'BREAK_DUE':
    case 'STEER_HEAVY':
    case 'OVER_DRIVE':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'INFRINGING':
    case 'TRI_AXLE_OVERLOAD':
    case 'CRITICAL':
    case 'DAILY_LIMIT_WARN':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'IDLE':
    case 'LOADING':
    case 'TACHO_REST':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
