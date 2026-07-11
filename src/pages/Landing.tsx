import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ScanFace, 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Video, 
  Lock, 
  CheckCircle, 
  ChevronDown, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { FAQ_DATA } from '../data/mockData';

interface LandingProps {
  onEnterApp: () => void;
  onEnterLogin: () => void;
}

export default function Landing({ onEnterApp, onEnterLogin }: LandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'State-of-the-Art YOLOv8-Face Model',
      desc: 'Blazing-fast multi-face detection under 100ms. Identifies up to 30 active faces in a single frame.',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'InsightFace Biometric Matching',
      desc: 'Extracts 512-dimensional vector coordinates for 99.4% precision. Immune to typical lighting and facial orientation challenges.',
      icon: ScanFace,
      gradient: 'from-purple-500 to-indigo-400'
    },
    {
      title: 'Real-time Security Alerts',
      desc: 'Instant visual and system logging of unknown faces, flagging anomalies to security operators immediately.',
      icon: Shield,
      gradient: 'from-red-500 to-orange-400'
    },
    {
      title: 'Enterprise Analytics Suite',
      desc: 'Monitor present rates, punctuality indices, and custom departmental distributions with multi-format exports.',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-teal-400'
    }
  ];

  const statistics = [
    { value: '99.4%', label: 'Recognition Accuracy' },
    { value: '< 100ms', label: 'Inference Latency' },
    { value: '15,000+', label: 'Registered Terminals' },
    { value: '98.9%', label: 'Daily Attendance Rate' }
  ];

  const pricing = [
    {
      name: 'Starter Node',
      price: '$49',
      period: 'per month',
      features: ['Up to 150 registered users', '1 live camera feed RTSP', 'Standard local analytics dashboard', '24-hour retention', 'CSV/Excel exports'],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Enterprise Edge',
      price: '$189',
      period: 'per month',
      features: ['Up to 1,500 registered users', '5 concurrent RTSP live feeds', 'Real-time Unknown intruder alarms', 'PDF/Spreadsheet/Email reports', 'Priority hardware acceleration'],
      cta: 'Deploy Pro Node',
      popular: true
    },
    {
      name: 'Cyberdyne Custom',
      price: 'Custom',
      period: 'annual quote',
      features: ['Unlimited registered users', 'Unlimited global camera channels', 'Custom YOLOv8 fine-tuned models', 'On-Premise server configuration', 'FIPS-201 hardware integration'],
      cta: 'Contact Architecture Sales',
      popular: false
    }
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-[#0B1120] text-gray-300 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* SaaS Navigation */}
      <nav className="border-b border-gray-800/60 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
            <ScanFace className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FaceVision <span className="text-blue-500">AI</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#statistics" className="hover:text-white transition-colors">Performance</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            id="nav-login-btn"
            onClick={onEnterLogin}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            id="nav-getstarted-btn"
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-20 px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft atmospheric gradient glow behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs text-blue-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Next-Gen Biometrics Engine (v2.4)</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI Powered Face Recognition <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Attendance & Analytics
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Automate roll-calls, check-ins, and security logs with millisecond matching. Built for high-traffic environments using fine-tuned Edge YOLOv8 networks and secure encryption pipelines.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                id="hero-getstarted-btn"
                onClick={onEnterApp}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center space-x-2 cursor-pointer group"
              >
                <span>Get Started Instantly</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                id="hero-livedemo-btn"
                onClick={onEnterApp}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3.5 rounded-xl transition-all border border-gray-800 hover:border-gray-700 flex items-center space-x-2 cursor-pointer"
              >
                <Video className="w-4.5 h-4.5 text-blue-400" />
                <span>Launch Live Demo</span>
              </button>
            </div>

            {/* Quick credentials reference for evaluation convenience */}
            <div className="pt-8 border-t border-gray-800/40 flex items-center space-x-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Demo Credentials:</span>
              <span className="text-xs font-mono bg-gray-900 text-blue-400 px-3 py-1.5 rounded border border-gray-800">
                shabberahammad10@gmail.com
              </span>
            </div>
          </div>

          {/* Animated Hero Illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[380px] sm:max-w-[420px] aspect-square rounded-3xl bg-gradient-to-tr from-[#111827] to-[#1f2937]/50 p-1 border border-gray-800/80 shadow-2xl overflow-hidden group">
              
              {/* Floating Mesh lines decoration */}
              <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />
              
              {/* Dynamic biometric camera mock */}
              <div className="absolute inset-4 rounded-2xl bg-gray-950/80 border border-gray-800 overflow-hidden flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-red-400 font-bold">REC // STREAM-01</span>
                  </div>
                  <span>FPS: 29.8</span>
                </div>

                {/* Simulated Grid Target overlay */}
                <div className="relative flex-1 flex items-center justify-center py-6">
                  <div className="w-56 h-56 rounded-full border border-blue-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-dashed border-blue-500/10 animate-spin duration-30000" />
                    
                    {/* Visual simulated face vector */}
                    <svg className="w-44 h-44 text-blue-500/40 animate-pulse" viewBox="0 0 100 100" fill="none">
                      <path d="M50 15 C30 15 25 35 25 50 C25 65 30 85 50 85 C70 85 75 65 75 50 C75 35 70 15 50 15 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="38" cy="45" r="4" fill="currentColor" />
                      <circle cx="62" cy="45" r="4" fill="currentColor" />
                      <path d="M45 58 Q50 63 55 58" stroke="currentColor" strokeWidth="2" fill="none" />
                      {/* Grid scanning vectors */}
                      <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" />
                      <line x1="25" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    </svg>

                    {/* Laser scanning bar */}
                    <div className="absolute left-4 right-4 h-[1.5px] bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce" style={{ top: '35%' }} />
                    
                    {/* Floating bounding box indicator */}
                    <div className="absolute top-1/4 left-1/4 w-28 h-28 border-2 border-green-500 rounded-lg flex flex-col justify-between p-1.5">
                      <div className="text-[8px] font-mono bg-green-500 text-white px-1 py-0.5 rounded self-start font-bold">
                        SARAH C. // 99.4%
                      </div>
                      <div className="text-[7px] font-mono text-green-400 self-end font-semibold bg-gray-950/80 px-1 py-0.5 rounded border border-green-500/20">
                        MATCH VERIFIED
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800/80 pt-3 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>LOGGING NODE // G-101</span>
                  <span className="text-green-400 font-bold">STABLE CONNECTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-gray-950/40 border-y border-gray-900 px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-mono font-bold">Architectural Specifications</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for High-Stakes Deployments</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Eliminate traditional barcode badges, manual clipboards, and proximity fraud. Our multi-layered AI verification pipeline offers maximum tamper-resistance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 text-left">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-[#111827] border border-gray-800/60 p-6 rounded-2xl hover:border-blue-500/30 transition-all group hover:translate-y-[-2px] duration-200 shadow-lg">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feat.gradient} flex items-center justify-center text-white shadow-md shadow-blue-500/5 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-bold mt-5 text-base tracking-tight">{feat.title}</h4>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="py-20 px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, idx) => (
            <div key={idx} className="space-y-2 bg-[#111827]/40 border border-gray-800 p-6 rounded-xl backdrop-blur-sm">
              <p className="text-4xl sm:text-5xl font-extrabold text-white font-mono bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-950/40 border-t border-gray-900 px-8 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-mono font-bold">Trusted Globally</h2>
          <h3 className="text-3xl font-bold text-white">Acclaimed by Enterprise Administrators</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "Integrating FaceVision AI cut our morning roll-call friction to absolute zero. The multi-angle capture made enrolling our 400+ engineering division effortless. Unbelievably fast."
              </p>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-800/60">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=80" 
                  className="w-10 h-10 rounded-full object-cover" 
                  alt="John Bennett" 
                />
                <div>
                  <h5 className="text-xs font-bold text-white">General John Bennett</h5>
                  <p className="text-[10px] text-gray-500">Security Director, Cyberdyne systems</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "With standard card badges, we suffered from severe 'buddy-punching' proxy checks. FaceVision's YOLOv8 anti-spoofing engine checks depth metrics, fully resolving our attendance loss."
              </p>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-800/60">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80" 
                  className="w-10 h-10 rounded-full object-cover" 
                  alt="Sarah Vance" 
                />
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah Vance</h5>
                  <p className="text-[10px] text-gray-500">Chief HR Officer, Future Labs</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "The Recharts integration and CSV/PDF report generators are superb. Generating audit-ready compliance sheets takes three clicks. Exceptional SaaS dashboard design."
              </p>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-800/60">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" 
                  className="w-10 h-10 rounded-full object-cover" 
                  alt="Marcus Finch" 
                />
                <div>
                  <h5 className="text-xs font-bold text-white">Marcus Finch</h5>
                  <p className="text-[10px] text-gray-500">ML Infrastructure Architect, Vercel Core</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-8 max-w-7xl mx-auto text-center">
        <div className="space-y-4 mb-16">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-mono font-bold">Predictable Plans</h2>
          <h3 className="text-3xl font-extrabold text-white">Designed for Scale</h3>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Unlock biometric endpoints, RTSP pipeline streams, and deep predictive charts designed to support your operational size.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricing.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-[#111827] border rounded-3xl p-8 flex flex-col justify-between text-left relative ${
                plan.popular 
                  ? 'border-blue-500 shadow-xl shadow-blue-500/5' 
                  : 'border-gray-800/80 shadow-md'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                  Most Popular Node
                </span>
              )}

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500">/{plan.period}</span>
                </div>
                <div className="h-[1px] bg-gray-800/60" />
                
                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start space-x-2 text-xs text-gray-400">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                id={`plan-cta-${idx}`}
                onClick={onEnterApp}
                className={`w-full mt-8 py-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-gray-850 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-950/40 border-t border-gray-900 px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-mono font-bold">Developer FAQ</h2>
            <h3 className="text-3xl font-extrabold text-white">Have Technical Queries?</h3>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#111827] border border-gray-800/80 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    id={`faq-toggle-${idx}`}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-white font-semibold text-sm hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
                      <span>{faq.question}</span>
                    </div>
                    <ChevronDown className={`w-4.5 h-4.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-gray-800/40 bg-gray-950/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0B1120] py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
              <ScanFace className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">FaceVision <span className="text-blue-500">AI</span></span>
          </div>

          <p className="text-xs text-gray-500">
            © 2026 Cyberdyne Systems Corp. All rights reserved. FaceVision, InsightFace matching vector systems.
          </p>

          <div className="flex items-center space-x-4 text-xs">
            <a href="#" className="text-gray-500 hover:text-gray-300">Privacy Security</a>
            <span className="text-gray-800">•</span>
            <a href="#" className="text-gray-500 hover:text-gray-300">Terms of Service</a>
            <span className="text-gray-800">•</span>
            <span className="text-gray-500 flex items-center space-x-1">
              <span>FIPS Compliant</span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
