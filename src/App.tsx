import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_UNKNOWN_FACES, 
  INITIAL_ACTIVITIES, 
  INITIAL_USER 
} from './data/mockData';
import { 
  Student, 
  AttendanceRecord, 
  UnknownFace, 
  ActivityLog, 
  SystemStats, 
  CameraConfig, 
  AppUser 
} from './types';

// Components & Sidebars
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages Import
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import FaceRegistration from './pages/FaceRegistration';
import LiveRecognition from './pages/LiveRecognition';
import AttendanceHistory from './pages/AttendanceHistory';
import AnalyticsView from './pages/AnalyticsView';
import UnknownFaces from './pages/UnknownFaces';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import ProfileView from './pages/ProfileView';
import NotificationsView from './pages/NotificationsView';
import StudentProfile from './pages/StudentProfile';
import UserRoles from './pages/UserRoles';
import SuperAdmin from './pages/SuperAdmin';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CameraManagement from './pages/CameraManagement';
import ClassroomManagement from './pages/ClassroomManagement';
import TimetableAttendance from './pages/TimetableAttendance';
import AiSecurityCenter from './pages/AiSecurityCenter';
import SystemMonitoring from './pages/SystemMonitoring';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForcedMode, setAuthForcedMode] = useState<'session-expired' | 'access-denied' | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Core Central Databases
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [unknownFaces, setUnknownFaces] = useState<UnknownFace[]>(INITIAL_UNKNOWN_FACES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  // Search filter query state passed down to subpages
  const [searchQuery, setSearchQuery] = useState('');

  // Camera settings
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>({
    deviceId: 'default',
    resolution: '1280x720',
    fps: 30,
    confidenceThreshold: 0.90,
    recognitionInterval: 1000,
    enableUnknownAlerts: true,
    modelType: 'YOLOv8-Face'
  });

  // Session Recovery
  useEffect(() => {
    const cached = localStorage.getItem('facevision_session');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AppUser;
        setUser(parsed);
        const startPage = parsed.role === 'Student' ? 'student-dashboard' : 'dashboard';
        setCurrentPage(startPage);
      } catch (err) {
        console.error('Session restoring aborted', err);
      }
    }
  }, []);

  // Inactivity Auto-Logout Tracker (5 Minutes Compliance)
  useEffect(() => {
    if (!user) return;

    let lastActivity = Date.now();
    const handleActivity = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - lastActivity) / 1000;
      if (elapsedSeconds >= 300) { // 5 minutes
        setUser(null);
        localStorage.removeItem('facevision_session');
        setAuthForcedMode('session-expired');
        setAuthMode('login');
        setCurrentPage('auth');
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [user]);

  // Secure Navigation Gate (Role-Based Access Guard)
  const navigateToPage = (pageId: string) => {
    const pagePermissions: Record<string, string[]> = {
      'live-recognition': ['Super Admin', 'Admin', 'Security'],
      'face-registration': ['Super Admin', 'Admin'],
      'students': ['Super Admin', 'Admin', 'Faculty'],
      'student-profile': ['Super Admin', 'Admin', 'Faculty', 'Student'],
      'analytics': ['Super Admin', 'Admin', 'Faculty'],
      'unknown-faces': ['Super Admin', 'Admin', 'Security'],
      'reports': ['Super Admin', 'Admin', 'Faculty'],
      'settings': ['Super Admin', 'Admin'],
      'user-roles': ['Super Admin'],
      'super-admin': ['Super Admin'],
      'faculty-dashboard': ['Super Admin', 'Admin', 'Faculty'],
      'student-dashboard': ['Super Admin', 'Admin', 'Student']
    };

    if (user && pagePermissions[pageId] && !pagePermissions[pageId].includes(user.role)) {
      setAuthForcedMode('access-denied');
      setCurrentPage('auth');
      return;
    }

    // Special customization: Students are automatically locked to their own profiles
    if (user && user.role === 'Student' && pageId === 'student-profile') {
      setSelectedStudentId('st-101'); // Force John Connor's profile mapping
    }

    setCurrentPage(pageId);
    setAuthForcedMode(null);
  };

  // Automatically authenticate for direct access from Landing "Demo" button
  const handleEnterDemo = () => {
    setUser(INITIAL_USER);
    setCurrentPage('dashboard');
    setAuthForcedMode(null);
    
    // Log demo access
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: INITIAL_USER.email,
      action: 'Session Initialization',
      status: 'success',
      details: 'Guest operator logged in via instant Landing demo portal.'
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleEnterLogin = () => {
    setAuthMode('login');
    setAuthForcedMode(null);
    setCurrentPage('auth');
  };

  const handleAuthSuccess = (authenticatedUser: AppUser) => {
    setUser(authenticatedUser);
    const startPage = authenticatedUser.role === 'Student' ? 'student-dashboard' : 'dashboard';
    setCurrentPage(startPage);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: authenticatedUser.email,
      action: 'Session Authentication',
      status: 'success',
      details: `Operator ${authenticatedUser.name} authenticated via FaceVision main gateway.`
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('landing');
    setSearchQuery('');
  };

  // State modification callbacks - Students
  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'registrationDate' | 'faceConfidence'>) => {
    const studentWithMeta: Student = {
      ...newStudentData,
      id: `st-${Date.now()}`,
      registrationDate: new Date().toISOString().split('T')[0],
      faceConfidence: Math.floor(92 + Math.random() * 7), // 92-99% simulated baseline
      avatarUrl: newStudentData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };

    setStudents(prev => [studentWithMeta, ...prev]);

    // Create system log
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.email || 'System Monitor',
      action: 'Add Student Profile',
      status: 'success',
      details: `Registered profile "${studentWithMeta.name}" under division "${studentWithMeta.department}".`
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.email || 'System Monitor',
      action: 'Edit Student Profile',
      status: 'info',
      details: `Modified operator profile details for ID ${updatedStudent.studentId} (${updatedStudent.name}).`
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.email || 'System Monitor',
      action: 'Delete Student Profile',
      status: 'danger',
      details: `Deleted biometrics profile for student "${student?.name || 'Unknown'}" (${student?.studentId || 'N/A'}).`
    };
    setActivities(prev => [log, ...prev]);
  };

  // State callbacks - Biometrics Enrollments
  const handleCompleteRegistration = (studentId: string, snapshotsCount: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          imagesCount: s.imagesCount + snapshotsCount,
          faceConfidence: Math.min(99.9, s.faceConfidence + 1.2)
        };
      }
      return s;
    }));

    const targetStudent = students.find(s => s.id === studentId);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.email || 'System Monitor',
      action: 'Enroll Biometrics',
      status: 'success',
      details: `Enrolled ${snapshotsCount} biometric snapshots coordinates for ${targetStudent?.name || 'Staff'}.`
    };
    setActivities(prev => [log, ...prev]);
  };

  // State callbacks - Attendance Matching Loggers
  const handleAddAttendanceRecord = (newRecordData: Omit<AttendanceRecord, 'id'>) => {
    const fullRecord: AttendanceRecord = {
      ...newRecordData,
      id: `att-${Date.now()}`
    };

    setAttendance(prev => [fullRecord, ...prev]);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Surveillance Node',
      action: 'Attendance Verified',
      status: 'success',
      details: `Check-in logged: ${fullRecord.studentName} (${fullRecord.status.toUpperCase()}) with ${fullRecord.confidence}% confidence.`
    };
    setActivities(prev => [log, ...prev]);
  };

  // State callbacks - Incidents & Alarms
  const handleAddUnknownAlert = (face: UnknownFace) => {
    setUnknownFaces(prev => [face, ...prev]);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'YOLOv8 Engine',
      action: 'Anomalous Threat Spot',
      status: 'warning',
      details: `Unregistered threat vector intercepted at ${face.cameraLocation}. Similarity: ${(face.confidence * 100).toFixed(1)}%.`
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleResolveUnknownFace = (id: string, name?: string, action?: 'register' | 'link' | 'ignore') => {
    const alert = unknownFaces.find(u => u.id === id);

    if (action === 'ignore') {
      setUnknownFaces(prev => prev.filter(u => u.id !== id));
      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: user?.email || 'Operator',
        action: 'Incident De-escalated',
        status: 'info',
        details: `Archived unidentified alert ID ${id} at ${alert?.cameraLocation}.`
      };
      setActivities(prev => [log, ...prev]);
    } else if (action === 'link' && name) {
      setUnknownFaces(prev => prev.filter(u => u.id !== id));
      
      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: user?.email || 'Operator',
        action: 'Incident Associated',
        status: 'success',
        details: `Linked threat vector ID ${id} with registered operator folder "${name}".`
      };
      setActivities(prev => [log, ...prev]);
    }
  };

  const handleSaveConfig = (newConfig: CameraConfig) => {
    setCameraConfig(newConfig);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.email || 'Operator',
      action: 'Engine Tune Weights',
      status: 'info',
      details: `Hot-reloaded model parameters: resolution to ${newConfig.resolution} and threshold boundaries to ${newConfig.confidenceThreshold}.`
    };
    setActivities(prev => [log, ...prev]);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUser(updatedUser);

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: updatedUser.email,
      action: 'Update Operator Profile',
      status: 'success',
      details: `Modified administrator metadata tags for ${updatedUser.name}.`
    };
    setActivities(prev => [log, ...prev]);
  };

  // Compute stats on demand based on local arrays
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = Math.max(0, students.filter(s => s.status === 'active').length - presentCount - lateCount);
  const totalActives = students.filter(s => s.status === 'active').length || 1;
  const todayAttendanceRate = Math.round(((presentCount + lateCount) / totalActives) * 100);

  const stats: SystemStats = {
    todayAttendanceRate,
    presentCount,
    absentCount,
    lateCount,
    accuracyRate: 99.4,
    registeredFaces: students.length,
    unknownFacesCount: unknownFaces.length,
    systemHealth: 'optimal'
  };

  // Navigation title lookup
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Command Telemetry';
      case 'live-recognition': return 'Surveillance Room';
      case 'ai-security': return 'AI Security Center';
      case 'camera-management': return 'Camera Management';
      case 'classroom-management': return 'Classroom & Room Management';
      case 'timetable-attendance': return 'Academic Timetable & Period Attendance';
      case 'face-registration': return 'Biometric Enroller';
      case 'students': return 'Corporate Identity database';
      case 'attendance': return 'Surveillance Audit History';
      case 'analytics': return 'Business Intelligence Trends';
      case 'unknown-faces': return 'Active Biometric Incidents';
      case 'reports': return 'Formulas and Reports Compiler';
      case 'notifications': return 'Biometric Transmission Hub';
      case 'settings': return 'System Engine Weights';
      case 'profile': return 'User Profile Details';
      case 'student-profile': return 'Student Profile Dossier';
      case 'user-roles': return 'Security Clearances Console';
      case 'super-admin': return 'Super Admin Command Console';
      case 'faculty-dashboard': return 'Faculty Dashboard';
      case 'student-dashboard': return 'Student Dashboard';
      default: return 'FaceVision AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 antialiased overflow-x-hidden">
      
      {/* Route Render Strategy */}
      <AnimatePresence mode="wait">
        
        {/* Landing Page */}
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Landing onEnterApp={handleEnterDemo} onEnterLogin={handleEnterLogin} />
          </motion.div>
        )}

        {/* Authentication Page */}
        {currentPage === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Auth 
              initialMode={authMode} 
              forcedMode={authForcedMode}
              currentUser={user}
              onAuthSuccess={handleAuthSuccess} 
              onBackToLanding={() => {
                setUser(null);
                localStorage.removeItem('facevision_session');
                setCurrentPage('landing');
                setAuthForcedMode(null);
              }} 
            />
          </motion.div>
        )}

        {/* Authenticated Dashboard Shell Layout */}
        {user && currentPage !== 'landing' && currentPage !== 'auth' && (
          <div key="app-shell" className="flex min-h-screen">
            
            {/* Left Hand Navigation Rail */}
            <Sidebar 
              currentPage={currentPage} 
              setCurrentPage={navigateToPage} 
              user={user} 
              onSignOut={handleSignOut} 
              unknownFacesCount={stats.unknownFacesCount}
            />

            {/* Right Hand Workspace Viewport */}
            <div className="flex-1 pl-64 flex flex-col min-h-screen">
              
              <Header 
                currentPageTitle={getPageTitle()} 
                user={user} 
                activities={activities} 
                onSearch={setSearchQuery} 
                systemHealth={stats.systemHealth}
                onNavigate={navigateToPage}
              />

              {/* Dynamic Workspace Container */}
              <main className="p-8 flex-1 bg-[#020617]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentPage === 'dashboard' && (
                      <Dashboard 
                        stats={stats}
                        students={students}
                        attendance={attendance}
                        unknownFaces={unknownFaces}
                        activities={activities}
                        onFaceDetected={(name, conf, isUnk, det) => {
                          const now = new Date();
                          if (isUnk) {
                            handleAddUnknownAlert({
                              id: `uk-${now.getTime()}`,
                              timestamp: now.toISOString(),
                              imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
                              confidence: conf,
                              cameraLocation: 'Lobby Entrance (Cam-01)',
                              status: 'unresolved'
                            });
                          } else {
                            handleAddAttendanceRecord({
                              studentId: `FV-2026-0${Math.floor(10 + Math.random() * 80)}`,
                              studentName: name,
                              department: 'Engineering',
                              timestamp: now.toISOString(),
                              status: 'present',
                              confidence: +(conf * 100).toFixed(1),
                              verificationType: 'face',
                              temperature: '98.1°F',
                              maskWorn: false
                            });
                          }
                        }}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'students' && (
                      <StudentManagement 
                        students={students}
                        onAddStudent={handleAddStudent}
                        onEditStudent={handleEditStudent}
                        onDeleteStudent={handleDeleteStudent}
                        onNavigate={navigateToPage}
                        onSelectStudentId={setSelectedStudentId}
                      />
                    )}

                    {currentPage === 'face-registration' && (
                      <FaceRegistration 
                        students={students}
                        onCompleteRegistration={handleCompleteRegistration}
                      />
                    )}

                    {currentPage === 'live-recognition' && (
                      <LiveRecognition 
                        onAddRecognitionLog={handleAddAttendanceRecord}
                        onAddUnknownAlert={handleAddUnknownAlert}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'ai-security' && (
                      <AiSecurityCenter />
                    )}

                    {currentPage === 'camera-management' && (
                      <CameraManagement 
                        students={students}
                        onAddRecognitionLog={handleAddAttendanceRecord}
                        onAddUnknownAlert={handleAddUnknownAlert}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'classroom-management' && (
                      <ClassroomManagement 
                        students={students}
                        onAddRecognitionLog={handleAddAttendanceRecord}
                        onAddUnknownAlert={handleAddUnknownAlert}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'timetable-attendance' && (
                      <TimetableAttendance 
                        students={students}
                        onAddRecognitionLog={handleAddAttendanceRecord}
                        onAddUnknownAlert={handleAddUnknownAlert}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'attendance' && (
                      <AttendanceHistory 
                        attendance={attendance}
                        students={students}
                        onAddAttendanceRecord={handleAddAttendanceRecord}
                      />
                    )}

                    {currentPage === 'analytics' && (
                      <AnalyticsView />
                    )}

                    {currentPage === 'unknown-faces' && (
                      <UnknownFaces 
                        unknownFaces={unknownFaces}
                        students={students}
                        onResolveUnknownFace={handleResolveUnknownFace}
                        onNavigate={navigateToPage}
                      />
                    )}

                    {currentPage === 'reports' && (
                      <ReportsView 
                        students={students}
                        attendance={attendance}
                      />
                    )}

                    {currentPage === 'user-roles' && (
                      <UserRoles />
                    )}

                    {currentPage === 'super-admin' && (
                      <SuperAdmin />
                    )}

                    {currentPage === 'system-monitoring' && (
                      <SystemMonitoring />
                    )}

                    {currentPage === 'faculty-dashboard' && (
                      <FacultyDashboard />
                    )}

                    {currentPage === 'student-dashboard' && (
                      <StudentDashboard />
                    )}

                    {currentPage === 'notifications' && (
                      <NotificationsView />
                    )}

                    {currentPage === 'settings' && (
                      <SettingsView 
                        config={cameraConfig}
                        onSaveConfig={handleSaveConfig}
                      />
                    )}

                    {currentPage === 'profile' && (
                      <ProfileView 
                        user={user}
                        activities={activities}
                        onUpdateUser={handleUpdateUser}
                      />
                    )}

                    {currentPage === 'student-profile' && (
                      <StudentProfile 
                        students={students}
                        attendance={attendance}
                        onNavigate={navigateToPage}
                        selectedStudentId={selectedStudentId}
                        onSelectStudentId={setSelectedStudentId}
                        onEditStudent={handleEditStudent}
                        onDeleteStudent={handleDeleteStudent}
                      />
                    )}

                  </motion.div>
                </AnimatePresence>
              </main>

            </div>

          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
