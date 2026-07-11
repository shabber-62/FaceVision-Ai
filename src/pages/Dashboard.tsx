import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Camera, 
  UserX, 
  Percent, 
  Activity, 
  ChevronRight, 
  Zap, 
  UserCheck, 
  Clock, 
  FileSpreadsheet,
  Scan,
  Sparkles,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Database,
  Server,
  HardDrive,
  Cpu,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Bell,
  Volume2,
  Terminal,
  Maximize2,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { 
  Student, 
  AttendanceRecord, 
  UnknownFace, 
  ActivityLog, 
  SystemStats 
} from '../types';
import CameraStream from '../components/CameraStream';

// Local high-fidelity mock data for expanded dashboard charts
const DAILY_HOURLY_DATA = [
  { hour: '08:00', present: 120, late: 5, absent: 1123 },
  { hour: '10:00', present: 450, late: 25, absent: 773 },
  { hour: '12:00', present: 880, late: 42, absent: 326 },
  { hour: '14:00', present: 1120, late: 48, absent: 80 },
  { hour: '16:00', present: 1210, late: 52, absent: 38 },
  { hour: '18:00', present: 1248, late: 52, absent: 0 }
];

const WEEKLY_COMPARE_DATA = [
  { day: 'Mon', present: 1190, late: 42, absent: 16 },
  { day: 'Tue', present: 1220, late: 35, absent: 11 },
  { day: 'Wed', present: 1248, late: 52, absent: 0 },
  { day: 'Thu', present: 1215, late: 38, absent: 15 },
  { day: 'Fri', present: 1180, late: 61, absent: 22 },
  { day: 'Sat', present: 450, late: 12, absent: 800 },
  { day: 'Sun', present: 120, late: 3, absent: 1125 }
];

const MONTHLY_TRENDS_DATA = [
  { month: 'Jan', rate: 94.2, accuracy: 99.1 },
  { month: 'Feb', rate: 95.8, accuracy: 99.3 },
  { month: 'Mar', rate: 96.5, accuracy: 99.4 },
  { month: 'Apr', rate: 97.1, accuracy: 99.5 },
  { month: 'May', rate: 98.2, accuracy: 99.6 },
  { month: 'Jun', rate: 98.9, accuracy: 99.8 }
];

const RECOGNITION_ACCURACY_TIMELINE = [
  { day: 'Day 1', accuracy: 99.1, latency: 14 },
  { day: 'Day 2', accuracy: 99.3, latency: 13 },
  { day: 'Day 3', accuracy: 99.2, latency: 13 },
  { day: 'Day 4', accuracy: 99.4, latency: 12 },
  { day: 'Day 5', accuracy: 99.5, latency: 11 },
  { day: 'Day 6', accuracy: 99.4, latency: 12 },
  { day: 'Day 7', accuracy: 99.6, latency: 11 },
  { day: 'Day 8', accuracy: 99.7, latency: 10 },
  { day: 'Day 9', accuracy: 99.8, latency: 10 },
  { day: 'Day 10', accuracy: 99.8, latency: 9 }
];

const SYSTEM_NOTIFICATIONS_DATA = [
  { id: 'notif-1', title: 'Anomalous Threat Spot', text: 'Unknown visitor detected at Lobby East', type: 'danger', time: '10:41 AM' },
  { id: 'notif-2', title: 'Camera Stream Offline', text: 'Camera Cam-09 (Loading Dock) lost frame sync', type: 'warning', time: '09:12 AM' },
  { id: 'notif-3', title: 'Low Confidence Alert', text: 'Verification confidence 72% at Gate 4', type: 'warning', time: '08:45 AM' },
  { id: 'notif-4', title: 'Biometrics Enrolled', text: 'Robert Brewster registered successfully', type: 'success', time: '08:30 AM' },
  { id: 'notif-5', title: 'CSV Report Generated', text: 'June Attendance audit list generated', type: 'info', time: 'Yesterday' }
];

interface DashboardProps {
  stats: SystemStats;
  students: Student[];
  attendance: AttendanceRecord[];
  unknownFaces: UnknownFace[];
  activities: ActivityLog[];
  onFaceDetected: (name: string, confidence: number, isUnknown: boolean, details: string) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  stats,
  students,
  attendance,
  unknownFaces,
  activities,
  onFaceDetected,
  onNavigate
}: DashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; count: number } | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [lastScannedPerson, setLastScannedPerson] = useState<{
    name: string;
    confidence: number;
    isUnknown: boolean;
    timestamp: string;
    details: string;
  }>({
    name: 'Sarah Connor',
    confidence: 0.984,
    isUnknown: false,
    timestamp: new Date().toLocaleTimeString(),
    details: 'Camera scan completed at checkpoint Lobby-01 with confidence 98.4%.'
  });

  // Track the last emitted detection to show on the Live HUD
  const handleLiveDetection = (name: string, confidence: number, isUnknown: boolean, details: string) => {
    setLastScannedPerson({
      name,
      confidence,
      isUnknown,
      timestamp: new Date().toLocaleTimeString(),
      details
    });
    if (onFaceDetected) {
      onFaceDetected(name, confidence, isUnknown, details);
    }
  };

  // Setup sample data for Heatmap grid (7 days x 12 hours)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hoursOfDay = ['08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM'];
  
  // Custom formula to simulate heatmap values
  const getHeatmapValue = (dayIndex: number, hourIndex: number) => {
    if (dayIndex >= 5) return Math.floor(Math.random() * 45); // weekends low
    if (hourIndex === 1 || hourIndex === 4 || hourIndex === 9) {
      return Math.floor(250 + Math.random() * 110); // peak hours (9am, 12pm, 5pm)
    }
    return Math.floor(60 + Math.random() * 90);
  };

  // Reusable custom tooltips for charts
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md">
          <p className="text-slate-200 font-bold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || p.fill }} className="flex justify-between gap-4">
              <span className="capitalize">{p.name}:</span>
              <span className="font-bold">{p.value}{typeof p.value === 'number' && p.value <= 100 ? '%' : ' units'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-view" className="space-y-8 pb-12">
      
      {/* 1. PREMIUM WIDGETS STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        
        {/* Present Today */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Present Today</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{stats.presentCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-emerald-500 text-xs font-medium flex items-center space-x-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+4.2%</span>
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500 overflow-visible">
                <path
                  d="M0,25 L15,18 L30,22 L45,10 L60,15 L75,5 L90,8 L100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(16,185,129,0.3))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Registered Students */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Enrolled Users</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{stats.registeredFaces}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-blue-400 text-xs font-medium flex items-center space-x-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12 new</span>
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-blue-500 overflow-visible">
                <path
                  d="M0,28 L20,24 L40,20 L60,12 L80,5 L100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(59,130,246,0.3))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Absent Today */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Absent Today</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{stats.absentCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(244,63,94,0.1)]">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-rose-400 text-xs font-medium flex items-center space-x-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-1.8%</span>
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-rose-500 overflow-visible">
                <path
                  d="M0,5 L20,10 L40,8 L60,18 L80,15 L100,25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(244,63,94,0.3))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Unknown Faces */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Unknown visitors</span>
              <h3 className="text-2xl font-bold text-amber-500 font-mono tracking-tight">{stats.unknownFacesCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Pending review
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-amber-500 overflow-visible">
                <path
                  d="M0,28 L15,28 L30,5 L45,28 L60,28 L75,10 L90,28 L100,28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(245,158,11,0.3))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Recognition Accuracy */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Match Accuracy</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{stats.accuracyRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.1)]">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-indigo-400 text-xs font-medium flex items-center space-x-0.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Optimal</span>
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-indigo-500 overflow-visible">
                <path
                  d="M0,10 L20,8 L40,6 L60,8 L80,3 L100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(139,92,246,0.3))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Active Cameras */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Active Cameras</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">14</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-semibold flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Synced</span>
            </span>
            {/* Sparkline */}
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-blue-500 overflow-visible">
                <path
                  d="M0,15 L15,15 L30,15 L45,15 L60,15 L75,15 L90,15 L100,15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(59,130,246,0.2))' }}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

      </div>

      {/* 2. SPLIT LAYOUT: LIVE MONITOR & BENTO GRID OF CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LIVE RECOGNITION (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CAMERA FEED PORTAL */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
            
            {/* Glass header overlay with controls */}
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span>Surveillance Node: Main Entrance Cam-01</span>
                </h4>
                <p className="text-xs text-slate-400">YOLOv8-Face Model Weight • Confidence Boundary: 0.90</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsScanningActive(!isScanningActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isScanningActive 
                      ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {isScanningActive ? 'Active Scan' : 'Scanner Idle'}
                </button>
                <button
                  onClick={() => onNavigate('live-recognition')}
                  className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40 border border-slate-800 p-1.5 rounded-lg transition-colors"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* EMBEDDED DYNAMIC CAMERA STREAM PORT */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 aspect-video flex items-center justify-center">
              
              <CameraStream 
                onFaceDetected={handleLiveDetection} 
                isActive={isScanningActive} 
                recognitionThreshold={0.90}
              />

              {/* Cyber Scan HUD Overlays (Simulating scanning animation) */}
              {isScanningActive && (
                <>
                  {/* Neon laser scan slide overlay */}
                  <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6] animate-scan-line pointer-events-none" />
                  
                  {/* Cyber corner brackets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500/40 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500/40 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500/40 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500/40 pointer-events-none" />
                </>
              )}
            </div>

            {/* LIVE DETECTION HUD DATA DISPLAY */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={lastScannedPerson.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                      {lastScannedPerson.isUnknown ? (
                        <UserX className="w-6 h-6 text-red-400" />
                      ) : (
                        <img 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" 
                          alt="Face Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                      lastScannedPerson.isUnknown ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    }`}>
                      {lastScannedPerson.isUnknown ? '!' : '✓'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-bold text-white tracking-wide">
                        {lastScannedPerson.isUnknown ? 'Unknown Guest Intercepted' : lastScannedPerson.name}
                      </h5>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest ${
                        lastScannedPerson.isUnknown ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {lastScannedPerson.isUnknown ? 'ALERT THREAT' : 'VERIFIED MATCH'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{lastScannedPerson.details}</p>
                  </div>
                </div>

                <div className="flex md:flex-col items-start md:items-end justify-between font-mono shrink-0">
                  <div className="text-xs text-slate-500">Match Confidence</div>
                  <div className={`text-lg font-bold leading-none mt-0.5 ${
                    lastScannedPerson.isUnknown ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {(lastScannedPerson.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{lastScannedPerson.timestamp}</div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* BENTO GRID: 6 INTERACTIVE CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* WIDGET A (col-span-12): MAIN ATTENDANCE TAB PANEL (Daily, Weekly, Monthly) */}
            <div className="md:col-span-12 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Futuristic Attendance Intelligence</span>
                  </h4>
                  <p className="text-xs text-slate-400">Interactive verifications by hour, day of the week, and month</p>
                </div>

                {/* Glass Selector Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
                  {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveChartTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        activeChartTab === tab 
                          ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-inner' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Recharts Area based on tab choice */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'daily' ? (
                    <AreaChart data={DAILY_HOURLY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresentDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" name="Check-ins" dataKey="present" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresentDaily)" />
                    </AreaChart>
                  ) : activeChartTab === 'weekly' ? (
                    <BarChart data={WEEKLY_COMPARE_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="present" name="Present Verified" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="late" name="Late Logs" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                  ) : (
                    <AreaChart data={MONTHLY_TRENDS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRateMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[90, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" name="Attendance Rate" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRateMonthly)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* WIDGET B (col-span-12 md:col-span-6): RECOGNITION ACCURACY TREND */}
            <div className="md:col-span-6 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
                  <Percent className="w-4 h-4 text-indigo-400" />
                  <span>Model Matching Accuracy (10-day timeline)</span>
                </h4>
                <p className="text-xs text-slate-400 font-mono text-[11px]">Average YOLOv8 prediction accuracy against ground truths</p>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={RECOGNITION_ACCURACY_TIMELINE} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[98, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={99.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SLA Limit (99%)', fill: '#ef4444', fontSize: 8, position: 'insideBottomRight' }} />
                    <Line type="monotone" name="Accuracy" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WIDGET C (col-span-12 md:col-span-6): DEPARTMENT-WISE PERFORMANCE */}
            <div className="md:col-span-6 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Department Attendance Division</span>
                </h4>
                <p className="text-xs text-slate-400">Active matching rates by corporate department folder</p>
              </div>

              {/* High-fidelity custom progress bars representing department rates */}
              <div className="space-y-3 pt-2">
                {[
                  { name: 'Research & Dev', rate: 99.9, color: 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]', count: 185 },
                  { name: 'Engineering', rate: 98.4, color: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]', count: 420 },
                  { name: 'Product Operations', rate: 96.1, color: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]', count: 312 },
                  { name: 'Human Resources', rate: 95.2, color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', count: 85 },
                  { name: 'Finance & Sales', rate: 92.3, color: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', count: 246 }
                ].map((dep, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-medium">{dep.name}</span>
                      <span className="text-slate-400 font-bold">{dep.rate}% ({dep.count} heads)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dep.rate}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${dep.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET D (col-span-12): STUNNING HEATMAP CHART */}
            <div className="md:col-span-12 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Biometric Match Heatmap Ticker</span>
                  </h4>
                  <p className="text-xs text-slate-400">Peak system query load mapping verification volume by hour & weekday</p>
                </div>
                
                {/* Micro legend */}
                <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400">
                  <span>Idle</span>
                  <span className="w-3 h-3 bg-slate-950 border border-slate-800 rounded-sm"></span>
                  <span className="w-3 h-3 bg-blue-500/10 rounded-sm"></span>
                  <span className="w-3 h-3 bg-blue-500/40 rounded-sm"></span>
                  <span className="w-3 h-3 bg-blue-500/80 rounded-sm"></span>
                  <span className="w-3 h-3 bg-blue-500 rounded-sm shadow-[0_0_4px_#3b82f6]"></span>
                  <span>Peak Load</span>
                </div>
              </div>

              {/* Interactive Heatmap Matrix */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[640px] pt-2 space-y-2 font-mono text-[11px]">
                  {/* Hours Header Row */}
                  <div className="grid grid-cols-[50px_repeat(12,1fr)] gap-1 text-center font-bold text-slate-500">
                    <div></div>
                    {hoursOfDay.map((hour, idx) => (
                      <div key={idx} className="truncate">{hour}</div>
                    ))}
                  </div>

                  {/* Matrix Rows per Day */}
                  {daysOfWeek.map((day, dayIdx) => (
                    <div key={day} className="grid grid-cols-[50px_repeat(12,1fr)] gap-1 items-center">
                      <div className="font-bold text-slate-400 text-left">{day}</div>
                      {hoursOfDay.map((hour, hourIdx) => {
                        const score = getHeatmapValue(dayIdx, hourIdx);
                        // Shade determination classes
                        let bgClass = 'bg-slate-950 border border-slate-850';
                        if (score > 280) bgClass = 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]';
                        else if (score > 180) bgClass = 'bg-blue-500/70';
                        else if (score > 100) bgClass = 'bg-blue-500/40';
                        else if (score > 30) bgClass = 'bg-blue-500/15';

                        return (
                          <motion.div
                            key={hourIdx}
                            onMouseEnter={() => setHoveredCell({ day, hour, count: score })}
                            onMouseLeave={() => setHoveredCell(null)}
                            whileHover={{ scale: 1.15, zIndex: 10 }}
                            className={`h-8 rounded-md transition-colors cursor-pointer ${bgClass}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Heatmap Tooltip readout */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspect Mode:</span>
                </div>
                {hoveredCell ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white font-bold"
                  >
                    {hoveredCell.day} at {hoveredCell.hour} — <span className="text-blue-400">{hoveredCell.count} verifications</span> (Simulated load: {hoveredCell.count > 250 ? 'PEAK INTENSITY' : hoveredCell.count > 100 ? 'NORMAL TRAFFIC' : 'LOW DENSITY'})
                  </motion.div>
                ) : (
                  <span className="text-slate-500 italic">Hover any block to audit exact time verify loads</span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (lg:col-span-4) - DOCK, HEALTH, ALERTS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* QUICK COMMAND DOCK */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Biometric Control Docks</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('students')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-[11px] font-bold text-slate-200">Add Student</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Enrol profile</p>
              </button>

              <button
                onClick={() => onNavigate('face-registration')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <Scan className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-[11px] font-bold text-slate-200">Register Face</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Enroll snapshot</p>
              </button>

              <button
                onClick={() => onNavigate('live-recognition')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <Camera className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform mb-1.5 animate-pulse" />
                <p className="text-[11px] font-bold text-slate-200">Start Recognition</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Initialize Cam</p>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-[11px] font-bold text-slate-200">Generate Report</p>
                <p className="text-[9px] text-slate-500 mt-0.5">PDF audit log</p>
              </button>

              <button
                onClick={() => onNavigate('attendance')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <Download className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-[11px] font-bold text-slate-200">Export Attendance</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Direct spreadsheet</p>
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left rounded-xl transition-all group cursor-pointer hover:bg-slate-900"
              >
                <TrendingUp className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5" />
                <p className="text-[11px] font-bold text-slate-200">Open Analytics</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Business trends</p>
              </button>
            </div>
          </div>

          {/* SYSTEM HEALTH AND TELEMETRY */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Edge Server Clusters Telemetry</span>
            </h4>

            {/* Health parameters */}
            <div className="space-y-3.5">
              
              {/* AI model status */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <div className="text-xs">
                    <p className="text-white font-bold">YOLOv8-Face Model</p>
                    <p className="text-[10px] text-slate-500">FP16 Weights • inference at 45fps</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-md shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  Active
                </span>
              </div>

              {/* Camera status */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <div className="flex items-center space-x-2.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <div className="text-xs">
                    <p className="text-white font-bold">Surveillance Feeds</p>
                    <p className="text-[10px] text-slate-500">14 camera nodes registered</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                  14 / 14 Sync
                </span>
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-blue-400" />
                  <div className="text-xs">
                    <p className="text-white font-bold">Biometric Vector DB</p>
                    <p className="text-[10px] text-slate-500">PostgreSQL Cloud Cluster</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md font-bold">
                  0.8ms Query
                </span>
              </div>

              {/* Server Status */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <div className="flex items-center space-x-2.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs">
                    <p className="text-white font-bold">API Server Stack</p>
                    <p className="text-[10px] text-slate-500">FastAPI • Node Engine controllers</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                  142h Uptime
                </span>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-slate-800" />

              {/* Gauges & Indicators */}
              <div className="space-y-2.5">
                {/* Storage */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-500" /> Storage Capacity
                    </span>
                    <span className="text-white font-bold">34% (1.2 / 3.5 TB)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>

                {/* CPU */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-500" /> YOLOv8 TPU Load
                    </span>
                    <span className="text-white font-bold">18% (42°C Baseline)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                {/* Memory */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-slate-500" /> System Buffer Memory
                    </span>
                    <span className="text-white font-bold">42% (6.7 / 16.0 GB)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ACTIVE DISPATCH NOTIFICATIONS LIST */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-bold text-sm flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-blue-400" />
                <span>Incident Dispatch Alerts</span>
              </h4>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold">
                2 alerts
              </span>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {SYSTEM_NOTIFICATIONS_DATA.map((notif) => {
                const colorBadge = {
                  danger: 'border-red-500/30 bg-red-500/10 text-red-400',
                  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                }[notif.type];

                return (
                  <div 
                    key={notif.id} 
                    className="p-3 bg-slate-950/60 rounded-xl border border-slate-850/80 hover:border-slate-850 flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-1">
                      {notif.type === 'danger' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : notif.type === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      ) : notif.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white leading-relaxed truncate">{notif.title}</p>
                        <span className="text-[9px] text-slate-500 shrink-0 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 text-[11px]">{notif.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. RECENT AUDITED VERIFICATION TABLE LIST */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-white font-bold text-sm">Real-time Biometric Audit logs</h4>
            <p className="text-xs text-slate-400">Verified identification matches captured by entrance controller nodes</p>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs bg-slate-950 hover:bg-slate-900 text-blue-400 border border-slate-850 hover:border-blue-500/30 px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 font-bold"
          >
            <span>View Full Audit History</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                <th className="py-3 px-4 font-bold">Snapshot</th>
                <th className="py-3 px-4 font-bold">Operator Profile</th>
                <th className="py-3 px-4 font-bold">Department Tag</th>
                <th className="py-3 px-4 font-bold">Check-in Time</th>
                <th className="py-3 px-4 font-bold">Matching Status</th>
                <th className="py-3 px-4 font-bold text-right">Inference Confidence</th>
                <th className="py-3 px-4 text-right font-bold">Control Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {attendance.slice(0, 5).map((record) => {
                const statusBadge = {
                  present: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
                  late: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
                  absent: 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }[record.status] || 'bg-slate-500/10 border border-slate-500/20 text-slate-400';

                return (
                  <tr key={record.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-850">
                        <img 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" 
                          alt="Face" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{record.studentName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{record.studentId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {record.department}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${statusBadge}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-slate-300 font-bold">
                      {record.confidence}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('students')}
                        className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        Override Match
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CHRONOLOGICAL SYSTEM ACTIVITIES LOG PANEL */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
          <div className="space-y-0.5">
            <h4 className="text-white font-bold text-sm flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Edge Telemetry Controller Activity Feed</span>
            </h4>
            <p className="text-xs text-slate-500">Real-time log broadcasts of network handshakes and vector checks</p>
          </div>
          <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded">
            FEED: CONNECTED
          </span>
        </div>

        <div className="space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              [ACTIVITY LOG EMPTY] - Awaiting controller handshakes
            </div>
          ) : (
            activities.map((log) => {
              const statusBadge = {
                success: 'bg-green-500/10 border border-green-500/20 text-green-400',
                warning: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
                danger: 'bg-red-500/10 border border-red-500/20 text-red-400',
                info: 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              }[log.status] || 'bg-slate-500/10 border-slate-500/20 text-slate-400';

              return (
                <div 
                  key={log.id} 
                  className="bg-slate-950/40 border border-slate-800/60 hover:border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                    <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${statusBadge}`}>
                      {log.action}
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="text-slate-200 font-medium leading-relaxed">{log.details}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-2 font-mono">
                        <span className="truncate">Client: {log.user}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[9px] text-slate-500 shrink-0 self-end sm:self-center">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
