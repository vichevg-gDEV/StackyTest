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
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; indexNumber: string; badge?: number }[] = [
    {
      id: 'CONSOLE',
      label: 'PRIMARY CONSOLE',
      indexNumber: '[0]',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'GLOBAL_MAP',
      label: 'GLOBAL MAP ENGINE',
      indexNumber: '[1]',
      icon: <Map className="w-3.5 h-3.5" />,
    },
    {
      id: 'FLEET_ROUTING',
      label: 'FLEET ROUTING',
      indexNumber: '[2]',
      icon: <Navigation className="w-3.5 h-3.5" />,
    },
    {
      id: 'DISPATCH_BOARD',
      label: 'DISPATCH & LOAD',
      indexNumber: '[3]',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      badge: pendingManifestsCount,
    },
    {
      id: 'CAPACITY_MATRIX',
      label: 'CAPACITY MATRIX',
      indexNumber: '[4]',
      icon: <Scale className="w-3.5 h-3.5" />,
    },
    {
      id: 'REPORTS',
      label: 'AUDIT & COMPLIANCE',
      indexNumber: '[5]',
      icon: <FileText className="w-3.5 h-3.5" />,
      badge: alertsCount > 0 ? alertsCount : undefined,
    },
  ];

  return (
    <nav className="w-full bg-[#181A1D] border-b border-[#2A2D32] px-4 py-1.5 flex items-center gap-1 overflow-x-auto text-xs font-tabular">
      <span className="text-[#8C929B] font-semibold tracking-wider pr-2 select-none shrink-0">
        NAV:
      </span>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`mta-btn px-3 py-1.5 flex items-center gap-2 whitespace-nowrap border shrink-0 transition-all ${
              isActive
                ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.15)]'
                : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B] hover:text-[#E1E4E8] hover:border-[#3e444d]'
            }`}
          >
            <span className={isActive ? 'text-[#FFFFFF]' : 'text-[#8C929B]'}>{item.indexNumber}</span>
            {item.icon}
            <span className="font-medium tracking-wide">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-[#7A3E3E] text-[#FFFFFF] font-mono">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
