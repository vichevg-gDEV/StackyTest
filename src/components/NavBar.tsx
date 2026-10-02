import React from 'react';
import { ActiveNavTab } from '../types';
import { LayoutDashboard, Map, Navigation, ClipboardList, Scale, FileText } from 'lucide-react';

interface NavBarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  pendingManifestsCount: number;
  alertsCount: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  setActiveTab,
  pendingManifestsCount,
  alertsCount,
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'CONSOLE',
      label: 'Primary Console',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'GLOBAL_MAP',
      label: 'TEN-T Map Engine',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'FLEET_ROUTING',
      label: 'Fleet Routing & Detours',
      icon: <Navigation className="w-4 h-4" />,
    },
    {
      id: 'DISPATCH_BOARD',
      label: 'Dispatch & Staging',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: pendingManifestsCount,
    },
    {
      id: 'CAPACITY_MATRIX',
      label: 'Capacity & Payload Matrix',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'REPORTS',
      label: 'Audit & Compliance',
      icon: <FileText className="w-4 h-4" />,
      badge: alertsCount > 0 ? alertsCount : undefined,
    },
  ];

  return (
    <nav className="w-full bg-white border-b border-slate-200 px-5 py-2 flex items-center gap-1.5 overflow-x-auto text-xs shadow-2xs">
      <span className="text-slate-400 font-semibold tracking-wider pr-2 select-none shrink-0 uppercase text-[11px]">
        Views:
      </span>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3.5 py-1.5 flex items-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
