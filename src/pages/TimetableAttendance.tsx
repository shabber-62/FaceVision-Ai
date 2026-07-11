import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Video, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Square, 
  Pause, 
  FileSpreadsheet, 
  Plus, 
  Download, 
  Upload, 
  Sliders, 
  Layers, 
  Search, 
  Settings, 
  RefreshCw, 
  GraduationCap, 
  Sparkles, 
  Activity, 
  Bell, 
  ChevronRight, 
  CornerRightDown, 
  Cpu, 
  UserCheck, 
  UserPlus, 
  BookOpen, 
  ShieldAlert, 
  Check, 
  X, 
  SlidersHorizontal,
  Workflow
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface TimetableAttendanceProps {
  students?: Student[];
  onAddRecognitionLog?: (record: any) => void;
  onAddUnknownAlert?: (alert: any) => void;
  onNavigate?: (page: string) => void;
}

// Full types for Academic Hierarchy
interface AcademicStructure {
  institution: string;
  department: string;
  course: string;
  program: 'B.Tech' | 'M.Tech' | 'Ph.D' | 'B.Sc' | 'M.Sc';
  academicYear: string;
  semester: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  section: 'Alpha' | 'Beta' | 'Gamma';
  group: 'Group A1' | 'Group B2' | 'Group C3';
  batchCode: string;
}

// Period Schedule definitions
interface PeriodSlot {
  id: string;
  periodNumber: number;
  periodName: string;
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  facultyEmail: string;
  room: string;
  camera: string;
  isLunchBreak?: boolean;
}

// Weekly Timetable mapping
interface TimetableDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  periods: PeriodSlot[];
}

// Active AI Camera target overlay
interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  confidence: number;
  studentId: string;
  status: 'present' | 'late' | 'scanning';
}

// Dynamic System notification
interface TimetableNotification {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'class' | 'attendance' | 'faculty' | 'system';
}

export default function TimetableAttendance({
  students = [],
  onAddRecognitionLog,
  onAddUnknownAlert,
  onNavigate
}: TimetableAttendanceProps) {

  // Mock Students database fallback matching other panels
  const fallbackStudents: Student[] = [
    { id: 'S101', name: 'Alexander Wright', studentId: 'FV-2026-081', email: 'alex@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-01-10', imagesCount: 10, faceConfidence: 98.4, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
    { id: 'S102', name: 'Sophia Sterling', studentId: 'FV-2026-042', email: 'sophia@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-02-14', imagesCount: 12, faceConfidence: 99.2, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'S103', name: 'Marcus Sterling', studentId: 'FV-2026-015', email: 'marcus@vision.edu', department: 'Engineering', status: 'active', registrationDate: '2026-02-28', imagesCount: 10, faceConfidence: 95.8, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: 'S104', name: 'Elena Rostova', studentId: 'FV-2026-097', email: 'elena@vision.edu', department: 'Arts & Humanities', status: 'active', registrationDate: '2026-03-01', imagesCount: 15, faceConfidence: 97.6, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
    { id: 'S105', name: 'Devon Archer', studentId: 'FV-2026-112', email: 'devon@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-03-10', imagesCount: 8, faceConfidence: 96.1, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
    { id: 'S106', name: 'Aaliyah Jackson', studentId: 'FV-2026-145', email: 'aaliyah@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-03-15', imagesCount: 14, faceConfidence: 98.9, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' }
  ];

  const actualStudents = students.length > 0 ? students : fallbackStudents;

  // Active filter states for Academic Structure hierarchy
  const [academicFilters, setAcademicFilters] = useState<AcademicStructure>({
    institution: 'Institute of Advanced Technology',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    program: 'B.Tech',
    academicYear: '2026-2027',
    semester: 'Semester 5',
    year: '3rd Year',
    section: 'Alpha',
    group: 'Group A1',
    batchCode: 'CSE-2026-A1'
  });

  // Current selected day tab for viewing/editing schedules
  const [selectedDay, setSelectedDay] = useState<TimetableDay['day']>('Monday');

  // Default Period slots mapping
  const initialPeriods: PeriodSlot[] = [
    { id: 'p1', periodNumber: 1, periodName: 'Period 1', startTime: '09:00 AM', endTime: '09:55 AM', subject: 'Machine Learning Fundamentals', faculty: 'Dr. Evelyn Carter', facultyEmail: 'evelyn.carter@vision.edu', room: 'Classroom 101', camera: 'CCTV-101-Front' },
    { id: 'p2', periodNumber: 2, periodName: 'Period 2', startTime: '10:00 AM', endTime: '10:55 AM', subject: 'Natural Language Processing', faculty: 'Dr. Evelyn Carter', facultyEmail: 'evelyn.carter@vision.edu', room: 'Classroom 101', camera: 'CCTV-101-Front' },
    { id: 'p3', periodNumber: 3, periodName: 'Period 3', startTime: '11:00 AM', endTime: '11:55 AM', subject: 'Computer Vision & Deep Learning', faculty: 'Prof. Julian Vance', facultyEmail: 'julian.vance@vision.edu', room: 'Neural Computing Lab', camera: 'CCTV-LAB-1' },
    { id: 'p4', periodNumber: 4, periodName: 'Period 4', startTime: '12:00 PM', endTime: '12:55 PM', subject: 'Cyber-Physical Systems security', faculty: 'Prof. Julian Vance', facultyEmail: 'julian.vance@vision.edu', room: 'Neural Computing Lab', camera: 'CCTV-LAB-1' },
    { id: 'lunch', periodNumber: 0, periodName: 'Lunch Break', startTime: '01:00 PM', endTime: '01:55 PM', subject: 'Recreational Interval', faculty: 'None', facultyEmail: '', room: 'Campus Cafeteria Lounge', camera: 'CCTV-CAFE-1', isLunchBreak: true },
    { id: 'p5', periodNumber: 5, periodName: 'Period 5', startTime: '02:00 PM', endTime: '02:55 PM', subject: 'Edge AI Systems Engineering', faculty: 'Dr. Clara Oswald', facultyEmail: 'clara.oswald@vision.edu', room: 'Seminar Room 302', camera: 'CCTV-SEM-302' },
    { id: 'p6', periodNumber: 6, periodName: 'Period 6', startTime: '03:00 PM', endTime: '03:55 PM', subject: 'Human-Computer Interaction Systems', faculty: 'Dr. Clara Oswald', facultyEmail: 'clara.oswald@vision.edu', room: 'Seminar Room 302', camera: 'CCTV-SEM-302' },
    { id: 'p7', periodNumber: 7, periodName: 'Period 7', startTime: '04:00 PM', endTime: '04:55 PM', subject: 'Seminar Project Review Lab', faculty: 'Prof. Arthur Pendelton', facultyEmail: 'arthur.p@vision.edu', room: 'Robotics Workshop Space', camera: 'CCTV-ROBO-X' },
    { id: 'p8', periodNumber: 8, periodName: 'Period 8', startTime: '05:00 PM', endTime: '05:55 PM', subject: 'Autonomous Kinematics Integration', faculty: 'Prof. Arthur Pendelton', facultyEmail: 'arthur.p@vision.edu', room: 'Robotics Workshop Space', camera: 'CCTV-ROBO-X' }
  ];

  // Map containing weekly timetable databases
  const [weeklyTimetable, setWeeklyTimetable] = useState<TimetableDay[]>([
    { day: 'Monday', periods: initialPeriods },
    { day: 'Tuesday', periods: initialPeriods.map(p => p.id === 'p1' ? { ...p, subject: 'Cloud Native Paradigms' } : p) },
    { day: 'Wednesday', periods: initialPeriods.map(p => p.id === 'p3' ? { ...p, subject: 'Reinforcement Learning Networks' } : p) },
    { day: 'Thursday', periods: initialPeriods },
    { day: 'Friday', periods: initialPeriods.map(p => p.id === 'p5' ? { ...p, subject: 'Distributed Systems & Database' } : p) },
    { day: 'Saturday', periods: initialPeriods.slice(0, 5) }, // Half day Saturday
    { day: 'Sunday', periods: [] } // Holiday
  ]);

  // Selected period index inside active view
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('p1');
  const activeDaySchedule = weeklyTimetable.find(w => w.day === selectedDay) || weeklyTimetable[0];
  const activePeriod = activeDaySchedule.periods.find(p => p.id === selectedPeriodId) || activeDaySchedule.periods[0];

  // Dynamic status parameters for selected period execution
  const [classState, setClassState] = useState<'idle' | 'ongoing' | 'paused' | 'ended'>('ongoing');
  const [attendanceRules, setAttendanceRules] = useState({
    autoStart: true,
    autoCloseMinutes: 15,
    preventDuplicates: true,
    lateGraceMinutes: 5
  });

  // Period attendance statuses mapping for students
  const [studentRoster, setStudentRoster] = useState<{
    id: string;
    name: string;
    studentId: string;
    status: 'present' | 'late' | 'absent' | 'already-marked';
    markedTime?: string;
    confidence?: number;
  }[]>(
    actualStudents.map((st, i) => ({
      id: st.id,
      name: st.name,
      studentId: st.studentId,
      status: i < 3 ? 'present' : i === 3 ? 'late' : 'absent',
      markedTime: i < 4 ? '09:04 AM' : undefined,
      confidence: i < 4 ? +(95 + Math.random() * 4.8).toFixed(1) : undefined
    }))
  );

  // Dynamic face bounding box simulator targets
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([
    { id: 'b1', x: 20, y: 30, width: 22, height: 28, name: 'Alexander Wright', confidence: 99.1, studentId: 'FV-2026-081', status: 'present' },
    { id: 'b2', x: 55, y: 40, width: 20, height: 26, name: 'Sophia Sterling', confidence: 99.4, studentId: 'FV-2026-042', status: 'present' },
    { id: 'b3', x: 38, y: 62, width: 18, height: 24, name: 'Marcus Sterling', confidence: 96.8, studentId: 'FV-2026-015', status: 'present' }
  ]);

  // Dynamic system live telemetry values
  const [logs, setLogs] = useState<TimetableNotification[]>([
    { id: 'n1', timestamp: '12:18 PM', message: 'Classroom 101 edge stream synchronized successfully.', type: 'success', category: 'system' },
    { id: 'n2', timestamp: '12:20 PM', message: 'Machine Learning Period 1 attendance report pushed to super admin logs.', type: 'info', category: 'attendance' },
    { id: 'n3', timestamp: '12:21 PM', message: 'Late grace period elapsed. Biometrics closed for unregistered entries.', type: 'warning', category: 'attendance' }
  ]);

  // Modal Visibility toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [showAssignClassroomModal, setShowAssignClassroomModal] = useState(false);

  // Modal form states
  const [modalPeriodNum, setModalPeriodNum] = useState<number>(1);
  const [modalStartTime, setModalStartTime] = useState('09:00 AM');
  const [modalEndTime, setModalEndTime] = useState('09:55 AM');
  const [modalSubject, setModalSubject] = useState('');
  const [modalFaculty, setModalFaculty] = useState('');
  const [modalRoom, setModalRoom] = useState('');
  const [modalCamera, setModalCamera] = useState('');

  // Active Webcam States
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [webcamDeviceId, setWebcamDeviceId] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);

  // Push instant notification log helper
  const triggerLog = (msg: string, type: TimetableNotification['type'], cat: TimetableNotification['category']) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: `log-${Date.now()}`, timestamp: timeStr, message: msg, type, category: cat },
      ...prev
    ]);
  };

  // Automated facial detection simulation frame updates
  useEffect(() => {
    let animationFrameId: number;
    
    const updateOverlayBoxes = () => {
      if (classState === 'ongoing' && isWebcamOn) {
        // Subtle drift in coords to represent real camera bounding boxes tracking
        setBoundingBoxes(prev => prev.map(box => {
          const deltaX = (Math.random() - 0.5) * 0.4;
          const deltaY = (Math.random() - 0.5) * 0.4;
          return {
            ...box,
            x: Math.max(10, Math.min(80, box.x + deltaX)),
            y: Math.max(10, Math.min(80, box.y + deltaY))
          };
        }));
      }
      animationFrameId = requestAnimationFrame(updateOverlayBoxes);
    };

    animationFrameId = requestAnimationFrame(updateOverlayBoxes);
    return () => cancelAnimationFrame(animationFrameId);
  }, [classState, isWebcamOn]);

  // Automated Class Event Handler Simulation
  const handleStartClass = () => {
    setClassState('ongoing');
    triggerLog(`Class started: "${activePeriod.subject}" inside ${activePeriod.room}.`, 'success', 'class');
    triggerLog(`AI facial scanning started on camera ${activePeriod.camera}.`, 'info', 'system');
  };

  const handleEndClass = () => {
    setClassState('ended');
    triggerLog(`Class session ended for "${activePeriod.subject}". Export ready.`, 'info', 'class');
  };

  const handlePauseAttendance = () => {
    setClassState('paused');
    triggerLog(`Biometrics attendance paused by Faculty ${activePeriod.faculty}.`, 'warning', 'attendance');
  };

  const handleResumeAttendance = () => {
    setClassState('ongoing');
    triggerLog(`Biometrics attendance resumed on camera ${activePeriod.camera}.`, 'success', 'attendance');
  };

  // Toggle manual attendance states in the table
  const toggleStudentAttendance = (stuId: string) => {
    setStudentRoster(prev => prev.map(st => {
      if (st.id === stuId) {
        const statuses: ('present' | 'late' | 'absent' | 'already-marked')[] = ['present', 'late', 'absent', 'already-marked'];
        const nextIndex = (statuses.indexOf(st.status) + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];
        
        // Push notification log
        triggerLog(`Manual Override: ${st.name} status updated to ${nextStatus.toUpperCase()}.`, 'info', 'attendance');
        
        // Add attendance record to audit history helper callback if available
        if (onAddRecognitionLog && (nextStatus === 'present' || nextStatus === 'late')) {
          onAddRecognitionLog({
            id: `OVER-${Date.now()}`,
            studentId: st.studentId,
            studentName: st.name,
            department: academicFilters.department,
            timestamp: new Date().toISOString(),
            status: nextStatus === 'late' ? 'late' : 'present',
            confidence: 100.0,
            verificationType: 'manual',
            temperature: '98.4°F',
            maskWorn: false
          });
        }

        return {
          ...st,
          status: nextStatus,
          markedTime: nextStatus !== 'absent' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          confidence: nextStatus !== 'absent' ? 100.0 : undefined
        };
      }
      return st;
    }));
  };

  // Simulated handlers for page header quick controls
  const handleGenerateTimetable = () => {
    triggerLog('Dynamic AI Period optimizer executed. 7 Days schedule optimized.', 'success', 'system');
    alert("Vercel AI Timetable generated successfully! Periodic scheduling collisions checked. Room workloads distributed.");
  };

  const handleImportExcel = () => {
    triggerLog('Excel batch schedule file uploaded. Verifying structures...', 'info', 'system');
    alert("Importing Academic schedule completed! Integrated 8 study periods across CS, Engineering, and General programs.");
  };

  const handleExportPDF = () => {
    triggerLog('Weekly academic timetable ledger compiled into PDF layout.', 'success', 'system');
    alert("Downloading facevision-timetable-report.pdf...");
  };

  // Create Timetable Slot submit
  const handleCreateSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSubject || !modalFaculty) return;

    const newPeriod: PeriodSlot = {
      id: `p-new-${Date.now()}`,
      periodNumber: modalPeriodNum,
      periodName: `Period ${modalPeriodNum}`,
      startTime: modalStartTime,
      endTime: modalEndTime,
      subject: modalSubject,
      faculty: modalFaculty,
      facultyEmail: `${modalFaculty.toLowerCase().replace(/\s+/g, '')}@vision.edu`,
      room: modalRoom || 'Classroom 101',
      camera: modalCamera || 'CCTV-DEF-1'
    };

    setWeeklyTimetable(prev => prev.map(dayNode => {
      if (dayNode.day === selectedDay) {
        // Filter out any existing period with same period number to prevent overlap
        const filtered = dayNode.periods.filter(p => p.periodNumber !== modalPeriodNum);
        return {
          ...dayNode,
          periods: [...filtered, newPeriod].sort((a, b) => a.periodNumber - b.periodNumber)
        };
      }
      return dayNode;
    }));

    setSelectedPeriodId(newPeriod.id);
    setShowCreateModal(false);
    triggerLog(`New Period ${modalPeriodNum} slot added to ${selectedDay}.`, 'success', 'class');
  };

  // Assign faculty overlay submit
  const handleAssignFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFaculty) return;

    setWeeklyTimetable(prev => prev.map(dayNode => {
      if (dayNode.day === selectedDay) {
        return {
          ...dayNode,
          periods: dayNode.periods.map(p => {
            if (p.id === selectedPeriodId) {
              return {
                ...p,
                faculty: modalFaculty,
                facultyEmail: `${modalFaculty.toLowerCase().replace(/\s+/g, '')}@vision.edu`
              };
            }
            return p;
          })
        };
      }
      return dayNode;
    }));

    setShowAssignFacultyModal(false);
    triggerLog(`Faculty changed to ${modalFaculty} for "${activePeriod.subject}".`, 'info', 'faculty');
  };

  // Assign classroom overlay submit
  const handleAssignClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRoom) return;

    setWeeklyTimetable(prev => prev.map(dayNode => {
      if (dayNode.day === selectedDay) {
        return {
          ...dayNode,
          periods: dayNode.periods.map(p => {
            if (p.id === selectedPeriodId) {
              return {
                ...p,
                room: modalRoom,
                camera: modalCamera || `CCTV-${modalRoom.replace(/\s+/g, '')}-Front`
              };
            }
            return p;
          })
        };
      }
      return dayNode;
    }));

    setShowAssignClassroomModal(false);
    triggerLog(`Classroom changed to ${modalRoom} for "${activePeriod.subject}".`, 'info', 'system');
  };

  // Calculated aggregation cards stats
  const todayClassesCount = activeDaySchedule.periods.filter(p => !p.isLunchBreak).length;
  const completedClassesCount = classState === 'ended' ? 3 : 2;
  const ongoingClassSubject = classState === 'ongoing' ? activePeriod.subject : 'No Active Period';
  const upcomingClassNode = activeDaySchedule.periods.find(p => p.periodNumber > activePeriod.periodNumber && !p.isLunchBreak);
  const averageAttendanceTodayRate = 89.4; // %

  return (
    <div id="timetable-attendance-module" className="space-y-8 pb-20 text-slate-100">

      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-[#080d1a]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Periodic Biometric Synclink</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Academic Timetable & Period Attendance</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Automatically manage timetable, classroom schedules, faculty assignments, and AI attendance for every period.
          </p>
        </div>

        {/* Dynamic Buttons Layout */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-create-timetable-modal"
            onClick={() => {
              setModalPeriodNum(1);
              setModalSubject('');
              setModalFaculty('');
              setModalRoom('');
              setModalCamera('');
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Timetable</span>
          </button>

          <button
            id="btn-assign-faculty-timetable"
            onClick={() => {
              setModalFaculty(activePeriod.faculty);
              setShowAssignFacultyModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assign Faculty</span>
          </button>

          <button
            id="btn-assign-classroom-timetable"
            onClick={() => {
              setModalRoom(activePeriod.room);
              setModalCamera(activePeriod.camera);
              setShowAssignClassroomModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assign Classroom</span>
          </button>

          <button
            id="btn-generate-timetable"
            onClick={handleGenerateTimetable}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono transition-all cursor-pointer hover:bg-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Timetable</span>
          </button>

          <button
            id="btn-import-excel-timetable"
            onClick={handleImportExcel}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Import Excel Timetable Schedules"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
          </button>

          <button
            id="btn-export-pdf-timetable"
            onClick={handleExportPDF}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Export Attendance ledger to PDF"
          >
            <Download className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* DASHBOARD PREMIUM CARDS */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Today's Classes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{todayClassesCount} Slots</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Scheduled active sessions</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Ongoing Class</span>
          <div className="mt-1.5 min-h-[42px]">
            <p className="text-xs font-bold text-slate-200 truncate">{ongoingClassSubject}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{activePeriod.room} • {activePeriod.faculty}</p>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block pt-1 border-t border-slate-850/40">In session now</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Upcoming Class</span>
          <div className="mt-1.5 min-h-[42px]">
            <p className="text-xs font-bold text-slate-200 truncate">
              {upcomingClassNode ? upcomingClassNode.subject : 'No classes left'}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {upcomingClassNode ? `${upcomingClassNode.startTime} • ${upcomingClassNode.room}` : 'Day Finished'}
            </p>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block pt-1 border-t border-slate-850/40">Up next</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Completed Classes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{completedClassesCount} Slots</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Ledgers compiled</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Attendance Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{averageAttendanceTodayRate}%</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Avg student turnout</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Recognition Accuracy</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">99.2%</span>
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">InsightFace optimized</span>
        </div>

      </div>

      {/* ================================================== */}
      {/* ACADEMIC STRUCTURE HIERARCHICAL TAB SELECTORS */}
      {/* ================================================== */}
      <div className="bg-[#070c19]/80 border border-slate-850 p-5 rounded-2xl">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 mb-4">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-mono font-black text-slate-300 uppercase tracking-wider">
            Academic Structure Configuration Mapping
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Institution</label>
            <select
              value={academicFilters.institution}
              onChange={(e) => setAcademicFilters(p => ({ ...p, institution: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Institute of Advanced Technology">Institute of Adv. Tech</option>
              <option value="Global Science University">Global Science Uni</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Department</label>
            <select
              value={academicFilters.department}
              onChange={(e) => setAcademicFilters(p => ({ ...p, department: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Computer Science & Engineering">Computer Science & Eng</option>
              <option value="Robotics & Automation">Robotics & Automation</option>
              <option value="Biomechanical Engineering">Biomechanical Eng</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Year & Semester</label>
            <select
              value={academicFilters.semester}
              onChange={(e) => setAcademicFilters(p => ({ ...p, semester: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Semester 3">2nd Year - Sem 3</option>
              <option value="Semester 5">3rd Year - Sem 5</option>
              <option value="Semester 7">4th Year - Sem 7</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Section & Group</label>
            <select
              value={academicFilters.section}
              onChange={(e) => setAcademicFilters(p => ({ ...p, section: e.target.value as any }))}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Alpha">Section Alpha (Grp A1)</option>
              <option value="Beta">Section Beta (Grp B2)</option>
              <option value="Gamma">Section Gamma (Grp C3)</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-4 xl:col-span-1">
            <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Active Batch Code</label>
            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono font-bold flex items-center justify-between">
              <span>{academicFilters.batchCode}</span>
              <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* TWO COLUMN GRID: WEEKLY TIMETABLE & DETAILED ATTENDANCE CONSOLE */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* LEFT COMPONENT: WEEKLY CALENDAR & PERIODS SELECTOR (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Weekly Scheduled Timetable</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Course: <span className="text-slate-300 font-bold">{academicFilters.course}</span>
            </span>
          </div>

          {/* DAY SELECTION TABS */}
          <div className="flex flex-wrap gap-1.5">
            {weeklyTimetable.map(d => (
              <button
                key={d.day}
                onClick={() => {
                  setSelectedDay(d.day);
                  // Auto-select first period slot on day change
                  if (d.periods.length > 0) {
                    setSelectedPeriodId(d.periods[0].id);
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase cursor-pointer ${
                  selectedDay === d.day 
                    ? 'bg-blue-600 border border-blue-500 text-white shadow-md shadow-blue-600/10' 
                    : 'bg-slate-950/60 border border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {d.day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* PERIODS LIST SLOTS */}
          <div className="space-y-3">
            {activeDaySchedule.periods.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/20 border border-slate-900 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-500 uppercase">Weekend Holiday • No Classes Scheduled</p>
              </div>
            ) : (
              activeDaySchedule.periods.map(period => {
                const isSelected = period.id === selectedPeriodId;
                const isBreak = period.isLunchBreak;
                
                return (
                  <div
                    key={period.id}
                    onClick={() => setSelectedPeriodId(period.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative flex items-center justify-between gap-4 ${
                      isSelected 
                        ? 'bg-[#0f172d]/70 border-blue-500/80 shadow-md ring-1 ring-blue-500/20' 
                        : isBreak
                          ? 'bg-slate-950/30 border-dashed border-slate-800 hover:border-slate-750'
                          : 'bg-slate-950/50 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Period marker circle */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                        isBreak 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-900/35'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}>
                        {isBreak ? '☕' : period.periodNumber}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${isBreak ? 'text-purple-400' : 'text-slate-200'}`}>
                            {period.subject}
                          </span>
                          {!isBreak && (
                            <span className="text-[10px] text-indigo-400 bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-900/20">
                              {period.room}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>{period.startTime} - {period.endTime}</span>
                          </span>
                          {!isBreak && (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-slate-600" />
                              <span className="truncate max-w-[120px]">{period.faculty}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isBreak && (
                      <div className="flex items-center space-x-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isSelected && classState === 'ongoing' ? 'bg-green-500 animate-ping' : 'bg-slate-600'
                        }`} />
                        <span className="text-[9px] font-mono text-slate-500 uppercase">
                          {isSelected && classState === 'ongoing' ? 'ONGOING' : 'STANDBY'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* DYNAMIC TIMETABLE ASSIGNMENT SCHEME QUICK OVERVIEW */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Class Attendance Rules</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">Real-time Rules</span>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Start Attendance Automatically</p>
                  <p className="text-[10px] text-slate-500">Initiate scanning at period start timestamp.</p>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceRules.autoStart}
                  onChange={(e) => setAttendanceRules(p => ({ ...p, autoStart: e.target.checked }))}
                  className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Late Grace Entry Limit</p>
                  <p className="text-[10px] text-slate-500">Minutes before marking late arrivals.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={attendanceRules.lateGraceMinutes}
                    onChange={(e) => setAttendanceRules(p => ({ ...p, lateGraceMinutes: parseInt(e.target.value) }))}
                    className="w-20 accent-blue-500 bg-slate-900 h-1 rounded"
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">{attendanceRules.lateGraceMinutes}m</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Session Closed Limit</p>
                  <p className="text-[10px] text-slate-500">Close camera biometrics after grace minutes.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={attendanceRules.autoCloseMinutes}
                    onChange={(e) => setAttendanceRules(p => ({ ...p, autoCloseMinutes: parseInt(e.target.value) }))}
                    className="w-20 accent-indigo-500 bg-slate-900 h-1 rounded"
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">{attendanceRules.autoCloseMinutes}m</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Prevent Duplicate Scans</p>
                  <p className="text-[10px] text-slate-500">Reject multiple face logs within the session.</p>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceRules.preventDuplicates}
                  onChange={(e) => setAttendanceRules(p => ({ ...p, preventDuplicates: e.target.checked }))}
                  className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: LIVE WEB STREAM & ROSTER CONTROL OVERRIDES (7 cols) */}
        <div className="xl:col-span-7 space-y-6">

          {/* ACTIVE CLASS TELEMETRY CONTROLS BAR */}
          <div className="bg-gradient-to-r from-blue-950/15 to-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                classState === 'ongoing' ? 'bg-green-500 animate-ping' :
                classState === 'paused' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-xs font-mono uppercase font-bold text-slate-300">
                AI Engine: {classState.toUpperCase()}
              </span>
            </div>

            <span className="bg-blue-600/15 text-blue-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full border border-blue-500/25 uppercase tracking-wider font-bold">
              Period Tracker Matrix
            </span>

            <div className="mt-3 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">{activePeriod.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned Room: <span className="text-indigo-400 font-bold">{activePeriod.room}</span> • Faculty Contact: <span className="text-slate-300">{activePeriod.facultyEmail}</span>
                </p>
              </div>
            </div>

            {/* FACULTY INTERACTION PANEL (Start, End, Pause, Resume) */}
            <div className="mt-6 pt-5 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Faculty Actions Controller</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {classState !== 'ongoing' ? (
                    <button
                      id="btn-faculty-start-class"
                      onClick={handleStartClass}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Class</span>
                    </button>
                  ) : (
                    <button
                      id="btn-faculty-end-class"
                      onClick={handleEndClass}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-all"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>End Class</span>
                    </button>
                  )}

                  {classState === 'ongoing' ? (
                    <button
                      id="btn-faculty-pause-attendance"
                      onClick={handlePauseAttendance}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause AI</span>
                    </button>
                  ) : classState === 'paused' ? (
                    <button
                      id="btn-faculty-resume-attendance"
                      onClick={handleResumeAttendance}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume AI</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Camera Channel</span>
                <span className="text-xs font-mono text-slate-300 block mt-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-900">
                  {activePeriod.camera}
                </span>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* REAL LIVE CLASSROOM CAMERA VIEWPORT */}
          {/* ================================================== */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Classroom Live Stream Feed
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                <span>FPS: 30</span>
                <span>•</span>
                <span>640x480</span>
                <span>•</span>
                <button
                  onClick={() => setIsWebcamOn(!isWebcamOn)}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  {isWebcamOn ? 'Shut Video' : 'Open Video'}
                </button>
              </div>
            </div>

            {/* LIVE FEED STAGED AREA */}
            <div className="aspect-video relative bg-slate-950 flex items-center justify-center overflow-hidden">
              {isWebcamOn ? (
                <div className="w-full h-full relative">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover opacity-80"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: 'user'
                    }}
                    disablePictureInPicture={false}
                    forceScreenshotSourceSize={false}
                    imageSmoothing={true}
                    mirrored={false}
                    screenshotQuality={0.92}
                    onUserMedia={() => {}}
                    onUserMediaError={() => {}}
                  />

                  {/* AI Facial Recognition HUD Grid Overlays */}
                  {classState === 'ongoing' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {boundingBoxes.map(box => (
                        <div
                          key={box.id}
                          className="absolute border-2 border-emerald-500/80 rounded"
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
                          }}
                        >
                          {/* Corner highlights */}
                          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
                          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />

                          {/* Identifier Flag Tag */}
                          <div className="absolute -top-6 left-0 bg-emerald-600/90 backdrop-blur-sm border border-emerald-400 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            {box.name} ({box.confidence}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Scan Active Ring Radar */}
                  {classState === 'ongoing' && (
                    <div className="absolute top-4 left-4 bg-[#0a0f1d]/85 backdrop-blur border border-slate-800 p-2 rounded-xl text-[9px] font-mono space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-emerald-400 font-bold uppercase">YOLOv8 active</span>
                      </div>
                      <p className="text-slate-400">InsightFace matching...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <Video className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-mono uppercase">Assigned classroom camera stream paused</p>
                  <button
                    onClick={() => setIsWebcamOn(true)}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-semibold cursor-pointer"
                  >
                    Activate Camera
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 p-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Camera feed live from {activePeriod.room}</span>
              </span>
              <span className="font-mono text-slate-500">Node: {activePeriod.camera}</span>
            </div>
          </div>

          {/* ================================================== */}
          {/* PERIOD-WISE ATTENDANCE ROSTER CONTROL OVERRIDES */}
          {/* ================================================== */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Period Attendance Checklist Roster</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Roster Length: {studentRoster.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850/60 text-[10px] font-mono text-slate-500 uppercase">
                    <th className="py-2.5">Student Info</th>
                    <th>Biometric Verified ID</th>
                    <th>Log Time</th>
                    <th>Confidence</th>
                    <th className="text-right">Roster Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs">
                  {studentRoster.map(student => (
                    <tr key={student.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-3 font-bold text-slate-200">{student.name}</td>
                      <td className="font-mono text-slate-400">{student.studentId}</td>
                      <td className="text-slate-300 font-mono">
                        {student.markedTime || (
                          <span className="text-slate-600 font-bold">--:--</span>
                        )}
                      </td>
                      <td className="font-mono">
                        {student.confidence ? (
                          <span className="text-emerald-400 font-bold">{student.confidence}%</span>
                        ) : (
                          <span className="text-slate-600 font-bold">--%</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => toggleStudentAttendance(student.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-black transition-all cursor-pointer ${
                            student.status === 'present' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            student.status === 'late' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            student.status === 'already-marked' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {student.status.toUpperCase()}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
              <span>Click on Roster status tag to cycle custom overrides</span>
              <span className="font-bold text-slate-400">Total present: {studentRoster.filter(s => s.status !== 'absent').length} / {studentRoster.length}</span>
            </div>
          </div>

          {/* STUDENT PANEL VIEW PORTAL MOCKUP */}
          <div className="bg-[#0c101d]/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Panel View</span>
            </div>

            <h3 className="text-xs font-bold text-slate-200">
              Personal Attendance Verification Portal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                <span className="text-[9px] text-slate-500 font-mono block">VERIFIED SUBJECT</span>
                <span className="text-xs font-bold text-slate-300 block mt-1 truncate">
                  {activePeriod.subject}
                </span>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                <span className="text-[9px] text-slate-500 font-mono block">ACADEMIC ROOM</span>
                <span className="text-xs font-bold text-indigo-400 block mt-1">
                  {activePeriod.room}
                </span>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                <span className="text-[9px] text-slate-500 font-mono block">VERIFICATION STATUS</span>
                <span className="text-xs font-bold text-emerald-400 block mt-1 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified OK</span>
                </span>
              </div>
            </div>
          </div>

          {/* SYSTEM EVENTS NOTIFICATIONS FEED COMPONENT */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-purple-400 animate-bounce" />
                <span>Period-wise Operations Event Stream</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">Live Sync</span>
            </div>

            <div className="space-y-3 max-h-40 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 flex items-start gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'warning' ? 'bg-amber-500' :
                    log.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">{log.message}</p>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">
                      {log.timestamp} • CATEGORY: {log.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* MODAL LIGHTBOXES FOR ACTIONS */}
      {/* ================================================== */}
      <AnimatePresence>
        
        {/* CREATE TIMETABLE SLOT MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Configure Timetable Period Slot</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSlotSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Period Lane</label>
                  <select
                    value={modalPeriodNum}
                    onChange={(e) => setModalPeriodNum(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>Period Slot {num}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Start Time</label>
                    <input
                      type="text"
                      value={modalStartTime}
                      onChange={(e) => setModalStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">End Time</label>
                    <input
                      type="text"
                      value={modalEndTime}
                      onChange={(e) => setModalEndTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Computing"
                    value={modalSubject}
                    onChange={(e) => setModalSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Assigned Faculty</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Clara Oswald"
                    value={modalFaculty}
                    onChange={(e) => setModalFaculty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Classroom</label>
                    <input
                      type="text"
                      placeholder="e.g. Classroom 101"
                      value={modalRoom}
                      onChange={(e) => setModalRoom(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Camera Device</label>
                    <input
                      type="text"
                      placeholder="e.g. CCTV-101-Front"
                      value={modalCamera}
                      onChange={(e) => setModalCamera(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850/60 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-bold cursor-pointer hover:bg-slate-850"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Save Period
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ASSIGN FACULTY MODAL */}
        {showAssignFacultyModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Assign Faculty</span>
                </h3>
                <button
                  onClick={() => setShowAssignFacultyModal(false)}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignFacultySubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Faculty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Clara Oswald"
                    value={modalFaculty}
                    onChange={(e) => setModalFaculty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-850/60 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignFacultyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Save Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ASSIGN CLASSROOM MODAL */}
        {showAssignClassroomModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>Assign Classroom Location</span>
                </h3>
                <button
                  onClick={() => setShowAssignClassroomModal(false)}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignClassroomSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Room Number/Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classroom 101"
                    value={modalRoom}
                    onChange={(e) => setModalRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">CCTV Camera Node</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CCTV-101-Front"
                    value={modalCamera}
                    onChange={(e) => setModalCamera(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-850/60 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignClassroomModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Save Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
