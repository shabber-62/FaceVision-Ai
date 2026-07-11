import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  BellOff, 
  AlertOctagon, 
  ShieldAlert, 
  WifiOff, 
  Database, 
  Server, 
  Cpu, 
  UserCheck, 
  UserX, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Settings2, 
  FileText, 
  Search, 
  Trash2, 
  Archive, 
  CheckCircle, 
  Eye, 
  RefreshCw, 
  Mail, 
  Smartphone, 
  Radio, 
  Laptop, 
  SlidersHorizontal, 
  Check, 
  Clock, 
  Plus, 
  HelpCircle, 
  FileDown, 
  Activity, 
  ArrowRight, 
  Play, 
  Pause, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  CheckCheck,
  ChevronRight,
  Filter,
  X,
  Sliders,
  Send,
  Lock
} from 'lucide-react';

// Custom Notification interface
interface NotificationItem {
  id: string;
  category: 'Attendance' | 'AI Recognition' | 'Unknown Faces' | 'Camera Status' | 'Server Status' | 'Database Alerts' | 'Security Alerts' | 'User Activity' | 'Reports' | 'System Updates';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  timestamp: string;
  relatedUser?: string;
  relatedCamera?: string;
  read: boolean;
  archived: boolean;
}

// Live stream event interface
interface LiveStreamEvent {
  id: string;
  timestamp: string;
  type: 
    | 'Face Detected' 
    | 'Face Recognized' 
    | 'Attendance Marked' 
    | 'Unknown Person Detected' 
    | 'Student Registered' 
    | 'Camera Connected' 
    | 'Camera Disconnected' 
    | 'Database Connected' 
    | 'Database Error' 
    | 'AI Model Started' 
    | 'AI Model Stopped';
  details: string;
  camera?: string;
}

// User activity log interface
interface UserActivity {
  id: string;
  timestamp: string;
  user: string;
  action: 'User Login' | 'Logout' | 'Student Added' | 'Student Deleted' | 'Settings Changed' | 'Attendance Updated' | 'Report Generated' | 'Role Changed';
  status: 'success' | 'warning' | 'danger' | 'info';
  ipAddress: string;
  details: string;
}

export default function NotificationsView() {
  // Navigation: Sub-view management
  // 'feed' = Operational Feed + Live Event stream + Critical Alerts panel
  // 'logs' = User Activity Logs table
  // 'preferences' = Channel & severity settings
  const [activeTab, setActiveTab] = useState<'feed' | 'logs' | 'preferences'>('feed');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, read, unread
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all'); // all, today, yesterday, week

  // Selected Notification for Detail Viewer Modal
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<NotificationItem | null>(null);

  // Loading skeleton state (simulates quick refresh of list data)
  const [isLoading, setIsLoading] = useState(false);

  // Notification main database
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOT-101',
      category: 'Unknown Faces',
      priority: 'Critical',
      title: 'Anomalous Threat Intercepted',
      description: 'An unidentified facial pattern was spotted repeating 3 times at the Cyber Lab entrance within a 5-minute interval. Similarity threshold matched is below 41%.',
      timestamp: '2026-07-11T11:15:30Z',
      relatedCamera: 'Lobby Entrance (Cam-01)',
      relatedUser: 'Unknown Visitor',
      read: false,
      archived: false,
    },
    {
      id: 'NOT-102',
      category: 'Camera Status',
      priority: 'High',
      title: 'Surveillance Node Offline',
      description: 'High-speed camera Feed "Cam-03" (Robotics Lab) disconnected from local AI ingress channel. Ping loss verified over 4500ms.',
      timestamp: '2026-07-11T10:42:15Z',
      relatedCamera: 'Robotics Lab (Cam-03)',
      read: false,
      archived: false,
    },
    {
      id: 'NOT-103',
      category: 'Security Alerts',
      priority: 'Critical',
      title: 'Multiple Failed Recognitions',
      description: 'Face verification failed continuously for 5 attempts on terminal Bio-04. Security latch remains engaged.',
      timestamp: '2026-07-11T09:30:00Z',
      relatedCamera: 'Bio-Computing (Cam-04)',
      relatedUser: 'John Doe (Attempted)',
      read: false,
      archived: false,
    },
    {
      id: 'NOT-104',
      category: 'Attendance',
      priority: 'Medium',
      title: 'Attendance Batch Synchronized',
      description: '98 course attendance records successfully committed to Academic DBMS. Standard semester indices updated.',
      timestamp: '2026-07-11T08:15:22Z',
      read: true,
      archived: false,
    },
    {
      id: 'NOT-105',
      category: 'Server Status',
      priority: 'Low',
      title: 'Storage Capacity Alert',
      description: 'Biometric raw snapshot container is approaching 88% allocated space (1.2TB free). Automatic compression cron-job running.',
      timestamp: '2026-07-11T06:12:00Z',
      read: false,
      archived: false,
    },
    {
      id: 'NOT-106',
      category: 'Database Alerts',
      priority: 'High',
      title: 'Replication Sequence Interrupted',
      description: 'Primary Firestore replication node reported a read-after-write sync variance. Resolving through secondary hot-backup logs.',
      timestamp: '2026-07-10T18:40:11Z',
      read: true,
      archived: false,
    },
    {
      id: 'NOT-107',
      category: 'AI Recognition',
      priority: 'Low',
      title: 'Landmark Tuning Configured',
      description: 'System reweighted facial features weight matrix. Active detection accuracy metrics improved by +0.22%.',
      timestamp: '2026-07-10T14:22:18Z',
      read: true,
      archived: false,
    },
    {
      id: 'NOT-108',
      category: 'Reports',
      priority: 'Medium',
      title: 'Quarterly Ingress Audit Ready',
      description: 'Intelligent reports compiler completed processing the Q2 Biometric logs. Document registered with security hash.',
      timestamp: '2026-07-10T09:00:00Z',
      read: true,
      archived: true,
    },
    {
      id: 'NOT-109',
      category: 'System Updates',
      priority: 'Low',
      title: 'YOLOv8 Weights Upgrade',
      description: 'Model network successfully downloaded v2.4.1 anchors. Neural engine has rebooted hot-reloaded weights without frames loss.',
      timestamp: '2026-07-09T16:30:00Z',
      read: true,
      archived: false,
    },
    {
      id: 'NOT-110',
      category: 'User Activity',
      priority: 'Medium',
      title: 'Security Clearance Override',
      description: 'Operator Alice.Smith granted administrative override access to student records in Division Alpha.',
      timestamp: '2026-07-09T11:10:05Z',
      relatedUser: 'Alice Smith (Operator)',
      read: true,
      archived: false,
    }
  ]);

  // Real-time events stream list with a simulation switch
  const [streamEvents, setStreamEvents] = useState<LiveStreamEvent[]>([
    { id: 'EV-301', timestamp: '11:22:50', type: 'Face Detected', details: 'Spatial vector mapped on Cam-01 entrance scanner.', camera: 'Cam-01' },
    { id: 'EV-302', timestamp: '11:22:45', type: 'Face Recognized', details: 'Verified ID: John Connor with 98.6% confidence.', camera: 'Cam-01' },
    { id: 'EV-303', timestamp: '11:22:42', type: 'Attendance Marked', details: 'Check-in recorded for John Connor (Engineering Dept).', camera: 'System' },
    { id: 'EV-304', timestamp: '11:21:15', type: 'AI Model Started', details: 'YOLOv8-Face initialized with confidence boundary @ 90%.', camera: 'GPU Node 1' },
    { id: 'EV-305', timestamp: '11:18:22', type: 'Student Registered', details: 'Enrolled Sarah Connor biometrics snapshots successfully.', camera: 'Enroller Node' },
    { id: 'EV-306', timestamp: '11:15:30', type: 'Unknown Person Detected', details: 'Threat trigger tripped at Cyber Lab entrance. Capture saved.', camera: 'Cam-01' },
    { id: 'EV-307', timestamp: '11:02:11', type: 'Camera Connected', details: 'Stream feed established on Cam-02 (Central Hallway) at 60 FPS.', camera: 'Cam-02' }
  ]);

  const [isStreaming, setIsStreaming] = useState(true);

  // User activity logs table
  const [activityLogs, setActivityLogs] = useState<UserActivity[]>([
    { id: 'ACT-501', timestamp: '2026-07-11 11:20:15', user: 'admin@facevision.ai', action: 'User Login', status: 'success', ipAddress: '192.168.1.15', details: 'Administrator logged in from Chrome browser (Linux).' },
    { id: 'ACT-502', timestamp: '2026-07-11 10:45:30', user: 'admin@facevision.ai', action: 'Student Added', status: 'success', ipAddress: '192.168.1.15', details: 'Registered student: Marcus Wright (ID: FV-2026-092) under Computer Vision.' },
    { id: 'ACT-503', timestamp: '2026-07-11 10:11:12', user: 'jane.smith@facevision.ai', action: 'Attendance Updated', status: 'info', ipAddress: '10.0.12.85', details: 'Manually verified attendance record for Kate Brewster on 2026-07-10.' },
    { id: 'ACT-504', timestamp: '2026-07-11 09:05:00', user: 'admin@facevision.ai', action: 'Settings Changed', status: 'warning', ipAddress: '192.168.1.15', details: 'Adjusted detection intervals from 500ms to 1000ms to throttle GPU load.' },
    { id: 'ACT-505', timestamp: '2026-07-11 08:30:22', user: 'system@facevision.ai', action: 'Report Generated', status: 'success', ipAddress: 'Localhost', details: 'Weekly Ingress Audit report compiled automatically for All Divisions.' },
    { id: 'ACT-506', timestamp: '2026-07-10 17:55:40', user: 'security-director@academy.edu', action: 'Role Changed', status: 'danger', ipAddress: '10.0.4.52', details: 'Changed user security clearance level of Kyle.Reese from Viewer to Operator.' },
    { id: 'ACT-507', timestamp: '2026-07-10 15:40:11', user: 'jane.smith@facevision.ai', action: 'Student Deleted', status: 'danger', ipAddress: '10.0.12.85', details: 'Purged biometric snapshot repository and folder for obsolete student ID: FV-2025-014.' },
    { id: 'ACT-508', timestamp: '2026-07-10 09:00:00', user: 'jane.smith@facevision.ai', action: 'Logout', status: 'info', ipAddress: '10.0.12.85', details: 'Standard session termination completed.' }
  ]);

  // Channel notification switches
  const [preferences, setPreferences] = useState({
    email: { enabled: true, address: 'shabberahammad10@gmail.com' },
    push: { enabled: true, device: 'Main Operations Control Tablet' },
    sms: { enabled: false, phone: '+1 (555) 304-2026' },
    desktop: { enabled: true },
    attendance: { enabled: true, threshold: 'Any late/absent event' },
    unknownFace: { enabled: true, instantAlert: true, thresholdConfidence: 85 },
    cameraAlerts: { enabled: true, heartbeatInterval: 10 }, // seconds
    securityAlerts: { enabled: true, lockdownOnAnomaly: false },
    reports: { enabled: true, delivery: 'Weekly Summaries' }
  });

  // Toasts notification inside the viewport
  const [localToasts, setLocalToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const triggerToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setLocalToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setLocalToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Critical Alerts list widget (unresolved issues)
  const criticalAlerts = useMemo(() => [
    { title: 'Unknown Visitor', desc: 'Lobby Entrance Cam-01 intercepted unidentified face 3x.', time: '10m ago', icon: UserX, color: 'text-rose-400', border: 'border-rose-950/50 bg-rose-950/10' },
    { title: 'Camera Offline', desc: 'Robotics Lab camera Cam-03 is unresponsive.', time: '40m ago', icon: WifiOff, color: 'text-amber-400', border: 'border-amber-950/50 bg-amber-950/10' },
    { title: 'Multiple Failed Recognitions', desc: 'Terminal Bio-04 reported continuous mismatches.', time: '1h ago', icon: AlertOctagon, color: 'text-rose-400', border: 'border-rose-950/50 bg-rose-950/10' },
    { title: 'Database Sync Variance', desc: 'Firestore index replication failed to complete handshake.', time: '17h ago', icon: Database, color: 'text-amber-400', border: 'border-amber-950/50 bg-amber-950/10' },
    { title: 'Server Space Critical', desc: 'Snapshots disk storage is at 88% limit.', time: '5h ago', icon: Server, color: 'text-blue-400', border: 'border-blue-950/50 bg-blue-950/10' }
  ], []);

  // Simulator for Live Event Stream
  useEffect(() => {
    if (!isStreaming) return;

    const eventTemplates = [
      { type: 'Face Detected' as const, details: 'Transient spatial tracking vector initialized on Cam-02.', camera: 'Cam-02' },
      { type: 'Face Recognized' as const, details: 'Verified ID: Elena Rostova with 99.1% similarity score.', camera: 'Cam-02' },
      { type: 'Attendance Marked' as const, details: 'Registered late check-in for Elena Rostova.', camera: 'System' },
      { type: 'Unknown Person Detected' as const, details: 'Unregistered face structure intercepted on Cam-01.', camera: 'Cam-01' },
      { type: 'Student Registered' as const, details: 'Updated biometric templates index for Marcus Wright.', camera: 'Enroller Node' },
      { type: 'Camera Connected' as const, details: 'Camera Cam-04 completed SSL handshakes.', camera: 'Cam-04' },
      { type: 'Database Connected' as const, details: 'Ingress node secured persistent pool connection.', camera: 'Database' }
    ];

    const interval = setInterval(() => {
      const randomTemplate = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newEvent: LiveStreamEvent = {
        id: `EV-${Date.now()}`,
        timestamp: timeStr,
        ...randomTemplate
      };

      setStreamEvents(prev => [newEvent, ...prev.slice(0, 15)]);

      // Occasionally add matching operational notification
      if (randomTemplate.type === 'Unknown Person Detected' && Math.random() > 0.4) {
        const newNotif: NotificationItem = {
          id: `NOT-${Date.now()}`,
          category: 'Unknown Faces',
          priority: 'High',
          title: 'Unknown Visitor Spotted',
          description: 'An unidentified entity walked past the entrance scanner without card validation matching.',
          timestamp: now.toISOString(),
          relatedCamera: 'Lobby Entrance (Cam-01)',
          read: false,
          archived: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        triggerToast('High-Priority Unknown Face incident logged to active board.', 'warning');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Compute stats metrics dynamically
  const stats = useMemo(() => {
    const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
    const criticalCount = notifications.filter(n => n.priority === 'Critical' && !n.archived).length;
    const systemCount = notifications.filter(n => (n.category === 'Server Status' || n.category === 'Database Alerts' || n.category === 'System Updates') && !n.archived).length;
    const attendanceCount = notifications.filter(n => n.category === 'Attendance' && !n.archived).length;
    const unknownCount = notifications.filter(n => n.category === 'Unknown Faces' && !n.archived).length;
    const todayEventsCount = streamEvents.length;

    return {
      unread: unreadCount,
      critical: criticalCount,
      system: systemCount,
      attendance: attendanceCount,
      unknown: unknownCount,
      todayEvents: todayEventsCount
    };
  }, [notifications, streamEvents]);

  // Filter and search computation for Notification feed list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Archive filter (We don't show archived items in active feed)
      if (n.archived) return false;

      // Category filter
      if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;

      // Priority filter
      if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;

      // Status filter
      if (selectedStatus === 'unread' && n.read) return false;
      if (selectedStatus === 'read' && !n.read) return false;

      // Camera filter
      if (selectedCamera !== 'all' && n.relatedCamera && !n.relatedCamera.includes(selectedCamera)) return false;

      // User filter
      if (selectedUser !== 'all' && n.relatedUser && !n.relatedUser.includes(selectedUser)) return false;

      // Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query) ||
          (n.relatedUser && n.relatedUser.toLowerCase().includes(query)) ||
          (n.relatedCamera && n.relatedCamera.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [notifications, selectedCategory, selectedPriority, selectedStatus, selectedCamera, selectedUser, searchQuery]);

  // Filter and search computation for User Activity Logs table
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const q = searchQuery.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    });
  }, [activityLogs, searchQuery]);

  // Actions handlers
  const markAllAsRead = () => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setIsLoading(false);
      triggerToast('All operational notification vectors marked as read.', 'success');
    }, 600);
  };

  const clearAllNotifications = () => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, archived: true })));
      setIsLoading(false);
      triggerToast('Cleared active notification board. Items archived to historical database.', 'info');
    }, 500);
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const nextState = !n.read;
        triggerToast(`Notification marked as ${nextState ? 'read' : 'unread'}.`, 'info');
        return { ...n, read: nextState };
      }
      return n;
    }));
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        triggerToast('Notification archived to system logs.', 'info');
        return { ...n, archived: true };
      }
      return n;
    }));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast('Notification deleted permanently from node memory.', 'warning');
  };

  const exportNotificationLogs = () => {
    triggerToast('Compiling secure JSON schema payload for notifications...', 'info');
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notifications, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `facevision_notification_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('Secure notification logs export saved to local system downloads.', 'success');
    }, 1200);
  };

  const togglePreferenceChan = (channel: 'email' | 'push' | 'sms' | 'desktop') => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled
      }
    }));
    triggerToast(`Configured notification channel ${channel.toUpperCase()} dispatch status.`, 'success');
  };

  const saveSettingsParams = (e: any) => {
    e.preventDefault();
    triggerToast('Updating alert severity weights and delivery endpoints...', 'info');
    setTimeout(() => {
      triggerToast('SaaS dispatch configuration locked into system weights.', 'success');
    }, 800);
  };

  // Helper to resolve icon based on notification category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Attendance': return UserCheck;
      case 'AI Recognition': return Cpu;
      case 'Unknown Faces': return UserX;
      case 'Camera Status': return WifiOff;
      case 'Server Status': return Server;
      case 'Database Alerts': return Database;
      case 'Security Alerts': return ShieldAlert;
      case 'User Activity': return User;
      case 'Reports': return FileText;
      case 'System Updates': return RefreshCw;
      default: return Bell;
    }
  };

  // Helper to resolve priority color indicators
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'Low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border border-transparent';
    }
  };

  return (
    <div id="notifications-center-workspace" className="space-y-6 pb-12 relative">
      
      {/* IMMERSIVE TOAST LISTENER VIEW */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {localToasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${
                t.type === 'warning' 
                  ? 'bg-rose-950/85 border-rose-800 text-rose-300 shadow-rose-500/5'
                  : t.type === 'info'
                    ? 'bg-slate-900/95 border-slate-750 text-slate-300'
                    : 'bg-emerald-950/85 border-emerald-800 text-emerald-300 shadow-emerald-500/5'
              }`}
            >
              <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${
                t.type === 'warning' ? 'text-rose-400 animate-bounce' : t.type === 'info' ? 'text-blue-400' : 'text-emerald-400'
              }`} />
              <div className="text-xs font-mono leading-relaxed">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Bell className="w-4 h-4 text-blue-400 animate-swing" />
            </span>
            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-bold">Real-time Telemetry Audits</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-400">Monitor real-time alerts, AI events, attendance notifications, and system activities.</p>
        </div>

        {/* Header control shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={markAllAsRead}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={clearAllNotifications}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <BellOff className="w-4 h-4 text-rose-400" />
            <span>Clear Notifications</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('preferences');
              triggerToast('Configured to security channels preference desk.', 'info');
            }}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Settings2 className="w-4 h-4 text-purple-400" />
            <span>Notification Settings</span>
          </button>

          <button
            onClick={exportNotificationLogs}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/15"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Export Logs (JSON)</span>
          </button>
        </div>
      </div>

      {/* PREMIUM STATS MATRIX SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* STAT 1: Unread Notifications */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <Bell className="w-12 h-12 text-blue-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">Unread Alerts</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-white">{stats.unread}</span>
              <span className="text-[9px] font-bold text-blue-400 px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/10">Active</span>
            </div>
            <p className="text-[9px] text-slate-500">Unread active indices in queue</p>
          </div>
        </div>

        {/* STAT 2: Critical Alerts */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-12 h-12 text-rose-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">Critical Incidents</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-rose-400">{stats.critical}</span>
              <span className="text-[9px] font-bold text-rose-400 px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/10 animate-pulse">Critical</span>
            </div>
            <p className="text-[9px] text-slate-500">Require immediate intervention</p>
          </div>
        </div>

        {/* STAT 3: System Notifications */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <Server className="w-12 h-12 text-amber-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">System Alerts</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-amber-400">{stats.system}</span>
              <span className="text-[9px] font-bold text-amber-500 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/10">Engine</span>
            </div>
            <p className="text-[9px] text-slate-500">Hardware & cloud node status</p>
          </div>
        </div>

        {/* STAT 4: Attendance Alerts */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <UserCheck className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">Attendance Alerts</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-emerald-400">{stats.attendance}</span>
              <span className="text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/10">Ingress</span>
            </div>
            <p className="text-[9px] text-slate-500">Student late/absent notifications</p>
          </div>
        </div>

        {/* STAT 5: Unknown Face Alerts */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <UserX className="w-12 h-12 text-purple-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">Anomalous Faces</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-purple-400">{stats.unknown}</span>
              <span className="text-[9px] font-bold text-purple-400 px-1.5 py-0.5 bg-purple-500/10 rounded border border-purple-500/10">Threat</span>
            </div>
            <p className="text-[9px] text-slate-500">Unregistered biometric captures</p>
          </div>
        </div>

        {/* STAT 6: Today's Events */}
        <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition-transform">
            <Activity className="w-12 h-12 text-teal-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">Stream Cadence</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-teal-400">{stats.todayEvents}</span>
              <span className="text-[9px] font-bold text-teal-400 px-1.5 py-0.5 bg-teal-500/10 rounded border border-teal-500/10 animate-pulse">Ticking</span>
            </div>
            <p className="text-[9px] text-slate-500">Real-time logs captured today</p>
          </div>
        </div>

      </div>

      {/* SUB-VIEW TABS BAR */}
      <div className="flex border-b border-slate-850 p-1 bg-slate-950/20 rounded-2xl border border-slate-900">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'feed' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-[#111827]/30'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Operational Alarm Feed</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('logs');
            triggerToast('Switched to administrative auditing logs.', 'info');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'logs' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-[#111827]/30'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>User Activity Log Table ({activityLogs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('preferences');
            triggerToast('Switched to notification delivery endpoints.', 'info');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'preferences' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-[#111827]/30'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Preferences Desk</span>
        </button>
      </div>

      {/* MAIN LAYOUT WRAPPER ANIMATED */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OPERATIONAL FEED WITH LIVE TIMELINE & ALERTS */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* LEFT FILTER BAR (3 Columns) */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* CATEGORIES BUTTON FILTER */}
              <div className="bg-[#111827]/55 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Template Categories</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'all', label: 'All Notifications', icon: Bell, count: notifications.length },
                    { id: 'Attendance', label: 'Attendance', icon: UserCheck, count: notifications.filter(n => n.category === 'Attendance').length },
                    { id: 'AI Recognition', label: 'AI Recognition', icon: Cpu, count: notifications.filter(n => n.category === 'AI Recognition').length },
                    { id: 'Unknown Faces', label: 'Unknown Faces', icon: UserX, count: notifications.filter(n => n.category === 'Unknown Faces').length },
                    { id: 'Camera Status', label: 'Camera Status', icon: WifiOff, count: notifications.filter(n => n.category === 'Camera Status').length },
                    { id: 'Server Status', label: 'Server Status', icon: Server, count: notifications.filter(n => n.category === 'Server Status').length },
                    { id: 'Database Alerts', label: 'Database Alerts', icon: Database, count: notifications.filter(n => n.category === 'Database Alerts').length },
                    { id: 'Security Alerts', label: 'Security Alerts', icon: ShieldAlert, count: notifications.filter(n => n.category === 'Security Alerts').length },
                    { id: 'User Activity', label: 'User Activity', icon: User, count: notifications.filter(n => n.category === 'User Activity').length },
                    { id: 'Reports', label: 'Reports', icon: FileText, count: notifications.filter(n => n.category === 'Reports').length },
                    { id: 'System Updates', label: 'System Updates', icon: RefreshCw, count: notifications.filter(n => n.category === 'System Updates').length }
                  ].map(cat => {
                    const CatIcon = cat.icon;
                    const isSel = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          triggerToast(`Filtered feed by ${cat.label} category.`, 'info');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left border cursor-pointer ${
                          isSel 
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 font-bold' 
                            : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-[#111827]/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <CatIcon className={`w-4 h-4 ${isSel ? 'text-blue-400' : 'text-slate-500'}`} />
                          <span>{cat.label}</span>
                        </div>
                        {cat.count > 0 && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isSel ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-900 text-slate-500'
                          }`}>
                            {cat.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DENSE TELEMETRY FILTER PANEL */}
              <div className="bg-[#111827]/55 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                  <Filter className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Hardware & Severity Matrix</span>
                </div>

                <div className="space-y-3.5">
                  {/* Filter Priority */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Priority Tier</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Tiers</option>
                      <option value="Critical">🚨 Critical Only</option>
                      <option value="High">⚠️ High Tier</option>
                      <option value="Medium">⚡ Medium Tier</option>
                      <option value="Low">🌱 Low Info</option>
                    </select>
                  </div>

                  {/* Filter Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Read Vector State</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All States</option>
                      <option value="unread">Unread Alarms</option>
                      <option value="read">Acknowledged Alarms</option>
                    </select>
                  </div>

                  {/* Filter Camera */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Terminal Node IP</label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All CCTV Channels</option>
                      <option value="Cam-01">Cam-01 (Lobby entrance)</option>
                      <option value="Cam-03">Cam-03 (Robotics Lab)</option>
                      <option value="Cam-04">Cam-04 (Bio lab)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                      setSelectedStatus('all');
                      setSelectedCamera('all');
                      setSearchQuery('');
                      triggerToast('All search filters reset.', 'info');
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-850 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset Parameters</span>
                  </button>
                </div>
              </div>

            </div>

            {/* CENTER ALARM FEED (6 Columns) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* FILTER SEARCH INPUT HEADER */}
              <div className="bg-[#111827]/55 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alarm titles, biometric descriptions, camera locations..."
                  className="w-full bg-transparent text-slate-200 text-xs focus:outline-none placeholder-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* LIST FEED AREA */}
              <div className="space-y-3">
                {isLoading ? (
                  /* LOADING SKELETONS */
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-[#111827]/30 border border-slate-850 rounded-2xl p-4.5 animate-pulse space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800" />
                          <div className="space-y-1">
                            <div className="h-3 w-28 bg-slate-800 rounded" />
                            <div className="h-2 w-16 bg-slate-850 rounded" />
                          </div>
                        </div>
                        <div className="h-5 w-12 bg-slate-800 rounded-full" />
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded" />
                      <div className="h-2.5 w-3/4 bg-slate-800 rounded" />
                      <div className="flex gap-2 pt-1">
                        <div className="h-4 w-16 bg-slate-850 rounded-md" />
                        <div className="h-4 w-20 bg-slate-850 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : filteredNotifications.length === 0 ? (
                  /* NO RESULTS COMPONENT */
                  <div className="bg-[#111827]/35 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                      <BellOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h4 className="text-white font-extrabold text-sm">Silent Operational Horizon</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">No pending active notifications found matching your parameters or active filters in database indexes.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedPriority('all');
                        setSelectedStatus('all');
                        setSelectedCamera('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                    >
                      <span>Clear Search Criteria</span>
                    </button>
                  </div>
                ) : (
                  /* ACTIVE NOTIFICATION TILES */
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map(notif => {
                      const CategoryIcon = getCategoryIcon(notif.category);
                      const priorityColorClasses = getPriorityClasses(notif.priority);
                      return (
                        <motion.div
                          id={`notification-tile-${notif.id}`}
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className={`border rounded-2xl p-4.5 transition-all relative overflow-hidden group ${
                            notif.read 
                              ? 'bg-[#111827]/25 border-slate-850/60' 
                              : 'bg-gradient-to-r from-slate-900/90 to-[#111827]/80 border-slate-750/80 shadow-[0_4px_20px_rgba(30,41,59,0.15)]'
                          }`}
                        >
                          {/* Left visual blue dot for unread status */}
                          {!notif.read && (
                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
                          )}

                          <div className="space-y-3.5">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                  notif.read 
                                    ? 'bg-slate-950 border-slate-800 text-slate-500' 
                                    : 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                                }`}>
                                  <CategoryIcon className="w-4.5 h-4.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{notif.category}</span>
                                    <span className="text-slate-600 text-[10px]">•</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400">{notif.id}</span>
                                  </div>
                                  <h3 className={`text-xs font-extrabold truncate ${notif.read ? 'text-slate-400 font-semibold' : 'text-white'}`}>
                                    {notif.title}
                                  </h3>
                                </div>
                              </div>

                              {/* Priority badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold shrink-0 ${priorityColorClasses}`}>
                                {notif.priority}
                              </span>
                            </div>

                            {/* Description paragraph */}
                            <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-300'}`}>
                              {notif.description}
                            </p>

                            {/* Badges and tags row */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[9px] font-mono">
                              
                              <span className="flex items-center space-x-1.5 text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </span>

                              {notif.relatedCamera && (
                                <span className="px-2 py-0.5 bg-slate-950 border border-slate-850/60 rounded text-slate-400 flex items-center space-x-1">
                                  <Radio className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="truncate max-w-[120px]">{notif.relatedCamera}</span>
                                </span>
                              )}

                              {notif.relatedUser && (
                                <span className="px-2 py-0.5 bg-slate-950 border border-slate-850/60 rounded text-slate-400 flex items-center space-x-1">
                                  <User className="w-3 h-3 text-purple-400 shrink-0" />
                                  <span className="truncate max-w-[100px]">{notif.relatedUser}</span>
                                </span>
                              )}

                            </div>

                            {/* Action Operations Tray */}
                            <div className="flex items-center justify-between border-t border-slate-850/60 pt-3 mt-1 text-xs">
                              
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleReadStatus(notif.id)}
                                  title={notif.read ? "Mark Unread" : "Mark Read"}
                                  className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                    notif.read
                                      ? 'bg-slate-950 border-slate-850 text-slate-500 hover:text-white hover:bg-slate-900'
                                      : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{notif.read ? 'Unread' : 'Ack Alert'}</span>
                                </button>

                                <button
                                  onClick={() => setSelectedDetailNotification(notif)}
                                  className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Inspect</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => archiveNotification(notif.id)}
                                  title="Archive Notification"
                                  className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => deleteNotification(notif.id)}
                                  title="Delete Permanent"
                                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

            </div>

            {/* RIGHT SIDEBAR (3 Columns): CRITICAL ALERTS + LIVE EVENT STREAM */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* CRITICAL ALERT PANEL */}
              <div className="bg-[#111827]/55 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">Critical Live Panel</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{criticalAlerts.length} issues</span>
                </div>

                <div className="space-y-2.5">
                  {criticalAlerts.map((alert, idx) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${alert.border}`}
                      >
                        <AlertIcon className={`w-4 h-4 shrink-0 mt-0.5 ${alert.color}`} />
                        <div className="space-y-0.5 text-xs min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-white truncate text-[11px]">{alert.title}</span>
                            <span className="text-[8px] text-slate-500 font-mono font-bold shrink-0">{alert.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{alert.desc}</p>
                          <div className="pt-1.5 flex gap-1.5">
                            <button
                              onClick={() => {
                                triggerToast(`Opening threat analysis room for: ${alert.title}`, 'info');
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 text-[8px] font-mono font-extrabold text-slate-300 hover:text-white rounded border border-slate-800 transition-all cursor-pointer"
                            >
                              Investigate
                            </button>
                            <button
                              onClick={() => {
                                triggerToast(`Anomalous trigger "${alert.title}" silenced.`, 'info');
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 text-[8px] font-mono font-extrabold text-slate-500 hover:text-slate-300 rounded transition-all cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE EVENT TIMELINE STREAM */}
              <div className="bg-[#111827]/55 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">Live Event Stream</span>
                  </div>

                  {/* Play/Pause controls */}
                  <button
                    onClick={() => {
                      setIsStreaming(!isStreaming);
                      triggerToast(isStreaming ? 'Paused live operational telemetry stream.' : 'Reconnected live telemetry stream.', 'info');
                    }}
                    title={isStreaming ? "Pause Live Event Stream" : "Resume Live Event Stream"}
                    className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>

                {/* Vertical Timeline */}
                <div className="relative border-l border-slate-850 pl-4.5 space-y-4 max-h-[350px] overflow-y-auto scrollbar-none">
                  {streamEvents.map((evt, idx) => (
                    <div key={evt.id} className="relative group text-xs text-left">
                      {/* Active ticking dot anchor */}
                      <span className={`absolute -left-[23.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                        idx === 0 
                          ? 'bg-emerald-400 border-[#111827] animate-ping' 
                          : 'bg-slate-700 border-[#111827]'
                      }`} />
                      
                      {idx === 0 && (
                        <span className="absolute -left-[23.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#111827]" />
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-200 text-[11px]">{evt.type}</span>
                          <span className="text-[9px] font-mono text-slate-500">{evt.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">{evt.details}</p>
                        {evt.camera && (
                          <span className="inline-block mt-1 text-[8px] font-mono text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">
                            {evt.camera}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest italic animate-pulse">
                    {isStreaming ? '● Listening for spatial node updates' : '■ Streaming timeline paused'}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: USER ACTIVITY AUDITS TABLE */}
        {activeTab === 'logs' && (
          <motion.div
            key="logs-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Table Controls */}
            <div className="bg-[#111827]/55 border border-slate-800/80 p-4.5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-850/60 max-w-md w-full">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter audit logs by operator, actions, target student details..."
                  className="w-full bg-transparent text-slate-200 text-xs focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerToast('Refreshed administrative security audits list.', 'success');
                  }}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Refresh DB</span>
                </button>

                <button
                  onClick={() => {
                    triggerToast('Downloading TSV Audit record sheet...', 'info');
                  }}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Ledger</span>
                </button>
              </div>
            </div>

            {/* Table layout container */}
            <div className="bg-[#111827]/55 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950/40 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                      <th className="py-4 px-5 font-bold">Audit ID</th>
                      <th className="py-4 px-5 font-bold">Timestamp</th>
                      <th className="py-4 px-5 font-bold">Operator</th>
                      <th className="py-4 px-5 font-bold">Action Type</th>
                      <th className="py-4 px-5 font-bold">Telemetry Details</th>
                      <th className="py-4 px-5 font-bold">Network Location</th>
                      <th className="py-4 px-5 font-bold">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-xs">
                    {filteredActivityLogs.map(log => {
                      // Status colors
                      const statBadge = 
                        log.status === 'danger' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        log.status === 'warning' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        log.status === 'info' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

                      return (
                        <tr key={log.id} className="hover:bg-slate-900/30 transition-all">
                          <td className="py-4 px-5 font-mono text-slate-500 font-bold">{log.id}</td>
                          <td className="py-4 px-5 text-slate-400 whitespace-nowrap font-mono">{log.timestamp}</td>
                          <td className="py-4 px-5 font-semibold text-slate-200">{log.user}</td>
                          <td className="py-4 px-5">
                            <span className="font-extrabold text-white bg-slate-950 px-2 py-1 rounded border border-slate-850">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-300 max-w-sm leading-relaxed">{log.details}</td>
                          <td className="py-4 px-5 text-slate-500 font-mono">{log.ipAddress}</td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${statBadge}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredActivityLogs.length === 0 && (
                <div className="p-12 text-center text-slate-500 font-mono text-xs">
                  No operational security logs matched query filter parameters.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: CHANNELS & SECURITY SEVERITY PREFERENCES DESK */}
        {activeTab === 'preferences' && (
          <motion.div
            key="preferences-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
          >
            {/* Left: Dispatch endpoints */}
            <div className="md:col-span-7 bg-[#111827]/55 border border-slate-800/80 p-6 rounded-2xl space-y-6 backdrop-blur-md">
              <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                <Settings2 className="w-4.5 h-4.5 text-blue-400" />
                <div>
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">SaaS Dispatch Channels</h3>
                  <p className="text-[10px] text-slate-500">Enable transmission vectors for immediate biometrics notification</p>
                </div>
              </div>

              <form onSubmit={saveSettingsParams} className="space-y-4 text-xs">
                
                {/* CHANNEL 1: EMAIL */}
                <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className={`w-5 h-5 ${preferences.email.enabled ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="font-extrabold text-white">Email Dispatches</h4>
                        <p className="text-[10px] text-slate-500">Receive comprehensive CSV indices & incident packages</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePreferenceChan('email')}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        preferences.email.enabled ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        preferences.email.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {preferences.email.enabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Primary SMTP Destination</label>
                      <input
                        type="email"
                        value={preferences.email.address}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          email: { ...prev.email, address: e.target.value }
                        }))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                        placeholder="operator@facevision.ai"
                      />
                    </div>
                  )}
                </div>

                {/* CHANNEL 2: MOBILE SMS */}
                <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className={`w-5 h-5 ${preferences.sms.enabled ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="font-extrabold text-white">Cellular SMS Alerts</h4>
                        <p className="text-[10px] text-slate-500">Dispatch lightweight shortcode alert on anomalous incident triggers</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePreferenceChan('sms')}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        preferences.sms.enabled ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        preferences.sms.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {preferences.sms.enabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[9px] uppercase font-mono font-bold text-slate-500">International Twilio Registry Phone</label>
                      <input
                        type="text"
                        value={preferences.sms.phone}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sms: { ...prev.sms, phone: e.target.value }
                        }))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* CHANNEL 3: MOBILE PUSH NOTIFICATIONS */}
                <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Radio className={`w-5 h-5 ${preferences.push.enabled ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="font-extrabold text-white">App Push Alerts</h4>
                        <p className="text-[10px] text-slate-500">Direct transmission to authenticated mobile tablet workspace</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePreferenceChan('push')}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        preferences.push.enabled ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        preferences.push.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {preferences.push.enabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Registered Operator Device ID</label>
                      <input
                        type="text"
                        value={preferences.push.device}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          push: { ...prev.push, device: e.target.value }
                        }))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* CHANNEL 4: DESKTOP POPUP */}
                <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Laptop className={`w-5 h-5 ${preferences.desktop.enabled ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="font-extrabold text-white">Browser Popups</h4>
                      <p className="text-[10px] text-slate-500">Receive instant audio chime popups while in the Command Center viewport</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreferenceChan('desktop')}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      preferences.desktop.enabled ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      preferences.desktop.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer"
                  >
                    Lock Channel Configuration
                  </button>
                </div>

              </form>
            </div>

            {/* Right: Category Severity Filters */}
            <div className="md:col-span-5 space-y-5">
              
              <div className="bg-[#111827]/55 border border-slate-800/80 p-6 rounded-2xl space-y-4 backdrop-blur-md">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                  <Sliders className="w-4.5 h-4.5 text-purple-400" />
                  <div>
                    <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Alerting Matrices</h3>
                    <p className="text-[10px] text-slate-500">Fine-tune transmission thresholds by topic category</p>
                  </div>
                </div>

                <div className="space-y-4.5 text-xs">
                  {/* Row: Attendance alerts setting */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Attendance Triggers</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Enabled</span>
                    </div>
                    <select
                      value={preferences.attendance.threshold}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        attendance: { ...prev.attendance, threshold: e.target.value }
                      }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-300 focus:outline-none"
                    >
                      <option value="Any late/absent event">Any late or absent event (Strict)</option>
                      <option value="Absentees only">Absent status events only</option>
                      <option value="Consecutive absenteeism">Consecutive absenteeism threshold triggers (3x+)</option>
                    </select>
                  </div>

                  {/* Row: Unknown face setting */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>Unknown Person Alert Boundaries</span>
                      </span>
                      <span className="text-[10px] font-mono text-rose-400 font-bold">Lockdown Override Off</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">Instant cellular transmission dispatch</span>
                        <input
                          type="checkbox"
                          checked={preferences.unknownFace.instantAlert}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            unknownFace: { ...prev.unknownFace, instantAlert: e.target.checked }
                          }))}
                          className="rounded border-slate-800 bg-slate-900 accent-blue-500 h-3.5 w-3.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Alert below similarity threshold</span>
                          <span className="text-blue-400 font-bold font-mono">{preferences.unknownFace.thresholdConfidence}%</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="95"
                          value={preferences.unknownFace.thresholdConfidence}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            unknownFace: { ...prev.unknownFace, thresholdConfidence: Number(e.target.value) }
                          }))}
                          className="w-full bg-slate-900 accent-blue-500 h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row: Camera statussetting */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span>CCTV Heartbeat Intervals</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-850/60 gap-4">
                      <span className="text-slate-400 text-[10px]">Check for signal drop-off every</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <input
                          type="number"
                          value={preferences.cameraAlerts.heartbeatInterval}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            cameraAlerts: { ...prev.cameraAlerts, heartbeatInterval: Number(e.target.value) }
                          }))}
                          className="w-14 bg-slate-900 border border-slate-800 rounded p-1 text-center text-slate-300 font-mono"
                        />
                        <span className="text-slate-500 text-[10px]">seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* Row: System security alerts settings */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        <span>Advanced Security Lockdowns</span>
                      </span>
                      <span className="text-[10px] font-mono text-rose-400 font-bold">FIPS Level</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-850/60 text-[10px] text-slate-400">
                      <span>Trigger physical portal latch override upon continuous mismatch alert</span>
                      <input
                        type="checkbox"
                        checked={preferences.securityAlerts.lockdownOnAnomaly}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          securityAlerts: { ...prev.securityAlerts, lockdownOnAnomaly: e.target.checked }
                        }))}
                        className="rounded border-slate-800 bg-slate-900 accent-blue-500 h-3.5 w-3.5 shrink-0"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* INTEGRATION WEBHOOKS BOX */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827]/80 to-blue-950/20 border border-slate-800 space-y-3.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">Discord & Slack Webhooks</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[10px]">
                  Securely route AI face-recognition incidents and CCTV heartbeat failures directly to operational DevOps channels in real-time.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://discord.com/api/webhooks/90210/facevision-alerts"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2 text-slate-500 font-mono text-[9px] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast('Biometrics alert webhook copied to clipboard.', 'success');
                    }}
                    className="px-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* DETAILED INSPECTOR MODAL PANEL */}
      <AnimatePresence>
        {selectedDetailNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailNotification(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full relative overflow-hidden shadow-2xl z-10 space-y-6 text-left"
            >
              {/* Colored gradient decorative element */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              {/* Inspector Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                      ALARM VECTORS • {selectedDetailNotification.id}
                    </span>
                    <h3 className="text-white font-extrabold text-sm">{selectedDetailNotification.category} Alarm</h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDetailNotification(null)}
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Description body */}
              <div className="space-y-3.5 bg-slate-950/50 p-4.5 rounded-2xl border border-slate-850/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-[13px]">
                    {selectedDetailNotification.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${getPriorityClasses(selectedDetailNotification.priority)}`}>
                    {selectedDetailNotification.priority}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedDetailNotification.description}
                </p>

                <div className="border-t border-slate-850/80 pt-3.5 mt-2 grid grid-cols-2 gap-y-3 gap-x-4 text-[10px] font-mono">
                  
                  <div className="space-y-1">
                    <span className="text-slate-500 block">GENERATED DATE-TIME</span>
                    <span className="text-slate-300 font-bold font-mono">
                      {new Date(selectedDetailNotification.timestamp).toUTCString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">ALARM RECIPIENT</span>
                    <span className="text-slate-300 font-bold">All Authorized Operators</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">HARDWARE CCTV STREAM</span>
                    <span className="text-indigo-400 font-bold">
                      {selectedDetailNotification.relatedCamera || 'General Node'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">INTERCEPTED ID LINK</span>
                    <span className="text-purple-400 font-bold">
                      {selectedDetailNotification.relatedUser || 'No Subject Association'}
                    </span>
                  </div>

                </div>
              </div>

              {/* FIPS Authentication Seal */}
              <div className="flex items-center space-x-2.5 p-3.5 bg-emerald-950/20 rounded-2xl border border-emerald-900/60 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-emerald-400 text-[10px] uppercase font-mono tracking-wider">SHA-256 Verified Diagnostic Logs</h4>
                  <p className="text-slate-400 text-[10px]">Vector matching logs sealed in physical server cache memory without external data leaking.</p>
                </div>
              </div>

              {/* Inspector Operations Tray */}
              <div className="flex items-center justify-between border-t border-slate-850/60 pt-4.5 text-xs">
                <button
                  onClick={() => {
                    toggleReadStatus(selectedDetailNotification.id);
                    setSelectedDetailNotification(null);
                  }}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-850 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{selectedDetailNotification.read ? 'Mark Alert Unread' : 'Acknowledge Incident'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      archiveNotification(selectedDetailNotification.id);
                      setSelectedDetailNotification(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-slate-850 transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Archive className="w-3.5 h-3.5 text-blue-400" />
                    <span>Archive</span>
                  </button>

                  <button
                    onClick={() => {
                      deleteNotification(selectedDetailNotification.id);
                      setSelectedDetailNotification(null);
                    }}
                    className="px-4 py-2.5 bg-rose-950/45 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-xl text-xs font-extrabold border border-rose-900/40 transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
