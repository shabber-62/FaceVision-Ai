import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Camera, 
  Cpu, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Eye, 
  Check, 
  AlertCircle,
  Save
} from 'lucide-react';
import { CameraConfig } from '../types';

interface SettingsViewProps {
  config: CameraConfig;
  onSaveConfig: (newConfig: CameraConfig) => void;
}

export default function SettingsView({ config, onSaveConfig }: SettingsViewProps) {
  const [modelType, setModelType] = useState(config.modelType);
  const [threshold, setThreshold] = useState(config.confidenceThreshold);
  const [resolution, setResolution] = useState(config.resolution);
  const [fps, setFps] = useState(config.fps);
  const [enableAlerts, setEnableAlerts] = useState(config.enableUnknownAlerts);
  
  // Secondary local settings
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [antiSpoofing, setAntiSpoofing] = useState(true);
  const [sirenVolume, setSirenVolume] = useState(75);
  const [pincodeBypass, setPincodeBypass] = useState('4481');

  const [toast, setToast] = useState('');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      deviceId: config.deviceId,
      resolution,
      fps,
      confidenceThreshold: threshold,
      recognitionInterval: config.recognitionInterval,
      enableUnknownAlerts: enableAlerts,
      modelType
    });

    setToast('Configuration weights saved. Hot-reloading computer vision threads...');
    setTimeout(() => setToast(''), 4500);
  };

  return (
    <form id="settings-form" onSubmit={handleSaveAll} className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400 flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span className="font-medium text-gray-200">{toast}</span>
        </motion.div>
      )}

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category 1: AI & Inference Weights */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Cpu className="w-4.5 h-4.5 text-blue-400" />
            <h3 className="text-white font-bold text-sm">AI Biometrics & Matching Engines</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Model Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Core YOLO Neural Network</label>
              <select
                id="setting-model-select"
                value={modelType}
                onChange={(e) => setModelType(e.target.value as any)}
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="YOLOv8-Face">YOLOv8-Face (Real-Time Edge Frame Rate)</option>
                <option value="InsightFace-ResNet50">InsightFace-ResNet50 (Premium Accuracy Check)</option>
                <option value="FaceNet-Mobile">FaceNet-Mobile (Compressed Low Latency)</option>
              </select>
            </div>

            {/* Threshold Range slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-gray-500 uppercase tracking-wider">Inference Match Threshold</span>
                <span className="text-blue-400 font-bold">{threshold.toFixed(2)}</span>
              </div>
              <input
                id="setting-threshold-slider"
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-[9.5px] text-gray-500">
                Minimum cosine accuracy required to confirm employee matches. Higher bounds prevent spoofing. Recommended: <span className="text-gray-300">0.90</span>.
              </p>
            </div>

            {/* Anti-spoofing check */}
            <div className="pt-2 border-t border-gray-850/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-white font-bold">3D Passive Liveness Check</p>
                <p className="text-[10px] text-gray-500">Inspect facial micro-textures to block photo spoof attacks.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="setting-toggle-spoof"
                  type="checkbox"
                  checked={antiSpoofing}
                  onChange={(e) => setAntiSpoofing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Category 2: Camera Capture Pipeline */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Camera className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-white font-bold text-sm">Hardware Camera Video Pipelines</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Resolution selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Pipeline Frame Resolution</label>
              <select
                id="setting-resolution-select"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="1920x1080">1080p FHD (Highly Structured Grid Checks)</option>
                <option value="1280x720">720p HD (Balanced Performance)</option>
                <option value="640x480">480p SD (Low-Bandwidth Mobile)</option>
              </select>
            </div>

            {/* Frame rate cap */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">FPS Frame Rate Cap</label>
              <select
                id="setting-fps-select"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="60">60 FPS (Ultra Fluid, High Core Load)</option>
                <option value="30">30 FPS (Standard Cine Loop)</option>
                <option value="15">15 FPS (Resource Optimized)</option>
              </select>
            </div>

            {/* Intruder alerts toggling */}
            <div className="pt-2 border-t border-gray-850/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-white font-bold">Enable Unknown Intruder Alarms</p>
                <p className="text-[10px] text-gray-500">Trigger UI danger overlays upon detecting unrecognized faces.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="setting-toggle-alerts"
                  type="checkbox"
                  checked={enableAlerts}
                  onChange={(e) => setEnableAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Category 3: Interface & Language */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Globe className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-white font-bold text-sm">Interface, Language & Themes</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Theme Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Interface Layout Skin</label>
              <select
                id="setting-theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="dark">Cosmic Slate Dark Theme (Default)</option>
                <option value="amoled">Deep AMOLED Obsidian Contrast (High Contrast)</option>
              </select>
            </div>

            {/* Language Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Regional Language Index</label>
              <select
                id="setting-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="en">English (US Standard)</option>
                <option value="es">Español (Castellano)</option>
                <option value="de">Deutsch (Deutschland)</option>
                <option value="ja">日本語 (Japanese Core)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category 4: Broadcast Alert Filters */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Bell className="w-4.5 h-4.5 text-yellow-500" />
            <h3 className="text-white font-bold text-sm">Security Broadcasts & Tickers</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Siren Volume slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-gray-500 uppercase tracking-wider">Terminal Siren Alarm Volume</span>
                <span className="text-amber-500 font-bold">{sirenVolume}%</span>
              </div>
              <input
                id="setting-volume-slider"
                type="range"
                min="0"
                max="100"
                value={sirenVolume}
                onChange={(e) => setSirenVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Pincode Exception lock */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Pincode Manual Bypass Key</label>
              <input
                id="setting-pin-input"
                type="password"
                value={pincodeBypass}
                onChange={(e) => setPincodeBypass(e.target.value)}
                maxLength={4}
                placeholder="4-digit secure PIN"
                className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 tracking-widest font-mono text-center font-bold"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Save Settings floating bar */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-550 pl-2">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
          <span>Symmetric settings hashing active. Changes hot-swapped securely.</span>
        </div>

        <button
          id="btn-settings-save"
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

    </form>
  );
}
