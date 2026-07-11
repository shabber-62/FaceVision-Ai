import { useState, useMemo, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  X,
  Thermometer,
  ShieldAlert,
  Printer,
  Mail,
  UserCheck,
  RefreshCw,
  Sliders,
  Database,
  Sparkles,
  Cpu,
  Trash2,
  Eye,
  Activity,
  AlertTriangle,
  UserX,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart as LucidePieChart,
  Grid,
  Info,
  CalendarDays,
  FileCheck2,
  Bell,
  Network,
  Server,
  HardDrive,
  Share2,
  Zap,
  Brain,
  Check,
  Hourglass,
  HelpCircle
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

export default function AnalyticsView() {
  // Navigation Tabs for the Analytics Sub-modules
  // 'overview', 'attendance', 'ai_biometrics', 'sensors_system', 'export_scheduler'
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'ai_biometrics' | 'sensors_system' | 'export_scheduler'>('overview');
  
  // States for general filters and selectors
  const [timeframe, setTimeframe] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [attendanceChartType, setAttendanceChartType] = useState<'bar' | 'area' | 'line'>('area');
  const [deptFilter, setDeptFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  // Export / Scheduler states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState('https://facevision.ai/dashboards/share-auth_key=fv_secure_9242');
  
  // Scheduler parameters
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleFormat, setScheduleFormat] = useState<'pdf' | 'csv'>('pdf');
  const [scheduleScope, setScheduleScope] = useState('all');

  // Triggering visual toasts
  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Simulated Reload Sequence
  const handleRefreshData = () => {
    setIsLoading(true);
    addToast('Contacting remote edge sensors... refreshing datasets.', 'info');
    setTimeout(() => {
      setIsLoading(false);
      addToast('Analytics dashboard recalibrated successfully!', 'success');
    }, 850);
  };

  // Simulated Report Builder
  const handleGenerateReport = () => {
    setIsExporting(true);
    setExportProgress(0);
    addToast('Compiling analytical intelligence assets...', 'info');
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            addToast('SaaS Intelligence report created! Check downloads directory.', 'success');
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Schedule Save Handler
  const handleSaveSchedule = (e: FormEvent) => {
    e.preventDefault();
    if (!scheduleEmail) {
      addToast('Please enter a valid administrator email address.', 'warning');
      return;
    }
    addToast(`Report dispatch active: sending ${scheduleScope} as ${scheduleFormat.toUpperCase()} to ${scheduleEmail} (${scheduleFreq})`, 'success');
    setScheduleEmail('');
  };

  // Copy shareable URL helper
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    addToast('Secure workspace invitation copied to clipboard!', 'success');
  };

  // Interactive Attendance Heatmap Matrix
  const heatmapDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const heatmapHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  const heatmapMatrix = [
    [98, 92, 45, 12, 10, 48, 85, 34], // Monday (Spike morning)
    [96, 94, 38, 15, 8, 30, 78, 28],  // Tuesday
    [99, 90, 42, 10, 15, 35, 80, 31], // Wednesday
    [95, 95, 52, 22, 11, 41, 74, 40], // Thursday
    [92, 88, 31, 8, 5, 18, 50, 15]    // Friday (early leaves)
  ];

  const getHeatmapColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500/80 border-emerald-400/40 text-emerald-950 font-bold shadow-[0_0_8px_rgba(34,197,94,0.2)]';
    if (val >= 70) return 'bg-emerald-600/50 border-emerald-600/30 text-emerald-100';
    if (val >= 30) return 'bg-emerald-800/25 border-emerald-800/20 text-emerald-300';
    return 'bg-slate-950/45 border-slate-900/60 text-slate-500';
  };

  // High fidelity chart mock datasets
  const dailyAttendanceData = [
    { time: '08:00', present: 45, late: 2, absent: 88 },
    { time: '08:15', present: 88, late: 12, absent: 35 },
    { time: '08:30', present: 112, late: 18, absent: 5 },
    { time: '08:45', present: 124, late: 6, absent: 5 },
    { time: '09:00', present: 127, late: 3, absent: 5 },
    { time: '10:00', present: 127, late: 0, absent: 8 },
    { time: '12:00', present: 126, late: 0, absent: 9 },
    { time: '15:00', present: 125, late: 0, absent: 10 }
  ];

  const weeklyAttendanceData = [
    { name: 'Mon', present: 124, late: 8, absent: 3 },
    { name: 'Tue', present: 128, late: 4, absent: 3 },
    { name: 'Wed', present: 129, late: 3, absent: 3 },
    { name: 'Thu', present: 122, late: 10, absent: 3 },
    { name: 'Fri', present: 115, late: 12, absent: 8 }
  ];

  const monthlyAttendanceData = [
    { name: 'Week 1', rate: 94.2, baseline: 92.0 },
    { name: 'Week 2', rate: 95.8, baseline: 92.0 },
    { name: 'Week 3', rate: 93.1, baseline: 92.0 },
    { name: 'Week 4', rate: 96.4, baseline: 92.0 }
  ];

  const yearlyAttendanceData = [
    { name: '2024 Academic', rate: 91.4, target: 95.0 },
    { name: '2025 Academic', rate: 93.8, target: 95.0 },
    { name: '2026 Academic', rate: 95.2, target: 95.0 }
  ];

  const departmentComparisonData = [
    { name: 'Engineering', rate: 98.2, count: 42 },
    { name: 'Research & Dev', rate: 100.0, count: 28 },
    { name: 'Operations', rate: 94.1, count: 35 },
    { name: 'Product Mgmt', rate: 91.5, count: 18 },
    { name: 'Human Resources', rate: 88.0, count: 12 }
  ];

  const sectionComparisonData = [
    { name: 'Division Alpha', rate: 97.4 },
    { name: 'Division Beta', rate: 94.8 },
    { name: 'Division Gamma', rate: 91.2 },
    { name: 'Division Delta', rate: 89.5 }
  ];

  const subjectAttendanceData = [
    { name: 'Computer Vision', rate: 96.8, lectures: 24 },
    { name: 'AI & Robotics', rate: 94.2, lectures: 30 },
    { name: 'Neural Networks', rate: 98.1, lectures: 28 },
    { name: 'Cybernetics', rate: 91.4, lectures: 22 },
    { name: 'Digital DSP', rate: 89.2, lectures: 20 }
  ];

  const facultyAttendanceData = [
    { name: 'Dr. Sarah Connor', rate: 97.1 },
    { name: 'Prof. Miles Dyson', rate: 98.4 },
    { name: 'Dr. K. Brewster', rate: 93.8 },
    { name: 'Prof. R. Brewster', rate: 91.2 }
  ];

  // AI Recognition Datasets
  const recAccuracyTrend = [
    { name: 'Jan', acc: 98.45, fips: 99.0 },
    { name: 'Feb', acc: 98.62, fips: 99.0 },
    { name: 'Mar', acc: 98.94, fips: 99.0 },
    { name: 'Apr', acc: 99.12, fips: 99.0 },
    { name: 'May', acc: 99.35, fips: 99.0 },
    { name: 'Jun', acc: 99.51, fips: 99.0 },
    { name: 'Jul', acc: 99.62, fips: 99.0 }
  ];

  const confidenceDistribution = [
    { range: '90-92%', count: 14, color: '#3b82f6' },
    { range: '92-94%', count: 32, color: '#6366f1' },
    { range: '94-96%', count: 124, color: '#8b5cf6' },
    { range: '96-98%', count: 485, color: '#a855f7' },
    { range: '98-100%', count: 1240, color: '#22c55e' }
  ];

  const unknownFaceTrend = [
    { date: '07-05', count: 4 },
    { date: '07-06', count: 1 },
    { date: '07-07', count: 3 },
    { date: '07-08', count: 0 },
    { date: '07-09', count: 2 },
    { date: '07-10', count: 5 },
    { date: '07-11', count: 2 }
  ];

  const recognitionSpeedData = [
    { clients: 1, yolo: 10.4, resnet: 7.1 },
    { clients: 2, yolo: 11.2, resnet: 7.5 },
    { clients: 4, yolo: 12.4, resnet: 8.2 },
    { clients: 8, yolo: 14.8, resnet: 9.6 },
    { clients: 16, yolo: 19.1, resnet: 12.5 }
  ];

  const recognitionSuccessRate = [
    { name: 'Verified Match', value: 99.62, color: '#10b981' },
    { name: 'False Rejection', value: 0.38, color: '#f59e0b' }
  ];

  const faceQualityData = [
    { name: 'Optimal Light', value: 78, color: '#10b981' },
    { name: 'Low Contrast', value: 14, color: '#3b82f6' },
    { name: 'High Occlusion', value: 8, color: '#ef4444' }
  ];

  const forecastData = [
    { name: 'Mon (07/13)', expected: 95.8, lower: 94.0, upper: 97.5 },
    { name: 'Tue (07/14)', expected: 96.1, lower: 94.5, upper: 98.0 },
    { name: 'Wed (07/15)', expected: 95.5, lower: 93.8, upper: 97.2 },
    { name: 'Thu (07/16)', expected: 94.9, lower: 93.0, upper: 96.8 },
    { name: 'Fri (07/17)', expected: 92.4, lower: 90.0, upper: 94.8 }
  ];

  return (
    <div id="analytics-workspace-panel" className="space-y-6 pb-16 relative">
      
      {/* REAL-TIME TOASTS STACK */}
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
                  ? 'bg-amber-950/85 border-amber-800 text-amber-300'
                  : t.type === 'info'
                    ? 'bg-slate-900/95 border-slate-750 text-slate-300'
                    : 'bg-emerald-950/85 border-emerald-800 text-emerald-300'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                t.type === 'warning' ? 'text-amber-400' : t.type === 'info' ? 'text-blue-400' : 'text-emerald-400'
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
            <span className="p-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </span>
            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">BI Intelligence Platform</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-xs text-slate-400">Gain deep insights into attendance, AI recognition performance, student activity, and system health.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Share Dashboard</span>
          </button>

          <button
            onClick={() => {
              setExportFormat('excel');
              handleGenerateReport();
            }}
            disabled={isExporting}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Analytics</span>
          </button>

          <button
            onClick={() => {
              setExportFormat('pdf');
              handleGenerateReport();
            }}
            disabled={isExporting}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* SHARE DASHBOARD MODAL */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-white">Share Secure Dashboard</h3>
                </div>
                <button onClick={() => setIsShareOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">Generate a secure viewer token to share real-time YOLOv8 facial recognition insights with faculty administrators.</p>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Shareable URL Link</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 flex-1 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input type="checkbox" id="allow_logs" defaultChecked className="rounded border-slate-800 text-indigo-500 bg-slate-950" />
                <label htmlFor="allow_logs" className="text-xs text-slate-300">Grant permission to access raw CSV logs</label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT PROGRESS MODAL */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-800 max-w-sm w-full p-6 rounded-3xl space-y-4 text-center"
            >
              <Hourglass className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Compiling SaaS Analytics</h3>
                <p className="text-xs text-slate-400">Rendering high-resolution vector trend graphics...</p>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{exportProgress}% Completed</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOADING SKELETON PLACEHOLDER ON REFRESH */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-3">
              <div className="h-3.5 bg-slate-800 rounded w-1/2" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 1. OVERVIEW CARDS GRID (8 Premium Gradient/Glassmorphism Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            
            {/* Registered Students */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 group-hover:text-slate-300 block">Total Registered</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-white">135</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ 4.8%</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">active indices</span>
            </div>

            {/* Today's Attendance */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Today's Ingress</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-emerald-400">94.2%</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ 1.4%</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">127 / 135 matched</span>
            </div>

            {/* Weekly Attendance */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Weekly Ingress</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-blue-400">93.6%</span>
                <span className="text-[9px] text-rose-400 font-mono font-bold">▼ 0.2%</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">5-day average</span>
            </div>

            {/* Monthly Attendance */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Monthly Ingress</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-indigo-400">94.8%</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ 2.1%</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">July cumulative</span>
            </div>

            {/* Recognition Accuracy */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/45 hover:from-indigo-950/60 hover:to-slate-900/75 border border-indigo-800/40 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 block">Biometric Accuracy</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-indigo-400">99.62%</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">F1 score</span>
              </div>
              <span className="text-[9px] text-indigo-500/70 font-mono mt-1">InsightFace backbone</span>
            </div>

            {/* Unknown Faces */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Unknown Faces</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-rose-400">2</span>
                <span className="text-[9px] text-rose-500 font-mono">unresolved</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">security alerts</span>
            </div>

            {/* Average Attendance */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Historical Avg</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-slate-200">94.1%</span>
                <span className="text-[9px] text-slate-500 font-mono">all-time</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">rolling calendar</span>
            </div>

            {/* Attendance Growth */}
            <div className="bg-slate-900/45 hover:bg-slate-900/75 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md group">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Attendance MoM</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-xl font-extrabold font-mono text-teal-400">+2.4%</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ positive</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">index growth rate</span>
            </div>

          </div>

          {/* TAB SEGMENT BAR */}
          <div className="flex border-b border-slate-850 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4 text-blue-400" />
              <span>Executive Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'attendance' 
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Attendance Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_biometrics')}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'ai_biometrics' 
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI & Vision Core</span>
            </button>

            <button
              onClick={() => setActiveTab('sensors_system')}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'sensors_system' 
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4 text-teal-400" />
              <span>Sensors & System Node</span>
            </button>

            <button
              onClick={() => setActiveTab('export_scheduler')}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'export_scheduler' 
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Dispatch & Scheduler</span>
            </button>
          </div>

          {/* ACTIVE TAB VIEWPORTS */}
          <AnimatePresence mode="wait">
            
            {/* VIEWPORT 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview-vp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Side: Recent Insights Timeline + Predictive Analytics (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* PREDICTIVE ANALYTICS SECTION */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <div className="space-y-0.5">
                        <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                          <Brain className="w-4.5 h-4.5 text-blue-400" />
                          <span>AI Predictive Intelligence</span>
                        </h3>
                        <p className="text-xs text-slate-400">Future attendance trends modeling via neural regression weights</p>
                      </div>

                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono rounded-xl">
                        Expected Tomorrow: <strong className="text-white">95.4%</strong>
                      </div>
                    </div>

                    {/* Predictive Graph */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">5-Day Expected Attendance Forecast</span>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={forecastData}
                            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[85, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="expected" name="Predicted rate %" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                            <Area type="monotone" dataKey="upper" name="Confidence Band Upper" stroke="#1e293b" fillOpacity={0} strokeDasharray="4 4" />
                            <Area type="monotone" dataKey="lower" name="Confidence Band Lower" stroke="#1e293b" fillOpacity={0} strokeDasharray="4 4" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Prediction widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Trend analysis */}
                      <div className="bg-slate-950/65 border border-slate-900 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">Neural Trend Analysis</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Ingress rates exhibit **high temporal stability**. Fridays show a cyclic drop of 3.4% due to weekend transit effect. Core Engineering attendance remains bounded at 98.2%.
                        </p>
                      </div>

                      {/* Expected Attendance Tomorrow factors */}
                      <div className="bg-slate-950/65 border border-slate-900 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-white">AI Engine Recommendations</span>
                        </div>
                        <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1">
                          <li>Schedule critical lab evaluations mid-week for 98% attendance.</li>
                          <li>Optimize Camera 4 exposure levels to reduce noise on low-contrast days.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* RECENT INSIGHTS TIMELINE */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-5 backdrop-blur-md">
                    <div className="space-y-0.5 border-b border-slate-850 pb-3">
                      <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                        <Activity className="w-4.5 h-4.5 text-teal-400" />
                        <span>System Insights Timeline</span>
                      </h3>
                      <p className="text-xs text-slate-400">Live operational events logged by edge sensors</p>
                    </div>

                    <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5 text-xs">
                      
                      {/* Event 1 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 p-1 bg-emerald-500/10 border border-emerald-500 rounded-full">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Attendance Increased</span>
                            <span className="text-[10px] text-slate-500 font-mono">10:45 AM</span>
                          </div>
                          <p className="text-slate-400">Operations department recorded a weekly-high check-in rate of 94.1%, exceeding projection model by 1.2%.</p>
                        </div>
                      </div>

                      {/* Event 2 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 p-1 bg-indigo-500/10 border border-indigo-500 rounded-full">
                          <Check className="w-3 h-3 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Recognition Improved</span>
                            <span className="text-[10px] text-slate-500 font-mono">09:30 AM</span>
                          </div>
                          <p className="text-slate-400">YOLOv8 Edge model updated successfully. Average face recognition confidence increased to 96.8%.</p>
                        </div>
                      </div>

                      {/* Event 3 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 p-1 bg-amber-500/10 border border-amber-500 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300">Unknown Faces Detected</span>
                            <span className="text-[10px] text-slate-500 font-mono">08:44 AM</span>
                          </div>
                          <p className="text-slate-400">Two unknown face vectors logged near Entrance Lobby Cam-01. Image slices archived in unresolved index.</p>
                        </div>
                      </div>

                      {/* Event 4 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 p-1 bg-indigo-500/10 border border-indigo-500 rounded-full">
                          <Cpu className="w-3 h-3 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">System Updates Applied</span>
                            <span className="text-[10px] text-slate-500 font-mono">08:00 AM</span>
                          </div>
                          <p className="text-slate-400">InsightFace backbone updated to ResNet50 model weights. Dynamic facial landmarks threshold active.</p>
                        </div>
                      </div>

                      {/* Event 5 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 p-1 bg-blue-500/10 border border-blue-500 rounded-full">
                          <Database className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Database Backup Synced</span>
                            <span className="text-[10px] text-slate-500 font-mono">07:15 AM</span>
                          </div>
                          <p className="text-slate-400">Incremental Firestore database backup committed successfully. 1,240 records preserved.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Side: Risk Student Indicators + Student Insights Tables (5 Columns) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* RISK STUDENTS MONITOR CARD */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <div className="space-y-0.5 border-b border-slate-850 pb-3">
                      <h3 className="text-rose-400 font-extrabold text-sm flex items-center space-x-2">
                        <AlertTriangle className="w-4.5 h-4.5" />
                        <span>Attendance Risk Warnings</span>
                      </h3>
                      <p className="text-xs text-slate-400">Students with current attendance below academic threshold (85%)</p>
                    </div>

                    <div className="space-y-3">
                      {/* Risk Student 1 */}
                      <div className="bg-slate-950/45 border border-slate-900 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            JC
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">John Connor</span>
                            <span className="text-[10px] text-slate-500 block">Engineering • Div Alpha</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-xs font-extrabold text-rose-400 font-mono block">81.4%</span>
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-mono rounded font-bold uppercase">Critical</span>
                        </div>
                      </div>

                      {/* Risk Student 2 */}
                      <div className="bg-slate-950/45 border border-slate-900 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            ER
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Elena Rostova</span>
                            <span className="text-[10px] text-slate-500 block">Research & Dev • Div Gamma</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-xs font-extrabold text-amber-400 font-mono block">83.8%</span>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[8px] font-mono rounded font-bold uppercase">Warning</span>
                        </div>
                      </div>

                      {/* Risk Student 3 */}
                      <div className="bg-slate-950/45 border border-slate-900 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            MW
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Marcus Wright</span>
                            <span className="text-[10px] text-slate-500 block">Operations • Div Delta</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-xs font-extrabold text-amber-400 font-mono block">84.2%</span>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[8px] font-mono rounded font-bold uppercase">Warning</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HIGH FIDELITY STUDENT PERFORMANCE SEGMENTS */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-5 backdrop-blur-md">
                    <div className="space-y-0.5 border-b border-slate-850 pb-3">
                      <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                        <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
                        <span>Biometrics Student Insights</span>
                      </h3>
                      <p className="text-xs text-slate-400">Top performers and late arrivals logs</p>
                    </div>

                    {/* Sub-list of Perfect Attendees */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">100% Perfect Attendance Club</span>
                      <div className="space-y-2">
                        {/* Perfect 1 */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 font-medium">Miles Dyson</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/15 rounded-md">100% (24/24)</span>
                        </div>

                        {/* Perfect 2 */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 font-medium">Sarah Connor</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/15 rounded-md">100% (24/24)</span>
                        </div>

                        {/* Perfect 3 */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 font-medium">Katherine Brewster</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/15 rounded-md">100% (24/24)</span>
                        </div>
                      </div>
                    </div>

                    {/* Late arrivals stats */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/40">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Frequent Late Arrivals</span>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Robert Brewster</span>
                          <span className="text-amber-400 font-mono font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/15 rounded-md">4 late captures</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Marcus Wright</span>
                          <span className="text-amber-400 font-mono font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/15 rounded-md">3 late captures</span>
                        </div>
                      </div>
                    </div>

                    {/* Most Active Academic Groups */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/40 text-xs">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Most Active Campus Segments</span>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl">
                          <span className="text-[9px] uppercase font-mono text-slate-500">Active Department</span>
                          <span className="font-bold text-white block mt-0.5">Research & Dev</span>
                          <span className="text-[9px] text-emerald-400 block">100.0% Rate</span>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl">
                          <span className="text-[9px] uppercase font-mono text-slate-500">Active Section</span>
                          <span className="font-bold text-white block mt-0.5">Division Alpha</span>
                          <span className="text-[9px] text-emerald-400 block">97.4% Rate</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEWPORT 2: ATTENDANCE INTELLIGENCE CHARTS */}
            {activeTab === 'attendance' && (
              <motion.div
                key="attendance-vp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* INTERACTIVE CONTROLS RAIL */}
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Select timeframe */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">Analysis Scale:</span>
                    <div className="bg-slate-950 border border-slate-850 p-1 rounded-xl flex items-center space-x-1">
                      {['today', 'weekly', 'monthly', 'yearly'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf as any)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase cursor-pointer ${
                            timeframe === tf 
                              ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/15' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render format selection */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">Widget Format:</span>
                    <div className="bg-slate-950 border border-slate-850 p-1 rounded-xl flex items-center space-x-1">
                      {['bar', 'area', 'line'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setAttendanceChartType(type as any)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase cursor-pointer ${
                            attendanceChartType === type 
                              ? 'bg-blue-600/25 text-blue-400 border border-blue-500/15' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* HISTORICAL ATTENDANCE PLOT (Large Responsive Card) */}
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                  <div className="space-y-0.5">
                    <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                      <CalendarDays className="w-4.5 h-4.5 text-blue-400" />
                      <span>Historical Campus Attendance Trajectory</span>
                    </h3>
                    <p className="text-xs text-slate-400">Visualizing registered headcount coordinates over time</p>
                  </div>

                  <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      {attendanceChartType === 'bar' ? (
                        <BarChart data={
                          (timeframe === 'today' ? dailyAttendanceData :
                          timeframe === 'weekly' ? weeklyAttendanceData :
                          timeframe === 'monthly' ? monthlyAttendanceData :
                          yearlyAttendanceData) as any
                        } margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey={timeframe === 'today' ? 'time' : timeframe === 'monthly' ? 'name' : timeframe === 'yearly' ? 'name' : 'name'} stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Bar dataKey={timeframe === 'today' ? 'present' : timeframe === 'weekly' ? 'present' : 'rate'} name="Matched Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : attendanceChartType === 'area' ? (
                        <AreaChart data={
                          (timeframe === 'today' ? dailyAttendanceData :
                          timeframe === 'weekly' ? weeklyAttendanceData :
                          timeframe === 'monthly' ? monthlyAttendanceData :
                          yearlyAttendanceData) as any[]
                        } margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey={timeframe === 'today' ? 'time' : timeframe === 'monthly' ? 'name' : timeframe === 'yearly' ? 'name' : 'name'} stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey={timeframe === 'today' ? 'present' : timeframe === 'weekly' ? 'present' : 'rate'} name="Ingress Rate %" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
                        </AreaChart>
                      ) : (
                        <LineChart data={
                          (timeframe === 'today' ? dailyAttendanceData :
                          timeframe === 'weekly' ? weeklyAttendanceData :
                          timeframe === 'monthly' ? monthlyAttendanceData :
                          yearlyAttendanceData) as any[]
                        } margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey={timeframe === 'today' ? 'time' : timeframe === 'monthly' ? 'name' : timeframe === 'yearly' ? 'name' : 'name'} stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey={timeframe === 'today' ? 'present' : timeframe === 'weekly' ? 'present' : 'rate'} name="Headcount Matches" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* THE 4 REQUISITE ACADEMIC COMPARISON CHART GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* CHART 1: DEPARTMENT COMPARISON */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Department Ingress Rate</span>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentComparisonData} layout="vertical" margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" fontSize={8} tickLine={false} domain={[80, 100]} />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} width={80} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Bar dataKey="rate" name="Matching quotient %" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {departmentComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.rate >= 95 ? '#10b981' : entry.rate >= 90 ? '#3b82f6' : '#f59e0b'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: SECTION COMPARISON */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Section matching comparison</span>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectionComparisonData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[80, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Bar dataKey="rate" name="Attendance rate %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                            {sectionComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 3: SUBJECT-WISE ATTENDANCE */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Course / Subject Attendance Match</span>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={subjectAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[80, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="rate" name="Average Rate %" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 4: FACULTY-WISE ATTENDANCE */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Faculty-wise Attendance Index</span>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={facultyAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[80, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Bar dataKey="rate" name="Verified Rate %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* THE ATTENDANCE HEATMAP MATRIX */}
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
                    <div className="space-y-0.5">
                      <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                        <Calendar className="w-4.5 h-4.5 text-emerald-400" />
                        <span>Interactive Attendance Traffic Heatmap Matrix</span>
                      </h3>
                      <p className="text-xs text-slate-400">Hourly biometrics ingress density metrics across weekday shifts</p>
                    </div>

                    <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-emerald-500/80 rounded" />
                        <span>Peak Ingress</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-slate-950/45 border border-slate-900 rounded" />
                        <span>Idle Segment</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[680px] space-y-2">
                      {/* Hours row */}
                      <div className="grid grid-cols-9 gap-2 text-center text-[10px] font-mono text-slate-500 uppercase">
                        <div className="text-left font-bold text-slate-400">Shift Day</div>
                        {heatmapHours.map(h => <div key={h}>{h}</div>)}
                      </div>

                      {/* Days blocks */}
                      {heatmapDays.map((day, dIdx) => (
                        <div key={day} className="grid grid-cols-9 gap-2 items-center text-xs">
                          <div className="font-mono font-bold text-slate-400 text-left">{day}</div>
                          {heatmapHours.map((hour, hIdx) => {
                            const val = heatmapMatrix[dIdx][hIdx];
                            return (
                              <div
                                key={hour}
                                title={`${day} at ${hour} - Ingress quotient: ${val}%`}
                                className={`h-11 rounded-xl border flex flex-col items-center justify-center font-mono text-[10px] transition-all hover:scale-105 cursor-help ${getHeatmapColor(val)}`}
                              >
                                <span className="font-bold">{val}%</span>
                                <span className="text-[7px] opacity-60">INGRESS</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEWPORT 3: AI & RECOGNITION BIOMETRICS */}
            {activeTab === 'ai_biometrics' && (
              <motion.div
                key="ai-biometrics-vp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Real-time Telemetry Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4">
                  
                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">FAR rate</span>
                    <span className="text-lg font-extrabold font-mono text-white">0.001%</span>
                    <span className="text-[8px] text-emerald-400 font-mono">FIPS LEVEL 3</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">FRR rate</span>
                    <span className="text-lg font-extrabold font-mono text-white">0.38%</span>
                    <span className="text-[8px] text-slate-500 font-mono">FRR boundary</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Avg Conf</span>
                    <span className="text-lg font-extrabold font-mono text-emerald-400">96.8%</span>
                    <span className="text-[8px] text-slate-500 font-mono">confidence index</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Inference</span>
                    <span className="text-lg font-extrabold font-mono text-white">12.4ms</span>
                    <span className="text-[8px] text-indigo-400 font-mono">YOLOv8-Face</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Embeddings</span>
                    <span className="text-lg font-extrabold font-mono text-white">8.2ms</span>
                    <span className="text-[8px] text-purple-400 font-mono">ResNet50 CUDA</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">GPU Load</span>
                    <span className="text-lg font-extrabold font-mono text-indigo-400">48%</span>
                    <span className="text-[8px] text-indigo-500 font-mono">Tesla T4</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">CPU Load</span>
                    <span className="text-lg font-extrabold font-mono text-white">32%</span>
                    <span className="text-[8px] text-slate-500 font-mono">8 Cores active</span>
                  </div>

                  <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl lg:col-span-2 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">CUDA VRAM</span>
                    <span className="text-lg font-extrabold font-mono text-white">4.2 / 16 GB</span>
                    <span className="text-[8px] text-slate-500 font-mono">Memory Allocation</span>
                  </div>

                </div>

                {/* GRAPHICAL ROW 1: ACCURACY TREND + CONFIDENCE DISTRIBUTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Accuracy Trend */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Biometrics Accuracy Trend</span>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recAccuracyTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[98, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="acc" name="YOLOv8 Accuracy" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="fips" name="FIPS Target" stroke="#1e293b" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Confidence Distribution Histogram */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Confidence Score Distribution</span>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={confidenceDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="range" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Bar dataKey="count" name="Face vectors matched" radius={[4, 4, 0, 0]}>
                            {confidenceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* GRAPHICAL ROW 2: UNKNOWN FACE TREND + PIPELINE LATENCY SPEED */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Unknown Face Trend */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Unknown Face Detections (7 Days)</span>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={unknownFaceTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorUnknown" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="count" name="Unknown captures" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUnknown)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recognition Speed vs Concurrent Pipelines */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">Biometric Inference Latency (ms)</span>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recognitionSpeedData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="clients" name="Active Streams" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="yolo" name="Detection (YOLO)" stroke="#3b82f6" strokeWidth={2.5} />
                          <Line type="monotone" dataKey="resnet" name="Biometrics (ResNet)" stroke="#8b5cf6" strokeWidth={2.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* DONUT PIE WHEELS: SUCCESS RATES + QUALITY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Pie 1: Verification Success Rate */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md flex flex-col justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300 block">Biometric Verification Success Rate</span>
                    <div className="h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={recognitionSuccessRate}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {recognitionSuccessRate.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-850/40">
                      {recognitionSuccessRate.map(e => (
                        <div key={e.name} className="flex items-center space-x-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                          <span>{e.name}: {e.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pie 2: Quality Index Distribution */}
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md flex flex-col justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300 block">Face Frame Quality Score Distribution</span>
                    <div className="h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={faceQualityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {faceQualityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-850/40">
                      {faceQualityData.map(e => (
                        <div key={e.name} className="flex items-center space-x-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                          <span>{e.name}: {e.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEWPORT 4: SENSORS & SYSTEM HEALTH */}
            {activeTab === 'sensors_system' && (
              <motion.div
                key="sensors-system-vp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. CAMERA PERFORMANCE GRID */}
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                  <div className="space-y-0.5 border-b border-slate-850 pb-3">
                    <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                      <Cpu className="w-4.5 h-4.5 text-teal-400" />
                      <span>RTSP Video Stream Node Health</span>
                    </h3>
                    <p className="text-xs text-slate-400">Real-time telemetry reports from active hardware cameras</p>
                  </div>

                  {/* Camera Node List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          <th className="p-3">Camera Node Identifier</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Uptime</th>
                          <th className="p-3">FPS Node</th>
                          <th className="p-3">Detections</th>
                          <th className="p-3">Recognized</th>
                          <th className="p-3">Unresolved</th>
                          <th className="p-3">Inference Engine</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-[11px] text-slate-300 font-mono">
                        {/* Node 1 */}
                        <tr className="hover:bg-slate-850/15">
                          <td className="p-3 font-sans font-bold text-slate-200">Main Entrance Lobby (Cam-01)</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase text-[9px]">ACTIVE</span>
                          </td>
                          <td className="p-3">99.8%</td>
                          <td className="p-3 text-indigo-400 font-bold">30 FPS</td>
                          <td className="p-3">548</td>
                          <td className="p-3 text-emerald-400 font-bold">532</td>
                          <td className="p-3 text-rose-400">16</td>
                          <td className="p-3 text-slate-400">RT-YOLOv8 Edge</td>
                        </tr>

                        {/* Node 2 */}
                        <tr className="hover:bg-slate-850/15">
                          <td className="p-3 font-sans font-bold text-slate-200">Research Lab Wing (Cam-04)</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase text-[9px]">ACTIVE</span>
                          </td>
                          <td className="p-3">99.9%</td>
                          <td className="p-3 text-indigo-400 font-bold">28 FPS</td>
                          <td className="p-3">342</td>
                          <td className="p-3 text-emerald-400 font-bold">334</td>
                          <td className="p-3 text-rose-400">8</td>
                          <td className="p-3 text-slate-400">RT-YOLOv8 Edge</td>
                        </tr>

                        {/* Node 3 */}
                        <tr className="hover:bg-slate-850/15">
                          <td className="p-3 font-sans font-bold text-slate-200">Corridor Checkpoint (Cam-03)</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase text-[9px]">ACTIVE</span>
                          </td>
                          <td className="p-3">99.5%</td>
                          <td className="p-3 text-indigo-400 font-bold">30 FPS</td>
                          <td className="p-3">214</td>
                          <td className="p-3 text-emerald-400 font-bold">206</td>
                          <td className="p-3 text-rose-400">8</td>
                          <td className="p-3 text-slate-400">RT-YOLOv8 Edge</td>
                        </tr>

                        {/* Node 4 */}
                        <tr className="hover:bg-slate-850/15">
                          <td className="p-3 font-sans font-bold text-slate-200">Back Lobby Exit (Cam-02)</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold uppercase text-[9px]">WARN (LAG)</span>
                          </td>
                          <td className="p-3">98.2%</td>
                          <td className="p-3 text-amber-400 font-bold">14 FPS</td>
                          <td className="p-3">136</td>
                          <td className="p-3 text-emerald-400 font-bold">130</td>
                          <td className="p-3 text-rose-400">6</td>
                          <td className="p-3 text-slate-400">RT-YOLOv8 Edge</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. SYSTEM HEALTH CARDS GRID */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider block">Unified SaaS System Infrastructure Status</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* DB Status */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Database Engine</span>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Connected</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">latency: 12ms (Firestore)</span>
                      </div>
                      <Database className="w-8 h-8 text-indigo-400/45" />
                    </div>

                    {/* API Status */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">API Gateway</span>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Operational</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">99.98% uptime SLA</span>
                      </div>
                      <Network className="w-8 h-8 text-blue-400/45" />
                    </div>

                    {/* Server Load */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Cluster Compute</span>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <span>Stable Load 24%</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">auto-scaled node cluster</span>
                      </div>
                      <Server className="w-8 h-8 text-purple-400/45" />
                    </div>

                    {/* Storage Limits */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Cloud Storage Limit</span>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                          <HardDrive className="w-4 h-4 text-blue-400" />
                          <span>42.5 GB / 100 GB</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">Face crop vectors quota</span>
                      </div>
                      <HardDrive className="w-8 h-8 text-teal-400/45" />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    
                    {/* Net Status */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Stream Ingress Network</span>
                        <span className="font-bold text-white block">230 Mbps (Optimized)</span>
                        <span className="text-[9px] text-slate-500">RTSP pipeline ingress bandwidth</span>
                      </div>
                    </div>

                    {/* AI Engine Status */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">AI Service Weights</span>
                        <span className="font-bold text-white block">YOLOv8 Ingress Active</span>
                        <span className="text-[9px] text-emerald-400">Weights v2.4 (FIPS 201 Strict)</span>
                      </div>
                    </div>

                    {/* Backup status */}
                    <div className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Replication Backup</span>
                        <span className="font-bold text-white block">Synced successfully</span>
                        <span className="text-[9px] text-slate-500">last sync completed 48 mins ago</span>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEWPORT 5: EXPORT CENTER & REPORT SCHEDULER */}
            {activeTab === 'export_scheduler' && (
              <motion.div
                key="export-vp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left: Immediate Report Exporters (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                    <div className="space-y-0.5 border-b border-slate-850 pb-3">
                      <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                        <FileText className="w-4.5 h-4.5 text-blue-400" />
                        <span>Interactive Export Workspace</span>
                      </h3>
                      <p className="text-xs text-slate-400">Download high-resolution, print-ready summaries containing tabular and graphical vectors.</p>
                    </div>

                    {/* Format Selector Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* PDF Option Card */}
                      <button
                        onClick={() => {
                          setExportFormat('pdf');
                          handleGenerateReport();
                        }}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] cursor-pointer ${
                          exportFormat === 'pdf' 
                            ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.1)]' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40'
                        }`}
                      >
                        <FileText className="w-6 h-6 text-blue-400" />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">Download PDF</span>
                          <span className="text-[10px] text-slate-400 block">Vector graphics, performance matrix profiles & print-layouts.</span>
                        </div>
                      </button>

                      {/* Excel Option Card */}
                      <button
                        onClick={() => {
                          setExportFormat('excel');
                          handleGenerateReport();
                        }}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] cursor-pointer ${
                          exportFormat === 'excel' 
                            ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40'
                        }`}
                      >
                        <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">Download Excel</span>
                          <span className="text-[10px] text-slate-400 block">Multi-sheet ledger containing raw student logs & biometrics score columns.</span>
                        </div>
                      </button>

                      {/* CSV Option Card */}
                      <button
                        onClick={() => {
                          setExportFormat('csv');
                          handleGenerateReport();
                        }}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] cursor-pointer ${
                          exportFormat === 'csv' 
                            ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.1)]' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40'
                        }`}
                      >
                        <FileText className="w-6 h-6 text-indigo-400" />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">Download CSV</span>
                          <span className="text-[10px] text-slate-400 block">Direct database table dumps suitable for custom parsing and analytics.</span>
                        </div>
                      </button>

                    </div>

                    {/* Report print layouts summary */}
                    <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Printer className="w-4 h-4 text-teal-400" />
                          <span className="font-bold text-white">Generate Printable Campus Report</span>
                        </div>
                        <button
                          onClick={() => {
                            addToast('Print layouts dispatched to printer spool...', 'info');
                            setTimeout(() => { window.print(); }, 1200);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-300 rounded-lg cursor-pointer transition-colors"
                        >
                          Launch Print Layout
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Creates an optimized black-and-white vector format, striping out dark gradients to conserve physical toner/ink while printing student metrics sheets.
                      </p>
                    </div>

                  </div>

                </div>

                {/* Right: Automated Report Dispatch Scheduler (5 Columns) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-3xl space-y-5 backdrop-blur-md">
                    <div className="space-y-0.5 border-b border-slate-850 pb-3">
                      <h3 className="text-white font-extrabold text-sm flex items-center space-x-2">
                        <Mail className="w-4.5 h-4.5 text-indigo-400" />
                        <span>Automated Dispatch Scheduler</span>
                      </h3>
                      <p className="text-xs text-slate-400">Schedule periodic biometrics reports directly to administrators.</p>
                    </div>

                    <form onSubmit={handleSaveSchedule} className="space-y-4">
                      
                      {/* Recipient Email */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Recipient Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="faculty.admin@cyberdyne.edu"
                          value={scheduleEmail}
                          onChange={(e) => setScheduleEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50"
                        />
                      </div>

                      {/* Frequency */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Dispatch Frequency Scale</label>
                        <select
                          value={scheduleFreq}
                          onChange={(e) => setScheduleFreq(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-300 p-2.5 rounded-xl focus:outline-none"
                        >
                          <option value="daily">Every Business Day (06:00 PM)</option>
                          <option value="weekly">Every Friday Evening (05:00 PM)</option>
                          <option value="monthly">Last Calendar Day of Month</option>
                        </select>
                      </div>

                      {/* Export Format */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">File Output Format</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setScheduleFormat('pdf')}
                            className={`p-2 rounded-xl text-xs font-mono border text-center cursor-pointer transition-colors ${
                              scheduleFormat === 'pdf' 
                                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-950/40 border-slate-850 text-slate-500'
                            }`}
                          >
                            PDF Document
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setScheduleFormat('csv')}
                            className={`p-2 rounded-xl text-xs font-mono border text-center cursor-pointer transition-colors ${
                              scheduleFormat === 'csv' 
                                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-950/40 border-slate-850 text-slate-500'
                            }`}
                          >
                            CSV Ledger
                          </button>
                        </div>
                      </div>

                      {/* Scope selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Report Ingress Scope</label>
                        <select
                          value={scheduleScope}
                          onChange={(e) => setScheduleScope(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-300 p-2.5 rounded-xl focus:outline-none"
                        >
                          <option value="all">Complete Analytics (All Modules)</option>
                          <option value="attendance_only">Attendance Ingress Data Only</option>
                          <option value="ai_only">YOLOv8 & Recognition Performance Metrics</option>
                          <option value="incidents_only">Unknown Faces & Telemetry Alert Logs</option>
                        </select>
                      </div>

                      {/* Actions submit */}
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        Schedule Report Dispatch
                      </button>

                    </form>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </>
      )}

    </div>
  );
}
