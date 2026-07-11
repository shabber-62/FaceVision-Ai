import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  UserPlus, 
  Grid, 
  List, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Upload, 
  CheckCircle, 
  MoreVertical, 
  FileText, 
  Mail, 
  Building, 
  Fingerprint,
  Info,
  Phone,
  MapPin,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertTriangle,
  Download,
  Database,
  Sliders,
  Check,
  RefreshCw,
  TrendingUp,
  SlidersHorizontal,
  FolderSync,
  HeartPulse,
  UserRound,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Bell,
  Cpu,
  Laptop
} from 'lucide-react';
import { Student } from '../types';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'registrationDate' | 'faceConfidence'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onNavigate?: (page: string) => void;
  onSelectStudentId?: (id: string | null) => void;
}

// Stably enrich the generic student list with high-fidelity Enterprise fields
interface EnrichedStudent extends Student {
  phone: string;
  year: string;
  section: string;
  attendanceRate: number;
  address: string;
  guardianName: string;
  guardianContact: string;
  faceStatus: 'registered' | 'unregistered' | 'low_quality' | 'multiple_samples';
  faceQualityScore: number;
  lastRecognition: string;
  registeredDevices: string[];
}

export default function StudentManagement({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onNavigate,
  onSelectStudentId
}: StudentManagementProps) {
  
  // Local persistence cache to preserve custom field modifications in current session
  const [localExtendedData, setLocalExtendedData] = useState<Record<string, Partial<EnrichedStudent>>>(() => {
    try {
      const cached = localStorage.getItem('fv_student_extended_data');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('fv_student_extended_data', JSON.stringify(localExtendedData));
  }, [localExtendedData]);

  // Deterministically enrich students based on standard core properties and merge local edits
  const enrichedStudents: EnrichedStudent[] = students.map((stud) => {
    const hash = stud.id.replace(/\D/g, '') || '1';
    const val = parseInt(hash, 10) || 1;
    
    // Default mock expansions
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const defaultYear = years[(val + 2) % 4];
    
    const sections = ['A', 'B', 'C', 'D'];
    const defaultSection = sections[(val + 1) % 4];
    
    const defaultPhone = `+1 (555) ${100 + (val * 17) % 900}-${1000 + (val * 123) % 9000}`;
    
    // Attendance %: some below 75% to trigger the requested threshold alerts
    const defaultAttendance = 58 + (val * 41) % 40; 
    
    const addresses = [
      '742 Evergreen Terrace, Sector 7-G',
      '42 Wallaby Way, Sydney',
      '221B Baker Street, London',
      '350 Fifth Ave, New York, NY',
      '1600 Amphitheatre Pkwy, Mountain View, CA',
      '1 Infinite Loop, Cupertino, CA'
    ];
    const defaultAddress = addresses[val % addresses.length];
    
    const guardianNames = ['Sarah Connor Sr.', 'Thomas Wright', 'Randall Brewster', 'Evelyn Connor', 'Howard Brewster'];
    const defaultGuardian = guardianNames[val % guardianNames.length];
    const defaultGuardianContact = `+1 (555) ${200 + (val * 19) % 800}-${2000 + (val * 111) % 8000}`;
    
    // Face Status categories
    let defaultFaceStatus: 'registered' | 'unregistered' | 'low_quality' | 'multiple_samples' = 'registered';
    if (stud.imagesCount === 0) {
      defaultFaceStatus = 'unregistered';
    } else if (stud.faceConfidence < 90) {
      defaultFaceStatus = 'low_quality';
    } else if (stud.imagesCount > 8) {
      defaultFaceStatus = 'multiple_samples';
    } else {
      defaultFaceStatus = 'registered';
    }

    const devices = [
      ['Edge Cam Entrance-01', 'Admin Tablet-12'],
      ['Gate Controller-04'],
      ['Lobby East Gate-02', 'Mobile Client App'],
      ['Loading Dock Camera-09'],
      ['Main Gate-01', 'Office Door Cam-15']
    ];
    const defaultDevices = devices[val % devices.length];
    const defaultLastRec = `2026-07-11 08:${(30 + val * 3) % 60} AM`;

    // Retrieve local edits if they exist for this student ID
    const custom = localExtendedData[stud.id] || {};

    return {
      ...stud,
      phone: custom.phone || defaultPhone,
      year: custom.year || defaultYear,
      section: custom.section || defaultSection,
      attendanceRate: custom.attendanceRate ?? defaultAttendance,
      address: custom.address || defaultAddress,
      guardianName: custom.guardianName || defaultGuardian,
      guardianContact: custom.guardianContact || defaultGuardianContact,
      faceStatus: custom.faceStatus || defaultFaceStatus,
      faceQualityScore: custom.faceQualityScore ?? stud.faceConfidence,
      lastRecognition: custom.lastRecognition || defaultLastRec,
      registeredDevices: custom.registeredDevices || defaultDevices
    };
  });

  // Table sorting and selection
  const [sortField, setSortField] = useState<keyof EnrichedStudent>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Main Search and Multi-Filters State
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [faceStatusFilter, setFaceStatusFilter] = useState('all');
  
  // Layout views: 'table' is standard, can toggle to 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Sidebar student drawer state (Profile view)
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);

  // Form Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<EnrichedStudent | null>(null);
  
  // Bulk Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState<'idle' | 'uploading' | 'validating' | 'summary'>('idle');
  const [importSummary, setImportSummary] = useState<{ count: number; errorCount: number } | null>(null);

  // Success toasts
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  const triggerNotification = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Engineering');
  const [formId, setFormId] = useState('');
  const [formRole, setFormRole] = useState('ML Engineer');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formPhone, setFormPhone] = useState('');
  const [formYear, setFormYear] = useState('1st Year');
  const [formSection, setFormSection] = useState('A');
  const [formAddress, setFormAddress] = useState('');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formGuardianContact, setFormGuardianContact] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formCaptureFaceLater, setFormCaptureFaceLater] = useState(false);
  const [formImagesCount, setFormImagesCount] = useState(5);
  const [formConfidence, setFormConfidence] = useState(95);

  // Form Simulation Image Upload variables
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting controller
  const handleSort = (field: keyof EnrichedStudent) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDeptFilter('all');
    setYearFilter('all');
    setSectionFilter('all');
    setAttendanceFilter('all');
    setStatusFilter('all');
    setFaceStatusFilter('all');
    setPage(1);
    triggerNotification('Search and filters cleared', 'info');
  };

  // Filters calculation
  const filteredStudents = enrichedStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) || 
      student.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      (student.phone && student.phone.includes(search));
    
    const matchesDept = deptFilter === 'all' || student.department === deptFilter;
    const matchesYear = yearFilter === 'all' || student.year === yearFilter;
    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesFaceStatus = faceStatusFilter === 'all' || student.faceStatus === faceStatusFilter;
    
    let matchesAttendance = true;
    if (attendanceFilter === 'below_75') {
      matchesAttendance = student.attendanceRate < 75;
    } else if (attendanceFilter === 'above_75') {
      matchesAttendance = student.attendanceRate >= 75;
    }

    return matchesSearch && matchesDept && matchesYear && matchesSection && matchesStatus && matchesFaceStatus && matchesAttendance;
  });

  // Execute Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    // Number fallback
    return sortDirection === 'asc' 
      ? (valA as number) - (valB as number) 
      : (valB as number) - (valA as number);
  });

  // Paginated chunk
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage) || 1;
  const paginatedStudents = sortedStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Bulk selectors logic
  const handleSelectAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(paginatedStudents.map(s => s.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRowIds(prev => [...prev, id]);
    } else {
      setSelectedRowIds(prev => prev.filter(item => item !== id));
    }
  };

  // Open modals
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormEmail('');
    setFormDept('Engineering');
    setFormId(`FV-2026-${Math.floor(100 + Math.random() * 899)}`);
    setFormRole('ML Engineer');
    setFormStatus('active');
    setFormPhone('');
    setFormYear('1st Year');
    setFormSection('A');
    setFormAddress('');
    setFormGuardianName('');
    setFormGuardianContact('');
    setFormAvatarUrl('');
    setFormCaptureFaceLater(false);
    setFormImagesCount(5);
    setFormConfidence(96.2);
    setUploadProgress(0);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student: EnrichedStudent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormDept(student.department);
    setFormId(student.studentId);
    setFormRole(student.role);
    setFormStatus(student.status);
    setFormPhone(student.phone);
    setFormYear(student.year);
    setFormSection(student.section);
    setFormAddress(student.address);
    setFormGuardianName(student.guardianName);
    setFormGuardianContact(student.guardianContact);
    setFormAvatarUrl(student.avatarUrl || '');
    setFormCaptureFaceLater(student.imagesCount === 0);
    setFormImagesCount(student.imagesCount);
    setFormConfidence(student.faceQualityScore);
    setUploadProgress(100);
    setIsFormModalOpen(true);
  };

  // File capture simulation
  const handleSimulatePhotoUpload = () => {
    setIsUploadingPhoto(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploadingPhoto(false);
          // Pick beautiful random avatar url
          const samplePhotos = [
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
          ];
          setFormAvatarUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
          setFormImagesCount(prev => (prev === 0 ? 5 : prev));
          triggerNotification('Biometric profile photo uploaded successfully', 'success');
          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  // Save student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formId) {
      triggerNotification('Please complete all required fields', 'warning');
      return;
    }

    // Check Duplicate ID rule (avoiding clash with existing, except when editing itself)
    const isDuplicateId = enrichedStudents.some(
      s => s.studentId === formId && (!editingStudent || editingStudent.id !== s.id)
    );
    if (isDuplicateId) {
      triggerNotification(`Duplicate ID Warning: ${formId} is already assigned!`, 'warning');
      return;
    }

    const finalImagesCount = formCaptureFaceLater ? 0 : formImagesCount;
    const finalConfidence = formCaptureFaceLater ? 0 : formConfidence;

    // Cache local extended data
    const updatedExtendedRecord: Partial<EnrichedStudent> = {
      phone: formPhone || `+1 (555) 999-0000`,
      year: formYear,
      section: formSection,
      address: formAddress || 'TBD Street',
      guardianName: formGuardianName || 'Self',
      guardianContact: formGuardianContact || formPhone,
      faceStatus: finalImagesCount === 0 ? 'unregistered' : finalConfidence < 90 ? 'low_quality' : finalImagesCount > 8 ? 'multiple_samples' : 'registered',
      faceQualityScore: finalConfidence,
      attendanceRate: editingStudent ? editingStudent.attendanceRate : 85.0,
      lastRecognition: editingStudent ? editingStudent.lastRecognition : 'N/A',
      registeredDevices: editingStudent ? editingStudent.registeredDevices : ['Edge Cam Main Gate']
    };

    if (editingStudent) {
      // Edit mode
      setLocalExtendedData(prev => ({
        ...prev,
        [editingStudent.id]: updatedExtendedRecord
      }));

      onEditStudent({
        ...editingStudent,
        name: formName,
        email: formEmail,
        department: formDept,
        studentId: formId,
        role: formRole,
        status: formStatus,
        imagesCount: finalImagesCount,
        avatarUrl: formAvatarUrl || editingStudent.avatarUrl,
        faceConfidence: finalConfidence
      });
      
      triggerNotification(`Student ${formName} saved successfully.`);
      // Update drawer state if open
      if (selectedStudent && selectedStudent.id === editingStudent.id) {
        setSelectedStudent({
          ...selectedStudent,
          ...updatedExtendedRecord,
          name: formName,
          email: formEmail,
          department: formDept,
          studentId: formId,
          role: formRole,
          status: formStatus,
          imagesCount: finalImagesCount,
          avatarUrl: formAvatarUrl || editingStudent.avatarUrl,
          faceConfidence: finalConfidence
        } as EnrichedStudent);
      }
    } else {
      // Add mode
      const tempId = `st-${Date.now()}`;
      setLocalExtendedData(prev => ({
        ...prev,
        [tempId]: updatedExtendedRecord
      }));

      onAddStudent({
        name: formName,
        email: formEmail,
        department: formDept,
        studentId: formId,
        role: formRole,
        status: formStatus,
        imagesCount: finalImagesCount,
        avatarUrl: formAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      });

      triggerNotification(`Enrolled student ${formName} into biometrics index.`);
    }

    setIsFormModalOpen(false);
  };

  // Delete student helper
  const handleDeleteClick = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you absolutely sure you want to permanently delete student ${name}? This will invalidate all enrolled facial weights from YOLOv8 DB.`)) {
      onDeleteStudent(id);
      setSelectedRowIds(prev => prev.filter(r => r !== id));
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
      triggerNotification(`Student ${name} deleted successfully.`, 'warning');
    }
  };

  // Simulated Email dispatch
  const handleEmailStudent = (name: string, email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerNotification(`Biometric compliance email sent to ${name} (${email})`, 'success');
  };

  // Simulated Attendance report download
  const handleDownloadReport = (name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerNotification(`Compiling and downloading attendance audit sheet for ${name}`, 'info');
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRowIds.length} selected students?`)) {
      selectedRowIds.forEach(id => {
        onDeleteStudent(id);
      });
      setSelectedRowIds([]);
      triggerNotification(`Successfully batch deleted ${selectedRowIds.length} profiles.`, 'warning');
    }
  };

  const handleBulkExport = () => {
    triggerNotification(`Exported CSV list for ${selectedRowIds.length} students.`, 'success');
  };

  const handleBulkEmail = () => {
    triggerNotification(`Sent biometrics re-indexing compliance notice to ${selectedRowIds.length} recipients.`, 'info');
  };

  // Drag and Drop simulation for CSV import
  const handleTriggerBulkImport = () => {
    setImportStage('idle');
    setImportProgress(0);
    setImportSummary(null);
    setIsImportModalOpen(true);
  };

  const handleStartSimulatedImport = () => {
    setImportStage('uploading');
    let p = 0;
    const upInt = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(upInt);
        setImportStage('validating');
        // Validation step
        let vp = 0;
        const valInt = setInterval(() => {
          vp += 20;
          if (vp >= 100) {
            clearInterval(valInt);
            setImportStage('summary');
            setImportSummary({
              count: 6,
              errorCount: 1 // Simulated low quality/empty face alert row
            });
            // Auto inject 6 mock students to parent state (simulate import)
            const sampleNames = ['Miles Dyson Jr.', 'T-1000 Liquid', 'John Brewster', 'Evelyn Wright', 'Claire Connor', 'Dillon Brewster'];
            sampleNames.forEach((n, index) => {
              onAddStudent({
                name: n,
                email: `${n.toLowerCase().replace(/\s/g, '')}@cyberdyne.io`,
                department: index % 2 === 0 ? 'Research & Dev' : 'Engineering',
                studentId: `FV-2026-IMP${10 + index}`,
                role: 'Imported Operative',
                status: 'active',
                imagesCount: index === 3 ? 0 : 5, // index 3 has 0 to trigger error
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
              });
            });
            triggerNotification('Batch CSV import complete. 6 student slots queued.', 'success');
          }
        }, 150);
      }
      setImportProgress(Math.min(p, 100));
    }, 100);
  };

  // Statistics calculation for dynamic Bento Cards
  const totalStudents = enrichedStudents.length;
  const activeCount = enrichedStudents.filter(s => s.status === 'active').length;
  const inactiveCount = enrichedStudents.filter(s => s.status === 'inactive').length;
  const newRegistrations = enrichedStudents.filter(s => s.registrationDate.startsWith('2026')).length;
  
  // Average attendance among filtered/all students
  const avgAttendance = parseFloat(
    (enrichedStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / (totalStudents || 1)).toFixed(1)
  );

  // Dynamic system-level warning counts
  const missingFaceList = enrichedStudents.filter(s => s.imagesCount === 0);
  const lowQualityFaceList = enrichedStudents.filter(s => s.faceConfidence < 90 && s.imagesCount > 0);
  const lowAttendanceList = enrichedStudents.filter(s => s.attendanceRate < 75);
  const duplicateIdAlerts = enrichedStudents.filter((s, idx, self) => 
    self.findIndex(t => t.studentId === s.studentId) !== idx
  );

  return (
    <div id="student-management-portal" className="space-y-8 pb-16 relative">
      
      {/* SUCCESS TOASTS SYSTEM */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${
                n.type === 'warning' 
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : n.type === 'info'
                    ? 'bg-blue-950/80 border-blue-800 text-blue-300'
                    : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs font-mono leading-relaxed">
                {n.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
              Secure Registry
            </span>
            <span className="h-4 w-[1px] bg-slate-800" />
            <span className="text-slate-500 text-xs font-mono">Operator ID: Admin-09</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Management</h1>
          <p className="text-sm text-slate-400">Manage registered students and face profiles efficiently.</p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerBulkImport}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Bulk Import</span>
          </button>
          
          <button
            onClick={() => {
              triggerNotification('Compiling spreadsheet archive. Preparing XLS file for download.', 'info');
            }}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Data</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC METRIC BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        
        {/* Total Students */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Students</span>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{totalStudents}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <UserRound className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 font-mono">
            Full corporate directory
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-lg pointer-events-none" />
        </div>

        {/* Active Students */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Active Students</span>
              <h3 className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">{activeCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-emerald-500/80 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active match loop listeners</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
        </div>

        {/* Inactive Students */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Inactive Students</span>
              <h3 className="text-2xl font-bold text-slate-400 font-mono tracking-tight">{inactiveCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <UserX className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 font-mono">
            Bypassed profile statuses
          </div>
        </div>

        {/* New Registrations */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">New (2026)</span>
              <h3 className="text-2xl font-bold text-purple-400 font-mono tracking-tight">{newRegistrations}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FolderSync className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 font-mono">
            Enrolled this academic fiscal
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full blur-lg pointer-events-none" />
        </div>

        {/* Recognition Success Rate */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Mean Attendance</span>
              <h3 className="text-2xl font-bold text-cyan-400 font-mono tracking-tight">{avgAttendance}%</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-cyan-500/80 font-mono">
            Stable telemetry standard
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-full blur-lg pointer-events-none" />
        </div>

        {/* Database Size */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Database Size</span>
              <h3 className="text-2xl font-bold text-indigo-400 font-mono tracking-tight">1.24 GB</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-indigo-400 font-mono">
            4,820 custom vector anchors
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
        </div>

      </div>

      {/* SYSTEM ALERTS REAL-TIME LOG OVERLAY */}
      {(missingFaceList.length > 0 || lowQualityFaceList.length > 0 || lowAttendanceList.length > 0) && (
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300">Biometric Integrity Alerts</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Missing Faces Alert */}
            {missingFaceList.length > 0 && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Missing Face Registration ({missingFaceList.length})</p>
                  <p className="text-[10px] text-rose-400/80 mt-0.5 font-mono">No YOLO weights registered: {missingFaceList.slice(0,2).map(m=>m.name).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Low Quality Alert */}
            {lowQualityFaceList.length > 0 && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Low Quality Facial Snaps ({lowQualityFaceList.length})</p>
                  <p className="text-[10px] text-amber-400/80 mt-0.5 font-mono">Confidence below 90%: {lowQualityFaceList.slice(0,2).map(l=>l.name).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Low Attendance Alert */}
            {lowAttendanceList.length > 0 && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Attendance Below SLA Limit ({lowAttendanceList.length})</p>
                  <p className="text-[10px] text-rose-400/80 mt-0.5 font-mono">Below 75% boundary: {lowAttendanceList.slice(0,2).map(la=>`${la.name} (${la.attendanceRate}%)`).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTERING & CONTROLS CONTROL BOARD */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
            <input
              id="student-glob-search"
              type="text"
              placeholder="Search by name, email, student ID, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/80 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Reset and Quick controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* View Mode Toggle */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-1 flex items-center space-x-1 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Linear Table"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Bento Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>

        {/* Advanced Selectors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-1">
          
          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Research & Dev">Research & Dev</option>
              <option value="Operations">Operations</option>
              <option value="Product Management">Product Management</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Year Group</label>
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* Attendance Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Attendance SLA</label>
            <select
              value={attendanceFilter}
              onChange={(e) => { setAttendanceFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Records</option>
              <option value="below_75">Below Threshold (&lt;75%)</option>
              <option value="above_75">Optimal Attendance (&gt;=75%)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Face Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Facial Quality</label>
            <select
              value={faceStatusFilter}
              onChange={(e) => { setFaceStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Enrolments</option>
              <option value="registered">Registered</option>
              <option value="unregistered">Not Registered</option>
              <option value="low_quality">Low Quality (&lt;90%)</option>
              <option value="multiple_samples">Multiple Samples (&gt;8)</option>
            </select>
          </div>

        </div>

      </div>

      {/* RENDER TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              
              {/* Sticky Header */}
              <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-850 text-slate-400 font-mono uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-4 px-5 w-10">
                    <input 
                      type="checkbox"
                      onChange={handleSelectAllRows}
                      checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedRowIds.includes(s.id))}
                      className="rounded border-slate-800 text-blue-500 focus:ring-blue-500 bg-slate-950"
                    />
                  </th>
                  <th className="py-4 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                    Student Name / ID {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-4 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('department')}>
                    Department {sortField === 'department' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-4 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('year')}>
                    Year & Sec {sortField === 'year' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-4 px-4">Contact Details</th>
                  <th className="py-4 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('registrationDate')}>
                    Enroll Date {sortField === 'registrationDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-4 px-4 cursor-pointer text-center hover:text-white transition-colors" onClick={() => handleSort('attendanceRate')}>
                    Attendance % {sortField === 'attendanceRate' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-4 px-4">Biometrics Badge</th>
                  <th className="py-4 px-4 cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-850/50">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 italic">
                      No student records matched the filtered biometric constraints.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => {
                    const isSelected = selectedRowIds.includes(student.id);
                    
                    return (
                      <motion.tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-900/40 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-blue-600/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(student.id, e.target.checked)}
                            className="rounded border-slate-800 text-blue-500 focus:ring-blue-500 bg-slate-950"
                          />
                        </td>

                        {/* Name / ID */}
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                              alt={student.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
                                {student.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {student.studentId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {student.department}
                        </td>

                        {/* Year & Sec */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                          {student.year} • {student.section}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                          <p className="text-slate-300 truncate max-w-[150px]">{student.email}</p>
                          <p className="text-slate-500 font-mono text-[10px]">{student.phone}</p>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {student.registrationDate}
                        </td>

                        {/* Attendance % */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className={`font-bold ${
                            student.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {student.attendanceRate.toFixed(1)}%
                          </span>
                        </td>

                        {/* Biometrics Badge */}
                        <td className="py-3.5 px-4">
                          {student.faceStatus === 'unregistered' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-[10px] font-bold text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Face Not Registered</span>
                            </span>
                          )}
                          {student.faceStatus === 'low_quality' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-[10px] font-bold text-amber-400 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Low Quality Face</span>
                            </span>
                          )}
                          {student.faceStatus === 'multiple_samples' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-bold text-indigo-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Multiple Samples ({student.imagesCount})</span>
                            </span>
                          )}
                          {student.faceStatus === 'registered' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Face Registered</span>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold border ${
                            student.status === 'active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {student.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => handleOpenEditModal(student, e)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Student Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleEmailStudent(student.name, student.email, e)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Send biometrics alert"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDownloadReport(student.name, e)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Download Report"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(student.id, student.name, e)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete Enrolment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </motion.tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Showing <span className="text-white font-bold">{(page - 1) * itemsPerPage + 1}</span> to <span className="text-white font-bold">{Math.min(page * itemsPerPage, sortedStudents.length)}</span> of <span className="text-white font-bold">{sortedStudents.length}</span> students
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* RENDER GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedStudents.length === 0 ? (
            <div className="col-span-full bg-[#111827] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No matching biometrics records located. Click "Add Student" to enroll a new user.
            </div>
          ) : (
            paginatedStudents.map((student) => (
              <motion.div
                key={student.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedStudent(student)}
                className="bg-slate-900/50 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-lg relative flex flex-col justify-between group cursor-pointer transition-all"
              >
                {/* Status Badges */}
                <div className="flex justify-between items-center absolute top-4 left-4 right-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider font-bold border ${
                    student.status === 'active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {student.status}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                    {student.year}
                  </span>
                </div>

                {/* Core Profile */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-3.5">
                    <img 
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                      alt={student.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                    />
                    <div className="min-w-0">
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{student.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{student.studentId}</p>
                    </div>
                  </div>

                  {/* Quick Detail Boxes */}
                  <div className="space-y-2 bg-slate-950/40 border border-slate-850/40 p-3 rounded-xl text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <span className="text-slate-300 font-bold truncate max-w-[120px]">{student.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Phone:</span>
                      <span className="text-slate-300 truncate max-w-[120px] font-mono">{student.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Attendance Rate:</span>
                      <span className={`font-bold font-mono ${
                        student.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>{student.attendanceRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Face status badge */}
                  <div>
                    {student.faceStatus === 'unregistered' && (
                      <span className="block text-center py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] font-bold text-rose-400">
                        Face Not Registered
                      </span>
                    )}
                    {student.faceStatus === 'low_quality' && (
                      <span className="block text-center py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-[10px] font-bold text-amber-400">
                        Low Quality Face ({student.faceQualityScore.toFixed(0)}%)
                      </span>
                    )}
                    {student.faceStatus === 'multiple_samples' && (
                      <span className="block text-center py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-bold text-indigo-400">
                        Multiple Samples ({student.imagesCount})
                      </span>
                    )}
                    {student.faceStatus === 'registered' && (
                      <span className="block text-center py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                        Face Registered
                      </span>
                    )}
                  </div>

                </div>

                {/* Footer buttons */}
                <div className="border-t border-slate-800/80 mt-4 pt-3 flex items-center justify-between" onClick={e=>e.stopPropagation()}>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => handleOpenEditModal(student, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(student.id, student.name, e)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      title="Delete Enrolment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))
          )}
        </div>
      )}

      {/* FLOATING ACTION CONTROL BAR FOR MULTI-SELECTION */}
      <AnimatePresence>
        {selectedRowIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md z-40 flex items-center space-x-6"
          >
            <div className="text-xs font-mono">
              <span className="text-blue-400 font-bold">{selectedRowIds.length}</span> students selected
            </div>

            <div className="h-4 w-[1px] bg-slate-850" />

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkEmail}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Selected</span>
              </button>

              <button
                onClick={handleBulkExport}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Selected</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-950/80 border border-rose-900/50 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Selected</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedRowIds([])}
              className="p-1 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STUDENT DETAILS SLIDE OUT DRAWER */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out drawer container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-slate-950 border-l border-slate-850 shadow-2xl z-50 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              
              {/* Drawer Content Body */}
              <div className="p-6 space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Telemetry ID: {selectedStudent.id}</span>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Large Card */}
                <div className="text-center space-y-4 pt-2">
                  <div className="relative inline-block">
                    <img 
                      src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                      alt={selectedStudent.name}
                      className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-slate-800 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute bottom-0 right-2 w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                      selectedStudent.imagesCount === 0 ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    }`}>
                      {selectedStudent.imagesCount === 0 ? '!' : '✓'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">{selectedStudent.studentId} • {selectedStudent.role || 'Staff Operative'}</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded text-slate-400">
                        {selectedStudent.year}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded text-slate-400">
                        Sec {selectedStudent.section}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        selectedStudent.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics Box */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Attendance SLA</p>
                    <p className={`text-xl font-mono font-bold mt-1 ${
                      selectedStudent.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>{selectedStudent.attendanceRate.toFixed(1)}%</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Below 75% triggers alert</p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Face Vector Accuracy</p>
                    <p className="text-xl font-mono text-blue-400 font-bold mt-1">{(selectedStudent.faceQualityScore || selectedStudent.faceConfidence || 95).toFixed(1)}%</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">FIPS 201 criteria compliant</p>
                  </div>
                </div>

                {/* Expanded Details List */}
                <div className="space-y-3 bg-slate-900/40 border border-slate-850/80 p-4.5 rounded-2xl text-xs">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-2">
                    Profile Data Audit
                  </h4>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Department</span>
                    <span className="text-white font-semibold">{selectedStudent.department}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                    <span className="text-white font-semibold truncate max-w-[200px]">{selectedStudent.email}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
                    <span className="text-white font-semibold font-mono">{selectedStudent.phone}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Residence</span>
                    <span className="text-white font-semibold text-right max-w-[220px]">{selectedStudent.address}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5" /> Guardian</span>
                    <span className="text-white font-semibold">{selectedStudent.guardianName}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Guardian Tel</span>
                    <span className="text-white font-semibold font-mono">{selectedStudent.guardianContact}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-blue-400" /> Vector Scans</span>
                    <span className="text-blue-400 font-bold font-mono">{selectedStudent.imagesCount} frames enrolled</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-indigo-400" /> Auth Nodes</span>
                    <span className="text-slate-400 truncate max-w-[200px] font-mono">{selectedStudent.registeredDevices.join(', ')}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Last Seen HUD</span>
                    <span className="text-emerald-400 font-mono font-bold text-[10px]">{selectedStudent.lastRecognition}</span>
                  </div>
                </div>

                {/* Face Images / Bounding Boxes Simulation */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    Enrolled Facial Biometrics Reference
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center group">
                        {selectedStudent.imagesCount === 0 ? (
                          <UserX className="w-6 h-6 text-slate-600" />
                        ) : (
                          <>
                            <img 
                              src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                              alt="Biometric frame" 
                              className="w-full h-full object-cover filter brightness-[0.7] contrast-125"
                              referrerPolicy="no-referrer"
                            />
                            {/* Face scanner bounding box simulation */}
                            <div className="absolute inset-2.5 border border-cyan-400/60 rounded pointer-events-none">
                              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-cyan-400" />
                              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400" />
                              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-cyan-400" />
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-cyan-400" />
                              <span className="absolute bottom-0.5 left-0.5 text-[6px] font-mono bg-cyan-950 text-cyan-400 px-0.5 scale-75 origin-bottom-left">99.4%</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recognition History log */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    Recent Verification Telemetry
                  </h4>
                  <div className="space-y-2 font-mono text-[10px] text-slate-400">
                    <div className="p-2.5 bg-slate-900/50 border border-slate-850 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">Lobby Main Cam Gate-1</p>
                        <p className="text-slate-500 mt-0.5">Verified matching criteria</p>
                      </div>
                      <span className="text-emerald-400 font-bold">Today 08:12 AM</span>
                    </div>

                    <div className="p-2.5 bg-slate-900/50 border border-slate-850 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">Research Labs Entrance-2</p>
                        <p className="text-slate-500 mt-0.5">YOLO anchor verified</p>
                      </div>
                      <span className="text-emerald-400 font-bold">Yesterday 04:30 PM</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer bottom control strip */}
              <div className="p-6 bg-slate-950 border-t border-slate-850 flex flex-col gap-3">
                {onNavigate && onSelectStudentId && (
                  <button
                    onClick={() => {
                      onSelectStudentId(selectedStudent.id);
                      onNavigate('student-profile');
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all cursor-pointer text-center flex items-center justify-center gap-2 border border-blue-500/30"
                  >
                    <FolderSync className="w-3.5 h-3.5" />
                    <span>Open Immersive Identity Dossier</span>
                  </button>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenEditModal(selectedStudent)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Edit Student
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedStudent.id, selectedStudent.name)}
                    className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900/40 border border-rose-900 text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FORM MODAL (ADD & EDIT STUDENT) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-slate-950 border border-slate-850 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-850 flex items-center justify-between bg-slate-950/90 backdrop-blur">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {editingStudent ? 'Edit Student facial profile' : 'Enroll New student biometrics'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Complete FIPS-compliant database fields.</p>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form container scroll area */}
              <form onSubmit={handleSaveStudent} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                
                {/* ID warnings */}
                {enrichedStudents.some(s => s.studentId === formId && (!editingStudent || editingStudent.id !== s.id)) && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl flex items-center space-x-2 text-xs text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Duplicate Warning: ID "{formId}" is already assigned to an enrolled student!</span>
                  </div>
                )}

                {/* Section A: Photo & Identity */}
                <div className="bg-slate-900/30 border border-slate-850/60 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 border-b border-slate-850 pb-1.5">
                    Biometric Capture & Avatar
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Avatar preview */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        {formAvatarUrl ? (
                          <img 
                            src={formAvatarUrl} 
                            alt="Upload preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Fingerprint className="w-10 h-10 text-slate-700 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Simulation buttons */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleSimulatePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Profile photo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormAvatarUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');
                            setFormImagesCount(5);
                            setFormConfidence(98.4);
                            triggerNotification('Facial scan coordinates computed directly.', 'success');
                          }}
                          className="px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>Capture via WebCam</span>
                        </button>
                      </div>

                      {/* Progress bar */}
                      {isUploadingPhoto && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">Running local neural coordinate generation... {uploadProgress}%</p>
                        </div>
                      )}

                      {/* Capture Later option */}
                      <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer pt-1">
                        <input 
                          type="checkbox"
                          checked={formCaptureFaceLater}
                          onChange={(e) => setFormCaptureFaceLater(e.target.checked)}
                          className="rounded border-slate-800 text-blue-500 focus:ring-blue-500 bg-slate-950"
                        />
                        <span>Defer facial coordinates capture (Capture Face Later)</span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Section B: General Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Student ID *</label>
                    <input
                      type="text"
                      required
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Corporate Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Research & Dev">Research & Dev</option>
                      <option value="Operations">Operations</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Role Designation</label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Year Group</label>
                      <select
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Section</label>
                      <select
                        value={formSection}
                        onChange={(e) => setFormSection(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">Active (Verified matching)</option>
                      <option value="inactive">Inactive (Bypassed)</option>
                    </select>
                  </div>
                </div>

                {/* Section C: Contact & Guardian Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Phone Tel</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Residence Address</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Guardian Full Name</label>
                    <input
                      type="text"
                      value={formGuardianName}
                      onChange={(e) => setFormGuardianName(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Guardian Contact Tel</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formGuardianContact}
                      onChange={(e) => setFormGuardianContact(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

              </form>

              {/* Footer Actions */}
              <div className="px-6 py-4.5 bg-slate-950 border-t border-slate-850 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudent}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK IMPORT MODAL (DRAG & DROP CSV WIZARD) */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-950 border border-slate-850 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-10 p-6 space-y-6"
            >
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">Biometrics Batch CSV Import</h3>
                  <p className="text-xs text-slate-500">Fast-upload bulk coordinate sheets easily.</p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic steps layout */}
              {importStage === 'idle' && (
                <div className="space-y-4">
                  {/* Drag drop area */}
                  <div 
                    onClick={handleStartSimulatedImport}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-900/20 hover:bg-slate-900/40 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3"
                  >
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Drag & drop CSV or Excel spreadsheet here</p>
                      <p className="text-[10px] text-slate-500 mt-1">Or click to browse from local computer files</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/30 p-3.5 border border-slate-850 rounded-xl space-y-1 text-xs">
                    <p className="text-white font-semibold">Standard CSV Structure Criteria:</p>
                    <p className="text-slate-500 text-[10px] font-mono">studentId, fullName, email, department, year, section, phone</p>
                  </div>
                </div>
              )}

              {/* Upload progression */}
              {(importStage === 'uploading' || importStage === 'validating') && (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-blue-400 rounded-full flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {importStage === 'uploading' ? 'Parsing local CSV file...' : 'Running YOLO weight validations...'}
                    </h4>
                    <p className="text-[10px] text-slate-500">Checking column headers and validating student identifiers.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-100" style={{ width: `${importProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{importProgress}% complete</p>
                  </div>
                </div>
              )}

              {/* Complete summary step */}
              {importStage === 'summary' && importSummary && (
                <div className="space-y-4">
                  
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-300">
                      <p className="font-bold">Matrix verification complete!</p>
                      <p className="text-[10px] text-emerald-400/80 mt-1">Found <span className="text-white font-bold">{importSummary.count}</span> valid profile records. Ready to inject into active system database.</p>
                    </div>
                  </div>

                  {/* Micro list of imported items preview */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-[10px] divide-y divide-slate-850">
                    <div className="bg-slate-900 px-3 py-2 text-slate-400 font-bold flex justify-between">
                      <span>IDENTIFIER</span>
                      <span>STATUS</span>
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-slate-300">
                      <span>Miles Dyson Jr. (FV-IMP10)</span>
                      <span className="text-emerald-400 font-bold">✓ VALID</span>
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-slate-300">
                      <span>T-1000 Liquid (FV-IMP11)</span>
                      <span className="text-emerald-400 font-bold">✓ VALID</span>
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-slate-300">
                      <span>Evelyn Wright (FV-IMP13)</span>
                      <span className="text-rose-400 font-bold">! NO SNAPSHOT</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Load into Active Database
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
