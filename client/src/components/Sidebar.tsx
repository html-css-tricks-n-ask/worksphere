import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  CreditCard,
  FileText,
  Settings,
  Globe,
  Timer,
  Calendar,
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/leave', label: 'Leave', icon: CalendarOff },
    { to: '/holidays', label: 'Holidays', icon: Calendar },
    { to: '/shifts', label: 'Shifts', icon: Timer },
    { to: '/payroll', label: 'Payroll Payouts', icon: CreditCard },
    { to: '/payroll/structures', label: 'Salary Structures', icon: CreditCard },
    { to: '/payroll/processing', label: 'Payroll Processing', icon: CreditCard },
    { to: '/reimbursements', label: 'Reimbursements', icon: CreditCard },
    { to: '/compensation', label: 'Compensation Revs', icon: CreditCard },
    { to: '/announcements', label: 'Announcements', icon: Globe },
    { to: '/audit', label: 'Audit Logs', icon: FileText },
    { to: '/settings', label: 'Company Settings', icon: Settings },
    { to: '/permissions', label: 'Permissions Matrix', icon: Settings },
    { to: '/company', label: 'Company Profile', icon: Globe },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg vibrant-gradient text-white font-bold text-lg">
              W
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              WorkSphere
            </span>
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group active:scale-[0.98]",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary pl-2 shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : 'JD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Jane Doe'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user ? user.email : 'jane.doe@worksphere.io'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
