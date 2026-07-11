import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScanFace, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Building,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  BookOpen,
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  Fingerprint,
  RotateCcw,
  ShieldAlert,
  Server,
  Laptop
} from 'lucide-react';
import { AppUser } from '../types';

interface AuthProps {
  onAuthSuccess: (user: AppUser) => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'register';
  forcedMode?: 'session-expired' | 'access-denied' | null;
  currentUser?: AppUser | null;
}

type AuthStep = 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'reset-password' 
  | 'verify-otp' 
  | 'two-factor' 
  | 'session-expired' 
  | 'access-denied';

export default function Auth({ 
  onAuthSuccess, 
  onBackToLanding, 
  initialMode = 'login',
  forcedMode = null,
  currentUser = null
}: AuthProps) {
  
  // Primary state machine
  const [step, setStep] = useState<AuthStep>(
    forcedMode ? forcedMode : (initialMode === 'register' ? 'register' : 'login')
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'Admin' | 'Faculty' | 'Student' | 'Security' | 'Super Admin'>('Admin');
  
  // Dynamic Academic fields (for Students / Faculty)
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [course, setCourse] = useState('B.Tech AI & Data Science');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('Sec-A');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI Interactive States
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP inputs state (6 digits)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpTimer, setOtpTimer] = useState(59);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // 2FA state (6 digits)
  const [twoFactorCode, setTwoFactorCode] = useState<string[]>(Array(6).fill(''));
  const tfaRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Security Mechanisms
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // CAPTCHA implementation
  const [captchaChallenge, setCaptchaChallenge] = useState({ num1: 0, num2: 0, sum: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Password strength variables
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // 0 to 4
    label: 'Very Weak',
    color: 'bg-rose-500',
    hasLength: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpper: false
  });

  // Multiple Device Detection Simulation
  const [detectedDevices] = useState([
    { id: '1', name: 'Security Console (Primary Node)', location: 'Admin Block Room 302', active: true },
    { id: '2', name: 'Mobile Handheld Scanner', location: 'Main Entrance Guard House', active: false }
  ]);

  // Generate CAPTCHA on render or switch to login
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 2;
    const num2 = Math.floor(Math.random() * 9) + 2;
    setCaptchaChallenge({
      num1,
      num2,
      sum: num1 + num2
    });
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [step]);

  // Synchronize step with forcedMode changes
  useEffect(() => {
    if (forcedMode) {
      setStep(forcedMode);
    }
  }, [forcedMode]);

  // Timer countdowns for OTP & Security Locks
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify-otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Handle password strength calculation
  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    let score = 0;
    if (hasLength) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (hasUpper) score++;

    let label = 'Very Weak';
    let color = 'bg-rose-500';

    if (score === 1) {
      label = 'Weak';
      color = 'bg-rose-400';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-blue-400';
    } else if (score === 4) {
      label = 'Strong (FIPS Guard Active)';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({
      score,
      label,
      color,
      hasLength,
      hasNumber,
      hasSpecial,
      hasUpper
    });
  }, [password]);

  // Autofill helpers for easier testing of multiple roles
  const handleAutofillRole = (selectedRole: 'Admin' | 'Faculty' | 'Student' | 'Security' | 'Super Admin') => {
    setError('');
    setSuccessMsg('');
    setRole(selectedRole);
    setStep('login');

    if (selectedRole === 'Super Admin') {
      setEmail('shabberahammad10@gmail.com');
      setPassword('Cyberdyne2026!');
    } else if (selectedRole === 'Admin') {
      setEmail('admin@facevision.edu');
      setPassword('Admin2026!');
    } else if (selectedRole === 'Faculty') {
      setEmail('faculty@facevision.edu');
      setPassword('Faculty2026!');
    } else if (selectedRole === 'Security') {
      setEmail('security@facevision.edu');
      setPassword('Security2026!');
    } else if (selectedRole === 'Student') {
      setEmail('student@facevision.edu');
      setPassword('Student2026!');
    }
  };

  // Login execution with security parameters
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLocked) {
      setError(`Terminal locked. Remaining penalty lock timer: ${lockTimer}s`);
      return;
    }

    if (!email || !password) {
      setError('Please fulfill both authentication fields.');
      return;
    }

    // CAPTCHA check
    if (parseInt(captchaAnswer) !== captchaChallenge.sum) {
      setError('Anti-Automation Verification (CAPTCHA) failed.');
      generateCaptcha();
      return;
    }

    // Brute-force logic
    let expectedPassword = '';
    let userName = 'Enterprise Operative';
    let institution = 'Cyberdyne Systems Corp';

    if (email === 'shabberahammad10@gmail.com') {
      expectedPassword = 'Cyberdyne2026!';
      userName = 'Shabber Ahammad';
    } else if (email === 'admin@facevision.edu') {
      expectedPassword = 'Admin2026!';
      userName = 'Chief Administrator';
    } else if (email === 'faculty@facevision.edu') {
      expectedPassword = 'Faculty2026!';
      userName = 'Prof. Katherine Vance';
      institution = 'Dept of Advanced Robotics';
    } else if (email === 'security@facevision.edu') {
      expectedPassword = 'Security2026!';
      userName = 'Officer Marcus Vance';
      institution = 'Tactical Security Wing';
    } else if (email === 'student@facevision.edu') {
      expectedPassword = 'Student2026!';
      userName = 'John Connor';
      institution = 'Faculty of Cyber-Intelligence';
    } else {
      expectedPassword = 'SecurePassword123!';
    }

    if (password !== expectedPassword) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      
      if (nextFailed >= 3) {
        setIsLocked(true);
        setLockTimer(30);
        setError('CRITICAL SECURITY ERROR: 3 unsuccessful attempts registered. Biometric console locked for 30 seconds.');
      } else {
        setError(`Access Denied. Passcode incorrect. (${3 - nextFailed} attempts remaining before structural lock)`);
      }
      generateCaptcha();
      return;
    }

    // Proceed with secure multi-factor simulation
    setIsLoading(true);
    setSuccessMsg('Verifying system keys...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('');
      // Route to OTP screen
      setStep('verify-otp');
      setOtpTimer(59);
      setCanResendOtp(false);
      setOtp(Array(6).fill(''));
    }, 1200);
  };

  // OTP Verification Submission
  const handleOtpVerify = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please supply the complete 6-digit cryptographic token.');
      return;
    }

    setError('');
    setIsLoading(true);
    setSuccessMsg('Decrypting token signature...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('');

      // Map roles
      let activeRole: 'Admin' | 'Faculty' | 'Student' | 'Security' | 'Super Admin' = 'Admin';
      let userName = 'Enterprise Operator';
      let company = 'Cyberdyne Systems Corp';
      let studentIdVal = '';
      let facultyIdVal = '';

      if (email === 'shabberahammad10@gmail.com') {
        activeRole = 'Super Admin';
        userName = 'Shabber Ahammad';
      } else if (email === 'admin@facevision.edu') {
        activeRole = 'Admin';
        userName = 'Chief Admin Operator';
      } else if (email === 'faculty@facevision.edu') {
        activeRole = 'Faculty';
        userName = 'Prof. Katherine Vance';
        facultyIdVal = 'FAC-2026-9043';
        company = 'Academic Faculty';
      } else if (email === 'security@facevision.edu') {
        activeRole = 'Security';
        userName = 'Officer Marcus Vance';
        company = 'Main Guard Wing';
      } else if (email === 'student@facevision.edu') {
        activeRole = 'Student';
        userName = 'John Connor';
        studentIdVal = 'st-101'; // Map to John Connor from mockData
        company = 'Student Cadre';
      } else {
        // Fallback custom register state
        activeRole = role;
        userName = name || 'Enrolled Agent';
        company = department || 'General Operations';
        studentIdVal = studentId;
        facultyIdVal = facultyId;
      }

      const verifiedUser: AppUser = {
        name: userName,
        email: email || 'operative@cyberdyne.io',
        role: activeRole,
        avatarUrl: activeRole === 'Student' 
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        companyName: company,
        studentId: studentIdVal,
        facultyId: facultyIdVal,
        phoneNumber: phoneNumber || '555-0199',
        department: department,
        course: course,
        year: year,
        section: section,
        registrationDate: new Date().toISOString().split('T')[0]
      };

      // Redirect to 2FA for ultra-high security simulation
      setStep('two-factor');
      setTwoFactorCode(Array(6).fill(''));
    }, 1000);
  };

  // 2FA Verification Submission
  const handleTwoFactorVerify = () => {
    const fullCode = twoFactorCode.join('');
    if (fullCode.length < 6) {
      setError('Please supply the 6-digit Authenticator Shield key.');
      return;
    }

    setIsLoading(true);
    setSuccessMsg('Re-aligning secure tunnel...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('');

      // Formulate final user session payload
      let finalRole: 'Admin' | 'Faculty' | 'Student' | 'Security' | 'Super Admin' = 'Admin';
      let finalName = name || 'Staff Operative';
      let company = 'Cyberdyne Systems Corp';
      let studentIdVal = '';
      let facultyIdVal = '';

      if (email === 'shabberahammad10@gmail.com') {
        finalRole = 'Super Admin';
        finalName = 'Shabber Ahammad';
      } else if (email === 'admin@facevision.edu') {
        finalRole = 'Admin';
        finalName = 'Chief Admin Operator';
      } else if (email === 'faculty@facevision.edu') {
        finalRole = 'Faculty';
        finalName = 'Prof. Katherine Vance';
        facultyIdVal = 'FAC-2026-9043';
        company = 'Academic Faculty';
      } else if (email === 'security@facevision.edu') {
        finalRole = 'Security';
        finalName = 'Officer Marcus Vance';
        company = 'Tactical Guard Wing';
      } else if (email === 'student@facevision.edu') {
        finalRole = 'Student';
        finalName = 'John Connor';
        studentIdVal = 'st-101'; // Map to John Connor from mockData
        company = 'Student Cadre';
      } else {
        finalRole = role;
        studentIdVal = studentId;
        facultyIdVal = facultyId;
        company = department || 'FaceVision Institute';
      }

      const authenticatedUser: AppUser = {
        name: finalName,
        email: email || 'operative@cyberdyne.io',
        role: finalRole,
        avatarUrl: finalRole === 'Student' 
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        companyName: company,
        studentId: studentIdVal,
        facultyId: facultyIdVal,
        phoneNumber: phoneNumber || '555-0199',
        department: department,
        course: course,
        year: year,
        section: section,
        registrationDate: new Date().toISOString().split('T')[0]
      };

      // Save user session for persistence if remember me checked
      if (rememberMe) {
        localStorage.setItem('facevision_session', JSON.stringify(authenticatedUser));
      }

      onAuthSuccess(authenticatedUser);
    }, 1200);
  };

  // Register New Node Form Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!acceptTerms) {
      setError('You must authorize the biometric storage disclosure agreements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Primary and validation passcodes do not match.');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Security passcode is too weak. Must align with higher entropy rules.');
      return;
    }

    if (role === 'Student' && !studentId) {
      setError('Student Registration requires a valid Student ID token.');
      return;
    }

    if (role === 'Faculty' && !facultyId) {
      setError('Faculty Enrolment requires a valid Faculty ID token.');
      return;
    }

    setIsLoading(true);
    setSuccessMsg('Encrypting biometric blueprint & enrolling node...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('');
      setStep('verify-otp');
      setOtpTimer(59);
      setCanResendOtp(false);
      setOtp(Array(6).fill(''));
    }, 1500);
  };

  // Forgot password flow
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please state your registered security email.');
      return;
    }

    setIsLoading(true);
    setSuccessMsg('Looking up email and preparing dispatch...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`Crypto-override token dispatched to: ${email}. Please check your inbox within 10 minutes.`);
      
      // Auto transition to Reset Password after showing the notification
      setTimeout(() => {
        setStep('reset-password');
        setSuccessMsg('');
      }, 2500);
    }, 1200);
  };

  // Reset password override flow
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passcodes do not match.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Your new passcode must meet the multi-factor high strength rating.');
      return;
    }

    setIsLoading(true);
    setSuccessMsg('Rewriting cryptographic credential blocks...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Credentials successfully updated. Re-routing to login panel.');
      
      setTimeout(() => {
        setStep('login');
        setSuccessMsg('');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    }, 1500);
  };

  // Handle OTP field transitions
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const cleanVal = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next field
    if (cleanVal !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle 2FA field transitions
  const handleTwoFactorChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const cleanVal = val.slice(-1);
    const newCode = [...twoFactorCode];
    newCode[index] = cleanVal;
    setTwoFactorCode(newCode);

    // Auto-focus next field
    if (cleanVal !== '' && index < 5) {
      tfaRefs.current[index + 1]?.focus();
    }
  };

  const handleTwoFactorKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && twoFactorCode[index] === '' && index > 0) {
      tfaRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div id="auth-main-viewport" className="min-h-screen bg-[#020617] flex flex-col justify-between items-center relative overflow-hidden py-8 px-4 sm:px-6">
      
      {/* Dynamic Cyber Orbs background */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating System Header */}
      <div className="w-full max-w-5xl flex items-center justify-between relative z-20 mb-4">
        <button 
          id="btn-back-landing-root"
          onClick={onBackToLanding}
          className="flex items-center space-x-3 group hover:opacity-80 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <ScanFace className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-lg tracking-tight">FaceVision</p>
            <p className="text-[9px] text-blue-400 font-mono tracking-widest uppercase">System Security Portal</p>
          </div>
        </button>

        {/* Demo Roles Shortcut Panel - IMMERSIVE ROLE SWITCHING */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 border border-slate-850 p-1.5 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 px-2 font-mono uppercase">Instant Role Demo:</span>
          {(['Super Admin', 'Admin', 'Faculty', 'Security', 'Student'] as const).map((r) => (
            <button
              id={`quick-login-${r.toLowerCase().replace(' ', '-')}`}
              key={r}
              onClick={() => handleAutofillRole(r)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                role === r && step === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Central Interactive Content Window */}
      <div className="w-full max-w-xl relative z-10 my-auto flex flex-col items-center">
        
        {/* Mobile quick demo selector (visible on small viewports) */}
        <div className="w-full lg:hidden flex flex-wrap justify-center gap-1.5 mb-5 bg-slate-950/60 border border-slate-850 p-2 rounded-2xl backdrop-blur-md">
          <p className="w-full text-center text-[9px] font-semibold text-slate-500 font-mono uppercase mb-1">Quick Demo Login Selector</p>
          {(['Super Admin', 'Admin', 'Faculty', 'Security', 'Student'] as const).map((r) => (
            <button
              id={`quick-login-mobile-${r.toLowerCase().replace(' ', '-')}`}
              key={r}
              onClick={() => handleAutofillRole(r)}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                role === r && step === 'login'
                  ? 'bg-blue-600 text-white border border-blue-500/20'
                  : 'text-slate-400 bg-slate-900/40 hover:bg-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* =========================================================================
              1. LOGIN VIEW
              ========================================================================= */}
          {step === 'login' && (
            <motion.div
              key="step-login"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              {/* Scanline details */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center mb-3">
                  <Fingerprint className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Access System Terminal</h2>
                <p className="text-xs text-slate-400">Unlock high-fidelity biometric surveillance feed and identity ledger.</p>
              </div>

              <form id="form-login-core" onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="login-email-input"
                      type="email"
                      placeholder="e.g. operative@cyberdyne.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Passcode Key</label>
                    <button 
                      id="btn-switch-forgot"
                      type="button" 
                      onClick={() => setStep('forgot-password')}
                      className="text-[10px] text-blue-400 hover:underline hover:text-blue-300 font-semibold"
                    >
                      Forgot passcode?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/40 transition-colors"
                      required
                    />
                    <button
                      id="btn-toggle-pass-login"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mathematical CAPTCHA Layer */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Anti-Automation Sentinel</span>
                    <span className="text-xs text-slate-300 font-mono">Solve Equation: <strong className="text-blue-400 text-sm font-bold bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/30">{captchaChallenge.num1} + {captchaChallenge.num2}</strong> = ?</span>
                  </div>
                  <input
                    id="login-captcha-input"
                    type="number"
                    placeholder="Sum"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-20 bg-slate-950 text-center text-xs text-white font-mono font-bold py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500/40"
                    required
                  />
                </div>

                {/* Remember Me and System lock checks */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <span>Keep current terminal node active</span>
                  </label>
                </div>

                {/* Error/Success Feedbacks */}
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span className="animate-pulse">{successMsg}</span>
                  </div>
                )}

                {/* Action button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading || isLocked}
                  className={`w-full text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer border ${
                    isLocked 
                      ? 'bg-slate-800 text-slate-500 border-slate-700 shadow-none cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-500/30 shadow-blue-500/10 hover:shadow-blue-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying System Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In and Launch Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* SSO Sign-In Integrations */}
              <div className="mt-6 pt-5 border-t border-slate-850 space-y-3">
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono text-slate-500">
                  <span className="bg-[#020617] px-3">Or Authenticate via Enterprise SSO</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="btn-sso-google"
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setSuccessMsg('Interfacing with Google Security Gateway...');
                      setTimeout(() => {
                        onAuthSuccess({
                          name: 'Shabber Ahammad',
                          email: 'shabberahammad10@gmail.com',
                          role: 'Super Admin',
                          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                          companyName: 'Cyberdyne Systems Corp'
                        });
                      }, 1200);
                    }}
                    className="bg-slate-900/60 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs border border-slate-800 hover:border-slate-750 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google Identity</span>
                  </button>

                  <button
                    id="btn-sso-microsoft"
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setSuccessMsg('Contacting Microsoft Active Directory...');
                      setTimeout(() => {
                        onAuthSuccess({
                          name: 'Prof. Katherine Vance',
                          email: 'faculty@facevision.edu',
                          role: 'Faculty',
                          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                          companyName: 'Academic Faculty'
                        });
                      }, 1200);
                    }}
                    className="bg-slate-900/60 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs border border-slate-800 hover:border-slate-750 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="10.5" height="10.5" fill="#F25022"/>
                      <rect x="11.5" width="10.5" height="10.5" fill="#7FBA00"/>
                      <rect y="11.5" width="10.5" height="10.5" fill="#00A4EF"/>
                      <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900"/>
                    </svg>
                    <span>Microsoft SSO</span>
                  </button>
                </div>
              </div>

              {/* Page mode toggler */}
              <div className="text-center mt-5 pt-3 border-t border-slate-850/60">
                <button
                  id="btn-switch-register"
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Need access? <span className="text-blue-400 font-bold underline">Enroll new node registry</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              2. REGISTER VIEW
              ========================================================================= */}
          {step === 'register' && (
            <motion.div
              key="step-register"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

              <div className="text-center space-y-1 mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Biometric Node Enrollment</h2>
                <p className="text-xs text-slate-400 font-sans">Initialize your agency card and register identity signatures.</p>
              </div>

              <form id="form-register-core" onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                
                {/* Full Name & Role Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        id="register-fullname"
                        type="text"
                        placeholder="e.g. John Connor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">System Clearance Role</label>
                    <select
                      id="register-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 px-3 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Security">Security</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Enrolment Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        id="register-email"
                        type="email"
                        placeholder="operative@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        id="register-phone"
                        type="tel"
                        placeholder="+1 (555) 0123"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Role-Dependent Extra Fields: Student ID or Faculty ID */}
                {(role === 'Student' || role === 'Admin' || role === 'Super Admin') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Student ID Token</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="register-student-id"
                          type="text"
                          placeholder="e.g. STU-2026-4402"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                          required={role === 'Student'}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Course / Stream</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="register-course"
                          type="text"
                          placeholder="e.g. AI & Robotics"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(role === 'Faculty' || role === 'Admin' || role === 'Super Admin') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Faculty ID Token</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="register-faculty-id"
                          type="text"
                          placeholder="e.g. FAC-2026-9043"
                          value={facultyId}
                          onChange={(e) => setFacultyId(e.target.value)}
                          className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                          required={role === 'Faculty'}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Department Block</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="register-dept"
                          type="text"
                          placeholder="e.g. Dept of CS"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional academic parameters */}
                {role === 'Student' && (
                  <div className="grid grid-cols-3 gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono text-slate-500 font-bold">Academic Year</label>
                      <select
                        id="register-year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-slate-950 text-[11px] text-slate-300 py-1.5 px-2 rounded-lg border border-slate-800"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono text-slate-500 font-bold">Class Section</label>
                      <input
                        id="register-section"
                        type="text"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full bg-slate-950 text-[11px] text-slate-300 py-1.5 px-2 rounded-lg border border-slate-800 text-center"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <div className="text-[9px] uppercase font-mono text-slate-500 font-bold text-center">Division</div>
                      <span className="text-[11px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 rounded-lg text-center py-1.5 font-bold font-mono">DIV-B</span>
                    </div>
                  </div>
                )}

                {/* Secure Passcode Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="High-entropy passcode (Min 8 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                      required
                    />
                    <button
                      id="btn-toggle-pass-register"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* High Fidelity Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-850/80">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Strength Level:</span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          passwordStrength.score >= 3 ? 'text-emerald-400 bg-emerald-950/30' : 
                          passwordStrength.score === 2 ? 'text-amber-400 bg-amber-950/30' : 'text-rose-400 bg-rose-950/30'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-800'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-800'}`} />
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono text-slate-400 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasLength ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-800'}`} />
                          <span>8+ Characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasUpper ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-800'}`} />
                          <span>Capital Letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasNumber ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-800'}`} />
                          <span>Numerical Digit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasSpecial ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-800'}`} />
                          <span>Special Character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Re-enter Passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm security passcode"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Accept Terms checkbox */}
                <div className="pt-1.5">
                  <label className="flex items-start space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      id="checkbox-accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 mt-0.5"
                    />
                    <span>I authorize storing my face blueprint signatures under secure FIPS encryption standards for automatic scanning.</span>
                  </label>
                </div>

                {/* Error/Success Feedbacks */}
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span className="animate-pulse">{successMsg}</span>
                  </div>
                )}

                {/* Action button */}
                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 flex items-center justify-center space-x-2 cursor-pointer mt-4 border border-indigo-500/30"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encrypting Blueprint Snapshot...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Biometric Snapshot</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle to sign-in */}
              <div className="text-center mt-5 pt-3 border-t border-slate-850/60">
                <button
                  id="btn-switch-login"
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Already registered? <span className="text-indigo-400 font-bold underline">Access system terminal</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              3. FORGOT PASSWORD VIEW
              ========================================================================= */}
          {step === 'forgot-password' && (
            <motion.div
              key="step-forgot"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recover Secure Passcode</h2>
                <p className="text-xs text-slate-400">State your registered email node. We will dispatch an override cryptographic authorization packet.</p>
              </div>

              <form id="form-forgot-core" onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="forgot-email-input"
                      type="email"
                      placeholder="e.g. operative@cyberdyne.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs animate-pulse">
                    {successMsg}
                  </div>
                )}

                <button
                  id="btn-forgot-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 border border-blue-500/30"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating secure bypass token...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Recovery Authorization</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  id="btn-switch-login-from-forgot"
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-xs text-blue-400 font-semibold underline hover:text-blue-300"
                >
                  Return to system login
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              4. RESET PASSWORD VIEW
              ========================================================================= */}
          {step === 'reset-password' && (
            <motion.div
              key="step-reset"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Override Security Passcode</h2>
                <p className="text-xs text-slate-400">Securely re-establish credentials for high security clearances.</p>
              </div>

              <form id="form-reset-core" onSubmit={handleResetPasswordSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">New Secure Passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="reset-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Validate New Passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      id="reset-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/60 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
                    {successMsg}
                  </div>
                )}

                <button
                  id="btn-reset-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 border border-blue-500/30"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Apply Override Credential</span>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* =========================================================================
              5. VERIFY OTP VIEW
              ========================================================================= */}
          {step === 'verify-otp' && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Identity Token Verification</h2>
                <p className="text-xs text-slate-400">Enter the 6-digit dynamic cryptographic OTP code dispatched to operative channel.</p>
              </div>

              <div className="space-y-6">
                
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      id={`otp-digit-${idx}`}
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-900 text-center text-lg sm:text-xl font-bold text-white rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 font-mono"
                    />
                  ))}
                </div>

                {/* Countdown / Timer Display */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-xs text-slate-400 font-mono">
                    Token Clearance Window Expires In:{' '}
                    <span className="text-blue-400 font-bold">
                      {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Didn't receive credentials?</span>
                    <button
                      id="btn-resend-otp"
                      disabled={!canResendOtp}
                      onClick={() => {
                        setOtpTimer(59);
                        setCanResendOtp(false);
                        setOtp(Array(6).fill(''));
                        setSuccessMsg('Crypto-token refreshed and dispatched.');
                        setTimeout(() => setSuccessMsg(''), 2000);
                      }}
                      className={`font-bold transition-all cursor-pointer ${
                        canResendOtp 
                          ? 'text-blue-400 hover:text-blue-300 underline' 
                          : 'text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Resend Cryptographic Token
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs text-center">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs text-center animate-pulse">
                    {successMsg}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    id="btn-otp-cancel"
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
                  >
                    Abort
                  </button>
                  
                  <button
                    id="btn-otp-verify-submit"
                    type="button"
                    onClick={handleOtpVerify}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs border border-blue-500/30 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    Verify Token
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* =========================================================================
              6. TWO FACTOR AUTHENTICATION VIEW
              ========================================================================= */}
          {step === 'two-factor' && (
            <motion.div
              key="step-2fa"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Identity Verification Guard</h2>
                <p className="text-xs text-slate-400 font-sans">Open your dynamic authenticator app (Google Authenticator or Microsoft Identity) to retrieve your 6-digit security code.</p>
              </div>

              <div className="space-y-5">
                
                <div className="flex justify-center gap-2 sm:gap-3">
                  {twoFactorCode.map((digit, idx) => (
                    <input
                      id={`tfa-digit-${idx}`}
                      key={idx}
                      ref={el => { tfaRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleTwoFactorChange(idx, e.target.value)}
                      onKeyDown={(e) => handleTwoFactorKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-900 text-center text-lg sm:text-xl font-bold text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 font-mono shadow-[0_0_8px_rgba(16,185,129,0.05)]"
                    />
                  ))}
                </div>

                <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 flex items-start gap-2.5">
                  <Laptop className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Device Profile Registered</p>
                    <p className="text-[11px] text-slate-500">Security node detected on your standard subnet. Session security tags verified.</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs text-center">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs text-center animate-pulse">
                    {successMsg}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    id="btn-tfa-cancel"
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
                  >
                    Abort Identity
                  </button>
                  
                  <button
                    id="btn-tfa-verify-submit"
                    type="button"
                    onClick={handleTwoFactorVerify}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-xs border border-emerald-500/30 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    Confirm Clearances
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* =========================================================================
              7. SESSION EXPIRED VIEW
              ========================================================================= */}
          {step === 'session-expired' && (
            <motion.div
              key="step-expired"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden text-center"
            >
              {/* Expired glowing boundary */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Security Token Expired</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
                Your FaceVision AI core session has been terminated due to inactive idle-state exceeding standard FIPS-compliances.
              </p>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-left space-y-1.5 mb-6">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Inactivity Log</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Previous clearance node:</span>
                  <span className="text-slate-200 font-mono font-semibold">Web Interface (Subnet-01)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Incident Code:</span>
                  <span className="text-amber-400 font-mono font-bold">ERR_SESSION_TIMEOUT_093</span>
                </div>
              </div>

              <button
                id="btn-reauthenticate"
                onClick={() => {
                  setStep('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs border border-blue-500/30 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Authenticate Node Session</span>
              </button>
            </motion.div>
          )}

          {/* =========================================================================
              8. ACCESS DENIED VIEW
              ========================================================================= */}
          {step === 'access-denied' && (
            <motion.div
              key="step-denied"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-slate-950/85 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden text-center"
            >
              {/* Alert red glowing boundary */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

              <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Insufficient Clearance</h2>
              <p className="text-xs text-rose-400 max-w-sm mx-auto font-mono mb-6 uppercase tracking-wide">
                WARNING: Unauthorized Core Terminal Access Attempted.
              </p>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-left space-y-2 mb-6">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5 text-rose-400">
                  <Server className="w-3.5 h-3.5" />
                  <span>Security Enforcement Log</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p>• Your current clearance role (<strong className="text-slate-200">{currentUser?.role || 'Unauthenticated'}</strong>) is not authorized to bypass the requested system firewall.</p>
                  <p>• Attempting to override system constraints will result in local biometric registry lockouts.</p>
                  <p className="text-[10px] font-mono text-slate-500 font-bold">INCIDENT LOGGED UNDER PROTOCOL SEC-403 @ {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  id="btn-denied-logout"
                  onClick={onBackToLanding}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
                >
                  Terminate Connection
                </button>
                <button
                  id="btn-denied-return"
                  onClick={() => {
                    // Back to safe zone (dashboard if logged in, else login)
                    if (currentUser) {
                      onAuthSuccess(currentUser); // re-trigger success to land back on permitted home
                    } else {
                      setStep('login');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-650 text-white font-bold py-3 rounded-xl text-xs border border-rose-500/30 transition-all shadow-lg shadow-rose-950/20 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Persistent Terminal Status Bar (footer) */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-5xl gap-4 border-t border-slate-900 pt-6 mt-4 relative z-20">
        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AES-256 Crypto Key Enrolled</span>
          <span className="text-slate-800">•</span>
          <span>FIPS 140-2 Compliance Verified</span>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          Node Subnet Ref: <span className="text-blue-500">FACEVISION_NODE_0993</span>
        </div>
      </div>

    </div>
  );
}
