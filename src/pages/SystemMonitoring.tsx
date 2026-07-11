import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Cpu as GpuIcon, // Reusing Cpu for GPU with indigo coloring
  Layers,
  Video,
  Terminal,
  Shield,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  HardDrive,
  Network,
  Settings,
  Bell,
  Trash2,
  Lock,
  User,
  Plus,
  ArrowRight,
  Filter,
  Eye,
  Check,
  ChevronDown,
  Info
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Data types matching requirements
interface SystemMetric {
  timestamp: string;
  cpu: number;
  gpu: number;
  memory: number;
  network: number;
  temp: number;
  inference: number;
}

interface CameraDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
  fps: number;
  resolution: string;
  recognitionActive: boolean;
  latency: number; // ms
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  department: string;
  action: 'User Login' | 'Logout' | 'Student Created' | 'Student Updated' | 'Attendance Modified' | 'Face Registered' | 'Camera Added' | 'Camera Removed' | 'AI Settings Changed' | 'Role Updated' | 'Permission Changed' | 'Report Generated' | 'Database Backup';
  camera: string;
  eventType: 'audit' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'warning' | 'failed';
  ipAddress: string;
  device: string;
  browser: string;
  module: string;
  description: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'Spoof Detection' | 'Unknown Person' | 'Failed Login' | 'Blocked User' | 'API Abuse' | 'Camera Tampering';
  camera: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  status: string;
  description: string;
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'Server Down' | 'Database Error' | 'Camera Offline' | 'AI Model Failed' | 'High CPU' | 'Low Storage';
  timestamp: string;
  severity: 'critical' | 'high' | 'warning';
  acknowledged: boolean;
}

interface BackupRecord {
  id: string;
  name: string;
  timestamp: string;
  size: string;
  type: 'automatic' | 'manual';
  status: 'successful' | 'restoring' | 'failed';
}

export default function SystemMonitoring() {
  // Page Controllers & Real-Time Telemetry States
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(true);
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'audit' | 'cameras' | 'backups'>('infrastructure');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsProgress, setDiagnosticsProgress] = useState(0);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Live Simulated Metrics History
  const [metricsHistory, setMetricsHistory] = useState<SystemMetric[]>([
    { timestamp: '12:20', cpu: 32.1, gpu: 45.4, memory: 58.2, network: 1.8, temp: 48.5, inference: 18.2 },
    { timestamp: '12:21', cpu: 34.5, gpu: 46.2, memory: 59.1, network: 2.1, temp: 49.0, inference: 17.5 },
    { timestamp: '12:22', cpu: 36.8, gpu: 48.0, memory: 61.4, network: 2.4, temp: 49.8, inference: 19.1 },
    { timestamp: '12:23', cpu: 38.2, gpu: 50.1, memory: 61.9, network: 2.3, temp: 51.2, inference: 18.0 },
    { timestamp: '12:24', cpu: 42.6, gpu: 53.4, memory: 62.5, network: 2.8, temp: 53.4, inference: 19.5 },
    { timestamp: '12:25', cpu: 35.1, gpu: 47.3, memory: 61.8, network: 2.2, temp: 50.1, inference: 17.2 },
    { timestamp: '12:26', cpu: 34.0, gpu: 48.1, memory: 61.9, network: 2.4, temp: 49.6, inference: 18.4 }
  ]);

  // Current Instantaneous Metrics state
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 34.0,
    gpu: 48.1,
    memory: 61.9,
    storage: 55.4,
    network: 2.4,
    temp: 49.6,
    inference: 18.4,
    queue: 0,
    overallHealth: 99.8,
    dbLatency: 1.2,
    apiSuccess: 99.98,
    failedRequests: 2
  });

  // AI Services Engine States
  const [aiServices, setAiServices] = useState({
    yoloStatus: 'Optimal',
    insightFaceStatus: 'Optimal',
    embeddingService: 'Optimal',
    recognitionEngine: 'Active',
    faceRegistrationService: 'Optimal',
    attendanceService: 'Active',
    notificationService: 'Active'
  });

  // Database State indicators
  const [dbStatus, setDbStatus] = useState({
    connection: 'Connected',
    queryPerformance: '1.2ms Avg Query Response',
    activeConnections: 42,
    storageUsage: '1.8 GB / 10 GB',
    backupStatus: 'Healthy (Auto-Run Done)',
    restoreStatus: 'Standby / Warm State'
  });

  // API Performance Metrics
  const [apiStats, setApiStats] = useState({
    requestsCount: 14204,
    avgResponseTime: 14.2, // ms
    failedRequests: 3,
    successRate: 99.98,
    slowEndpoints: [
      { path: '/api/v1/attendance/verify-face', count: 1205, avgTime: '24ms', severity: 'low' },
      { path: '/api/v1/students/bulk-enroll', count: 48, avgTime: '110ms', severity: 'medium' },
      { path: '/api/v1/database/vector-reindex', count: 2, avgTime: '840ms', severity: 'warning' }
    ]
  });

  // Active Alert feeds
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    { id: 'al-1', title: 'Camera Stream Timeout Warning', message: 'CCTV-MAIN-04 dropped connection for 2.4 seconds.', type: 'Camera Offline', timestamp: '12:24:12 PM', severity: 'warning', acknowledged: false },
    { id: 'al-2', title: 'Anti-Spoof Alert: Video Replay', message: 'Printed Photo threat vector blocked on entrance terminal 02.', type: 'AI Model Failed', timestamp: '11:42:05 AM', severity: 'high', acknowledged: false },
    { id: 'al-3', title: 'Disk Space Clearance Check', message: 'Database transaction WAL logs nearing standard cleanup threshold.', type: 'Low Storage', timestamp: '10:15:00 AM', severity: 'warning', acknowledged: true }
  ]);

  // Camera Node list with reactive toggle and status switches
  const [cameras, setCameras] = useState<CameraDevice[]>([
    { id: 'cam-1', name: 'CCTV-MAIN-01', location: 'Main Entrance Lobby', status: 'online', fps: 30, resolution: '1080p', recognitionActive: true, latency: 12 },
    { id: 'cam-2', name: 'CCTV-LOBBY-02', location: 'Reception Lounge Gate', status: 'online', fps: 28, resolution: '1080p', recognitionActive: true, latency: 15 },
    { id: 'cam-3', name: 'CCTV-LAB-03', location: 'Neural Engineering Room', status: 'online', fps: 30, resolution: '720p', recognitionActive: true, latency: 18 },
    { id: 'cam-4', name: 'CCTV-GATE-04', location: 'External Entry Archway', status: 'warning', fps: 24, resolution: '720p', recognitionActive: true, latency: 85 },
    { id: 'cam-5', name: 'CCTV-OFFICE-05', location: 'Administration Office', status: 'online', fps: 29, resolution: '1080p', recognitionActive: true, latency: 14 },
    { id: 'cam-6', name: 'CCTV-BACKUP-06', location: 'Server Core Corridor', status: 'offline', fps: 0, resolution: 'N/A', recognitionActive: false, latency: 999 }
  ]);

  // Backup ledger
  const [backups, setBackups] = useState<BackupRecord[]>([
    { id: 'bk-1', name: 'facevision_db_auto_snapshot_1711379000.tar', timestamp: '2026-07-11 08:00:00', size: '254.8 MB', type: 'automatic', status: 'successful' },
    { id: 'bk-2', name: 'facevision_db_pre_upgrade_1711375000.tar', timestamp: '2026-07-10 21:15:42', size: '252.1 MB', type: 'manual', status: 'successful' },
    { id: 'bk-3', name: 'facevision_db_auto_snapshot_1711360000.tar', timestamp: '2026-07-10 08:00:00', size: '249.5 MB', type: 'automatic', status: 'successful' },
    { id: 'bk-4', name: 'facevision_db_corrupted_test_1711340000.tar', timestamp: '2026-07-09 14:22:11', size: '12.4 MB', type: 'manual', status: 'failed' }
  ]);

  // Comprehensive System Audit Logging Engine
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'aud-101',
      timestamp: '2026-07-11 12:28:15',
      user: 'Super Admin Sarah',
      role: 'Super Admin',
      department: 'Security Operations',
      action: 'AI Settings Changed',
      camera: 'SYSTEM',
      eventType: 'audit',
      severity: 'medium',
      status: 'success',
      ipAddress: '192.168.1.150',
      device: 'Admin Terminal MacPro',
      browser: 'Chrome 125',
      module: 'AI Security Shield Config',
      description: 'Modified Dynamic Anti-Spoof Liveness check challenge verification threshold from 75% to 85%.'
    },
    {
      id: 'aud-102',
      timestamp: '2026-07-11 12:25:04',
      user: 'CCTV-LOBBY-02',
      role: 'System Agent',
      department: 'Biometric Surveillance',
      action: 'Face Registered',
      camera: 'CCTV-LOBBY-02',
      eventType: 'security',
      severity: 'low',
      status: 'success',
      ipAddress: '192.168.1.202',
      device: 'Edge Processor S2',
      browser: 'InsightFace Native SDK',
      module: 'Biometric Intake Pipeline',
      description: 'Successfully converted face bounding landmark contours into 512-dimension vector array and saved to Database storage node.'
    },
    {
      id: 'aud-103',
      timestamp: '2026-07-11 12:19:30',
      user: 'Professor Liam Vance',
      role: 'Faculty',
      department: 'Computer Science Department',
      action: 'Attendance Modified',
      camera: 'SYSTEM',
      eventType: 'audit',
      severity: 'low',
      status: 'success',
      ipAddress: '10.0.4.45',
      device: 'iPad Pro',
      browser: 'Safari Mobile',
      module: 'LMS Academic Sync',
      description: 'Manually verified student Alexander Wright as PRESENT due to facial camera bandaging override rule.'
    },
    {
      id: 'aud-104',
      timestamp: '2026-07-11 11:58:12',
      user: 'Super Admin Sarah',
      role: 'Super Admin',
      department: 'Security Operations',
      action: 'Camera Added',
      camera: 'SYSTEM',
      eventType: 'audit',
      severity: 'medium',
      status: 'success',
      ipAddress: '192.168.1.150',
      device: 'Admin Terminal MacPro',
      browser: 'Chrome 125',
      module: 'Camera Management Infrastructure',
      description: 'Provisioned new CCTV-OFFICE-05 camera feed, connected via ONVIF over local VLAN 2.'
    },
    {
      id: 'aud-105',
      timestamp: '2026-07-11 11:42:01',
      user: 'CCTV-MAIN-01',
      role: 'System Daemon',
      department: 'Edge Node Engine',
      action: 'User Login',
      camera: 'CCTV-MAIN-01',
      eventType: 'security',
      severity: 'high',
      status: 'success',
      ipAddress: '192.168.1.201',
      device: 'Edge Processor S1',
      browser: 'YOLOv8 Core',
      module: 'Access Control Gateway',
      description: 'Valid Student Card matched against biometric scan S109. Granted entrance and locked turnstile open.'
    },
    {
      id: 'aud-106',
      timestamp: '2026-07-11 10:30:15',
      user: 'Unknown Attacker',
      role: 'Visitor',
      department: 'External Gateway IP',
      action: 'User Login',
      camera: 'SYSTEM',
      eventType: 'security',
      severity: 'critical',
      status: 'failed',
      ipAddress: '203.0.113.88',
      device: 'Linux Server (Brute Force Spoof)',
      browser: 'cURL Network Probe',
      module: 'Control Console Security',
      description: 'Failed root authentication command on console API access port. Threat identified and source IP auto-throttled.'
    },
    {
      id: 'aud-107',
      timestamp: '2026-07-11 09:12:45',
      user: 'System Cron Manager',
      role: 'System Agent',
      department: 'Infrastructure Core',
      action: 'Database Backup',
      camera: 'CLOUD-DB',
      eventType: 'audit',
      severity: 'low',
      status: 'success',
      ipAddress: '127.0.0.1',
      device: 'Host Core Controller',
      browser: 'Bash Daemon Script',
      module: 'Storage Backup Engine',
      description: 'Scheduled multi-threaded hot backup finished compression, verified tar hash authenticity, and archived to cold cloud vault.'
    },
    {
      id: 'aud-108',
      timestamp: '2026-07-11 08:14:22',
      user: 'Admin Dave',
      role: 'Admin',
      department: 'Student Affairs Office',
      action: 'Student Created',
      camera: 'SYSTEM',
      eventType: 'audit',
      severity: 'low',
      status: 'success',
      ipAddress: '192.168.1.182',
      device: 'Dell Workstation Windows 11',
      browser: 'Firefox Developer Edition',
      module: 'Student Admissions Registrar',
      description: 'Created primary digital record files for candidate student Priya Sharma, including profile documents and class tags.'
    }
  ]);

  // Search & Filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterCamera, setFilterCamera] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterEventType, setFilterEventType] = useState('All');
  const [filterAction, setFilterAction] = useState('All');

  // Interactive Live Fluctuation
  useEffect(() => {
    if (!isLiveRefreshing) return;

    const interval = setInterval(() => {
      // Simulate real-time metrics changing slightly
      setCurrentMetrics(prev => {
        const cpuVar = +(Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 6))).toFixed(1);
        const gpuVar = +(Math.max(20, Math.min(98, prev.gpu + (Math.random() - 0.5) * 8))).toFixed(1);
        const ramVar = +(Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 2))).toFixed(1);
        const tempVar = +(Math.max(40, Math.min(85, prev.temp + (Math.random() - 0.5) * 1.5))).toFixed(1);
        const netVar = +(Math.max(0.2, Math.min(25, prev.network + (Math.random() - 0.5) * 1))).toFixed(1);
        const infVar = +(Math.max(12, Math.min(45, prev.inference + (Math.random() - 0.5) * 3))).toFixed(1);
        
        // Maybe change recognition queue sometimes
        const queueVar = Math.random() > 0.85 ? Math.floor(Math.random() * 3) : prev.queue;

        // Push new metric to historical ledger for visual graph
        setMetricsHistory(history => {
          const newLedger = [...history.slice(1)];
          const now = new Date();
          const timestampStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          newLedger.push({
            timestamp: timestampStr,
            cpu: +cpuVar,
            gpu: +gpuVar,
            memory: +ramVar,
            network: +netVar,
            temp: +tempVar,
            inference: +infVar
          });
          return newLedger;
        });

        return {
          ...prev,
          cpu: +cpuVar,
          gpu: +gpuVar,
          memory: +ramVar,
          temp: +tempVar,
          network: +netVar,
          inference: +infVar,
          queue: queueVar
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveRefreshing]);

  // Diagnostics Executor
  const runSystemDiagnostics = () => {
    setDiagnosticsRunning(true);
    setDiagnosticsProgress(5);
    setShowDiagModal(true);
    setCurrentMetrics(prev => ({ ...prev, overallHealth: 91.2 })); // drops during full load stress test

    const timer = setInterval(() => {
      setDiagnosticsProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setDiagnosticsRunning(false);
          setCurrentMetrics(m => ({ ...m, overallHealth: 99.8 }));
          
          // Inject audit log
          const newAudit: AuditLog = {
            id: `aud-diag-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            user: 'Super Admin Sarah',
            role: 'Super Admin',
            department: 'Security Operations',
            action: 'Report Generated',
            camera: 'SYSTEM',
            eventType: 'audit',
            severity: 'low',
            status: 'success',
            ipAddress: '192.168.1.150',
            device: 'Admin Terminal MacPro',
            browser: 'Chrome 125',
            module: 'Host Core Controller',
            description: 'Executed manual full system core stress test diagnostics. InsightFace validation pipelines successfully approved.'
          };
          setAuditLogs(prevLogs => [newAudit, ...prevLogs]);

          return 100;
        }
        return prev + 15 + Math.floor(Math.random() * 15);
      });
    }, 500);
  };

  // Backup Creator Executor
  const startBackupProcess = () => {
    setIsBackingUp(true);
    setBackupProgress(5);

    const timer = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsBackingUp(false);
          
          const newId = `bk-${Date.now()}`;
          const newBackup: BackupRecord = {
            id: newId,
            name: `facevision_db_manual_snapshot_${Math.floor(Date.now() / 1000)}.tar`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            size: '256.4 MB',
            type: 'manual',
            status: 'successful'
          };

          setBackups(prevBk => [newBackup, ...prevBk]);

          // Inject audit log
          const newAudit: AuditLog = {
            id: `aud-bk-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            user: 'Super Admin Sarah',
            role: 'Super Admin',
            department: 'Security Operations',
            action: 'Database Backup',
            camera: 'SYSTEM',
            eventType: 'audit',
            severity: 'low',
            status: 'success',
            ipAddress: '192.168.1.150',
            device: 'Admin Terminal MacPro',
            browser: 'Chrome 125',
            module: 'Database Sync Core',
            description: 'Hot backup generated. SQLite metadata compiled and shipped to durable cloud repository.'
          };
          setAuditLogs(prevLogs => [newAudit, ...prevLogs]);

          alert("System Database hot backup created successfully! Archives updated.");
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  // Restore Backup Executor
  const handleRestoreBackup = (backupName: string) => {
    if (confirm(`CRITICAL NOTICE: Are you sure you want to restore database snapshot "${backupName}"? This will rollback attendance rosters to snapshot state.`)) {
      alert(`Restoring database backup: ${backupName}... Standby...`);
      setTimeout(() => {
        alert("Database restoration successful. Relational schema caches re-indexed, 42 client nodes refreshed.");
        
        const newAudit: AuditLog = {
          id: `aud-restore-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'Super Admin Sarah',
          role: 'Super Admin',
          department: 'Security Operations',
          action: 'Database Backup',
          camera: 'SYSTEM',
          eventType: 'audit',
          severity: 'high',
          status: 'success',
          ipAddress: '192.168.1.150',
          device: 'Admin Terminal',
          browser: 'System UI Core',
          module: 'Database Engine',
          description: `Executed relational rollback restore task using backup asset: ${backupName}. All connection integrity tests passed.`
        };
        setAuditLogs(prevLogs => [newAudit, ...prevLogs]);
      }, 1000);
    }
  };

  // Delete Backup Record
  const handleDeleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
  };

  // Camera Command Controller
  const handleRestartCamera = (camId: string, camName: string) => {
    setCameras(prev => prev.map(c => {
      if (c.id === camId) {
        return { ...c, status: 'online', latency: 15, fps: 30 };
      }
      return c;
    }));

    // Inject alert update
    const newAudit: AuditLog = {
      id: `aud-cam-res-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Super Admin Sarah',
      role: 'Super Admin',
      department: 'Security Operations',
      action: 'Camera Added',
      camera: camName,
      eventType: 'audit',
      severity: 'medium',
      status: 'success',
      ipAddress: '192.168.1.150',
      device: 'Admin Terminal MacPro',
      browser: 'Chrome 125',
      module: 'Camera Management Infrastructure',
      description: `Dispatched automated restart socket code command to remote camera hardware node: ${camName}. Video stream connection successfully re-established.`
    };
    setAuditLogs(prevLogs => [newAudit, ...prevLogs]);

    // Clear online/offline warning alerts for this cam
    setAlerts(prev => prev.filter(a => !a.message.includes(camName)));
    alert(`Hard reboot packet sent to camera node: ${camName}. Stream successfully synced.`);
  };

  // Alert Control Action
  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Export Log action
  const handleExportLogs = () => {
    alert("Compiling fully filtered system audit ledger and CSV stream...");
    const headers = "Timestamp,User,Role,Action,Module,Severity,IP,Status\n";
    const rows = filteredLogs.map(l => `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.module}","${l.severity}","${l.ipAddress}","${l.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `facevision-audit-center-export-${Date.now()}.csv`);
    a.click();
  };

  // Download Diagnostics PDF / Text Report Action
  const handleDownloadReport = () => {
    alert("Downloading facevision-diagnostics-report.txt");
    const dataText = `==================================================\nFACEVISION AI - INTEGRATED INFRASTRUCTURE REPORT\nTimestamp: ${new Date().toISOString()}\n==================================================\nOverall System Health Index: ${currentMetrics.overallHealth}%\nCPU Core Load: ${currentMetrics.cpu}%\nGPU VRAM Load: ${currentMetrics.gpu}%\nActive Memory: ${currentMetrics.memory}%\nDisk Storage Pool: ${currentMetrics.storage}%\nDatabase Service: Optimal (Avg Query: ${currentMetrics.dbLatency}ms)\nAPI Gateway Success: ${currentMetrics.apiSuccess}%\nActive Camera Nodes: ${cameras.filter(c => c.status === 'online').length} of ${cameras.length} connected\n\n==================================================\nAI MODELS INTEGRITY MATRIX\nYOLO Bounding Box / Object Detection: ${aiServices.yoloStatus}\nInsightFace Metric Embeddings Core: ${aiServices.insightFaceStatus}\nEmbedding Re-Indexing Daemon: ${aiServices.embeddingService}\nLive Facial Stream Matching Matrix: ${aiServices.recognitionEngine}\n==================================================`;
    const blob = new Blob([dataText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `facevision-telemetry-dossier.txt`);
    a.click();
  };

  // Filter items mapping
  const usersList = useMemo(() => {
    const list = new Set(auditLogs.map(l => l.user));
    return ['All', ...Array.from(list)];
  }, [auditLogs]);

  const rolesList = useMemo(() => {
    const list = new Set(auditLogs.map(l => l.role));
    return ['All', ...Array.from(list)];
  }, [auditLogs]);

  const departmentsList = useMemo(() => {
    const list = new Set(auditLogs.map(l => l.department));
    return ['All', ...Array.from(list)];
  }, [auditLogs]);

  const camerasList = useMemo(() => {
    const list = new Set(auditLogs.map(l => l.camera));
    return ['All', ...Array.from(list)];
  }, [auditLogs]);

  const actionsList = useMemo(() => {
    const list = new Set(auditLogs.map(l => l.action));
    return ['All', ...Array.from(list)];
  }, [auditLogs]);

  // Comprehensive Filter & Search Pipeline
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Free Text Search Matcher
      const matchesSearch = 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = filterUser === 'All' || log.user === filterUser;
      const matchesRole = filterRole === 'All' || log.role === filterRole;
      const matchesDepartment = filterDepartment === 'All' || log.department === filterDepartment;
      const matchesCamera = filterCamera === 'All' || log.camera === filterCamera;
      const matchesSeverity = filterSeverity === 'All' || log.severity === filterSeverity.toLowerCase();
      const matchesEventType = filterEventType === 'All' || log.eventType === filterEventType.toLowerCase();
      const matchesAction = filterAction === 'All' || log.action === filterAction;

      return matchesSearch && matchesUser && matchesRole && matchesDepartment && matchesCamera && matchesSeverity && matchesEventType && matchesAction;
    });
  }, [auditLogs, searchTerm, filterUser, filterRole, filterDepartment, filterCamera, filterSeverity, filterEventType, filterAction]);

  return (
    <div id="system-monitoring-module" className="space-y-8 pb-24 text-slate-100 font-sans">
      
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-[#080d1a]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Server className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>FaceVision AI Systems Diagnostic Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Monitoring & Audit Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Monitor infrastructure, AI services, databases, cameras, and audit every system activity in real time.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-monitoring-refresh"
            onClick={() => {
              setIsLiveRefreshing(!isLiveRefreshing);
              setCurrentMetrics(prev => ({ ...prev, overallHealth: 99.8 }));
              alert(isLiveRefreshing ? "Live metrics updates paused." : "Real-time infrastructure streams connected.");
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer ${isLiveRefreshing ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
            <span>{isLiveRefreshing ? 'Live Stream On' : 'Paused'}</span>
          </button>

          <button
            id="btn-monitoring-export"
            onClick={handleExportLogs}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Logs</span>
          </button>

          <button
            id="btn-monitoring-download"
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Report</span>
          </button>

          <button
            id="btn-run-diagnostics"
            onClick={runSystemDiagnostics}
            disabled={diagnosticsRunning}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>{diagnosticsRunning ? 'Running Tests...' : 'System Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* SYSTEM HEALTH SUMMARY CARDS */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Overall Health Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Overall Health</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-emerald-400">{currentMetrics.overallHealth}%</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[9px] text-emerald-500/60 font-mono mt-2 block">All modules operational</span>
        </div>

        {/* CPU Load Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">CPU Load</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-white">{currentMetrics.cpu}%</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${currentMetrics.cpu}%` }} />
          </div>
        </div>

        {/* GPU VRAM Load Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">GPU Neural VRAM</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-white">{currentMetrics.gpu}%</span>
            <GpuIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${currentMetrics.gpu}%` }} />
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">RAM Memory Allocation</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-white">{currentMetrics.memory}%</span>
            <HardDrive className="w-4 h-4 text-violet-400" />
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-violet-500 h-full transition-all duration-500" style={{ width: `${currentMetrics.memory}%` }} />
          </div>
        </div>

        {/* Disk Usage Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Disk Storage Pool</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-white">{currentMetrics.storage}%</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${currentMetrics.storage}%` }} />
          </div>
        </div>

        {/* Database Health Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Database Latency</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-emerald-400">{currentMetrics.dbLatency}ms</span>
            <Check className="w-4 h-4 text-emerald-400 bg-emerald-500/10 rounded-full p-0.5" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Drizzle + Postgres optimized</span>
        </div>

        {/* API Health Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">API Success Rate</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-emerald-400">{currentMetrics.apiSuccess}%</span>
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">{currentMetrics.failedRequests} failed requests today</span>
        </div>

        {/* AI Model Health Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-md">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold font-black">AI Model Status</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-amber-400">InsightFace</span>
            <Layers className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">YOLOv8 + Onnx active</span>
        </div>

        {/* Camera Health Card */}
        <div className="bg-[#0b1226]/50 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Camera Node Health</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-white">9 / 10 Active</span>
            <Video className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[9px] text-rose-400/80 font-mono mt-2 block">1 node offline warning</span>
        </div>

        {/* Network Status Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-blue-950/40 border border-indigo-900/40 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-800/50 transition-all shadow-lg">
          <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-bold">Ethernet Gateway</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-indigo-200">{currentMetrics.network} MB/s</span>
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-indigo-400/60 font-mono mt-2 block">Continuous video ingress stream</span>
        </div>

      </div>

      {/* ================================================== */}
      {/* ENTERPRISE TAB NAVIGATOR */}
      {/* ================================================== */}
      <div className="flex border-b border-slate-850 gap-2">
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'infrastructure' ? 'border-indigo-500 text-white bg-indigo-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Infrastructure & AI Engines
        </button>
        <button
          onClick={() => setActiveTab('cameras')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'cameras' ? 'border-indigo-500 text-white bg-indigo-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Camera Feeds ({cameras.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'audit' ? 'border-indigo-500 text-white bg-indigo-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Audit Ledger ({filteredLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'backups' ? 'border-indigo-500 text-white bg-indigo-600/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Backup & Disaster Recovery
        </button>
      </div>

      {/* ================================================== */}
      {/* SCREEN VIEWPORTS ACCORDING TO ACTIVE TAB */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ================================================== */}
        {/* TAB 1: INFRASTRUCTURE & LIVE MONITORING & SERVICES */}
        {/* ================================================== */}
        {activeTab === 'infrastructure' && (
          <>
            {/* LEFT 8 COLS: CHARTS AND GRAPHS */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* REAL-TIME TELEMETRY PLOT AREA */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 mb-6 gap-4">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span>Live Infrastructure Telemetry Ledger</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visual CPU, GPU VRAM, Memory pools, and network ingress trends sampled every 2 seconds.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                      <span>GPU: {currentMetrics.gpu}%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      <span>CPU: {currentMetrics.cpu}%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                      <span>RAM: {currentMetrics.memory}%</span>
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="cpu" name="CPU Core" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                      <Area type="monotone" dataKey="gpu" name="GPU Core" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorGpu)" />
                      <Area type="monotone" dataKey="memory" name="RAM Allocation" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-850/60 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">AI Inference Velocity</span>
                    <span className="text-md font-bold text-slate-200 block mt-1">{currentMetrics.inference} ms</span>
                    <span className="text-[9px] text-emerald-400 font-mono">✓ High throughput active</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Pending Face Queue</span>
                    <span className="text-md font-bold text-slate-200 block mt-1">{currentMetrics.queue} candidates</span>
                    <span className="text-[9px] text-slate-400 font-mono">0 lag delay</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Sensor Heat Temperature</span>
                    <span className="text-md font-bold text-slate-200 block mt-1">{currentMetrics.temp} °C</span>
                    <span className="text-[9px] text-amber-500 font-mono">Standby operating bounds</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Continuous Network stream</span>
                    <span className="text-md font-bold text-slate-200 block mt-1">{currentMetrics.network} MBps</span>
                    <span className="text-[9px] text-slate-400 font-mono">RTSP streaming buffers OK</span>
                  </div>
                </div>
              </div>

              {/* DATABASE AND API MONITORING PANELS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Database Metrics Module */}
                <div className="bg-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>PostgreSQL & Vector Database Registry</span>
                    </h4>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-extrabold uppercase">
                      {dbStatus.connection}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Query Performance Index:</span>
                      <span className="text-emerald-400 font-bold">{dbStatus.queryPerformance}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Active API Client Sockets:</span>
                      <span className="text-white font-bold">{dbStatus.activeConnections} Connections</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Vector Storage Index Allocation:</span>
                      <span className="text-white font-bold">{dbStatus.storageUsage}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Hot Snapshot Scheduler Status:</span>
                      <span className="text-emerald-400 font-bold">{dbStatus.backupStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Database Restoration Mirror:</span>
                      <span className="text-slate-400 font-bold">{dbStatus.restoreStatus}</span>
                    </div>
                  </div>
                </div>

                {/* API Monitoring Module */}
                <div className="bg-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Network className="w-4 h-4 text-violet-400" />
                      <span>Express & Gateway Router Telemetry</span>
                    </h4>
                    <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded font-mono font-extrabold uppercase">
                      ONLINE
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-400">API Requests (Today):</span>
                      <span className="text-indigo-400 font-bold">{apiStats.requestsCount} requests</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-400">Average Gateway Latency:</span>
                      <span className="text-white font-bold">{apiStats.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-400">Successful Requests Rate:</span>
                      <span className="text-emerald-400 font-bold">{apiStats.successRate}%</span>
                    </div>
                    
                    {/* Slow Endpoints list */}
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">Identified Latent Gateway Endpoints</span>
                      <div className="space-y-1.5">
                        {apiStats.slowEndpoints.map((ep, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-950/40 p-1 px-2 rounded border border-slate-900">
                            <span className="text-slate-400 font-mono truncate max-w-[200px]">{ep.path}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">({ep.count} reqs)</span>
                              <span className={`font-bold ${ep.severity === 'warning' ? 'text-amber-500' : 'text-slate-300'}`}>{ep.avgTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT 4 COLS: AI MODEL SERVICES AND RUNNING ALERTS */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* ALERTS INTAKE TERMINAL */}
              <div className="bg-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span>Active Telemetry Warnings ({alerts.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Standby Pool</span>
                </div>

                <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {alerts.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                        <p className="text-xs">All network systems clear. No warnings detected.</p>
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`p-3.5 rounded-xl border relative overflow-hidden ${
                            alert.severity === 'critical' ? 'bg-red-950/40 border-red-500/30 text-red-200' :
                            alert.severity === 'high' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                            'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-mono uppercase bg-slate-950/80 p-1 py-0.5 rounded border border-slate-800 text-slate-400 font-extrabold mr-1.5">
                                {alert.type}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">{alert.timestamp}</span>
                              <h5 className="text-xs font-black text-slate-200 mt-1.5">{alert.title}</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-normal">{alert.message}</p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Acknowledge Status:</span>
                            <div className="flex gap-2">
                              {!alert.acknowledged ? (
                                <button
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  className="text-amber-400 hover:text-white hover:underline cursor-pointer font-bold"
                                >
                                  Acknowledge Alarm
                                </button>
                              ) : (
                                <span className="text-emerald-400 font-bold">✓ Confirmed</span>
                              )}
                              <button
                                onClick={() => removeAlert(alert.id)}
                                className="text-rose-500 hover:text-white cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RUNNING AI BIOMETRIC SERVICES FEED */}
              <div className="bg-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Biometric AI Models & Services</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Active Daemons</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">YOLOv8 Edge Service</span>
                        <span className="text-[10px] text-slate-400 font-mono">Landmark and Bounding Boxes</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.yoloStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">InsightFace Embedding SDK</span>
                        <span className="text-[10px] text-slate-400 font-mono">512-dim face recognition vectors</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.insightFaceStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">Embedding Re-indexer</span>
                        <span className="text-[10px] text-slate-400 font-mono">Nearest-neighbor distance index</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.embeddingService}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">Recognition Matching Engine</span>
                        <span className="text-[10px] text-slate-400 font-mono">Live frame matrix validator</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.recognitionEngine}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">Enrollment Registration Router</span>
                        <span className="text-[10px] text-slate-400 font-mono">Roster camera capture files</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.faceRegistrationService}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">Academic Attendance Exporter</span>
                        <span className="text-[10px] text-slate-400 font-mono">Durable database transaction ledger</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.attendanceService}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <div>
                        <span className="text-xs font-black text-slate-200 block">System Notifications Agent</span>
                        <span className="text-[10px] text-slate-400 font-mono">Alert email and SMS webhooks</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {aiServices.notificationService}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* ================================================== */}
        {/* TAB 2: CAMERA STATUS & REBOOT COMMANDS */}
        {/* ================================================== */}
        {activeTab === 'cameras' && (
          <div className="xl:col-span-12 space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 mb-6 gap-4">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-400" />
                    <span>Edge Surveillance Camera Nodes Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live status check, frames per second metrics, resolution output, RTSP stream latencies, and hard-boot camera control packets.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCameras(prev => prev.map(c => ({ ...c, status: 'online', latency: 15 })));
                      alert("Restoring all camera streams back to online operational matrix...");
                    }}
                    className="px-3.5 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-800 rounded-lg text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  >
                    Auto-Repair All Feeds
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(cam => (
                  <div
                    key={cam.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[190px] ${
                      cam.status === 'online' ? 'bg-[#0b1226]/40 border-slate-800 hover:border-slate-700' :
                      cam.status === 'warning' ? 'bg-[#0f1020]/70 border-amber-500/20 hover:border-amber-500/35' :
                      'bg-red-950/10 border-red-500/15'
                    }`}
                  >
                    {/* Background status pulse indicator */}
                    {cam.status === 'online' && (
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded font-mono text-[9px] font-black text-emerald-400 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Online</span>
                      </div>
                    )}
                    {cam.status === 'warning' && (
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded font-mono text-[9px] font-black text-amber-400 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                        <span>Warning</span>
                      </div>
                    )}
                    {cam.status === 'offline' && (
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-red-950/50 border border-red-900/40 px-2 py-0.5 rounded font-mono text-[9px] font-black text-red-400 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>Offline</span>
                      </div>
                    )}

                    <div className="space-y-1 max-w-[190px]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-black">Node Endpoint</span>
                      <h4 className="text-md font-bold text-slate-200">{cam.name}</h4>
                      <p className="text-xs text-slate-400 font-sans">{cam.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-900 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Video Resolution</span>
                        <span className="text-white font-bold block mt-0.5">{cam.resolution}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Rendering Stream</span>
                        <span className="text-white font-bold block mt-0.5">{cam.fps} FPS</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">RTSP Connection Latency</span>
                        <span className={`font-bold block mt-0.5 ${cam.latency > 150 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {cam.status === 'offline' ? 'N/A' : `${cam.latency} ms`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Recognition AI Gate</span>
                        <span className="text-indigo-400 font-extrabold block mt-0.5">
                          {cam.recognitionActive ? 'ACTIVE' : 'MUTED'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-900/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-sans">Hardware Controller Board</span>
                      <button
                        onClick={() => handleRestartCamera(cam.id, cam.name)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white rounded-lg text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-400" />
                        <span>Restart Camera</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: AUDIT LEDGER GRID & ROBUST SEARCH FILTERS */}
        {/* ================================================== */}
        {activeTab === 'audit' && (
          <div className="xl:col-span-12 space-y-6">
            
            {/* SEARCH AND FILTERS CONTAINER */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
                <Filter className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Audit logs search & filtering panel
                </h4>
              </div>

              {/* Robust responsive grid of filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                
                {/* Text search */}
                <div className="lg:col-span-2 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Search Terms / Match Logs</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="IP, description, user, module..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  </div>
                </div>

                {/* Event Type Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Event Type</span>
                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Audit">Audit Operations</option>
                    <option value="Security">Security Events</option>
                  </select>
                </div>

                {/* Severity Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Severity Threshold</span>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="All">All Severities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* User Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Actor Person</span>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {usersList.map((user, idx) => (
                      <option key={idx} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Actor Clearance Role</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {rolesList.map((role, idx) => (
                      <option key={idx} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Action Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Core Action Category</span>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {actionsList.map((act, idx) => (
                      <option key={idx} value={act}>{act}</option>
                    ))}
                  </select>
                </div>

                {/* Camera Node Filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Camera Node Origin</span>
                  <select
                    value={filterCamera}
                    onChange={(e) => setFilterCamera(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {camerasList.map((cam, idx) => (
                      <option key={idx} value={cam}>{cam}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Reset button bar */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-900 text-xs text-slate-400">
                <span>Showing {filteredLogs.length} matching event rows in search buffer</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterUser('All');
                    setFilterRole('All');
                    setFilterDepartment('All');
                    setFilterCamera('All');
                    setFilterSeverity('All');
                    setFilterEventType('All');
                    setFilterAction('All');
                  }}
                  className="text-indigo-400 hover:text-white underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* AUDIT LOG TABLE GRID */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Timestamp / Node</th>
                      <th className="p-4">User Actor / Clearance</th>
                      <th className="p-4">Action Event</th>
                      <th className="p-4">Target Module</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">IP Address / Host</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          <AlertTriangle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          <p>No audit matching search criteria found in central ledger database.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 pl-6 font-mono text-[11px]">
                            <div className="text-white font-bold">{log.timestamp}</div>
                            <div className="text-slate-500 text-[9px] mt-0.5">{log.camera}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-slate-200 font-bold">{log.user}</div>
                            <div className="text-slate-500 text-[10px] font-mono mt-0.5">{log.role}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-white bg-slate-900/90 p-1 px-1.5 rounded border border-slate-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            {log.module}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              log.severity === 'critical' ? 'bg-red-950/40 text-red-400 border-red-900/30' :
                              log.severity === 'high' ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' :
                              log.severity === 'medium' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' :
                              'bg-slate-900 text-slate-400 border-slate-850'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            <div>{log.ipAddress}</div>
                            <div className="text-slate-600 text-[9px] truncate max-w-[150px] mt-0.5">{log.browser}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                              log.status === 'success' ? 'bg-emerald-950/40 text-emerald-400' :
                              log.status === 'warning' ? 'bg-amber-950/40 text-amber-400' :
                              'bg-red-950/40 text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-indigo-400 hover:text-indigo-200 hover:underline cursor-pointer font-bold flex items-center space-x-1 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* TAB 4: BACKUP & SYSTEM DISASTER RECOVERY */}
        {/* ================================================== */}
        {activeTab === 'backups' && (
          <>
            {/* LEFT 6 COLS: TRIGGER BACKUP AND HISTORY */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <span>Relational Database Hot Snapshot Manager</span>
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase font-black">
                    Disaster Recovery
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#0b1226]/50 p-5 rounded-2xl border border-slate-850">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-200">Generate Immediate Database Snapshot</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Dumping full schema layouts, user rosters, biometric vector templates, and historical logs into a self-contained CJS bundle asset payload.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={startBackupProcess}
                      disabled={isBackingUp}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg cursor-pointer"
                    >
                      {isBackingUp ? `Compiling Matrix (${backupProgress}%)` : 'Create Backup Snapshot Now'}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500 text-center">Last backup completed 4 hours ago</span>
                  </div>
                </div>

                {/* BACKUP PROGRESS BAR ANIMATION */}
                {isBackingUp && (
                  <div className="w-full space-y-1 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Dumping SQL vectors to local disk...</span>
                      <span>{backupProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${backupProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* BACKUP HISTORY MATRIX */}
                <div className="space-y-3">
                  <h4 className="text-xs text-slate-400 uppercase font-bold tracking-widest block mb-2">Saved Backup Tar Files History</h4>
                  
                  <div className="space-y-2.5">
                    {backups.map(bk => (
                      <div key={bk.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            bk.status === 'successful' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block truncate max-w-[280px]">{bk.name}</span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                              <span>Size: {bk.size}</span>
                              <span>•</span>
                              <span>{bk.timestamp}</span>
                              <span>•</span>
                              <span className="uppercase text-[8px] tracking-wide font-black">{bk.type}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {bk.status === 'successful' && (
                            <>
                              <button
                                onClick={() => handleRestoreBackup(bk.name)}
                                className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 hover:text-white rounded text-[10px] font-mono font-bold cursor-pointer"
                              >
                                Restore Snapshot
                              </button>
                              <button
                                onClick={() => alert(`Downloading archive file: ${bk.name}`)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded cursor-pointer"
                                title="Download Tar"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteBackup(bk.id)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-850 text-rose-400 rounded cursor-pointer"
                            title="Discard Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT 5 COLS: SECURITY POLICIES & RECOVERY INSIGHTS */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Disaster Recovery Policy Rules</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Policies</span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-black block">Automated Replication Pool</span>
                    <p className="font-sans text-slate-400">
                      System automatically triggers hot snapshots every 24 hours at 08:00 AM UTC. Backups are gzip compressed and shipped to external encrypted bucket hosts.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-black block">Mirror Failover Host Policy</span>
                    <p className="font-sans text-slate-400">
                      In the event of primary database node offline failure, local cache buffers up to 48,000 face attendance records in the offline edge processor memory until host re-connection is verified.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-black block">Retention Matrix Standard</span>
                    <p className="font-sans text-slate-400">
                      Transaction logs are retained for 90 days. Raw camera surveillance frames captured of unidentified individuals are auto-purged every 7 days unless locked or escalated to the disciplinary watchlist dossier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ================================================== */}
      {/* DETAILED LOG VIEWER POPUP MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-300">
                    Detailed Event Logs Ledger • Log #{selectedLog.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white font-mono text-sm uppercase cursor-pointer bg-slate-950 border border-slate-850 px-2 py-0.5 rounded"
                >
                  Close [esc]
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Timestamp Clock</span>
                    <span className="text-white font-bold block mt-1">{selectedLog.timestamp}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Log Severity</span>
                    <span className={`font-bold block mt-1 uppercase text-xs ${
                      selectedLog.severity === 'critical' ? 'text-red-400' :
                      selectedLog.severity === 'high' ? 'text-amber-400' :
                      'text-slate-300'
                    }`}>
                      {selectedLog.severity} Level
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Event Action</span>
                    <span className="text-indigo-400 font-extrabold block mt-1">{selectedLog.action}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Subsystem Module</span>
                    <span className="text-white font-bold block mt-1">{selectedLog.module}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Authorized User Actor</span>
                    <span className="text-slate-200 font-bold block mt-1">{selectedLog.user} ({selectedLog.role})</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 block uppercase">Origin IP Node Address</span>
                    <span className="text-slate-300 font-bold block mt-1">{selectedLog.ipAddress}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Operation Details Description</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-4">
                  <div>Device Host: <span className="text-slate-400">{selectedLog.device}</span></div>
                  <div>Client Browser Agent: <span className="text-slate-400">{selectedLog.browser}</span></div>
                  <div>Source Terminal: <span className="text-slate-400">{selectedLog.camera}</span></div>
                  <div>Audit Verification: <span className="text-emerald-400 font-bold">✓ Crytographically Encrypted</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================== */}
      {/* SYSTEM DIAGNOSTICS STRESS TEST MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showDiagModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                  <Activity className={`w-6 h-6 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-md font-extrabold text-white">Neural Processing Unit Diagnostic Stress</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Calibrating multi-threaded face tracking loops and testing database re-indexing buffers.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{diagnosticsRunning ? 'Running matrix optimization pipelines...' : 'Calibration finished!'}</span>
                  <span className="text-indigo-400 font-bold">{diagnosticsProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${diagnosticsProgress}%` }} />
                </div>
              </div>

              {/* Status checklist */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-1.5 px-3 bg-slate-900/60 rounded border border-slate-900">
                  <span className="text-slate-400">YOLOv8 Weights Accuracy Bounds:</span>
                  <span className={diagnosticsProgress >= 25 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {diagnosticsProgress >= 25 ? '✓ APPROVED' : 'TESTING...'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-1.5 px-3 bg-slate-900/60 rounded border border-slate-900">
                  <span className="text-slate-400">InsightFace Model Dimension checks:</span>
                  <span className={diagnosticsProgress >= 55 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {diagnosticsProgress >= 55 ? '✓ APPROVED' : 'PENDING...'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-1.5 px-3 bg-slate-900/60 rounded border border-slate-900">
                  <span className="text-slate-400">Active Camera Socket frame drops:</span>
                  <span className={diagnosticsProgress >= 85 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {diagnosticsProgress >= 85 ? '✓ 0% DROPS APPROVED' : 'PENDING...'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-end">
                <button
                  disabled={diagnosticsRunning}
                  onClick={() => setShowDiagModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${diagnosticsRunning ? 'bg-slate-900 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'}`}
                >
                  Dismiss Terminal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
