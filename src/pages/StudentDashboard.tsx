import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Shield, 
  Sliders, 
  Bell, 
  Download, 
  Heart, 
  Phone, 
  Mail, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  FileDown, 
  Trash, 
  Upload, 
  RotateCw, 
  Star, 
  Info, 
  GraduationCap, 
  Activity,
  Layers,
  ArrowUpRight,
  Fingerprint
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

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface StudentProfileInfo {
  photo: string;
  fullName: string;
  studentId: string;
  rollNumber: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  section: string;
  batch: string;
  bloodGroup: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

interface TodayClass {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  attendanceStatus: 'Present' | 'Absent' | 'Late' | 'Pending';
  recognitionStatus: 'AI Verified' | 'Manual' | 'Unverified' | '—';
}

interface AIHistoryRecord {
  id: string;
  timestamp: string;
  confidence: number;
  faceQuality: 'Optimal' | 'Good' | 'Poor';
  cameraUsed: string;
  imageUrl: string;
  status: 'Verified' | 'Flagged' | 'Failed';
}

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  documentName?: string;
  facultyApprover: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
}

interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'warning' | 'announcement' | 'exam' | 'system';
  timestamp: string;
  read: boolean;
}

interface AcademicReport {
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
  completedSubjects: number;
  pendingAssignments: number;
  upcomingExams: number;
  attendanceRequirementPct: number; // e.g. 75%
}

// ==========================================
// INITIAL SEED DATA
// ==========================================
const INITIAL_PROFILE: StudentProfileInfo = {
  photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  fullName: 'John Connor',
  studentId: 'ST-101-2026',
  rollNumber: 'FV-2026-001',
  department: 'Department of Cybernetic Intelligence',
  course: 'B.Tech in Artificial Intelligence & Edge Vision',
  year: '4th Year',
  semester: '8th Semester',
  section: 'Section Alpha',
  batch: '2022 - 2026',
  bloodGroup: 'O-Negative',
  email: 'john.connor@resistance.net',
  phone: '+1 (555) 382-2026',
  status: 'Active'
};

const INITIAL_CLASSES: TodayClass[] = [
  {
    id: 'tc-1',
    subject: 'CS-402 Deep Learning & Neural Networks',
    faculty: 'Dr. Sarah Connor',
    room: 'Room 405 (Vision Lab)',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    status: 'Completed',
    attendanceStatus: 'Present',
    recognitionStatus: 'AI Verified'
  },
  {
    id: 'tc-2',
    subject: 'CS-301 Advanced Computer Vision',
    faculty: 'Dr. Sarah Connor',
    room: 'Room 302',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    status: 'In Progress',
    attendanceStatus: 'Late',
    recognitionStatus: 'AI Verified'
  },
  {
    id: 'tc-3',
    subject: 'AI-102 Introduction to Cybernetic Systems',
    faculty: 'Prof. Miles Dyson',
    room: 'Tech Lab 2',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    status: 'Scheduled',
    attendanceStatus: 'Pending',
    recognitionStatus: '—'
  },
  {
    id: 'tc-4',
    subject: 'AI-480 Bio-Inference & Face Synthesis',
    faculty: 'Prof. Katherine Brewster',
    room: 'Virtual Auditorium 3',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    status: 'Scheduled',
    attendanceStatus: 'Pending',
    recognitionStatus: '—'
  }
];

const INITIAL_AI_HISTORY: AIHistoryRecord[] = [
  {
    id: 'ai-1',
    timestamp: '2026-07-11 09:02:15 AM',
    confidence: 99.5,
    faceQuality: 'Optimal',
    cameraUsed: 'Room 405 Entrance Cam',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'Verified'
  },
  {
    id: 'ai-2',
    timestamp: '2026-07-10 11:34:11 AM',
    confidence: 98.1,
    faceQuality: 'Optimal',
    cameraUsed: 'Room 302 Desk Node',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'Verified'
  },
  {
    id: 'ai-3',
    timestamp: '2026-07-09 02:05:44 PM',
    confidence: 94.8,
    faceQuality: 'Good',
    cameraUsed: 'Tech Lab 2 Portal Unit',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'Verified'
  },
  {
    id: 'ai-4',
    timestamp: '2026-07-08 09:12:03 AM',
    confidence: 86.2,
    faceQuality: 'Poor',
    cameraUsed: 'Main Gate Overhead Hub',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'Flagged'
  },
  {
    id: 'ai-5',
    timestamp: '2026-07-07 11:42:01 AM',
    confidence: 97.9,
    faceQuality: 'Optimal',
    cameraUsed: 'Room 302 Desk Node',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'Verified'
  }
];

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-1',
    type: 'Medical Leave',
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    reason: 'Underwent hardware recalibration and cognitive alignment protocol.',
    documentName: 'medical_certificate_cyberdyne.pdf',
    facultyApprover: 'Dr. Sarah Connor',
    status: 'Approved',
    appliedDate: '2026-06-10'
  },
  {
    id: 'lv-2',
    type: 'Academic Duty',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    reason: 'Representing the academy at the Global Resistance AI Defense Summit.',
    documentName: 'summit_invite_sec.pdf',
    facultyApprover: 'Prof. Miles Dyson',
    status: 'Pending',
    appliedDate: '2026-07-09'
  }
];

const INITIAL_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'not-1',
    title: 'Attendance Marked Successfully',
    message: 'Your face scan was verified at CS-301 Advanced Computer Vision (Room 302).',
    type: 'attendance',
    timestamp: '15 mins ago',
    read: false
  },
  {
    id: 'not-2',
    title: 'Low Attendance Caution Warning',
    message: 'Your current attendance in AI-102 Intro to Cybernetic Systems is hovering around 76.5%. Maintain 75% min requirement.',
    type: 'warning',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 'not-3',
    title: 'Mid-Term Neural Net Lab Assignment',
    message: 'Dr. Sarah Connor posted a new assignment: YOLOv8 Training Hyperparameters. Due July 18.',
    type: 'announcement',
    timestamp: '2 days ago',
    read: true
  },
  {
    id: 'not-4',
    title: 'Exam Hall Ticket Released',
    message: 'Biometric Entrance passes for Fall Semester practical exams are now ready for download.',
    type: 'exam',
    timestamp: '3 days ago',
    read: true
  }
];

const ACADEMIC_REPORT_DATA: AcademicReport = {
  cgpa: 3.92,
  creditsEarned: 134,
  totalCredits: 148,
  completedSubjects: 38,
  pendingAssignments: 2,
  upcomingExams: 4,
  attendanceRequirementPct: 75
};

// Recharts Graph seed values
const DAILY_DATA = [
  { name: 'CS-402', 'Scans': 1, 'Quality': 98 },
  { name: 'CS-301', 'Scans': 1, 'Quality': 95 },
  { name: 'AI-102', 'Scans': 0, 'Quality': 0 },
  { name: 'AI-480', 'Scans': 0, 'Quality': 0 }
];

const WEEKLY_DATA = [
  { day: 'Mon', 'Present %': 100, 'Avg Confidence %': 98.4 },
  { day: 'Tue', 'Present %': 80, 'Avg Confidence %': 95.2 },
  { day: 'Wed', 'Present %': 100, 'Avg Confidence %': 99.1 },
  { day: 'Thu', 'Present %': 100, 'Avg Confidence %': 97.5 },
  { day: 'Fri', 'Present %': 90, 'Avg Confidence %': 91.3 }
];

const MONTH_DATA = [
  { month: 'Jan', 'Attendance %': 94.5, 'AI Accuracy': 99.1 },
  { month: 'Feb', 'Attendance %': 96.2, 'AI Accuracy': 99.4 },
  { month: 'Mar', 'Attendance %': 91.8, 'AI Accuracy': 98.9 },
  { month: 'Apr', 'Attendance %': 95.0, 'AI Accuracy': 99.5 },
  { month: 'May', 'Attendance %': 97.4, 'AI Accuracy': 99.8 },
  { month: 'Jun', 'Attendance %': 95.8, 'AI Accuracy': 99.6 }
];

const ATTENDANCE_PIE = [
  { name: 'Present Days', value: 84, color: '#10B981' },
  { name: 'Late Days', value: 8, color: '#F59E0B' },
  { name: 'Absent Days', value: 4, color: '#EF4444' }
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'ai-history' | 'leave' | 'docs' | 'settings'>('overview');
  
  // Stateful seed data for real interactions
  const [profile, setProfile] = useState<StudentProfileInfo>(INITIAL_PROFILE);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>(INITIAL_CLASSES);
  const [aiHistory, setAiHistory] = useState<AIHistoryRecord[]>(INITIAL_AI_HISTORY);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [notifications, setNotifications] = useState<StudentNotification[]>(INITIAL_NOTIFICATIONS);
  const [academics] = useState<AcademicReport>(ACADEMIC_REPORT_DATA);
  
  // Leave Form Fields
  const [newLeaveType, setNewLeaveType] = useState('Medical Leave');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newApprover, setNewApprover] = useState('Dr. Sarah Connor');
  const [newDocName, setNewDocName] = useState<string>('');
  
  // Settings Form Fields
  const [phoneInput, setPhoneInput] = useState(profile.phone);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordShow, setPasswordShow] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // General Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick button actions
  const handleDownloadReport = () => {
    triggerToast("Compiling biometric security audit & academic attendance sheet...", "info");
    setTimeout(() => {
      triggerToast("Download triggered: FaceVision_Attendance_Report_JohnConnor.pdf", "success");
    }, 1500);
  };

  const handleRequestLeaveClick = () => {
    setActiveTab('leave');
    triggerToast("Leave Submission Desk loaded.", "info");
  };

  const handleJoinClass = (subject: string, room: string) => {
    triggerToast(`Joining telemetry feed for ${subject} in ${room}...`, "success");
  };

  // Submit Leave Action
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate || !newReason) {
      triggerToast("Please populate all necessary leave parameters.", "error");
      return;
    }

    const newRequest: LeaveRequest = {
      id: `lv-${Date.now()}`,
      type: newLeaveType,
      startDate: newStartDate,
      endDate: newEndDate,
      reason: newReason,
      documentName: newDocName || 'supporting_medical_slip.pdf',
      facultyApprover: newApprover,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    triggerToast("Your leave request has been submitted to Faculty Desk.", "success");
    
    // Clear form fields
    setNewStartDate('');
    setNewEndDate('');
    setNewReason('');
    setNewDocName('');

    // Add automated system notification
    const newSysNotif: StudentNotification = {
      id: `not-sys-${Date.now()}`,
      title: 'Leave Application Logged',
      message: `Your application for ${newLeaveType} starting ${newStartDate} is pending faculty approval.`,
      type: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newSysNotif, ...prev]);
  };

  // Save profile settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      phone: phoneInput,
      email: emailInput
    }));
    triggerToast("Student Profile parameters updated.", "success");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOld || !passwordNew) {
      triggerToast("Both current and new password must be supplied.", "error");
      return;
    }
    setPasswordOld('');
    setPasswordNew('');
    triggerToast("Credential hash recalculated and updated in Auth Module.", "success");
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast("Notification dismissed.", "info");
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerToast("Marked all alerts as read.", "success");
  };

  // Calculation parameters
  const totalScans = aiHistory.length;
  const avgConfidence = (aiHistory.reduce((acc, h) => acc + h.confidence, 0) / totalScans).toFixed(1);

  return (
    <div className="space-y-8 p-1 sm:p-2">
      
      {/* Dynamic Toast Layer */}
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
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            View attendance, AI recognition history, academic information, and personal profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="student-header-btn-attendance"
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>View Attendance</span>
          </button>
          <button
            id="student-header-btn-profile"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Open Profile</span>
          </button>
          <button
            id="student-header-btn-download"
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-850 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Attendance Report</span>
          </button>
          <button
            id="student-header-btn-leave"
            onClick={handleRequestLeaveClick}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB SYSTEM CONTROLS */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Profile', icon: User },
          { id: 'calendar', label: 'Attendance Calendar', icon: Calendar },
          { id: 'ai-history', label: 'AI Face Scans', icon: Activity },
          { id: 'leave', label: 'Leave Desk', icon: FileText, count: leaveRequests.filter(l => l.status === 'Pending').length },
          { id: 'docs', label: 'Dossier Documents', icon: FileDown },
          { id: 'settings', label: 'Security & Preferences', icon: Sliders },
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`student-tab-btn-${tab.id}`}
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
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CORE STATS GRID OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Attendance %', value: '92.4%', sub: 'Requirement: 75%', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Present Days', value: '84 Days', sub: 'Completed schedule', color: 'text-emerald-400', bg: 'bg-slate-900/40' },
          { label: 'Absent Days', value: '4 Days', sub: 'Non-excused logs', color: 'text-rose-400', bg: 'bg-slate-900/40' },
          { label: 'Late Entries', value: '8 Days', sub: 'Bypassed parameters', color: 'text-amber-400', bg: 'bg-slate-900/40' },
          { label: 'Recognition Acc', value: `${avgConfidence}%`, sub: 'Biometric quality', color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Current Semester', value: '8th Sem', sub: 'Term ending July 2026', color: 'text-slate-200', bg: 'bg-slate-900/40' },
          { label: "Today's Classes", value: `${todayClasses.length} Courses`, sub: '2 finished, 1 active', color: 'text-indigo-400', bg: 'bg-slate-900/40' },
        ].map((card, idx) => (
          <div key={idx} className={`border border-slate-800 rounded-xl p-4 flex flex-col justify-between ${card.bg}`}>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
            <div className="my-2">
              <span className={`text-xl font-black font-sans ${card.color}`}>{card.value}</span>
            </div>
            <span className="text-[9px] font-medium text-slate-500 truncate">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* MAIN LAYOUT: Bento Layout splitting Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Takes 2 spans for dynamic tab modules */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="student-overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* PROFILE CARD */}
                <div className="bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                  {/* Glassmorphic overlay background circle */}
                  <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Student Photo */}
                    <div className="flex-shrink-0 self-center md:self-start relative group">
                      <img 
                        src={profile.photo} 
                        alt={profile.fullName} 
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-blue-500/30 group-hover:border-blue-500/60 transition-colors shadow-lg"
                      />
                      <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase border border-slate-900">
                        {profile.status}
                      </span>
                    </div>

                    {/* Student Details Fields */}
                    <div className="flex-grow space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-white">{profile.fullName}</h2>
                          <p className="text-xs text-blue-400 font-semibold mt-0.5">{profile.course}</p>
                        </div>
                        <div className="text-left md:text-right font-mono text-[10px] text-slate-500 space-y-0.5">
                          <p className="font-bold text-slate-300">ID: {profile.studentId}</p>
                          <p>Roll: {profile.rollNumber}</p>
                        </div>
                      </div>

                      {/* Detail Parameters */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Department</span>
                          <p className="font-bold text-slate-300 mt-0.5">{profile.department}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Academic Year</span>
                          <p className="font-bold text-slate-300 mt-0.5">{profile.year} ({profile.semester})</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Section & Batch</span>
                          <p className="font-bold text-slate-300 mt-0.5">{profile.section} | {profile.batch}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Blood Group</span>
                          <p className="font-bold text-slate-300 mt-0.5">{profile.bloodGroup}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Registered Email</span>
                          <p className="font-bold text-slate-300 mt-0.5 truncate">{profile.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Secure Contact</span>
                          <p className="font-bold text-slate-300 mt-0.5">{profile.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TODAY'S CLASSES */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <span>Today's Academic Schedule</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">DATE: JULY 11, 2026</span>
                  </div>

                  <div className="space-y-4">
                    {todayClasses.map((cls) => {
                      return (
                        <div 
                          key={cls.id} 
                          className="bg-[#0B1120]/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:border-slate-700/80"
                        >
                          <div className="space-y-1 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                cls.status === 'Completed' 
                                  ? 'bg-slate-600' 
                                  : cls.status === 'In Progress' 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : 'bg-blue-500'
                              }`} />
                              <h4 className="text-sm font-bold text-slate-200">{cls.subject}</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4 text-[11px] text-slate-400 font-medium">
                              <p>Faculty: <span className="text-slate-300 font-bold">{cls.faculty}</span></p>
                              <p>Room: <span className="text-slate-300 font-bold">{cls.room}</span></p>
                              <p className="font-mono">Time: {cls.startTime} - {cls.endTime}</p>
                              <p>Session: <span className="text-slate-300 font-bold">{cls.status}</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center">
                            {/* Attendance Pill */}
                            <div className="text-right">
                              <p className="text-[8px] font-mono text-slate-500 uppercase">ATTENDANCE</p>
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                cls.attendanceStatus === 'Present' 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : cls.attendanceStatus === 'Late' 
                                  ? 'bg-amber-500/10 text-amber-400' 
                                  : cls.attendanceStatus === 'Absent' 
                                  ? 'bg-rose-500/10 text-rose-400' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {cls.attendanceStatus}
                              </span>
                            </div>

                            {/* Recognition Pill */}
                            <div className="text-right">
                              <p className="text-[8px] font-mono text-slate-500 uppercase">AI VERIFY</p>
                              <span className="text-[10px] font-bold text-slate-300 block">
                                {cls.recognitionStatus}
                              </span>
                            </div>

                            {/* Join Class Action button if class is scheduled/in progress */}
                            {cls.status !== 'Completed' && (
                              <button
                                id={`btn-join-class-${cls.id}`}
                                onClick={() => handleJoinClass(cls.subject, cls.room)}
                                className="ml-2 bg-blue-600/15 border border-blue-500/20 text-blue-400 hover:bg-blue-600/35 hover:text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                              >
                                Join Telemetry
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* QUICK CLASSIFIED STATS & GRAPHS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Subject Attendance Percentage</h4>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DAILY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b' }} />
                          <Bar dataKey="Quality" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                            {DAILY_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Biometric Verification Confidence</h4>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b' }} />
                          <Area type="monotone" dataKey="Avg Confidence %" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: ATTENDANCE HISTORY / CALENDAR */}
            {activeTab === 'calendar' && (
              <motion.div
                key="student-calendar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Interactive Semester Matrix</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">July 2026 Academic Term</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0B1120]/30 border border-slate-800 p-6 rounded-2xl">
                  {/* Monthly grid mockup */}
                  <div className="md:col-span-7">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-200">July 2026</span>
                      <div className="flex gap-1">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">Month</span>
                        <span className="text-[10px] bg-blue-600/20 border border-blue-500/20 px-2 py-0.5 rounded text-blue-300">Term</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-slate-500 font-bold uppercase mb-2">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {/* Blank days */}
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`blank-${i}`} className="aspect-square bg-slate-950/20 border border-slate-900/40 rounded-lg" />
                      ))}
                      {/* 31 days with different mock attendances */}
                      {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        let bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                        let desc = 'Present (Verified)';
                        if (day === 4 || day === 18) {
                          bg = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                          desc = 'Absent';
                        } else if (day === 7 || day === 14 || day === 21) {
                          bg = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                          desc = 'Late Entry';
                        } else if (day > 11) {
                          bg = 'bg-slate-900/50 border-slate-800 text-slate-600';
                          desc = 'Upcoming Schedule';
                        }
                        return (
                          <div 
                            key={`day-${day}`} 
                            className={`aspect-square border rounded-lg flex flex-col justify-between p-1.5 transition-all cursor-help hover:scale-105 ${bg}`}
                            title={`July ${day}, 2026: ${desc}`}
                          >
                            <span className="text-[10px] font-bold">{day}</span>
                            <span className="text-[8px] font-mono self-end">
                              {day <= 11 ? (day === 4 || day === 18 ? 'ABS' : day === 7 || day === 14 || day === 21 ? 'LAT' : 'OK') : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary lists & statistics */}
                  <div className="md:col-span-5 space-y-6">
                    <div className="bg-[#0B1120]/50 p-4 border border-slate-800 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matrix Color Legend</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 block" />
                            <span className="text-slate-300 font-semibold">AI Verified Present</span>
                          </span>
                          <span className="font-mono text-slate-500 font-bold">24 Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40 block" />
                            <span className="text-slate-300 font-semibold">Late Admittance</span>
                          </span>
                          <span className="font-mono text-slate-500 font-bold">3 Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/40 block" />
                            <span className="text-slate-300 font-semibold">Unexcused Absence</span>
                          </span>
                          <span className="font-mono text-slate-500 font-bold">2 Days</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0B1120]/50 p-4 border border-slate-800 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Semester Attendance Target</h4>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-semibold">Current Rate:</span>
                        <span className="font-bold text-emerald-400 font-mono">92.4%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92.4%' }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Required threshold: 75%</span>
                        <span className="text-emerald-400 font-bold">+17.4% above limit</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HISTORICAL ATTENDANCE TREND CHART */}
                <div className="bg-[#0B1120]/30 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">6-Month Attendance Percentage vs AI Verification Accuracy</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MONTH_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis domain={[85, 100]} stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b' }} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Attendance %" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="AI Accuracy" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: AI RECOGNITION HISTORY */}
            {activeTab === 'ai-history' && (
              <motion.div
                key="student-ai-history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-blue-400" />
                    <span>Real-Time Biometric Audit Log</span>
                  </h3>
                  <button
                    id="student-refresh-scans"
                    onClick={() => triggerToast("Biometric verification timeline fully synchronized with camera nodes.", "success")}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                {/* Scan History list */}
                <div className="space-y-4">
                  {aiHistory.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all hover:border-slate-700/80"
                    >
                      <div className="flex items-center gap-4">
                        {/* Static / Mock face image to convey realism without client camera issues */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 relative">
                          <img 
                            referrerPolicy="no-referrer"
                            src={rec.imageUrl} 
                            alt="Captured frame" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-300">{rec.cameraUsed}</h4>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-black ${
                              rec.status === 'Verified' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {rec.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-1">Scan Epoch: {rec.timestamp}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Detection Engine: YOLOv8-Face Model v2.4</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right self-end md:self-center">
                        <div>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Face Quality</p>
                          <span className={`text-xs font-black ${
                            rec.faceQuality === 'Optimal' 
                              ? 'text-emerald-400' 
                              : rec.faceQuality === 'Good' 
                              ? 'text-blue-400' 
                              : 'text-amber-400'
                          }`}>{rec.faceQuality}</span>
                        </div>

                        <div>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">CONFIDENCE</p>
                          <span className="text-sm font-black font-mono text-white">{rec.confidence}%</span>
                        </div>

                        {/* Interactive Verification button for low conf/flagged cases */}
                        {rec.status === 'Flagged' && (
                          <button
                            id={`btn-audit-reverify-${rec.id}`}
                            onClick={() => {
                              // Verify the flagged record
                              setAiHistory(prev => prev.map(h => {
                                if (h.id === rec.id) {
                                  return { ...h, status: 'Verified', confidence: 94.0, faceQuality: 'Good' };
                                }
                                return h;
                              }));
                              triggerToast("Manual backup audit approved by student credentials.", "success");
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                          >
                            Bypass Audit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: LEAVE DESK */}
            {activeTab === 'leave' && (
              <motion.div
                key="student-leave"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Apply Leave Form */}
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Apply for Academic Absence / Leave</span>
                  </h3>

                  <form onSubmit={handleSubmitLeave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Leave Category</label>
                        <select
                          value={newLeaveType}
                          onChange={(e) => setNewLeaveType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>Medical Leave</option>
                          <option>Academic Duty (OD)</option>
                          <option>Personal Emergency</option>
                          <option>Sabbatical Protocol</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Approving Faculty Faculty</label>
                        <select
                          value={newApprover}
                          onChange={(e) => setNewApprover(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>Dr. Sarah Connor</option>
                          <option>Prof. Miles Dyson</option>
                          <option>Prof. Katherine Brewster</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Start Date</label>
                        <input
                          type="date"
                          value={newStartDate}
                          onChange={(e) => setNewStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">End Date</label>
                        <input
                          type="date"
                          value={newEndDate}
                          onChange={(e) => setNewEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Detailed Reason / Brief</label>
                      <textarea
                        rows={3}
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        placeholder="Detail the justification for this biometric absence bypass request..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Supporting Documents Upload Simulation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Supporting Documents (PDF / JPEG)</label>
                      <div className="border border-dashed border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-colors p-4 rounded-xl text-center relative cursor-pointer group">
                        <Upload className="w-6 h-6 text-slate-600 group-hover:text-blue-400 mx-auto transition-colors" />
                        <p className="text-xs text-slate-400 mt-2 font-semibold">Drag and drop document here, or click to browse</p>
                        <p className="text-[10px] text-slate-500 mt-1">Upload verified medical receipts, summit invites, etc. Max 5MB</p>
                        <input 
                          type="file" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewDocName(e.target.files[0].name);
                              triggerToast(`Document staged: ${e.target.files[0].name}`, "info");
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                      </div>
                      {newDocName && (
                        <div className="mt-2 text-xs text-blue-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Staged Document: {newDocName}</span>
                        </div>
                      )}
                    </div>

                    <button
                      id="student-btn-submit-leave"
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-5 rounded-xl transition-colors cursor-pointer"
                    >
                      Submit Leave Request
                    </button>
                  </form>
                </div>

                {/* Leave History List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-300">Biometric Absence History Logs</h3>
                  {leaveRequests.map((lv) => (
                    <div 
                      key={lv.id} 
                      className="bg-[#0B1120]/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:border-slate-700/80"
                    >
                      <div className="space-y-1 flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-200">{lv.type}</h4>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            lv.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : lv.status === 'Pending' 
                              ? 'bg-amber-500/10 text-amber-400 animate-pulse' 
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {lv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{lv.reason}</p>
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-500 font-medium">
                          <p>Span: <span className="text-slate-300 font-mono font-semibold">{lv.startDate} to {lv.endDate}</span></p>
                          <p>Approver: <span className="text-slate-300 font-bold">{lv.facultyApprover}</span></p>
                          <p>Applied: <span className="text-slate-300 font-mono font-semibold">{lv.appliedDate}</span></p>
                          {lv.documentName && (
                            <p className="text-blue-400 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                              <Download className="w-2.5 h-2.5" />
                              <span>{lv.documentName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Cancel Leave button if pending */}
                      {lv.status === 'Pending' && (
                        <button
                          id={`btn-cancel-leave-${lv.id}`}
                          onClick={() => {
                            setLeaveRequests(prev => prev.filter(l => l.id !== lv.id));
                            triggerToast("Leave application retracted.", "info");
                          }}
                          className="bg-transparent border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          Retract Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: DOCUMENTS DOWNLOAD */}
            {activeTab === 'docs' && (
              <motion.div
                key="student-docs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <FileDown className="w-5 h-5 text-blue-400" />
                    <span>Dossier Downloads Desk</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">SEMESTER: FALL 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'doc-1', title: 'Student ID Digital Passport', desc: 'Active biometric RFID pass credentials encoded with face pattern keys.', file: 'john_connor_biometric_id.pdf', size: '2.4 MB' },
                    { id: 'doc-2', title: 'Bonafide Student Certificate', desc: 'Enrollment testimony for research clearances and lab access.', file: 'bonafide_enrolment_2026.pdf', size: '1.1 MB' },
                    { id: 'doc-3', title: 'Biometric Exam Hall Ticket', desc: 'Fall Practical test pass required for entry camera verification.', file: 'hall_ticket_fall_8th.pdf', size: '1.8 MB' },
                    { id: 'doc-4', title: 'Deep Learning Foundation Certificate', desc: 'Biometric verified certification for CS-402 milestone achievement.', file: 'dl_certificate_vision.pdf', size: '4.2 MB' }
                  ].map((doc) => (
                    <div key={doc.id} className="bg-[#0B1120]/40 border border-slate-800 rounded-xl p-4 flex justify-between items-center transition-all hover:border-slate-700">
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-slate-200">{doc.title}</h4>
                        <p className="text-xs text-slate-400 pr-2">{doc.desc}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-500">{doc.file} | <span className="text-blue-400">{doc.size}</span></p>
                      </div>
                      <button
                        id={`btn-doc-download-${doc.id}`}
                        onClick={() => triggerToast(`Downloaded ${doc.file} successfully!`, "success")}
                        className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS & PRIVACY */}
            {activeTab === 'settings' && (
              <motion.div
                key="student-settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Profile Settings */}
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>Communications & Profile Updates</span>
                  </h3>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Registered Email Address</label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Secure Contact Number</label>
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      id="student-btn-save-settings"
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-5 rounded-xl transition-colors cursor-pointer"
                    >
                      Save Profile Parameters
                    </button>
                  </form>
                </div>

                {/* Password updates */}
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <span>Recalculate Access Credentials (Password)</span>
                  </h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={passwordShow ? 'text' : 'password'}
                            value={passwordOld}
                            onChange={(e) => setPasswordOld(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordShow(!passwordShow)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {passwordShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={passwordNew}
                          onChange={(e) => setPasswordNew(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      id="student-btn-save-password"
                      type="submit"
                      className="bg-slate-900 border border-slate-700 hover:bg-slate-850 text-slate-200 font-bold text-xs py-2 px-5 rounded-xl transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Biometric Privacy preferences */}
                <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>Biometric Protection & Privacy Matrix</span>
                  </h3>

                  <div className="space-y-4 text-xs font-medium text-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <p className="text-slate-200 font-bold">Two-Factor Biometric Passkeys (2FA)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Enforce facial verification checks on login attempts alongside passwords.</p>
                      </div>
                      <button
                        id="student-btn-toggle-2fa"
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          triggerToast(twoFactorEnabled ? "Facial 2FA deactivated. Standard password only." : "Facial 2FA fully activated.", "info");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${twoFactorEnabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <p className="text-slate-200 font-bold">Push Notifications</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Trigger real-time desktop banner warnings on low confidence flags or late registers.</p>
                      </div>
                      <button
                        id="student-btn-toggle-push"
                        onClick={() => {
                          setPushNotifs(!pushNotifs);
                          triggerToast(pushNotifs ? "Push warnings muted." : "Push warnings active.", "info");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${pushNotifs ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${pushNotifs ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-200 font-bold">Email Notifications</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Receive weekly reports compiling complete attendance ratios and audit logs.</p>
                      </div>
                      <button
                        id="student-btn-toggle-email"
                        onClick={() => {
                          setEmailNotifs(!emailNotifs);
                          triggerToast(emailNotifs ? "Weekly email digests unsubscribed." : "Weekly digests active.", "info");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailNotifs ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${emailNotifs ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Bento layout - Notifications and Academic Performance */}
        <div className="space-y-8">
          
          {/* ACADEMIC PERFORMANCE */}
          <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <span>Academic Performance Audit</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">CGPA Metric</span>
                <p className="text-2xl font-black text-white font-sans mt-1">{academics.cgpa}</p>
                <span className="text-[9px] text-blue-400 font-bold block mt-0.5">TOP 5% IN CLASS</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">CREDITS COMPLETED</span>
                <p className="text-xl font-bold text-white font-mono mt-1">{academics.creditsEarned} / {academics.totalCredits}</p>
                <span className="text-[9px] text-slate-500 block mt-1">14 credits remaining</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 font-medium">Completed Subjects:</span>
                <span className="font-bold text-slate-200">{academics.completedSubjects} courses</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 font-medium">Pending Assignments:</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">{academics.pendingAssignments} tasks pending</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 font-medium">Upcoming Practical Exams:</span>
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-[10px]">{academics.upcomingExams} tests scheduled</span>
              </div>
            </div>
          </div>

          {/* ATTENDANCE REQUIREMENT METER */}
          <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-5 text-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance Requirement Status</span>
            
            <div className="relative inline-flex items-center justify-center">
              {/* Simple SVGCircle gauge */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" strokeWidth="6" stroke="#1e293b" fill="transparent" />
                <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="#10B981" fill="transparent" 
                        strokeDasharray={339}
                        strokeDashoffset={339 - (339 * 92.4) / 100}
                        strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">92.4%</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-mono">Current Status</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium px-3">
              Your overall attendance is <span className="text-emerald-400 font-bold">well above</span> the 75% graduation compliance limit. Excellent!
            </p>
          </div>

          {/* NOTIFICATIONS BOARD */}
          <div className="bg-[#0B1120]/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Real-Time Biometric & Faculty Alerts</span>
                </h3>
                {notifications.some(n => !n.read) && (
                  <button
                    id="student-clear-all-alerts"
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* Notification list container */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-35" />
                    <p className="text-xs">No pending student notifications found.</p>
                  </div>
                ) : (
                  notifications.map((not) => (
                    <div 
                      key={not.id} 
                      className={`p-3 rounded-xl border transition-all relative group flex items-start justify-between gap-2 ${
                        not.read 
                          ? 'bg-slate-950/20 border-slate-900 text-slate-400' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-200 shadow-[0_0_12px_rgba(59,130,246,0.02)]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!not.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          <h4 className="text-xs font-bold leading-tight">{not.title}</h4>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400">{not.message}</p>
                        <span className="block text-[9px] font-mono text-slate-500">{not.timestamp}</span>
                      </div>

                      <button
                        id={`btn-dismiss-alert-${not.id}`}
                        onClick={() => handleClearNotification(not.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white transition-all cursor-pointer flex-shrink-0"
                        title="Dismiss Alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-4 text-center">
              <button
                id="student-btn-clear-all"
                onClick={() => {
                  setNotifications([]);
                  triggerToast("All alerts cleared.", "info");
                }}
                className="text-xs text-slate-500 hover:text-slate-400 font-semibold transition-colors cursor-pointer"
              >
                Clear all logs
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
