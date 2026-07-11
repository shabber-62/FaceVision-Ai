import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, AlertCircle, Sparkles, Sliders, Scan, AlertTriangle, CheckCircle, Video, Maximize2, Loader2, X } from 'lucide-react';

interface CameraStreamProps {
  onFaceDetected?: (name: string, confidence: number, isUnknown: boolean, details: string) => void;
  isActive: boolean;
  recognitionThreshold?: number;
  selectedModel?: string;
  simulatedModeDefault?: boolean;
}

export default function CameraStream({
  onFaceDetected,
  isActive,
  recognitionThreshold = 0.90,
  selectedModel = 'YOLOv8-Face',
  simulatedModeDefault = false
}: CameraStreamProps) {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'connected' | 'denied' | 'not-found' | 'disconnected'>('initializing');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSimulated, setIsFullscreenSimulated] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Simulation states matching database for high-fidelity detection overlays
  const [simIndex, setSimIndex] = useState(0);
  const [simulatingFace, setSimulatingFace] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    confidence: number;
    isUnknown: boolean;
    status: string;
    yaw: number;
    pitch: number;
    roll: number;
    blur: number;
  } | null>(null);

  const simulationDatabase = [
    { name: 'Sarah Connor', isUnknown: false, yaw: 1.2, pitch: -0.4, roll: 0.1, blur: 0.05, status: 'MATCHED' },
    { name: 'John Connor', isUnknown: false, yaw: -0.5, pitch: 0.8, roll: -0.2, blur: 0.02, status: 'MATCHED' },
    { name: 'Miles Dyson', isUnknown: false, yaw: 3.1, pitch: 1.2, roll: 0.5, blur: 0.03, status: 'MATCHED' },
    { name: 'Unknown Intruder', isUnknown: true, yaw: -12.4, pitch: 5.6, roll: 2.1, blur: 0.15, status: 'UNRESOLVED' },
    { name: 'Marcus Wright', isUnknown: false, yaw: -0.1, pitch: -0.2, roll: -0.1, blur: 0.04, status: 'MATCHED' },
    { name: 'Katherine Brewster', isUnknown: false, yaw: 0.8, pitch: -1.1, roll: 0.3, blur: 0.06, status: 'MATCHED' }
  ];

  // Initialize and request camera permissions automatically on mount
  const initCamera = async () => {
    setCameraStatus('initializing');
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access API (MediaDevices) is not supported in this browser environment.");
      }

      // Request raw permission to trigger prompt
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop()); // release temp stream

      setPermissionState('granted');
      setCameraStatus('connected');

      // Update available video input devices
      await updateDevicesList();

    } catch (err: any) {
      console.warn("Camera init failed:", err.name, err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setCameraStatus('denied');
        setCameraError("Camera access denied. Please allow camera permissions in your browser bar.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('not-found');
        setCameraError("No video capture devices were detected on this system.");
      } else {
        setCameraStatus('disconnected');
        setCameraError(err.message || "Failed to link camera stream.");
      }
    }
  };

  const updateDevicesList = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Failed to list available media devices:", err);
    }
  };

  // Trigger permission request on mount
  useEffect(() => {
    initCamera();
  }, []);

  // Sync isCameraOn with isActive prop from parent but allow manual overrides
  useEffect(() => {
    setIsCameraOn(isActive);
  }, [isActive]);

  // Handle device change listeners
  useEffect(() => {
    const handleDeviceChange = () => {
      console.log("Device change event triggered");
      updateDevicesList();
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  // Handle auto reconnection if disconnected unexpectedly
  useEffect(() => {
    if (cameraStatus === 'disconnected' && isCameraOn) {
      const timer = setTimeout(() => {
        console.log("Re-initializing lost webcam connection...");
        initCamera();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cameraStatus, isCameraOn]);

  const handleSwitchCamera = () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };

  const handleUserMedia = (stream: MediaStream) => {
    setCameraStatus('connected');
    setPermissionState('granted');
    
    // Wire up disconnect detection
    stream.getVideoTracks().forEach(track => {
      track.onended = () => {
        console.warn("Webcam video track stopped.");
        setCameraStatus('disconnected');
      };
    });
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Webcam media error:", error);
    const name = typeof error === 'string' ? error : error.name;
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      setPermissionState('denied');
      setCameraStatus('denied');
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      setCameraStatus('not-found');
    } else {
      setCameraStatus('disconnected');
    }
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    const element = wrapperRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn("Fullscreen permission blocked by sandbox, using simulated modal fallback:", err);
        setIsFullscreenSimulated(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Biometric identification engine interval on active frames
  useEffect(() => {
    if (!isActive || !isCameraOn || cameraStatus !== 'connected') {
      setSimulatingFace(null);
      return;
    }

    const interval = setInterval(() => {
      const nextIdx = (simIndex + 1) % simulationDatabase.length;
      setSimIndex(nextIdx);
      
      const person = simulationDatabase[nextIdx];
      const randomConfidence = +(0.88 + Math.random() * 0.11).toFixed(3);
      
      const meetsThreshold = randomConfidence >= recognitionThreshold;
      const finalName = person.isUnknown ? 'Unknown' : person.name;
      const finalConfidence = person.isUnknown ? +(0.32 + Math.random() * 0.15).toFixed(3) : randomConfidence;
      const isActuallyMatch = !person.isUnknown && meetsThreshold;

      setSimulatingFace({
        x: 180 + Math.random() * 40,
        y: 100 + Math.random() * 30,
        width: 240,
        height: 240,
        name: finalName,
        confidence: finalConfidence,
        isUnknown: person.isUnknown || !meetsThreshold,
        status: isActuallyMatch ? 'VERIFIED MATCH' : person.isUnknown ? 'UNKNOWN FACE' : 'CONFIDENCE TOO LOW',
        yaw: person.yaw,
        pitch: person.pitch,
        roll: person.roll,
        blur: person.blur
      });

      if (onFaceDetected) {
        onFaceDetected(
          finalName, 
          finalConfidence, 
          person.isUnknown || !meetsThreshold,
          `Camera scan completed at Lobby-01. Confidence: ${(finalConfidence * 100).toFixed(1)}%.`
        );
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isActive, isCameraOn, cameraStatus, simIndex, recognitionThreshold, selectedModel]);

  // Render scan canvas overlay directly on top of webcam element
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isCameraOn && cameraStatus === 'connected') {
        // Draw tech grids
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 1;
        const gridGap = 40;
        for (let x = 0; x < canvas.width; x += gridGap) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridGap) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        if (isActive && simulatingFace) {
          const { x, y, width, height, name, confidence, isUnknown, status } = simulatingFace;
          const boxColor = isUnknown ? '239, 68, 68' : '34, 197, 94';

          ctx.strokeStyle = `rgba(${boxColor}, 0.85)`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = `rgba(${boxColor}, 0.5)`;
          ctx.shadowBlur = 8;

          // Corner frames
          const len = 30;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(x, y + len);
          ctx.lineTo(x, y);
          ctx.lineTo(x + len, y);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(x + width - len, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width, y + len);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(x, y + height - len);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x + len, y + height);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(x + width - len, y + height);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x + width, y + height - len);
          ctx.stroke();

          ctx.shadowBlur = 0;

          // Biometric landmark tracking nodes
          ctx.fillStyle = `rgba(${boxColor}, 0.85)`;
          const landmarks = [
            { px: x + width * 0.3, py: y + height * 0.4 }, 
            { px: x + width * 0.7, py: y + height * 0.4 }, 
            { px: x + width * 0.5, py: y + height * 0.55 }, 
            { px: x + width * 0.35, py: y + height * 0.7 }, 
            { px: x + width * 0.65, py: y + height * 0.7 }, 
            { px: x + width * 0.5, py: y + height * 0.75 }, 
          ];
          landmarks.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          });

          // Biometric vector meshes
          ctx.strokeStyle = `rgba(${boxColor}, 0.25)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(landmarks[0].px, landmarks[0].py);
          ctx.lineTo(landmarks[1].px, landmarks[1].py);
          ctx.lineTo(landmarks[2].px, landmarks[2].py);
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(landmarks[2].px, landmarks[2].py);
          ctx.lineTo(landmarks[3].px, landmarks[3].py);
          ctx.lineTo(landmarks[4].px, landmarks[4].py);
          ctx.closePath();
          ctx.stroke();

          // Face Metadata Banner
          ctx.fillStyle = `rgba(${boxColor}, 0.9)`;
          ctx.fillRect(x, y - 35, 200, 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`${name} (${(confidence * 100).toFixed(1)}%)`, x + 10, y - 16);

          // Biometric Status Tag
          ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
          ctx.fillRect(x, y + height + 5, 180, 25);
          ctx.strokeStyle = `rgba(${boxColor}, 0.5)`;
          ctx.strokeRect(x, y + height + 5, 180, 25);
          ctx.fillStyle = isUnknown ? '#ef4444' : '#22c55e';
          ctx.font = 'bold 10px "Inter", sans-serif';
          ctx.fillText(`STATUS: ${status}`, x + 10, y + height + 21);

          // Moving scanning bar
          const laserY = y + ((Math.sin(Date.now() / 350) + 1) * 0.5 * height);
          ctx.strokeStyle = `rgba(${boxColor}, 0.65)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 4, laserY);
          ctx.lineTo(x + width - 4, laserY);
          ctx.stroke();

        } else {
          // Empty state target bracket overlay
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
          ctx.lineWidth = 2;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const size = 180;
          ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
          ctx.fillRect(centerX - size/2, centerY - size/2, size, size);

          const scanLineY = centerY - size/2 + ((Math.sin(Date.now() / 500) + 1) * 0.5 * size);
          ctx.strokeStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(centerX - size/2, scanLineY);
          ctx.lineTo(centerX + size/2, scanLineY);
          ctx.stroke();
        }
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [isCameraOn, cameraStatus, isActive, simulatingFace]);

  const videoConstraints = {
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: "user"
  };

  return (
    <div 
      id="camera-stream-wrapper" 
      ref={wrapperRef}
      className={`relative bg-[#0d1321] overflow-hidden border border-gray-800 shadow-2xl group flex flex-col items-center justify-center transition-all duration-300 ${
        isFullscreenSimulated 
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' 
          : 'w-full h-full min-h-[380px] rounded-2xl'
      }`}
    >
      {/* exit simulated fullscreen button */}
      {isFullscreenSimulated && (
        <button
          onClick={() => setIsFullscreenSimulated(false)}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-gray-950/90 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* INITIALIZING CAMERA LOADING VIEW */}
      {cameraStatus === 'initializing' && (
        <div className="absolute inset-0 z-30 bg-[#070b19] flex flex-col items-center justify-center text-center p-6">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <h4 className="text-sm font-bold text-gray-200">Camera Initializing</h4>
          <p className="text-xs text-gray-500 mt-1">Requesting local webcam permissions...</p>
        </div>
      )}

      {/* PERMISSION DENIED ERROR SCREEN */}
      {cameraStatus === 'denied' && (
        <div className="absolute inset-0 z-30 bg-[#070b19] flex flex-col items-center justify-center text-center p-6 border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h4 className="text-sm font-bold text-gray-200">Camera Permission Denied</h4>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs mb-6 leading-relaxed">
            Please allow access to your camera in your browser settings to run live AI biometrics.
          </p>
          <button
            onClick={initCamera}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* CAMERA NOT FOUND ERROR SCREEN */}
      {cameraStatus === 'not-found' && (
        <div className="absolute inset-0 z-30 bg-[#070b19] flex flex-col items-center justify-center text-center p-6 border border-orange-500/20">
          <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
          <h4 className="text-sm font-bold text-gray-200">Camera Not Found</h4>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs mb-6 leading-relaxed">
            No active video input hardware could be mapped on this browser environment.
          </p>
          <button
            onClick={initCamera}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Retry Discovery
          </button>
        </div>
      )}

      {/* CAMERA DISCONNECTED RECONNECTION VIEW */}
      {cameraStatus === 'disconnected' && isCameraOn && (
        <div className="absolute inset-0 z-25 bg-[#070b19]/90 flex flex-col items-center justify-center text-center p-6">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          <h4 className="text-sm font-bold text-amber-500">Camera Disconnected</h4>
          <p className="text-xs text-gray-400 mt-1">Reconnecting live video feed...</p>
        </div>
      )}

      {/* CAMERA DISCONNECTED EXPLICIT STANDBY VIEW */}
      {cameraStatus === 'disconnected' && !isCameraOn && (
        <div className="absolute inset-0 z-20 bg-gradient-to-br from-[#070b19] via-[#020512] to-[#111931] flex flex-col items-center justify-center p-6 text-center select-none">
          <Video className="w-10 h-10 text-gray-500 mb-4" />
          <h4 className="text-sm font-bold text-gray-300">Camera Disconnected</h4>
          <p className="text-xs text-gray-500 mt-1">The viewfinder is currently offline. Enable camera below.</p>
        </div>
      )}

      {/* REACT WEBCAM COMPONENT */}
      {isCameraOn && permissionState === 'granted' && (
        <Webcam
          id="real-webcam-element"
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          disablePictureInPicture={false}
          forceScreenshotSourceSize={false}
          imageSmoothing={true}
          mirrored={false}
          screenshotQuality={0.92}
        />
      )}

      {/* DRAWING CANVAS HUD */}
      <canvas
        id="camera-render-canvas"
        ref={canvasRef}
        width={600}
        height={400}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* HUD CONTROL PANEL FOOTER */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 bg-gray-950/85 backdrop-blur-md border border-gray-800 p-3 rounded-xl">
        <div className="flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${
            cameraStatus === 'connected' ? 'bg-green-500' :
            cameraStatus === 'initializing' ? 'bg-amber-500 animate-pulse' :
            cameraStatus === 'denied' ? 'bg-red-500' :
            cameraStatus === 'not-found' ? 'bg-orange-500' : 'bg-gray-500'
          }`} />
          <span className="text-[10px] font-bold text-gray-300 font-mono uppercase tracking-wide">
            {cameraStatus === 'connected' && 'Camera Connected'}
            {cameraStatus === 'initializing' && 'Camera Initializing'}
            {cameraStatus === 'denied' && 'Camera Permission Denied'}
            {cameraStatus === 'not-found' && 'Camera Not Found'}
            {cameraStatus === 'disconnected' && 'Camera Disconnected'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Switch Camera device */}
          {devices.length > 1 && isCameraOn && cameraStatus === 'connected' && (
            <button
              onClick={handleSwitchCamera}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-850 transition-colors text-[10px] font-bold border border-gray-800 cursor-pointer"
              title="Switch camera node"
            >
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span>Switch Cam</span>
            </button>
          )}

          {/* Manual start/stop controls */}
          {isCameraOn ? (
            <button
              id="stop-camera-btn"
              onClick={() => setIsCameraOn(false)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 transition-colors text-[10px] font-bold border border-rose-900 cursor-pointer"
              title="Stop webcam stream"
            >
              <Video className="w-3 h-3" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              id="start-camera-btn"
              onClick={() => setIsCameraOn(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 transition-colors text-[10px] font-bold border border-emerald-900 cursor-pointer"
              title="Start webcam stream"
            >
              <Video className="w-3 h-3" />
              <span>Start Camera</span>
            </button>
          )}

          {/* Fullscreen control */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-850 transition-colors border border-gray-800 cursor-pointer"
            title="Toggle fullscreen video"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Cyber angular scanning data overlay */}
      {isCameraOn && cameraStatus === 'connected' && isActive && simulatingFace && (
        <div className="absolute top-4 right-4 z-20 bg-gray-950/85 backdrop-blur border border-gray-800 p-3 rounded-lg text-[10px] font-mono text-gray-400 space-y-1.5 min-w-[150px] pointer-events-none">
          <div className="text-gray-500 font-bold border-b border-gray-800 pb-1 mb-1 flex items-center justify-between">
            <span>ANGULAR METADATA</span>
            <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
          </div>
          <div className="flex justify-between">
            <span>Yaw Angle:</span>
            <span className={Math.abs(simulatingFace.yaw) > 5 ? 'text-amber-400' : 'text-gray-300'}>{simulatingFace.yaw}°</span>
          </div>
          <div className="flex justify-between">
            <span>Pitch Angle:</span>
            <span className={Math.abs(simulatingFace.pitch) > 5 ? 'text-amber-400' : 'text-gray-300'}>{simulatingFace.pitch}°</span>
          </div>
          <div className="flex justify-between">
            <span>Roll Angle:</span>
            <span className="text-gray-300">{simulatingFace.roll}°</span>
          </div>
          <div className="flex justify-between">
            <span>Quality Score:</span>
            <span className={simulatingFace.blur > 0.1 ? 'text-red-400' : 'text-green-400'}>
              {(100 - simulatingFace.blur * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
