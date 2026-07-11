import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserX, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Plus, 
  UserCheck, 
  Trash2, 
  Check, 
  X,
  UserPlus
} from 'lucide-react';
import { UnknownFace, Student } from '../types';

interface UnknownFacesProps {
  unknownFaces: UnknownFace[];
  students: Student[];
  onResolveUnknownFace: (id: string, name?: string, action?: 'register' | 'link' | 'ignore') => void;
  onNavigate: (page: string) => void;
}

export default function UnknownFaces({
  unknownFaces,
  students,
  onResolveUnknownFace,
  onNavigate
}: UnknownFacesProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const handleOpenLinkModal = (alertId: string) => {
    setSelectedAlertId(alertId);
    setSelectedStudentId(students[0]?.id || '');
    setIsLinkOpen(true);
  };

  const handleCommitLink = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    onResolveUnknownFace(selectedAlertId, student.name, 'link');
    setIsLinkOpen(false);

    setSuccessBanner(`Successfully associated Unknown Face snap with registered profile "${student.name}"!`);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  const handleIgnore = (id: string) => {
    onResolveUnknownFace(id, undefined, 'ignore');
    setSuccessBanner('Alert de-escalated and archived.');
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  return (
    <div id="unknown-faces-view" className="space-y-6 pb-12">
      
      {/* Alert Header Banner */}
      <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-red-400 font-bold text-sm tracking-tight">Active Biometric Alerts Drawer</h3>
            <p className="text-xs text-gray-400 max-w-xl">
              These faces triggered match thresholds lower than the configured similarity limits (0.90). Operators must manually inspect, associate, or de-escalate.
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg font-bold shrink-0 uppercase tracking-widest animate-pulse">
          {unknownFaces.length} UNRESOLVED ANOMALIES
        </div>
      </div>

      {/* Success feedbacks */}
      {successBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400 flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span className="font-medium text-gray-200">{successBanner}</span>
        </motion.div>
      )}

      {/* Unknown Faces Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {unknownFaces.length === 0 ? (
          <div className="col-span-full bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center text-gray-500 text-xs font-mono">
            [TELEMETRY SECURE] - No unresolved unknown faces detected.
          </div>
        ) : (
          unknownFaces.map((face) => (
            <div 
              key={face.id} 
              className="bg-[#111827] border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row gap-5 hover:border-gray-700/80 transition-colors"
            >
              {/* Snapshot image container */}
              <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden border border-gray-800 shrink-0 relative group">
                <img 
                  src={face.imageUrl} 
                  alt="Anomalous Face Snap" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-2.5 left-2.5 bg-red-500 text-white font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  UNKNOWN
                </div>
              </div>

              {/* Data points */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2.5 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-mono text-[10px]">INCIDENT KEY: {face.id}</span>
                    <span className="text-red-400 font-bold font-mono">Cosine Match: {(face.confidence * 100).toFixed(1)}%</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono text-[11px]">
                        {new Date(face.timestamp).toLocaleString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span className="text-gray-500 ml-1">({new Date(face.timestamp).toLocaleDateString()})</span>
                      </span>
                    </div>

                    <div className="flex items-start space-x-2 text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{face.cameraLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Operator Actions drawer */}
                <div className="border-t border-gray-800/80 pt-3.5 mt-4 flex flex-wrap items-center gap-2">
                  <button
                    id={`btn-unknown-register-${face.id}`}
                    onClick={() => onNavigate('face-registration')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New</span>
                  </button>

                  <button
                    id={`btn-unknown-associate-${face.id}`}
                    onClick={() => handleOpenLinkModal(face.id)}
                    className="bg-gray-950 hover:bg-gray-900 text-gray-300 hover:text-white font-bold text-[10px] px-3 py-2 rounded-xl border border-gray-850 flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Associate File</span>
                  </button>

                  <button
                    id={`btn-unknown-ignore-${face.id}`}
                    onClick={() => handleIgnore(face.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Dismiss Incident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Profile Association Dialog */}
      {isLinkOpen && (
        <div id="association-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative"
          >
            <button
              onClick={() => setIsLinkOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-bold text-lg mb-2 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Associate Biometrics profile</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6 border-b border-gray-800/80 pb-3">
              Match this unresolved face token to an active registered database file.
            </p>

            <form onSubmit={handleCommitLink} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Select Registered Student</label>
                <select
                  id="link-student-selector"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Choose Profile --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.studentId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800/80">
                <button
                  type="button"
                  onClick={() => setIsLinkOpen(false)}
                  className="px-4 py-2 bg-gray-950 hover:bg-gray-900 border border-gray-850 text-gray-400 text-xs rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-commit-association"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
                >
                  Link Snap Map
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
