import React, { useState, useMemo, useEffect } from 'react';
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
  Bell
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid 
} from 'recharts';
import { AttendanceRecord, Student } from '../types';

interface AttendanceHistoryProps {
  attendance: AttendanceRecord[];
  students: Student[];
  onAddAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
}

// Enriched internal attendance records
interface EnrichedRecord extends AttendanceRecord {
  checkOutTimestamp?: string;
  cameraLocation?: string;
  subject?: string;
  faculty?: string;
  year?: string;
  section?: string;
  photoUrl?: string;
}

export default function AttendanceHistory({
  attendance,
  students,
  onAddAttendanceRecord
}: AttendanceHistoryProps) {
  
  // Page Tabs: 'list' (Surveillance & Table), 'calendar' (Interactive Planner), 'analytics' (BI Charts)
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics'>('list');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-07-11');
  const [recFilter, setRecFilter] = useState('all');
  const [camFilter, setCamFilter] = useState('all');

  // Interactive Calendar Active Selection
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>('2026-07-11');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Manual Override Form Modal
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideStudentId, setOverrideStudentId] = useState('');
  const [overrideDate, setOverrideDate] = useState('2026-07-11');
  const [overrideCheckIn, setOverrideCheckIn] = useState('08:30');
  const [overrideCheckOut, setOverrideCheckOut] = useState('17:00');
  const [overrideStatus, setOverrideStatus] = useState<'present' | 'late' | 'absent'>('present');
  const [overrideReason, setOverrideReason] = useState('Medical Bypass');
  const [overrideNotes, setOverrideNotes] = useState('');

  // Floating notifications stack
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' | 'danger' }[]>([]);

  // Selected Student Details Slider Drawer
  const [selectedRecord, setSelectedRecord] = useState<EnrichedRecord | null>(null);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Student details mapping helper
  const studentMetaMap = useMemo(() => {
    const meta: Record<string, { year: string; section: string; subject: string; faculty: string; photoUrl: string }> = {
      'Miles Dyson': { year: '4th Year', section: 'Division Alpha', subject: 'Neural Networks', faculty: 'Prof. Miles Dyson', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
      'Sarah Connor': { year: '4th Year', section: 'Division Alpha', subject: 'Computer Vision', faculty: 'Dr. Sarah Connor', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
      'John Connor': { year: '3rd Year', section: 'Division Beta', subject: 'Cybernetics', faculty: 'Prof. Miles Dyson', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      'Katherine Brewster': { year: '4th Year', section: 'Division Gamma', subject: 'AI & Robotics', faculty: 'Dr. Katherine Brewster', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
      'Marcus Wright': { year: '2nd Year', section: 'Division Delta', subject: 'Cybernetics', faculty: 'Prof. Miles Dyson', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
      'Robert Brewster': { year: '4th Year', section: 'Division Beta', subject: 'AI & Robotics', faculty: 'Dr. Katherine Brewster', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
      'Elena Rostova': { year: '1st Year', section: 'Division Gamma', subject: 'Computer Vision', faculty: 'Dr. Sarah Connor', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
      'T-800 Model 101': { year: '4th Year', section: 'Division Alpha', subject: 'Cybernetics', faculty: 'Prof. Miles Dyson', photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
    };
    return meta;
  }, []);

  // Algorithm to dynamically generate rich historical datasets to feed all tables, calendar days, and BI dashboards
  const fullAttendanceDataset = useMemo(() => {
    const list: EnrichedRecord[] = [];
    const subjects = ['Computer Vision', 'AI & Robotics', 'Neural Networks', 'Cybernetics'];
    const faculties = ['Dr. Sarah Connor', 'Prof. Miles Dyson', 'Dr. Katherine Brewster'];
    const cameras = ['Lobby Cam-01', 'Corridor Cam-03', 'Exit Cam-02', 'Main Entrance Lobby', 'Research Lab Wing'];

    // Add actual live attendance items from props
    attendance.forEach(record => {
      const details = studentMetaMap[record.studentName] || {
        year: '2nd Year',
        section: 'Division Alpha',
        subject: 'Computer Vision',
        faculty: 'Dr. Sarah Connor',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      };

      const dateStr = record.timestamp.split('T')[0];
      const checkOut = record.status !== 'absent' 
        ? `${dateStr}T17:15:${Math.floor(10 + Math.random() * 49)}-07:00`
        : undefined;

      list.push({
        ...record,
        checkOutTimestamp: checkOut,
        cameraLocation: record.verificationType === 'manual' ? 'Admin Portal' : 'Lobby Cam-01',
        subject: details.subject,
        faculty: details.faculty,
        year: details.year,
        section: details.section,
        photoUrl: details.photoUrl
      });
    });

    // Generate 12 days of high-fidelity historical logs (July 1st to July 12th, 2026)
    for (let dayNum = 1; dayNum <= 12; dayNum++) {
      const dateString = `2026-07-${dayNum.toString().padStart(2, '0')}`;
      
      // Skip July 11th if props already had items for that date, to avoid clashing
      if (dateString === '2026-07-11' && attendance.length > 0) continue;

      // Define weekend flags
      const isWeekend = [4, 5, 11, 12].includes(dayNum); // July 4 (Sat), 5 (Sun), 11 (Sat), 12 (Sun)
      const isHoliday = dayNum === 4; // July 4th Independence Day

      if (isWeekend || isHoliday) continue; // standard weekdays

      students.forEach((student, index) => {
        // Create variations of present, absent, late
        let status: 'present' | 'late' | 'absent' = 'present';
        const rng = (dayNum * 7 + index * 13) % 100;
        
        if (rng > 92) status = 'absent';
        else if (rng > 78) status = 'late';

        const checkInHour = status === 'present' ? 8 : status === 'late' ? 9 : 0;
        const checkInMinute = status === 'present' 
          ? Math.floor((dayNum * index) % 40) // 8:00 to 8:39
          : status === 'late' 
            ? Math.floor(10 + ((dayNum * index) % 30)) // 9:10 to 9:39
            : 0;

        const checkOutHour = status !== 'absent' ? 17 : 0;
        const checkOutMinute = status !== 'absent' ? Math.floor(5 + ((dayNum + index) % 45)) : 0;

        const checkInTime = status !== 'absent' 
          ? `${dateString}T0${checkInHour}:${checkInMinute.toString().padStart(2, '0')}:22-07:00`
          : `${dateString}T00:00:00-07:00`;

        const checkOutTime = status !== 'absent'
          ? `${dateString}T${checkOutHour}:${checkOutMinute.toString().padStart(2, '0')}:44-07:00`
          : undefined;

        const confidence = status !== 'absent'
          ? Math.round(90 + ((dayNum * 3.7 + index * 2.3) % 9.9))
          : 0;

        const verType = (dayNum + index) % 9 === 0 ? 'manual' : 'face';

        const mData = studentMetaMap[student.name] || {
          year: '1st Year',
          section: 'Division Alpha',
          subject: 'Computer Vision',
          faculty: 'Dr. Sarah Connor',
          photoUrl: student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        };

        list.push({
          id: `hist-${dateString}-${student.id}`,
          studentId: student.studentId,
          studentName: student.name,
          department: student.department,
          timestamp: checkInTime,
          checkOutTimestamp: checkOutTime,
          status,
          confidence,
          verificationType: verType as any,
          temperature: status !== 'absent' ? `${(97.6 + (index * 0.1) % 1.2).toFixed(1)}°F` : undefined,
          maskWorn: (dayNum * index) % 2 === 0,
          cameraLocation: verType === 'manual' ? 'Admin Override Hub' : cameras[(dayNum + index) % cameras.length],
          subject: mData.subject,
          faculty: mData.faculty,
          year: mData.year,
          section: mData.section,
          photoUrl: mData.photoUrl
        });
      });
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [attendance, students, studentMetaMap]);

  // Handle Dynamic Real-Time Alerts
  const triggerMockIncident = (type: 'late' | 'low-conf' | 'unknown' | 'offline') => {
    const timestampStr = new Date().toLocaleTimeString();
    if (type === 'late') {
      addToast(`[INCIDENT] Staff member Miles Dyson arrived late (09:12 AM)`, 'warning');
    } else if (type === 'low-conf') {
      addToast(`[BIOMETRICS] Low confidence face alignment detected at Corridor Cam-03 (64.2% match)`, 'warning');
    } else if (type === 'unknown') {
      addToast(`[SECURITY] UNKNOWN Face captured at Lobby Checkpoint! Image archived.`, 'danger');
    } else if (type === 'offline') {
      addToast(`[HARDWARE] Exit Cam-02 report: CONNECTION TIMEOUT (Retrying link...)`, 'danger');
    }
  };

  // Synchronize dynamic updates on AI Data Sync button
  const handleSyncAIData = () => {
    addToast('Contacting Edge Nodes... Downloading AI feature vectors.', 'info');
    setTimeout(() => {
      addToast('Sync Complete: 12 additional biometrics records ingested successfully.', 'success');
    }, 1500);
  };

  // Compile detailed attendance report
  const handleGenerateReport = () => {
    addToast('Running full matrix compilation... Querying index layers.', 'info');
    setTimeout(() => {
      addToast('BI Report Compiled: FaceVision_Attendance_FullReport_Q3.pdf is ready in Reports.', 'success');
    }, 1800);
  };

  // Filter logic based on the 10 available criteria
  const filteredRecords = useMemo(() => {
    return fullAttendanceDataset.filter(rec => {
      const matchSearch = rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === 'all' || rec.department === deptFilter;
      const matchYear = yearFilter === 'all' || rec.year === yearFilter;
      const matchSection = sectionFilter === 'all' || rec.section === sectionFilter;
      const matchSubject = subjectFilter === 'all' || rec.subject === subjectFilter;
      const matchFaculty = facultyFilter === 'all' || rec.faculty === facultyFilter;
      const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
      const matchRec = recFilter === 'all' || rec.verificationType === recFilter;
      const matchCam = camFilter === 'all' || rec.cameraLocation?.includes(camFilter);
      
      // Date segment check (if dateFilter is set)
      let matchDate = true;
      if (dateFilter) {
        matchDate = rec.timestamp.startsWith(dateFilter);
      }

      return matchSearch && matchDept && matchYear && matchSection && matchSubject && matchFaculty && matchStatus && matchRec && matchCam && matchDate;
    });
  }, [fullAttendanceDataset, searchQuery, deptFilter, yearFilter, sectionFilter, subjectFilter, facultyFilter, statusFilter, dateFilter, recFilter, camFilter]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDeptFilter('all');
    setYearFilter('all');
    setSectionFilter('all');
    setSubjectFilter('all');
    setFacultyFilter('all');
    setStatusFilter('all');
    setDateFilter('2026-07-11');
    setRecFilter('all');
    setCamFilter('all');
    setPage(1);
    addToast('Multi-layer filters cleared.', 'info');
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredRecords, page]);

  // Calculate stats on the active filtered set
  const statsSummary = useMemo(() => {
    const present = filteredRecords.filter(r => r.status === 'present').length;
    const late = filteredRecords.filter(r => r.status === 'late').length;
    const absent = filteredRecords.filter(r => r.status === 'absent').length;
    const total = filteredRecords.length || 1;
    const pct = Math.round(((present + late) / total) * 100);

    const matchConfidences = filteredRecords.filter(r => r.status !== 'absent' && r.confidence > 0).map(r => r.confidence);
    const avgConf = matchConfidences.length 
      ? Math.round(matchConfidences.reduce((a, b) => a + b, 0) / matchConfidences.length) 
      : 99.4;

    return {
      present,
      absent,
      late,
      percentage: pct,
      accuracy: avgConf,
      avgEntry: '08:34 AM',
      avgExit: '17:15 PM'
    };
  }, [filteredRecords]);

  // CSV Exporter
  const handleDownloadCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Department', 'Year', 'Section', 'Date', 'Check-In', 'Check-Out', 'Status', 'Confidence', 'Camera Location', 'Verification Method'];
    const rows = filteredRecords.map(r => [
      r.studentId,
      r.studentName,
      r.department,
      r.year || 'N/A',
      r.section || 'N/A',
      r.timestamp.split('T')[0],
      r.status !== 'absent' ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
      r.checkOutTimestamp ? new Date(r.checkOutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
      r.status.toUpperCase(),
      r.status !== 'absent' ? `${r.confidence}%` : '0%',
      r.cameraLocation || 'N/A',
      r.verificationType.toUpperCase()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(v => `"${v}"`).join(","))].join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `FaceVision_Attendance_Report_${dateFilter || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Standard CSV downloaded successfully.', 'success');
  };

  // Manual Override Form Submitter
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const studentObj = students.find(s => s.id === overrideStudentId);
    if (!studentObj) return;

    const timestamp = `${overrideDate}T${overrideCheckIn}:00-07:00`;
    
    // Add record through the parent handler
    onAddAttendanceRecord({
      studentId: studentObj.studentId,
      studentName: studentObj.name,
      department: studentObj.department,
      timestamp: timestamp,
      status: overrideStatus,
      confidence: 100.0, // perfect override
      verificationType: 'manual',
      temperature: '98.2°F',
      maskWorn: false
    });

    setIsOverrideOpen(false);
    addToast(`By-pass logs committed successfully for ${studentObj.name}`, 'success');
  };

  // Bulk operation actions
  const handleBulkAction = (action: 'present' | 'absent' | 'late' | 'delete') => {
    if (selectedIds.length === 0) return;
    addToast(`Performing bulk execution [${action.toUpperCase()}] on ${selectedIds.length} indices`, 'info');
    setTimeout(() => {
      addToast(`Bulk operation completed successfully.`, 'success');
      setSelectedIds([]);
    }, 1000);
  };

  // Interactive Calendar Days calculation for July 2026
  // July 2026 starts on Wednesday (offset = 3 empty slots)
  const calendarDays = useMemo(() => {
    const days: { dayNum: number; dateStr: string; type: 'weekday' | 'weekend' | 'holiday' | 'special'; label?: string; stats?: { present: number; absent: number } }[] = [];
    
    // Add empty padding slots
    for (let i = 0; i < 3; i++) {
      days.push({ dayNum: 0, dateStr: '', type: 'weekend' });
    }

    for (let day = 1; day <= 31; day++) {
      const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
      const isWeekend = [4, 5, 11, 12, 18, 19, 25, 26].includes(day);
      let type: 'weekday' | 'weekend' | 'holiday' | 'special' = isWeekend ? 'weekend' : 'weekday';
      let label = '';

      if (day === 4) {
        type = 'holiday';
        label = 'Independence Day';
      } else if (day === 15) {
        type = 'special';
        label = 'AI Workshop Sym.';
      }

      // Calculate attendance statistics for this day
      const dayRecords = fullAttendanceDataset.filter(r => r.timestamp.startsWith(dateStr));
      const presentCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const absentCount = dayRecords.filter(r => r.status === 'absent').length;

      days.push({
        dayNum: day,
        dateStr,
        type,
        label,
        stats: dayRecords.length ? { present: presentCount, absent: absentCount } : undefined
      });
    }

    return days;
  }, [fullAttendanceDataset]);

  // Recharts Analytics calculations
  const dailyTrendsData = useMemo(() => {
    const data: Record<string, any> = {};
    // Gather days in July
    fullAttendanceDataset.forEach(r => {
      const date = r.timestamp.split('T')[0];
      if (!data[date]) {
        data[date] = { date: date.split('-')[2], present: 0, late: 0, absent: 0, total: 0 };
      }
      data[date].total++;
      if (r.status === 'present') data[date].present++;
      else if (r.status === 'late') data[date].late++;
      else if (r.status === 'absent') data[date].absent++;
    });

    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [fullAttendanceDataset]);

  const departmentComparisonData = useMemo(() => {
    const data: Record<string, { name: string; present: number; total: number }> = {};
    fullAttendanceDataset.forEach(r => {
      if (!data[r.department]) {
        data[r.department] = { name: r.department, present: 0, total: 0 };
      }
      data[r.department].total++;
      if (r.status === 'present' || r.status === 'late') {
        data[r.department].present++;
      }
    });

    return Object.values(data).map(d => ({
      name: d.name,
      percentage: Math.round((d.present / d.total) * 100)
    }));
  }, [fullAttendanceDataset]);

  const yearComparisonData = useMemo(() => {
    const counts: Record<string, number> = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 };
    fullAttendanceDataset.forEach(r => {
      const yr = r.year || '1st Year';
      if (r.status === 'present' || r.status === 'late') {
        counts[yr] = (counts[yr] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [fullAttendanceDataset]);

  // Mini Captured Face Timeline logs
  const liveCapturedFeed = useMemo(() => {
    return fullAttendanceDataset
      .filter(r => r.verificationType === 'face')
      .slice(0, 6);
  }, [fullAttendanceDataset]);

  return (
    <div id="attendance-history-view" className="space-y-6 pb-16 relative">
      
      {/* FLOATING TOAST POPUPS STACK */}
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
                  : t.type === 'danger'
                    ? 'bg-rose-950/85 border-rose-800 text-rose-300'
                    : t.type === 'info'
                      ? 'bg-slate-900/95 border-slate-750 text-slate-300'
                      : 'bg-emerald-950/85 border-emerald-800 text-emerald-300'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                t.type === 'warning' ? 'text-amber-400' : t.type === 'danger' ? 'text-rose-400' : t.type === 'info' ? 'text-blue-400' : 'text-emerald-400'
              }`} />
              <div className="text-xs font-mono leading-relaxed">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/30 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Database className="w-4.5 h-4.5 text-blue-400" />
            </span>
            <span className="text-slate-500 text-xs font-mono">Live Attendance Terminal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance Management</h1>
          <p className="text-xs text-slate-400">Monitor, manage, edit, and analyze student attendance in real time.</p>
        </div>

        {/* Action Controls List */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Attendance</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => {
              if (students.length > 0) {
                setOverrideStudentId(students[0].id);
              }
              setIsOverrideOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Attendance</span>
          </button>

          <button
            onClick={handleSyncAIData}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Force Biometrics Sync"
          >
            <RefreshCw className="w-4.5 h-4.5 text-emerald-400 animate-spin-slow" />
          </button>
        </div>
      </div>

      {/* DYNAMIC INCIDENT INJECTOR RAIL */}
      <div className="bg-slate-950/60 border border-slate-850 px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="font-mono text-slate-300 font-semibold">Edge Sensor Sandbox:</span>
          <span className="text-slate-500">Inject dynamic simulated telemetry incidents</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => triggerMockIncident('late')} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded hover:bg-amber-500/20 transition-all cursor-pointer">
            + Late Arrival
          </button>
          <button onClick={() => triggerMockIncident('low-conf')} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono rounded hover:bg-orange-500/20 transition-all cursor-pointer">
            + Low Confidence
          </button>
          <button onClick={() => triggerMockIncident('unknown')} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono rounded hover:bg-rose-500/20 transition-all cursor-pointer">
            + Unknown Face
          </button>
          <button onClick={() => triggerMockIncident('offline')} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded hover:bg-red-500/20 transition-all cursor-pointer">
            + Cam Offline
          </button>
        </div>
      </div>

      {/* CORE STATS OVERVIEW CARDS GRID (8 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        
        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Today's Attendance</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-white">{statsSummary.percentage}%</span>
            <span className="text-[9px] text-emerald-400 font-mono">▲ 1.4%</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Present Students</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{statsSummary.present}</span>
            <span className="text-[9px] text-slate-500 font-mono">active</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Absent Students</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-rose-400">{statsSummary.absent}</span>
            <span className="text-[9px] text-rose-500 font-mono">missing</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Late Students</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-amber-400">{statsSummary.late}</span>
            <span className="text-[9px] text-amber-500/70 font-mono">tardy</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Attendance overall</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-blue-400">92.8%</span>
            <span className="text-[9px] text-slate-500 font-mono">month avg</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Recognition Accuracy</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-indigo-400">{statsSummary.accuracy}%</span>
            <span className="text-[9px] text-slate-500 font-mono">F1 score</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Avg Entry Time</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xs font-bold font-mono text-slate-200">{statsSummary.avgEntry}</span>
            <span className="text-[9px] text-slate-500 font-mono">checkpoint</span>
          </div>
        </div>

        <div className="bg-slate-900/45 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Avg Exit Time</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xs font-bold font-mono text-slate-200">{statsSummary.avgExit}</span>
            <span className="text-[9px] text-slate-500 font-mono">gate</span>
          </div>
        </div>

      </div>

      {/* NAVIGATION TABS FOR DIFFERENT VIEWPORTS */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'list' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Surveillance Console</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'calendar' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Interactive Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'analytics' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>BI Analytics trends</span>
        </button>
      </div>

      {/* CORE VIEWPORT SCENARIOS */}
      <AnimatePresence mode="wait">
        
        {/* VIEW SCENARIO 1: SURVEILLANCE HISTORY / TABLE */}
        {activeTab === 'list' && (
          <motion.div
            key="list-viewport"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* MULTI-CRITERIA FILTERS DRAWER PANEL */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Unified Query Filter Engine</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-[10px] font-mono text-slate-400 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>

              {/* Filtering Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                
                {/* Search query */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Search Students</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Name or ID..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-200 pl-8.5 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Department filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Department</label>
                  <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Research & Dev">Research & Dev</option>
                    <option value="Operations">Operations</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                {/* Year filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Academic Year</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Year Groups</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Section filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Division Section</label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Divisions</option>
                    <option value="Division Alpha">Division Alpha</option>
                    <option value="Division Beta">Division Beta</option>
                    <option value="Division Gamma">Division Gamma</option>
                    <option value="Division Delta">Division Delta</option>
                  </select>
                </div>

                {/* Date Selection */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Surveillance Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                      className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 pl-8.5 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* Subject filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Active Subject Course</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Courses</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="AI & Robotics">AI & Robotics</option>
                    <option value="Neural Networks">Neural Networks</option>
                    <option value="Cybernetics">Cybernetics</option>
                  </select>
                </div>

                {/* Faculty filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Assigned Faculty</label>
                  <select
                    value={facultyFilter}
                    onChange={(e) => { setFacultyFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Instructors</option>
                    <option value="Dr. Sarah Connor">Dr. Sarah Connor</option>
                    <option value="Prof. Miles Dyson">Prof. Miles Dyson</option>
                    <option value="Dr. Katherine Brewster">Dr. Katherine Brewster</option>
                  </select>
                </div>

                {/* Attendance Status */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Attendance Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                {/* Verification Method */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Recognition Status</label>
                  <select
                    value={recFilter}
                    onChange={(e) => { setRecFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Formats</option>
                    <option value="face">Face Scan AI</option>
                    <option value="manual">Manual Exception</option>
                  </select>
                </div>

                {/* Camera Location */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Capture Camera Node</label>
                  <select
                    value={camFilter}
                    onChange={(e) => { setCamFilter(e.target.value); setPage(1); }}
                    className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Sensors</option>
                    <option value="Lobby">Lobby Cam-01</option>
                    <option value="Corridor">Corridor Cam-03</option>
                    <option value="Exit">Exit Cam-02</option>
                    <option value="Entrance">Main Lobby</option>
                    <option value="Research">Research Lab Wing</option>
                  </select>
                </div>

              </div>
            </div>

            {/* DUAL COGNITIVE TIERS: TABLE + LIVE MINI STREAM TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT PRIMARY ATTENDANCE TABLE (9 Columns) */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* Floating Bulk Actions bar */}
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-950/70 border border-blue-800 p-3.5 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-blue-300">
                      Selected <strong className="text-white">{selectedIds.length}</strong> indices. Bulk Execution:
                    </span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleBulkAction('present')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                        Mark Present
                      </button>
                      <button onClick={() => handleBulkAction('late')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                        Mark Late
                      </button>
                      <button onClick={() => handleBulkAction('absent')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                        Mark Absent
                      </button>
                      <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer border border-slate-800 transition-colors">
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Primary table element */}
                <div id="attendance-table-card" className="bg-[#111827]/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10">
                          <th className="p-4 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(paginatedRecords.map(r => r.id));
                                } else {
                                  setSelectedIds([]);
                                }
                              }}
                              className="rounded border-slate-800 text-blue-500 focus:ring-0 bg-slate-900 cursor-pointer"
                            />
                          </th>
                          <th className="p-4">Student</th>
                          <th className="p-4">ID / Group</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Check-In</th>
                          <th className="p-4">Check-Out</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">AI Score</th>
                          <th className="p-4">Camera</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-[11px] text-slate-300">
                        {paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-12 text-center text-slate-500 font-mono">
                              <UserX className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                              <span>[EMPTY SURVEILLANCE INDEX] No record matches active filter layers.</span>
                            </td>
                          </tr>
                        ) : (
                          paginatedRecords.map((log) => {
                            const isRowChecked = selectedIds.includes(log.id);
                            const statusStyle = {
                              present: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
                              late: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
                              absent: 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                            }[log.status];

                            return (
                              <tr 
                                key={log.id} 
                                className={`hover:bg-slate-850/15 transition-colors cursor-pointer ${
                                  isRowChecked ? 'bg-blue-950/10' : ''
                                }`}
                                onClick={() => setSelectedRecord(log)}
                              >
                                {/* Checkbox cell */}
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isRowChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedIds(prev => [...prev, log.id]);
                                      } else {
                                        setSelectedIds(prev => prev.filter(id => id !== log.id));
                                      }
                                    }}
                                    className="rounded border-slate-850 text-blue-500 focus:ring-0 bg-slate-900 cursor-pointer"
                                  />
                                </td>

                                {/* Profile Cell */}
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={log.photoUrl} 
                                      alt="" 
                                      className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-800 shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <p className="text-white font-extrabold">{log.studentName}</p>
                                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{log.department}</p>
                                    </div>
                                  </div>
                                </td>

                                {/* Group ID info */}
                                <td className="p-4 font-mono text-slate-400">
                                  <div>{log.studentId}</div>
                                  <div className="text-[9px] text-slate-500">{log.year} • {log.section?.split(' ')[1] || 'A'}</div>
                                </td>

                                {/* Date */}
                                <td className="p-4 font-mono text-slate-400">
                                  {log.timestamp.split('T')[0]}
                                </td>

                                {/* Check-In */}
                                <td className="p-4 font-mono text-slate-300">
                                  {log.status !== 'absent' ? (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                  ) : '--'}
                                </td>

                                {/* Check-Out */}
                                <td className="p-4 font-mono text-slate-300">
                                  {log.checkOutTimestamp ? (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      <span>{new Date(log.checkOutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                  ) : '--'}
                                </td>

                                {/* Status badge */}
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${statusStyle}`}>
                                    {log.status}
                                  </span>
                                </td>

                                {/* Accuracy confidence cell */}
                                <td className="p-4">
                                  {log.status !== 'absent' ? (
                                    <div className="space-y-1">
                                      <span className={`font-mono font-bold ${log.confidence > 95 ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {log.verificationType === 'manual' ? 'OVERRIDE' : `${log.confidence}%`}
                                      </span>
                                      {log.verificationType !== 'manual' && (
                                        <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden">
                                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${log.confidence}%` }} />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 font-mono">--</span>
                                  )}
                                </td>

                                {/* Camera Used */}
                                <td className="p-4 font-mono text-slate-400">
                                  <span className="truncate max-w-[120px] block">{log.cameraLocation}</span>
                                </td>

                                {/* Actions Cell */}
                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button 
                                      onClick={() => setSelectedRecord(log)}
                                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-lg hover:text-white text-slate-400 cursor-pointer"
                                      title="Detailed Biometrics profile"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setOverrideStudentId(log.studentId);
                                        setOverrideDate(log.timestamp.split('T')[0]);
                                        setOverrideStatus(log.status);
                                        setIsOverrideOpen(true);
                                      }}
                                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-lg hover:text-blue-400 text-slate-400 cursor-pointer"
                                      title="Bypass Exception Override"
                                    >
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAGINATION BOUNDS CONTAINER */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/25 rounded-2xl border border-slate-850/80">
                  <span className="text-xs text-slate-500 font-mono">
                    Showing <strong className="text-slate-300">{(page - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-300">{Math.min(page * itemsPerPage, filteredRecords.length)}</strong> of <strong className="text-slate-300">{filteredRecords.length}</strong> records
                  </span>

                  <div className="flex items-center space-x-2 font-mono">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT LIVE AI FACE CAPTURED FEED TIMELINE (3 Columns) */}
              <div className="lg:col-span-3 space-y-5">
                <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl space-y-4 backdrop-blur-md">
                  <div className="border-b border-slate-850 pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>AI Face Captured Feed</span>
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {liveCapturedFeed.map((feed) => (
                      <div 
                        key={feed.id} 
                        className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl flex gap-3 cursor-pointer hover:bg-slate-900/30 transition-all"
                        onClick={() => setSelectedRecord(feed)}
                      >
                        <div className="shrink-0 relative">
                          <img 
                            src={feed.photoUrl} 
                            alt="" 
                            className="w-11 h-11 rounded-xl object-cover border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 p-0.5 rounded-full border border-slate-950">
                            <Cpu className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{feed.studentName}</h4>
                            <span className="text-[8px] font-mono text-slate-500">
                              {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{feed.cameraLocation}</p>
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="text-emerald-400 font-mono font-bold">Confidence {feed.confidence}%</span>
                            <span className="px-1 py-0.1 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded">MARKED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-slate-500 font-mono leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-900 text-center">
                    Neural networks compile alignment vectors at 12ms latency checkpoints. Duplicate filter blocks repetitive entries.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW SCENARIO 2: INTERACTIVE MONTHLY CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar-viewport"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* INTERACTIVE CALENDAR MONTH GRID (8 Columns) */}
              <div className="lg:col-span-8 bg-[#111827]/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-white">July 2026 Academic Schedule</h3>
                    <p className="text-xs text-slate-400">Click any date to filter logs or view scheduled events.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-slate-950 border border-slate-850 text-xs text-slate-300 font-mono rounded-xl font-bold">
                      July 2026
                    </span>
                  </div>
                </div>

                {/* Calendar Days Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Calendar Core Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => {
                    if (day.dayNum === 0) {
                      return <div key={`empty-${idx}`} className="h-18 bg-slate-950/15 rounded-2xl border border-slate-900/30 opacity-40" />;
                    }

                    const isSelected = calendarSelectedDate === day.dateStr;
                    const isToday = day.dateStr === '2026-07-11';
                    
                    let bgStyle = 'bg-slate-950/40 border-slate-900 hover:border-slate-800';
                    if (isSelected) bgStyle = 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
                    else if (isToday) bgStyle = 'bg-indigo-600/5 border-indigo-500/50';

                    return (
                      <div
                        key={`day-${day.dayNum}`}
                        onClick={() => {
                          setCalendarSelectedDate(day.dateStr);
                          setDateFilter(day.dateStr); // automatically filters the table log
                        }}
                        className={`h-18 p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${bgStyle}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-mono font-bold ${
                            isSelected ? 'text-blue-400' : isToday ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            {day.dayNum}
                          </span>

                          {/* Event marker or badges */}
                          {day.type === 'holiday' && (
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" title={day.label} />
                          )}
                          {day.type === 'special' && (
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" title={day.label} />
                          )}
                          {day.type === 'weekend' && (
                            <span className="text-[7px] text-slate-600 font-mono">WKD</span>
                          )}
                        </div>

                        {/* Attendance mini metrics on cell */}
                        {day.stats && (
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(day.stats.present / (day.stats.present + day.stats.absent)) * 100}%` }} />
                              <div className="bg-rose-500 h-full" style={{ width: `${(day.stats.absent / (day.stats.present + day.stats.absent)) * 100}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] font-mono text-slate-500 leading-none">
                              <span className="text-emerald-500">P:{day.stats.present}</span>
                              <span className="text-rose-400">A:{day.stats.absent}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Present Day</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-rose-500 rounded-full" />
                    <span>Absent Index</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>Grace Late</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Special Event</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-1 border border-slate-800 text-[8px] rounded font-bold">WKD</span>
                    <span>Weekend schedule</span>
                  </div>
                </div>

              </div>

              {/* CALENDAR DATE DETAILS PANEL (4 Columns) */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4">
                  <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Schedule Details for {calendarSelectedDate}
                    </h4>
                    <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">
                      INFO
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    
                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-mono uppercase text-[9px]">Class status</span>
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">Standard Weekday</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Class sessions are monitored continuously under automatic facial scanning cameras. Attendance files synchronize on-the-fly.
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-3">
                      <span className="text-slate-400 font-mono uppercase text-[9px] block">Day's Events / Exams</span>
                      <div className="space-y-2.5">
                        <div className="border-l-2 border-purple-500 pl-2.5 space-y-0.5">
                          <h5 className="font-extrabold text-slate-200">AI Computer Vision Symposium</h5>
                          <p className="text-[10px] text-slate-500">09:00 AM - Lobby Checkpoint 1</p>
                        </div>
                        <div className="border-l-2 border-blue-500 pl-2.5 space-y-0.5">
                          <h5 className="font-extrabold text-slate-200">Neural Network Grading Matrix</h5>
                          <p className="text-[10px] text-slate-500">14:00 PM - Research Wing</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('list')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>View day's logs list ({filteredRecords.filter(r => r.timestamp.startsWith(calendarSelectedDate)).length})</span>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW SCENARIO 3: BUSINESS INTELLIGENCE ANALYTICS CHARTS */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics-viewport"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            
            {/* PRIMARY CHARTS GRID ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Daily Attendance trend Area Chart (7 Columns) */}
              <div className="lg:col-span-7 bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4">
                <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Daily Attendance Trend</h4>
                  <span className="text-[9px] text-slate-500 font-mono">12-Day Scope</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendsData}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#64748b" fontSize={10} fontClassName="font-mono" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                      <Area type="monotone" dataKey="late" stroke="#f59e0b" fillOpacity={0} name="Late" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Departmental Performance comparison (5 Columns) */}
              <div className="lg:col-span-5 bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Departmental Comparison</h4>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentComparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Attendance Rate %">
                        {departmentComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* SECONDARY ROW: HOURLY HEATMAP + DEMOGRAPHIC DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Innovative custom HTML/CSS Grid Attendance Heatmap (8 Columns) */}
              <div className="lg:col-span-8 bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4">
                <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Check-In Hour Density Map</h4>
                  <span className="text-[9px] text-slate-500 font-mono">Hourly Checkpoint Loads</span>
                </div>

                <div className="space-y-4">
                  {/* Heatmap Layout Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] space-y-2">
                      {/* Hours headers */}
                      <div className="grid grid-cols-11 gap-1 text-center text-[8px] font-mono text-slate-500 font-bold">
                        <div />
                        <div>08:00 AM</div>
                        <div>09:00 AM</div>
                        <div>10:00 AM</div>
                        <div>11:00 AM</div>
                        <div>12:00 PM</div>
                        <div>01:00 PM</div>
                        <div>02:00 PM</div>
                        <div>03:00 PM</div>
                        <div>04:00 PM</div>
                        <div>05:00 PM</div>
                      </div>

                      {/* Mon to Fri Rows */}
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dIdx) => {
                        const densities = [
                          [85, 20, 5, 2, 8, 4, 12, 5, 10, 40, 95], // Mon
                          [92, 14, 3, 1, 4, 2, 8, 6, 8, 35, 90],  // Tue
                          [88, 18, 4, 0, 6, 3, 15, 4, 12, 42, 94], // Wed
                          [80, 25, 8, 5, 10, 5, 10, 8, 14, 30, 85], // Thu
                          [75, 30, 12, 10, 5, 2, 6, 3, 5, 55, 98]  // Fri
                        ][dIdx];

                        return (
                          <div key={day} className="grid grid-cols-11 gap-1 items-center">
                            <span className="text-[9px] font-mono text-slate-400 text-left truncate">{day}</span>
                            {densities.map((dens, hIdx) => {
                              // Dynamic background mapping
                              let cellBg = 'bg-slate-900/40 border-slate-950';
                              if (dens > 80) cellBg = 'bg-blue-500 border-blue-400/30';
                              else if (dens > 40) cellBg = 'bg-blue-600/60 border-blue-500/20';
                              else if (dens > 15) cellBg = 'bg-blue-600/30 border-blue-500/10';
                              else if (dens > 5) cellBg = 'bg-blue-600/10 border-blue-500/5';

                              return (
                                <div
                                  key={`heat-${day}-${hIdx}`}
                                  title={`${day} Hour ${hIdx + 8}:00: ${dens}% Density`}
                                  className={`h-8 rounded-lg border flex items-center justify-center font-mono text-[8px] text-white/50 cursor-pointer hover:scale-105 transition-all ${cellBg}`}
                                >
                                  {dens}%
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-[9px] font-mono text-slate-500 justify-end">
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded" />
                      <span>Idle</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 bg-blue-600/10 border border-blue-500/5 rounded" />
                      <span>Low</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 bg-blue-600/30 border border-blue-500/10 rounded" />
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 bg-blue-500 border border-blue-400 rounded" />
                      <span>Peak Traffic</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year Demographic comparison Pie Chart (4 Columns) */}
              <div className="lg:col-span-4 bg-[#111827]/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Year Demographic Share</h4>
                </div>
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={yearComparisonData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {yearComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Absolute labels */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-slate-500">YEAR GROUPS</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                  {yearComparisonData.map((d, index) => (
                    <div key={d.name} className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4] }} />
                      <span className="truncate">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* DETAILED STUDENT BIOMETRICS SLIDER DRAWER PANEL (AnimatePresence) */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide Drawer body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              
              {/* Drawer content stack */}
              <div className="space-y-6">
                
                {/* Close trigger */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-extrabold flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>Dossier Analyzer</span>
                  </h3>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 hover:bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main profile card */}
                <div className="flex items-center space-x-4 p-4 bg-slate-900/30 border border-slate-900 rounded-2xl">
                  <img 
                    src={selectedRecord.photoUrl} 
                    alt="" 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{selectedRecord.studentName}</h4>
                    <p className="text-xs text-slate-400 font-mono truncate">ID: {selectedRecord.studentId}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{selectedRecord.department} • {selectedRecord.year}</p>
                  </div>
                </div>

                {/* Double Image recognition view */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Biometric Image Verification</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/20 border border-slate-900 p-2 rounded-xl text-center space-y-1.5">
                      <img 
                        src={selectedRecord.photoUrl} 
                        alt="" 
                        className="w-full h-24 rounded-lg object-cover border border-slate-850" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] font-mono text-slate-500">Database Template</span>
                    </div>

                    <div className="bg-slate-900/20 border border-slate-900 p-2 rounded-xl text-center space-y-1.5 relative overflow-hidden">
                      {selectedRecord.status === 'absent' ? (
                        <div className="w-full h-24 bg-slate-950 flex flex-col items-center justify-center text-rose-500 border border-rose-950 rounded-lg">
                          <UserX className="w-6 h-6 animate-pulse" />
                          <span className="text-[8px] font-mono mt-1">NO SCAN DATA</span>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={selectedRecord.photoUrl} 
                            alt="" 
                            className="w-full h-24 rounded-lg object-cover border border-slate-850 grayscale hue-rotate-15 filter brightness-110" 
                            referrerPolicy="no-referrer"
                          />
                          {/* Face mesh HUD lines overlay */}
                          <div className="absolute inset-2 border border-dashed border-blue-500/30 rounded pointer-events-none" />
                          <span className="text-[8px] font-mono text-blue-400 font-bold block">Captured Live</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Verification Timeline details */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Session Milestones</label>
                  <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl text-[11px] space-y-4">
                    
                    <div className="flex gap-3 relative">
                      <div className="absolute top-4 bottom-0 left-2 w-[1px] bg-slate-800" />
                      <div className="w-4 h-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-[8px] shrink-0 font-bold">1</div>
                      <div className="space-y-0.5">
                        <p className="text-white font-semibold">Face Detected & Tracked</p>
                        <p className="text-[9px] text-slate-500 font-mono">Location: {selectedRecord.cameraLocation || 'Lobby Cam-01'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 relative">
                      <div className="absolute top-4 bottom-0 left-2 w-[1px] bg-slate-800" />
                      <div className="w-4 h-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-[8px] shrink-0 font-bold">2</div>
                      <div className="space-y-0.5">
                        <p className="text-white font-semibold">Vector Alignments Extracted</p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Method: {selectedRecord.verificationType === 'manual' ? 'Manual Exception Bypass' : 'YOLOv8-Face Embeddings'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-4 h-4 bg-blue-500/10 border border-blue-500 text-blue-400 rounded-full flex items-center justify-center text-[8px] shrink-0 font-bold">3</div>
                      <div className="space-y-0.5">
                        <p className="text-white font-semibold">Compliance Status: {selectedRecord.status?.toUpperCase()}</p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Check-In: {selectedRecord.status !== 'absent' ? new Date(selectedRecord.timestamp).toLocaleTimeString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Additional hardware stats */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/40 p-2.5 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 text-[8px] uppercase block">Thermal Index</span>
                    <span className="text-slate-200 font-semibold">{selectedRecord.temperature || '98.2°F'}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 text-[8px] uppercase block">Duration Active</span>
                    <span className="text-slate-200 font-semibold">8h 45m</span>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-900 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    addToast(`Compiling deep CSV profile history logs for index...`, 'info');
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Download History
                </button>
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    addToast(`Incident flagged to security console.`, 'warning');
                  }}
                  className="py-2 px-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900 text-rose-400 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  title="Flag Biometric Incident"
                >
                  Flag Alert
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MANUAL OVERRIDE BYPASS EXCEPTION MODAL DIALOG */}
      {isOverrideOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOverrideOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-bold text-lg mb-2 flex items-center space-x-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Biometric Bypass Overrider</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 border-b border-slate-850 pb-3">
              Manually inject check-in or exception flags bypassing computer vision camera grids.
            </p>

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              
              {/* Select Student */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Select Student</label>
                <select
                  value={overrideStudentId}
                  onChange={(e) => setOverrideStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200"
                  required
                >
                  <option value="">-- Choose Profile --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Date */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Exception Date</label>
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200 font-mono"
                  required
                />
              </div>

              {/* Check-In / Check-Out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Check-In Time</label>
                  <input
                    type="time"
                    value={overrideCheckIn}
                    onChange={(e) => setOverrideCheckIn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Check-Out Time</label>
                  <input
                    type="time"
                    value={overrideCheckOut}
                    onChange={(e) => setOverrideCheckOut(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Attendance Status */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Attendance Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200"
                >
                  <option value="present">Present (On time)</option>
                  <option value="late">Late (Grace margin)</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* Reason selection */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Reason</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200"
                >
                  <option value="Medical Bypass">Medical Bypass Exception</option>
                  <option value="Device Glare Interference">Device Glare / Camera Sensor Glare</option>
                  <option value="Camera Hardware Offline">Camera Hardware Offline</option>
                  <option value="Biometric Registration Outdated">Biometric Outdated (Requires enrolling)</option>
                  <option value="Lost Student ID bypass">Lost Student ID bypass</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Detailed operator Notes</label>
                <textarea
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Insert auxiliary details for audit trails..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-200 resize-none"
                />
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save Override Exception
                </button>
              </div>

            </form>

          </motion.div>
        </div>
      )}

    </div>
  );
}
