import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Camera, 
  UserX, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Download, 
  Mail, 
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  Search, 
  Plus, 
  Sparkles, 
  Scan, 
  Activity, 
  Video, 
  Award, 
  BookOpen, 
  MapPin, 
  AlertTriangle, 
  RotateCw, 
  Bell, 
  Sliders, 
  Eye,
  GraduationCap,
  CalendarDays,
  Play,
  FileSpreadsheet,
  FileDown,
  UserPlus,
  ArrowUpRight
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import CameraStream from '../components/CameraStream';

// Mock Class data
interface CourseClass {
  id: string;
  courseName: string;
  subject: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  roomNumber: string;
  facultyName: string;
  schedule: string;
  totalStudents: number;
  presentCount: number;
}

const INITIAL_CLASSES: CourseClass[] = [
  {
    id: 'cls-1',
    courseName: 'CS-402 Deep Learning & Neural Networks',
    subject: 'Neural Networks & Face Detection',
    department: 'Engineering',
    year: '4th Year',
    semester: '8th Semester',
    section: 'Section A',
    roomNumber: 'Room 405',
    facultyName: 'Dr. Sarah Connor',
    schedule: 'Mon, Wed - 09:00 AM - 11:00 AM',
    totalStudents: 15,
    presentCount: 12
  },
  {
    id: 'cls-2',
    courseName: 'CS-301 Advanced Computer Vision',
    subject: 'Image Processing & Edge Inference',
    department: 'Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    section: 'Section B',
    roomNumber: 'Room 302',
    facultyName: 'Dr. Sarah Connor',
    schedule: 'Tue, Thu - 11:30 AM - 01:00 PM',
    totalStudents: 12,
    presentCount: 9
  },
  {
    id: 'cls-3',
    courseName: 'AI-102 Introduction to Cybernetic Systems',
    subject: 'Cybernetics & Feedback Loops',
    department: 'Research & Dev',
    year: '2nd Year',
    semester: '4th Semester',
    section: 'Section C',
    roomNumber: 'Tech Lab 2',
    facultyName: 'Dr. Sarah Connor',
    schedule: 'Mon, Fri - 02:00 PM - 03:30 PM',
    totalStudents: 18,
    presentCount: 14
  }
];

// Mock Student data specific to Faculty view
interface ClassStudent {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  attendanceStatus: 'present' | 'absent' | 'late';
  recognitionStatus: 'verified' | 'manual' | 'unverified';
  confidence: number;
  avatarUrl: string;
}

const INITIAL_CLASS_STUDENTS: ClassStudent[] = [
  {
    id: 'st-1',
    name: 'Sarah Connor',
    rollNumber: 'FV-2026-042',
    department: 'Engineering',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 98.4,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-2',
    name: 'Marcus Wright',
    rollNumber: 'FV-2026-089',
    department: 'Operations',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 96.1,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-3',
    name: 'John Connor',
    rollNumber: 'FV-2026-001',
    department: 'Engineering',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 99.5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-4',
    name: 'Katherine Brewster',
    rollNumber: 'FV-2026-112',
    department: 'Product Management',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'late',
    recognitionStatus: 'manual',
    confidence: 94.8,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-5',
    name: 'Miles Dyson',
    rollNumber: 'FV-2026-005',
    department: 'Research & Dev',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 99.9,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-6',
    name: 'Elena Rostova',
    rollNumber: 'FV-2026-215',
    department: 'Human Resources',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'absent',
    recognitionStatus: 'unverified',
    confidence: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-7',
    name: 'T-800 Model 101',
    rollNumber: 'FV-2026-800',
    department: 'Research & Dev',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'absent',
    recognitionStatus: 'unverified',
    confidence: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-8',
    name: 'Robert Brewster',
    rollNumber: 'FV-2026-103',
    department: 'Operations',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 92.4,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-9',
    name: 'Marcus Wright',
    rollNumber: 'FV-2026-090',
    department: 'Engineering',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'verified',
    confidence: 95.8,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'st-10',
    name: 'Sarah Connor II',
    rollNumber: 'FV-2026-142',
    department: 'Engineering',
    year: '4th Year',
    section: 'Sec A',
    attendanceStatus: 'present',
    recognitionStatus: 'manual',
    confidence: 91.2,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  }
];

// Mock Notifications
interface FacultyNotification {
  id: string;
  title: string;
  message: string;
  type: 'joined' | 'completed' | 'unknown' | 'low-conf' | 'offline';
  timestamp: string;
  timeLabel: string;
}

const INITIAL_NOTIFICATIONS: FacultyNotification[] = [
  {
    id: 'not-1',
    title: 'Student Joined Class',
    message: 'John Connor verified in CS-402 via Room 405 Camera.',
    type: 'joined',
    timestamp: '2026-07-11T09:02:15-07:00',
    timeLabel: '2 min ago'
  },
  {
    id: 'not-2',
    title: 'Unknown Face Detected',
    message: 'An unrecognized subject was flagged near Room 405 Entrance.',
    type: 'unknown',
    timestamp: '2026-07-11T09:05:00-07:00',
    timeLabel: '5 min ago'
  },
  {
    id: 'not-3',
    title: 'Attendance Session Complete',
    message: 'CS-402 Face Recognition attendance finished with 92% present rate.',
    type: 'completed',
    timestamp: '2026-07-11T09:15:30-07:00',
    timeLabel: '15 min ago'
  },
  {
    id: 'not-4',
    title: 'Low Recognition Confidence',
    message: 'Robert Brewster face scan confidence flagged at 72%. Re-scan requested.',
    type: 'low-conf',
    timestamp: '2026-07-11T09:18:44-07:00',
    timeLabel: '18 min ago'
  },
  {
    id: 'not-5',
    title: 'Camera Device Offline',
    message: 'Laboratory-03 wide-angle node reported a telemetry drop-off.',
    type: 'offline',
    timestamp: '2026-07-11T09:22:10-07:00',
    timeLabel: '22 min ago'
  }
];

// Mock Timeline for Live Class Recognition
interface LiveScanLog {
  id: string;
  name: string;
  confidence: number;
  time: string;
  avatarUrl: string;
  status: 'present' | 'late' | 'unknown';
}

// Chart Data structures
const DAILY_ATTENDANCE_DATA = [
  { name: '09:00 AM', present: 11, late: 1, absent: 3 },
  { name: '10:00 AM', present: 13, late: 1, absent: 1 },
  { name: '11:00 AM', present: 14, late: 1, absent: 0 },
  { name: '12:00 PM', present: 14, late: 1, absent: 0 }
];

const WEEKLY_ATTENDANCE_DATA = [
  { name: 'Mon', Present: 92, Late: 5, Absent: 3 },
  { name: 'Tue', Present: 95, Late: 2, Absent: 3 },
  { name: 'Wed', Present: 88, Late: 8, Absent: 4 },
  { name: 'Thu', Present: 96, Late: 1, Absent: 3 },
  { name: 'Fri', Present: 94, Late: 4, Absent: 2 }
];

const MONTHLY_ATTENDANCE_DATA = [
  { name: 'Week 1', 'Attendance %': 92.4, 'AI Accuracy %': 99.2 },
  { name: 'Week 2', 'Attendance %': 94.1, 'AI Accuracy %': 99.5 },
  { name: 'Week 3', 'Attendance %': 93.8, 'AI Accuracy %': 99.4 },
  { name: 'Week 4', 'Attendance %': 96.2, 'AI Accuracy %': 99.8 }
];

const SUBJECT_PERFORMANCE_DATA = [
  { name: 'Deep Learning', attendance: 95 },
  { name: 'Computer Vision', attendance: 88 },
  { name: 'Cybernetics', attendance: 92 },
  { name: 'Machine Learning', attendance: 91 }
];

// Mock Unknown Faces
interface FacultyUnknownFace {
  id: string;
  imageUrl: string;
  timestamp: string;
  camera: string;
  confidence: number;
}

const INITIAL_UNKNOWN_FACES: FacultyUnknownFace[] = [
  {
    id: 'unk-1',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    timestamp: '2026-07-11T09:04:12-07:00',
    camera: 'Room 405 Entrance',
    confidence: 42.5
  },
  {
    id: 'unk-2',
    imageUrl: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&q=80&w=200',
    timestamp: '2026-07-11T09:07:35-07:00',
    camera: 'Tech Lab 2 Lobby',
    confidence: 38.9
  }
];

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'live-class' | 'students' | 'attendance' | 'analytics' | 'unknown' | 'reports'>('classes');
  
  // Real State Handlers
  const [classes, setClasses] = useState<CourseClass[]>(INITIAL_CLASSES);
  const [selectedClass, setSelectedClass] = useState<CourseClass>(INITIAL_CLASSES[0]);
  const [studentsList, setStudentsList] = useState<ClassStudent[]>(INITIAL_CLASS_STUDENTS);
  const [unknownFaces, setUnknownFaces] = useState<FacultyUnknownFace[]>(INITIAL_UNKNOWN_FACES);
  const [notifications, setNotifications] = useState<FacultyNotification[]>(INITIAL_NOTIFICATIONS);
  
  // Live Class simulation tracking
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [autoCameraOpen, setAutoCameraOpen] = useState<boolean>(true);
  const [liveScanLogs, setLiveScanLogs] = useState<LiveScanLog[]>([
    { id: 'log-1', name: 'John Connor', confidence: 99.5, time: '09:02:15 AM', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', status: 'present' },
    { id: 'log-2', name: 'Sarah Connor', confidence: 98.4, time: '09:01:42 AM', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', status: 'present' },
    { id: 'log-3', name: 'Miles Dyson', confidence: 99.9, time: '09:00:55 AM', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', status: 'present' }
  ]);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Search filter
  const [studentSearch, setStudentSearch] = useState('');

  // Auto Open camera when active tab turns to 'live-class'
  useEffect(() => {
    if (activeTab === 'live-class' && autoCameraOpen) {
      setCameraActive(true);
    } else if (activeTab !== 'live-class') {
      setCameraActive(false);
    }
  }, [activeTab, autoCameraOpen]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick Action triggers
  const handleStartClass = () => {
    setSelectedClass(classes[0]);
    setActiveTab('live-class');
    showToast("Live Scanning Session Started for " + classes[0].courseName, "info");
  };

  const handleOpenLiveRecognition = () => {
    setActiveTab('live-class');
    showToast("Live AI Camera Feed Activated", "success");
  };

  const handleTakeAttendance = (courseClass?: CourseClass) => {
    if (courseClass) {
      setSelectedClass(courseClass);
    }
    setActiveTab('attendance');
    showToast("Manual/AI Attendance Console Loaded for " + (courseClass ? courseClass.courseName : selectedClass.courseName), "info");
  };

  const handleGenerateReportTab = () => {
    setActiveTab('reports');
    showToast("Class Report Compiler Loaded", "info");
  };

  // Attendance modifiers
  const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudentsList(prev => prev.map(s => {
      if (s.id === studentId) {
        return { 
          ...s, 
          attendanceStatus: status,
          recognitionStatus: status === 'absent' ? 'unverified' : 'manual',
          confidence: status === 'absent' ? 0 : s.confidence || 90.0
        };
      }
      return s;
    }));
    showToast("Attendance status updated successfully.", "success");
  };

  const handleBulkAttendance = (status: 'present' | 'absent' | 'late') => {
    setStudentsList(prev => prev.map(s => ({
      ...s,
      attendanceStatus: status,
      recognitionStatus: status === 'absent' ? 'unverified' : 'manual',
      confidence: status === 'absent' ? 0 : 92.5
    })));
    showToast(`Marked all class students as ${status.toUpperCase()}.`, "success");
  };

  // Unknown face handlers
  const handleRegisterStudent = (id: string) => {
    setUnknownFaces(prev => prev.filter(f => f.id !== id));
    showToast("Unknown Face assigned to biometric enroller database.", "success");
  };

  const handleIgnoreFace = (id: string) => {
    setUnknownFaces(prev => prev.filter(f => f.id !== id));
    showToast("Security flag ignored for subject.", "info");
  };

  const handleReportSecurity = (id: string, camera: string) => {
    setUnknownFaces(prev => prev.filter(f => f.id !== id));
    
    // Add warning notification
    const newNotif: FacultyNotification = {
      id: `not-sec-${Date.now()}`,
      title: 'Security Alert Sent',
      message: `Intrusion report filed for subject detected near ${camera}.`,
      type: 'offline',
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast("Security Dispatch Alert reported to Command Center.", "error");
  };

  // Reports Generation triggers
  const handleExport = (type: 'pdf' | 'excel' | 'email') => {
    showToast(`Compiling report and executing export to ${type.toUpperCase()}...`, "info");
    setTimeout(() => {
      showToast(`Exported ${selectedClass.courseName} attendance summary to ${type.toUpperCase()}!`, "success");
    }, 1500);
  };

  // Live face detector event handler
  const handleFaceDetectedInClass = (name: string, confidence: number, isUnknown: boolean) => {
    if (isUnknown) return; // Ignore raw unknowns in log
    
    // Check if student is already in the live logs recently
    const isAlreadyLogged = liveScanLogs.some(log => log.name === name);
    if (!isAlreadyLogged) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const matchedStudent = studentsList.find(s => s.name === name);
      const avatar = matchedStudent?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
      
      // Update attendance status of that student to present automatically!
      if (matchedStudent) {
        setStudentsList(prev => prev.map(s => {
          if (s.name === name) {
            return {
              ...s,
              attendanceStatus: 'present',
              recognitionStatus: 'verified',
              confidence: confidence * 100
            };
          }
          return s;
        }));
      }

      // Add to timeline log
      const newLog: LiveScanLog = {
        id: `scan-log-${Date.now()}`,
        name,
        confidence: +(confidence * 100).toFixed(1),
        time: timeStr,
        avatarUrl: avatar,
        status: 'present'
      };

      setLiveScanLogs(prev => [newLog, ...prev.slice(0, 8)]);
      
      // Add notification
      const newNotif: FacultyNotification = {
        id: `notif-${Date.now()}`,
        title: 'Auto AI Verification',
        message: `${name} marked PRESENT in ${selectedClass.courseName} (Conf: ${(confidence * 100).toFixed(1)}%).`,
        type: 'joined',
        timestamp: now.toISOString(),
        timeLabel: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
    }
  };

  // Computed status numbers
  const totalStudents = studentsList.length;
  const presentStudents = studentsList.filter(s => s.attendanceStatus === 'present').length;
  const lateStudents = studentsList.filter(s => s.attendanceStatus === 'late').length;
  const absentStudents = studentsList.filter(s => s.attendanceStatus === 'absent').length;
  const presentPct = totalStudents > 0 ? ((presentStudents + lateStudents) / totalStudents * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 p-1 sm:p-2">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                : toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
                : 'bg-blue-950/80 border-blue-500/30 text-blue-300'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-400" />}
            <span className="text-sm font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-[#0B1120]/30 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Faculty Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Manage classes, attendance, AI face recognition sessions, students, and reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="faculty-btn-start-class"
            onClick={handleStartClass}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Class</span>
          </button>
          <button
            id="faculty-btn-live-rec"
            onClick={handleOpenLiveRecognition}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span>Open Live Recognition</span>
          </button>
          <button
            id="faculty-btn-take-attendance"
            onClick={() => handleTakeAttendance()}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Take Attendance</span>
          </button>
          <button
            id="faculty-btn-generate-report"
            onClick={handleGenerateReportTab}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'classes', label: 'My Classes', icon: BookOpen },
          { id: 'live-class', label: 'Live Recognition Session', icon: Video, badge: cameraActive ? 'LIVE' : null },
          { id: 'students', label: 'Roster List', icon: Users },
          { id: 'attendance', label: 'Attendance Console', icon: CheckCircle },
          { id: 'analytics', label: 'Class Analytics', icon: TrendingUp },
          { id: 'unknown', label: 'Incident Desk', icon: UserX, count: unknownFaces.length },
          { id: 'reports', label: 'Reports compiler', icon: FileSpreadsheet },
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse ml-0.5">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left main section - 3 cols wide */}
        <div className="xl:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            
            {/* 1. CLASSES TAB */}
            {activeTab === 'classes' && (
              <motion.div
                key="tab-classes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Overview Statistics inside Classes Tab */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                  {[
                    { label: "Today's Scheduled Classes", val: classes.length, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Students Checked Present", val: `${presentStudents} / ${totalStudents}`, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Pending Security Desk", val: unknownFaces.length, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
                  ].map((st, idx) => {
                    const StatIcon = st.icon;
                    return (
                      <div key={idx} className="bg-[#0B1120]/50 backdrop-blur-xl border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">{st.label}</p>
                          <h3 className="text-2xl font-bold text-white font-sans">{st.val}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${st.bg} ${st.color}`}>
                          <StatIcon className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span>Active Assigned Courses</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">SEMESTER: FALL 2026</span>
                </div>

                {/* MY CLASSES: Display beautiful class cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classes.map((cls) => {
                    const isCurrent = selectedClass.id === cls.id;
                    return (
                      <div 
                        key={cls.id} 
                        className={`bg-[#0B1120]/40 backdrop-blur-xl border rounded-2xl p-6 transition-all relative overflow-hidden flex flex-col justify-between group h-full ${
                          isCurrent 
                            ? 'border-blue-500/30 bg-gradient-to-b from-[#0B1120]/60 to-[#1e293b]/10 shadow-[0_0_20px_rgba(59,130,246,0.05)]' 
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Decorative background logo */}
                        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                          <GraduationCap className="w-40 h-40 text-blue-400" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                {cls.department}
                              </span>
                              <h3 className="text-lg font-extrabold text-white mt-2 group-hover:text-blue-300 transition-colors">
                                {cls.courseName}
                              </h3>
                            </div>
                            <Award className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 gap-x-1.5 text-xs border-y border-slate-800/80 py-3 font-medium text-slate-300">
                            <div>
                              <p className="text-[9px] font-mono text-slate-500 uppercase">Subject</p>
                              <p className="truncate font-semibold">{cls.subject}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-slate-500 uppercase">Location</p>
                              <p className="truncate font-semibold flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-400" />
                                {cls.roomNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-slate-500 uppercase">Section & Year</p>
                              <p className="truncate font-semibold">{cls.section} ({cls.year})</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-slate-500 uppercase">Timing</p>
                              <p className="truncate font-semibold text-blue-400 font-mono">{cls.schedule.split(' - ')[1]}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-400">Roster Attendance:</span>
                            <span className="font-bold text-slate-200">
                              {cls.presentCount} / {cls.totalStudents} present ({((cls.presentCount/cls.totalStudents)*100).toFixed(0)}%)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" 
                              style={{ width: `${(cls.presentCount / cls.totalStudents) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-6 pt-2 border-t border-slate-800/50">
                          <button
                            id={`card-open-${cls.id}`}
                            onClick={() => {
                              setSelectedClass(cls);
                              setActiveTab('live-class');
                              showToast(`Switched class focus to ${cls.courseName}. AI Cam ready.`, 'info');
                            }}
                            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Open Class</span>
                          </button>
                          <button
                            id={`card-att-${cls.id}`}
                            onClick={() => handleTakeAttendance(cls)}
                            className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white py-2 px-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Take Att</span>
                          </button>
                          <button
                            id={`card-students-${cls.id}`}
                            onClick={() => {
                              setSelectedClass(cls);
                              setActiveTab('students');
                              showToast(`Displaying roster for ${cls.courseName}`, 'info');
                            }}
                            className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white py-2 px-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                          >
                            <Users className="w-3 h-3 text-purple-400" />
                            <span>Students</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. LIVE CLASS TAB */}
            {activeTab === 'live-class' && (
              <motion.div
                key="tab-live-class"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[#0B1120]/40 p-4 rounded-xl border border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span>Live Biometric Session: {selectedClass.courseName}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Inference running at Room: <span className="text-blue-400 font-semibold">{selectedClass.roomNumber}</span> | Faculty: <span className="text-slate-300 font-semibold">{selectedClass.facultyName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoCameraOpen} 
                        onChange={(e) => setAutoCameraOpen(e.target.checked)}
                        className="rounded border-slate-700 text-blue-500 bg-slate-900 focus:ring-offset-slate-900 focus:ring-blue-600"
                      />
                      <span>Auto-Open Camera on Tab focus</span>
                    </label>

                    <button
                      id="faculty-btn-toggle-cam"
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cameraActive 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {cameraActive ? "Turn Cam Off" : "Open Camera Device"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Camera Column (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-[#0B1120]/30 p-4 border border-slate-800 rounded-2xl relative">
                      <CameraStream 
                        isActive={cameraActive} 
                        onFaceDetected={handleFaceDetectedInClass}
                        selectedModel="YOLOv8-Face"
                        recognitionThreshold={0.88}
                      />
                    </div>

                    <div className="bg-[#0B1120]/40 border border-slate-800 p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Live Statistics Summary</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE TRANSMISSION</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 font-mono">PRESENT COUNTER</p>
                          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{presentStudents} / {totalStudents}</p>
                        </div>
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 font-mono">ABSENT COUNT</p>
                          <p className="text-xl font-bold text-rose-400 font-mono mt-1">{absentStudents}</p>
                        </div>
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 font-mono">AVG CONFIDENCE</p>
                          <p className="text-xl font-bold text-blue-400 font-mono mt-1">96.8%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recognition Timeline Column (5 Cols) */}
                  <div className="lg:col-span-5 bg-[#0B1120]/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[480px]">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                          <span>Live Recognition Timeline</span>
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">REAL-TIME INFERENCE</span>
                      </div>

                      {/* Timeline list */}
                      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                        {liveScanLogs.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 space-y-2">
                            <Clock className="w-8 h-8 text-slate-600 mx-auto animate-spin" />
                            <p className="text-xs">Awaiting biometric detections from lobby camera...</p>
                          </div>
                        ) : (
                          liveScanLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors">
                              <div className="flex items-center gap-3">
                                <img src={log.avatarUrl} alt={log.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">{log.name}</h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{log.time}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {log.confidence}% Conf
                                </span>
                                <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wide">VERIFIED BY AI</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 mt-4 text-center">
                      <button
                        id="faculty-btn-view-all-att"
                        onClick={() => setActiveTab('attendance')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                      >
                        <span>Open Comprehensive Attendance Console</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. ROSTER LIST TAB */}
            {activeTab === 'students' && (
              <motion.div
                key="tab-students"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>Roster Roll List ({selectedClass.courseName})</span>
                  </h2>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search name or roll id..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full bg-[#0B1120]/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Table Layout for Students list */}
                <div className="bg-[#0B1120]/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900/10">
                          <th className="py-4 px-5">Student Photo</th>
                          <th className="py-4 px-4">Name</th>
                          <th className="py-4 px-4">Roll Number</th>
                          <th className="py-4 px-4">Department & Year</th>
                          <th className="py-4 px-4 text-center">Attendance Status</th>
                          <th className="py-4 px-4 text-center">Inference Verification</th>
                          <th className="py-4 px-4 text-right">Confidence</th>
                          <th className="py-4 px-5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {studentsList
                          .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()))
                          .map((student) => (
                            <tr key={student.id} className="hover:bg-slate-900/20 transition-colors">
                              {/* Photo */}
                              <td className="py-3 px-5">
                                <img 
                                  src={student.avatarUrl} 
                                  alt={student.name} 
                                  className="w-9 h-9 rounded-full object-cover border border-slate-800"
                                />
                              </td>
                              {/* Name */}
                              <td className="py-3 px-4 font-bold text-slate-200">{student.name}</td>
                              {/* Roll */}
                              <td className="py-3 px-4 font-mono font-bold text-slate-400">{student.rollNumber}</td>
                              {/* Department */}
                              <td className="py-3 px-4 text-slate-300">
                                <span className="block font-semibold">{student.department}</span>
                                <span className="text-[10px] text-slate-500">{student.year} ({selectedClass.section})</span>
                              </td>
                              {/* Attendance Status */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex px-2 py-0.8 rounded-full text-[10px] font-bold ${
                                  student.attendanceStatus === 'present'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : student.attendanceStatus === 'late'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {student.attendanceStatus.toUpperCase()}
                                </span>
                              </td>
                              {/* Recognition Status */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                  student.recognitionStatus === 'verified'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : student.recognitionStatus === 'manual'
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-slate-950 text-slate-600'
                                }`}>
                                  {student.recognitionStatus === 'verified' ? 'AI_VERIFIED' : student.recognitionStatus === 'manual' ? 'MANUAL_BYPASS' : 'UNVERIFIED'}
                                </span>
                              </td>
                              {/* Confidence */}
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-300">
                                {student.confidence > 0 ? `${student.confidence.toFixed(1)}%` : '—'}
                              </td>
                              {/* Actions */}
                              <td className="py-3 px-5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    id={`roster-mark-present-${student.id}`}
                                    onClick={() => updateAttendanceStatus(student.id, 'present')}
                                    className="p-1 rounded bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                                    title="Mark Present"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`roster-mark-late-${student.id}`}
                                    onClick={() => updateAttendanceStatus(student.id, 'late')}
                                    className="p-1 rounded bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
                                    title="Mark Late"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`roster-mark-absent-${student.id}`}
                                    onClick={() => updateAttendanceStatus(student.id, 'absent')}
                                    className="p-1 rounded bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                                    title="Mark Absent"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <motion.div
                key="tab-attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Attendance Administrative Console</h3>
                      <p className="text-xs text-slate-400 mt-1">Class focus: <span className="text-blue-400 font-semibold">{selectedClass.courseName}</span></p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id="btn-bulk-present"
                        onClick={() => handleBulkAttendance('present')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        All Present
                      </button>
                      <button
                        id="btn-bulk-absent"
                        onClick={() => handleBulkAttendance('absent')}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        All Absent
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Summary card */}
                    <div className="bg-[#0B1120]/70 p-5 rounded-xl border border-slate-800 text-center flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Present Rate Summary</h4>
                        <div className="text-4xl font-extrabold text-blue-400 font-mono mt-3">{presentPct}%</div>
                        <p className="text-xs text-slate-500 mt-1.5">{presentStudents + lateStudents} of {totalStudents} present</p>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 mt-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
                          style={{ width: `${presentPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Late students stats */}
                    <div className="bg-[#0B1120]/70 p-5 rounded-xl border border-slate-800">
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>LATE ENTRANTS</span>
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono text-[10px]">{lateStudents}</span>
                      </h4>
                      
                      <div className="space-y-2.5 mt-3 max-h-[110px] overflow-y-auto pr-1">
                        {lateStudents === 0 ? (
                          <p className="text-xs text-slate-600 italic py-2">No students marked late yet.</p>
                        ) : (
                          studentsList.filter(s => s.attendanceStatus === 'late').map(s => (
                            <div key={s.id} className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800 text-xs">
                              <img src={s.avatarUrl} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-300 truncate">{s.name}</p>
                              </div>
                              <span className="text-[10px] text-amber-400 font-mono">Manual edit</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Absent students list */}
                    <div className="bg-[#0B1120]/70 p-5 rounded-xl border border-slate-800">
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>ABSENT MEMBERS</span>
                        <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono text-[10px]">{absentStudents}</span>
                      </h4>

                      <div className="space-y-2.5 mt-3 max-h-[110px] overflow-y-auto pr-1">
                        {absentStudents === 0 ? (
                          <p className="text-xs text-slate-600 italic py-2">Full attendance verified!</p>
                        ) : (
                          studentsList.filter(s => s.attendanceStatus === 'absent').map(s => (
                            <div key={s.id} className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800 text-xs">
                              <img src={s.avatarUrl} alt={s.name} className="w-6 h-6 rounded-full object-cover opacity-70" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-300 truncate">{s.name}</p>
                              </div>
                              <button 
                                id={`quick-override-present-${s.id}`}
                                onClick={() => updateAttendanceStatus(s.id, 'present')}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer"
                              >
                                Check In
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-6">
                    <h4 className="text-sm font-bold text-white mb-4">Historical Activity Journal</h4>
                    <div className="space-y-3">
                      {[
                        { actor: "Dr. Sarah Connor", action: "Bulk updated attendance parameters", target: "CS-402 Session", time: "Today, 10:14 AM", badge: "info" },
                        { actor: "FaceVision AI Core", action: "Completed full classroom face grid mapping scan", target: "Room 405 Camera Node", time: "Today, 09:12 AM", badge: "verified" },
                        { actor: "Security Integration Server", action: "Resolved unknown face alert manually to bypass", target: "Marcus Wright", time: "Today, 08:44 AM", badge: "success" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between bg-slate-950/20 p-3.5 rounded-xl border border-slate-800 text-xs">
                          <div className="space-y-1">
                            <p className="text-slate-300">
                              <span className="font-bold text-white">{item.actor}</span>: {item.action} — <span className="italic text-slate-400 font-medium">{item.target}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{item.time}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                            item.badge === 'verified' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.badge.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. CLASS ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div
                key="tab-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily hourly area chart */}
                  <div className="bg-[#0B1120]/40 p-5 border border-slate-800 rounded-2xl">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
                      <span>Daily Attendance Real-time Spread</span>
                      <span className="text-[10px] text-blue-400">SESSION: CS-402</span>
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DAILY_ATTENDANCE_DATA}>
                          <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                          <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" name="Students Present" />
                          <Area type="monotone" dataKey="late" stroke="#fbbf24" strokeWidth={1} fillOpacity={0.1} fill="#fbbf24" name="Late Arrivals" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Weekly bar chart */}
                  <div className="bg-[#0B1120]/40 p-5 border border-slate-800 rounded-2xl">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4">
                      Weekly Attendance Rate Comparison
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={WEEKLY_ATTENDANCE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monthly trend line chart */}
                  <div className="bg-[#0B1120]/40 p-5 border border-slate-800 rounded-2xl">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4">
                      Monthly Attendance & AI Recognition Accuracy
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MONTHLY_ATTENDANCE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" domain={[85, 100]} fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="Attendance %" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Attendance Ratio" />
                          <Line type="monotone" dataKey="AI Accuracy %" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} name="AI Face Accuracy" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subject attendance chart */}
                  <div className="bg-[#0B1120]/40 p-5 border border-slate-800 rounded-2xl">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4">
                      Subject Performance Attendance Rate
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SUBJECT_PERFORMANCE_DATA} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" stroke="#64748b" domain={[0, 100]} fontSize={11} />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                          <Bar dataKey="attendance" fill="#818cf8" radius={[0, 4, 4, 0]} name="Avg Attendance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. INCIDENT DESK / UNKNOWN TAB */}
            {activeTab === 'unknown' && (
              <motion.div
                key="tab-unknown"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserX className="w-5 h-5 text-amber-400" />
                    <span>Unresolved Biometric Incidents Panel</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">2 PENDING ALERTS</span>
                </div>

                {unknownFaces.length === 0 ? (
                  <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-200">All Biometric Incidents Cleared</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Every scanned subject is matched against standard facial templates in our database. No warnings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {unknownFaces.map((face) => (
                      <div key={face.id} className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between">
                        <div className="p-5 flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-850 relative group flex-shrink-0">
                            <img src={face.imageUrl} alt="unknown" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 border-2 border-dashed border-red-500/80 animate-pulse pointer-events-none" />
                          </div>
                          
                          <div className="space-y-2 min-w-0 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-red-400 font-mono font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                                SECURITY OUTLIER
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {face.id}</span>
                            </div>
                            <p className="font-bold text-slate-200">Incident Detected</p>
                            
                            <div className="grid grid-cols-2 gap-y-1 text-slate-400 font-medium text-[11px] font-mono leading-relaxed">
                              <div>
                                <span className="block text-[9px] text-slate-500 font-sans">DETECTED TIME</span>
                                <span>{new Date(face.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-sans">CAMERA BLOCK</span>
                                <span>{face.camera}</span>
                              </div>
                              <div className="col-span-2 mt-1">
                                <span className="block text-[9px] text-slate-500 font-sans">CONFIDENCE HIGHER RANK</span>
                                <span className="text-slate-300 font-bold">{face.confidence}% Match Threshold</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/20 border-t border-slate-800/80">
                          <button
                            id={`register-student-btn-${face.id}`}
                            onClick={() => handleRegisterStudent(face.id)}
                            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Enroll</span>
                          </button>
                          <button
                            id={`ignore-student-btn-${face.id}`}
                            onClick={() => handleIgnoreFace(face.id)}
                            className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ignore</span>
                          </button>
                          <button
                            id={`report-security-btn-${face.id}`}
                            onClick={() => handleReportSecurity(face.id, face.camera)}
                            className="flex items-center justify-center gap-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 7. REPORTS TAB */}
            {activeTab === 'reports' && (
              <motion.div
                key="tab-reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Generate Attendance and Analytics Reports</h3>
                    <p className="text-xs text-slate-400 mt-1">Compile and export secure records directly for school administrators.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Selected Course Roster</label>
                        <select 
                          value={selectedClass.id} 
                          onChange={(e) => {
                            const found = classes.find(c => c.id === e.target.value);
                            if (found) setSelectedClass(found);
                          }}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.courseName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2">Report Type</label>
                          <select className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option>Attendance Sheet Summary</option>
                            <option>Inference Audit History</option>
                            <option>Flagged Incidents Record</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2">Time Period</label>
                          <select className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option>Today Only</option>
                            <option>This Week</option>
                            <option>Current Month</option>
                            <option>Full Semester</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-850/80 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Ready Compiler File preview</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-2">{selectedClass.courseName} - Summary_Report.csv</h4>
                        <ul className="text-slate-400 text-xs space-y-1.5 mt-3 list-disc list-inside">
                          <li>Roster count: {totalStudents} students verified</li>
                          <li>Attendance Present Ratio: {presentPct}%</li>
                          <li>Anomalous Unknown Incidents: 2 flagged logs</li>
                          <li>Generated timestamp: 2026-07-11 UTC</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <button
                          id="export-pdf-btn"
                          onClick={() => handleExport('pdf')}
                          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          id="export-excel-btn"
                          onClick={() => handleExport('excel')}
                          className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Excel</span>
                        </button>
                        <button
                          id="export-email-btn"
                          onClick={() => handleExport('email')}
                          className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-purple-400" />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right sidebar column - 1 col wide */}
        <div className="space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-[#0B1120]/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
              <span>Quick Actions</span>
              <Sliders className="w-4 h-4 text-slate-500" />
            </h3>
            <div className="space-y-2.5">
              <button
                id="qa-register-student"
                onClick={() => {
                  setActiveTab('unknown');
                  showToast("Switched to enroller incident tab to register new students.", "info");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850/80 hover:border-slate-800 text-left text-xs font-semibold text-slate-200 transition-all hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>Register Student</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                id="qa-open-camera"
                onClick={() => {
                  setActiveTab('live-class');
                  setCameraActive(true);
                  showToast("Opened active class camera node.", "success");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850/80 hover:border-slate-800 text-left text-xs font-semibold text-slate-200 transition-all hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>Open Class Camera</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                id="qa-view-analytics"
                onClick={() => {
                  setActiveTab('analytics');
                  showToast("Switched to analytics & metrics engine.", "info");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850/80 hover:border-slate-800 text-left text-xs font-semibold text-slate-200 transition-all hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>View Class Analytics</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                id="qa-attendance-history"
                onClick={() => {
                  setActiveTab('attendance');
                  showToast("Switched to attendance journal & summary logs.", "info");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850/80 hover:border-slate-800 text-left text-xs font-semibold text-slate-200 transition-all hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Attendance Control Desk</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                id="qa-generate-report"
                onClick={() => {
                  setActiveTab('reports');
                  showToast("Switched to CSV report compiler.", "info");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850/80 hover:border-slate-800 text-left text-xs font-semibold text-slate-200 transition-all hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Generate Report</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* DYNAMIC NOTIFICATIONS FEED PANEL */}
          <div className="bg-[#0B1120]/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
              <span>Feed & Notifications</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            </h3>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
              {notifications.map((notif) => (
                <div key={notif.id} className="text-xs border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold flex items-center gap-1.5 ${
                      notif.type === 'joined' ? 'text-emerald-400' :
                      notif.type === 'unknown' ? 'text-amber-400' :
                      notif.type === 'completed' ? 'text-blue-400' :
                      notif.type === 'low-conf' ? 'text-purple-400' : 'text-rose-400'
                    }`}>
                      {notif.type === 'joined' && <CheckCircle className="w-3.5 h-3.5" />}
                      {notif.type === 'unknown' && <UserX className="w-3.5 h-3.5" />}
                      {notif.type === 'completed' && <FileSpreadsheet className="w-3.5 h-3.5" />}
                      {notif.type === 'low-conf' && <AlertCircle className="w-3.5 h-3.5" />}
                      {notif.type === 'offline' && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{notif.title}</span>
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">{notif.timeLabel}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium leading-normal">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
