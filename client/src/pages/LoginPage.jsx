import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Lock,
  Building2,
  Zap,
  ShieldCheck,
  Landmark,
  AlertCircle,
  Mail,
  Key,
  ArrowRight,
  UserPlus,
  User,
  MapPin,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const ROLES_CONFIG = [
  {
    id: 'citizen',
    label: 'Citizen',
    fullLabel: 'Citizen / Landowner',
    email: 'citizen@nlams.gov.in',
    pass: 'citizen123',
    hint: 'Track claim, award notification, or solatium'
  },
  {
    id: 'field_officer',
    label: 'Field Off.',
    fullLabel: 'Field Survey Officer',
    email: 'field@nlams.gov.in',
    pass: 'field123',
    hint: 'Cadastral demarcation, drone GIS, GPS boundary tagging'
  },
  {
    id: 'district_official',
    label: 'District',
    fullLabel: 'District Magistrate / CALA',
    email: 'district@nlams.gov.in',
    pass: 'district123',
    hint: 'Section 15 hearings, scrutiny & statutory award declaration'
  },
  {
    id: 'state_official',
    label: 'State',
    fullLabel: 'State Revenue Department',
    email: 'state@nlams.gov.in',
    pass: 'state123',
    hint: 'Section 19 approvals, gazette publication & fund escrow'
  },
  {
    id: 'ministry_official',
    label: 'Ministry',
    fullLabel: 'Central Ministry (MoRD)',
    email: 'ministry@nlams.gov.in',
    pass: 'ministry123',
    hint: 'PM-GatiShakti integration, national corridor oversight'
  }
];

const REGISTRATION_ROLES = [
  {
    id: 'citizen',
    label: 'Citizen',
    fullLabel: 'Citizen / Landowner',
    description: 'Affected landowner, Khatedar, claim verification & R&R compensation',
    defaultDesignation: 'Khatedar / Landowner',
    defaultDepartment: 'Public / Beneficiary',
    emailPlaceholder: 'citizen.name@gmail.com'
  },
  {
    id: 'field_officer',
    label: 'Field Officer',
    fullLabel: 'Field Revenue Inspector',
    description: 'Patwari, Amin, ground GIS cadastral mapping, GPS boundary tagging',
    defaultDesignation: 'Cadastral Surveyor Grade-I',
    defaultDepartment: 'District Land Records',
    emailPlaceholder: 'surveyor@nlams.gov.in'
  },
  {
    id: 'district_official',
    label: 'District Magistrate',
    fullLabel: 'District Collector & CALA',
    description: 'Section 11/15 hearings, gazette notification, DSC award approvals',
    defaultDesignation: 'District Magistrate & CALA',
    defaultDepartment: 'Revenue & Disaster Management',
    emailPlaceholder: 'collector@nlams.gov.in'
  },
  {
    id: 'state_official',
    label: 'State Official',
    fullLabel: 'State Revenue Dept.',
    description: 'Section 19 clearances, cabinet approvals, corridor budget releases',
    defaultDesignation: 'Principal Secretary (Revenue)',
    defaultDepartment: 'State Land Acquisition Directorate',
    emailPlaceholder: 'sec.revenue@nlams.gov.in'
  },
  {
    id: 'ministry_official',
    label: 'Union Ministry',
    fullLabel: 'Central Ministry (MoRD)',
    description: 'PM GatiShakti corridor alignment, sovereign audit, national oversight',
    defaultDesignation: 'Joint Secretary (DoLR)',
    defaultDepartment: 'Ministry of Rural Development',
    emailPlaceholder: 'js.dolr@nlams.gov.in'
  }
];

const INDIAN_STATES = [
  'Maharashtra',
  'Gujarat',
  'Uttar Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Rajasthan',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'West Bengal',
  'Bihar',
  'Punjab',
  'Haryana',
  'Odisha',
  'Telangana',
  'Kerala',
  'Assam',
  'Jharkhand',
  'Chhattisgarh',
  'Delhi NCR',
  'Central / All-India'
];

export default function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login State
  const [selectedRole, setSelectedRole] = useState(ROLES_CONFIG[2]); // default to District Magistrate
  const [email, setEmail] = useState(ROLES_CONFIG[2].email);
  const [password, setPassword] = useState(ROLES_CONFIG[2].pass);

  // Registration State
  const [regRole, setRegRole] = useState(REGISTRATION_ROLES[0]); // default to Citizen
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Palghar');
  const [regDesignation, setRegDesignation] = useState(REGISTRATION_ROLES[0].defaultDesignation);
  const [regDepartment, setRegDepartment] = useState(REGISTRATION_ROLES[0].defaultDepartment);
  const [regSuccess, setRegSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword(role.pass);
  };

  const handleRegRoleSelect = (role) => {
    setRegRole(role);
    setRegDesignation(role.defaultDesignation);
    setRegDepartment(role.defaultDepartment);
    setValidationError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (regPassword !== regConfirmPassword) {
      setValidationError('Passcodes do not match. Please verify and re-enter.');
      return;
    }
    if (regPassword.length < 6) {
      setValidationError('Passcode must be at least 6 characters long.');
      return;
    }

    const payload = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole.id,
      state: regState.trim(),
      district: regDistrict.trim(),
      designation: regDesignation.trim(),
      department: regDepartment.trim()
    };

    const res = await register(payload);
    if (res.success) {
      setRegSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }
  };

  const handleDirectDemoLogin = async (role) => {
    setMode('login');
    handleRoleSelect(role);
    const res = await login(role.email, role.pass);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-govSlate-50 flex flex-col antialiased selection:bg-govEmerald/20 selection:text-govNavy">
      {/* Micro Top Gov Notification Bar */}
      <header className="w-full bg-govNavy text-white text-xs border-b border-white/10 z-20 flex-shrink-0">
        <div className="tricolor-strip h-[3px] w-full"></div>
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between font-mono tracking-wide">
          <div className="flex items-center space-x-4 text-govSlate-300">
            <span className="flex items-center space-x-1.5 font-sans">
              <span className="inline-block w-2 h-2 rounded-full bg-govEmerald radar-pulse"></span>
              <span className="font-semibold text-white">Smart India Hackathon 2026</span>
              <span className="text-govSlate-400">|</span>
              <span className="text-govSlate-200">Ministry of Rural Development &amp; Land Resources</span>
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-govEmerald/20 text-emerald-300 border border-govEmerald/30">
              RFCTLARR Act 2013 Compliant
            </span>
          </div>
          <div className="flex items-center space-x-5 text-xs text-govSlate-300">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-govSlate-400">Language:</span>
              <span className="font-bold text-white">English</span>
              <span className="text-govSlate-500">/</span>
              <span className="text-govSlate-400 hover:text-govAmber cursor-pointer">हिंदी</span>
            </div>
            <div className="hidden lg:flex items-center space-x-3 pl-3 border-l border-white/10 text-[11px]">
              <span className="flex items-center space-x-1.5 text-govSlate-300">
                <Lock className="w-3.5 h-3.5 text-govAmber" />
                <span>SSL 256-bit Encrypted Portal</span>
              </span>
              <span className="text-govSlate-400">|</span>
              <span className="text-govSlate-300">Helpdesk 1800-11-2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Split Screen Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full min-h-[calc(100vh-35px)]">
        {/* LEFT HALF: Hero GIS Panel (Col 1-6 or 1-7 on desktop) */}
        <section className="lg:col-span-6 xl:col-span-6 bg-govNavy text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-12 border-r border-govSlate-200/20">
          {/* Subtle GIS coordinate grid background overlay */}
          <div className="absolute inset-0 gis-grid pointer-events-none opacity-60"></div>

          {/* Ambient Glow Blobs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-govEmerald/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-govAmber/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Branding in Hero */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-inner">
                <Building2 className="w-7 h-7 text-govEmerald" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-extrabold tracking-tight text-white font-sans">NLAMS</span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-govEmerald/25 text-emerald-300 border border-govEmerald/40">
                    v2.6 GIS-CORE
                  </span>
                </div>
                <p className="text-xs text-govSlate-300 font-sans tracking-wide">National Land Acquisition &amp; Management System</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-govSlate-300">National Node:</span>
              <span className="font-mono font-medium text-white">NIC-MEITY-DEL</span>
            </div>
          </div>

          {/* Center Hero Visual & Headline */}
          <div className="relative z-10 my-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-govEmerald/20 to-govNavy/40 border border-govEmerald/35 text-xs text-emerald-300 font-medium mb-5">
              <Zap className="w-3.5 h-3.5 text-govAmber fill-govAmber/20" />
              <span>Next-Gen Statutory Transparency &amp; Direct Benefit Transfer</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Digital Land Acquisition for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-govAmber">Better Tomorrow.</span>
            </h1>

            <p className="mt-3 text-sm lg:text-base text-govSlate-300 leading-relaxed font-light">
              An integrated spatial governance platform accelerating statutory RFCTLARR compliance, automated DBT solatium disbursals, and drone-verified cadastral inspections across India.
            </p>

            {/* GIS Map Card Embed */}
            <div className="mt-6 rounded-2xl border border-white/15 bg-govNavyDark/90 backdrop-blur-md p-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-govSlate-300 ml-2 font-medium">GIS_LAYER: LIVE_CORRIDOR_SURVEY_2026</span>
                </div>
                <span className="text-[11px] font-mono text-govEmerald bg-govEmerald/10 px-2 py-0.5 rounded border border-govEmerald/25">
                  GeoJSON Cadastre Active
                </span>
              </div>

              {/* High-Tech GIS India Map visualization */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-[#0c1b33] flex items-center justify-center border border-white/10">
                <svg className="w-full h-full object-cover" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="450" fill="#071326"/>
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 159, 110, 0.12)" strokeWidth="1"/>
                    </pattern>
                    <linearGradient id="corridorGlow" x1="100" y1="50" x2="700" y2="400" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0E9F6E" stopOpacity="0.8"/>
                      <stop offset="0.5" stopColor="#38BDF8" stopOpacity="0.9"/>
                      <stop offset="1" stopColor="#F2A93B" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  
                  <rect width="800" height="450" fill="url(#grid)"/>

                  <path d="M-50,200 Q200,160 400,280 T850,220" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="8" fill="none" strokeDasharray="6 4"/>
                  
                  <polygon points="180,120 260,110 290,170 210,190" fill="rgba(14, 159, 110, 0.35)" stroke="#0E9F6E" strokeWidth="2"/>
                  <text x="215" y="155" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="bold">P-104 (14.2 Ha)</text>

                  <polygon points="295,125 380,130 360,200 295,175" fill="rgba(242, 169, 59, 0.3)" stroke="#F2A93B" strokeWidth="2"/>
                  <text x="310" y="165" fill="#FCD34D" fontSize="11" fontFamily="monospace" fontWeight="bold">P-105 (Sec 11)</text>

                  <polygon points="365,205 460,190 490,270 390,280" fill="rgba(14, 159, 110, 0.4)" stroke="#0E9F6E" strokeWidth="2"/>
                  <text x="395" y="245" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="bold">P-106 (Possessed)</text>

                  <polygon points="210,200 290,185 270,270 190,260" fill="rgba(56, 189, 248, 0.25)" stroke="#38BDF8" strokeWidth="2"/>
                  <text x="210" y="235" fill="#BAE6FD" fontSize="11" fontFamily="monospace" fontWeight="bold">P-107 (8.4 Ha)</text>

                  <polygon points="495,210 580,180 620,250 520,270" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" strokeWidth="2"/>
                  <text x="525" y="235" fill="#FCA5A5" fontSize="11" fontFamily="monospace" fontWeight="bold">P-108 (Disputed)</text>

                  <polygon points="400,290 510,280 480,360 370,350" fill="rgba(14, 159, 110, 0.35)" stroke="#0E9F6E" strokeWidth="2"/>
                  <text x="410" y="325" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="bold">P-109 (Awarded)</text>

                  <path d="M120,60 L240,150 L340,170 L440,240 L560,240 L700,380" stroke="url(#corridorGlow)" strokeWidth="5" strokeLinecap="round" strokeDasharray="12 4"/>
                  
                  <circle cx="120" cy="60" r="7" fill="#0E9F6E" stroke="#fff" strokeWidth="2"/>
                  <circle cx="240" cy="150" r="6" fill="#38BDF8" stroke="#fff" strokeWidth="2"/>
                  <circle cx="340" cy="170" r="6" fill="#F2A93B" stroke="#fff" strokeWidth="2"/>
                  <circle cx="440" cy="240" r="7" fill="#0E9F6E" stroke="#fff" strokeWidth="2"/>
                  <circle cx="560" cy="240" r="6" fill="#EF4444" stroke="#fff" strokeWidth="2"/>
                  <circle cx="700" cy="380" r="8" fill="#10B981" stroke="#fff" strokeWidth="2"/>

                  <text x="25" y="30" fill="rgba(148, 163, 184, 0.7)" fontSize="10" fontFamily="monospace">LAT: 19.0760° N | LON: 72.8777° E | DATUM: WGS-84</text>
                  <text x="25" y="435" fill="rgba(148, 163, 184, 0.6)" fontSize="10" fontFamily="monospace">PROJECTION: UTM ZONE 43N | SCALE 1:5000 CADASTRAL</text>
                  <text x="590" y="435" fill="#0E9F6E" fontSize="10" fontFamily="monospace" fontWeight="bold">SATELLITE TELEMETRY: LOCKED</text>
                </svg>
                
                <div className="absolute top-3 left-3 bg-govNavy/90 backdrop-blur-md border border-emerald-500/40 rounded-lg p-2.5 text-xs shadow-lg max-w-[210px]">
                  <div className="flex items-center justify-between text-[10px] text-govSlate-400 font-mono">
                    <span>SECTOR 04-NHAI</span>
                    <span className="text-govEmerald font-bold">POSSESSION 89%</span>
                  </div>
                  <p className="text-white font-semibold mt-0.5 truncate">Delhi–Mumbai Expressway</p>
                  <div className="w-full bg-govSlate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-govEmerald h-full rounded-full w-[89%]"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Metric Ticker */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/10 text-center">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-govSlate-400 uppercase font-mono">Total Parcels Mapped</p>
                  <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">14,82,190</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-govSlate-400 uppercase font-mono">DBT Disbursed (FY26)</p>
                  <p className="text-base sm:text-lg font-bold text-govEmerald font-mono mt-0.5">₹ 24,910 Cr</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-govSlate-400 uppercase font-mono">Avg. Possession Time</p>
                  <p className="text-base sm:text-lg font-bold text-govAmber font-mono mt-0.5">-62% Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Compliance & Trust Footer in Hero */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-govSlate-400 gap-3">
            <div className="flex items-center space-x-3 flex-wrap">
              <span className="inline-flex items-center space-x-1.5 text-govSlate-300">
                <ShieldCheck className="w-4 h-4 text-govEmerald" />
                <span>Aadhaar e-KYC Linked</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1.5 text-govSlate-300">
                <Landmark className="w-4 h-4 text-govEmerald" />
                <span>PFMS Auto-Disbursement</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-govSlate-400">
              Govt. of India Initiative
            </div>
          </div>
        </section>

        {/* RIGHT HALF: Modern Enterprise GovTech Auth Card (Col 7-12 on desktop) */}
        <section className="lg:col-span-6 xl:col-span-6 bg-govSlate-50 flex items-center justify-center p-4 sm:p-8 lg:p-10 relative overflow-y-auto max-h-screen">
          <div className={`w-full ${mode === 'register' ? 'max-w-xl' : 'max-w-md'} bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-govSlate-200 p-6 sm:p-8 relative my-auto transition-all duration-300`}>
            
            {/* Header Logo & Portal Title */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-govSlate-100">
              <div className="w-12 h-12 rounded-2xl bg-govNavy flex items-center justify-center text-white mb-2 shadow-md">
                <Landmark className="w-7 h-7 text-govEmerald" />
              </div>
              <h2 className="text-xl font-bold text-govSlate-900 tracking-tight font-sans">
                {mode === 'login' ? 'Sign In to Unified Portal' : 'Register New Stakeholder'}
              </h2>
              <p className="text-xs text-govSlate-500 mt-0.5 max-w-sm">
                {mode === 'login'
                  ? 'Authenticate to access statutory filings, cadastral land maps, and compensation ledger.'
                  : 'Enroll a new statutory stakeholder profile to participate in RFCTLARR land acquisition workflows.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-govSlate-100 p-1 mt-4 border border-govSlate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setValidationError('');
                  useAuthStore.setState({ error: null });
                }}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'login'
                    ? 'bg-white text-govNavy shadow-xs border border-govSlate-200 font-bold'
                    : 'text-govSlate-600 hover:text-govNavy hover:bg-white/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-govAmber" />
                <span>Existing Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setValidationError('');
                  useAuthStore.setState({ error: null });
                }}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'register'
                    ? 'bg-white text-govNavy shadow-xs border border-govSlate-200 font-bold'
                    : 'text-govSlate-600 hover:text-govNavy hover:bg-white/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-govEmerald" />
                <span>Register New Stakeholder</span>
              </button>
            </div>

            {/* Success Banner */}
            {regSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Stakeholder Account Registered!</p>
                  <p className="text-[11px] text-emerald-700">Credentials saved to sovereign database. Logging you in now...</p>
                </div>
              </div>
            )}

            {/* Error Banners */}
            {(error || validationError) && (
              <div className="mt-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: SIGN IN FORM                                                      */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <>
                {/* 5-Segment Role Selector Tabs */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-govSlate-700 tracking-wide uppercase font-mono">
                      Select Stakeholder Role
                    </label>
                    <span className="text-[11px] font-semibold text-govEmerald bg-govEmerald/10 px-2 py-0.5 rounded">
                      {selectedRole.fullLabel}
                    </span>
                  </div>

                  {/* Segmented Control */}
                  <div className="grid grid-cols-5 gap-1 p-1 bg-govSlate-100 rounded-xl border border-govSlate-200/80 text-[11px] font-medium">
                    {ROLES_CONFIG.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`py-2 px-1 text-center rounded-lg transition-all duration-150 ${
                          selectedRole.id === role.id
                            ? 'font-bold bg-white text-govNavy shadow-xs border border-govSlate-200'
                            : 'text-govSlate-600 hover:text-govNavy hover:bg-white/60'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-govSlate-500 mt-1 italic">
                    {selectedRole.hint}
                  </p>
                </div>

                {/* Quick 1-Click Demo Logins */}
                <div className="mt-3.5 p-2.5 bg-govSlate-50 rounded-xl border border-govSlate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-govNavy font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-govAmber fill-govAmber" />
                      SIH Demo Quick Login (1-Click)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {ROLES_CONFIG.slice(0, 4).map((r) => (
                      <button
                        key={'quick-' + r.id}
                        type="button"
                        onClick={() => handleDirectDemoLogin(r)}
                        className="px-2 py-1.5 rounded-lg bg-white border border-govSlate-200 hover:border-primary text-govSlate-700 hover:text-primary font-medium text-left truncate transition-colors shadow-2xs"
                      >
                        👉 {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-govSlate-700 uppercase font-mono mb-1">
                      Official Email / Identity ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-govSlate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@nlams.gov.in"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-govSlate-300 rounded-lg text-xs font-mono text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-govSlate-700 uppercase font-mono">
                        Security Passcode
                      </label>
                      <span className="text-[11px] text-govSlate-400 font-mono">
                        Default: {selectedRole.pass}
                      </span>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-govSlate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-govSlate-300 rounded-lg text-xs font-mono text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-govNavy hover:bg-govNavyDark text-white font-semibold text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Authenticate &amp; Enter Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3.5 border-t border-govSlate-100 text-center flex flex-col gap-1.5">
                  <p className="text-[11px] text-govSlate-500">
                    New stakeholder, officer or landowner?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-govEmerald hover:underline"
                    >
                      Register New User Account
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: MULTI-STAKEHOLDER REGISTRATION FORM                              */}
            {/* ========================================================================= */}
            {mode === 'register' && (
              <div className="mt-3.5">
                {/* Stakeholder Role Picker Pills */}
                <div>
                  <label className="block text-xs font-semibold text-govSlate-700 tracking-wide uppercase font-mono mb-1.5">
                    1. Select Stakeholder Role
                  </label>
                  <div className="grid grid-cols-5 gap-1 p-1 bg-govSlate-100 rounded-xl border border-govSlate-200/80 text-[11px] font-medium">
                    {REGISTRATION_ROLES.map((role) => (
                      <button
                        key={'reg-' + role.id}
                        type="button"
                        onClick={() => handleRegRoleSelect(role)}
                        className={`py-2 px-1 text-center rounded-lg transition-all duration-150 ${
                          regRole.id === role.id
                            ? 'font-bold bg-white text-govNavy shadow-xs border border-govSlate-200'
                            : 'text-govSlate-600 hover:text-govNavy hover:bg-white/60'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 p-2 rounded-lg bg-govEmerald/5 border border-govEmerald/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-govNavy font-sans">{regRole.fullLabel}</span>
                      <p className="text-[10px] text-govSlate-500">{regRole.description}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-govEmerald/15 text-emerald-800 font-bold uppercase">
                      {regRole.id}
                    </span>
                  </div>
                </div>

                {/* Registration Inputs Form */}
                <form onSubmit={handleRegisterSubmit} className="mt-3.5 space-y-3">
                  {/* Full Name & Email (2 columns on sm) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Full Legal / Official Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                          placeholder="e.g. Ramesh K. Patil"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                          placeholder={regRole.emailPlaceholder}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs font-mono text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* State & District Jurisdiction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        State / Jurisdiction <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          required
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        District / Tehsil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        required
                        placeholder="e.g. Palghar / Thane"
                        className="w-full px-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Designation & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Official Designation / Role Title
                      </label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={regDesignation}
                          onChange={(e) => setRegDesignation(e.target.value)}
                          required
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Department / Authority
                      </label>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Create Passcode (Min 6) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs font-mono text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-govSlate-700 uppercase font-mono mb-1">
                        Confirm Passcode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-govSlate-300 rounded-lg text-xs font-mono text-govSlate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Statutory consent note */}
                  <div className="p-2.5 bg-govSlate-50 rounded-lg border border-govSlate-200 text-[11px] text-govSlate-600 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-govEmerald flex-shrink-0 mt-0.5" />
                    <span>
                      Identity is encrypted with 256-bit hash and bound to RFCTLARR statutory audits under Central NLAMS core.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || regSuccess}
                    className="w-full py-2.5 px-4 bg-govEmerald hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register Stakeholder &amp; Enter Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-3.5 pt-3 border-t border-govSlate-100 text-center">
                  <p className="text-[11px] text-govSlate-500">
                    Already registered with an official account?{' '}
                    <button 
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setValidationError('');
                        useAuthStore.setState({ error: null });
                      }}
                      className="font-bold text-govNavy hover:underline"
                    >
                      Sign In to Unified Portal
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}
