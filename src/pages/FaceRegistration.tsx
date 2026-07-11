import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  Camera, 
  Check, 
  RotateCcw, 
  Sparkles, 
  User, 
  AlertCircle, 
  Zap, 
  Gauge, 
  Smile, 
  Cpu, 
  FileCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Video,
  Maximize2,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Sliders,
  HelpCircle,
  Clock,
  ShieldCheck,
  Award,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Play,
  Square,
  Settings,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { Student } from '../types';

interface FaceRegistrationProps {
  students: Student[];
  onCompleteRegistration: (studentId: string, snapshotsCount: number) => void;
}

// Structuring high fidelity data for captured snapshots
interface FaceSnapshot {
  id: string;
  url: string;
  angle: string;
  quality: number;
  sharpness: number;
  lighting: string;
  faceCentered: boolean;
  occlusion: string;
  glasses: boolean;
  mask: boolean;
  timestamp: string;
}

export default function FaceRegistration({
  students,
  onCompleteRegistration
}: FaceRegistrationProps) {
  
  // Stepper state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  const steps = [
    { title: 'Student Selection', desc: 'Identify student folder' },
    { title: 'Camera Setup', desc: 'Hardware calibration' },
    { title: 'Capture Face Images', desc: 'Acquire biometrics' },
    { title: 'AI Face Validation', desc: 'SLA quality matrix' },
    { title: 'Review', desc: 'Verify index details' },
    { title: 'Registration Complete', desc: 'Success output' }
  ];

  // Search & Student selection state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Simulated Attendance metrics for selected student card
  const getAttendanceRate = (id: string) => {
    const hash = id.replace(/\D/g, '') || '1';
    const val = parseInt(hash, 10) || 75;
    return 70 + (val % 28); // deterministic between 70% and 98%
  };

  // Step 2: Camera setup states
  const [selectedDevice, setSelectedDevice] = useState('FaceTime HD Camera (Built-in)');
  const [selectedResolution, setSelectedResolution] = useState('1920x1080 (Full HD)');
  const [selectedFps, setSelectedFps] = useState<number>(60);
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [cameraIsActive, setCameraIsActive] = useState(true);

  // Simulated/Real Camera view options
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simulatedFps, setSimulatedFps] = useState(60);
  const [cameraPermitted, setCameraPermitted] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Webcam elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Step 3: Face Capture states
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [maskDetected, setMaskDetected] = useState(false);
  const [glassesDetected, setGlassesDetected] = useState(false);

  // Checklist of 8 required angles + 2 optional quality indicators
  const requiredAngles = [
    { id: 'Frontal', label: 'Front', desc: 'Look directly ahead with neutral expression', priority: 'Critical' },
    { id: 'Left Profile', label: 'Left', desc: 'Turn head 45 degrees to the left', priority: 'High' },
    { id: 'Right Profile', label: 'Right', desc: 'Turn head 45 degrees to the right', priority: 'High' },
    { id: 'Tilt Up', label: 'Up', desc: 'Tilt your chin upwards slightly', priority: 'Medium' },
    { id: 'Tilt Down', label: 'Down', desc: 'Lower your chin downwards slightly', priority: 'Medium' },
    { id: 'Smile Expression', label: 'Smile', desc: 'Smile to capture facial muscular changes', priority: 'Medium' },
    { id: 'Neutral Expression', label: 'Neutral', desc: 'Keep mouth closed and eyes clear', priority: 'Critical' },
    { id: 'Eyes Closed', label: 'Eyes Closed', desc: 'Close eyes for anti-spoofing blinking tests', priority: 'Critical' }
  ];

  // State to hold captured image array
  const [capturedSnapshots, setCapturedSnapshots] = useState<FaceSnapshot[]>([]);
  const [previewingSnapshot, setPreviewingSnapshot] = useState<FaceSnapshot | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);

  // Live AI validation telemetry state
  const [telemetry, setTelemetry] = useState({
    faceDetected: true,
    faceCentered: true,
    lightingLux: 145, // Optimal is 120-180
    blurIndex: 0.02, // Lower is sharper
    sharpnessScore: 95,
    faceSizePx: 240, // 200-280 is optimal
    occlusion: 'None',
    yawDeg: 1.5,
    pitchDeg: -0.4,
    rollDeg: 0.1,
    overallScore: 96,
    confidenceScore: 98.4
  });

  // Step 5: Compilation progress log list
  const [indexingLogs, setIndexingLogs] = useState<string[]>([]);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [generatedRegId, setGeneratedRegId] = useState('');

  // Floating notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Interactive advice generator based on live telemetry & active angle needed
  const getAISuggestion = () => {
    const missingAngles = requiredAngles.filter(a => !capturedSnapshots.some(s => s.angle === a.id));
    if (missingAngles.length > 0) {
      const nextAngle = missingAngles[0];
      if (telemetry.lightingLux < 80) return 'Increase ambient lighting or move closer to light source.';
      if (telemetry.blurIndex > 0.1) return 'Hold steady. Minor motion blur detected.';
      if (telemetry.faceSizePx < 180) return 'Move closer to the viewport camera frame.';
      if (telemetry.faceSizePx > 300) return 'Please take a step back. Face is too close.';
      if (!telemetry.faceCentered) return 'Center your head inside the blue guiding brackets.';
      
      switch (nextAngle.id) {
        case 'Left Profile': return 'Gently turn your head 45 degrees left.';
        case 'Right Profile': return 'Gently turn your head 45 degrees right.';
        case 'Tilt Up': return 'Raise your chin slightly upwards.';
        case 'Tilt Down': return 'Lower your chin slightly.';
        case 'Smile Expression': return 'Give a clear, pleasant smile.';
        case 'Eyes Closed': return 'Close both eyes for blink validation test.';
        default: return `Look straight and prepare to snap: "${nextAngle.id}".`;
      }
    }
    return 'All 10 required samples captured with excellent fidelity. Ready to validate!';
  };

  // Start real webcam stream
  const startWebcam = async () => {
    try {
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setWebcamStream(stream);
      setCameraPermitted('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      addToast('Real-time webcam interface initialized', 'success');
    } catch (err: any) {
      console.warn("Webcam blocked or unavailable:", err.message);
      setCameraPermitted('denied');
      setUseRealWebcam(false); // Fallback to premium virtual feed
      addToast('Access blocked. Falling back to high-fidelity AI virtual simulator.', 'info');
    }
  };

  // Stop real webcam
  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
  };

  // Keep camera FPS ticking & minor telemetry jitter for supreme live realism
  useEffect(() => {
    if (!cameraIsActive) return;

    const interval = setInterval(() => {
      // Jitter simulated FPS slightly
      setSimulatedFps(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(selectedFps, Math.max(selectedFps - 4, prev + delta));
      });

      // Simulating slight real-time changes in face size/pose to show active tracking
      setTelemetry(prev => {
        const jitterPose = (Math.random() - 0.5) * 1.2;
        const jitterLux = Math.floor((Math.random() - 0.5) * 6);
        return {
          ...prev,
          yawDeg: +(prev.yawDeg + jitterPose * 0.4).toFixed(1),
          pitchDeg: +(prev.pitchDeg + jitterPose * 0.3).toFixed(1),
          lightingLux: Math.min(220, Math.max(90, prev.lightingLux + jitterLux)),
          confidenceScore: +(98.0 + Math.random() * 1.8).toFixed(1)
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraIsActive, selectedFps]);

  // Sync real webcam toggle
  useEffect(() => {
    if (useRealWebcam && cameraIsActive) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [useRealWebcam, cameraIsActive]);

  // Auto-capture countdown effect
  useEffect(() => {
    if (!autoCaptureEnabled || countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      triggerCaptureSnapshot();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoCaptureEnabled, countdown]);

  // Automatically start next capture timer if auto-capture is active and we need more images
  useEffect(() => {
    if (!autoCaptureEnabled) return;
    
    const missingAngles = requiredAngles.filter(a => !capturedSnapshots.some(s => s.angle === a.id));
    if (missingAngles.length > 0 && countdown === null) {
      setCountdown(2); // 2 seconds countdown between angles
    } else if (missingAngles.length === 0) {
      setAutoCaptureEnabled(false);
      addToast('Auto-capture sequence completed successfully!', 'success');
    }
  }, [capturedSnapshots, autoCaptureEnabled]);

  // Execute snapshot capture action
  const triggerCaptureSnapshot = () => {
    if (!cameraIsActive) {
      addToast('Camera is offline. Enable camera to capture.', 'warning');
      return;
    }

    // Determine what angle we are targeting
    const capturedAngles = capturedSnapshots.map(s => s.angle);
    const missing = requiredAngles.find(a => !capturedAngles.includes(a.id));
    const assignedAngle = missing ? missing.id : `Extra Shot ${capturedSnapshots.length + 1}`;

    // Sample high-fidelity mock face assets mapping angles
    const mockImageLibrary: Record<string, string> = {
      'Frontal': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      'Left Profile': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      'Right Profile': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
      'Tilt Up': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      'Tilt Down': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      'Smile Expression': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
      'Neutral Expression': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
      'Eyes Closed': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    };

    const finalUrl = mockImageLibrary[assignedAngle] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
    
    // Generate validation telemetry with minimal randomness
    const calculatedQuality = Math.floor(92 + Math.random() * 7.5);
    const calculatedSharpness = Math.floor(90 + Math.random() * 9.5);
    const lux = telemetry.lightingLux;

    const newSnap: FaceSnapshot = {
      id: `snap-${Date.now()}`,
      url: finalUrl,
      angle: assignedAngle,
      quality: calculatedQuality,
      sharpness: calculatedSharpness,
      lighting: lux > 110 ? 'Optimal' : 'Low',
      faceCentered: true,
      occlusion: maskDetected ? 'Mouth Occlusion' : 'None',
      glasses: glassesDetected,
      mask: maskDetected,
      timestamp: new Date().toLocaleTimeString()
    };

    setCapturedSnapshots(prev => [...prev, newSnap]);
    addToast(`Acquired snapshot: ${assignedAngle} (${calculatedQuality}% Quality)`, 'success');
  };

  // Delete specific image from array
  const handleDeleteSnapshot = (id: string, angle: string) => {
    setCapturedSnapshots(prev => prev.filter(s => s.id !== id));
    addToast(`Deleted face sample for: ${angle}`, 'info');
  };

  // Retake image triggers capture for that specific angle
  const handleRetakeSnapshot = (id: string, angle: string) => {
    setCapturedSnapshots(prev => prev.filter(s => s.id !== id));
    addToast(`Position face for retaking: ${angle}`, 'info');
    // Set stepper to Step 3 so they can do it
    setCurrentStep(3);
  };

  // Save registration trigger progressive logs compiling step
  const handleCompileWeightsAndEmbeddings = () => {
    if (capturedSnapshots.length < 10) {
      addToast('SLA threshold unmet: Please capture at least 10 face samples first.', 'warning');
      return;
    }

    setIsCompiling(true);
    setCurrentStep(5);
    setIndexingProgress(5);
    setIndexingLogs(['Initializing CUDA ResNet-101 feature extractor...']);

    const stepsLogs = [
      { p: 20, l: 'Analyzing 10 acquired face snapshots for lighting consistency...' },
      { p: 40, l: 'MTCNN structural alignment executing: Mapping 68 key-point landmarks...' },
      { p: 60, l: 'Generating 512-dimensional Euclidean floating point vectors...' },
      { p: 80, l: 'Running facial weight similarity checks: Distance margin verified (0.11)...' },
      { p: 95, l: 'Synchronizing weights to YOLOv8 local cache database...' },
      { p: 100, l: 'Enrolment index compiled successfully. Receipt generated.' }
    ];

    stepsLogs.forEach((item, index) => {
      setTimeout(() => {
        setIndexingProgress(item.p);
        setIndexingLogs(prev => [...prev, item.l]);
        
        if (item.p === 100) {
          setIsCompiling(false);
          const uniqueId = `REG-2026-${Math.floor(10000 + Math.random() * 89999)}`;
          setGeneratedRegId(uniqueId);
          // Auto trigger complete registration callback to master system
          onCompleteRegistration(selectedStudentId, capturedSnapshots.length);
          setCurrentStep(6);
          addToast('Student biometrics profile enrolled successfully!', 'success');
        }
      }, (index + 1) * 1100);
    });
  };

  // Reset entire wizard state
  const handleResetWizard = () => {
    setCapturedSnapshots([]);
    setCurrentStep(1);
    setCountdown(null);
    setAutoCaptureEnabled(false);
    setGeneratedRegId('');
    addToast('Wizard reset. Prepare new student folder enrollment.', 'info');
  };

  // Filter student registry
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.department.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div id="face-registration-portal" className="space-y-8 pb-16 relative">
      
      {/* SUCCESS TOASTS OVERLAY */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${
                t.type === 'warning' 
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : t.type === 'info'
                    ? 'bg-slate-900/90 border-slate-750 text-slate-300'
                    : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs font-mono leading-relaxed">
                {t.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* STEPPER PROGRESS TRACKER */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            
            return (
              <div 
                key={s.title} 
                onClick={() => {
                  // Allow backwards navigation for tweaking, except when compiling or completed
                  if (currentStep < 6 && !isCompiling && stepNum < currentStep) {
                    setCurrentStep(stepNum);
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' 
                    : isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                      : 'bg-slate-950/30 border-slate-900 text-slate-500 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-850 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {s.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1 pl-7 truncate">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-850 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
              Enrolment Pipeline
            </span>
            <span className="h-4 w-[1px] bg-slate-800" />
            <span className="text-slate-500 text-xs font-mono">Module Status: Operational</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Face Registration</h1>
          <p className="text-xs text-slate-400">Register high-quality face samples for accurate AI recognition.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {currentStep > 1 && currentStep < 6 && (
            <button
              onClick={() => {
                if (confirm('Cancel enrollment wizard and discard pending captures?')) {
                  handleResetWizard();
                }
              }}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep === 3 && (
            <>
              <button
                onClick={() => setCameraIsActive(!cameraIsActive)}
                className={`px-4 py-2.5 border text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
                  cameraIsActive 
                    ? 'bg-rose-950/20 border-rose-800 text-rose-300 hover:bg-rose-950/40' 
                    : 'bg-blue-950/20 border-blue-800 text-blue-300 hover:bg-blue-950/40'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{cameraIsActive ? 'Stop Camera' : 'Start Camera'}</span>
              </button>

              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const files: FileList = e.target.files;
                    if (files && files.length > 0) {
                      Array.from(files).slice(0, 10).forEach((file, index) => {
                        const fakeAngles = ['Frontal', 'Left Profile', 'Right Profile', 'Tilt Up', 'Tilt Down', 'Smile Expression', 'Neutral Expression', 'Eyes Closed'];
                        const assignedAngle = fakeAngles[index % fakeAngles.length];
                        
                        const newSnap: FaceSnapshot = {
                          id: `snap-upload-${Date.now()}-${index}`,
                          url: URL.createObjectURL(file),
                          angle: assignedAngle,
                          quality: Math.floor(90 + Math.random() * 9),
                          sharpness: Math.floor(88 + Math.random() * 11),
                          lighting: 'Optimal',
                          faceCentered: true,
                          occlusion: 'None',
                          glasses: false,
                          mask: false,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setCapturedSnapshots(prev => [...prev, newSnap]);
                      });
                      addToast(`Imported ${files.length} custom biometric samples.`, 'success');
                    }
                  };
                  input.click();
                }}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 rotate-180 text-slate-400" />
                <span>Upload Images</span>
              </button>
            </>
          )}

          {currentStep === 4 && (
            <button
              onClick={handleCompileWeightsAndEmbeddings}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save Registration</span>
            </button>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE STEP CANVAS (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: STUDENT SELECTION VIEW */}
            {currentStep === 1 && (
              <motion.div
                key="step1-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6"
              >
                <div className="border-b border-slate-850 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>Select Student Profile</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Search the secure active operator registry and select a folder to link with face captures.</p>
                </div>

                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    id="student-enrollment-search"
                    type="text"
                    placeholder="Search by student name, ID, or division department..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {studentSearch && (
                    <button onClick={() => setStudentSearch('')} className="absolute right-3 top-3 text-slate-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filtered Students list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredStudents.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-mono text-xs italic">
                      No matching student files found in directories.
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = student.id === selectedStudentId;
                      const att = getAttendanceRate(student.id);

                      return (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected 
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5' 
                              : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="relative">
                              <img 
                                src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                                alt={student.name} 
                                className="w-11 h-11 rounded-xl object-cover border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                                student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                              }`} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{student.studentId} • {student.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-mono">Attendance SLA</p>
                              <p className={`text-xs font-bold font-mono mt-0.5 ${att < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {att}%
                              </p>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-800 text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Student Card Summary display */}
                {selectedStudent && (
                  <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={selectedStudent.avatarUrl} 
                          alt={selectedStudent.name} 
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{selectedStudent.name}</h4>
                          <p className="text-xs text-slate-400">{selectedStudent.role || 'Staff Operator'}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {selectedStudent.studentId}</p>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono font-bold text-center">
                        <p className="text-[9px] text-slate-500">CURRENT SNAPS</p>
                        <p className="text-base font-extrabold mt-0.5">{selectedStudent.imagesCount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-900 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">DEPARTMENT</span>
                        <span className="text-slate-300 font-medium">{selectedStudent.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">YEAR GROUP</span>
                        <span className="text-slate-300 font-mono font-semibold">4th Year Group</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">SECTION DIV</span>
                        <span className="text-slate-300 font-mono font-semibold">Division Alpha (A)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">STATUS</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                          selectedStudent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        }`}>
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedStudentId}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    <span>Proceed to Camera Setup</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CAMERA CALIBRATION AND SETUP */}
            {currentStep === 2 && (
              <motion.div
                key="step2-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6"
              >
                <div className="border-b border-slate-850 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <span>Hardware Configuration & Calibration</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure active video device feed and calibrate AI face-mesh overlays.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left option selects */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Select Video Input Device</label>
                      <select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-3 border border-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>FaceTime HD Camera (Built-in)</option>
                        <option>Logitech StreamCam Ultra HD</option>
                        <option>USB Video Input Capture Bridge</option>
                        <option>Virtual AI Video Stream (Demo)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Target Resolution</label>
                      <select
                        value={selectedResolution}
                        onChange={(e) => setSelectedResolution(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-3 border border-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>1920x1080 (Full HD)</option>
                        <option>1280x720 (720p HD)</option>
                        <option>640x480 (Optimal VGA)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Target Framerate Limit</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[30, 60].map(fps => (
                          <button
                            key={fps}
                            onClick={() => setSelectedFps(fps)}
                            className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedFps === fps 
                                ? 'bg-blue-600/15 border-blue-500 text-blue-400' 
                                : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            {fps} FPS LIMIT
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Biometrics Capture Mode</label>
                      <div className="flex items-center space-x-3 p-3 bg-slate-950 rounded-xl border border-slate-900">
                        <input
                          id="real-webcam-toggle"
                          type="checkbox"
                          checked={useRealWebcam}
                          onChange={(e) => setUseRealWebcam(e.target.checked)}
                          className="rounded border-slate-800 text-blue-500 focus:ring-blue-500 bg-slate-950"
                        />
                        <div className="min-w-0">
                          <label htmlFor="real-webcam-toggle" className="text-xs font-semibold text-slate-200 block cursor-pointer">Activate System Webcam</label>
                          <span className="text-[10px] text-slate-500 block">Uses HTML5 MediaDevices inside browser tab</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Calibration Previews */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Biometrics Calibration Checklist</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Ensure environmental variables match criteria for the deep recognition layers:</p>
                      
                      <div className="space-y-2 pt-3 text-xs">
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Webcam drivers calibrated</span>
                        </div>
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>YOLOv8 anchors configured to GPU cache</span>
                        </div>
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Light Lux sensor active (&gt;100 Lux)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-amber-400 font-mono text-[11px]">
                          <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                          <span>Guiding bounding overlay ready</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center space-x-2">
                      <Info className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Calibration logs output: OK-READY-STAGE-3</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    <span>Calibrate & Start Captures</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LIVE CAMERA FACE ACQUISITION */}
            {currentStep === 3 && (
              <motion.div
                key="step3-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Viewfinder Card */}
                <div className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-base flex items-center space-x-2">
                        <Camera className="w-4.5 h-4.5 text-blue-400" />
                        <span>High-Definition Biometric Viewfinder</span>
                      </h3>
                      <p className="text-xs text-slate-400">Position face centered inside bounding guidelines. We need at least 10 snaps across multiple posture angles.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        <span>{simulatedFps} FPS • {selectedResolution.split(' ')[0]}</span>
                      </span>
                    </div>
                  </div>

                  {/* LARGE LIVE CAMERA VIEWER WINDOW */}
                  <div className={`relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center transition-all ${
                    isFullscreen ? 'h-[500px]' : 'h-[360px]'
                  }`}>
                    
                    {/* Real webcam stream element or simulated video box */}
                    {useRealWebcam ? (
                      <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          width: 640,
                          height: 480,
                          facingMode: "user"
                        }}
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                        disablePictureInPicture={false}
                        forceScreenshotSourceSize={false}
                        imageSmoothing={true}
                        mirrored={false}
                        screenshotQuality={0.92}
                        onUserMedia={() => {}}
                        onUserMediaError={() => {}}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1222] via-[#020617] to-[#121c32] flex flex-col items-center justify-center p-6 text-center select-none">
                        {/* Simulated Scan Grid */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                        
                        {/* Sweep scanning bar */}
                        <div className="absolute left-0 right-0 h-[2px] bg-blue-500/40 shadow-[0_0_15px_#3b82f6] animate-scan-line pointer-events-none" />

                        {cameraIsActive ? (
                          <div className="w-16 h-16 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center relative mb-4">
                            <Scan className="w-7 h-7 text-blue-400 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border border-blue-500/10 scale-125 animate-ping" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-rose-500/5 border border-rose-500/20 flex items-center justify-center relative mb-4">
                            <AlertCircle className="w-7 h-7 text-rose-500" />
                          </div>
                        )}

                        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                          {cameraIsActive ? 'AI Core Processing Feed Active' : 'Camera Feed Terminated'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-2 max-w-sm leading-relaxed">
                          {cameraIsActive 
                            ? 'Virtual deep alignment framework active. Simulating edge-inference capture weights.'
                            : 'Camera feed halted. Press Start Camera above to resume.'
                          }
                        </p>
                      </div>
                    )}

                    {/* AI FACE DETECTION OVERLAY */}
                    {cameraIsActive && (
                      <>
                        {/* Guiding Face Bounding Box */}
                        <div className="absolute top-[18%] left-[28%] right-[28%] bottom-[18%] border-2 border-dashed border-blue-500/40 rounded-full flex items-center justify-center pointer-events-none z-10">
                          {/* Inside brackets */}
                          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
                          
                          {/* Live landmarks jittering */}
                          <div className="absolute top-[40%] left-[25%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                          <div className="absolute top-[40%] right-[25%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                          <div className="absolute top-[55%] left-[48%] w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          <div className="absolute bottom-[28%] left-[38%] right-[38%] h-1 bg-blue-400/60 rounded-full" />
                        </div>

                        {/* Head Position Indicator HUD panel */}
                        <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-xl text-[10px] font-mono text-slate-400 space-y-1.5 min-w-[140px] pointer-events-none z-10">
                          <p className="text-[9px] text-slate-500 font-extrabold uppercase border-b border-slate-900 pb-1">AI Pose Telemetry</p>
                          <div className="flex justify-between">
                            <span>Yaw (X):</span>
                            <span className="text-slate-200">{telemetry.yawDeg}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pitch (Y):</span>
                            <span className="text-slate-200">{telemetry.pitchDeg}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Roll (Z):</span>
                            <span className="text-slate-200">{telemetry.rollDeg}°</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-900">
                            <span>Pose Status:</span>
                            <span className="text-emerald-400 font-extrabold uppercase">Centered</span>
                          </div>
                        </div>

                        {/* Mask & Glasses Detected Badges overlay */}
                        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                          <button
                            onClick={() => {
                              setGlassesDetected(!glassesDetected);
                              addToast(`Simulation updated: ${!glassesDetected ? 'Glasses Detected' : 'No Glasses'}`, 'info');
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold font-mono rounded border uppercase transition-colors cursor-pointer ${
                              glassesDetected ? 'bg-indigo-950/80 border-indigo-500 text-indigo-400' : 'bg-slate-950/80 border-slate-850 text-slate-500'
                            }`}
                          >
                            Glasses: {glassesDetected ? 'DETECTED' : 'NONE'}
                          </button>

                          <button
                            onClick={() => {
                              setMaskDetected(!maskDetected);
                              addToast(`Simulation updated: ${!maskDetected ? 'Mask Detected (Warning!)' : 'No Mask'}`, 'warning');
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold font-mono rounded border uppercase transition-colors cursor-pointer ${
                              maskDetected ? 'bg-rose-950/80 border-rose-500 text-rose-400' : 'bg-slate-950/80 border-slate-850 text-slate-500'
                            }`}
                          >
                            Mask: {maskDetected ? 'WARNING' : 'NONE'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Countdown indicator splash */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center z-20">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 1 }}
                          key={countdown}
                          className="w-24 h-24 rounded-full bg-blue-600 border border-blue-400 shadow-2xl flex items-center justify-center text-4xl font-extrabold text-white font-mono"
                        >
                          {countdown}
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Capture Trigger and Countdown Controllers */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-850">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const state = !autoCaptureEnabled;
                          setAutoCaptureEnabled(state);
                          if (state) {
                            setCountdown(2);
                            addToast('Auto-capture sequence initiated', 'info');
                          } else {
                            setCountdown(null);
                            addToast('Auto-capture cancelled', 'info');
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          autoCaptureEnabled 
                            ? 'bg-rose-600/15 border-rose-500 text-rose-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {autoCaptureEnabled ? (
                          <>
                            <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>Stop Auto-Capture</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                            <span>Automatic Capture</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                        title="Toggle view height size"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress feedback */}
                    <div className="text-xs font-mono text-slate-400 flex items-center space-x-3 w-full sm:w-auto justify-end">
                      <span>Enrollment Progress:</span>
                      <div className="w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(100, (capturedSnapshots.length / 10) * 100)}%` }} 
                        />
                      </div>
                      <span className="font-bold text-white">{capturedSnapshots.length} / 10 images</span>
                    </div>

                    <button
                      id="btn-trigger-snapshot-capture"
                      onClick={triggerCaptureSnapshot}
                      className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer w-full sm:w-auto justify-center hover:scale-[1.02] transition-transform"
                    >
                      <Camera className="w-4.5 h-4.5" />
                      <span>Capture Sample</span>
                    </button>
                  </div>
                </div>

                {/* Captured Snapshots checklist and thumbnails list */}
                {capturedSnapshots.length > 0 && (
                  <div className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">Acquired Face Gallery</h4>
                      <button
                        onClick={() => {
                          if (confirm('Clear all captured samples?')) {
                            setCapturedSnapshots([]);
                          }
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      {capturedSnapshots.map((snap) => (
                        <div 
                          key={snap.id} 
                          onClick={() => setPreviewingSnapshot(snap)}
                          className="group relative aspect-square bg-slate-950 rounded-xl border border-slate-900 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
                        >
                          <img src={snap.url} alt={snap.angle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          
                          {/* Quality Score overlay label */}
                          <div className="absolute top-1.5 left-1.5 bg-slate-950/85 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                            {snap.quality}%
                          </div>

                          {/* Delete snapshot quick btn */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSnapshot(snap.id, snap.angle);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-rose-950/90 border border-rose-800 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer hover:bg-rose-900 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Info overlay footer */}
                          <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 p-1.5 text-[9px] font-mono text-slate-400 truncate text-center">
                            {snap.angle}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proceed button to step 4 */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      if (capturedSnapshots.length < 10) {
                        addToast(`We need at least 10 face snapshots. Currently at ${capturedSnapshots.length}.`, 'warning');
                      } else {
                        setCurrentStep(4);
                      }
                    }}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    <span>Proceed to AI Validation</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REAL-TIME QUALITY MATRIX TABLE */}
            {currentStep === 4 && (
              <motion.div
                key="step4-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6"
              >
                <div className="border-b border-slate-850 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Gauge className="w-5 h-5 text-blue-400" />
                      <span>SLA Biometrics Quality Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Audit scorecards of the {capturedSnapshots.length} generated samples before compiling weights.</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">AVERAGE SCORE</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {(capturedSnapshots.reduce((sum, s) => sum + s.quality, 0) / capturedSnapshots.length).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* REAL-TIME VALIDATION TABLE MATRIX */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse text-[11px] text-slate-300 font-mono">
                    <thead className="bg-slate-950 border-b border-slate-850 text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4 text-left">Snap Sample</th>
                        <th className="py-3 px-4 text-center">Face Detected</th>
                        <th className="py-3 px-4 text-center">Centered</th>
                        <th className="py-3 px-4 text-center">Lighting Quality</th>
                        <th className="py-3 px-4 text-center">Sharpness Score</th>
                        <th className="py-3 px-4 text-center">Occlusion Check</th>
                        <th className="py-3 px-4 text-center">Quality Score</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {capturedSnapshots.map((snap) => (
                        <tr key={snap.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 text-left flex items-center space-x-2">
                            <img src={snap.url} alt={snap.angle} className="w-7 h-7 rounded object-cover border border-slate-800" />
                            <span className="font-bold text-white text-xs">{snap.angle}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-400">TRUE</td>
                          <td className="py-3 px-4 text-center text-emerald-400">TRUE</td>
                          <td className="py-3 px-4 text-center text-slate-400">145 Lux (Good)</td>
                          <td className="py-3 px-4 text-center text-slate-400">{snap.sharpness}/100</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              snap.occlusion !== 'None' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              {snap.occlusion}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-400 font-bold">{snap.quality}%</td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRetakeSnapshot(snap.id, snap.angle)}
                              className="p-1 text-blue-400 hover:text-blue-300 font-mono text-[10px] uppercase border border-blue-500/20 rounded bg-blue-500/5 cursor-pointer"
                            >
                              Retake
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleCompileWeightsAndEmbeddings}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <FileCheck className="w-4.5 h-4.5" />
                    <span>Approve & Compile Embeddings</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: BIO LOG EMBEDDING COMPILATION PROGRESS BAR */}
            {currentStep === 5 && (
              <motion.div
                key="step5-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <Cpu className="w-8 h-8 text-blue-400 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Compiling 512-D Facial Weights</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    AI engine is crunching structural parameters of {capturedSnapshots.length} samples, linking embeddings with YOLO edge directory clusters.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>COGNITIVE COMPILATION PROGRESS</span>
                    <span className="text-blue-400 font-bold">{indexingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${indexingProgress}%` }} 
                    />
                  </div>
                </div>

                {/* Live logger terminal feed */}
                <div className="max-w-lg mx-auto bg-slate-950 rounded-xl p-4 border border-slate-850 text-left font-mono text-[10px] space-y-2 text-slate-400 overflow-y-auto max-h-[160px] custom-scrollbar shadow-inner">
                  <p className="text-slate-500">// SECURE BIOMETRICS TERMINAL FEED LOG</p>
                  {indexingLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-blue-500">&gt;&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: SUCCESS VERIFICATION SCREEN */}
            {currentStep === 6 && (
              <motion.div
                key="step6-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-850 p-8 rounded-3xl text-center space-y-8"
              >
                
                {/* Large Success Animation */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 scale-125 animate-ping" />
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                    RECOGNITION READY • ACTIVE
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Registration Successful</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Facial weights successfully generated and synchronized with surveillance node directory mainframes.
                  </p>
                </div>

                {/* Receipt Card */}
                {selectedStudent && (
                  <div className="max-w-md mx-auto bg-slate-950/80 border border-slate-850 p-5 rounded-2xl space-y-3 text-left">
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-900">
                      <img 
                        src={selectedStudent.avatarUrl} 
                        alt={selectedStudent.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedStudent.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {selectedStudent.studentId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px]">REGISTRATION ID</span>
                        <span className="text-slate-300 font-bold">{generatedRegId || 'REG-2026-F987D'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">SAMPLES COMPILED</span>
                        <span className="text-slate-300 font-bold">{capturedSnapshots.length} Approved Frames</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">MEAN CONFIDENCE</span>
                        <span className="text-emerald-400 font-bold">98.4% (Excellent)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">SLA STATUS</span>
                        <span className="text-emerald-400 font-bold">Compliant</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <button
                    onClick={handleResetWizard}
                    className="px-5 py-3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl w-full cursor-pointer transition-colors"
                  >
                    Register Another Student
                  </button>

                  <button
                    onClick={() => {
                      // Navigate back to step 1
                      setCurrentStep(1);
                      addToast('Loaded student registry directories.', 'info');
                    }}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl w-full shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
                  >
                    View Student Profiles
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: SYSTEM ACCURACY GUIDELINES SIDEBAR (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time AI validation metrics card */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-5"
            >
              <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span>Real-Time SLA Quality</span>
                </h4>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                  Streaming
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Detected */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Face Detected:</span>
                  <span className="text-emerald-400 font-mono font-bold">YES (100%)</span>
                </div>

                {/* Centered */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Face Centered:</span>
                  <span className="text-emerald-400 font-mono font-bold">YES</span>
                </div>

                {/* Lighting Lux bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Lighting Quality:</span>
                    <span className="text-emerald-400 font-bold">{telemetry.lightingLux} Lux (Good)</span>
                  </div>
                  <div className="bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                {/* Blur */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 pt-1">
                  <span className="text-slate-400">Motion Blur:</span>
                  <span className="text-emerald-400 font-mono font-bold">{telemetry.blurIndex} (Sharp)</span>
                </div>

                {/* Sharpness */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Image Sharpness:</span>
                  <span className="text-emerald-400 font-mono font-bold">{telemetry.sharpnessScore}/100</span>
                </div>

                {/* Occlusion */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Occlusion Index:</span>
                  <span className="text-emerald-400 font-mono font-bold">None Detected</span>
                </div>

                {/* Quality score */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl flex items-center justify-between border border-slate-850">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Capture Quality</p>
                      <p className="text-[9px] text-slate-500">Meets YOLOv8 SLA criteria</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-400 font-mono">{telemetry.overallScore}%</p>
                  </div>
                </div>

                {/* Live Suggestions Box */}
                <div className="p-3 bg-blue-950/10 border border-blue-900/20 text-blue-300 rounded-xl flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold block text-blue-200">AI Live Director advice:</span>
                    <span>{getAISuggestion()}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Stepper Side details: checklist of required angles */}
          {currentStep === 3 && (
            <div className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
              <div className="border-b border-slate-850 pb-3">
                <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Required Angles Checklist</span>
                </h4>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {requiredAngles.map((ang) => {
                  const completed = capturedSnapshots.some(s => s.angle === ang.id);
                  return (
                    <div 
                      key={ang.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        completed 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                          : 'bg-slate-950 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{ang.id}</p>
                        <p className="text-[9px] text-slate-500 truncate max-w-[200px]">{ang.desc}</p>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-800 text-transparent'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core static help guide sidebar */}
          <div className="bg-[#111827]/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Operator Registration Guide</span>
              </h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-200">Lighting Guidelines</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Avoid harsh backlighting or heavy side shadows. Ambient white light directly facing the student ensures a clear 512-D coordinate map.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-200">Camera Placement</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Webcam should be level with the eyes, tilted no more than 5 degrees up or down. Distance of 50cm to 70cm from the lens is ideal.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-200">Facial Position Example</p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    O_O
                  </div>
                  <p className="leading-relaxed">Keep eyes wide open, neutral posture expression. Avoid sunglasses, caps, or bulky headwear.</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-200">AI Accuracy Tips</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Blinking samples allow deep liveness checking protocols, preventing spoof attacks using printed paper photographs.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SINGLE SNAPSHOT DETAILS PREVIEW MODAL */}
      <AnimatePresence>
        {previewingSnapshot && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-950">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-xs font-mono">Zoom Preview: {previewingSnapshot.angle}</span>
                </div>
                <button
                  onClick={() => {
                    setPreviewingSnapshot(null);
                    setPreviewZoom(1);
                  }}
                  className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-center">
                {/* Visual view with zoom slider */}
                <div className="relative aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
                  <img 
                    src={previewingSnapshot.url} 
                    alt={previewingSnapshot.angle} 
                    className="w-full h-full object-cover transition-transform"
                    style={{ transform: `scale(${previewZoom})` }}
                  />
                </div>

                {/* Zoom control slider */}
                <div className="flex items-center justify-center space-x-3 text-xs font-mono max-w-[240px] mx-auto">
                  <button onClick={() => setPreviewZoom(Math.max(1, previewZoom - 0.2))} className="text-slate-400 hover:text-white">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="text-slate-300 w-12 text-center">{Math.round(previewZoom * 100)}%</span>
                  <button onClick={() => setPreviewZoom(Math.min(3, previewZoom + 0.2))} className="text-slate-400 hover:text-white">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Snapped image stats */}
                <div className="grid grid-cols-2 gap-3 text-left font-mono text-[11px] p-4 bg-slate-950 rounded-xl border border-slate-900">
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px]">SAMPLED INDEX</span>
                    <span className="text-slate-300 font-bold">{previewingSnapshot.angle}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px]">QUALITY INDEX</span>
                    <span className="text-emerald-400 font-bold">{previewingSnapshot.quality}% Quality</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px]">SHARPNESS SCORE</span>
                    <span className="text-slate-300 font-bold">{previewingSnapshot.sharpness}/100 Score</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px]">CAPTURE TIME</span>
                    <span className="text-slate-300 font-bold">{previewingSnapshot.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setPreviewingSnapshot(null);
                      setPreviewZoom(1);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl w-full cursor-pointer transition-all"
                  >
                    Close Preview
                  </button>

                  <button
                    onClick={() => {
                      const id = previewingSnapshot.id;
                      const angle = previewingSnapshot.angle;
                      setPreviewingSnapshot(null);
                      setPreviewZoom(1);
                      handleDeleteSnapshot(id, angle);
                    }}
                    className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 hover:border-rose-700 text-rose-300 hover:text-white text-xs font-bold rounded-xl w-full cursor-pointer transition-all"
                  >
                    Delete Sample
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
