import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Activity, 
  Sliders, 
  UserX, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Terminal, 
  ArrowRight,
  Database,
  Play,
  Square,
  Maximize2,
  Settings,
  RefreshCw,
  Video,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Gauge,
  Cpu,
  Tv,
  ListFilter,
  UserPlus,
  Eye,
  Trash2,
  X,
  SlidersHorizontal,
  Plus,
  Compass,
  AlertCircle,
  Mail,
  Phone,
  Heart,
  Award,
  Calendar,
  Hash,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { AttendanceRecord, UnknownFace } from '../types';

interface LiveRecognitionProps {
  onAddRecognitionLog: (record: AttendanceRecord) => void;
  onAddUnknownAlert: (face: UnknownFace) => void;
  onNavigate: (page: string) => void;
}

// Simulated Student details structure matching active tracking HUD
interface RecognizedStudent {
  name: string;
  studentId: string;
  department: string;
  year: string;
  section: string;
  avatarUrl: string;
  confidence: number;
  qualityScore: number;
  distance: number;
  status: 'present' | 'already-marked' | 'late' | 'absent';
  timestamp: string;
  isUnknown: boolean;
  rollNumber?: string;
  course?: string;
  branch?: string;
  group?: string;
  semester?: string;
  class?: string;
  batch?: string;
  email?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  attendancePercentage?: number;
  lastAttendance?: string;
  registrationDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceDuration?: string;
  trackingId?: string;
}

// Pre-defined database of simulated individuals
const simulatedDatabase: RecognizedStudent[] = [
  {
    name: 'Sarah Connor',
    studentId: 'FV-2026-042',
    department: 'Biomechanical Eng.',
    year: '4th Year',
    section: 'Division Alpha',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    confidence: 99.4,
    qualityScore: 97,
    distance: 1.1,
    status: 'present',
    timestamp: '',
    isUnknown: false,
    rollNumber: 'ROLL-2026-042',
    course: 'B.Tech Robotics & cybernetics',
    branch: 'Biomechanical Engineering',
    group: 'Group G-01',
    semester: '8th Semester',
    class: 'Room L-402',
    batch: '2023 - 2027',
    email: 'sarah.connor@facevision.edu',
    phone: '+1 (555) 382-9012',
    guardianName: 'Mary Connor',
    guardianPhone: '+1 (555) 382-9013',
    bloodGroup: 'A-Positive',
    attendancePercentage: 96.8,
    lastAttendance: 'Yesterday, 10:45 AM',
    registrationDate: '2023-08-15',
    checkInTime: '08:30:12 AM',
    checkOutTime: '04:30:00 PM',
    attendanceDuration: '8 hours',
    trackingId: 'TRK-0429'
  },
  {
    name: 'John Connor',
    studentId: 'FV-2026-089',
    department: 'Tactical Cybernetics',
    year: '3rd Year',
    section: 'Division Beta',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    confidence: 98.7,
    qualityScore: 93,
    distance: 0.9,
    status: 'already-marked',
    timestamp: '',
    isUnknown: false,
    rollNumber: 'ROLL-2026-089',
    course: 'B.Sc Cybernetic Offense',
    branch: 'Tactical Systems',
    group: 'Group G-02',
    semester: '6th Semester',
    class: 'Room L-204',
    batch: '2023 - 2027',
    email: 'john.connor@facevision.edu',
    phone: '+1 (555) 893-2104',
    guardianName: 'Sarah Connor',
    guardianPhone: '+1 (555) 382-9012',
    bloodGroup: 'O-Negative',
    attendancePercentage: 88.5,
    lastAttendance: 'Today, 09:15 AM',
    registrationDate: '2023-09-01',
    checkInTime: '09:15:05 AM',
    checkOutTime: '05:15:00 PM',
    attendanceDuration: '8 hours',
    trackingId: 'TRK-0891'
  },
  {
    name: 'Miles Dyson',
    studentId: 'FV-2026-105',
    department: 'Neural Network Systems',
    year: '4th Year',
    section: 'Division Alpha',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    confidence: 91.2,
    qualityScore: 89,
    distance: 1.5,
    status: 'late',
    timestamp: '',
    isUnknown: false,
    rollNumber: 'ROLL-2026-105',
    course: 'Ph.D Machine Architectures',
    branch: 'Neural Networks',
    group: 'Group R-01',
    semester: 'PostGrad Year 2',
    class: 'Neural Research Lab 10',
    batch: '2024 - 2028',
    email: 'miles.dyson@facevision.edu',
    phone: '+1 (555) 456-7890',
    guardianName: 'Tarissa Dyson',
    guardianPhone: '+1 (555) 456-7891',
    bloodGroup: 'B-Positive',
    attendancePercentage: 99.1,
    lastAttendance: 'Today, 10:44 AM',
    registrationDate: '2024-01-15',
    checkInTime: '10:44:50 AM',
    checkOutTime: '06:44:50 PM',
    attendanceDuration: '8 hours',
    trackingId: 'TRK-1052'
  },
  {
    name: 'Unknown Individual',
    studentId: 'UNKNOWN-000',
    department: 'N/A',
    year: 'N/A',
    section: 'N/A',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    confidence: 42.1,
    qualityScore: 78,
    distance: 1.8,
    status: 'absent',
    timestamp: '',
    isUnknown: true,
    rollNumber: 'N/A',
    course: 'N/A',
    branch: 'N/A',
    group: 'N/A',
    semester: 'N/A',
    class: 'N/A',
    batch: 'N/A',
    email: 'N/A',
    phone: 'N/A',
    guardianName: 'N/A',
    guardianPhone: 'N/A',
    bloodGroup: 'N/A',
    attendancePercentage: 0,
    lastAttendance: 'Never',
    registrationDate: 'N/A',
    checkInTime: 'N/A',
    checkOutTime: 'N/A',
    attendanceDuration: 'N/A',
    trackingId: 'TRK-9999'
  },
  {
    name: 'Marcus Wright',
    studentId: 'FV-2026-312',
    department: 'Automated Prosthetics',
    year: '2nd Year',
    section: 'Division Delta',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    confidence: 95.8,
    qualityScore: 91,
    distance: 1.3,
    status: 'present',
    timestamp: '',
    isUnknown: false,
    rollNumber: 'ROLL-2026-312',
    course: 'B.Tech Robotics & prosthetics',
    branch: 'Automated Systems',
    group: 'Group D-03',
    semester: '4th Semester',
    class: 'Room L-308',
    batch: '2024 - 2028',
    email: 'marcus.wright@facevision.edu',
    phone: '+1 (555) 723-4412',
    guardianName: 'Thomas Wright',
    guardianPhone: '+1 (555) 723-4413',
    bloodGroup: 'AB-Negative',
    attendancePercentage: 91.4,
    lastAttendance: '3 days ago',
    registrationDate: '2024-08-20',
    checkInTime: '08:45:22 AM',
    checkOutTime: '04:45:00 PM',
    attendanceDuration: '8 hours',
    trackingId: 'TRK-3124'
  },
  {
    name: 'Katherine Brewster',
    studentId: 'FV-2026-218',
    department: 'Aerospace Logistics',
    year: '4th Year',
    section: 'Division Gamma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    confidence: 96.5,
    qualityScore: 94,
    distance: 1.2,
    status: 'absent',
    timestamp: '',
    isUnknown: false,
    rollNumber: 'ROLL-2026-218',
    course: 'M.Tech Aerospace Logistics',
    branch: 'Aviation Management',
    group: 'Group C-02',
    semester: '2nd Semester',
    class: 'Aero Room 102',
    batch: '2025 - 2027',
    email: 'kate.brewster@facevision.edu',
    phone: '+1 (555) 541-0982',
    guardianName: 'Robert Brewster',
    guardianPhone: '+1 (555) 541-0983',
    bloodGroup: 'O-Positive',
    attendancePercentage: 95.2,
    lastAttendance: 'Last week',
    registrationDate: '2025-07-10',
    checkInTime: '09:00:10 AM',
    checkOutTime: '05:00:00 PM',
    attendanceDuration: '8 hours',
    trackingId: 'TRK-2186'
  }
];

export default function LiveRecognition({
  onAddRecognitionLog,
  onAddUnknownAlert,
  onNavigate
}: LiveRecognitionProps) {
  
  // Recognition Control States
  const [isRecognizing, setIsRecognizing] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedDevice, setSelectedDevice] = useState<string>('Lobby Cam-01 (1080p FHD)');
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080 (16:9)');
  
  // Real Webcam Streams Setup
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(true); // Automatically open webcam on load
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Custom states for camera shutter flash & security clock
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeDossierTab, setActiveDossierTab] = useState<'biometrics' | 'academics' | 'contact' | 'attendance'>('biometrics');

  // Clock effect
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Camera settings adjustable sliders
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [fpsSetting, setFpsSetting] = useState<number>(60);
  const [autoFocus, setAutoFocus] = useState<boolean>(true);
  const [mirrorMode, setMirrorMode] = useState<boolean>(false);
  const [nightMode, setNightMode] = useState<boolean>(false);

  // Recognition algorithms sliders
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [recognitionThreshold, setRecognitionThreshold] = useState<number>(90);
  const [minFaceSize, setMinFaceSize] = useState<number>(80);
  const [maxFaceSize, setMaxFaceSize] = useState<number>(450);
  const [autoAttendance, setAutoAttendance] = useState<boolean>(true);
  const [duplicateTimeout, setDuplicateTimeout] = useState<number>(30); // in seconds

  // Live Statistics & Engine stats
  const [facesDetectedCount, setFacesDetectedCount] = useState<number>(1429);
  const [facesRecognizedCount, setFacesRecognizedCount] = useState<number>(1394);
  const [unknownFacesCount, setUnknownFacesCount] = useState<number>(35);
  const [accuracyToday, setAccuracyToday] = useState<number>(99.1);
  const [attendanceTodayCount, setAttendanceTodayCount] = useState<number>(248);
  const [currentFps, setCurrentFps] = useState<number>(59.6);

  // AI Hardware Telemetry Jitter
  const [gpuUsage, setGpuUsage] = useState<number>(42);
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [memUsage, setMemUsage] = useState<number>(64);
  const [inferenceTime, setInferenceTime] = useState<number>(12);
  const [embeddingTime, setEmbeddingTime] = useState<number>(8);

  // Active Recognition State Holders
  const [activeFace, setActiveFace] = useState<RecognizedStudent>(simulatedDatabase[0]);
  const [activeUnknown, setActiveUnknown] = useState<RecognizedStudent | null>(null);
  
  // Real-time scrolling event logs
  const [liveEvents, setLiveEvents] = useState<any[]>([
    { id: 'ev-1', time: '10:52:12', name: 'Sarah Connor', status: 'present', confidence: 99.4, camera: 'Lobby Cam-01', type: 'recognized' },
    { id: 'ev-2', time: '10:48:05', name: 'John Connor', status: 'already-marked', confidence: 98.7, camera: 'Lobby Cam-01', type: 'recognized' },
    { id: 'ev-3', time: '10:44:50', name: 'Miles Dyson', status: 'late', confidence: 91.2, camera: 'Lobby Cam-01', type: 'recognized' },
    { id: 'ev-4', time: '10:39:15', name: 'Unknown visitor', status: 'unregistered', confidence: 42.1, camera: 'Lobby Cam-01', type: 'unknown' }
  ]);

  // System alert list states
  const [systemAlerts, setSystemAlerts] = useState<any[]>([
    { id: 'alert-1', message: 'Unknown visitor detected', type: 'warning', active: true, time: '10:39:15' },
    { id: 'alert-2', message: 'Low confidence recognition on Miles Dyson', type: 'info', active: true, time: '10:44:50' }
  ]);

  // Event timeline list
  const [timeline, setTimeline] = useState<any[]>([
    { id: 't-1', title: 'Face Detected', subtitle: 'Lobby Cam-01', time: '10:52:10', type: 'detected' },
    { id: 't-2', title: 'Face Recognized', subtitle: 'Sarah Connor (FV-2026-042)', time: '10:52:12', type: 'recognized' },
    { id: 't-3', title: 'Attendance Marked', subtitle: 'Sarah Connor - Present', time: '10:52:12', type: 'attendance' },
    { id: 't-4', title: 'Unknown Face', subtitle: 'Unregistered profile detected', time: '10:39:15', type: 'unknown' }
  ]);

  // Floating notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' | 'danger' }[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sound play mockup
  const triggerAudioBeep = (type: 'match' | 'unknown' | 'warning') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'match') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high friendly tone
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'unknown') {
        osc.frequency.setValueAtTime(330, audioCtx.currentTime); // low alarm tone
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      console.log('Audio Context block or unsupported:', e);
    }
  };

  // Real Webcam video streamer controls
  const startWebcamStream = async () => {
    try {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setWebcamStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      addToast('Real webcam feed linked successfully', 'success');
    } catch (err: any) {
      console.warn("Webcam blocked:", err.message);
      setUseRealWebcam(false);
      addToast('System webcam blocked. Reverting to Simulated Video Viewfinder.', 'warning');
      
      // Add camera disconnected alert to list
      const newAlert = {
        id: `alert-${Date.now()}`,
        message: 'Camera disconnected or access blocked',
        type: 'danger',
        active: true,
        time: new Date().toLocaleTimeString()
      };
      setSystemAlerts(prev => [newAlert, ...prev]);
    }
  };

  const stopWebcamStream = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  useEffect(() => {
    if (useRealWebcam && isRecognizing) {
      startWebcamStream();
    } else {
      stopWebcamStream();
    }
    return () => stopWebcamStream();
  }, [useRealWebcam, isRecognizing]);

  // Jitter FPS and AI usage stats periodically to look premium and alive
  useEffect(() => {
    if (!isRecognizing) return;

    const interval = setInterval(() => {
      setCurrentFps(prev => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Math.min(fpsSetting, Math.max(fpsSetting - 3, +(prev + delta).toFixed(1)));
      });

      // Fluctuate CPU/GPU usage
      setGpuUsage(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 8);
        return Math.min(95, Math.max(20, prev + delta));
      });
      setCpuUsage(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 4);
        return Math.min(45, Math.max(8, prev + delta));
      });
      setMemUsage(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 2);
        return Math.min(90, Math.max(50, prev + delta));
      });
      setInferenceTime(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 4);
        return Math.min(22, Math.max(9, prev + delta));
      });
      setEmbeddingTime(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 2);
        return Math.min(14, Math.max(6, prev + delta));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isRecognizing, fpsSetting]);

  // Cyclic simulated face scanner event generator
  useEffect(() => {
    if (!isRecognizing) return;

    let index = 0;
    const interval = setInterval(() => {
      // Rotate through index database
      const person = simulatedDatabase[index];
      index = (index + 1) % simulatedDatabase.length;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const record = { ...person, timestamp: timeStr };

      // Handle confidence & validation thresholds logic
      if (record.isUnknown) {
        // Trigger unknown face alarm!
        setActiveUnknown(record);
        setActiveFace(simulatedDatabase[0]); // keeps last verified active
        triggerAudioBeep('unknown');
        addToast(`Security Alert: Unknown visitor detected!`, 'warning');

        // Add to Recent Timeline
        const id = `t-${Date.now()}`;
        setTimeline(prev => [
          { id, title: 'Unknown Face Detected', subtitle: 'Lobby Cam-01', time: timeStr, type: 'unknown' },
          ...prev
        ].slice(0, 8));

        // Add to Alerts list
        setSystemAlerts(prev => [
          { id: `alert-${Date.now()}`, message: 'Unknown visitor detected at checkpoint', type: 'warning', active: true, time: timeStr },
          ...prev
        ].slice(0, 10));

        // Increment stats
        setFacesDetectedCount(prev => prev + 1);
        setUnknownFacesCount(prev => prev + 1);

        // Propagate alert upward to global layout
        onAddUnknownAlert({
          id: `un-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imageUrl: record.avatarUrl,
          confidence: +(record.confidence / 100).toFixed(2),
          cameraLocation: 'Lobby Cam-01',
          status: 'unresolved'
        });

      } else {
        // Clear active unknown frame alarm
        setActiveUnknown(null);
        setActiveFace(record);

        // Check if recognition score exceeds thresholds
        if (record.confidence < confidenceThreshold) {
          triggerAudioBeep('warning');
          addToast(`Low confidence score for ${record.name}: ${record.confidence}%`, 'info');
          
          setSystemAlerts(prev => [
            { id: `alert-${Date.now()}`, message: `Low confidence recognition on ${record.name}`, type: 'info', active: true, time: timeStr },
            ...prev
          ].slice(0, 10));

          const id = `t-${Date.now()}`;
          setTimeline(prev => [
            { id, title: 'System Alert', subtitle: `Low confidence match: ${record.name}`, time: timeStr, type: 'alert' },
            ...prev
          ].slice(0, 8));
          return;
        }

        // Beautiful standard Match
        triggerAudioBeep('match');
        addToast(`Face Recognized: ${record.name} (${record.confidence}% Match)`, 'success');

        // Increment statistical counters
        setFacesDetectedCount(prev => prev + 1);
        setFacesRecognizedCount(prev => prev + 1);
        if (record.status === 'present') {
          setAttendanceTodayCount(prev => prev + 1);
        }

        // Add to Live Recognition history logs list
        const logId = `ev-${Date.now()}`;
        setLiveEvents(prev => [
          { id: logId, time: timeStr, name: record.name, status: record.status, confidence: record.confidence, camera: 'Lobby Cam-01', type: 'recognized' },
          ...prev
        ].slice(0, 12));

        // Add to Timeline
        const tIdDetected = `t-det-${Date.now()}`;
        const tIdRecognized = `t-rec-${Date.now()}`;
        const tIdAttendance = `t-att-${Date.now()}`;
        setTimeline(prev => [
          { id: tIdAttendance, title: 'Attendance Marked', subtitle: `${record.name} - ${record.status.toUpperCase()}`, time: timeStr, type: 'attendance' },
          { id: tIdRecognized, title: 'Face Recognized', subtitle: `${record.name} (${record.studentId})`, time: timeStr, type: 'recognized' },
          { id: tIdDetected, title: 'Face Detected', subtitle: 'Lobby Cam-01', time: timeStr, type: 'detected' },
          ...prev
        ].slice(0, 10));

        // Propagate attendance record upward to system
        onAddRecognitionLog({
          id: `att-${Date.now()}`,
          studentId: record.studentId,
          studentName: record.name,
          department: record.department,
          timestamp: new Date().toISOString(),
          status: record.status === 'already-marked' ? 'present' : record.status === 'late' ? 'late' : record.status === 'absent' ? 'absent' : 'present',
          confidence: record.confidence,
          verificationType: 'face',
          maskWorn: false
        });
      }
    }, 5500); // Trigger dynamic changes every 5.5 seconds for premium presentation speed

    return () => clearInterval(interval);
  }, [isRecognizing, confidenceThreshold]);

  // Handle action buttons
  const toggleRecognition = () => {
    setIsRecognizing(!isRecognizing);
    addToast(isRecognizing ? 'AI Inference Stream paused.' : 'AI Inference Stream initialized.', isRecognizing ? 'info' : 'success');
  };

  const handleRegisterUnknown = (person: RecognizedStudent) => {
    addToast(`Pre-filling registration form for biometric profile...`, 'info');
    onNavigate('face-registration');
  };

  const handleIgnoreUnknown = () => {
    setActiveUnknown(null);
    addToast('Unknown visitor alert dismissed.', 'info');
  };

  const handleBlacklistUnknown = (person: RecognizedStudent) => {
    addToast(`Biometric weight ID added to secure blacklist.`, 'danger');
    setActiveUnknown(null);
  };

  const handleCaptureFrame = () => {
    setFlashActive(true);
    triggerAudioBeep('match');
    setTimeout(() => setFlashActive(false), 250);
    addToast('Viewfinder snapshot captured & registered in AI vector cache!', 'success');
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTimeline(prev => [
      { id: `t-cap-${Date.now()}`, title: 'Frame Captured', subtitle: 'Vector snapshot registered in DB', time: timeStr, type: 'detected' },
      ...prev
    ].slice(0, 10));

    setLiveEvents(prev => [
      { id: `ev-cap-${Date.now()}`, time: timeStr, name: 'Snapshot Captured', status: 'present', confidence: 100, camera: selectedDevice, type: 'recognized' },
      ...prev
    ].slice(0, 12));
  };

  const clearAlert = (id: string) => {
    setSystemAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div id="live-recognition-module" className="space-y-8 pb-16 relative">
      
      {/* FLOATING TOAST STACK */}
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
              <div className="text-xs font-mono leading-relaxed">
                {t.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/35 border border-slate-850 p-6 rounded-3xl backdrop-blur">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              {isRecognizing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecognizing ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-slate-500 text-xs font-mono">
              Inference Stream: {isRecognizing ? 'ACTIVE' : 'PAUSED'}
            </span>
            <span className="h-4 w-[1px] bg-slate-800" />
            <span className="text-slate-500 text-xs font-mono">Camera ID: LBY-CAM-01</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Live AI Face Recognition</h1>
          <p className="text-xs text-slate-400 font-medium">Real-time face recognition with automatic attendance and student information.</p>
        </div>

        {/* Action Buttons list */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start Camera button */}
          <button
            onClick={() => {
              setUseRealWebcam(true);
              addToast('Webcam input stream activated', 'success');
              
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setTimeline(prev => [
                { id: `t-cam-start-${Date.now()}`, title: 'Camera Started', subtitle: 'Webcam input feed authorized', time: timeStr, type: 'detected' },
                ...prev
              ].slice(0, 10));
            }}
            disabled={useRealWebcam}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              useRealWebcam 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Camera</span>
          </button>

          {/* Stop Camera button */}
          <button
            onClick={() => {
              setUseRealWebcam(false);
              stopWebcamStream();
              addToast('Webcam stream suspended', 'info');
              
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setTimeline(prev => [
                { id: `t-cam-stop-${Date.now()}`, title: 'Camera Stopped', subtitle: 'Webcam input feed suspended', time: timeStr, type: 'alert' },
                ...prev
              ].slice(0, 10));
            }}
            disabled={!useRealWebcam}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              !useRealWebcam 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed' 
                : 'bg-rose-950/40 hover:bg-rose-900/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Camera</span>
          </button>

          {/* Switch Camera button */}
          <button
            onClick={() => {
              const current = selectedDevice;
              const devices = ['Lobby Cam-01 (1080p FHD)', 'Corridor Cam-03 (720p)', 'Exit Cam-02 (VGA)', 'Virtual AI Stream (Demo)'];
              const idx = devices.indexOf(current);
              const next = devices[(idx + 1) % devices.length];
              setSelectedDevice(next);
              addToast(`Switched active camera node to: ${next}`, 'info');
            }}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch Camera</span>
          </button>

          {/* Capture Frame button */}
          <button
            onClick={handleCaptureFrame}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white shadow-lg shadow-blue-500/10 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capture Frame</span>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              addToast(isFullscreen ? 'Exited fullscreen layout mode' : 'Entered full video viewport preview', 'info');
            }}
            className={`p-2 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isFullscreen 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Viewfinder Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Sound volume controller button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-slate-900 border-slate-800 text-blue-400 hover:text-blue-300' 
                : 'bg-rose-950/20 border-rose-900 text-rose-400'
            }`}
            title={soundEnabled ? "Mute Match Alerts" : "Unmute Match Alerts"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-2 border text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
              isSettingsOpen 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* LIVE STATISTICS OVERVIEW CARDS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Faces Detected</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold font-mono text-white">{facesDetectedCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">today</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Faces Recognized</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{facesRecognizedCount}</span>
            <span className="text-[10px] text-emerald-500/70 font-mono">{(facesRecognizedCount / Math.max(1, facesDetectedCount) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Unknown Faces</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold font-mono text-rose-400">{unknownFacesCount}</span>
            <span className="text-[10px] text-rose-500/70 font-mono">alerts</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">System Accuracy</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold font-mono text-blue-400">{accuracyToday}%</span>
            <span className="text-[10px] text-blue-500/70 font-mono">F1-Score</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Attendance Today</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold font-mono text-white">{attendanceTodayCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">marked</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Current Framerate</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-xl font-bold font-mono transition-colors ${currentFps > 55 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentFps}</span>
            <span className="text-[10px] text-slate-500 font-mono">FPS</span>
          </div>
        </div>

      </div>

      {/* CORE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT COLUMN (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CAMERA VIEWFINDER WITH HIGH-TECH OVERLAYS */}
          <div className={`bg-slate-950/40 backdrop-blur border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl transition-all ${
            isFullscreen ? 'lg:col-span-12 h-[520px]' : 'h-[390px]'
          }`}>
            
            {/* Real webcam vs simulated placeholder logic */}
            {useRealWebcam && isRecognizing ? (
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) ${nightMode ? 'invert(1) hue-rotate(180deg) grayscale(0.5)' : ''}` }}
                className={`absolute inset-0 w-full h-full object-cover ${mirrorMode ? 'transform scale-x-[-1]' : ''}`}
                disablePictureInPicture={false}
                forceScreenshotSourceSize={false}
                imageSmoothing={true}
                mirrored={false}
                screenshotQuality={0.92}
                onUserMedia={() => {}}
                onUserMediaError={() => {}}
              />
            ) : (
              <div 
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                className="absolute inset-0 bg-gradient-to-br from-[#070b19] via-[#020512] to-[#111931] flex flex-col items-center justify-center p-6 text-center select-none"
              >
                {/* Tech vector background grids */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                
                {isRecognizing && (
                  <div className="absolute left-0 right-0 h-[2.5px] bg-blue-500/55 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-scan-line pointer-events-none z-10" />
                )}

                {/* Simulated live noise camera effect */}
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)] bg-[size:3px_3px]" />

                {isRecognizing ? (
                  <div className="w-20 h-20 rounded-full bg-blue-500/5 border border-blue-500/25 flex items-center justify-center relative mb-4">
                    <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border border-blue-500/10 scale-125 animate-ping" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-slate-500" />
                  </div>
                )}

                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                  <span>{selectedDevice}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-2 max-w-sm leading-relaxed">
                  {isRecognizing 
                    ? 'AI core models running local inference. Dynamic face tracking overlay active.' 
                    : 'Recognition stream suspended. Toggle Start Recognition to resume monitoring.'
                  }
                </p>
              </div>
            )}

            {/* VISUAL CAMERA SHUTTER FLASH OVERLAY */}
            <AnimatePresence>
              {flashActive && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-white z-45 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* AI HUD OVERLAYS */}
            {isRecognizing && (
              <>
                {/* BLINKING RECORDING INDICATOR */}
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 flex items-center space-x-2 pointer-events-none z-20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="font-extrabold uppercase tracking-widest text-slate-200">LIVE SCANNING</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-blue-400">{selectedResolution.split(' ')[0]}</span>
                </div>

                {/* DYNAMIC TIMESTAMP SECURITY CLOCK */}
                <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 flex items-center space-x-1.5 pointer-events-none z-20">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-200">{currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}</span>
                </div>

                {/* NIGHT MODE EMBLEM */}
                {nightMode && (
                  <div className="absolute top-4 left-44 bg-blue-950/90 border border-blue-700 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-bold text-blue-300 flex items-center space-x-1.5 pointer-events-none z-20">
                    <Flame className="w-3.5 h-3.5 text-blue-400" />
                    <span>NIGHT VISION MODULATION</span>
                  </div>
                )}

                {/* LIVE FPS & HARDWARE STATS overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-850 p-3 rounded-2xl text-[10px] font-mono text-slate-400 space-y-1 min-w-[130px] pointer-events-none z-20">
                  <p className="text-[9px] text-slate-500 font-extrabold border-b border-slate-900 pb-1">BIOMETRICS FEED</p>
                  <div className="flex justify-between">
                    <span>Framerate:</span>
                    <span className="text-emerald-400 font-bold">{currentFps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Res. Aspect:</span>
                    <span className="text-slate-300">16:9 widescreen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source Latency:</span>
                    <span className="text-slate-300">2.1 ms</span>
                  </div>
                </div>

                {/* FACE BOUNDING BOX OVERLAY FOR ACTIVE SIMULATED PERSON */}
                <AnimatePresence>
                  {activeUnknown ? (
                    /* RED GLOWING BOX FOR UNREGISTERED INDIVIDUAL */
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="absolute top-[20%] left-[30%] right-[30%] bottom-[20%] border-2 border-dashed border-rose-500/70 rounded-2xl flex flex-col justify-between p-3 pointer-events-none z-15 shadow-[0_0_35px_rgba(244,63,94,0.15)] bg-rose-950/5"
                    >
                      {/* Corners styling */}
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-rose-500" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-rose-500" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-rose-500" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-rose-500" />

                      {/* Landmarks tracking dots */}
                      <div className="absolute top-[42%] left-[28%] w-2 h-2 bg-rose-400 rounded-full animate-ping" />
                      <div className="absolute top-[42%] right-[28%] w-2 h-2 bg-rose-400 rounded-full animate-ping" />
                      <div className="absolute top-[58%] left-[49%] w-2 h-2 bg-rose-400 rounded-full" />
                      <div className="absolute bottom-[28%] left-[35%] right-[35%] h-1 bg-rose-500 rounded-full" />

                      <div className="text-center bg-rose-500 text-slate-950 text-[10px] font-bold font-mono py-1 rounded tracking-wider uppercase">
                        WARNING: UNREGISTERED VISITOR
                      </div>

                      <div className="text-[9px] text-rose-300 font-mono text-center flex items-center justify-center space-x-1">
                        <span>Confidence: {activeUnknown.confidence}%</span>
                      </div>
                    </motion.div>
                  ) : activeFace ? (
                    /* BLUE GLOWING BOX FOR REGISTERED BIOMETRIC MATCH */
                    <motion.div
                      key={activeFace.name}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-[22%] left-[32%] right-[32%] bottom-[22%] border-2 border-dashed border-blue-500/60 rounded-3xl flex flex-col justify-between p-3 pointer-events-none z-15 shadow-[0_0_25px_rgba(59,130,246,0.12)] bg-blue-950/5"
                    >
                      {/* Corners styling */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400" />

                      {/* Landmarks tracking dots */}
                      <div className="absolute top-[40%] left-[28%] w-1.5 h-1.5 bg-blue-300 rounded-full" />
                      <div className="absolute top-[40%] right-[28%] w-1.5 h-1.5 bg-blue-300 rounded-full" />
                      <div className="absolute top-[58%] left-[49%] w-1.5 h-1.5 bg-blue-300 rounded-full" />
                      <div className="absolute bottom-[28%] left-[35%] right-[35%] h-[2px] bg-blue-400/50 rounded-full" />

                      <div className="text-center bg-emerald-500 text-slate-950 text-[9px] font-bold font-mono py-0.5 rounded tracking-wider uppercase">
                        MATCH: {activeFace.name.split(' ')[0]}
                      </div>

                      <div className="text-[9px] text-blue-300 font-mono text-center">
                        Confidence: {activeFace.confidence}%
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* DUAL COGNITIVE TIERS: LIVE MATCHED STUDENT CARDS & ATTENDANCE LOGGERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MATCHED STUDENT DOSSIER SUMMARY */}
            <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4 flex flex-col justify-between min-h-[380px]">
              <div className="space-y-4">
                <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-4.5 h-4.5 text-blue-400" />
                    <span>Verified Identity Dossier</span>
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Model Output</span>
                </div>

                {activeFace ? (
                  <div className="space-y-4">
                    {/* Basic Info Header */}
                    <div className="flex items-center space-x-4 bg-slate-950/20 p-2.5 rounded-2xl border border-slate-900/40">
                      <img 
                        src={activeFace.avatarUrl} 
                        alt={activeFace.name} 
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="text-sm font-bold text-white truncate max-w-[140px] md:max-w-[180px]">
                            {activeFace.name}
                          </h4>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold rounded uppercase shrink-0">
                            MATCHED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{activeFace.department}</p>
                        <p className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                          <span>ID:</span>
                          <span className="text-slate-300 font-semibold">{activeFace.studentId}</span>
                        </p>
                      </div>
                    </div>

                    {/* Premium Dossier Section Tabs */}
                    <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-900">
                      {(['biometrics', 'academics', 'contact', 'attendance'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveDossierTab(tab)}
                          className={`flex-1 py-1 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                            activeDossierTab === tab 
                              ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 border border-transparent'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Tab Contents */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeDossierTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="min-h-[145px]"
                      >
                        {activeDossierTab === 'biometrics' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Quality Score</span>
                              <span className="text-blue-400 font-mono font-bold text-[11px] flex items-center space-x-1 mt-0.5">
                                <Sparkles className="w-3 h-3" />
                                <span>{activeFace.qualityScore}% Sharpness</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Est. Distance</span>
                              <span className="text-slate-200 font-mono font-medium text-[11px] block mt-0.5">{activeFace.distance} meters</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Year Group</span>
                              <span className="text-slate-200 font-medium text-[11px] block mt-0.5">{activeFace.year}</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Division Section</span>
                              <span className="text-slate-200 font-medium text-[11px] block mt-0.5">{activeFace.section}</span>
                            </div>
                          </div>
                        )}

                        {activeDossierTab === 'academics' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900 col-span-2">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Course / Degree</span>
                              <span className="text-slate-200 font-semibold text-[11px] flex items-center space-x-1 mt-0.5 truncate">
                                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="truncate">{activeFace.course}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Roll Number</span>
                              <span className="text-slate-200 font-mono font-medium text-[11px] flex items-center space-x-1 mt-0.5">
                                <Hash className="w-3 h-3 text-slate-500" />
                                <span>{activeFace.rollNumber}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Branch/Major</span>
                              <span className="text-slate-200 font-semibold text-[11px] flex items-center space-x-1 mt-0.5 truncate">
                                <BookOpen className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{activeFace.branch}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Semester</span>
                              <span className="text-slate-200 font-medium text-[11px] block mt-0.5">{activeFace.semester}</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Batch Span</span>
                              <span className="text-slate-200 font-medium text-[11px] font-mono block mt-0.5">{activeFace.batch}</span>
                            </div>
                          </div>
                        )}

                        {activeDossierTab === 'contact' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Student Email</span>
                              <span className="text-slate-200 font-medium text-[11px] flex items-center space-x-1 mt-0.5 truncate">
                                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{activeFace.email}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Student Phone</span>
                              <span className="text-slate-200 font-mono text-[11px] flex items-center space-x-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{activeFace.phone}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Guardian Name</span>
                              <span className="text-slate-200 font-medium text-[11px] block mt-0.5 truncate">{activeFace.guardianName}</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Blood Group</span>
                              <span className="text-rose-400 font-mono font-bold text-[11px] flex items-center space-x-1 mt-0.5">
                                <Heart className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>{activeFace.bloodGroup}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900 col-span-2">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Emergency Phone</span>
                              <span className="text-slate-200 font-mono text-[11px] flex items-center space-x-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{activeFace.guardianPhone}</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {activeDossierTab === 'attendance' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Overall Attendance</span>
                              <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1 mt-0.5">
                                <Award className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{activeFace.attendancePercentage}% Ratio</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Tracking ID</span>
                              <span className="text-slate-300 font-mono text-[10px] block mt-0.5 truncate">{activeFace.trackingId}</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Registered Date</span>
                              <span className="text-slate-200 font-mono text-[11px] flex items-center space-x-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>{activeFace.registrationDate}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Daily Session Duration</span>
                              <span className="text-slate-200 font-mono font-medium text-[11px] block mt-0.5">{activeFace.attendanceDuration}</span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900 col-span-2">
                              <span className="text-slate-500 block text-[8px] font-mono uppercase tracking-wider">Last Attendance</span>
                              <span className="text-slate-200 font-mono text-[11px] block mt-0.5">{activeFace.lastAttendance}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Core confidence footer */}
                    <div className="bg-blue-600/5 border border-blue-500/20 p-2.5 rounded-2xl flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Inference Confidence Level:</span>
                      <span className="text-blue-400 font-extrabold text-xs">{activeFace.confidence}% Match</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500 text-xs italic font-mono flex flex-col items-center justify-center space-y-3">
                    <Video className="w-9 h-9 text-slate-800 animate-pulse" />
                    <span>Awaiting localized face mesh vector alignment...</span>
                  </div>
                )}
              </div>
            </div>

            {/* AUTOMATIC ATTENDANCE COMPLIANCE LOGGER */}
            <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4">
              <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle className="w-4.5 h-4.5 text-blue-400" />
                  <span>Real-Time Attendance Status</span>
                </h3>
                <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-mono rounded font-bold uppercase">
                  Auto-Marking
                </span>
              </div>

              {activeFace ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Attendance Result</span>
                      <div className="flex items-center space-x-2">
                        {activeFace.status === 'present' && (
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase">
                            Present
                          </span>
                        )}
                        {activeFace.status === 'already-marked' && (
                          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg uppercase">
                            Already Marked
                          </span>
                        )}
                        {activeFace.status === 'late' && (
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg uppercase">
                            Late
                          </span>
                        )}
                        {activeFace.status === 'absent' && (
                          <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg uppercase">
                            Absent
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">SLA TimeStamp</span>
                      <span className="text-slate-200 font-mono font-bold text-sm">
                        {activeFace.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Details Checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-slate-900/60">
                      <span className="text-slate-400 font-mono">Auto Attendance Ledger:</span>
                      <span className="text-emerald-400 font-bold uppercase flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Enabled</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-slate-900/60">
                      <span className="text-slate-400 font-mono">Duplicate Detection Protection:</span>
                      <span className="text-blue-400 font-semibold flex items-center space-x-1">
                        <span>Active ({duplicateTimeout}s window)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-slate-900/60">
                      <span className="text-slate-400 font-mono">Duplicate Status:</span>
                      <span className={`font-bold uppercase text-[10px] ${activeFace.status === 'already-marked' ? 'text-amber-400' : 'text-slate-500'}`}>
                        {activeFace.status === 'already-marked' ? 'DUPLICATE FILTERED' : 'CLEAR'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-900 text-center">
                    Bio-vector keys are evaluated. Duplicate entry matches filter automatically within localized timestamps.
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs italic font-mono flex flex-col items-center justify-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-slate-700 animate-pulse" />
                  <span>Awaiting live biometrics record mapping...</span>
                </div>
              )}
            </div>

          </div>

          {/* ACTIVE ALARM CARD: UNKNOWN INDIVIDUAL DETECTED */}
          <AnimatePresence>
            {activeUnknown && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-rose-950/15 border border-rose-800/60 p-6 rounded-3xl relative overflow-hidden shadow-xl"
              >
                {/* Background high-tech scanner elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="flex items-center justify-center shrink-0">
                    <img 
                      src={activeUnknown.avatarUrl} 
                      alt="Unknown Visitor" 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-rose-600 shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-rose-300">UNREGISTERED INDIVIDUAL DETECTED</h4>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">SECURITY THREAT ADVISORY LEVEL 2</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lobby surveillance cameras aligned with an unmapped face profile. Bounding overlay confidence registered under minimum database thresholds.
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Scan Time</span>
                        <span className="text-slate-200">{activeUnknown.timestamp || 'Just now'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Matching Margin</span>
                        <span className="text-rose-400 font-bold">{activeUnknown.confidence}% Accuracy</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Camera Source</span>
                        <span className="text-slate-200">Lobby Entrance 01</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-rose-950/55">
                      <button
                        onClick={() => handleRegisterUnknown(activeUnknown)}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Register Person</span>
                      </button>

                      <button
                        onClick={handleIgnoreUnknown}
                        className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
                      >
                        Ignore
                      </button>

                      <button
                        onClick={() => handleBlacklistUnknown(activeUnknown)}
                        className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Blacklist
                      </button>

                      <button
                        onClick={() => addToast('Retrieving matching telemetry matrices from secondary nodes...', 'info')}
                        className="px-2 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI HARDWARE TELEMETRY & MODEL STATE DISPLAY */}
          <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>AI Inference Engine Status</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">GPU Mode Optimized</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">YOLO Model Status</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>YOLOv8-Face (Loaded)</span>
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">InsightFace Status</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>ResNet50 Active</span>
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">DB Connections</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Local SQLite & Vector Cache</span>
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Inference Speed</span>
                <span className="text-blue-400 font-bold">{inferenceTime}ms (Embedding: {embeddingTime}ms)</span>
              </div>
            </div>

            {/* Hardware Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[11px] font-mono text-slate-400">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>GPU Nvidia TensorRT:</span>
                  <span className="text-slate-200">{gpuUsage}%</span>
                </div>
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${gpuUsage}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>CPU Xeon Node:</span>
                  <span className="text-slate-200">{cpuUsage}%</span>
                </div>
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>VRAM Buffer Cache:</span>
                  <span className="text-slate-200">{memUsage}%</span>
                </div>
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${memUsage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* DUAL CONFIGURATION TIERS (COLLAPSIBLE / TOGGLE SETTINGS PANEL) */}
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-6"
              >
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CAMERA HARDWARE SETTINGS */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-blue-400 font-bold flex items-center space-x-1.5">
                        <Camera className="w-4 h-4" />
                        <span>Camera Hardware Config</span>
                      </h4>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-400">Select Input Device Source</label>
                        <select
                          value={selectedDevice}
                          onChange={(e) => {
                            setSelectedDevice(e.target.value);
                            addToast(`Hardware input mapped to ${e.target.value}`, 'info');
                          }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          <option>Lobby Cam-01 (1080p FHD)</option>
                          <option>Corridor Cam-03 (720p)</option>
                          <option>Exit Cam-02 (VGA)</option>
                          <option>Virtual AI Stream (Demo)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-400">Target Resolution Ratio</label>
                        <select
                          value={selectedResolution}
                          onChange={(e) => {
                            setSelectedResolution(e.target.value);
                            addToast(`Webcam viewport aspect set to ${e.target.value}`, 'info');
                          }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          <option>1920x1080 (16:9)</option>
                          <option>1280x720 (16:9)</option>
                          <option>640x480 (4:3)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 block">Brightness ({brightness}%)</label>
                          <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            value={brightness} 
                            onChange={(e) => setBrightness(parseInt(e.target.value))} 
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 block">Contrast ({contrast}%)</label>
                          <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            value={contrast} 
                            onChange={(e) => setContrast(parseInt(e.target.value))} 
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
                        <button
                          onClick={() => setAutoFocus(!autoFocus)}
                          className={`p-2 rounded-xl border text-center font-bold uppercase transition-all ${
                            autoFocus ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-900 text-slate-500'
                          }`}
                        >
                          Auto Focus: {autoFocus ? 'ON' : 'OFF'}
                        </button>

                        <button
                          onClick={() => {
                            setMirrorMode(!mirrorMode);
                            addToast(mirrorMode ? 'Mirror mode disabled' : 'Mirror mode active', 'info');
                          }}
                          className={`p-2 rounded-xl border text-center font-bold uppercase transition-all ${
                            mirrorMode ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-900 text-slate-500'
                          }`}
                        >
                          Mirror Mode: {mirrorMode ? 'ON' : 'OFF'}
                        </button>

                        <button
                          onClick={() => {
                            setNightMode(!nightMode);
                            addToast(nightMode ? 'Daylight spectrum active' : 'Biometric night vision mode active', 'warning');
                          }}
                          className={`p-2 rounded-xl border text-center font-bold uppercase transition-all col-span-2 ${
                            nightMode ? 'bg-blue-950 border-blue-700 text-blue-300' : 'bg-slate-950 border-slate-900 text-slate-500'
                          }`}
                        >
                          Infrared Night Vision: {nightMode ? 'ENABLED' : 'DISABLED'}
                        </button>

                        <div className="col-span-2 pt-2 border-t border-slate-950">
                          <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                            <input
                              id="live-webcam-checkbox"
                              type="checkbox"
                              checked={useRealWebcam}
                              onChange={(e) => {
                                setUseRealWebcam(e.target.checked);
                                addToast(e.target.checked ? 'Attempting system webcam authorization...' : 'Virtual feed selected', 'info');
                              }}
                              className="rounded border-slate-800 text-blue-500 focus:ring-blue-500 bg-slate-950"
                            />
                            <div>
                              <label htmlFor="live-webcam-checkbox" className="text-xs font-bold text-slate-300 block cursor-pointer">Verify with local camera</label>
                              <span className="text-[9px] text-slate-500 block">Uses HTML5 media devices inside preview frame</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* AI RECOGNITION PIPELINE SETTINGS */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-880 pb-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-blue-400 font-bold flex items-center space-x-1.5">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>AI Inference Thresholds</span>
                      </h4>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 uppercase">Confidence Threshold ({confidenceThreshold}%)</span>
                          <span className="text-blue-400 font-bold">{confidenceThreshold}% Match</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="98"
                          value={confidenceThreshold}
                          onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-[9px] text-slate-500 font-mono">Minimum match score to identify a known face</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 uppercase">Detection Sensitivity ({recognitionThreshold}%)</span>
                          <span className="text-blue-400 font-bold">{recognitionThreshold}% IoU</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          value={recognitionThreshold}
                          onChange={(e) => setRecognitionThreshold(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 block">Min Face (pixels): {minFaceSize}px</label>
                          <input 
                            type="range" 
                            min="40" 
                            max="150" 
                            value={minFaceSize} 
                            onChange={(e) => setMinFaceSize(parseInt(e.target.value))} 
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 block">Max Face (pixels): {maxFaceSize}px</label>
                          <input 
                            type="range" 
                            min="200" 
                            max="600" 
                            value={maxFaceSize} 
                            onChange={(e) => setMaxFaceSize(parseInt(e.target.value))} 
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-950">
                        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                          <span className="font-mono text-slate-400">Mark Attendance Automatically:</span>
                          <button
                            onClick={() => {
                              setAutoAttendance(!autoAttendance);
                              addToast(autoAttendance ? 'Automatic ledger updating halted' : 'Automatic ledger updating initialized', 'info');
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-lg font-mono uppercase border ${
                              autoAttendance ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {autoAttendance ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                          <span className="font-mono text-slate-400">Duplicate Timeout (Seconds):</span>
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => setDuplicateTimeout(prev => Math.max(5, prev - 5))} 
                              className="px-2 py-0.5 bg-slate-900 border border-slate-850 text-slate-300 rounded font-bold"
                            >
                              -
                            </button>
                            <span className="text-slate-200 font-mono font-bold w-8 text-center">{duplicateTimeout}s</span>
                            <button 
                              onClick={() => setDuplicateTimeout(prev => Math.min(120, prev + 5))} 
                              className="px-2 py-0.5 bg-slate-900 border border-slate-850 text-slate-300 rounded font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT SYSTEM SIDEBAR PANEL (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SYSTEM ALERTS PANEL */}
          <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Security Alerts Center</span>
              </h4>
              <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-mono rounded font-bold">
                {systemAlerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
              {systemAlerts.length === 0 ? (
                <div className="py-6 text-center text-slate-600 font-mono text-xs italic">
                  No critical hardware or pipeline faults.
                </div>
              ) : (
                systemAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                      alert.type === 'danger' 
                        ? 'bg-rose-950/20 border-rose-900 text-rose-300' 
                        : alert.type === 'warning'
                          ? 'bg-amber-950/20 border-amber-900 text-amber-300'
                          : 'bg-slate-950 border-slate-900 text-slate-300'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      alert.type === 'danger' ? 'text-rose-400' : alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold">{alert.message}</p>
                      <span className="text-[9px] text-slate-500 font-mono block">Detected at {alert.time}</span>
                    </div>
                    <button 
                      onClick={() => clearAlert(alert.id)}
                      className="text-slate-500 hover:text-white shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* REAL-TIME PIPELINE TIMELINE OF EVENT PATHS */}
          <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Biometric Event Timeline</span>
              </h4>
              <span className="text-[9px] font-mono text-slate-500">Live feed</span>
            </div>

            <div className="relative pl-4 space-y-4 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {/* Vertical line connector */}
              <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-slate-850" />

              {timeline.map((item, idx) => (
                <div key={item.id} className="relative flex gap-3 text-xs">
                  {/* Point icon */}
                  <div className={`absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#111827] ${
                    item.type === 'unknown' 
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                      : item.type === 'recognized'
                        ? 'bg-blue-400'
                        : item.type === 'attendance'
                          ? 'bg-emerald-500'
                          : 'bg-slate-500'
                  }`} />

                  <div className="space-y-0.5 flex-1 pl-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{item.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECOGNITION LOG - scrolling list */}
          <div className="bg-[#111827]/50 backdrop-blur border border-slate-800/80 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Recognition Log History</span>
              </h4>
              <span className="text-[9px] font-mono text-slate-500">Auto-refresh</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {liveEvents.map(event => (
                <div 
                  key={event.id} 
                  className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${event.type === 'unknown' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-slate-200 font-bold">{event.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Camera: {event.camera}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`text-[10px] font-bold ${
                      event.status === 'present' 
                        ? 'text-emerald-400' 
                        : event.status === 'already-marked'
                          ? 'text-blue-400'
                          : event.status === 'late'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                    <p className="text-[9px] text-slate-500">{event.confidence}% match • {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
