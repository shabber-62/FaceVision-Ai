import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  Heart, 
  Award, 
  Calendar, 
  Hash, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  Search,
  ChevronDown,
  Download,
  FileText,
  Printer,
  Edit2,
  Camera,
  Trash2,
  Send,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Fingerprint,
  Cpu,
  Activity,
  History,
  TrendingUp,
  FileSpreadsheet,
  FileCheck,
  Settings,
  HelpCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Users,
  Percent,
  Check,
  X
} from 'lucide-react';
import { 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Student, AttendanceRecord } from '../types';

interface StudentProfileProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onNavigate: (page: string) => void;
  selectedStudentId?: string | null;
  onSelectStudentId?: (id: string | null) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
}

export default function StudentProfile({
  students,
  attendance,
  onNavigate,
  selectedStudentId,
  onSelectStudentId,
  onEditStudent,
  onDeleteStudent
}: StudentProfileProps) {
  
  // Find current student or default to the first active student
  const [activeStudent, setActiveStudent] = useState<Student>(() => {
    if (selectedStudentId) {
      const found = students.find(s => s.id === selectedStudentId);
      if (found) return found;
    }
    return students[0] || {
      id: 'fv-def-01',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@university.edu',
      department: 'Computer Science',
      studentId: 'FV-2026-0812',
      status: 'active',
      registrationDate: '2026-01-10',
      imagesCount: 12,
      faceConfidence: 98.6,
      role: 'Student',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
    };
  });

  // Keep internal state updated if selectedStudentId from props changes
  useEffect(() => {
    if (selectedStudentId) {
      const found = students.find(s => s.id === selectedStudentId);
      if (found) {
        setActiveStudent(found);
      }
    }
  }, [selectedStudentId, students]);

  // Handle local student selector dropdown dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter student candidates inside the profile page dropdown
  const filteredSearchStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custom alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate deterministic details based on student ID to make it super-rich and consistent
  const getExtendedDetails = (s: Student) => {
    const seed = s.id.replace(/\D/g, '') || '1';
    const val = parseInt(seed, 10) || 123;

    // Academic mappings
    const courses = ['B.Tech Computer Science', 'M.Tech Artificial Intelligence', 'B.Sc Data Science', 'M.Sc Cybersecurity', 'Ph.D Machine Learning'];
    const course = courses[val % courses.length];
    
    const branches = ['Information Technology', 'Software Engineering', 'Cognitive Systems', 'Network & Security', 'Cloud Computing'];
    const branch = branches[(val + 1) % branches.length];

    const groups = ['G1', 'G2', 'G3', 'G4'];
    const group = groups[val % groups.length];

    const sections = ['Section-A', 'Section-B', 'Section-C'];
    const section = sections[(val + 2) % sections.length];

    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const year = years[(val + 3) % years.length];

    const semesters = ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];
    const semester = semesters[val % semesters.length];

    const academicYears = ['2025-2026', '2026-2027'];
    const academicYear = academicYears[(val + 1) % academicYears.length];

    const batches = ['Batch 2022-2026', 'Batch 2023-2027', 'Batch 2024-2028', 'Batch 2025-2029'];
    const batch = batches[val % batches.length];

    const rollNo = `Roll-${100 + (val % 899)}`;
    const regNo = `REG-${20260000 + (val % 9999)}`;

    // Personal mappings
    const genders = ['Female', 'Male', 'Non-Binary'];
    const gender = s.name.toLowerCase().includes('sarah') || s.name.toLowerCase().includes('jenkins') || s.name.toLowerCase().includes('anna') || s.name.toLowerCase().includes('clara') || s.name.toLowerCase().includes('linda') || s.name.toLowerCase().includes('sofia') ? 'Female' : genders[val % genders.length];
    
    const dob = `2005-${String((val % 12) + 1).padStart(2, '0')}-${String((val % 28) + 1).padStart(2, '0')}`;
    
    const bloodGroups = ['A+', 'O+', 'B+', 'AB+', 'A-', 'O-', 'B-', 'AB-'];
    const bloodGroup = bloodGroups[val % bloodGroups.length];

    const nationalities = ['American', 'British', 'Indian', 'Canadian', 'German', 'Australian', 'Singaporean'];
    const nationality = nationalities[val % nationalities.length];

    const phone = `+1 (555) ${100 + (val * 17) % 900}-${1000 + (val * 123) % 9000}`;
    const guardianName = `${s.name.split(' ')[1] || 'Jenkins'} Sr.`;
    const guardianPhone = `+1 (555) ${200 + (val * 19) % 800}-${2000 + (val * 111) % 8000}`;
    const emergencyContact = `+1 (555) ${300 + (val * 13) % 700}-${3000 + (val * 99) % 7000}`;

    const addresses = [
      '742 Evergreen Terrace, Sector 7-G',
      '42 Wallaby Way, Sydney',
      '221B Baker Street, London',
      '350 Fifth Ave, New York, NY',
      '1600 Amphitheatre Pkwy, Mountain View, CA',
      '1 Infinite Loop, Cupertino, CA',
      '1098 Tech-Hub Parkway, Suite 404'
    ];
    const address = addresses[val % addresses.length];

    // Academic mapping
    const institution = 'Aegis Institute of Advanced Technology';
    const classAdvisors = ['Dr. Eleanor Vance', 'Prof. Lawrence Sterling', 'Dr. Marcus Brody', 'Dr. Julian Bashir', 'Dr. Samantha Carter'];
    const classAdvisor = classAdvisors[val % classAdvisors.length];
    const classRoom = `Tech-Block-${300 + (val % 10)} (Lab-${val % 5})`;
    
    const subjectSets = [
      ['Computer Networks', 'Database Management', 'AI & Deep Learning', 'Compiler Design', 'Linear Algebra'],
      ['Cloud Architecture', 'Cryptography & Cybersec', 'Operating Systems', 'Formal Languages', 'Data Structures'],
      ['Neural Networks', 'Natural Language Processing', 'Computer Vision', 'Python Robotics', 'Discrete Mathematics'],
      ['Microprocessors', 'Digital Signal Processing', 'Embedded Systems', 'IoT Wireless', 'Probability & Stats']
    ];
    const subjects = subjectSets[val % subjectSets.length];

    const cgpas = ['3.92', '3.85', '3.68', '3.45', '3.72', '3.98', '3.50'];
    const cgpa = cgpas[val % cgpas.length];

    const attendanceRate = 72 + (val * 41) % 28; // 72% to 99%

    // AI recognition specs
    const accuracy = 94.2 + (val * 1.3) % 5.5; // 94.2% to 99.7%
    const successRate = 95.0 + (val * 1.1) % 4.8; // 95% to 99.8%
    const confidence = 96.0 + (val * 0.9) % 3.8; // 96% to 99.8%
    const faceQuality = 92.0 + (val * 1.7) % 7.8; // 92% to 99.8%
    const lastUpdated = `2026-07-10 14:23:${(val % 60).toString().padStart(2, '0')} PM`;

    // Live campus location status
    const statuses = ['Inside Campus', 'Outside Campus', 'Classroom 4B', 'Main Cafeteria', 'Central Library', 'AI Innovation Lab'];
    const locationStatus = statuses[val % statuses.length];
    const isPresentToday = (val % 3) !== 0; // 66% present today
    const isLateToday = (val % 3) === 2; // some late
    
    let campusStatus: 'present' | 'absent' | 'late' = 'absent';
    if (isPresentToday) {
      campusStatus = isLateToday ? 'late' : 'present';
    }

    const checkInTimes = ['08:12 AM', '08:24 AM', '08:45 AM', '09:02 AM'];
    const checkOutTimes = ['04:15 PM', '04:30 PM', '05:00 PM', '---'];
    const lastCheckIn = isPresentToday ? `2026-07-11 ${checkInTimes[val % checkInTimes.length]}` : '---';
    const lastCheckOut = isPresentToday && (val % 2 === 0) ? `2026-07-10 ${checkOutTimes[val % checkOutTimes.length]}` : '---';

    const currentCamera = isPresentToday ? `Node-Cam-0${(val % 4) + 1} (Gate East)` : 'None (Offline)';

    return {
      course, branch, group, section, year, semester, academicYear, batch, rollNo, regNo,
      gender, dob, bloodGroup, nationality, phone, guardianName, guardianPhone, emergencyContact, address,
      institution, classAdvisor, classRoom, subjects, cgpa, attendanceRate,
      accuracy, successRate, confidence, faceQuality, lastUpdated,
      locationStatus, campusStatus, lastCheckIn, lastCheckOut, currentCamera, seed: val
    };
  };

  const ext = getExtendedDetails(activeStudent);

  // PDF Generation simulation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    showToast('Compiling high-fidelity biometric vector charts into PDF matrix...', 'info');
    setTimeout(() => {
      setIsGeneratingPdf(false);
      showToast(`Biometric-Dossier-${activeStudent.studentId}.pdf generated and downloaded successfully.`, 'success');
      
      // Trigger a native print browser block (mocked via standard prompt or direct simulated pdf download)
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', `Biometric-Dossier-${activeStudent.studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2500);
  };

  // Profile Edit modal / toggle state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(activeStudent.name);
  const [editedEmail, setEditedEmail] = useState(activeStudent.email);
  const [editedDept, setEditedDept] = useState(activeStudent.department);

  const startEdit = () => {
    setEditedName(activeStudent.name);
    setEditedEmail(activeStudent.email);
    setEditedDept(activeStudent.department);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editedName || !editedEmail) {
      showToast('All standard credentials are required', 'warning');
      return;
    }
    const updated = {
      ...activeStudent,
      name: editedName,
      email: editedEmail,
      department: editedDept
    };
    setActiveStudent(updated);
    if (onEditStudent) {
      onEditStudent(updated);
    }
    setIsEditing(false);
    showToast('Student matrix values re-aligned & synced successfully.', 'success');
  };

  // Handle student deletion
  const handleDeleteTrigger = () => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the identity dossier of ${activeStudent.name}? This action wipes all trained convolutional weights.`)) {
      if (onDeleteStudent) {
        onDeleteStudent(activeStudent.id);
      }
      showToast('Student vector footprint de-registered.', 'error');
      
      // Back to student directory
      setTimeout(() => {
        onNavigate('students');
      }, 1000);
    }
  };

  // Re-register face redirection
  const handleRegisterFaceRedirect = () => {
    showToast('Redirecting session to live camera onboarding panel...', 'info');
    setTimeout(() => {
      onNavigate('face-registration');
    }, 800);
  };

  // Re-generate attendance records mock timeline
  const generateAttendanceTimeline = () => {
    const dates = [
      '2026-07-11', '2026-07-10', '2026-07-09', '2026-07-08', '2026-07-07', 
      '2026-07-06', '2026-07-05', '2026-07-04', '2026-07-03', '2026-07-02'
    ];
    
    return dates.map((d, index) => {
      const isWeekend = new Date(d).getDay() === 0 || new Date(d).getDay() === 6;
      let status: 'present' | 'absent' | 'late' | 'weekend' = 'present';
      let confidence = 94.5 + ((index * 7) % 5);
      let camera = `Node-Cam-0${(index % 3) + 1} (Main Lobby)`;
      let time = `08:${String(12 + (index * 4) % 40).padStart(2, '0')} AM`;
      let score = 96.2 + ((index * 3) % 3);

      if (isWeekend) {
        status = 'weekend';
        time = '---';
        camera = '---';
      } else if (index === 3) {
        status = 'late';
        time = '09:12 AM';
        confidence = 91.2;
      } else if (index === 7) {
        status = 'absent';
        time = '---';
        camera = '---';
        confidence = 0;
      }

      return {
        date: d,
        status,
        time,
        confidence,
        camera,
        quality: score
      };
    });
  };

  const attendanceTimeline = generateAttendanceTimeline();

  // Calendar interactive layout states (Current Month: July 2026)
  // Let's create an elegant grid representing July 2026 (Starts on a Wednesday, has 31 days)
  const daysInJuly = 31;
  const startOffset = 3; // Wednesday offset in standard calendar
  const julyDays = Array.from({ length: daysInJuly }, (_, i) => {
    const dayNum = i + 1;
    const dateString = `2026-07-${String(dayNum).padStart(2, '0')}`;
    const dayOfWeek = (dayNum + startOffset - 1) % 7; // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Deterministic state
    let state: 'present' | 'absent' | 'late' | 'weekend' | 'future' = 'present';
    const parsedDate = new Date(dateString);
    const currentDate = new Date('2026-07-11');

    if (parsedDate > currentDate) {
      state = 'future';
    } else if (isWeekend) {
      state = 'weekend';
    } else if (dayNum === 2 || dayNum === 9) {
      state = 'late';
    } else if (dayNum === 6) {
      state = 'absent';
    }

    return {
      day: dayNum,
      date: dateString,
      state
    };
  });

  // Analytics graph datasets (deterministic per student using dynamic ext.seed)
  const generateAnalyticsData = () => {
    const seed = ext.seed;
    
    // Monthly performance
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthlyPerformance = months.map((m, i) => {
      const baseAttendance = 80 + (seed % 10);
      const attendance = Math.min(100, Math.max(60, baseAttendance + Math.sin(i + seed) * 12));
      const accuracy = Math.min(100, 95 + Math.cos(i + seed) * 4);
      return {
        name: m,
        Attendance: Math.round(attendance),
        Accuracy: Math.round(accuracy)
      };
    });

    // Weekly attendance trend
    const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'];
    const weeklyTrend = weeks.map((w, i) => {
      const baseVal = 78 + (seed % 15);
      const trendValue = Math.min(100, Math.max(50, baseVal + Math.sin(i * 1.5) * 10));
      return {
        name: w,
        Trend: Math.round(trendValue)
      };
    });

    // Radar Comparison
    const comparisonData = [
      { subject: 'Visual Contrast', Student: 90 + (seed % 10), DepartmentAvg: 85 },
      { subject: 'Pose Alignment', Student: 85 + (seed % 15), DepartmentAvg: 80 },
      { subject: 'Inference Confidence', Student: 95 - (seed % 5), DepartmentAvg: 88 },
      { subject: 'Texture Sharpness', Student: 88 + (seed % 12), DepartmentAvg: 82 },
      { subject: 'Illumination Ratio', Student: 92 - (seed % 8), DepartmentAvg: 86 },
      { subject: 'Detection Streak', Student: 99, DepartmentAvg: 90 }
    ];

    return { monthlyPerformance, weeklyTrend, comparisonData };
  };

  const chartData = generateAnalyticsData();

  // AI biometrics matrix representation rendering
  const generateBiometricEmbeddings = () => {
    const seed = ext.seed;
    const values: string[] = [];
    for (let i = 0; i < 24; i++) {
      const hex = ((seed * (i + 13)) % 256).toString(16).toUpperCase().padStart(2, '0');
      const floatVal = ((seed / (i + 1)) % 1).toFixed(4);
      values.push(`${hex}:${floatVal}`);
    }
    return values;
  };

  const embeddings = generateBiometricEmbeddings();

  return (
    <div id="student-profile-view" className="space-y-6 pb-16">
      
      {/* Toast Notifier */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400' :
              toast.type === 'error' ? 'bg-rose-950/90 border-rose-500 text-rose-400' :
              toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500 text-amber-400' :
              'bg-blue-950/90 border-blue-500 text-blue-400'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4.5 h-4.5 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK STUDENT SWITCHING SELECTOR HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Target Identity Focal Area</p>
            <h2 className="text-sm font-bold text-slate-200">Interactive Student Focus</h2>
          </div>
        </div>

        {/* Dynamic selector dropdown */}
        <div ref={dropdownRef} className="relative w-full md:w-80">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-200 hover:border-slate-700 transition-all flex items-center justify-between shadow-inner cursor-pointer"
          >
            <span className="truncate flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{activeStudent.name} ({activeStudent.studentId})</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 left-0 top-12 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Internal quick search */}
                <div className="p-2 border-b border-slate-900">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search profile databases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-850 pl-8 pr-3 py-2 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Candidate list */}
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {filteredSearchStudents.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-slate-500 italic">No candidates located.</div>
                  ) : (
                    filteredSearchStudents.map((stud) => (
                      <button
                        key={stud.id}
                        onClick={() => {
                          setActiveStudent(stud);
                          if (onSelectStudentId) {
                            onSelectStudentId(stud.id);
                          }
                          setIsDropdownOpen(false);
                          showToast(`Focus shifted to biometric folder of ${stud.name}.`, 'info');
                        }}
                        className={`w-full p-2 rounded-lg text-left text-xs transition-colors hover:bg-slate-900/80 flex items-center space-x-3 cursor-pointer ${
                          stud.id === activeStudent.id ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400'
                        }`}
                      >
                        <img 
                          src={stud.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                          alt={stud.name} 
                          className="w-6 h-6 rounded-md object-cover border border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate text-slate-200">{stud.name}</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">{stud.studentId} • {stud.department}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====================================================
          PAGE HEADER
          ==================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
              Profile Cockpit
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-[10px] text-slate-500 font-mono">Reference ID: {activeStudent.id}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Profile</h1>
          <p className="text-xs text-slate-400">Complete academic profile, attendance, and AI recognition history.</p>
        </div>

        {/* Dynamic functional actions buttons list */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Profile */}
          <button
            onClick={startEdit}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Profile</span>
          </button>

          {/* Register Face */}
          <button
            onClick={handleRegisterFaceRedirect}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>Register Face</span>
          </button>

          {/* Attendance History */}
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Attendance History</span>
          </button>

          {/* Download Profile / Export PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Generate PDF</span>
              </>
            )}
          </button>

          {/* Print Dossier */}
          <button
            onClick={() => {
              showToast('Invoking local hardware printers with biometric specs...', 'info');
              window.print();
            }}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Print Physical Dossier"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EDIT PROFILE DIALOG OVERLAY */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  <span>Modify Student Metadata Records</span>
                </h3>
                <button onClick={() => setIsEditing(false)} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Legal Name</label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Student ID</label>
                    <input
                      type="text"
                      disabled
                      value={activeStudent.studentId}
                      className="w-full bg-slate-900/40 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Contact Email</label>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Department</label>
                    <select
                      value={editedDept}
                      onChange={(e) => setEditedDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Information Tech">Information Tech</option>
                      <option value="AI & Robotics">AI & Robotics</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Save Sync Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORE CONTENT GRID SPANS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT / CENTER CORE WORKSPACE (9 COLUMNS) */}
        <div className="lg:col-span-9 space-y-6">

          {/* ====================================================
              PROFILE SUMMARY (MAIN COMPACT ROW)
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Large Student Photo Container */}
              <div className="relative group shrink-0">
                <img 
                  src={activeStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'} 
                  alt={activeStudent.name} 
                  className="w-32 h-32 rounded-2xl object-cover border border-slate-800 shadow-2xl shadow-blue-500/5"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={handleRegisterFaceRedirect}
                  className="absolute inset-0 bg-black/75 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer border border-blue-500/30 gap-1"
                >
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-[9px] font-mono text-white font-bold uppercase">RE-SCAN</span>
                </button>
              </div>

              {/* Identity Display Fields */}
              <div className="flex-1 space-y-4 w-full text-center md:text-left">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl font-black text-white leading-tight">{activeStudent.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      activeStudent.status === 'active' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}>
                      {activeStudent.status === 'active' ? 'ACTIVE ENROLLMENT' : 'INACTIVE'}
                    </span>
                    <span className="bg-blue-600/15 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {activeStudent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{ext.course} • {activeStudent.department}</p>
                </div>

                {/* Identity specifications grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-left">
                  <div className="bg-slate-950/45 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Student ID</span>
                    <span className="text-slate-200 font-bold font-mono text-[11px] block mt-0.5">{activeStudent.studentId}</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Roll Number</span>
                    <span className="text-slate-200 font-semibold font-mono text-[11px] block mt-0.5">{ext.rollNo}</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Reg. Number</span>
                    <span className="text-slate-200 font-semibold font-mono text-[11px] block mt-0.5">{ext.regNo}</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Academic Year</span>
                    <span className="text-blue-400 font-semibold font-mono text-[11px] block mt-0.5">{ext.academicYear}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix details summary line */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 mt-4 border-t border-slate-900 text-xs">
              <div>
                <span className="text-slate-500 block text-[8px] font-mono uppercase">Year & Sem</span>
                <span className="text-slate-200 font-semibold">{ext.year} • {ext.semester}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] font-mono uppercase">Division Branch</span>
                <span className="text-slate-200 font-semibold">{ext.branch}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] font-mono uppercase">Group / Section</span>
                <span className="text-slate-200 font-semibold">{ext.group} ({ext.section})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] font-mono uppercase">Batch Span</span>
                <span className="text-slate-200 font-semibold font-mono">{ext.batch}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 text-right">
                <span className="text-slate-500 block text-[8px] font-mono uppercase">Active Track State</span>
                <span className="text-emerald-400 font-extrabold">{ext.locationStatus}</span>
              </div>
            </div>
          </div>

          {/* DUAL COHORT TAB BOXES FOR DETAILED BIOMETRICS, PERSONAL & ACADEMICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ====================================================
                PERSONAL DETAILS CARD
                ==================================================== */}
            <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="border-b border-slate-900 pb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Personal Details Matrix</span>
                </h3>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Identity Verified</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Email Address</span>
                  <span className="text-slate-200 font-semibold flex items-center space-x-1.5 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{activeStudent.email}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Phone Number</span>
                  <span className="text-slate-200 font-semibold font-mono flex items-center space-x-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ext.phone}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Date of Birth</span>
                  <span className="text-slate-200 font-semibold font-mono flex items-center space-x-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ext.dob}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Gender Spec</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{ext.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Blood Group</span>
                  <span className="text-rose-400 font-bold flex items-center space-x-1 mt-0.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{ext.bloodGroup}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Nationality</span>
                  <span className="text-slate-200 font-semibold mt-0.5 flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{ext.nationality}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Guardian Legal Name</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block truncate">{ext.guardianName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Residential Address Address</span>
                  <span className="text-slate-300 flex items-start space-x-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="leading-normal">{ext.address}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Guardian Phone</span>
                  <span className="text-slate-200 font-semibold font-mono block mt-0.5">{ext.guardianPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Emergency Contact</span>
                  <span className="text-rose-400 font-bold font-mono block mt-0.5">{ext.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* ====================================================
                ACADEMIC DETAILS CARD
                ==================================================== */}
            <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="border-b border-slate-900 pb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-4.5 h-4.5 text-blue-400" />
                  <span>Academic Details Matrix</span>
                </h3>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Affiliation Verified</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Institution</span>
                  <span className="text-slate-200 font-semibold flex items-center space-x-1.5 mt-0.5">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">{ext.institution}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Departmental Section</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{activeStudent.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Specialized Program</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block truncate">{ext.course}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Year Group / Sem</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{ext.year} / {ext.semester}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Division Section</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{ext.section}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Class Advisor</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block truncate">{ext.classAdvisor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Primary Lecture Room</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block truncate">{ext.classRoom}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Current Semester Subjects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ext.subjects.map((sub, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-300">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Current Grade (CGPA)</span>
                  <span className="text-blue-400 font-black text-sm block mt-0.5">{ext.cgpa} / 4.00</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Attendance Ratio</span>
                  <span className="text-emerald-400 font-black text-sm block mt-0.5">{ext.attendanceRate}% Logged</span>
                </div>
              </div>
            </div>

          </div>

          {/* ====================================================
              AI FACE PROFILE & STREAKS
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Fingerprint className="w-4.5 h-4.5 text-purple-400" />
                <span>Convolutional AI Biometrics & Face Vectors</span>
              </h3>
              <span className="text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-semibold">
                YOLOv8 Weights
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Registered face snapshots gallery */}
              <div className="md:col-span-4 space-y-3">
                <label className="text-[9px] font-mono uppercase text-slate-500">Registered Face Samples ({activeStudent.imagesCount} frames)</label>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: Math.min(6, activeStudent.imagesCount || 3) }).map((_, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-800">
                      <img 
                        src={`https://images.unsplash.com/photo-${1500000000000 + (idx * 150000)}?auto=format&fit=crop&q=80&w=120`} 
                        alt="face weight" 
                        className="w-full h-12 object-cover filter brightness-75 contrast-125"
                      />
                      <div className="absolute inset-0 bg-purple-600/20 mix-blend-color-dodge opacity-60"></div>
                      <div className="absolute bottom-0 right-0 left-0 bg-slate-950/80 text-[8px] text-center font-mono text-purple-300 py-0.5 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom">
                        SAMP-{idx + 1}
                      </div>
                    </div>
                  ))}
                  {/* Plus register addition */}
                  <button 
                    onClick={handleRegisterFaceRedirect}
                    className="h-12 border border-dashed border-slate-800 hover:border-purple-500 hover:bg-purple-950/10 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-400 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold">+</span>
                  </button>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span>REGISTRATION DATE:</span>
                    <span className="text-slate-300">{activeStudent.registrationDate}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[9px]">
                    <span>VECTOR LAST UPDATED:</span>
                    <span className="text-slate-300">{ext.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Hexadecimal embedding weights */}
              <div className="md:col-span-5 space-y-2">
                <label className="text-[9px] font-mono uppercase text-slate-500">128D Spatial Embedding Vector Matrix (Segment)</label>
                <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[9px] text-purple-400/80 max-h-32 overflow-y-auto custom-scrollbar">
                  {embeddings.map((emb, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-1 text-center rounded border border-slate-850 truncate" title={`Embedding index ${idx}`}>
                      {emb}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 leading-normal italic">
                  *FIPS 140-3 Compliant facial encryption signature registered in the secure local DB matrix.
                </p>
              </div>

              {/* Accuracy biometrics statistics */}
              <div className="md:col-span-3 grid grid-cols-1 gap-2 text-xs">
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Recognition Accuracy</span>
                  <span className="text-purple-400 font-extrabold text-sm block mt-0.5">{ext.accuracy.toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Face Quality Score</span>
                  <span className="text-blue-400 font-extrabold text-sm block mt-0.5">{ext.faceQuality.toFixed(1)}% Sharp</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80">
                  <span className="text-slate-500 block text-[8px] font-mono uppercase">Inference Confidence</span>
                  <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">{ext.confidence.toFixed(1)}% Rate</span>
                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              ATTENDANCE HISTORY (CALENDAR & TIMELINE)
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-3 gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Surveillance Attendance Audit History</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Biometric check-in logs for July 2026</p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-3 text-[10px] font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-md"></span>
                  <span>Present</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500 text-amber-400 rounded-md"></span>
                  <span>Late</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500 text-rose-400 rounded-md"></span>
                  <span>Absent</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-md"></span>
                  <span>N/A</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Interactive Calendar layout */}
              <div className="md:col-span-7 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex justify-between px-1">
                  <span>July 2026</span>
                  <span className="text-emerald-400">Streak: 5 Days</span>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-500 font-semibold border-b border-slate-900 pb-1.5">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offsets for starts on Wednesday offset */}
                  {Array.from({ length: startOffset }).map((_, idx) => (
                    <div key={`offset-${idx}`} className="h-9 bg-slate-950/20 border border-transparent rounded-lg"></div>
                  ))}

                  {/* July Dates */}
                  {julyDays.map((dayObj) => (
                    <div
                      key={dayObj.day}
                      className={`h-9 flex flex-col items-center justify-center text-xs font-bold rounded-lg border transition-all relative ${
                        dayObj.state === 'future' ? 'bg-slate-950/20 border-slate-900/40 text-slate-600' :
                        dayObj.state === 'weekend' ? 'bg-slate-950/40 border-slate-900 text-slate-500' :
                        dayObj.state === 'late' ? 'bg-amber-950/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/5' :
                        dayObj.state === 'absent' ? 'bg-rose-950/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/5' :
                        'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5'
                      }`}
                      title={`${dayObj.date} State: ${dayObj.state}`}
                    >
                      <span>{dayObj.day}</span>
                      {dayObj.state === 'present' && <span className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full"></span>}
                      {dayObj.state === 'late' && <span className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full"></span>}
                      {dayObj.state === 'absent' && <span className="absolute bottom-1 w-1 h-1 bg-rose-400 rounded-full"></span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly breakdown stats & check logs list */}
              <div className="md:col-span-5 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950/45 p-2 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[9px] font-mono">Present</span>
                    <span className="text-emerald-400 font-extrabold">26 Days</span>
                  </div>
                  <div className="bg-slate-950/45 p-2 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[9px] font-mono">Late</span>
                    <span className="text-amber-400 font-extrabold">3 Days</span>
                  </div>
                  <div className="bg-slate-950/45 p-2 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block text-[9px] font-mono">Absent</span>
                    <span className="text-rose-400 font-extrabold">2 Days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-mono text-slate-500">Attendance Timeline Trace</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1 font-mono text-[11px]">
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <span className="text-emerald-400">✓ 2026-07-11 08:12 AM</span>
                      <span className="text-slate-400">Cam-02 (Gate East)</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <span className="text-emerald-400">✓ 2026-07-10 08:24 AM</span>
                      <span className="text-slate-400">Cam-01 (Main Lobby)</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <span className="text-amber-400">! 2026-07-09 09:12 AM</span>
                      <span className="text-slate-400">Cam-01 (Late Entry)</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <span className="text-rose-400">✗ 2026-07-06 Absent</span>
                      <span className="text-slate-500">Unexcused</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              AI RECOGNITION HISTORY TIMELINE
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <History className="w-4.5 h-4.5 text-blue-400" />
                <span>Live AI Recognition History Timeline</span>
              </h3>
              <p className="text-[10px] text-slate-500">Surveillance logs matching this student's face vectors</p>
            </div>

            <div className="space-y-3.5">
              {attendanceTimeline.map((item, idx) => {
                if (item.status === 'weekend') return null;
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Line connection */}
                    {idx < attendanceTimeline.length - 1 && (
                      <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-[1px] bg-slate-900" />
                    )}

                    {/* Status circle indicator */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                      item.status === 'present' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                      item.status === 'late' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                      'bg-rose-950/40 border-rose-500/30 text-rose-400'
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                    </div>

                    {/* Description details */}
                    <div className="flex-1 bg-slate-950/65 p-3 rounded-2xl border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-bold text-slate-200">
                            {item.status === 'present' ? 'Biometrics Identity Match' :
                             item.status === 'late' ? 'Late Registration Intercept' : 'Unregistered Gap Intercept'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Date: {item.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Captured at {item.time} via {item.camera}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-slate-500 block text-[8px] font-mono uppercase">Inference Score</span>
                          <span className="text-blue-400 font-mono font-bold text-[11px]">
                            {item.confidence > 0 ? `${item.confidence.toFixed(1)}% Match` : '---'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] font-mono uppercase">Face Quality</span>
                          <span className="text-purple-400 font-mono font-bold text-[11px]">
                            {item.quality > 0 ? `${item.quality.toFixed(1)}% Sharp` : '---'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          item.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          item.status === 'late' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ====================================================
              PERFORMANCE ANALYTICS (GRAPHS & TRENDS)
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
                <span>Performance Analytics & Recognition Accuracy Trends</span>
              </h3>
              <p className="text-[10px] text-slate-500">Biometric trend-line charts and group comparative statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Monthly Attendance Progress */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">Monthly Attendance & Accuracy Ratios</h4>
                <div className="h-56 bg-slate-950/40 p-2 rounded-2xl border border-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.monthlyPerformance}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 11 }} />
                      <Area type="monotone" dataKey="Attendance" stroke="#10b981" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Accuracy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Face Quality Vector Comparison */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">Biometric Metric Alignment (Radar Map)</h4>
                <div className="h-56 bg-slate-950/40 p-2 rounded-2xl border border-slate-900 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.comparisonData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                      <Radar name={activeStudent.name} dataKey="Student" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                      <Radar name="Dept Average" dataKey="DepartmentAvg" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              DOCUMENTS COMPARTMENT (STUDENT PAPERS)
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <FileCheck className="w-4.5 h-4.5 text-blue-400" />
                <span>Documents Registry & Certificates Downloads</span>
              </h3>
              <p className="text-[10px] text-slate-500">Official academic credentials and printable system passes</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* ID Card */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between hover:border-blue-500/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Student ID Card</span>
                    <span className="text-[9px] text-slate-500 font-mono">PDF • 1.2 MB</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Initiated Student ID Card secure transmission download...', 'success')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bonafide Certificate */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between hover:border-blue-500/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Bonafide Pass</span>
                    <span className="text-[9px] text-slate-500 font-mono">PDF • 450 KB</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Generated Bonafide registration PDF sheet...', 'success')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hall Ticket */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between hover:border-blue-500/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Exam Hall Ticket</span>
                    <span className="text-[9px] text-slate-500 font-mono">PDF • 890 KB</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Downloaded verified Exam Hall Ticket with photo-weights...', 'success')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* System Face Certificate */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between hover:border-blue-500/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Biometric Cert</span>
                    <span className="text-[9px] text-slate-500 font-mono">PDF • 2.1 MB</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Generated Face Vision AI enrollment certificate credentials...', 'success')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR (3 COLUMNS) */}
        <div className="lg:col-span-3 space-y-6">

          {/* ====================================================
              LIVE CAMPUS STATUS & CHANNELS
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Channels</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Present / Late badge overlay */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-900">
                <span className="text-slate-400">Campus Status:</span>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold uppercase ${
                  ext.campusStatus === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  ext.campusStatus === 'late' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {ext.campusStatus === 'present' ? 'Inside Campus' :
                   ext.campusStatus === 'late' ? 'Late Entry' : 'Outside Campus'}
                </span>
              </div>

              {/* Check times */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Last Check-In</span>
                  <span className="text-slate-200 font-mono font-medium">{ext.lastCheckIn}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Last Check-Out</span>
                  <span className="text-slate-200 font-mono font-medium">{ext.lastCheckOut}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Active Camera</span>
                  <span className="text-blue-400 font-mono truncate max-w-[150px] text-right" title={ext.currentCamera}>{ext.currentCamera}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              QUICK ACTIONS CONSOLE PANEL
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-white border-b border-slate-900 pb-2">
              Operator Quick Control Panel
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              
              {/* Edit Student */}
              <button
                onClick={startEdit}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Identity Specs</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Update Face */}
              <button
                onClick={handleRegisterFaceRedirect}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Update Face Enroller</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Send Email */}
              <button
                onClick={() => showToast(`Encrypted transmission dispatch email sent to ${activeStudent.email}.`, 'info')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send Matrix Email</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Call Student phone */}
              <button
                onClick={() => showToast(`Initiating VOIP cryptographic voice tunnel to ${ext.phone}...`, 'info')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Emergency Link</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Attendance Report Compile */}
              <button
                onClick={() => {
                  showToast('Initiating compilation report wizard for semester attendance...', 'success');
                  onNavigate('reports');
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compile Full Report</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Delete Student */}
              <button
                onClick={handleDeleteTrigger}
                className="w-full py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl font-semibold flex items-center justify-between px-3 transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>De-register Student</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-rose-800" />
              </button>

            </div>
          </div>

          {/* ====================================================
              RIGHT SIDEBAR: CURRENT ATTENDANCE & STATUS WIDGET
              ==================================================== */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-white border-b border-slate-900 pb-2 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI Health & System Status</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              
              {/* Face Status Widget */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] font-mono uppercase">Neural Face State</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Confidence Match</span>
                  <span className="text-emerald-400 font-bold font-mono">99.4% (Optimal)</span>
                </div>
              </div>

              {/* AI Network Node state */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] font-mono uppercase">AI Health Matrix</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">System Weights</span>
                  <span className="text-blue-400 font-bold font-mono">Locked (YOLOv8)</span>
                </div>
              </div>

              {/* Sync Status state */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] font-mono uppercase">Active Cluster</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Database Records</span>
                  <span className="text-slate-400 font-mono">Synced (100%)</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
