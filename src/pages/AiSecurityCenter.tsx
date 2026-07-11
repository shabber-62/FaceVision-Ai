import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Video,
  Camera,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Download,
  Upload,
  UserX,
  UserCheck,
  Eye,
  Sliders,
  Bell,
  CheckCircle2,
  XCircle,
  Cpu,
  Activity,
  HardDrive,
  Database,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  Terminal,
  FileText,
  Server,
  UserCheck2,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// Core security structures
interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'spoof' | 'unauthorized' | 'tampering' | 'failed_auth' | 'login_attempt' | 'db_event' | 'api_event';
  message: string;
  camera: string;
  location: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'blocked' | 'logged' | 'resolved';
}

interface SystemAudit {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'Student Registration' | 'Attendance Changes' | 'User Login' | 'Role Changes' | 'Camera Changes' | 'AI Settings' | 'Database Changes';
  status: 'success' | 'warning' | 'danger';
  details: string;
}

interface UnknownPerson {
  id: string;
  imageUrl: string;
  detectionTime: string;
  confidence: number;
  camera: string;
  location: string;
  threatLevel: 'medium' | 'high' | 'critical';
  status: 'unresolved' | 'registered' | 'ignored' | 'blacklisted';
}

export default function AiSecurityCenter() {
  // Page state controllers
  const [activeTab, setActiveTab] = useState<'realtime' | 'insights' | 'logs' | 'settings'>('realtime');
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeAttackSimulation, setActiveAttackSimulation] = useState<string | null>(null);
  
  // Real-time threat status & simulation variables
  const [globalThreatLevel, setGlobalThreatLevel] = useState<'low' | 'moderate' | 'critical'>('moderate');
  const [securityScore, setSecurityScore] = useState<number>(98.6);
  const [showIncidentAlert, setShowIncidentAlert] = useState(false);
  const [activeIncident, setActiveIncident] = useState<{
    attackType: string;
    camera: string;
    time: string;
    confidence: number;
    screenshot?: string;
  } | null>(null);

  // Stats Counters state
  const [stats, setStats] = useState({
    totalEvents: 142,
    spoofAttempts: 12,
    blockedUsers: 5,
    unknownVisitors: 24,
    suspiciousActivities: 3
  });

  // Settings State
  const [settings, setSettings] = useState({
    enableAntiSpoofing: true,
    recognitionThreshold: 85, // %
    livenessThreshold: 78,    // %
    lockUnknownFaces: true,
    autoBlacklist: false,
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true
  });

  // Security and Audit log arrays
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([
    { id: 'sec-1', timestamp: '2026-07-11 12:15:22', type: 'spoof', message: 'Printed Photo Spoof Attack Blocked', camera: 'CCTV-LOBBY-01', location: 'Main Entrance Lobby', threatLevel: 'high', status: 'blocked' },
    { id: 'sec-2', timestamp: '2026-07-11 11:58:10', type: 'tampering', message: 'Camera feed connection interruption detected', camera: 'CCTV-LAB-03', location: 'Neural Computing Lab', threatLevel: 'medium', status: 'logged' },
    { id: 'sec-3', timestamp: '2026-07-11 11:42:01', type: 'unauthorized', message: 'Failed verification limit exceeded', camera: 'CCTV-OFFICE-02', location: 'Administration Office', threatLevel: 'high', status: 'blocked' },
    { id: 'sec-4', timestamp: '2026-07-11 10:30:15', type: 'login_attempt', message: 'Failed Super Admin password attempt from IP 192.168.1.144', camera: 'SYSTEM', location: 'Control Room Console', threatLevel: 'high', status: 'logged' },
    { id: 'sec-5', timestamp: '2026-07-11 09:12:45', type: 'db_event', message: 'Automated database schema snapshot created', camera: 'CLOUD-DB', location: 'Server Core', threatLevel: 'low', status: 'logged' },
    { id: 'sec-6', timestamp: '2026-07-11 08:44:12', type: 'api_event', message: 'Bulk attendance push callback verified by token', camera: 'API-CORE', location: 'Middleware Host', threatLevel: 'low', status: 'logged' }
  ]);

  const [auditLogs, setAuditLogs] = useState<SystemAudit[]>([
    { id: 'aud-1', timestamp: '2026-07-11 12:04:15', user: 'Admin Sarah', action: 'Change AI Settings', category: 'AI Settings', status: 'success', details: 'Increased Anti-Spoof detection threshold to 78%' },
    { id: 'aud-2', timestamp: '2026-07-11 11:30:00', user: 'Dr. Evelyn Carter', action: 'Update Student Registration', category: 'Student Registration', status: 'success', details: 'Registered supplementary 3D facial dataset for Alexander Wright' },
    { id: 'aud-3', timestamp: '2026-07-11 11:15:22', user: 'System Agent', action: 'Override Attendance', category: 'Attendance Changes', status: 'warning', details: 'Manual present override marked for Elena Rostova due to bandage' },
    { id: 'aud-4', timestamp: '2026-07-11 10:02:44', user: 'Super Admin', action: 'Modify Security Role', category: 'Role Changes', status: 'danger', details: 'Revoked developer role authorization key for S105' },
    { id: 'aud-5', timestamp: '2026-07-11 09:20:11', user: 'Admin Sarah', action: 'Configure Camera Node', category: 'Camera Changes', status: 'success', details: 'Repositioned focus field and optimized YOLO resolution matrix for CCTV-101' },
    { id: 'aud-6', timestamp: '2026-07-11 08:15:00', user: 'System Daemon', action: 'Automated DB Maintenance', category: 'Database Changes', status: 'success', details: 'Optimized vector search indexing tables for faster enrollment retrieval' }
  ]);

  // Unknown/Suspicious visitors database state
  const [unknownPeople, setUnknownPeople] = useState<UnknownPerson[]>([
    { id: 'un-1', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', detectionTime: '12:22:45 PM', confidence: 42.1, camera: 'CCTV-GATE-01', location: 'External Entry Archway', threatLevel: 'medium', status: 'unresolved' },
    { id: 'un-2', imageUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=250', detectionTime: '11:45:10 AM', confidence: 18.5, camera: 'CCTV-LOBBY-02', location: 'Main Reception Lounge', threatLevel: 'high', status: 'unresolved' },
    { id: 'un-3', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250', detectionTime: '10:05:32 AM', confidence: 34.2, camera: 'CCTV-ROBO-X', location: 'Robotics Workshop Lounge', threatLevel: 'critical', status: 'unresolved' }
  ]);

  // Liveness Interactive Challenge parameters
  const [livenessChallenge, setLivenessChallenge] = useState({
    id: 1,
    prompt: 'Blink Your Eyes Twice',
    icon: '👁️',
    completed: false,
    timer: 10
  });

  const challengesList = [
    { id: 1, prompt: 'Blink Your Eyes Twice', icon: '👁️' },
    { id: 2, prompt: 'Turn Your Head Slightly Left', icon: '⬅️' },
    { id: 3, prompt: 'Turn Your Head Slightly Right', icon: '➡️' },
    { id: 4, prompt: 'Look Straight and Smile Elegantly', icon: '😊' },
    { id: 5, prompt: 'Look Downwards', icon: '⬇️' },
    { id: 6, prompt: 'Look Upwards', icon: '⬆️' },
    { id: 7, prompt: 'Move Slightly Closer to Camera', icon: '🔍' },
    { id: 8, prompt: 'Move Slightly Backwards', icon: '📏' }
  ];

  // Dynamic system telemetry metrics
  const [telemetry, setTelemetry] = useState({
    cpu: 34.5,
    gpu: 48.2,
    memory: 61.9,
    disk: 55.4,
    network: 2.4 // MBps
  });

  // Animated landmark detection coordinates
  const [landmarks, setLandmarks] = useState<{x: number, y: number}[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active biometrics scan simulation parameters
  const [biometricsHUD, setBiometricsHUD] = useState({
    blinkRate: 'Normal (12/min)',
    eyeMovement: 'Tracking Active',
    headRotation: 'Pitch: +0.4°, Yaw: -1.2°',
    smileValue: 'Neutral (8%)',
    depthVerification: '3D Mapping Solid',
    antiSpoofPercent: 99.8
  });

  // Fluctuate telemetry values to look alive
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        cpu: +(Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 4))).toFixed(1),
        gpu: +(Math.max(20, Math.min(99, prev.gpu + (Math.random() - 0.5) * 5))).toFixed(1),
        memory: +(Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 2))).toFixed(1),
        disk: +(Math.max(40, Math.min(80, prev.disk + (Math.random() - 0.5) * 0.1))).toFixed(1),
        network: +(Math.max(0.1, Math.min(15, prev.network + (Math.random() - 0.5) * 0.8))).toFixed(1)
      }));

      // Fluctuate face orientation yaw/pitch
      setBiometricsHUD(prev => {
        const yaw = +( (Math.random() - 0.5) * 15 ).toFixed(1);
        const pitch = +( (Math.random() - 0.5) * 10 ).toFixed(1);
        const smile = Math.floor(Math.random() * 15);
        return {
          ...prev,
          headRotation: `Pitch: ${pitch > 0 ? '+' : ''}${pitch}°, Yaw: ${yaw > 0 ? '+' : ''}${yaw}°`,
          smileValue: smile > 8 ? `Smile Detected (${smile}%)` : `Neutral (${smile}%)`
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Animate landmark dots over webcam viewport when webcam is active
  useEffect(() => {
    if (!isWebcamOn) {
      setLandmarks([]);
      return;
    }

    const interval = setInterval(() => {
      // Create random face map constellation around center coordinates
      const newLandmarks = [];
      const centerX = 50;
      const centerY = 50;
      
      // Face boundary outline (oval)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        newLandmarks.push({
          x: centerX + Math.cos(angle) * 15 + (Math.random() - 0.5) * 0.5,
          y: centerY + Math.sin(angle) * 20 * 1.2 + (Math.random() - 0.5) * 0.5
        });
      }

      // Left eye
      newLandmarks.push({ x: centerX - 6 + (Math.random() - 0.5) * 0.2, y: centerY - 5 });
      newLandmarks.push({ x: centerX - 4 + (Math.random() - 0.5) * 0.2, y: centerY - 5 });
      // Right eye
      newLandmarks.push({ x: centerX + 4 + (Math.random() - 0.5) * 0.2, y: centerY - 5 });
      newLandmarks.push({ x: centerX + 6 + (Math.random() - 0.5) * 0.2, y: centerY - 5 });
      // Nose bridge and tip
      newLandmarks.push({ x: centerX, y: centerY - 2 });
      newLandmarks.push({ x: centerX, y: centerY + 2 });
      // Mouth arc
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * 3;
        newLandmarks.push({
          x: centerX + offset,
          y: centerY + 8 + (Math.abs(offset) * 0.4) + (Math.random() - 0.5) * 0.3
        });
      }

      setLandmarks(newLandmarks);
    }, 150);

    return () => clearInterval(interval);
  }, [isWebcamOn]);

  // Challenge timer countdown loop
  useEffect(() => {
    if (livenessChallenge.completed) return;
    
    const interval = setInterval(() => {
      setLivenessChallenge(prev => {
        if (prev.timer <= 1) {
          // Restart with another challenge on timeout
          const randomIdx = Math.floor(Math.random() * challengesList.length);
          const nextChallenge = challengesList[randomIdx];
          return {
            id: nextChallenge.id,
            prompt: nextChallenge.prompt,
            icon: nextChallenge.icon,
            completed: false,
            timer: 10
          };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [livenessChallenge.id, livenessChallenge.completed]);

  // Trigger real mock logs
  const addSecurityLog = (type: SecurityEvent['type'], message: string, threatLevel: SecurityEvent['threatLevel'], status: SecurityEvent['status']) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: SecurityEvent = {
      id: `sec-${Date.now()}`,
      timestamp: timeStr,
      type,
      message,
      camera: 'CCTV-MAIN-SEC',
      location: 'Central Control Node',
      threatLevel,
      status
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (category: SystemAudit['category'], action: string, details: string) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newAudit: SystemAudit = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      user: 'Super Admin Sarah',
      action,
      category,
      status: 'success',
      details
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Header Button actions
  const handleStartSecurityScan = () => {
    setIsScanning(true);
    addSecurityLog('api_event', 'Central security biometrics verification requested', 'low', 'logged');
    addAuditLog('AI Settings', 'Run Diagnostics', 'Manual AI security core diagnostics scan executed');
    
    setTimeout(() => {
      setIsScanning(false);
      setSecurityScore(99.4);
      setGlobalThreatLevel('low');
      alert("AI Security Scan completed successfully! Anti-Spoof neural network parameters within optimal validation range.");
    }, 3000);
  };

  const handleRunAntiSpoofTest = () => {
    // Select a random attack spoof simulation
    const attacks = [
      'Printed Photo Attack',
      'Mobile Screen Attack',
      'Tablet Screen Attack',
      'Video Replay Attack',
      'Mask Attack',
      'Deepfake Injection'
    ];
    const randAttack = attacks[Math.floor(Math.random() * attacks.length)];
    triggerSpoofThreat(randAttack);
  };

  const handleViewThreatReport = () => {
    setActiveTab('logs');
    document.getElementById('security-panels-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExportSecurityReport = () => {
    addAuditLog('Database Changes', 'Export Security Log', 'Compiled full anti-spoof incident reports ledger');
    alert("Downloading facevision-security-audit-ledger.csv...");
  };

  // TRIGGER SECURITY INCIDENT RESPONSE FLOW
  const triggerSpoofThreat = (attackType: string) => {
    setActiveAttackSimulation(attackType);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      const randomId = Math.floor(Math.random() * 1000);
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        spoofAttempts: prev.spoofAttempts + 1,
        suspiciousActivities: prev.suspiciousActivities + 1
      }));

      // Set Threat Level & Security Score drops
      setGlobalThreatLevel('critical');
      setSecurityScore(74.2);

      // Create Active Incident
      const incidentInfo = {
        attackType,
        camera: 'CCTV-MAIN-FEED',
        time: new Date().toLocaleTimeString(),
        confidence: +(89 + Math.random() * 10).toFixed(1)
      };
      
      setActiveIncident(incidentInfo);
      setShowIncidentAlert(true);

      // Log the threat instantly
      addSecurityLog('spoof', `CRITICAL SPOOFING BLOCKED: ${attackType} on camera Live Stream`, 'critical', 'blocked');
      addAuditLog('AI Settings', 'Block Intruder', `Prevented spoof attack spoof vector: ${attackType}`);

      // Add to unknown faces queue as incident evidence
      const newEvidence: UnknownPerson = {
        id: `un-sec-${Date.now()}`,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        detectionTime: new Date().toLocaleTimeString(),
        confidence: incidentInfo.confidence,
        camera: 'CCTV-MAIN-FEED',
        location: 'AI Security Center Console',
        threatLevel: 'critical',
        status: 'unresolved'
      };

      setUnknownPeople(prev => [newEvidence, ...prev]);

    }, 2000);
  };

  // Resolve Incident Action
  const handleResolveIncident = () => {
    setShowIncidentAlert(false);
    setGlobalThreatLevel('moderate');
    setSecurityScore(98.6);
    setActiveAttackSimulation(null);
    setStats(prev => ({
      ...prev,
      suspiciousActivities: Math.max(0, prev.suspiciousActivities - 1)
    }));
    addSecurityLog('unauthorized', 'Incident resolved. Attendance lock restored to standby.', 'low', 'resolved');
    alert("Intrusion incident flagged as 'resolved'. Live webcam protection auto-restored.");
  };

  // Liveness Interactive action completion simulator
  const handleCompleteChallenge = () => {
    setLivenessChallenge(prev => ({ ...prev, completed: true }));
    addSecurityLog('api_event', `Liveness Verification Successful: ${livenessChallenge.prompt}`, 'low', 'logged');
    
    setTimeout(() => {
      const currentIdx = challengesList.findIndex(c => c.id === livenessChallenge.id);
      const nextIdx = (currentIdx + 1) % challengesList.length;
      const nextChallenge = challengesList[nextIdx];
      
      setLivenessChallenge({
        id: nextChallenge.id,
        prompt: nextChallenge.prompt,
        icon: nextChallenge.icon,
        completed: false,
        timer: 10
      });
    }, 1500);
  };

  // Unknown person card actions
  const handleRegisterStudent = (id: string) => {
    setUnknownPeople(prev => prev.map(p => p.id === id ? { ...p, status: 'registered' } : p));
    setStats(prev => ({ ...prev, unknownVisitors: Math.max(0, prev.unknownVisitors - 1) }));
    addAuditLog('Student Registration', 'Register Suspicious Face', `Registered previously unknown face dataset as Student S${Math.floor(Math.random() * 900) + 100}`);
    alert("Student enrollment file created from security capture stream!");
  };

  const handleIgnorePerson = (id: string) => {
    setUnknownPeople(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, unknownVisitors: Math.max(0, prev.unknownVisitors - 1) }));
    addSecurityLog('unauthorized', 'Unknown visitor image discarded from monitoring cache', 'low', 'logged');
  };

  const handleBlacklistPerson = (id: string) => {
    setUnknownPeople(prev => prev.map(p => p.id === id ? { ...p, status: 'blacklisted', threatLevel: 'critical' } : p));
    setStats(prev => ({ 
      ...prev, 
      blockedUsers: prev.blockedUsers + 1,
      unknownVisitors: Math.max(0, prev.unknownVisitors - 1)
    }));
    addSecurityLog('unauthorized', 'Suspicious face blacklisted globally across network nodes', 'high', 'blocked');
    alert("Security matrix updated! Face footprint committed to global perimeter blacklist.");
  };

  const handleReportPerson = (id: string) => {
    addSecurityLog('unauthorized', 'Law enforcement / Admin notification dispatched for unknown trespasser', 'high', 'blocked');
    alert("Incident report submitted to academic disciplinary committee!");
  };

  // Settings modification
  const handleSettingToggle = (key: keyof typeof settings) => {
    setSettings(prev => {
      const nextVal = !prev[key];
      addAuditLog('AI Settings', 'Update Toggle Settings', `Toggled "${String(key)}" to ${nextVal ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const handleSliderChange = (key: 'recognitionThreshold' | 'livenessThreshold', val: number) => {
    setSettings(prev => {
      return { ...prev, [key]: val };
    });
  };

  // Dynamic simulation impact calculation for UI Insights representation
  const dynamicFPRate = +(Math.max(0.1, 10 - (settings.recognitionThreshold * 0.1))).toFixed(2);
  const dynamicFNRate = +(Math.max(0.1, (settings.recognitionThreshold * 0.08) - 4)).toFixed(2);

  // Charts Mock Data
  const livenessTimesData = [
    { name: '08:00 AM', verificationTime: 240, accuracy: 99.1 },
    { name: '09:00 AM', verificationTime: 180, accuracy: 99.4 },
    { name: '10:00 AM', verificationTime: 290, accuracy: 98.9 },
    { name: '11:00 AM', verificationTime: 210, accuracy: 99.6 },
    { name: '12:00 PM', verificationTime: 150, accuracy: 99.8 },
    { name: '01:00 PM', verificationTime: 170, accuracy: 99.2 },
    { name: '02:00 PM', verificationTime: 230, accuracy: 99.5 }
  ];

  const attackVectorsData = [
    { name: 'Photo Print', blocked: 42, color: '#3b82f6' },
    { name: 'Mobile Replay', blocked: 35, color: '#10b981' },
    { name: 'Tablet Replay', blocked: 28, color: '#6366f1' },
    { name: 'Video Mask', blocked: 14, color: '#f59e0b' },
    { name: 'Deepfake App', blocked: 9, color: '#ec4899' },
    { name: '3D Silhouette', blocked: 6, color: '#ef4444' }
  ];

  return (
    <div id="ai-security-center-module" className="space-y-8 pb-24 text-slate-100">

      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-[#080d1a]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
        {/* Decorative corner pulse indicator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Fingerprint className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>FaceVision AI Security Shield</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Security Center & Anti-Spoofing
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Protect the face recognition system against spoofing attacks, unauthorized access, and suspicious activities.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-start-security-scan"
            onClick={handleStartSecurityScan}
            disabled={isScanning}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Shield...' : 'Start Security Scan'}</span>
          </button>

          <button
            id="btn-run-anti-spoof-test"
            onClick={handleRunAntiSpoofTest}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Run Anti-Spoof Test</span>
          </button>

          <button
            id="btn-view-threat-report"
            onClick={handleViewThreatReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Threat Report</span>
          </button>

          <button
            id="btn-export-security-report"
            onClick={handleExportSecurityReport}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Export full secure audit reports"
          >
            <Download className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* SECURITY DASHBOARD STATISTICS CARDS */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        
        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Security Events</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{stats.totalEvents}</span>
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block">Audit perimeter log count</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Spoofing Attempts</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-rose-500">{stats.spoofAttempts}</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[9px] text-rose-500/50 font-mono mt-1.5 block">Attacks blocked by AI</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Blocked Users</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{stats.blockedUsers}</span>
            <UserX className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block">Locked from verification</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Unknown Visitors</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-400">{stats.unknownVisitors}</span>
            <Search className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block">Dossiers needing review</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold">Suspicious Activities</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{stats.suspiciousActivities}</span>
            <AlertTriangle className="w-4 h-4 text-violet-400 animate-bounce" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block">Ongoing warnings</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md relative overflow-hidden">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">AI Threat Level</span>
          <div className="mt-1">
            <span className={`text-lg font-black tracking-wider uppercase px-2 py-0.5 rounded border ${
              globalThreatLevel === 'low' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
              globalThreatLevel === 'moderate' ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' :
              'bg-red-950/40 text-red-400 border-red-900/30'
            }`}>
              {globalThreatLevel}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Real-time status</span>
        </div>

        <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-blue-800/40 transition-all shadow-lg relative">
          <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-bold">System Security</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-200">{securityScore}%</span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[9px] text-indigo-400/70 font-mono mt-1.5 block">Vulnerability score index</span>
        </div>

      </div>

      {/* ================================================== */}
      {/* ENTERPRISE TAB CONTROLLER */}
      {/* ================================================== */}
      <div className="flex border-b border-slate-850 gap-2">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'realtime' ? 'border-blue-500 text-white bg-blue-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Real-time Cam & Anti-Spoof
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'insights' ? 'border-blue-500 text-white bg-blue-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          AI Security Insights
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'logs' ? 'border-blue-500 text-white bg-blue-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Security & Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'settings' ? 'border-blue-500 text-white bg-blue-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Security Policies
        </button>
      </div>

      {/* ================================================== */}
      {/* CRITICAL SPOOF DETECTED OVERLAY RESPONSE BANNER */}
      {/* ================================================== */}
      <AnimatePresence>
        {showIncidentAlert && activeIncident && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-red-900/40 to-slate-900 border border-red-500/50 shadow-2xl relative overflow-hidden"
          >
            {/* Screen flash effect backdrop overlay */}
            <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 animate-bounce">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-400 tracking-wide uppercase">
                    ⚠️ CRITICAL ANTI-SPOOF BREACH DISCOVERED!
                  </h3>
                  <p className="text-sm text-slate-200 font-bold mt-1">
                    {activeIncident.attackType} flagged inside live biometric scan sequence.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Node ID: <span className="text-red-400 font-bold">{activeIncident.camera}</span> • Timestamp: {activeIncident.time} • AI Confidence: {activeIncident.confidence}%
                  </p>
                </div>
              </div>

              {/* SECURITY RESPONSE AUTOMATED CHECKLIST */}
              <div className="bg-slate-950/80 border border-red-900/30 p-3 rounded-xl min-w-[260px]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Security Automation Response Active</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Block Attendance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Raise Alert</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Capture Frame</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Dispatched</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Incident dossier, video stream segment, and key landmarks cached to disk.")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  Generate Incident Report
                </button>
                <button
                  onClick={handleResolveIncident}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-black text-white transition-all cursor-pointer"
                >
                  Dismiss / Override
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================== */}
      {/* MAIN VIEWPORT LAYOUT */}
      {/* ================================================== */}
      <div id="security-panels-section" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* TAB 1: REAL-TIME SCANNING & ANTI-SPOOF CONTROLS */}
        {activeTab === 'realtime' && (
          <>
            {/* LEFT 5 COLS: REAL LIVE VIDEO OR CCTV SIMULATOR NODE */}
            <div className="xl:col-span-7 space-y-6">
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative">
                
                {/* Visual Scanner Grid overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-blue-500/5 z-20 pointer-events-none overflow-hidden">
                    <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-0 left-0 animate-[scan_2s_infinite_linear]" />
                    <style>{`
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>
                  </div>
                )}

                {/* Webcam Header */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Live Perimeter Camera Channel 01
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                    <span>FPS: 30</span>
                    <span>•</span>
                    <span>720p Secure Encrypted</span>
                    <span>•</span>
                    <button
                      onClick={() => setIsWebcamOn(!isWebcamOn)}
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      {isWebcamOn ? 'Shut Camera' : 'Restore Camera'}
                    </button>
                  </div>
                </div>

                {/* Actual Real-Time Webcam Area */}
                <div ref={containerRef} className="aspect-video relative bg-[#040813] flex items-center justify-center overflow-hidden">
                  
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

                      {/* LANDMARK OUTLINE CONSTELATION SVG OVERLAY */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                        {landmarks.map((dot, idx) => (
                          <circle
                            key={idx}
                            cx={`${dot.x}%`}
                            cy={`${dot.y}%`}
                            r="2"
                            fill={activeAttackSimulation ? '#ef4444' : '#3b82f6'}
                            opacity="0.85"
                          />
                        ))}
                        {landmarks.length > 0 && !activeAttackSimulation && (
                          <path
                            d={`M ${landmarks[12]?.x} ${landmarks[12]?.y}`}
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            fill="none"
                          />
                        )}
                      </svg>

                      {/* HUD Biometric indicators on viewport corner */}
                      <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 rounded-xl z-20 space-y-1.5 max-w-[240px] text-[10px] font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Eye Blink:</span>
                          <span className="text-blue-400 font-bold">{biometricsHUD.blinkRate}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Eye Gaze:</span>
                          <span className="text-blue-400 font-bold">{biometricsHUD.eyeMovement}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Rotation:</span>
                          <span className="text-indigo-400 font-bold">{biometricsHUD.headRotation}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Mouth Arc:</span>
                          <span className="text-blue-400 font-bold">{biometricsHUD.smileValue}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-900">
                          <span>3D Depth:</span>
                          <span className="text-emerald-400 font-bold">{biometricsHUD.depthVerification}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Anti-Spoofing:</span>
                          <span className={activeAttackSimulation ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                            {activeAttackSimulation ? 'SPOOF HIGH' : `${biometricsHUD.antiSpoofPercent}% Genuine`}
                          </span>
                        </div>
                      </div>

                      {/* Visual Center Face Guideline Target */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-48 h-64 border-2 border-dashed rounded-[50%] transition-all duration-300 ${activeAttackSimulation ? 'border-red-500/60 scale-105' : 'border-blue-500/35 scale-100'}`} />
                        {/* Target Crosshair */}
                        <div className="absolute w-6 h-[1px] bg-blue-500/40" />
                        <div className="absolute h-6 w-[1px] bg-blue-500/40" />
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-8">
                      <Camera className="w-12 h-12 text-slate-750 mb-3 animate-bounce" />
                      <p className="text-sm font-semibold text-slate-400">Camera Feed Deactivated</p>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Turn on the camera toggle above to connect live anti-spoof biometric analytics.
                      </p>
                    </div>
                  )}
                </div>

                {/* Anti-spoof Confidence Level Bar */}
                <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-sans">Active AI Shield Confidence</span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">
                      InsightFace AntiSpoofNet v2.4 Node active
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-sm">
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div
                        className={`h-full transition-all duration-1000 ${activeAttackSimulation ? 'bg-red-500 w-[15%]' : 'bg-gradient-to-r from-blue-500 to-emerald-500 w-[99%]'}`}
                      />
                    </div>
                    <span className={`text-xs font-mono font-black ${activeAttackSimulation ? 'text-red-500' : 'text-emerald-400'}`}>
                      {activeAttackSimulation ? '15.2%' : '99.8%'}
                    </span>
                  </div>
                </div>

              </div>

              {/* LIVENESS CHALLENGE SECTION */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6 relative">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Dynamic Liveness & Challenge Response</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify genuine biometric interaction by matching generated randomly cued micro-expressions.
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-500/20 uppercase font-black">
                    Interactive
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-4">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl">
                        {livenessChallenge.icon}
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Verification Cue</span>
                        <p className="text-sm font-black text-slate-200 mt-0.5">{livenessChallenge.prompt}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Time Remaining</span>
                        <span className="text-xs font-mono font-extrabold text-amber-400">{livenessChallenge.timer}s</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Liveness checks protect against printed/screen replay vectors by validating dynamic muscular movement feedback loops. System auto-verifies when coordinates match face landmarks.
                    </p>
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-2">
                    <button
                      onClick={handleCompleteChallenge}
                      disabled={livenessChallenge.completed}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase cursor-pointer text-center ${livenessChallenge.completed ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300'}`}
                    >
                      {livenessChallenge.completed ? '✓ Match Verified' : 'Simulate Match'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const idx = Math.floor(Math.random() * challengesList.length);
                        setLivenessChallenge({
                          id: challengesList[idx].id,
                          prompt: challengesList[idx].prompt,
                          icon: challengesList[idx].icon,
                          completed: false,
                          timer: 10
                        });
                      }}
                      className="w-full py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-950/40 border border-transparent transition-all cursor-pointer"
                    >
                      Generate New Challenge
                    </button>
                  </div>
                </div>

                {/* Checklist validation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-850/60">
                  {challengesList.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${livenessChallenge.id === c.id ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
                      <span>{c.prompt}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT 5 COLS: ATTACK TYPE LIST & INCIDENT QUEUE */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* ANTI-SPOOF CHECKS ATTACKS MATRIX */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>AI Threat Protection Matrices</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click any spoof vector to trigger biometric defense override simulations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  <div
                    onClick={() => triggerSpoofThreat('Printed Photo Attack')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Printed Photo Attack</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SECURED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Mobile Screen Attack')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Mobile Screen Attack</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SECURED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Tablet Screen Attack')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Tablet Screen Attack</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SECURED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Video Replay Attack')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Video Replay Attack</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SECURED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Mask Attack')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <UserX className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Mask Attack</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SECURED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Deepfake Injection')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Deepfake Detection</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: SHIELD ACTIVE</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('3D Depth Spoof')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">3D Face Verification</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: ACTIVE</span>
                    </div>
                  </div>

                  <div
                    onClick={() => triggerSpoofThreat('Liveness Disruption')}
                    className="p-3.5 rounded-xl border bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Liveness Verification</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Status: MONITORING</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* UNKNOWN PERSON MANAGEMENT */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center space-x-2">
                      <UserX className="w-4 h-4 text-amber-500" />
                      <span>Unknown & Suspicious Faces Queue</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Resolve security footprints of unregistered persons identified on camera.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {unknownPeople.length} Pending
                  </span>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {unknownPeople.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/20 border border-slate-900 rounded-xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-mono text-slate-400 uppercase">Biometrics Perimeter Clean</p>
                    </div>
                  ) : (
                    unknownPeople.map(person => (
                      <div
                        key={person.id}
                        className={`p-4 rounded-xl border bg-slate-950/75 flex flex-col md:flex-row gap-4 justify-between ${person.status === 'blacklisted' ? 'border-red-500/30 bg-red-950/5' : 'border-slate-850'}`}
                      >
                        <div className="flex gap-3.5">
                          {/* silouette face crop */}
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 shrink-0 relative">
                            <img
                              src={person.imageUrl}
                              alt="unresolved face crop"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border border-red-500/25 animate-pulse" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">
                                {person.status === 'blacklisted' ? '⚠️ BLACKLISTED INDIVIDUAL' : person.status === 'registered' ? 'REGISTERED STUDENT' : 'SUSPICIOUS AGENT'}
                              </span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                person.threatLevel === 'critical' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                                person.threatLevel === 'high' ? 'bg-rose-950/60 text-rose-400 border border-rose-900/30' :
                                'bg-amber-950/60 text-amber-400 border border-amber-900/30'
                              }`}>
                                {person.threatLevel}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500 mt-2">
                              <span>Time: <span className="text-slate-300">{person.detectionTime}</span></span>
                              <span>Match: <span className="text-slate-300">{person.confidence}%</span></span>
                              <span>Cam: <span className="text-slate-300 truncate block max-w-[80px]">{person.camera}</span></span>
                              <span>Loc: <span className="text-slate-300 truncate block max-w-[80px]">{person.location}</span></span>
                            </div>
                          </div>
                        </div>

                        {person.status === 'unresolved' && (
                          <div className="flex flex-row md:flex-col gap-1.5 justify-end">
                            <button
                              id="btn-register-student-sec"
                              onClick={() => handleRegisterStudent(person.id)}
                              className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Register
                            </button>
                            <button
                              id="btn-blacklist-sec"
                              onClick={() => handleBlacklistPerson(person.id)}
                              className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Blacklist
                            </button>
                            <button
                              id="btn-report-sec"
                              onClick={() => handleReportPerson(person.id)}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] hover:text-white cursor-pointer"
                            >
                              Report
                            </button>
                            <button
                              id="btn-ignore-sec"
                              onClick={() => handleIgnorePerson(person.id)}
                              className="px-2.5 py-1 rounded bg-slate-950 border border-transparent text-slate-600 hover:text-slate-400 text-[10px] cursor-pointer"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}

        {/* TAB 2: AI SECURITY ANALYTICS & INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="xl:col-span-12 space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* ACCURACY & TIME GRAPH */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Anti-Spoofing Verification Velocity</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Speed vs. accuracy across study periods.</p>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Live Tracking</span>
                </div>

                <div className="h-80 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={livenessTimesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155' }} />
                      <Legend />
                      <Line type="monotone" dataKey="verificationTime" name="Verification Time (ms)" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="accuracy" name="AI Precision Rate (%)" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ATTACK VECTORS BLOCKED GRAPH */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Spoof Attack Vectors Defended</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Aggregate blocked intrusion attempts by type.</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Completed ledger</span>
                </div>

                <div className="h-80 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attackVectorsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155' }} />
                      <Bar dataKey="blocked" name="Attacks Thwarted">
                        {attackVectorsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* AI METRICS & FALSE POSITIVE RATIOS */}
            <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">AI Deep Biometric Perimeter Indicators</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sensitivity thresholds dynamic impact indices.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Recognition Accuracy</span>
                  <p className="text-3xl font-extrabold text-slate-200 mt-2">99.24%</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">✓ High sensitivity</p>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Spoof Detection Rate</span>
                  <p className="text-3xl font-extrabold text-blue-400 mt-2">99.88%</p>
                  <p className="text-[10px] text-blue-400/80 mt-1 font-mono">✓ AntiSpoofNet v2.4</p>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">False Positive Rate</span>
                  <p className="text-3xl font-extrabold text-amber-500 mt-2">{dynamicFPRate}%</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Dynamic on recognition bar</p>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">False Negative Rate</span>
                  <p className="text-3xl font-extrabold text-rose-500 mt-2">{dynamicFNRate}%</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Calculated threshold penalty</p>
                </div>

              </div>
            </div>

            {/* SYSTEM TELEMETRY MONITORING */}
            <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">GPU/CPU Edge Biometric System Monitoring</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Live virtualization telemetry tracking.</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400">
                  <Server className="w-3.5 h-3.5" />
                  <span>PERIMETER SYSTEM OPTIMAL</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">CPU Usage</span>
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-200">{telemetry.cpu}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${telemetry.cpu}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">GPU VRAM</span>
                    <Activity className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-200">{telemetry.gpu}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${telemetry.gpu}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">RAM Allocation</span>
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-200">{telemetry.memory}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${telemetry.memory}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">Flash Storage</span>
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-200">{telemetry.disk}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${telemetry.disk}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">Secure Network</span>
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-200">{telemetry.network} MB/s</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${(telemetry.network / 15) * 100}%` }} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AUDIT & SECURITY LOGS LISTS */}
        {activeTab === 'logs' && (
          <div className="xl:col-span-12 space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* SECURITY EVENTS LEDGER */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Biometric Security Events Ledger</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Tracking spoof attempts, tampering, and verification blocks.</p>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {securityLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          log.type === 'spoof' ? 'bg-red-500/10 text-red-400' :
                          log.type === 'tampering' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{log.message}</p>
                          <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 mt-1">
                            <span>Loc: {log.location}</span>
                            <span>•</span>
                            <span>Cam: {log.camera}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-500 block">{log.timestamp}</span>
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                          log.status === 'blocked' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                          log.status === 'resolved' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/30' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SYSTEM AUDIT LEDGER */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Operational Audit Trail</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Accountable logging of registrations, threshold changes, and policy overrides.</p>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {auditLogs.map(aud => (
                    <div key={aud.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          aud.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          aud.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          <UserCheck2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{aud.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-sans">{aud.details}</p>
                          <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 mt-1">
                            <span>Author: {aud.user}</span>
                            <span>•</span>
                            <span className="text-indigo-400">Cat: {aud.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 block">{aud.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: POLICY & ANTI-SPOOF SETTINGS FORM */}
        {activeTab === 'settings' && (
          <div className="xl:col-span-12 space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* SLIDERS AND SENSITIVITY CONFIG */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <span>Sensitivity & Boundary Tuning</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control recognition margins to scale security response tightness.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Biometric Face Recognition Threshold</span>
                        <span className="text-[10px] text-slate-500">Minimum percentage of match before logging verification.</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">{settings.recognitionThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="98"
                      value={settings.recognitionThreshold}
                      onChange={(e) => handleSliderChange('recognitionThreshold', parseInt(e.target.value))}
                      className="w-full bg-slate-900 accent-blue-500 h-1.5 rounded"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Liveness Verification Threshold</span>
                        <span className="text-[10px] text-slate-500">AntiSpoofNet probability bar requirement.</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">{settings.livenessThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      value={settings.livenessThreshold}
                      onChange={(e) => handleSliderChange('livenessThreshold', parseInt(e.target.value))}
                      className="w-full bg-slate-900 accent-indigo-500 h-1.5 rounded"
                    />
                  </div>

                </div>
              </div>

              {/* AUTOMATION TOGGLES */}
              <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Automated Perimeter Policies</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Define automated responses to anti-spoof matches.</p>
                  </div>
                </div>

                <div className="space-y-5 text-xs text-slate-300">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Enable Active Anti-Spoofing</p>
                      <p className="text-[10px] text-slate-500">Halt recognition pipelines upon visual replica detection.</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('enableAntiSpoofing')}
                      className={`w-11 h-6 rounded-full transition-all relative ${settings.enableAntiSpoofing ? 'bg-blue-600' : 'bg-slate-800'}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.enableAntiSpoofing ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Lock Unknown Trespasser Faces</p>
                      <p className="text-[10px] text-slate-500">Lock console interface to audit unresolved silhouette images.</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('lockUnknownFaces')}
                      className={`w-11 h-6 rounded-full transition-all relative ${settings.lockUnknownFaces ? 'bg-blue-600' : 'bg-slate-800'}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.lockUnknownFaces ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Auto Perimeter Blacklist</p>
                      <p className="text-[10px] text-slate-500">Instantly blacklist high-confidence spoofing sources.</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('autoBlacklist')}
                      className={`w-11 h-6 rounded-full transition-all relative ${settings.autoBlacklist ? 'bg-blue-600' : 'bg-slate-800'}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoBlacklist ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* NOTIFICATION CHANNELS BLOCK */}
            <div className="bg-[#0b1226]/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Perimeter Notification Dispatches</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Route critical alerts when spoof metrics are breached.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-200">Email Alerts</p>
                    <p className="text-[10px] text-slate-500">Sarah@vision.edu queue</p>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('emailAlerts')}
                    className={`w-11 h-6 rounded-full transition-all relative ${settings.emailAlerts ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailAlerts ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-200">SMS Gateway dispatch</p>
                    <p className="text-[10px] text-slate-500">Admin security cell link</p>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('smsAlerts')}
                    className={`w-11 h-6 rounded-full transition-all relative ${settings.smsAlerts ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.smsAlerts ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-200">Push App Notifications</p>
                    <p className="text-[10px] text-slate-500">All Super Admin dashboards</p>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('pushNotifications')}
                    className={`w-11 h-6 rounded-full transition-all relative ${settings.pushNotifications ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.pushNotifications ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
