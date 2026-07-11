import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Building, 
  Lock, 
  ShieldAlert, 
  CheckCircle, 
  History, 
  Eye, 
  EyeOff, 
  Save, 
  Key,
  ShieldCheck
} from 'lucide-react';
import { AppUser, ActivityLog } from '../types';

interface ProfileViewProps {
  user: AppUser;
  activities: ActivityLog[];
  onUpdateUser: (newUser: AppUser) => void;
}

export default function ProfileView({ user, activities, onUpdateUser }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.companyName);

  // Change password fields
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [toast, setToast] = useState('');

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      companyName: company
    });
    setToast('Operator metadata updated in system mainframes.');
    setTimeout(() => setToast(''), 4500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert('Error: Confirmed key does not match.');
      return;
    }
    
    setToast('Passcode symmetric cryptographic map updated successfully.');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setToast(''), 4500);
  };

  // Filter activities executed by this user specifically
  const userActivities = activities.filter(act => act.user === user.email || act.user === 'shabberahammad10@gmail.com');

  return (
    <div id="profile-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Toast Alert */}
      {toast && (
        <div className="col-span-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400 flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium text-gray-200">{toast}</span>
        </div>
      )}

      {/* Left Pane: Identity Card & Credentials Details Form (7 Columns) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Profile Details Form */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-gray-850 pb-3">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-sm">Operator Identity Specifications</h3>
          </div>

          <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Operator Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Corporate Agency</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    id="profile-company-input"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-profile-details-save"
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Passcode Card */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-gray-850 pb-3">
            <Key className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-white font-bold text-sm">Biometric Bypass Passcode amendment</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Old */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Current Key</label>
                <input
                  id="profile-oldpass-input"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* New */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">New Key</label>
                <input
                  id="profile-newpass-input"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Confirm New Key</label>
                <input
                  id="profile-confirmpass-input"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 text-xs text-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[10px] text-gray-500 hover:text-white transition-colors"
              >
                {showPass ? 'Hide keystrokes' : 'Show plain text keystrokes'}
              </button>

              <button
                id="btn-profile-passcode-save"
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Amend Passcode</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Right Pane: User visual bio & Personal Ticker Activities (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Profile Card Banner */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/35 shadow-inner"
            />
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <span className="text-[10px] text-white font-mono font-bold uppercase">RE-UPLOAD</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-white font-bold text-base">{user.name}</h4>
            <p className="text-xs text-gray-400 font-mono">{user.email}</p>
            <div className="pt-1.5 flex justify-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">
                {user.role}
              </span>
              <span className="text-[10px] font-mono bg-gray-950 border border-gray-850 text-gray-500 px-2 py-0.5 rounded">
                Node Node-G101
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-950/40 border border-gray-850 p-4 rounded-2xl text-xs text-gray-400 flex items-center justify-between text-left">
            <div className="space-y-1">
              <p className="text-gray-500 font-medium">Session IP Address:</p>
              <p className="text-gray-300 font-mono font-semibold">172.16.8.219 (FIPS)</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-gray-500 font-medium">Surveillance Token:</p>
              <p className="text-emerald-400 font-mono font-semibold">ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Chronological Personal trace logs */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <History className="w-4.5 h-4.5 text-blue-400" />
            <h4 className="text-white font-bold text-sm">Personal Action Trace Log</h4>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {userActivities.length === 0 ? (
              <div className="text-center text-gray-500 text-xs font-mono p-4">
                No active operator session trails located.
              </div>
            ) : (
              userActivities.map((act) => (
                <div 
                  key={act.id} 
                  className="bg-gray-950/40 border border-gray-850/60 p-2.5 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-200">{act.action}</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{act.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
