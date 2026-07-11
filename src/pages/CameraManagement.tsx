import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  RefreshCw, 
  AlertCircle, 
  Sliders, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  Video, 
  Maximize2, 
  Loader2, 
  X, 
  Plus, 
  Search, 
  Trash2, 
  Play, 
  Square, 
  Settings, 
  Activity, 
  MapPin, 
  Database, 
  Cpu, 
  Layers, 
  Terminal, 
  User, 
  UserCheck, 
  UserX, 
  Map, 
  Clock, 
  Settings2, 
  Grid, 
  CameraOff, 
  ChevronRight,
  Shield,
  FileText,
  Radio,
  Sparkles,
  Zap,
  HardDrive,
  Gauge,
  Thermometer,
  Eye,
  EyeOff
} from 'lucide-react';
import { Student } from '../types';

interface CameraManagementProps {
  students?: Student[];
  onAddRecognitionLog?: (record: any) => void;
  onAddUnknownAlert?: (alert: any) => void;
  onNavigate?: (page: string) => void;
}

interface CameraNode {
  id: string;
  name: string;
  location: string;
  building: string;
  floor: string;
  roomNumber: string;
  department: string;
  status: 'connected' | 'initializing' | 'disconnected' | 'not-found' | 'denied';
  fps: number;
  resolution: string;
  recognitionStatus: 'active' | 'inactive';
  attendanceStatus: 'enabled' | 'disabled';
  recordingStatus: 'recording' | 'idle';
  brightness: number;
  contrast: number;
  exposure: 'auto' | 'manual';
  mirror: boolean;
  nightMode: boolean;
  aiEnabled: boolean;
  autoAttendance: boolean;
  isPhysical: boolean; // Whether mapped to the real client webcam
  health: {
    cpu: number;
    gpu: number;
    ram: number;
    latency: number;
    temperature: number;
    inferenceTime: number;
    recognitionSpeed: number;
  };
  coordinates: { x: number; y: number };
}

interface CameraEvent {
  id: string;
  timestamp: string;
  cameraName: string;
  type: 'started' | 'stopped' | 'recognized' | 'attendance' | 'unknown' | 'error' | 'network_error';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export default function CameraManagement({
  students = [],
  onAddRecognitionLog,
  onAddUnknownAlert,
  onNavigate
}: CameraManagementProps) {
  // Mock students fallback if none provided
  const fallbackStudents: Student[] = [
    { id: '1', name: 'Alexander Wright', studentId: 'FV-2026-081', email: 'alex@vision.edu', department: 'Engineering', status: 'active', registrationDate: '2026-01-10', imagesCount: 10, faceConfidence: 98.4, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
    { id: '2', name: 'Sophia Sterling', studentId: 'FV-2026-042', email: 'sophia@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-02-14', imagesCount: 12, faceConfidence: 99.2, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: '3', name: 'Marcus Sterling', studentId: 'FV-2026-015', email: 'marcus@vision.edu', department: 'Engineering', status: 'active', registrationDate: '2026-02-28', imagesCount: 10, faceConfidence: 95.8, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: '4', name: 'Elena Rostova', studentId: 'FV-2026-097', email: 'elena@vision.edu', department: 'Arts & Humanities', status: 'active', registrationDate: '2026-03-01', imagesCount: 15, faceConfidence: 97.6, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  ];
  
  const studentList = students.length > 0 ? students : fallbackStudents;

  // Initial Camera Node List
  const [cameras, setCameras] = useState<CameraNode[]>([
    {
      id: 'CAM-01',
      name: 'Main Lobby Entrance',
      location: 'Main Lobby Portal',
      building: 'Administration',
      floor: 'Ground Floor',
      roomNumber: 'Lobby 1',
      department: 'Security Division',
      status: 'connected',
      fps: 30,
      resolution: '1080p',
      recognitionStatus: 'active',
      attendanceStatus: 'enabled',
      recordingStatus: 'recording',
      brightness: 110,
      contrast: 105,
      exposure: 'auto',
      mirror: true,
      nightMode: false,
      aiEnabled: true,
      autoAttendance: true,
      isPhysical: true, // Uses browser media webcam
      health: { cpu: 22, gpu: 35, ram: 41, latency: 4, temperature: 42, inferenceTime: 8.5, recognitionSpeed: 118 },
      coordinates: { x: 28, y: 35 }
    },
    {
      id: 'CAM-02',
      name: 'Science corridor South',
      location: 'Science Wing A',
      building: 'Science block',
      floor: '2nd Floor',
      roomNumber: 'Corridor 2B',
      department: 'General Sciences',
      status: 'connected',
      fps: 30,
      resolution: '720p',
      recognitionStatus: 'active',
      attendanceStatus: 'enabled',
      recordingStatus: 'idle',
      brightness: 100,
      contrast: 100,
      exposure: 'auto',
      mirror: false,
      nightMode: false,
      aiEnabled: true,
      autoAttendance: true,
      isPhysical: false, // Simulated feed
      health: { cpu: 14, gpu: 28, ram: 38, latency: 12, temperature: 38, inferenceTime: 12.1, recognitionSpeed: 82 },
      coordinates: { x: 58, y: 22 }
    },
    {
      id: 'CAM-03',
      name: 'Engineering Lab East',
      location: 'Robotics Wing',
      building: 'Engineering Annex',
      floor: 'Ground Floor',
      roomNumber: 'Lab 102',
      department: 'Engineering',
      status: 'connected',
      fps: 60,
      resolution: '1080p',
      recognitionStatus: 'active',
      attendanceStatus: 'enabled',
      recordingStatus: 'recording',
      brightness: 100,
      contrast: 100,
      exposure: 'manual',
      mirror: true,
      nightMode: false,
      aiEnabled: true,
      autoAttendance: true,
      isPhysical: false, // Simulated feed
      health: { cpu: 34, gpu: 62, ram: 45, latency: 8, temperature: 49, inferenceTime: 5.4, recognitionSpeed: 185 },
      coordinates: { x: 75, y: 72 }
    },
    {
      id: 'CAM-04',
      name: 'Library Archive Portal',
      location: 'Reading Area A',
      building: 'Library Wing',
      floor: '1st Floor',
      roomNumber: 'A-201',
      department: 'Arts & Humanities',
      status: 'disconnected',
      fps: 15,
      resolution: '480p',
      recognitionStatus: 'inactive',
      attendanceStatus: 'disabled',
      recordingStatus: 'idle',
      brightness: 120,
      contrast: 90,
      exposure: 'auto',
      mirror: false,
      nightMode: true,
      aiEnabled: false,
      autoAttendance: false,
      isPhysical: false, // Simulated feed
      health: { cpu: 0, gpu: 0, ram: 12, latency: 0, temperature: 24, inferenceTime: 0, recognitionSpeed: 0 },
      coordinates: { x: 40, y: 80 }
    }
  ]);

  // Event Log State
  const [events, setEvents] = useState<CameraEvent[]>([
    { id: '1', timestamp: '12:10:04', cameraName: 'Main Lobby Entrance', type: 'started', message: 'Camera CAM-01 stream initialized successfully.', severity: 'info' },
    { id: '2', timestamp: '12:11:15', cameraName: 'Science corridor South', type: 'recognized', message: 'Sophia Sterling identified with 99.2% confidence.', severity: 'success' },
    { id: '3', timestamp: '12:11:16', cameraName: 'Science corridor South', type: 'attendance', message: 'Attendance marked automatically for Sophia Sterling.', severity: 'success' },
    { id: '4', timestamp: '12:12:30', cameraName: 'Library Archive Portal', type: 'error', message: 'Camera CAM-04 connection lost. Commencing auto-reconnect.', severity: 'warning' },
    { id: '5', timestamp: '12:12:45', cameraName: 'Main Lobby Entrance', type: 'unknown', message: 'Unknown face detected. Alarm triggered.', severity: 'warning' }
  ]);

  // Overall hardware/environment permission states
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // UI Panels states
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-01');
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [fullscreenCamId, setFullscreenCamId] = useState<string | null>(null);

  // Form states for adding camera
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamBuilding, setNewCamBuilding] = useState('Main Building');
  const [newCamFloor, setNewCamFloor] = useState('Ground Floor');
  const [newCamRoom, setNewCamRoom] = useState('');
  const [newCamDept, setNewCamDept] = useState('Engineering');
  const [newCamResolution, setNewCamResolution] = useState('1080p');

  // Interactive screenshot/recording states
  const [recordingTimers, setRecordingTimers] = useState<{ [key: string]: number }>({});
  const [recordingIntervals, setRecordingIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [capturedScreenshots, setCapturedScreenshots] = useState<{ id: string; url: string; timestamp: string }[]>([]);
  
  // Webcam references
  const webcamRef = useRef<Webcam>(null);
  const selectedCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  // Active AI Bounding Boxes Simulation State
  const [detectedFaces, setDetectedFaces] = useState<{
    [camId: string]: {
      name: string;
      studentId: string;
      department: string;
      photo: string;
      confidence: number;
      attendanceStatus: string;
      course: string;
      year: string;
      section: string;
      group: string;
      classroom: string;
      box: { x: number; y: number; width: number; height: number };
    } | null;
  }>({});

  // Request browser camera permissions and enumerate devices automatically
  const initWebcamDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('denied');
        setCameras(prev => prev.map(c => c.isPhysical ? { ...c, status: 'not-found' } : c));
        return;
      }

      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());

      setPermissionState('granted');
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }

      setCameras(prev => prev.map(c => {
        if (c.isPhysical) {
          return { ...c, status: 'connected' };
        }
        return c;
      }));

      pushEvent('Main Lobby Entrance', 'started', 'Physical camera stream initialized successfully.', 'success');

    } catch (err: any) {
      console.warn('Webcam devices permission failed:', err);
      setPermissionState('denied');
      setCameras(prev => prev.map(c => {
        if (c.isPhysical) {
          return { ...c, status: 'denied' };
        }
        return c;
      }));
      pushEvent('Main Lobby Entrance', 'error', 'Permission denied to access system camera hardware.', 'error');
    }
  };

  useEffect(() => {
    initWebcamDevices();
  }, []);

  // Sync event triggers for active cameras to feel "alive"
  useEffect(() => {
    const aiInterval = setInterval(() => {
      // Pick a random camera that is connected and has AI enabled
      const activeCams = cameras.filter(c => c.status === 'connected' && c.aiEnabled);
      if (activeCams.length === 0) return;

      const randomCam = activeCams[Math.floor(Math.random() * activeCams.length)];
      
      // Determine if matching student or unknown face
      const isUnknown = Math.random() > 0.85;
      
      if (isUnknown) {
        const uId = `UK-${Math.floor(Math.random() * 1000)}`;
        // Update box overlay for this cam
        setDetectedFaces(prev => ({
          ...prev,
          [randomCam.id]: {
            name: 'Unknown Intruder',
            studentId: 'N/A',
            department: 'Unregistered',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
            confidence: +(0.35 + Math.random() * 0.15).toFixed(3),
            attendanceStatus: 'BLOCKED / ALARMED',
            course: 'N/A',
            year: 'N/A',
            section: 'N/A',
            group: 'N/A',
            classroom: 'N/A',
            box: { x: 150 + Math.random() * 50, y: 80 + Math.random() * 40, width: 220, height: 220 }
          }
        }));

        pushEvent(randomCam.name, 'unknown', `Alert! Unrecognized threat vector detected inside ${randomCam.roomNumber}.`, 'warning');

        if (onAddUnknownAlert) {
          onAddUnknownAlert({
            id: `uk-${Date.now()}`,
            timestamp: new Date().toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
            confidence: 0.48,
            cameraLocation: `${randomCam.name} (${randomCam.location})`,
            status: 'unresolved'
          });
        }
      } else {
        // Pick a random student
        const randStudent = studentList[Math.floor(Math.random() * studentList.length)];
        const confidence = +(0.85 + Math.random() * 0.14).toFixed(3);

        setDetectedFaces(prev => ({
          ...prev,
          [randomCam.id]: {
            name: randStudent.name,
            studentId: randStudent.studentId,
            department: randStudent.department,
            photo: randStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
            confidence,
            attendanceStatus: 'VERIFIED PRESENT',
            course: 'Deep Learning Systems',
            year: '3rd Year',
            section: 'Beta Node',
            group: 'Core G-3',
            classroom: randomCam.roomNumber,
            box: { x: 180 + Math.random() * 40, y: 90 + Math.random() * 30, width: 200, height: 200 }
          }
        }));

        pushEvent(randomCam.name, 'recognized', `${randStudent.name} detected on biometrics radar.`, 'success');
        
        if (randomCam.autoAttendance) {
          pushEvent(randomCam.name, 'attendance', `Check-in logged for ${randStudent.name}.`, 'success');
          
          if (onAddRecognitionLog) {
            onAddRecognitionLog({
              studentId: randStudent.studentId,
              studentName: randStudent.name,
              department: randStudent.department,
              timestamp: new Date().toISOString(),
              status: 'present',
              confidence: +(confidence * 100).toFixed(1),
              verificationType: 'face',
              temperature: '98.4°F',
              maskWorn: false
            });
          }
        }
      }

      // Clear the overlay after 3 seconds so screen looks dynamic
      setTimeout(() => {
        setDetectedFaces(prev => ({
          ...prev,
          [randomCam.id]: null
        }));
      }, 3500);

    }, 6000);

    return () => clearInterval(aiInterval);
  }, [cameras, studentList]);

  // Auto reconnection loop
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      setCameras(prev => prev.map(c => {
        if (c.status === 'disconnected') {
          pushEvent(c.name, 'started', `Auto-reconnect triggered: link restored on camera channel ${c.id}.`, 'info');
          return {
            ...c,
            status: 'connected',
            health: {
              ...c.health,
              cpu: Math.floor(15 + Math.random() * 20),
              gpu: Math.floor(20 + Math.random() * 30),
              ram: Math.floor(30 + Math.random() * 20),
              latency: Math.floor(5 + Math.random() * 15),
              temperature: Math.floor(35 + Math.random() * 15),
              inferenceTime: +(6 + Math.random() * 8).toFixed(1),
              recognitionSpeed: Math.floor(100 + Math.random() * 80)
            }
          };
        }
        return c;
      }));
    }, 18000);

    return () => clearInterval(reconnectInterval);
  }, []);

  // Dynamic status-based event pusher
  const pushEvent = (
    cameraName: string, 
    type: CameraEvent['type'], 
    message: string, 
    severity: CameraEvent['severity']
  ) => {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    const newEvent: CameraEvent = {
      id: `evt-${Date.now()}-${Math.random()}`,
      timestamp: timeString,
      cameraName,
      type,
      message,
      severity
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
  };

  // Switch devices manually
  const handleDeviceSwitch = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    pushEvent('System Hardware', 'started', `Switched browser video source to device ID ${deviceId.substring(0, 8)}...`, 'info');
  };

  // Add Camera Handler
  const handleAddCameraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName || !newCamLocation || !newCamRoom) return;

    const newCam: CameraNode = {
      id: `CAM-0${cameras.length + 1}`,
      name: newCamName,
      location: newCamLocation,
      building: newCamBuilding,
      floor: newCamFloor,
      roomNumber: newCamRoom,
      department: newCamDept,
      status: 'connected',
      fps: 30,
      resolution: newCamResolution,
      recognitionStatus: 'active',
      attendanceStatus: 'enabled',
      recordingStatus: 'idle',
      brightness: 100,
      contrast: 100,
      exposure: 'auto',
      mirror: true,
      nightMode: false,
      aiEnabled: true,
      autoAttendance: true,
      isPhysical: false,
      health: {
        cpu: Math.floor(12 + Math.random() * 15),
        gpu: Math.floor(18 + Math.random() * 20),
        ram: Math.floor(25 + Math.random() * 15),
        latency: Math.floor(4 + Math.random() * 10),
        temperature: Math.floor(32 + Math.random() * 10),
        inferenceTime: +(7 + Math.random() * 6).toFixed(1),
        recognitionSpeed: Math.floor(90 + Math.random() * 60)
      },
      coordinates: { x: Math.floor(20 + Math.random() * 60), y: Math.floor(20 + Math.random() * 60) }
    };

    setCameras(prev => [...prev, newCam]);
    pushEvent(newCam.name, 'started', `New camera node ${newCam.id} deployed on institution network.`, 'success');
    
    // Reset form
    setNewCamName('');
    setNewCamLocation('');
    setNewCamRoom('');
    setShowAddModal(false);
  };

  // Remove Camera Handler
  const handleRemoveCamera = (id: string) => {
    const cam = cameras.find(c => c.id === id);
    if (!cam) return;
    if (confirm(`Confirm decommissioning of ${cam.name} (${cam.id}) from security layout?`)) {
      setCameras(prev => prev.filter(c => c.id !== id));
      pushEvent(cam.name, 'stopped', `Camera node ${cam.id} removed from configurations directory.`, 'error');
    }
  };

  // Toggle Settings Handlers
  const handleUpdateCameraSetting = (id: string, key: keyof CameraNode, value: any) => {
    setCameras(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, [key]: value };
      }
      return c;
    }));
  };

  // Scanner Simulator
  const triggerNetworkScan = () => {
    setIsScanning(true);
    pushEvent('Surveillance Radar', 'started', 'Initiated network IP discovery sweep for compatible RTSP/WebRTC devices...', 'info');
    
    setTimeout(() => {
      setIsScanning(false);
      // Discover or repair disconnected cameras
      setCameras(prev => prev.map(c => {
        if (c.status === 'disconnected' || c.status === 'not-found') {
          pushEvent(c.name, 'started', `Discovered and bound active RTSP stream on ${c.id}.`, 'success');
          return { ...c, status: 'connected' };
        }
        return c;
      }));
      pushEvent('Surveillance Radar', 'started', 'IP camera auto-discovery completed. All available node streams linked.', 'success');
    }, 3000);
  };

  // Capture Screenshot function from webcam or simulated frames
  const captureScreenshot = (cam: CameraNode) => {
    const timestamp = new Date().toLocaleTimeString();
    let url = 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80';
    
    if (cam.isPhysical && webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        url = screenshot;
      }
    } else {
      // Pick a beautiful mock scene based on department/building
      const mockScenes: { [key: string]: string } = {
        'Engineering': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
        'General Sciences': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
        'Security Division': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
        'Arts & Humanities': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80'
      };
      url = mockScenes[cam.department] || url;
    }

    const shotId = `shot-${Date.now()}`;
    setCapturedScreenshots(prev => [{ id: shotId, url, timestamp }, ...prev]);
    pushEvent(cam.name, 'recognized', `Snapshot capture compiled successfully: ${cam.id}-${Date.now()}.jpg`, 'success');
  };

  // Toggle Video Recording simulator
  const toggleRecording = (cam: CameraNode) => {
    if (cam.recordingStatus === 'recording') {
      // Stop recording
      if (recordingIntervals[cam.id]) {
        clearInterval(recordingIntervals[cam.id]);
      }
      
      setCameras(prev => prev.map(c => c.id === cam.id ? { ...c, recordingStatus: 'idle' } : c));
      pushEvent(cam.name, 'stopped', `Video recording stored: Rec_${cam.id}_${Date.now()}.mp4 (Duration: ${recordingTimers[cam.id] || 0}s)`, 'success');
      
      // Clean timer
      setRecordingTimers(prev => {
        const copy = { ...prev };
        delete copy[cam.id];
        return copy;
      });
    } else {
      // Start recording
      setCameras(prev => prev.map(c => c.id === cam.id ? { ...c, recordingStatus: 'recording' } : c));
      pushEvent(cam.name, 'started', `Started local MP4 recording capture on storage partition.`, 'info');
      
      setRecordingTimers(prev => ({ ...prev, [cam.id]: 0 }));
      const interval = setInterval(() => {
        setRecordingTimers(prev => {
          if (prev[cam.id] !== undefined) {
            return { ...prev, [cam.id]: prev[cam.id] + 1 };
          }
          return prev;
        });
      }, 1000);

      setRecordingIntervals(prev => ({ ...prev, [cam.id]: interval }));
    }
  };

  // Clean recording timers on unmount
  useEffect(() => {
    return () => {
      Object.values(recordingIntervals).forEach(interval => clearInterval(interval as any));
    };
  }, [recordingIntervals]);

  // Compute camera stats on-demand
  const totalCams = cameras.length;
  const onlineCams = cameras.filter(c => c.status === 'connected').length;
  const offlineCams = cameras.filter(c => c.status === 'disconnected' || c.status === 'denied').length;
  const recordingCams = cameras.filter(c => c.recordingStatus === 'recording').length;
  const activeAiCams = cameras.filter(c => c.recognitionStatus === 'active' && c.status === 'connected').length;
  const averageHealth = totalCams > 0 
    ? Math.round(cameras.reduce((acc, c) => acc + (c.status === 'connected' ? (100 - c.health.latency) : 0), 0) / totalCams)
    : 0;

  // Filter cameras
  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuildingFilter === 'All' || cam.building === selectedBuildingFilter;
    return matchesSearch && matchesBuilding;
  });

  return (
    <div id="camera-management-dashboard" className="space-y-8 pb-16">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#070d19]/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>AI CCTV Core Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Camera Management</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manage, monitor, configure, and stream all AI face recognition cameras across the institution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-scan-cameras"
            onClick={triggerNetworkScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning IP Nodes...</span>
              </>
            ) : (
              <>
                <Scan className="w-3.5 h-3.5" />
                <span>Scan Cameras</span>
              </>
            )}
          </button>

          <button
            id="btn-add-camera"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold text-xs tracking-wide transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Camera</span>
          </button>

          <button
            id="btn-refresh-devices"
            onClick={initWebcamDevices}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh local video devices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Engine Settings"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* 2. CAMERA DASHBOARD - STATS CARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Nodes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{totalCams}</span>
            <span className="text-[10px] text-slate-500 font-mono">Surveillance</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Online</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{onlineCams}</span>
            <span className="text-emerald-500 text-xs font-mono font-bold flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
              {Math.round((onlineCams/totalCams)*100)}%
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(onlineCams/totalCams)*100}%` }} />
          </div>
        </div>

        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Offline</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{offlineCams}</span>
            <span className="text-rose-500 text-[10px] font-mono">
              {offlineCams > 0 ? 'Diagnostic req' : 'No alerts'}
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${(offlineCams/totalCams)*100}%` }} />
          </div>
        </div>

        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Recording</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{recordingCams}</span>
            <span className="text-red-500 text-xs font-mono font-bold flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-600 mr-1 animate-pulse" />
              Rec Active
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-red-600" style={{ width: `${(recordingCams/totalCams)*100}%` }} />
          </div>
        </div>

        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">AI Active</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{activeAiCams}</span>
            <span className="text-cyan-400 text-xs font-mono font-bold flex items-center">
              <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
              YOLO
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${(activeAiCams/totalCams)*100}%` }} />
          </div>
        </div>

        <div className="bg-[#0b1329]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">System Health</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{averageHealth}%</span>
            <span className="text-amber-500 text-[10px] font-mono">Excellent</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: `${averageHealth}%` }} />
          </div>
        </div>

      </div>

      {/* FILTER SHELF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedBuildingFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              selectedBuildingFilter === 'All' 
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Buildings
          </button>
          {Array.from(new Set(cameras.map(c => c.building))).map(b => (
            <button
              key={b}
              onClick={() => setSelectedBuildingFilter(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                selectedBuildingFilter === b 
                  ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes, buildings, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* MAIN VIEW: CAMERA MAP & GRID SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE LOCATION FLOORPLAN (1/4 space) */}
        <div className="xl:col-span-1 bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
              <Map className="w-3.5 h-3.5 text-blue-500" />
              <span>Camera Map Layout</span>
            </div>
            <h3 className="text-base font-bold text-slate-200">Campus Spatial Grid</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Hover over or click nodes on the interactive floor-plan grid to instantly lock video streaming priorities.
            </p>
          </div>

          {/* Stylized Floor Plan Visualizer */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#0c142b] via-[#050812] to-[#12203b] border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 group">
            {/* Tech grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            {/* Stylized Walls */}
            <div className="absolute top-[15%] left-[10%] right-[10%] h-[1px] bg-slate-800/80" />
            <div className="absolute bottom-[20%] left-[10%] right-[10%] h-[1px] bg-slate-800/80" />
            <div className="absolute top-[15%] bottom-[20%] left-[45%] w-[1px] bg-slate-800/80" />
            <div className="absolute top-[15%] bottom-[20%] left-[75%] w-[1px] bg-slate-800/80" />
            
            {/* Sector names labels */}
            <div className="absolute top-[5%] left-[5%] text-[8px] font-mono font-bold text-slate-600">SECTOR ALPHA</div>
            <div className="absolute top-[18%] left-[12%] text-[9px] font-mono text-slate-500">ADMIN LOBBY</div>
            <div className="absolute top-[18%] left-[48%] text-[9px] font-mono text-slate-500">SCIENCE DEPT</div>
            <div className="absolute top-[18%] left-[78%] text-[9px] font-mono text-slate-500">LIBRARY WING</div>
            <div className="absolute bottom-[24%] left-[12%] text-[9px] font-mono text-slate-500">ENG ANNEX</div>

            {/* Glowing Camera Dots */}
            {cameras.map(cam => {
              const isSelected = cam.id === selectedCameraId;
              const isOnline = cam.status === 'connected';

              return (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCameraId(cam.id)}
                  style={{ left: `${cam.coordinates.x}%`, top: `${cam.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group/dot cursor-pointer"
                  title={`${cam.name} (${cam.id})`}
                >
                  <span className={`absolute inline-flex h-6 w-6 rounded-full -left-2.5 -top-2.5 opacity-20 transition-all ${
                    isSelected ? 'bg-blue-400 scale-125 animate-ping' : isOnline ? 'bg-emerald-400 scale-100' : 'bg-rose-400'
                  }`} />
                  
                  <div className={`h-2.5 w-2.5 rounded-full border border-slate-950 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-blue-400 scale-150 ring-2 ring-blue-500/50' 
                      : isOnline 
                        ? 'bg-emerald-500' 
                        : 'bg-rose-500'
                  }`} />

                  {/* Micro hover card */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 p-2 rounded text-[9px] text-slate-300 whitespace-nowrap opacity-0 pointer-events-none group-hover/dot:opacity-100 transition-opacity duration-200 z-30 font-mono shadow-xl">
                    <p className="font-bold text-white">{cam.name}</p>
                    <p className="text-slate-500 text-[8px]">{cam.roomNumber} • {cam.status.toUpperCase()}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Hardware Health Summary info */}
          <div className="bg-[#0b1329]/30 border border-slate-850 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
              <span className="text-slate-400 font-semibold">Active Streams</span>
              <span className="font-mono text-slate-200 font-bold">{onlineCams} / {totalCams}</span>
            </div>
            
            <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Bandwidth Consumption:</span>
                <span className="text-slate-200">12.4 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Mean Inference Delay:</span>
                <span className="text-emerald-450 font-bold">8.1 ms</span>
              </div>
              <div className="flex justify-between">
                <span>Recognition Load Speed:</span>
                <span className="text-blue-400">114 faces/sec</span>
              </div>
            </div>
          </div>

          {/* EVENT LOG / AUDIT TIMELINE TAPE */}
          <div className="flex flex-col space-y-3 flex-1 min-h-[220px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-850 pb-2">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Edge Stream Event Log</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Live ticker</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[240px] pr-1.5 space-y-2.5 custom-scrollbar text-[10px] font-mono">
              {events.map(evt => (
                <div 
                  key={evt.id} 
                  className="p-2 rounded bg-slate-950/40 border border-slate-900 flex flex-col space-y-1 hover:border-slate-850 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500">{evt.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      evt.severity === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      evt.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      evt.severity === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {evt.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-500 font-bold text-[8px]">{evt.cameraName}</span>
                  <p className="text-slate-300 leading-tight">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE CAMERA SURVEILLANCE GRID (3/4 space) */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Grid className="w-4 h-4 text-blue-500" />
              <span>Surveillance Viewports Grid</span>
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Displaying <span className="text-slate-200 font-bold">{filteredCameras.length}</span> matching nodes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCameras.map(cam => {
              const isSelected = cam.id === selectedCameraId;
              const isOnline = cam.status === 'connected';
              const isRecording = cam.recordingStatus === 'recording';
              const recTimer = recordingTimers[cam.id];
              const faceOverlay = detectedFaces[cam.id];

              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedCameraId(cam.id)}
                  className={`bg-[#0a0f1d]/60 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative ${
                    isSelected 
                      ? 'border-blue-500/80 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20' 
                      : 'border-slate-850 hover:border-slate-750'
                  }`}
                >
                  {/* LIVE STREAM VIEWFINDER CONTAINER */}
                  <div className="relative aspect-[16/10] bg-[#070a14] overflow-hidden group/view">
                    
                    {/* CAMERA RECORDING PULSE BULB */}
                    {isRecording && (
                      <div className="absolute top-3 left-3 z-30 flex items-center space-x-1.5 bg-red-650/90 backdrop-blur border border-red-500 px-2 py-0.5 rounded-full text-[8px] font-bold text-white font-mono animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        <span>REC {recTimer !== undefined ? `${Math.floor(recTimer / 60).toString().padStart(2, '0')}:${(recTimer % 60).toString().padStart(2, '0')}` : '00:00'}</span>
                      </div>
                    )}

                    {/* OVERLAY META TAGS (TOP RIGHT) */}
                    <div className="absolute top-3 right-3 z-30 flex items-center space-x-1.5">
                      <span className="bg-slate-950/80 backdrop-blur border border-slate-850 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400 font-bold uppercase">
                        {cam.resolution}
                      </span>
                      <span className="bg-slate-950/80 backdrop-blur border border-slate-850 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400 font-bold uppercase">
                        {cam.fps} FPS
                      </span>
                    </div>

                    {/* PHYSICAL CLIENT-SIDE WEBCAM STREAM */}
                    {cam.isPhysical && isOnline && permissionState === 'granted' && (
                      <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                          width: 640,
                          height: 480,
                          facingMode: "user"
                        }}
                        style={{ filter: `brightness(${cam.brightness}%) contrast(${cam.contrast}%) ${cam.nightMode ? 'invert(1) hue-rotate(180deg) grayscale(0.5)' : ''}` }}
                        className={`absolute inset-0 w-full h-full object-cover ${cam.mirror ? 'transform scale-x-[-1]' : ''}`}
                        disablePictureInPicture={false}
                        forceScreenshotSourceSize={false}
                        imageSmoothing={true}
                        mirrored={false}
                        screenshotQuality={0.92}
                        onUserMedia={() => {}}
                        onUserMediaError={() => {}}
                      />
                    )}

                    {/* SIMULATED SURVEILLANCE FEED LOOP */}
                    {!cam.isPhysical && isOnline && (
                      <div className="absolute inset-0 w-full h-full relative">
                        {/* Elegant background simulation */}
                        <img 
                          src={
                            cam.department === 'Engineering' ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' :
                            cam.department === 'General Sciences' ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80' :
                            cam.department === 'Arts & Humanities' ? 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' :
                            'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80'
                          } 
                          alt="surveillance-sim"
                          style={{ filter: `brightness(${cam.brightness - 20}%) contrast(${cam.contrast}%) ${cam.nightMode ? 'invert(1) hue-rotate(180deg) grayscale(0.6)' : ''}` }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay scan effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />
                        
                        {/* Matrix HUD Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                      </div>
                    )}

                    {/* AI BIOMETRIC VISUAL OVERLAYS */}
                    {isOnline && cam.aiEnabled && (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        {faceOverlay ? (
                          <div className="absolute inset-0">
                            {/* Scanning box */}
                            <div 
                              style={{ 
                                left: `${faceOverlay.box.x / 6}%`, 
                                top: `${faceOverlay.box.y / 4}%`,
                                width: `${faceOverlay.box.width / 5}%`,
                                height: `${faceOverlay.box.height / 3.5}%`
                              }}
                              className={`absolute border-2 rounded transition-all duration-300 ${
                                faceOverlay.name.includes('Unknown') ? 'border-rose-500' : 'border-green-500'
                              }`}
                            >
                              {/* Laser Scan line inside box */}
                              <div className={`absolute left-0 right-0 h-0.5 animate-bounce ${
                                faceOverlay.name.includes('Unknown') ? 'bg-rose-500' : 'bg-green-500'
                              }`} style={{ top: '35%' }} />

                              {/* Student Badge Card details pinned to Bounding Box */}
                              <div className="absolute -top-32 left-0 z-20 bg-slate-950/95 border border-slate-800 p-2.5 rounded-lg text-[9px] font-mono text-slate-350 shadow-2xl min-w-[200px] flex items-center space-x-3 pointer-events-auto">
                                <img 
                                  src={faceOverlay.photo} 
                                  alt="verified-avatar" 
                                  className="w-10 h-10 rounded object-cover border border-slate-800"
                                />
                                <div className="space-y-0.5 flex-1">
                                  <h4 className="font-bold text-white leading-tight flex items-center">
                                    {faceOverlay.name.includes('Unknown') ? (
                                      <UserX className="w-3 h-3 text-rose-500 mr-1" />
                                    ) : (
                                      <UserCheck className="w-3 h-3 text-green-500 mr-1" />
                                    )}
                                    {faceOverlay.name}
                                  </h4>
                                  <p className="text-slate-500 text-[8px]">{faceOverlay.studentId}</p>
                                  <p className="text-[8px] text-slate-400">Dept: {faceOverlay.department}</p>
                                  <p className="text-[8px] text-slate-400">Class: {faceOverlay.classroom}</p>
                                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 pt-1 border-t border-slate-900 mt-1">
                                    <span>CONFIDENCE:</span>
                                    <span className={faceOverlay.name.includes('Unknown') ? 'text-rose-400' : 'text-green-400'}>
                                      {(faceOverlay.confidence * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Basic surveillance grid targets if empty */
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 border border-blue-500/20 rounded relative">
                              <div className="absolute -top-1 -left-1 h-3.5 w-3.5 border-t border-l border-blue-400" />
                              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 border-t border-r border-blue-400" />
                              <div className="absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b border-l border-blue-400" />
                              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 border-b border-r border-blue-400" />
                              <div className="absolute left-0 right-0 h-[1px] bg-blue-500/10 animate-pulse" style={{ top: '50%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ERROR PANEL: PERMISSION DENIED */}
                    {cam.status === 'denied' && (
                      <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Permission Blocked</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5 max-w-[220px]">
                          Please enable system camera permissions in your browser URL settings.
                        </p>
                        <button
                          onClick={initWebcamDevices}
                          className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Allow Access
                        </button>
                      </div>
                    )}

                    {/* ERROR PANEL: HARDWARE NOT FOUND / DISCOVERY */}
                    {cam.status === 'not-found' && (
                      <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
                        <CameraOff className="w-10 h-10 text-orange-500 mb-3" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Video Hardware Not Found</h4>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                          Verify USB connectivity, re-insert webcam node, or trigger discovery scanner below.
                        </p>
                        <button
                          onClick={triggerNetworkScan}
                          className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Diagnose Network
                        </button>
                      </div>
                    )}

                    {/* OFFLINE STANDBY COMPONENT / DISCONNECTED */}
                    {cam.status === 'disconnected' && (
                      <div className="absolute inset-0 z-20 bg-gradient-to-br from-[#0c0f17] to-[#04060b] flex flex-col items-center justify-center text-center p-4">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-3" />
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Channel Offline</h4>
                        <p className="text-[9px] text-slate-500 mt-1">Establishing handshake... Auto re-connecting</p>
                      </div>
                    )}

                    {/* STANDBY SHUTDOWN (When start camera is manual stopped) */}
                    {cam.status === 'initializing' && (
                      <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center text-center p-4">
                        <Video className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Stream Standby</h4>
                        <p className="text-[9px] text-slate-600 mt-0.5">Click Start Camera to deploy streams feed.</p>
                      </div>
                    )}

                    {/* FLOATING ACTION TOOLBAR OVERLAY (BOTTOM VIEWFINDER) */}
                    {isOnline && (
                      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between bg-slate-950/85 backdrop-blur-md border border-slate-850 px-2.5 py-1.5 rounded-lg opacity-0 group-hover/view:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center space-x-1.5">
                          {isRecording ? (
                            <button
                              onClick={() => toggleRecording(cam)}
                              className="p-1 rounded bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-200 cursor-pointer"
                              title="Stop Recording"
                            >
                              <Square className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleRecording(cam)}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white cursor-pointer"
                              title="Record Stream"
                            >
                              <Play className="w-3 h-3 text-red-500" />
                            </button>
                          )}

                          <button
                            onClick={() => captureScreenshot(cam)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white cursor-pointer"
                            title="Snapshot"
                          >
                            <Camera className="w-3 h-3 text-blue-400" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setFullscreenCamId(cam.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white cursor-pointer"
                            title="Maximize viewport"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* CAMERA CARD DETAILS & SPEC SHEET */}
                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-200">{cam.name}</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{cam.id} • {cam.location}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                          isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cam.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Hardware statistics table */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 mt-3 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                        <div className="flex justify-between">
                          <span>Building:</span>
                          <span className="text-slate-350">{cam.building}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Floor:</span>
                          <span className="text-slate-350">{cam.floor} ({cam.roomNumber})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span className="text-slate-350 truncate max-w-[90px]">{cam.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Recognition:</span>
                          <span className={cam.aiEnabled ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                            {cam.aiEnabled ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attendance Marking:</span>
                          <span className={cam.autoAttendance ? 'text-emerald-450 font-bold' : 'text-slate-500'}>
                            {cam.autoAttendance ? 'AUTO' : 'MANUAL'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Local Recording:</span>
                          <span className={isRecording ? 'text-red-400 font-bold animate-pulse' : 'text-slate-500'}>
                            {isRecording ? 'RECORDING' : 'STANDBY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INDIVIDUAL CAMERA HEALTH GRAPHS BAR */}
                    {isOnline && (
                      <div className="bg-[#0b1222]/40 border border-slate-900 p-2.5 rounded-lg space-y-2 text-[8px] font-mono">
                        <div className="text-[9px] text-slate-400 font-bold flex items-center justify-between">
                          <span>METRIC SPEC SHEETS</span>
                          <Activity className="w-3 h-3 text-blue-500" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-slate-400">
                          <div className="bg-slate-950/60 p-1.5 rounded flex flex-col">
                            <span>CPU usage</span>
                            <span className="text-slate-200 font-bold text-[10px]">{cam.health.cpu}%</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded flex flex-col">
                            <span>GPU core</span>
                            <span className="text-slate-200 font-bold text-[10px]">{cam.health.gpu}%</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded flex flex-col">
                            <span>RAM allocation</span>
                            <span className="text-slate-200 font-bold text-[10px]">{cam.health.ram}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[8px] text-slate-500 pt-1 mt-1 border-t border-slate-900">
                          <span>Latency: {cam.health.latency}ms</span>
                          <span>Inference: {cam.health.inferenceTime}ms</span>
                          <span>Temp: {cam.health.temperature}°C</span>
                        </div>
                      </div>
                    )}

                    {/* BOTTOM INTERACTIVE CAMERA COMMANDS TOOLBAR */}
                    <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-900">
                      {isOnline ? (
                        <button
                          onClick={() => {
                            handleUpdateCameraSetting(cam.id, 'status', 'initializing');
                            pushEvent(cam.name, 'stopped', `Camera channel offline manually.`, 'warning');
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white transition-colors cursor-pointer text-[9px] font-semibold"
                        >
                          <Video className="w-3.5 h-3.5 text-red-500 mb-1" />
                          <span>Stop</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleUpdateCameraSetting(cam.id, 'status', 'connected');
                            pushEvent(cam.name, 'started', `Camera channel deployed manually.`, 'success');
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white transition-colors cursor-pointer text-[9px] font-semibold"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-500 mb-1" />
                          <span>Start</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleUpdateCameraSetting(cam.id, 'status', 'disconnected');
                          pushEvent(cam.name, 'started', `Hot reboot stream requested. Commencing diagnostics...`, 'info');
                          setTimeout(() => {
                            handleUpdateCameraSetting(cam.id, 'status', 'connected');
                            pushEvent(cam.name, 'started', `Hot reboot restored on channel ${cam.id}.`, 'success');
                          }, 1500);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white transition-colors cursor-pointer text-[9px] font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400 mb-1" />
                        <span>Reboot</span>
                      </button>

                      {/* Test Mode */}
                      <button
                        onClick={() => {
                          pushEvent(cam.name, 'recognized', `Initiating synthetic model test validation cycle...`, 'info');
                          // Trigger quick mock recognition overlay
                          const randStudent = studentList[Math.floor(Math.random() * studentList.length)];
                          setDetectedFaces(prev => ({
                            ...prev,
                            [cam.id]: {
                              name: randStudent.name,
                              studentId: randStudent.studentId,
                              department: randStudent.department,
                              photo: randStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
                              confidence: 0.994,
                              attendanceStatus: 'TEST SUCCEEDED',
                              course: 'Security Validation',
                              year: 'Beta Test',
                              section: 'Node Test',
                              group: 'G-TEST',
                              classroom: cam.roomNumber,
                              box: { x: 200, y: 100, width: 200, height: 200 }
                            }
                          }));
                          setTimeout(() => {
                            setDetectedFaces(prev => ({ ...prev, [cam.id]: null }));
                          }, 3000);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white transition-colors cursor-pointer text-[9px] font-semibold"
                      >
                        <Sliders className="w-3.5 h-3.5 text-orange-400 mb-1" />
                        <span>Test</span>
                      </button>

                      <button
                        onClick={() => handleRemoveCamera(cam.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/40 hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 transition-colors cursor-pointer text-[9px] font-semibold border border-transparent hover:border-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 mb-1" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* EXPANDABLE CAMERA CONFIG SLIDERS */}
                    {isOnline && (
                      <div className="pt-3.5 mt-3.5 border-t border-slate-900 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-350">
                          <span className="flex items-center">
                            <Sliders className="w-3 h-3 text-slate-400 mr-1.5" />
                            <span>Node Tuning parameters</span>
                          </span>
                        </div>

                        <div className="space-y-2 text-[9px] font-mono">
                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-400">
                              <span>Brightness:</span>
                              <span className="text-white font-bold">{cam.brightness}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={cam.brightness}
                              onChange={(e) => handleUpdateCameraSetting(cam.id, 'brightness', +e.target.value)}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-400">
                              <span>Contrast:</span>
                              <span className="text-white font-bold">{cam.contrast}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={cam.contrast}
                              onChange={(e) => handleUpdateCameraSetting(cam.id, 'contrast', +e.target.value)}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateCameraSetting(cam.id, 'mirror', !cam.mirror)}
                            className={`px-2 py-1 rounded text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                              cam.mirror 
                                ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' 
                                : 'bg-slate-950 border border-slate-900 text-slate-500'
                            }`}
                          >
                            Mirror View
                          </button>
                          
                          <button
                            onClick={() => handleUpdateCameraSetting(cam.id, 'nightMode', !cam.nightMode)}
                            className={`px-2 py-1 rounded text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                              cam.nightMode 
                                ? 'bg-amber-600/10 border border-amber-500/20 text-amber-400' 
                                : 'bg-slate-950 border border-slate-900 text-slate-500'
                            }`}
                          >
                            Night Vision
                          </button>

                          <button
                            onClick={() => handleUpdateCameraSetting(cam.id, 'aiEnabled', !cam.aiEnabled)}
                            className={`px-2 py-1 rounded text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                              cam.aiEnabled 
                                ? 'bg-cyan-600/10 border border-cyan-500/20 text-cyan-400' 
                                : 'bg-slate-950 border border-slate-900 text-slate-500'
                            }`}
                          >
                            AI Bounding
                          </button>

                          <button
                            onClick={() => handleUpdateCameraSetting(cam.id, 'autoAttendance', !cam.autoAttendance)}
                            className={`px-2 py-1 rounded text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                              cam.autoAttendance 
                                ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-slate-950 border border-slate-900 text-slate-500'
                            }`}
                          >
                            Auto Roll
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* DETAILED SCREENSHOT GALLERY DRAWER */}
      {capturedScreenshots.length > 0 && (
        <div className="bg-[#070b15]/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>Snapshot captures directory</span>
            </h3>
            <button
              onClick={() => setCapturedScreenshots([])}
              className="text-[10px] text-slate-500 hover:text-slate-350 cursor-pointer font-semibold underline"
            >
              Clear Gallery
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {capturedScreenshots.map(shot => (
              <div key={shot.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 group shadow-lg">
                <img src={shot.url} alt="screenshot-thumb" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2 text-[8px] font-mono text-white">
                  <span>{shot.timestamp}</span>
                  <a 
                    href={shot.url} 
                    download={`facevision-shot-${shot.id}.jpg`}
                    className="bg-blue-600 hover:bg-blue-500 text-center py-1 rounded text-[7px] font-bold cursor-pointer transition-colors"
                  >
                    Save File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================
          MODALS & OVERLAYS 
          ============================================== */}

      {/* ADD CAMERA POPUP MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  <span>Configure New Camera Stream</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCameraSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Camera Node Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Lab West"
                    value={newCamName}
                    onChange={(e) => setNewCamName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Specific Location / Desk</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reception desk A"
                    value={newCamLocation}
                    onChange={(e) => setNewCamLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Building Sector</label>
                    <select
                      value={newCamBuilding}
                      onChange={(e) => setNewCamBuilding(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Main Building">Main Building</option>
                      <option value="Administration">Administration</option>
                      <option value="Science block">Science block</option>
                      <option value="Engineering Annex">Engineering Annex</option>
                      <option value="Library Wing">Library Wing</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Floor Level</label>
                    <select
                      value={newCamFloor}
                      onChange={(e) => setNewCamFloor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="Basement">Basement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Room Number / Lab</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104"
                      value={newCamRoom}
                      onChange={(e) => setNewCamRoom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Department Link</label>
                    <select
                      value={newCamDept}
                      onChange={(e) => setNewCamDept(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="General Sciences">General Sciences</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Security Division">Security Division</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Capture Resolution</label>
                  <select
                    value={newCamResolution}
                    onChange={(e) => setNewCamResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all shadow-lg shadow-blue-500/20"
                  >
                    Deploy Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ENGINE SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Global Biometrics Settings</span>
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-2.5 text-xs text-slate-350 leading-relaxed">
                  <p className="font-bold text-slate-200">System Level Weights</p>
                  <p>
                    These coefficients parameterize the local edge YOLOv8 model inference matrix across all active channels. Only change under certified system administrators supervisions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Face Mesh Confidence Bounds</label>
                  <input 
                    type="range" 
                    min="75" 
                    max="99" 
                    defaultValue="90"
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Relaxed (75%)</span>
                    <span>Standard (90%)</span>
                    <span>Strict (99%)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Hardware Acceleration:</span>
                    <span className="font-bold text-emerald-450 font-mono">CUDA (ON)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Frame Skip Ratio:</span>
                    <span className="font-bold text-slate-200 font-mono">1:3 frames</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-end">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    Save & Apply Weights
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN CAM VIEWFINDER MODALFallback */}
      <AnimatePresence>
        {fullscreenCamId && (
          <div className="fixed inset-0 z-50 bg-[#040712] flex flex-col items-center justify-center p-6 select-none">
            {/* Exit button */}
            <button
              onClick={() => setFullscreenCamId(null)}
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-slate-900 border border-slate-850 text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const fCam = cameras.find(c => c.id === fullscreenCamId);
              if (!fCam) return null;
              const fOverlay = detectedFaces[fCam.id];

              return (
                <div className="relative w-full max-w-5xl aspect-video bg-[#070b16] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  {/* Web Video */}
                  {fCam.isPhysical && permissionState === 'granted' && (
                    <Webcam
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                        width: 1280,
                        height: 720,
                        facingMode: "user"
                      }}
                      style={{ filter: `brightness(${fCam.brightness}%) contrast(${fCam.contrast}%) ${fCam.nightMode ? 'invert(1) hue-rotate(180deg) grayscale(0.5)' : ''}` }}
                      className={`absolute inset-0 w-full h-full object-cover ${fCam.mirror ? 'transform scale-x-[-1]' : ''}`}
                      disablePictureInPicture={false}
                      forceScreenshotSourceSize={false}
                      imageSmoothing={true}
                      mirrored={false}
                      screenshotQuality={0.92}
                      onUserMedia={() => {}}
                      onUserMediaError={() => {}}
                    />
                  )}

                  {!fCam.isPhysical && (
                    <img 
                      src={
                        fCam.department === 'Engineering' ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1280&q=80' :
                        fCam.department === 'General Sciences' ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1280&q=80' :
                        fCam.department === 'Arts & Humanities' ? 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1280&q=80' :
                        'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1280&q=80'
                      } 
                      alt="surveillance-fullscreen"
                      style={{ filter: `brightness(${fCam.brightness - 20}%) contrast(${fCam.contrast}%) ${fCam.nightMode ? 'invert(1) hue-rotate(180deg) grayscale(0.6)' : ''}` }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Laser scan lines and target grid overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                  {/* AI Bounding boxes on fullscreen */}
                  {fCam.aiEnabled && fOverlay && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <div 
                        style={{ 
                          left: `${fOverlay.box.x / 4.5}%`, 
                          top: `${fOverlay.box.y / 3}%`,
                          width: `${fOverlay.box.width / 4}%`,
                          height: `${fOverlay.box.height / 2.5}%`
                        }}
                        className={`absolute border-[3px] rounded transition-all duration-300 ${
                          fOverlay.name.includes('Unknown') ? 'border-rose-500' : 'border-green-500'
                        }`}
                      >
                        <div className={`absolute left-0 right-0 h-1 animate-bounce ${
                          fOverlay.name.includes('Unknown') ? 'bg-rose-500' : 'bg-green-500'
                        }`} style={{ top: '45%' }} />

                        {/* Large student badge */}
                        <div className="absolute -top-36 left-0 z-20 bg-slate-950/95 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-350 shadow-2xl min-w-[280px] flex items-center space-x-4 pointer-events-auto">
                          <img 
                            src={fOverlay.photo} 
                            alt="verified-avatar" 
                            className="w-14 h-14 rounded-lg object-cover border border-slate-800"
                          />
                          <div className="space-y-1 flex-1">
                            <h4 className="font-bold text-white text-sm leading-tight flex items-center">
                              {fOverlay.name.includes('Unknown') ? (
                                <UserX className="w-4 h-4 text-rose-500 mr-1.5" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-green-500 mr-1.5" />
                              )}
                              {fOverlay.name}
                            </h4>
                            <p className="text-slate-500 text-[10px]">{fOverlay.studentId}</p>
                            <p className="text-[10px] text-slate-400">Department: {fOverlay.department}</p>
                            <p className="text-[10px] text-slate-400">Section: {fOverlay.section} ({fOverlay.group})</p>
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1.5 border-t border-slate-900 mt-1.5">
                              <span>MATCH SURETY:</span>
                              <span className={fOverlay.name.includes('Unknown') ? 'text-rose-400' : 'text-green-400'}>
                                {(fOverlay.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fullscreen bottom header bar */}
                  <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 backdrop-blur border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <h4 className="text-white font-bold text-sm">{fCam.name}</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">{fCam.id} • {fCam.building} • Floor {fCam.floor}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[9px]">ENGINE WEIGHTS</span>
                        <span className="text-blue-400 font-bold">YOLOv8-Face-Active</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[9px]">RESOLUTION</span>
                        <span className="text-white font-bold">{fCam.resolution}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
