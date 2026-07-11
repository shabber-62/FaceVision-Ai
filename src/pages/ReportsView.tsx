import { useState, useMemo, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Play, 
  Calendar, 
  Building, 
  Sliders, 
  ChevronRight, 
  CheckCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  FileDown,
  Users,
  Cpu,
  Camera,
  Server,
  Zap,
  Lock,
  Mail,
  Share2,
  Trash2,
  Copy,
  Plus,
  Search,
  Activity,
  Bell,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Globe,
  UserCheck,
  Award,
  BookOpen,
  FolderSync,
  History,
  ShieldCheck,
  FileCheck2,
  Clock3,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { Student, AttendanceRecord } from '../types';

interface ReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

// Pre-defined Report History Mock Data
interface ReportHistoryItem {
  id: string;
  name: string;
  generatedDate: string;
  generatedBy: string;
  type: string;
  status: 'Ready' | 'Processing' | 'Failed';
  size: string;
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON';
}

// Scheduled Reports List Mock Data
interface ScheduledReportItem {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Semester' | 'Yearly';
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON';
  recipients: string[];
  nextRun: string;
  status: 'Active' | 'Paused';
}

// Audit Logs Mock Data
interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  targetReport: string;
  ipAddress: string;
}

export default function ReportsView({ students = [], attendance = [] }: ReportsViewProps) {
  // Navigation tabs for Reports Center sub-views
  // 'builder' = Report Studio, 'schedules' = Scheduled Dispatches, 'history' = Archive & Access Security
  const [activeTab, setActiveTab] = useState<'builder' | 'schedules' | 'history'>('builder');

  // Filter States for Report Builder
  const [selectedCategory, setSelectedCategory] = useState<string>('attendance');
  const [selectedQuickReport, setSelectedQuickReport] = useState<string>('last-7-days');
  const [dateRange, setDateRange] = useState<string>('2026-07-05 to 2026-07-11');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<number>(85);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [reportFormat, setReportFormat] = useState<'PDF' | 'Excel' | 'CSV' | 'JSON'>('PDF');

  // Core Execution States
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [compiledReport, setCompiledReport] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Schedulers State Manager
  const [schedules, setSchedules] = useState<ScheduledReportItem[]>([
    {
      id: 'SCH-802',
      name: 'Weekly AI Ingress Audit Log',
      frequency: 'Weekly',
      format: 'PDF',
      recipients: ['principal.office@academy.edu', 'dean.engineering@academy.edu'],
      nextRun: '2026-07-13 08:00 AM',
      status: 'Active'
    },
    {
      id: 'SCH-511',
      name: 'Monthly Faculty Attendance Ledger',
      frequency: 'Monthly',
      format: 'Excel',
      recipients: ['hr.payroll@academy.edu'],
      nextRun: '2026-08-01 00:05 AM',
      status: 'Active'
    },
    {
      id: 'SCH-304',
      name: 'Daily Security Unknown Faces Alert',
      frequency: 'Daily',
      format: 'CSV',
      recipients: ['security.leads@academy.edu'],
      nextRun: '2026-07-12 06:00 PM',
      status: 'Active'
    }
  ]);

  // Archive / History List State Manager
  const [historyItems, setHistoryItems] = useState<ReportHistoryItem[]>([
    {
      id: 'REP-9021',
      name: 'CS Cybernetics Lab - Standard Attendance Audit',
      generatedDate: '2026-07-11 10:44 AM',
      generatedBy: 'Administrator',
      type: 'Attendance Report',
      status: 'Ready',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 'REP-8854',
      name: 'Quarterly AI Landmark Calibration Diagnostics',
      generatedDate: '2026-07-10 04:12 PM',
      generatedBy: 'System Autopilot',
      type: 'AI Recognition Report',
      status: 'Ready',
      size: '12.8 MB',
      format: 'JSON'
    },
    {
      id: 'REP-7491',
      name: 'Operations Ingress Timeline - June Closeout',
      generatedDate: '2026-07-01 09:00 AM',
      generatedBy: 'HR Operator',
      type: 'Monthly Report',
      status: 'Ready',
      size: '4.1 MB',
      format: 'Excel'
    },
    {
      id: 'REP-6012',
      name: 'Security Unknown Face Tracking Vector Archive',
      generatedDate: '2026-06-28 02:15 PM',
      generatedBy: 'Security Lead',
      type: 'Unknown Face Report',
      status: 'Ready',
      size: '850 KB',
      format: 'CSV'
    }
  ]);

  // Security Toggles & Audit Logs
  const [rolePermissions, setRolePermissions] = useState({
    admin: { view: true, generate: true, schedule: true, delete: true },
    operator: { view: true, generate: true, schedule: false, delete: false },
    viewer: { view: true, generate: false, schedule: false, delete: false }
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: 'AUD-94',
      timestamp: '2026-07-11 11:02:15',
      user: 'admin@facevision.ai',
      role: 'Administrator',
      action: 'PDF Export Download',
      targetReport: 'REP-9021',
      ipAddress: '192.168.10.45'
    },
    {
      id: 'AUD-91',
      timestamp: '2026-07-10 16:15:30',
      user: 'operator.jane@facevision.ai',
      role: 'Operator',
      action: 'Report Archive Created',
      targetReport: 'REP-8854',
      ipAddress: '192.168.10.88'
    },
    {
      id: 'AUD-88',
      timestamp: '2026-07-09 09:30:12',
      user: 'dean.viewer@academy.edu',
      role: 'Viewer',
      action: 'Secure Live Preview Rendered',
      targetReport: 'REP-7491',
      ipAddress: '10.0.4.112'
    }
  ]);

  // Scheduled Reports Modals / Forms
  const [newSchedName, setNewSchedName] = useState('');
  const [newSchedFreq, setNewSchedFreq] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Semester' | 'Yearly'>('Weekly');
  const [newSchedFormat, setNewSchedFormat] = useState<'PDF' | 'Excel' | 'CSV' | 'JSON'>('PDF');
  const [newSchedEmail, setNewSchedEmail] = useState('');

  // Notification System
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Fallback rich lists for visual graph fidelity
  const attendanceTrendData = [
    { day: '07/05', present: 94, target: 95 },
    { day: '07/06', present: 95.8, target: 95 },
    { day: '07/07', present: 96.2, target: 95 },
    { day: '07/08', present: 93.1, target: 95 },
    { day: '07/09', present: 95.5, target: 95 },
    { day: '07/10', present: 97.4, target: 95 },
    { day: '07/11', present: 94.2, target: 95 }
  ];

  const recognitionAccuracyData = [
    { hour: '08:00', acc: 99.4 },
    { hour: '09:00', acc: 99.65 },
    { hour: '10:00', acc: 99.82 },
    { hour: '11:00', acc: 99.51 },
    { hour: '12:00', acc: 99.12 },
    { hour: '13:00', acc: 99.78 },
    { hour: '14:00', acc: 99.62 },
    { hour: '15:00', acc: 99.89 }
  ];

  const departmentCompareData = [
    { name: 'Computer Vision', rate: 98.4, counts: 45 },
    { name: 'AI & Robotics', rate: 96.2, counts: 38 },
    { name: 'Bio-Computing', rate: 94.8, counts: 25 },
    { name: 'Cyber Security', rate: 91.5, counts: 30 },
    { name: 'Quantum Dev', rate: 100.0, counts: 12 }
  ];

  const studentRankingData = [
    { name: 'John Connor', rate: 98.8, logs: 24 },
    { name: 'Sarah Connor', rate: 100.0, logs: 24 },
    { name: 'Elena Rostova', rate: 95.5, logs: 22 },
    { name: 'Miles Dyson', rate: 100.0, logs: 24 },
    { name: 'Robert Brewster', rate: 91.2, logs: 20 }
  ];

  // Dynamic Heatmap Array
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const heatmapTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  const heatmapMatrix = [
    [98, 92, 45, 12, 10, 48, 85, 34],
    [96, 94, 38, 15, 8, 30, 78, 28],
    [99, 90, 42, 10, 15, 35, 80, 31],
    [95, 95, 52, 22, 11, 41, 74, 40],
    [92, 88, 31, 8, 5, 18, 50, 15]
  ];

  // AI-Insights array based on selected parameters
  const aiGeneratedInsights = [
    {
      id: 'insight-1',
      title: 'Ingress Efficiency Uplift',
      text: 'Attendance rate increased by 12% in CS division compared to last month due to parallel multi-face capture optimization.',
      type: 'success',
      badge: 'Performance'
    },
    {
      id: 'insight-2',
      title: 'Biometric Integrity Calibration',
      text: 'Recognition accuracy improved to 99.62% following the ResNet-50 landmark weighting alignment.',
      type: 'info',
      badge: 'Biometrics'
    },
    {
      id: 'insight-3',
      title: 'Academic Risk Warnings',
      text: '3 students identified below the 85% attendance critical academic threshold. Auto-dispatching alerts to course leaders.',
      type: 'warning',
      badge: 'Risk Monitor'
    },
    {
      id: 'insight-4',
      title: 'Temporal Congestion Verified',
      text: 'Peak attendance hours verified: 08:15 AM - 08:30 AM (82.4% of entire campus logs occur in this 15-minute slot).',
      type: 'info',
      badge: 'Traffic'
    }
  ];

  // Action: Compile New Report Trigger
  const triggerCompileReport = () => {
    setIsCompiling(true);
    setCompileProgress(0);
    setCompiledReport(null);
    addToast('Synthesizing biometrics report archives and vector trends...', 'info');

    const interval = setInterval(() => {
      setCompileProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            setCompiledReport({
              id: `REP-${Math.floor(1000 + Math.random() * 8999)}`,
              title: getReportTitle(),
              category: selectedCategory,
              dept: selectedDept === 'all' ? 'All Divisions' : selectedDept,
              dateRange: dateRange,
              generatedAt: new Date().toLocaleString(),
              hash: 'sha256-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              attendancePercent: 95.8,
              unresolvedFacesCount: 2,
              accuracyRate: 99.62
            });
            addToast('Intelligent SaaS Report compiled! Preview updated on canvas.', 'success');
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Helper to generate dynamic title
  const getReportTitle = () => {
    const catName = selectedCategory.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const deptName = selectedDept === 'all' ? 'Campus-Wide' : selectedDept;
    return `${deptName} - ${catName} & Analytical Ledger`;
  };

  // Quick Report presets handler
  const handleQuickReportSelect = (preset: string) => {
    setSelectedQuickReport(preset);
    const todayStr = '2026-07-11';
    switch (preset) {
      case 'today':
        setDateRange(`${todayStr} to ${todayStr}`);
        addToast('Pre-filtered parameters for Today\'s Ingress records.', 'info');
        break;
      case 'yesterday':
        setDateRange('2026-07-10 to 2026-07-10');
        addToast('Pre-filtered parameters for Yesterday\'s records.', 'info');
        break;
      case 'last-7-days':
        setDateRange('2026-07-05 to 2026-07-11');
        addToast('Pre-filtered parameters for Last 7 Days (Standard rolling cycle).', 'info');
        break;
      case 'last-30-days':
        setDateRange('2026-06-12 to 2026-07-11');
        addToast('Pre-filtered parameters for Last 30 Days (Monthly report).', 'info');
        break;
      case 'semester':
        setDateRange('2026-04-01 to 2026-07-11');
        addToast('Pre-filtered parameters for Spring-Summer Semester.', 'info');
        break;
      case 'academic-year':
        setDateRange('2025-09-01 to 2026-07-11');
        addToast('Pre-filtered parameters for current Academic Year.', 'info');
        break;
      default:
        break;
    }
  };

  // Report Category Auto Configuration click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    addToast(`Calibrating builder console for ${category.replace('_', ' ')} format templates.`, 'info');
  };

  // Action: Add Scheduled Dispatch
  const handleCreateSchedule = (e: FormEvent) => {
    e.preventDefault();
    if (!newSchedName || !newSchedEmail) {
      addToast('Please complete report name and target email address.', 'warning');
      return;
    }
    const newId = `SCH-${Math.floor(100 + Math.random() * 899)}`;
    const newSched: ScheduledReportItem = {
      id: newId,
      name: newSchedName,
      frequency: newSchedFreq,
      format: newSchedFormat,
      recipients: [newSchedEmail],
      nextRun: '2026-07-14 08:00 AM',
      status: 'Active'
    };

    setSchedules([newSched, ...schedules]);
    addToast(`New recurring report "${newSchedName}" scheduled for dispatch successfully.`, 'success');
    setNewSchedName('');
    setNewSchedEmail('');
  };

  // Action: Toggle Schedule Status
  const toggleScheduleStatus = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Paused' : 'Active';
        addToast(`Report dispatch ${s.id} is now ${nextStatus}.`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Action: Delete Schedule
  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addToast(`Scheduled job ${id} terminated.`, 'warning');
  };

  // Action: Delete History item
  const deleteHistoryItem = (id: string) => {
    setHistoryItems(prev => prev.filter(h => h.id !== id));
    addToast(`Report file ${id} deleted from secure server logs permanently.`, 'warning');
  };

  // Action: Duplicate History item
  const duplicateHistoryItem = (item: ReportHistoryItem) => {
    const newItem: ReportHistoryItem = {
      ...item,
      id: `REP-${Math.floor(1000 + Math.random() * 8999)}`,
      name: `${item.name} (Copy)`,
      generatedDate: new Date().toLocaleString()
    };
    setHistoryItems([newItem, ...historyItems]);
    addToast(`Duplicated report file as ${newItem.id}.`, 'success');
  };

  // Action: Download / Print triggers
  const triggerDownloadAction = (format: string, reportId?: string) => {
    const targetId = reportId || compiledReport?.id || '2026';
    addToast(`Establishing secure SSL download session for ${format} payload...`, 'info');
    
    // Log download event to security audit logs
    const newAudit: SecurityAuditLog = {
      id: `AUD-${Math.floor(10 + Math.random() * 89)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'admin@facevision.ai',
      role: 'Administrator',
      action: `${format} Secure Download`,
      targetReport: targetId,
      ipAddress: '192.168.10.45'
    };
    setAuditLogs([newAudit, ...auditLogs]);

    setTimeout(() => {
      addToast(`Encrypted File FaceVision_Report_${targetId}.${format.toLowerCase()} saved successfully.`, 'success');
    }, 1500);
  };

  const triggerPrintAction = () => {
    addToast('Spooling vectors to system printer...', 'info');
    setTimeout(() => {
      alert('Local Print Spooler initialized. Standards window launched.');
    }, 800);
  };

  return (
    <div id="reports-workspace-view" className="space-y-6 pb-16 relative">
      
      {/* LOCAL ALERTS & TOASTS STACK */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${
                t.type === 'warning' 
                  ? 'bg-rose-950/85 border-rose-800 text-rose-300'
                  : t.type === 'info'
                    ? 'bg-slate-900/95 border-slate-750 text-slate-300'
                    : 'bg-emerald-950/85 border-emerald-800 text-emerald-300'
              }`}
            >
              <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${
                t.type === 'warning' ? 'text-rose-400' : t.type === 'info' ? 'text-blue-400' : 'text-emerald-400'
              }`} />
              <div className="text-xs font-mono leading-relaxed">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CORE HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">SECURE DIGITAL ARCHIVE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reports Center</h1>
          <p className="text-xs text-slate-400">Generate, schedule, export, and manage intelligent attendance and AI recognition reports.</p>
        </div>

        {/* Dynamic header control shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTab('builder');
              triggerCompileReport();
            }}
            disabled={isCompiling}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/15"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate New Report</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('schedules');
              addToast('Dispatch scheduler panel active below.', 'info');
            }}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Schedule Report</span>
          </button>

          <button
            onClick={() => triggerDownloadAction(reportFormat)}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export ({reportFormat})</span>
          </button>

          <button
            onClick={triggerPrintAction}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* THREE-WAY ARCHITECTURAL VIEW TABS */}
      <div className="flex border-b border-slate-850 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-950/20 p-1.5 rounded-2xl border border-slate-900">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeTab === 'builder' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Report Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeTab === 'schedules' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Dispatches ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeTab === 'history' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Archive & Security Log</span>
        </button>
      </div>

      {/* VIEWPORT SWITCH CONTAINER */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: REPORT STUDIO (BUILDER & CATEGORIES & LIVE PREVIEW) */}
        {activeTab === 'builder' && (
          <motion.div
            key="studio-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 1. REPORT CATEGORIES CARD ROW (Horizontal Scrollable Grid) */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">1. Select Template Category</span>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {[
                  { id: 'attendance', name: 'Attendance Report', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5 hover:bg-emerald-500/10' },
                  { id: 'student_perf', name: 'Student Perf.', icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/5 hover:bg-blue-500/10' },
                  { id: 'department', name: 'Department Report', icon: Building, color: 'text-teal-400', bg: 'bg-teal-500/5 hover:bg-teal-500/10' },
                  { id: 'faculty', name: 'Faculty Ledger', icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/5 hover:bg-indigo-500/10' },
                  { id: 'ai_recognition', name: 'AI Recognition', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/5 hover:bg-purple-500/10' },
                  { id: 'unknown_face', name: 'Unknown Faces', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/5 hover:bg-rose-500/10' },
                  { id: 'camera_perf', name: 'Camera Perf.', icon: Camera, color: 'text-amber-400', bg: 'bg-amber-500/5 hover:bg-amber-500/10' },
                  { id: 'system_health', name: 'System Health', icon: Server, color: 'text-pink-400', bg: 'bg-pink-500/5 hover:bg-pink-500/10' },
                  { id: 'monthly', name: 'Monthly Report', icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/5 hover:bg-sky-500/10' },
                  { id: 'yearly', name: 'Yearly Report', icon: FileSpreadsheet, color: 'text-yellow-400', bg: 'bg-yellow-500/5 hover:bg-yellow-500/10' },
                ].map(cat => {
                  const CatIcon = cat.icon;
                  const isSel = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                        isSel 
                          ? 'bg-slate-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : `${cat.bg} border-slate-800/60`
                      }`}
                    >
                      <CatIcon className={`w-5 h-5 mb-1.5 ${isSel ? 'text-blue-400 animate-pulse' : cat.color}`} />
                      <span className="text-[10px] font-extrabold text-white leading-tight block truncate">{cat.name}</span>
                      <span className="text-[8px] text-slate-500 font-mono block mt-1">Config template</span>
                      
                      {isSel && (
                        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. QUICK PRESET DISPATCH BUTTONS */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">2. Quick Preset Segments</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'today', name: "Today's Ingress", val: 'Jul 11, 2026' },
                  { id: 'yesterday', name: "Yesterday's Ingress", val: 'Jul 10, 2026' },
                  { id: 'last-7-days', name: "Last 7 Days Rolling", val: 'Jul 05 - Jul 11' },
                  { id: 'last-30-days', name: "Last 30 Days Closeout", val: 'June-July Cycle' },
                  { id: 'semester', name: "Current Semester Audit", val: 'S-S 2026' },
                  { id: 'academic-year', name: "Current Academic Year", val: 'AY 2025-26' },
                ].map(qp => {
                  const isSel = selectedQuickReport === qp.id;
                  return (
                    <button
                      key={qp.id}
                      onClick={() => handleQuickReportSelect(qp.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 cursor-pointer ${
                        isSel 
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-sm' 
                          : 'bg-[#111827]/40 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-blue-400' : 'bg-slate-600'}`} />
                      <span>{qp.name}</span>
                      <span className="text-[8px] font-mono text-slate-500 font-normal">({qp.val})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SPLIT WORKSPACE: CUSTOM BUILDER (Left) & LIVE PREVIEW (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* BUILDER PANEL (4 Columns) */}
              <div className="lg:col-span-4 bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-5 backdrop-blur-md">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Custom Parameter Matrix</h3>
                    <p className="text-[10px] text-slate-500">Fine-tune telemetry filter rules</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Filter: Date Range */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Date Range Window</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                        placeholder="YYYY-MM-DD to YYYY-MM-DD"
                      />
                    </div>
                  </div>

                  {/* Row: Dept & Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Department</label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Divisions</option>
                        <option value="Computer Vision">Computer Vision</option>
                        <option value="AI & Robotics">AI & Robotics</option>
                        <option value="Bio-Computing">Bio-Computing</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Quantum Dev">Quantum Dev</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Academic Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Semesters</option>
                        <option value="2026">2026 Academic</option>
                        <option value="2025">2025 Academic</option>
                        <option value="2024">2024 Academic</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Section & Faculty */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Section / Division</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Sections</option>
                        <option value="Div-Alpha">Division Alpha</option>
                        <option value="Div-Beta">Division Beta</option>
                        <option value="Div-Gamma">Division Gamma</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Instructor / Faculty</label>
                      <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Faculty Leads</option>
                        <option value="Dr. Sarah Connor">Dr. Sarah Connor</option>
                        <option value="Prof. Miles Dyson">Prof. Miles Dyson</option>
                        <option value="Dr. Katherine Brewster">Dr. K. Brewster</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Student & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Target Student</label>
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Registrants</option>
                        {students.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Attendance Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present (Verified)</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late Arrival</option>
                      </select>
                    </div>
                  </div>

                  {/* Slider: Recognition Confidence */}
                  <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Recognition Confidence</label>
                      <span className="text-[10px] text-blue-400 font-mono font-bold">&gt; {selectedConfidence}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={selectedConfidence}
                      onChange={(e) => setSelectedConfidence(Number(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-900 cursor-pointer h-1 rounded"
                    />
                  </div>

                  {/* Row: Camera & Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Telemetry Camera</label>
                      <select
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Cameras</option>
                        <option value="cam-01">Entrance Lobby Cam-01</option>
                        <option value="cam-02">CS Main Laboratory Cam-02</option>
                        <option value="cam-03">Robotics Research Lab Cam-03</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Capture Location</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Locations</option>
                        <option value="Block-A">Engineering Block A</option>
                        <option value="Block-C">Research Annex Block C</option>
                        <option value="Main-Hall">Campus Assembly Hall</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Time Range & Output Format */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Time Range Slot</label>
                      <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">Full Academic Day</option>
                        <option value="morning">Morning Ingress (08:00 - 11:59)</option>
                        <option value="afternoon">Afternoon Session (12:00 - 15:59)</option>
                        <option value="evening">Late Override (16:00+)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Report Format</label>
                      <select
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="PDF">PDF document (.pdf)</option>
                        <option value="Excel">Excel spreadsheet (.xlsx)</option>
                        <option value="CSV">CSV log list (.csv)</option>
                        <option value="JSON">JSON vector schema (.json)</option>
                      </select>
                    </div>
                  </div>

                  {/* ACTION: GENERATE NEW REPORT */}
                  <button
                    onClick={triggerCompileReport}
                    disabled={isCompiling}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 cursor-pointer pt-4.5 mt-3"
                  >
                    {isCompiling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Compiling Matrix: {compileProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current text-white" />
                        <span>Compile Biometric Audit</span>
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* REPORT PREVIEW (8 Columns) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* PREVIEW CONTAINER CANVAS */}
                <div className="bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 shadow-2xl relative min-h-[600px] flex flex-col justify-between backdrop-blur-md">
                  
                  {isCompiling ? (
                    /* COMPILING SKELETON DISPLAY */
                    <div className="my-auto flex flex-col items-center justify-center text-center py-20 space-y-4">
                      <div className="relative w-16 h-16 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                        <div className="absolute inset-0 rounded-full border border-blue-400/10 scale-125 animate-ping" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Assembling Vector Records</h4>
                        <p className="text-xs text-slate-400">Filtering telemetry indices, verifying face quality threshold factors, and embedding SVG charts.</p>
                      </div>
                      
                      <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full duration-300" style={{ width: `${compileProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{compileProgress}% SHA-256 validation complete</span>
                    </div>
                  ) : compiledReport ? (
                    
                    /* GENERATED LIVE REPORT CONTENT */
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      
                      {/* PREVIEW HEADER */}
                      <div className="border-b border-slate-850 pb-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          
                          {/* Institution/Lab Identity Logo */}
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/25">
                              <Globe className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider">FaceVision AI Research Hub</h4>
                              <p className="text-[9px] text-slate-500 font-mono">Academic Ingress Security Cluster • FIPS Verified</p>
                            </div>
                          </div>

                          <div className="text-right font-mono text-[9px] text-slate-500 space-y-1">
                            <div>Document Ref: <strong className="text-slate-300">{compiledReport.id}</strong></div>
                            <div>Archive State: <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold uppercase tracking-wider">SECURE PREVIEW</span></div>
                          </div>
                        </div>

                        {/* Title & Scope */}
                        <div className="mt-4 space-y-1">
                          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-900">
                            Active Template: {selectedCategory.replace('_', ' ').toUpperCase()}
                          </span>
                          <h2 className="text-lg font-extrabold text-white tracking-tight pt-1">{compiledReport.title}</h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-slate-400">
                            <span className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>Window: <strong className="text-slate-300">{compiledReport.dateRange}</strong></span>
                            </span>
                            <span className="flex items-center space-x-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              <span>Department: <strong className="text-slate-300">{compiledReport.dept}</strong></span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY METRICS ROW (4 Stats) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/45 border border-slate-900/60 p-4 rounded-2xl">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono text-slate-500">Mean Ingress Rate</span>
                          <span className="text-lg font-extrabold font-mono text-white block">{compiledReport.attendancePercent}%</span>
                          <span className="text-[8px] text-emerald-400 font-mono">▲ 1.1% variance</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono text-slate-500">F1 Model Accuracy</span>
                          <span className="text-lg font-extrabold font-mono text-blue-400 block">{compiledReport.accuracyRate}%</span>
                          <span className="text-[8px] text-slate-500 font-mono">InsightFace weights</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono text-slate-500">Security Anomalies</span>
                          <span className="text-lg font-extrabold font-mono text-rose-400 block">{compiledReport.unresolvedFacesCount}</span>
                          <span className="text-[8px] text-rose-400/80 font-mono">Unregistered faces</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono text-slate-500">Database Integrity</span>
                          <span className="text-lg font-extrabold font-mono text-emerald-400 block">100%</span>
                          <span className="text-[8px] text-slate-500 font-mono">SHA-256 Sealed</span>
                        </div>
                      </div>

                      {/* VISUAL ANALYTICS INSIDE REPORT PREVIEW (Two charts side by side or tabs) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Chart A: Attendance Ingress Trend */}
                        <div className="bg-slate-950/30 border border-slate-900 p-4 rounded-2xl space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Telemetry Ingress Trend</span>
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={attendanceTrendData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="prevColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="day" stroke="#475569" fontSize={8} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={[85, 100]} />
                                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#prevColor)" name="Present %" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Chart B: Recognition Accuracy by Hour */}
                        <div className="bg-slate-950/30 border border-slate-900 p-4 rounded-2xl space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">AI Landmark Confidences</span>
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={recognitionAccuracyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="hour" stroke="#475569" fontSize={8} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={[98, 100]} />
                                <Line type="monotone" dataKey="acc" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Confidence %" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                      </div>

                      {/* DATA SUBSET PREVIEW TABLE */}
                      <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/25">
                        <div className="bg-slate-950/60 px-4 py-2 text-[9px] font-mono text-slate-400 flex justify-between items-center border-b border-slate-850">
                          <span>Live Database Filter Subset (Showing matching logs)</span>
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">{attendance.length} items parsed</span>
                        </div>
                        <div className="divide-y divide-slate-850/40 text-[10px] max-h-40 overflow-y-auto scrollbar-none">
                          {attendance.length > 0 ? (
                            attendance.map((rec, index) => (
                              <div key={rec.id || index} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-900/30 transition-all text-slate-300">
                                <div className="flex items-center space-x-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span className="font-bold text-white">{rec.studentName}</span>
                                  <span className="text-slate-500 text-[9px]">({rec.studentId})</span>
                                </div>
                                <span className="text-slate-500 font-mono text-[9px]">{rec.department}</span>
                                <div className="flex items-center space-x-3 font-mono">
                                  <span className="text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                                  <span className={`text-[9px] font-bold uppercase ${rec.status === 'present' ? 'text-emerald-400' : 'text-amber-400'}`}>{rec.status}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-500">No telemetry log entries found matching filter matrix constraints.</div>
                          )}
                        </div>
                      </div>

                      {/* AI RECOMMENDATIONS & HIGHLIGHTS */}
                      <div className="bg-indigo-950/20 border border-indigo-500/15 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                          <span className="text-xs font-extrabold text-white">AI-Generated Insights & Recommendations</span>
                        </div>
                        <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-1 leading-relaxed">
                          <li>Peak biometric captures verified near main entrance between 08:15 - 08:30 (CS block). Recommend standardizing lighting thresholds.</li>
                          <li>Attendance is below standard 85% benchmark for 3 students. Auto notifications prepared for course coordinator.</li>
                        </ul>
                      </div>

                      {/* PREVIEW FOOTER */}
                      <div className="border-t border-slate-850/85 pt-4 flex flex-col md:flex-row md:items-center justify-between text-[8px] font-mono text-slate-500 gap-4 mt-2">
                        <div className="space-y-0.5">
                          <p>SEALED INTEGRITY RECORD HASH: <span className="text-slate-400">{compiledReport.hash}</span></p>
                          <p>FaceVision AI v2.4 SaaS Gateway • Generated by: {compiledReport.generatedAt}</p>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <button
                            onClick={() => triggerDownloadAction(reportFormat, compiledReport.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer transition-all text-[9px]"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Download {reportFormat}</span>
                          </button>
                          
                          <button
                            onClick={triggerPrintAction}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer transition-all text-[9px]"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Report</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* INITIAL IDLE CANVAS STATE */
                    <div className="my-auto flex flex-col items-center justify-center text-center py-24 space-y-4 text-slate-500">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950/65 border border-slate-850 flex items-center justify-center text-slate-400 shadow-xl">
                        <FileText className="w-6.5 h-6.5" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-sm font-bold text-slate-300">Biometrics Report Preview Canvas</h4>
                        <p className="text-xs text-slate-500">Configure parameters on the left builder console or select a category standard template, then click "Compile Biometric Audit" to render SaaS data streams.</p>
                      </div>

                      {/* QUICK ANALYTICS METADATA PREVIEW */}
                      <div className="grid grid-cols-2 gap-3 pt-4 w-full max-w-sm">
                        <div className="bg-slate-950/35 border border-slate-900 p-3 rounded-xl text-left">
                          <span className="text-[8px] uppercase font-mono text-slate-600 block">Total Records Available</span>
                          <span className="text-xs font-bold text-slate-400 block mt-0.5">{attendance.length || 124} events</span>
                        </div>
                        <div className="bg-slate-950/35 border border-slate-900 p-3 rounded-xl text-left">
                          <span className="text-[8px] uppercase font-mono text-slate-600 block">System Verification Status</span>
                          <span className="text-xs font-bold text-emerald-400 block mt-0.5">Optimal (99.6%)</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* 4. AI INTUITIVE INSIGHTS STREAM (Animated cards) */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Live AI Insight Stream</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiGeneratedInsights.map(insight => (
                      <div 
                        key={insight.id}
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                          insight.type === 'warning' 
                            ? 'bg-rose-950/15 border-rose-900/60 text-slate-300' 
                            : insight.type === 'success'
                              ? 'bg-emerald-950/15 border-emerald-900/60 text-slate-300'
                              : 'bg-indigo-950/15 border-indigo-900/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-extrabold text-white">{insight.title}</span>
                          </div>
                          <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 bg-slate-900 rounded border border-slate-850 font-semibold">{insight.badge}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: SCHEDULED DISPATCHES */}
        {activeTab === 'schedules' && (
          <motion.div
            key="schedules-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left: Schedule Configurator (5 Columns) */}
            <div className="lg:col-span-5 bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-5 backdrop-blur-md">
              <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                <Calendar className="w-4.5 h-4.5 text-purple-400" />
                <div>
                  <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Recurring Dispatch scheduler</h3>
                  <p className="text-[10px] text-slate-500">Automate analytical PDF/Excel distribution</p>
                </div>
              </div>

              <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Report Schedule Name</label>
                  <input
                    type="text"
                    value={newSchedName}
                    onChange={(e) => setNewSchedName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Monthly Executive Ingress Audit"
                  />
                </div>

                {/* Email Recipients */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Primary recipient Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={newSchedEmail}
                      onChange={(e) => setNewSchedEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                      placeholder="dean.office@academy.edu"
                    />
                  </div>
                </div>

                {/* Row: Frequency & Format */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Dispatch Frequency</label>
                    <select
                      value={newSchedFreq}
                      onChange={(e: any) => setNewSchedFreq(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Daily">Daily Ingress Alert</option>
                      <option value="Weekly">Weekly Standard Loop</option>
                      <option value="Monthly">Monthly Closeout Ledger</option>
                      <option value="Semester">Semester Grade Audit</option>
                      <option value="Yearly">Yearly Archive Close</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Payload format</label>
                    <select
                      value={newSchedFormat}
                      onChange={(e: any) => setNewSchedFormat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="PDF">PDF document (.pdf)</option>
                      <option value="Excel">Excel workbook (.xlsx)</option>
                      <option value="CSV">CSV tabular log (.csv)</option>
                      <option value="JSON">JSON metadata vector (.json)</option>
                    </select>
                  </div>
                </div>

                {/* Secure auth lock notice */}
                <div className="p-3 bg-slate-950/70 border border-slate-900 rounded-xl flex items-start space-x-2.5">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Automated report emails are encrypted with FaceVision cryptosystem keys. Standard audit recipient logs are recorded under access controls.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Activate Schedule Hook</span>
                </button>

              </form>
            </div>

            {/* Right: Active Schedules List (7 Columns) */}
            <div className="lg:col-span-7 bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
              <div className="space-y-1 border-b border-slate-850 pb-3">
                <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Active Automated Dispatches</h3>
                <p className="text-[10px] text-slate-500">Live cron schedules sending biometrics telemetry</p>
              </div>

              <div className="space-y-3">
                {schedules.map(sch => (
                  <div key={sch.id} className="bg-slate-950/50 border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-800">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-mono text-purple-400 bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded">
                          {sch.frequency}
                        </span>
                        <span className="text-xs font-bold text-white">{sch.name}</span>
                      </div>

                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <p className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-600" />
                          <span className="truncate max-w-xs">{sch.recipients.join(', ')}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Next Run: {sch.nextRun} • Payload: {sch.format}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Active status button */}
                      <button
                        onClick={() => toggleScheduleStatus(sch.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          sch.status === 'Active'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-900 border border-slate-800 text-slate-500'
                        }`}
                      >
                        {sch.status === 'Active' ? '● Active' : '○ Paused'}
                      </button>

                      {/* Trigger instantly */}
                      <button
                        onClick={() => {
                          addToast(`Instant manual dispatch triggered for job ${sch.id}.`, 'success');
                          triggerDownloadAction(sch.format, sch.id);
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Send Instant Email"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteSchedule(sch.id)}
                        className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-950 text-rose-400 rounded-lg transition-all cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <div className="py-12 text-center text-slate-500">No automated report schedules currently active. Use the manager to schedule one.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ARCHIVE & SECURITY LOCK */}
        {activeTab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* TOP DUAL PANELS: ROLE BASED ACCESS & AUDIT TELEMETRY LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Panel: Role Permissions Toggles (5 Columns) */}
              <div className="lg:col-span-5 bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-teal-400" />
                  <div>
                    <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Role-Based Access Matrix</h3>
                    <p className="text-[10px] text-slate-500">Configure file download and preview limits</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Row: Administrator */}
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-2xl border border-slate-900 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                      <span className="font-bold text-white">Administrator</span>
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Unrestricted</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-400">
                      <span className="text-emerald-400">✓ Read</span>
                      <span className="text-emerald-400">✓ Write</span>
                      <span className="text-emerald-400">✓ Schedule</span>
                      <span className="text-emerald-400">✓ Delete</span>
                    </div>
                  </div>

                  {/* Row: Operator */}
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-2xl border border-slate-900 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                      <span className="font-bold text-white">Operator / Course Lead</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Partial Restrict</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-400">
                      <span className="text-emerald-400">✓ Read</span>
                      <span className="text-emerald-400">✓ Write</span>
                      <span className="text-rose-500">✗ Schedule</span>
                      <span className="text-rose-500">✗ Delete</span>
                    </div>
                  </div>

                  {/* Row: Viewer */}
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-2xl border border-slate-900 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                      <span className="font-bold text-white">Viewer / External Auditor</span>
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase tracking-wider">Read Only</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-400">
                      <span className="text-emerald-400">✓ Read</span>
                      <span className="text-rose-500">✗ Write</span>
                      <span className="text-rose-500">✗ Schedule</span>
                      <span className="text-rose-500">✗ Delete</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Panel: Download History & Audit Logs (7 Columns) */}
              <div className="lg:col-span-7 bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-3 backdrop-blur-md">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-2">
                  <Activity className="w-4.5 h-4.5 text-emerald-400" />
                  <div>
                    <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Digital Security & Audit Logs</h3>
                    <p className="text-[10px] text-slate-500">Real-time log of report generations and downloads</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none">
                  {auditLogs.map(log => (
                    <div key={log.id} className="bg-slate-950/45 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <span className="font-bold text-white">{log.user}</span>
                          <span className="text-[9px] text-slate-500">({log.role})</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">Action: <span className="text-blue-400 font-bold">{log.action}</span> on target <strong className="text-slate-300">{log.targetReport}</strong></p>
                      </div>

                      <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                        <span className="block">{log.timestamp}</span>
                        <span className="block text-slate-600">IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* LOWER FULL WIDTH ROW: PRE-GENERATED ARCHIVE REPORT LEDGER */}
            <div className="bg-[#111827]/55 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-3">
                <div className="space-y-1">
                  <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Compiled Report Archive Index</h3>
                  <p className="text-[10px] text-slate-500">Locate historically compiled files saved on server nodes</p>
                </div>

                {/* Local search bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    placeholder="Search archives by title..."
                  />
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto whitespace-nowrap">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-3 px-4">Report Identifier</th>
                      <th className="py-3 px-4">Title / Name</th>
                      <th className="py-3 px-4">Generated Date</th>
                      <th className="py-3 px-4">By Operator</th>
                      <th className="py-3 px-4">Template Type</th>
                      <th className="py-3 px-4">Size & Format</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40 text-slate-300 font-mono">
                    {historyItems
                      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(item => (
                        <tr key={item.id} className="hover:bg-slate-900/25 transition-all">
                          <td className="py-3 px-4 font-bold text-slate-400">{item.id}</td>
                          <td className="py-3 px-4 text-white font-sans font-bold">{item.name}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{item.generatedDate}</td>
                          <td className="py-3 px-4 text-slate-300 font-sans">{item.generatedBy}</td>
                          <td className="py-3 px-4">
                            <span className="text-[9px] font-sans font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15 px-2 py-0.5 rounded">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {item.size} • <span className="text-yellow-400 font-bold">{item.format}</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {/* Download */}
                            <button
                              onClick={() => triggerDownloadAction(item.format, item.id)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 rounded-lg border border-slate-850 transition-all cursor-pointer text-[10px]"
                              title="Download Raw File"
                            >
                              Download
                            </button>

                            {/* Preview */}
                            <button
                              onClick={() => {
                                setCompiledReport({
                                  id: item.id,
                                  title: item.name,
                                  category: item.type.toLowerCase().replace(' ', '_'),
                                  dept: 'Engineering Division',
                                  dateRange: '2026-07-05 to 2026-07-11',
                                  generatedAt: item.generatedDate,
                                  hash: 'sha256-' + Math.random().toString(36).substring(2, 10),
                                  attendancePercent: 96.1,
                                  unresolvedFacesCount: 1,
                                  accuracyRate: 99.85
                                });
                                setActiveTab('builder');
                                addToast(`Loaded archive report ${item.id} preview.`, 'success');
                              }}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-blue-400 rounded-lg border border-slate-850 transition-all cursor-pointer text-[10px]"
                              title="Load on Preview Canvas"
                            >
                              Preview
                            </button>

                            {/* Duplicate */}
                            <button
                              onClick={() => duplicateHistoryItem(item)}
                              className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-all cursor-pointer text-[10px]"
                              title="Duplicate Record"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteHistoryItem(item.id)}
                              className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-950 text-rose-400 rounded-lg transition-all cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                    {historyItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">No compiled reports indexed in active database directory.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
