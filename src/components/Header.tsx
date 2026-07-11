import { useState, useEffect, ChangeEvent } from 'react';
import { 
  Bell, 
  Search, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';
import { AppUser, ActivityLog } from '../types';

interface HeaderProps {
  currentPageTitle: string;
  user: AppUser;
  activities: ActivityLog[];
  onSearch: (query: string) => void;
  systemHealth: 'optimal' | 'warning' | 'degraded';
  onNavigate?: (page: string) => void;
}

export default function Header({ 
  currentPageTitle, 
  user, 
  activities, 
  onSearch,
  systemHealth,
  onNavigate
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notificationList, setNotificationList] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Initial notifications loaded from recent system activities
    setNotificationList(activities.slice(0, 5));
  }, [activities]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' PST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearNotification = (id: string) => {
    setNotificationList(prev => prev.filter(n => n.id !== id));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  };

  const healthColor = {
    optimal: 'text-green-400 bg-green-500/10 border-green-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    degraded: 'text-red-400 bg-red-500/10 border-red-500/20'
  }[systemHealth];

  return (
    <header id="top-navbar" className="h-16 bg-[#0B1120]/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Current Page Indicator */}
      <div className="flex items-center space-x-3">
        <h1 className="text-white font-semibold text-lg tracking-tight">
          {currentPageTitle}
        </h1>
        <span className="h-4 w-[1px] bg-slate-800"></span>
        
        {/* System Health Status Indicator */}
        <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${healthColor}`}>
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              systemHealth === 'optimal' ? 'bg-green-400' : systemHealth === 'warning' ? 'bg-amber-400' : 'bg-red-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              systemHealth === 'optimal' ? 'bg-green-500' : systemHealth === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            }`}></span>
          </div>
          <span>System: {systemHealth.toUpperCase()}</span>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center space-x-6">
        {/* Modern Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search students, logs, IDs..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full bg-[#111827] text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors focus:bg-[#111827]/90"
          />
        </div>

        {/* Live System Digital Clock */}
        <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs text-blue-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="tracking-widest font-bold">{time || '09:30:13 PST'}</span>
        </div>

        {/* Security Shield Info */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-[11px]">FIPS 201 Compliant</span>
        </div>

        {/* Notifications Icon with active badge count */}
        <div className="relative">
          <button
            id="notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all border border-transparent hover:border-slate-800 cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {notificationList.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-semibold text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {notificationList.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div id="notifications-panel" className="absolute right-0 mt-3 w-80 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">System Broadcasts</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {notificationList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    No active notifications
                  </div>
                ) : (
                  notificationList.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="px-4 py-3 hover:bg-slate-800/40 border-b border-slate-800/40 last:border-0 flex items-start space-x-3 group"
                    >
                      {/* Notification Icons based on Action status */}
                      <div className="mt-0.5">
                        {notif.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {notif.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {notif.status === 'danger' && <Flame className="w-4 h-4 text-red-500" />}
                        {notif.status === 'info' && <Cpu className="w-4 h-4 text-blue-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-gray-200 truncate">{notif.action}</p>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.details}</p>
                      </div>

                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-800 text-center bg-slate-950/40">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigate) onNavigate('notifications');
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-all w-full text-center cursor-pointer block"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
