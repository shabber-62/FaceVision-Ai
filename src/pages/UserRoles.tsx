import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Users, 
  Key, 
  UserCheck, 
  Smartphone, 
  Globe, 
  Check, 
  X, 
  AlertOctagon, 
  Fingerprint, 
  Cpu, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface Privilege {
  key: string;
  label: string;
  description: string;
  category: 'Operations' | 'Security' | 'System';
}

const ALL_PRIVILEGES: Privilege[] = [
  { key: 'manage-students', label: 'Manage Students', description: 'Enrolling, editing and purging student rosters', category: 'Operations' },
  { key: 'register-faces', label: 'Register Faces', description: 'Generating custom local neural face blueprints', category: 'Operations' },
  { key: 'view-attendance', label: 'View Attendance', description: 'Reading dynamic recognition tracking history logs', category: 'Operations' },
  { key: 'edit-attendance', label: 'Edit Attendance', description: 'Overriding and manual signing of attendance logs', category: 'Operations' },
  { key: 'generate-reports', label: 'Generate Reports', description: 'Exporting raw attendance charts to spreadsheets', category: 'Operations' },
  { key: 'manage-cameras', label: 'Manage Cameras', description: 'Modifying resolution configurations and active video feeds', category: 'Security' },
  { key: 'manage-ai-models', label: 'Manage AI Models', description: 'Adjusting inference confidence thresholds and model versions', category: 'Security' },
  { key: 'manage-users', label: 'Manage Users', description: 'Provisioning academic and operational staff clearance keys', category: 'Security' },
  { key: 'manage-roles', label: 'Manage Roles', description: 'Altering high-level role permission parameters', category: 'Security' },
  { key: 'system-settings', label: 'System Settings', description: 'Modifying system environment variables and FIPS rules', category: 'System' },
  { key: 'analytics', label: 'Analytics & Trends', description: 'Accessing machine-learning trends and statistical heatmaps', category: 'System' }
];

interface RolePermission {
  role: string;
  permissions: string[];
}

export default function UserRoles() {
  const [activeTab, setActiveTab] = useState<'permissions' | 'directory' | 'devices'>('permissions');
  
  // Matrix of role permissions
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    {
      role: 'Super Admin',
      permissions: ALL_PRIVILEGES.map(p => p.key) // has all permissions
    },
    {
      role: 'Admin',
      permissions: ['manage-students', 'register-faces', 'view-attendance', 'edit-attendance', 'generate-reports', 'manage-cameras', 'manage-ai-models', 'manage-users', 'system-settings', 'analytics']
    },
    {
      role: 'Faculty',
      permissions: ['view-attendance', 'edit-attendance', 'generate-reports', 'analytics']
    },
    {
      role: 'Security',
      permissions: ['view-attendance', 'manage-cameras', 'register-faces']
    },
    {
      role: 'Student',
      permissions: ['view-attendance']
    }
  ]);

  // Active Users directory (Enterprise)
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Shabber Ahammad', email: 'shabberahammad10@gmail.com', role: 'Super Admin', status: 'Active', devices: 2, confidence: '99.4%' },
    { id: 'usr-2', name: 'Prof. Katherine Vance', email: 'faculty@facevision.edu', role: 'Faculty', status: 'Active', devices: 1, confidence: '97.2%' },
    { id: 'usr-3', name: 'Officer Marcus Vance', email: 'security@facevision.edu', role: 'Security', status: 'Active', devices: 1, confidence: '98.5%' },
    { id: 'usr-4', name: 'John Connor', email: 'student@facevision.edu', role: 'Student', status: 'Active', devices: 1, confidence: '96.8%' },
    { id: 'usr-5', name: 'Sarah Connor', email: 'sconnor@cyberdyne.io', role: 'Admin', status: 'Suspended', devices: 0, confidence: '99.1%' }
  ]);

  // Detected active devices (Multi-device tracking)
  const [devices, setDevices] = useState([
    { id: 'dev-1', name: 'Core Admin Terminal', owner: 'Shabber Ahammad', ip: '192.168.1.104', type: 'Desktop Node', location: 'Server Center Wing-B', lastActive: 'Just Now', status: 'Connected' },
    { id: 'dev-2', name: 'Tactical Guard Tablet', owner: 'Officer Marcus Vance', ip: '10.0.4.52', type: 'Mobile Handheld', location: 'Main Entrance Gate House', lastActive: '2 mins ago', status: 'Connected' },
    { id: 'dev-3', name: 'Faculty Lectern Station', owner: 'Prof. Katherine Vance', ip: '172.16.89.12', type: 'Podium PC', location: 'Bio-Lectern Room 405', lastActive: '15 mins ago', status: 'Idle' },
    { id: 'dev-4', name: 'Cyberdyne Scanner Laptop', owner: 'Sarah Connor', ip: '192.168.1.89', type: 'Field Unit', location: 'Mobile Recon Subnet', lastActive: '3 days ago', status: 'Revoked' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle permission toggling
  const handleTogglePermission = (roleName: string, permissionKey: string) => {
    if (roleName === 'Super Admin') {
      triggerNotification("Super Admin role privileges are immutable and locked under FIPS guidelines.");
      return; // Cannot toggle super admin
    }

    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === roleName) {
        const exists = rp.permissions.includes(permissionKey);
        const nextPermissions = exists 
          ? rp.permissions.filter(p => p !== permissionKey)
          : [...rp.permissions, permissionKey];
        
        triggerNotification(`Updated ${roleName} clearance: ${permissionKey} set to ${!exists ? 'ENABLED' : 'DISABLED'}`);
        return {
          ...rp,
          permissions: nextPermissions
        };
      }
      return rp;
    }));
  };

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Terminate a device session dynamically
  const handleRevokeDevice = (deviceId: string, name: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'Revoked' } : d));
    triggerNotification(`Revoked node signature for device: ${name}`);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="clearances-roles-page" className="space-y-6">
      
      {/* Dynamic Success Alert */}
      {successMessage && (
        <div className="fixed top-24 right-8 z-50 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wide">{successMessage}</span>
        </div>
      )}

      {/* Header section with telemetry feel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-6 rounded-3xl border border-slate-900 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></div>
            <h1 className="text-xl font-bold text-white tracking-tight">Security Clearances & Multi-Role Console</h1>
          </div>
          <p className="text-xs text-slate-400">Perform credential sweeps, adjust operational permission boundaries, and audit multi-device socket connections.</p>
        </div>

        {/* Console stats widgets */}
        <div className="flex flex-wrap gap-3 font-mono">
          <div className="bg-slate-950/80 border border-slate-850 px-3.5 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Clearance Roles</p>
            <p className="text-sm font-bold text-blue-400">5 ACTIVE</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-850 px-3.5 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Nodes</p>
            <p className="text-sm font-bold text-emerald-400">4 AUDITED</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-900 gap-1 pb-px">
        <button
          id="btn-tab-permissions"
          onClick={() => setActiveTab('permissions')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5" />
            Clearance Privileges Matrix
          </span>
        </button>

        <button
          id="btn-tab-directory"
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Enterprise Users Directory
          </span>
        </button>

        <button
          id="btn-tab-devices"
          onClick={() => setActiveTab('devices')}
          className={`px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'devices'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" />
            Device Terminal Manager
          </span>
        </button>
      </div>

      {/* Dynamic Tab Workspace */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: PERMISSIONS MATRIX */}
        {activeTab === 'permissions' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Disclaimer box */}
            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wide">FIPS Clearance Rule Control</p>
                <p className="text-xs text-slate-400">Click any check indicator inside the matrix to revoke or grant system access clearances in real-time. Super Admin credentials cannot be modified.</p>
              </div>
            </div>

            {/* Privileges Matrix Grid Table */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6 min-w-[200px]">System Privilege</th>
                      {(['Super Admin', 'Admin', 'Faculty', 'Security', 'Student'] as const).map(role => (
                        <th key={role} className="p-4 text-center min-w-[110px]">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-sans">
                    {ALL_PRIVILEGES.map(priv => (
                      <tr key={priv.key} className="hover:bg-slate-900/20 transition-all">
                        {/* Privilege info column */}
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-slate-200">{priv.label}</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 font-sans leading-relaxed">{priv.description}</p>
                        </td>

                        {/* Interactive columns per role */}
                        {(['Super Admin', 'Admin', 'Faculty', 'Security', 'Student'] as const).map(roleName => {
                          const rp = rolePermissions.find(p => p.role === roleName);
                          const isAllowed = rp?.permissions.includes(priv.key);
                          
                          return (
                            <td key={roleName} className="p-4 text-center">
                              <button
                                id={`perm-btn-${roleName.toLowerCase().replace(' ', '-')}-${priv.key}`}
                                onClick={() => handleTogglePermission(roleName, priv.key)}
                                disabled={roleName === 'Super Admin'}
                                className={`mx-auto w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                                  isAllowed
                                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 cursor-pointer'
                                    : 'bg-slate-950/60 border-slate-850/80 text-slate-600 hover:bg-blue-600/10 hover:border-blue-500/20 hover:text-blue-400 cursor-pointer'
                                } ${roleName === 'Super Admin' ? 'opacity-90 hover:bg-blue-600/10 hover:border-blue-500/20 hover:text-blue-400 cursor-default' : ''}`}
                              >
                                {isAllowed ? (
                                  <Check className="w-4 h-4 font-bold" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ENTERPRISE DIRECTORY */}
        {activeTab === 'directory' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Filter and search bars */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="directory-search-input"
                  type="text"
                  placeholder="Query user database by name, role or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-900 text-slate-300 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="flex gap-2 font-mono">
                <button
                  id="btn-filter-active"
                  className="bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-850 px-4 py-2 text-xs font-bold text-slate-300 rounded-2xl flex items-center gap-2 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Only Active</span>
                </button>
              </div>
            </div>

            {/* Directory Table */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Operator Detail</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Biometric Enrollment</th>
                      <th className="p-4">Active Socket Devices</th>
                      <th className="p-4">System Status</th>
                      <th className="p-4 text-right pr-6">Override Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-sans text-slate-300">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-slate-200">{u.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border ${
                            u.role === 'Super Admin' ? 'bg-indigo-950/60 text-indigo-300 border-indigo-900/40' :
                            u.role === 'Admin' ? 'bg-blue-950/60 text-blue-300 border-blue-900/40' :
                            u.role === 'Faculty' ? 'bg-amber-950/60 text-amber-300 border-amber-900/40' :
                            u.role === 'Security' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/40' :
                            'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                            <span>{u.confidence}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">{u.devices} Node(s)</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-rose-500'}`} />
                            <span>{u.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button
                            id={`btn-audit-${u.id}`}
                            onClick={() => triggerNotification(`Enforcing audit sweep on ${u.name}`)}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-[10px] font-semibold transition-all cursor-pointer font-mono"
                          >
                            Sweep Node
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DEVICE TERMINAL MANAGER */}
        {activeTab === 'devices' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Multiple device monitoring summary */}
            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="p-2 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wide">Multi-Device Tunnel Registry</p>
                <p className="text-xs text-slate-400">The system logs IP subnet addresses for each session. You can immediately sever any device websocket connections if anomalous behavior is suspected.</p>
              </div>
            </div>

            {/* Device Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(dev => (
                <div 
                  id={`device-card-${dev.id}`}
                  key={dev.id}
                  className={`bg-slate-950/80 border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all ${
                    dev.status === 'Connected' ? 'border-emerald-950/60 shadow-[0_0_12px_rgba(16,185,129,0.02)]' :
                    dev.status === 'Idle' ? 'border-slate-850' : 'border-rose-950 opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Device header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          dev.status === 'Connected' ? 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400' :
                          dev.status === 'Idle' ? 'bg-slate-900 border-slate-800 text-slate-400' :
                          'bg-rose-950/40 border-rose-900/30 text-rose-400'
                        }`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-200 text-sm">{dev.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{dev.type} • IP: {dev.ip}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wide ${
                        dev.status === 'Connected' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/30' :
                        dev.status === 'Idle' ? 'bg-slate-900 text-slate-400 border border-slate-800' :
                        'bg-rose-950/60 text-rose-300 border border-rose-900/30'
                      }`}>
                        {dev.status}
                      </span>
                    </div>

                    {/* Metadata fields */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">Assigned Operator</span>
                        <span className="text-slate-300 font-semibold">{dev.owner}</span>
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">System Location</span>
                        <span className="text-slate-300 font-semibold">{dev.location}</span>
                      </div>
                      <div className="space-y-0.5 text-left col-span-2">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">Last Cryptographic Handshake</span>
                        <span className="text-slate-400 font-mono">{dev.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions strip */}
                  <div className="mt-5 pt-4 border-t border-slate-900 flex justify-end gap-2.5">
                    {dev.status !== 'Revoked' ? (
                      <button
                        id={`btn-revoke-${dev.id}`}
                        onClick={() => handleRevokeDevice(dev.id, dev.name)}
                        className="bg-rose-950/80 hover:bg-rose-900 border border-rose-900 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide uppercase font-mono transition-all cursor-pointer"
                      >
                        Sever Session
                      </button>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-mono font-bold uppercase tracking-wider py-1.5 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        Access Credentials Blocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
