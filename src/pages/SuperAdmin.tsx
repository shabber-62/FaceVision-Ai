import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  Building,
  BookOpen,
  Camera,
  Cpu,
  Database,
  FileText,
  Lock,
  Settings,
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  AlertTriangle,
  Play,
  Download,
  Upload,
  UserCheck,
  Eye,
  Key,
  Smartphone,
  HardDrive,
  Sliders,
  Mail,
  Zap,
  Power,
  Server
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- Interfaces for Super Admin state ---
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Faculty' | 'Student' | 'Security';
  department: string;
  status: 'Active' | 'Suspended' | 'Pending';
  deviceCount: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  studentCount: number;
  facultyCount: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  semester: string;
  faculty: string;
}

interface ClassSchedule {
  id: string;
  name: string;
  room: string;
  faculty: string;
  timetable: string;
  studentCount: number;
}

interface CameraNode {
  id: string;
  name: string;
  location: string;
  resolution: string;
  fps: number;
  health: 'Optimal' | 'Warning' | 'Offline';
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'academics' | 'infrastructure' | 'security'>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Dynamic Telemetry Charts Data ---
  const [sysMetrics, setSysMetrics] = useState<any[]>([]);
  useEffect(() => {
    const data = [];
    for (let i = 10; i >= 0; i--) {
      data.push({
        time: `${i * 2}s ago`,
        cpu: Math.floor(Math.random() * 20) + 40,
        gpu: Math.floor(Math.random() * 30) + 50,
        ram: Math.floor(Math.random() * 5) + 70,
        temp: Math.floor(Math.random() * 10) + 65
      });
    }
    setSysMetrics(data);

    const interval = setInterval(() => {
      setSysMetrics(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: 'Now',
          cpu: Math.floor(Math.random() * 20) + 40,
          gpu: Math.floor(Math.random() * 30) + 50,
          ram: Math.floor(Math.random() * 5) + 72,
          temp: Math.floor(Math.random() * 8) + 66
        });
        return next.map((item, idx) => {
          if (idx === next.length - 1) return item;
          return { ...item, time: `${(next.length - 1 - idx) * 2}s ago` };
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // --- Interactive States ---
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 'usr-101', name: 'Shabber Ahammad', email: 'shabberahammad10@gmail.com', role: 'Super Admin', department: 'Executive Suite', status: 'Active', deviceCount: 3 },
    { id: 'usr-102', name: 'Prof. Katherine Vance', email: 'katherine.vance@facevision.edu', role: 'Faculty', department: 'Computer Science', status: 'Active', deviceCount: 1 },
    { id: 'usr-103', name: 'Officer Marcus Vance', email: 'marcus.vance@security.edu', role: 'Security', department: 'Campus Police', status: 'Active', deviceCount: 2 },
    { id: 'usr-104', name: 'John Connor', email: 'john.connor@student.edu', role: 'Student', department: 'Robotics Engineering', status: 'Active', deviceCount: 1 },
    { id: 'usr-105', name: 'Sarah Connor', email: 'sarah.connor@cyberdyne.io', role: 'Admin', department: 'Operations Command', status: 'Suspended', deviceCount: 0 }
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    { id: 'dept-1', name: 'Computer Science & AI', code: 'CSAI', hod: 'Dr. Katherine Vance', studentCount: 342, facultyCount: 18 },
    { id: 'dept-2', name: 'Robotics Engineering', code: 'ROB', hod: 'Dr. Miles Dyson', studentCount: 185, facultyCount: 9 },
    { id: 'dept-3', name: 'Cyber Security Operations', code: 'CYBER', hod: 'Col. John Miller', studentCount: 120, facultyCount: 6 }
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { id: 'crs-1', name: 'Deep Learning & Neural Blueprints', code: 'CSAI-401', semester: 'Fall 2026', faculty: 'Dr. Katherine Vance' },
    { id: 'crs-2', name: 'Automated Drone Swarm Mapping', code: 'ROB-302', semester: 'Fall 2026', faculty: 'Dr. Miles Dyson' },
    { id: 'crs-3', name: 'FIPS Encryption Hardening', code: 'CYBER-502', semester: 'Spring 2027', faculty: 'Col. John Miller' }
  ]);

  const [classes, setClasses] = useState<ClassSchedule[]>([
    { id: 'cls-1', name: 'CSAI-401 Lab A', room: 'Server Room B-4', faculty: 'Dr. Katherine Vance', timetable: 'Mon/Wed 10:00 AM - 12:00 PM', studentCount: 45 },
    { id: 'cls-2', name: 'ROB-302 Flight Bay', room: 'Aero-Hangar 2', faculty: 'Dr. Miles Dyson', timetable: 'Tue/Thu 02:00 PM - 04:30 PM', studentCount: 30 }
  ]);

  const [cameras, setCameras] = useState<CameraNode[]>([
    { id: 'cam-1', name: 'Foyer Main Ingress Gate', location: 'Administration Building Entrance', resolution: '3840x2160 (4K)', fps: 60, health: 'Optimal' },
    { id: 'cam-2', name: 'Classroom 405 Panoramic', location: 'CS Wing Room 405', resolution: '1920x1080 (1080p)', fps: 30, health: 'Optimal' },
    { id: 'cam-3', name: 'Server Hangar High Security', location: 'Data Center Core Security Vault', resolution: '3840x2160 (4K)', fps: 60, health: 'Warning' }
  ]);

  const [aiConfig, setAiConfig] = useState({
    yoloVersion: 'YOLOv8x-Face-v2.1',
    insightFaceVersion: 'InsightFace-ResNet100',
    confidenceThreshold: 82,
    gpuAcceleration: true,
    logs: [
      '[11:45:02] GPU cluster handshake completed. CUDA 12.2 detected.',
      '[11:45:15] Neural footprint map loaded (1,452 active student embeddings).',
      '[11:48:32] YOLOv8 inferences averaging 2.4ms per frame on Tesla A100G.',
      '[11:49:10] Real-time video stream connected: cam-1 (Admin Entrance).'
    ]
  });

  const [dbConfig, setDbConfig] = useState({
    status: 'OPTIMAL',
    storageUsed: '45.2 GB',
    storageTotal: '500 GB',
    optimizationLevel: '98%',
    lastBackup: 'Today, 04:00 AM'
  });

  const [sysSettings, setSysSettings] = useState({
    institutionName: 'Cyberdyne Systems Institute of Technology',
    attendanceGracePeriod: 15, // mins
    enablePushAlerts: true,
    smtpServer: 'smtp.cyberdyne.io',
    smtpPort: 587,
    apiKey: 'sk_live_51Nv892JkLa3042Nal0Z192...'
  });

  // Modals controllers
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student', department: 'Computer Science' });
  const [newDept, setNewDept] = useState({ name: '', code: '', hod: '' });

  // Handle Action functions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      triggerToast('Please provide name and email.', 'error');
      return;
    }
    const created: AdminUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      department: newUser.department,
      status: 'Active',
      deviceCount: 1
    };
    setUsers([created, ...users]);
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '', role: 'Student', department: 'Computer Science' });
    triggerToast(`User ${created.name} provisioned successfully!`, 'success');
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) {
      triggerToast('Please provide department name and code.', 'error');
      return;
    }
    const created: Department = {
      id: `dept-${Date.now().toString().slice(-3)}`,
      name: newDept.name,
      code: newDept.code.toUpperCase(),
      hod: newDept.hod || 'Unassigned',
      studentCount: 0,
      facultyCount: 1
    };
    setDepartments([...departments, created]);
    setShowAddDeptModal(false);
    setNewDept({ name: '', code: '', hod: '' });
    triggerToast(`Department ${created.code} established!`, 'success');
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    triggerToast(`User account associated with ${name} purged.`, 'warning');
  };

  const handleToggleUserStatus = (id: string, current: 'Active' | 'Suspended' | 'Pending') => {
    const nextStatus = current === 'Active' ? 'Suspended' : 'Active';
    setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    triggerToast(`User status updated to: ${nextStatus.toUpperCase()}`, 'info');
  };

  const handleOptimizeDb = () => {
    setDbConfig(prev => ({ ...prev, optimizationLevel: '100%', status: 'COMPACTED' }));
    triggerToast('Database indexing optimized. Space reclaimed: 1.2 GB', 'success');
  };

  const handleBackupDb = () => {
    const nowStr = new Date().toLocaleTimeString();
    setDbConfig(prev => ({ ...prev, lastBackup: `Today, ${nowStr}` }));
    triggerToast('Full photographic & telemetry database backup completed successfully.', 'success');
  };

  const handleRestartCamera = (id: string, name: string) => {
    triggerToast(`Sending cold boot signal to ${name}...`, 'info');
    setCameras(cameras.map(c => c.id === id ? { ...c, health: 'Optimal' } : c));
    setTimeout(() => {
      triggerToast(`Camera node ${name} reboot complete. Feeds back online.`, 'success');
    }, 1500);
  };

  const handleRestartAI = () => {
    triggerToast('Hot restarting YOLOv8/InsightFace inferencing context...', 'info');
    setAiConfig(prev => ({
      ...prev,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Hot restart requested by Super Admin.`,
        `[${new Date().toLocaleTimeString()}] Dynamic weights re-initialized. Threads optimal.`
      ]
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
              toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300' :
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' :
              'bg-blue-950/90 border-blue-500/30 text-blue-300'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'error' && <X className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Activity className="w-5 h-5 text-blue-400" />}
            <span className="text-xs font-mono font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Super Admin Page Header --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-950/40 p-6 rounded-3xl border border-slate-900 backdrop-blur-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Panel</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
             केंद्रीय नियंत्रण प्रणाली: Manage deep visual models, institution settings, security logs, departments, courses, and connected cameras.
          </p>
        </div>

        {/* Global Control Bar */}
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-admin-add-user"
            onClick={() => setShowAddUserModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs text-white font-bold font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
          <button
            id="btn-admin-add-dept"
            onClick={() => setShowAddDeptModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 text-xs text-slate-200 font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Building className="w-4 h-4 text-blue-400" /> Create Department
          </button>
          <button
            id="btn-admin-backup"
            onClick={handleBackupDb}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 text-xs text-slate-200 font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-400" /> System Backup
          </button>
          <button
            id="btn-admin-report"
            onClick={() => triggerToast('System report generated successfully!', 'success')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 text-xs text-slate-200 font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" /> Generate Report
          </button>
          <button
            id="btn-admin-export"
            onClick={() => triggerToast('Exported enterprise schema to CSV/JSON format.', 'info')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 text-xs text-slate-200 font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" /> Export Data
          </button>
        </div>
      </div>

      {/* --- Horizontal Navigation Tabs --- */}
      <div className="flex flex-wrap border-b border-slate-900 gap-1 pb-px">
        <button
          id="tab-admin-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-red-500 text-red-400 bg-red-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Overview & Telemetry
          </span>
        </button>

        <button
          id="tab-admin-users"
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-red-500 text-red-400 bg-red-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Operators & Clearance Matrix
          </span>
        </button>

        <button
          id="tab-admin-academics"
          onClick={() => setActiveTab('academics')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'academics'
              ? 'border-red-500 text-red-400 bg-red-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5" />
            Academics Registry
          </span>
        </button>

        <button
          id="tab-admin-infrastructure"
          onClick={() => setActiveTab('infrastructure')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'infrastructure'
              ? 'border-red-500 text-red-400 bg-red-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            Cameras & AI Core
          </span>
        </button>

        <button
          id="tab-admin-security"
          onClick={() => setActiveTab('security')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'security'
              ? 'border-red-500 text-red-400 bg-red-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Security Center & Settings
          </span>
        </button>
      </div>

      {/* --- Tab Workspace --- */}
      <div>
        {/* ==================== TAB 1: OVERVIEW & TELEMETRY ==================== */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Grid of 12 beautiful bento metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[
                { label: 'Total Students', value: '1,452', sub: '+12 this week', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-950/50' },
                { label: 'Total Faculty', value: '48', sub: 'Active', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-950/50' },
                { label: 'Total Departments', value: '6', sub: 'Established', icon: Building, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-950/50' },
                { label: 'Total Classes', value: '32', sub: 'In Timetable', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-950/50' },
                { label: "Today's Attendance", value: '94.2%', sub: '1,368 present', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-950/50' },
                { label: 'Active Cameras', value: '12 / 12', sub: 'Feeds live', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-950/50' },
                { label: 'Registered Faces', value: '2,890', sub: 'Embedded vectors', icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/5 border-pink-950/50' },
                { label: 'Unknown Faces', value: '3', sub: 'Requires sweep', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/5 border-red-950/50' },
                { label: 'Recognition Acc.', value: '99.4%', sub: 'YOLOv8 & ResNet', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/5 border-indigo-950/50' },
                { label: 'Server Health', value: 'Optimal', sub: '35ms avg latency', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-950/50' },
                { label: 'Database Health', value: 'Index 98%', sub: '45.2 GB utilized', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-950/50' },
                { label: 'API Status', value: 'Operational', sub: '100% uptime', icon: RefreshCw, color: 'text-teal-400', bg: 'bg-teal-500/5 border-teal-950/50' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 bg-slate-950/80 border rounded-2xl flex flex-col justify-between text-left relative overflow-hidden group hover:scale-[1.02] hover:border-slate-800 transition-all ${item.bg}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-white tracking-tight">{item.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Charting Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CPU & GPU Hardware telemetry block */}
              <div className="lg:col-span-2 bg-slate-950/60 border border-slate-900 rounded-3xl p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-red-400 animate-pulse" />
                      Platform Hardware Telemetry (Tesla A100G Cluster)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time GPU frame-inference context and host server compute profiling.</p>
                  </div>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-xl font-bold font-mono uppercase tracking-wide">
                    Live Stream
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sysMetrics}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="italic" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                      <Area type="monotone" dataKey="gpu" name="GPU Utilization %" stroke="#ef4444" fillOpacity={1} fill="url(#colorGpu)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Server Details & Logs summary */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Instance Metrics
                  </h3>
                  <div className="space-y-3 font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs text-slate-500">Host Hostname</span>
                      <span className="text-xs text-slate-300">core-run-cluster-04</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs text-slate-500">System Memory</span>
                      <span className="text-xs text-slate-300">74% / 64 GB ECC</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs text-slate-500">Network Bandwidth</span>
                      <span className="text-xs text-slate-300">842 Mbps (Direct SLA)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs text-slate-500">Active WebSocket Tunnels</span>
                      <span className="text-xs text-slate-300">254 Nodes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Node.js Version</span>
                      <span className="text-xs text-slate-300">v20.11.0 Enterprise</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-900 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">FIPS Compliance</p>
                  <p className="text-xs text-slate-400 mt-1">This server runs strictly under FIPS 140-3 cryptography policies.</p>
                </div>
              </div>
            </div>

            {/* Recent activity logs & System events */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Recent Recognition & System Operations Logs
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Auto-refreshes every 5s</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {[
                  { time: '11:49:15', user: 'SYSTEM', event: 'Student Registration', details: 'Added 12 fresh computer science embeddings to model database.', type: 'success' },
                  { time: '11:48:24', user: 'Shabber Ahammad', event: 'Camera Initialization', details: 'Restarted Foyer Main Ingress Gate Camera.', type: 'info' },
                  { time: '11:47:01', user: 'SYSTEM', event: 'Attendance Update', details: 'Exported fall term attendance stats to storage bucket.', type: 'success' },
                  { time: '11:45:12', user: 'Officer Marcus Vance', event: 'Recognition Event', details: 'Identified unknown face on gate-3 camera.', type: 'warning' },
                  { time: '11:42:09', user: 'SYSTEM', event: 'System Error', details: 'Database indexing timeout on old backup chunks (automatic retry completed).', type: 'error' }
                ].map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{log.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/30' :
                        log.type === 'warning' ? 'bg-amber-950/60 text-amber-300 border border-amber-900/30' :
                        log.type === 'error' ? 'bg-red-950/60 text-red-300 border border-red-900/30' :
                        'bg-blue-950/60 text-blue-300 border border-blue-900/30'
                      }`}>{log.event}</span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <span className="text-slate-500 italic">By: {log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 2: USER & PRIVILEGE MATRIX ==================== */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User directory */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Enterprise Operators Directory</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive user base consisting of Super Admins, operational staff, faculty members, and students.</p>
                </div>
                <button
                  id="btn-admin-add-user-2"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Operator
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-900">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Operator Detail</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Department Division</th>
                      <th className="p-4">Secure Sockets</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Override Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-sans text-slate-300">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-slate-200">{u.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                            u.role === 'Super Admin' ? 'bg-red-950/50 text-red-300 border-red-900/30' :
                            u.role === 'Admin' ? 'bg-blue-950/50 text-blue-300 border-blue-900/30' :
                            u.role === 'Faculty' ? 'bg-amber-950/50 text-amber-300 border-amber-900/30' :
                            u.role === 'Security' ? 'bg-emerald-950/50 text-emerald-300 border-emerald-900/30' :
                            'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{u.department}</td>
                        <td className="p-4 font-mono">{u.deviceCount} Node(s)</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' :
                              u.status === 'Suspended' ? 'bg-rose-500 shadow-[0_0_6px_#ef4444]' : 'bg-amber-400'
                            }`} />
                            <span>{u.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          <button
                            id={`btn-toggle-status-${u.id}`}
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-[10px] font-semibold transition-all cursor-pointer font-mono"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            id={`btn-reset-pw-${u.id}`}
                            onClick={() => triggerToast(`Password reset link dispatched to ${u.email}`, 'info')}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-[10px] font-semibold transition-all cursor-pointer font-mono"
                          >
                            Reset Password
                          </button>
                          {u.role !== 'Super Admin' && (
                            <button
                              id={`btn-delete-user-${u.id}`}
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-red-900/30 hover:border-red-600 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Purge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Roles & Permission matrix indicator */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Clearances & Permissions Matrices</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review role operational clearances across five pre-defined system classes.</p>
                </div>
                <button
                  id="btn-admin-create-custom-role"
                  onClick={() => triggerToast('Custom role architect initialized. Ready for clearance mapping.', 'info')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Create Custom Role
                </button>
              </div>

              {/* Readonly preview Matrix to complete requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Super Admin', desc: 'Full core level immutable access across all infrastructure components.', status: 'IMMUTABLE' },
                  { name: 'Admin', desc: 'Can manage operators, department profiles, cameras and YOLO core settings.', status: 'ACTIVE' },
                  { name: 'Faculty', desc: 'Can fetch class rosters, verify manually, and generate attendance spreadsheets.', status: 'ACTIVE' },
                  { name: 'Security', desc: 'Receives alerts on unknown recognition, maps camera streams, sweeps foyer.', status: 'ACTIVE' },
                  { name: 'Student', desc: 'Can review self student profile dossier and attendance history logs.', status: 'LOCKED' }
                ].map((rm, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white font-mono">{rm.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-bold">{rm.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{rm.desc}</p>
                    </div>
                    <button
                      id={`btn-config-role-${idx}`}
                      onClick={() => triggerToast(`Navigating to Clearance Profile Matrix for ${rm.name}...`, 'info')}
                      className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono py-1.5 rounded-lg text-center"
                    >
                      Audit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 3: ACADEMICS REGISTRY ==================== */}
        {activeTab === 'academics' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Department Management block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Departments column */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Institution Department Directory</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Manage departments, view student populations, and assign HODs.</p>
                  </div>
                  <button
                    id="btn-admin-add-dept-2"
                    onClick={() => setShowAddDeptModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Add Dept
                  </button>
                </div>

                <div className="space-y-3">
                  {departments.map(d => (
                    <div key={d.id} className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15">{d.code}</span>
                          <span className="text-sm font-bold text-white">{d.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Head of Dept: <span className="text-slate-300 font-semibold">{d.hod}</span></p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold">Roster Stats</p>
                          <p className="text-xs text-slate-300">{d.studentCount} Students • {d.facultyCount} Faculty</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            id={`btn-edit-dept-${d.id}`}
                            onClick={() => triggerToast(`Department configuration for ${d.code} loaded.`, 'info')}
                            className="p-1.5 bg-slate-900 text-slate-400 hover:text-white rounded border border-slate-800 transition-all cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-dept-${d.id}`}
                            onClick={() => {
                              setDepartments(departments.filter(dept => dept.id !== d.id));
                              triggerToast(`Department ${d.code} dismantled.`, 'warning');
                            }}
                            className="p-1.5 bg-red-950/40 text-red-400 hover:text-white rounded border border-red-900/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department general stats graph/list */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">Departmental Statistics Overview</h3>
                  <div className="space-y-4">
                    {departments.map(d => {
                      const percentage = Math.min(100, Math.floor((d.studentCount / 400) * 100));
                      return (
                        <div key={d.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400 font-semibold">{d.code} Capacity</span>
                            <span className="text-slate-500">{percentage}% ({d.studentCount} / 400 max)</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900">
                  <p className="text-[10px] text-slate-500 font-mono text-center">Data accurate as of today</p>
                </div>
              </div>
            </div>

            {/* Courses and Classes registry block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Curriculum Course Registry</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Assign academic courses to semesters and associate faculty models.</p>
                  </div>
                  <button
                    id="btn-admin-add-course"
                    onClick={() => {
                      const code = `CSAI-${Math.floor(Math.random() * 200) + 300}`;
                      const created: Course = {
                        id: `crs-${Date.now().toString().slice(-3)}`,
                        name: 'Quantum Network Encryption Models',
                        code,
                        semester: 'Spring 2027',
                        faculty: 'Dr. Katherine Vance'
                      };
                      setCourses([...courses, created]);
                      triggerToast(`Course ${code} registered in curriculum catalog.`, 'success');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-mono rounded-xl transition-all cursor-pointer"
                  >
                    Add Course
                  </button>
                </div>

                <div className="space-y-2.5">
                  {courses.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                      <div className="text-left space-y-0.5">
                        <p className="font-bold text-slate-200">{c.name} <span className="font-mono text-blue-400 font-semibold ml-2">({c.code})</span></p>
                        <p className="text-[11px] text-slate-500">{c.semester} • Assigned Instructor: {c.faculty}</p>
                      </div>
                      <button
                        id={`btn-del-course-${c.id}`}
                        onClick={() => {
                          setCourses(courses.filter(course => course.id !== c.id));
                          triggerToast(`Course ${c.code} deleted.`, 'warning');
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classes Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Dynamic Class Schedules & Rosters</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Assign academic rooms, instruct schedules, and map student rosters.</p>
                  </div>
                  <button
                    id="btn-admin-add-class"
                    onClick={() => {
                      const created: ClassSchedule = {
                        id: `cls-${Date.now().toString().slice(-3)}`,
                        name: 'CYBER-502 Advanced Crypt',
                        room: 'Hall B Hangar',
                        faculty: 'Col. John Miller',
                        timetable: 'Fri 09:00 AM - 11:30 AM',
                        studentCount: 22
                      };
                      setClasses([...classes, created]);
                      triggerToast('Assigned CYBER-502 to timetable.', 'success');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-mono rounded-xl transition-all cursor-pointer"
                  >
                    Create Class
                  </button>
                </div>

                <div className="space-y-2.5">
                  {classes.map(cl => (
                    <div key={cl.id} className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                      <div className="text-left space-y-0.5">
                        <p className="font-bold text-slate-200">{cl.name} <span className="font-mono text-emerald-400 font-semibold ml-2">({cl.room})</span></p>
                        <p className="text-[11px] text-slate-500">{cl.timetable} • {cl.studentCount} Students rostered</p>
                      </div>
                      <button
                        id={`btn-del-class-${cl.id}`}
                        onClick={() => {
                          setClasses(classes.filter(cls => cls.id !== cl.id));
                          triggerToast(`Class scheduling dismantled.`, 'warning');
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 4: INFRASTRUCTURE & AI CORE ==================== */}
        {activeTab === 'infrastructure' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Cameras management */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Registered Optical Camera Nodes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage enterprise video streaming hardware, monitor resolution constraints, and reboot nodes.</p>
                </div>
                <button
                  id="btn-admin-register-camera"
                  onClick={() => {
                    const created: CameraNode = {
                      id: `cam-${Date.now().toString().slice(-2)}`,
                      name: 'South Gate Parking Lot',
                      location: 'Parking Hangar Perimeter Pole-12',
                      resolution: '1920x1080 (1080p)',
                      fps: 30,
                      health: 'Optimal'
                    };
                    setCameras([...cameras, created]);
                    triggerToast('Registered Optical Camera Node.', 'success');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs text-white font-mono rounded-xl transition-all cursor-pointer"
                >
                  Register Camera
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cameras.map(c => (
                  <div key={c.id} className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl flex flex-col justify-between text-left gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-white">{c.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                          c.health === 'Optimal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/30' :
                          c.health === 'Warning' ? 'bg-amber-950 text-amber-300 border border-amber-900/30' :
                          'bg-red-950 text-red-300 border border-red-900/30'
                        }`}>{c.health}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-2">Location: {c.location}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Resolution: {c.resolution} @ {c.fps}FPS</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-900">
                      <button
                        id={`btn-restart-cam-${c.id}`}
                        onClick={() => handleRestartCamera(c.id, c.name)}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-mono py-1 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Cold Reboot
                      </button>
                      <button
                        id={`btn-del-cam-${c.id}`}
                        onClick={() => {
                          setCameras(cameras.filter(cam => cam.id !== c.id));
                          triggerToast(`Deregistered camera node: ${c.name}`, 'warning');
                        }}
                        className="p-1 bg-red-950/40 text-red-400 hover:text-white rounded border border-red-900/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model Settings & YOLO configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* YOLO config details */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-red-400" /> YOLOv8 & InsightFace Neural Weights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Face Detection Layer</span>
                      <p className="text-sm font-bold text-slate-200">{aiConfig.yoloVersion}</p>
                      <p className="text-[10.5px] text-slate-500">Optimized anchor stride parameters with custom landmark projection.</p>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Feature Embedder Model</span>
                      <p className="text-sm font-bold text-slate-200">{aiConfig.insightFaceVersion}</p>
                      <p className="text-[10.5px] text-slate-500">ResNet-100 backbone with additive angular margin penalty soft-max.</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Model Inference Confidence Threshold</span>
                      <span className="text-slate-300 font-mono font-bold">{aiConfig.confidenceThreshold}%</span>
                    </div>
                    <input
                      id="ai-confidence-slider"
                      type="range"
                      min="50"
                      max="100"
                      value={aiConfig.confidenceThreshold}
                      onChange={(e) => setAiConfig({ ...aiConfig, confidenceThreshold: parseInt(e.target.value) })}
                      className="w-full h-1 bg-slate-950 border border-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end gap-2">
                  <button
                    id="btn-restart-ai-engine"
                    onClick={handleRestartAI}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    Restart AI Engine
                  </button>
                </div>
              </div>

              {/* Console logs */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">Model Core Logs</h3>
                  <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl font-mono text-[10.5px] text-slate-400 space-y-1.5 h-44 overflow-y-auto">
                    {aiConfig.logs.map((log, idx) => (
                      <div key={idx} className="leading-normal border-b border-slate-900/50 pb-1 last:border-0">{log}</div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 text-center">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">CUDA Handshake OK</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 5: SECURITY CENTER & SETTINGS ==================== */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Database management stats */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> Database Administration Control Unit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/85 border border-slate-900 p-4 rounded-xl text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Indexed Status</p>
                  <p className="text-base font-bold text-emerald-400 mt-1">{dbConfig.status}</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-900 p-4 rounded-xl text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reclaimed Space</p>
                  <p className="text-base font-bold text-white mt-1">{dbConfig.optimizationLevel}</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-900 p-4 rounded-xl text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Database Storage Used</p>
                  <p className="text-base font-bold text-blue-400 mt-1">{dbConfig.storageUsed} / {dbConfig.storageTotal}</p>
                </div>
                <div className="bg-slate-950/85 border border-slate-900 p-4 rounded-xl text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Last Sync Backup</p>
                  <p className="text-xs font-mono font-semibold text-slate-300 mt-2">{dbConfig.lastBackup}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  id="btn-opt-db"
                  onClick={handleOptimizeDb}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs text-white font-mono rounded-lg transition-all cursor-pointer"
                >
                  Optimize Indexing
                </button>
                <button
                  id="btn-backup-db-2"
                  onClick={handleBackupDb}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg transition-all cursor-pointer"
                >
                  Backup Database
                </button>
              </div>
            </div>

            {/* Institution Settings form fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Policy logs */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left space-y-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" /> FIPS Auditing & Blocked Operator IPs
                </h3>

                <div className="space-y-2.5">
                  {[
                    { ip: '192.168.1.89', desc: 'Sarah Connor Laptop Session Suspended', action: 'Deregistered Tunnel', date: '3 days ago', type: 'error' },
                    { ip: '10.0.4.52', desc: 'Tactical Guard Tablet Handshake Sync', action: 'Token Active', date: 'Just Now', type: 'success' },
                    { ip: '172.16.89.12', desc: 'Multiple login failures on main lectern', action: 'API Blocked (15m)', date: '10m ago', type: 'warning' }
                  ].map((aud, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="text-left space-y-0.5">
                        <p className="font-bold text-slate-200">{aud.ip} - {aud.action}</p>
                        <p className="text-[10.5px] text-slate-500">{aud.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{aud.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution settings configuration fields */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-left space-y-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Institution-Wide SLA Rules</h3>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Institution Name Label</label>
                    <input
                      id="input-inst-name"
                      type="text"
                      value={sysSettings.institutionName}
                      onChange={(e) => setSysSettings({ ...sysSettings, institutionName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 block font-bold">SMTP Relay Server</label>
                      <input
                        id="input-smtp-server"
                        type="text"
                        value={sysSettings.smtpServer}
                        onChange={(e) => setSysSettings({ ...sysSettings, smtpServer: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block font-bold">Relay Port</label>
                      <input
                        id="input-smtp-port"
                        type="number"
                        value={sysSettings.smtpPort}
                        onChange={(e) => setSysSettings({ ...sysSettings, smtpPort: parseInt(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Attendance Grace Window (Minutes)</label>
                    <input
                      id="input-grace-window"
                      type="number"
                      value={sysSettings.attendanceGracePeriod}
                      onChange={(e) => setSysSettings({ ...sysSettings, attendanceGracePeriod: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    id="btn-save-settings"
                    onClick={() => triggerToast('SLA rules and SMTP configuration saved.', 'success')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-xs text-white font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    Save Rules Config
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 border border-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 text-left"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Provision Operator Account</h3>
              <button
                id="btn-close-adduser"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Full Name</label>
                <input
                  id="modal-adduser-name"
                  type="text"
                  required
                  placeholder="e.g. Shabber Ahammad"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Primary Email</label>
                <input
                  id="modal-adduser-email"
                  type="email"
                  required
                  placeholder="e.g. shabberahammad10@gmail.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Assigned Role</label>
                  <select
                    id="modal-adduser-role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Security">Security</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Department Suite</label>
                  <select
                    id="modal-adduser-dept"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Robotics Engineering">Robotics Engineering</option>
                    <option value="Cyber Security Operations">Cyber Security</option>
                    <option value="Administration Division">Administration</option>
                  </select>
                </div>
              </div>

              <button
                id="btn-submit-adduser"
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Provision Credentials
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- CREATE DEPARTMENT MODAL --- */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 border border-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 text-left"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Establish Department division</h3>
              <button
                id="btn-close-adddept"
                onClick={() => setShowAddDeptModal(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Department Name</label>
                <input
                  id="modal-adddept-name"
                  type="text"
                  required
                  placeholder="e.g. Computer Science & AI"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Department Code</label>
                  <input
                    id="modal-adddept-code"
                    type="text"
                    required
                    placeholder="e.g. CSAI"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Department Head (HOD)</label>
                  <input
                    id="modal-adddept-hod"
                    type="text"
                    placeholder="e.g. Dr. Vance"
                    value={newDept.hod}
                    onChange={(e) => setNewDept({ ...newDept, hod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <button
                id="btn-submit-adddept"
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Establish Division
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
