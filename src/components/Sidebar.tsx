import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Camera, 
  UserPlus, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  UserX, 
  FileSpreadsheet, 
  Settings, 
  User, 
  LogOut,
  ScanFace,
  Activity,
  Bell,
  Shield,
  ShieldAlert,
  Cpu,
  GraduationCap,
  Video,
  Building,
  CalendarDays
} from 'lucide-react';
import { AppUser } from '../types';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: AppUser;
  onSignOut: () => void;
  unknownFacesCount: number;
}

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  user, 
  onSignOut, 
  unknownFacesCount 
}: SidebarProps) {
  
  const rawMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-dashboard', label: 'Faculty Dashboard', icon: GraduationCap, roles: ['Super Admin', 'Admin', 'Faculty'] },
    { id: 'student-dashboard', label: 'Student Dashboard', icon: GraduationCap, roles: ['Super Admin', 'Admin', 'Student'] },
    { id: 'live-recognition', label: 'Live Recognition', icon: Camera, badge: 'LIVE', roles: ['Super Admin', 'Admin', 'Security'] },
    { id: 'ai-security', label: 'AI Security Center', icon: ShieldAlert, badge: 'CORE', roles: ['Super Admin', 'Admin', 'Security'] },
    { id: 'camera-management', label: 'Camera Management', icon: Video, roles: ['Super Admin', 'Admin', 'Security'] },
    { id: 'classroom-management', label: 'Classroom & Rooms', icon: Building, roles: ['Super Admin', 'Admin', 'Faculty', 'Security'] },
    { id: 'timetable-attendance', label: 'Timetable & Periods', icon: CalendarDays, roles: ['Super Admin', 'Admin', 'Faculty', 'Student'] },
    { id: 'face-registration', label: 'Face Registration', icon: UserPlus, roles: ['Super Admin', 'Admin'] },
    { id: 'students', label: 'Student Management', icon: Users, roles: ['Super Admin', 'Admin', 'Faculty'] },
    { id: 'student-profile', label: 'Student Dossier', icon: User, roles: ['Student'] },
    { id: 'attendance', label: 'Attendance History', icon: CalendarCheck, roles: ['Super Admin', 'Admin', 'Faculty', 'Security', 'Student'] },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, roles: ['Super Admin', 'Admin', 'Faculty'] },
    { 
      id: 'unknown-faces', 
      label: 'Unknown Faces', 
      icon: UserX, 
      count: unknownFacesCount,
      roles: ['Super Admin', 'Admin', 'Security']
    },
    { id: 'reports', label: 'System Reports', icon: FileSpreadsheet, roles: ['Super Admin', 'Admin', 'Faculty'] },
    { id: 'super-admin', label: 'Super Admin Panel', icon: Cpu, roles: ['Super Admin'] },
    { id: 'system-monitoring', label: 'System Monitoring & Audit', icon: Activity, roles: ['Super Admin', 'Admin'] },
    { id: 'user-roles', label: 'Clearances & Roles', icon: Shield, roles: ['Super Admin'] },
    { id: 'notifications', label: 'Notification Center', icon: Bell, badge: 'NEW' },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['Super Admin', 'Admin'] },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  // Filter items based on user role
  const menuItems = rawMenuItems.filter(item => {
    if (!item.roles) return true; // general access
    return item.roles.includes(user.role);
  });

  return (
    <aside id="sidebar-container" className="w-64 bg-[#0B1120]/50 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ScanFace className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">
            FaceVision
          </span>
          <span className="text-blue-400 font-semibold text-xs ml-1 bg-blue-600/10 px-1.5 py-0.5 rounded border border-blue-500/20">
            AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
          Core Operations
        </div>
        
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              id={`sidebar-btn-${item.id}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'text-blue-400 bg-blue-600/10 border border-blue-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {/* Active Indicator Slider */}
              {isActive && (
                <motion.div 
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
              </div>

              {/* Badges */}
              {item.badge && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status indicator Box */}
      <div className="px-4 py-3">
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-xs font-semibold text-slate-300 uppercase">AI System Online</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic uppercase tracking-wider">YOLOv8 Engine @ 45FPS</p>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/30">
        <div className="flex items-center space-x-3 min-w-0">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-inner"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
          </div>
        </div>
        <button 
          id="btn-signout"
          onClick={onSignOut}
          title="Sign Out"
          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
