import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Lock, Building2, Zap, ShieldCheck, Landmark, AlertCircle, Mail, Key, ArrowRight } from 'lucide-react';

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

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES_CONFIG[2]); // default to District Magistrate
  const [email, setEmail] = useState(ROLES_CONFIG[2].email);
  const [password, setPassword] = useState(ROLES_CONFIG[2].pass);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword(role.pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password, selectedRole?.id);
    if (res.success) {
      navigate('/');
    }
  };

  const handleDirectDemoLogin = async (role) => {
    handleRoleSelect(role);
    const res = await login(role.email, role.pass, role.id);
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
        {/* LEFT HALF: Hero GIS Panel (Col 1-7 on desktop) */}
        <section className="lg:col-span-7 bg-govNavy text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-14 border-r border-govSlate-200/20">
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
          <div className="relative z-10 my-8 lg:my-auto max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-govEmerald/20 to-govNavy/40 border border-govEmerald/35 text-xs text-emerald-300 font-medium mb-6">
              <Zap className="w-3.5 h-3.5 text-govAmber fill-govAmber/20" />
              <span>Next-Gen Statutory Transparency &amp; Direct Benefit Transfer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Digital Land Acquisition for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-govAmber">Better Tomorrow.</span>
            </h1>
            
            <p className="mt-4 text-base lg:text-lg text-govSlate-300 leading-relaxed font-light">
              An integrated spatial governance platform accelerating statutory RFCTLARR compliance, automated DBT solatium disbursals, and drone-verified cadastral inspections across 28 states.
            </p>

            {/* GIS Map Card Embed */}
            <div className="mt-8 rounded-2xl border border-white/15 bg-govNavyDark/90 backdrop-blur-md p-4 shadow-2xl relative overflow-hidden">
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
                  {/* Dark Map Base */}
                  <rect width="800" height="450" fill="#071326"/>
                  
                  {/* Coordinate Grid lines */}
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

                  {/* Topographic Contours / River Path */}
                  <path d="M-50,200 Q200,160 400,280 T850,220" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="8" fill="none" strokeDasharray="6 4"/>
                  
                  {/* Cadastral Land Parcels (Polygons) */}
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

                  {/* Main National Infrastructure Corridor Alignment */}
                  <path d="M120,60 L240,150 L340,170 L440,240 L560,240 L700,380" stroke="url(#corridorGlow)" strokeWidth="5" strokeLinecap="round" strokeDasharray="12 4"/>
                  
                  {/* Waypoint nodes */}
                  <circle cx="120" cy="60" r="7" fill="#0E9F6E" stroke="#fff" strokeWidth="2"/>
                  <circle cx="240" cy="150" r="6" fill="#38BDF8" stroke="#fff" strokeWidth="2"/>
                  <circle cx="340" cy="170" r="6" fill="#F2A93B" stroke="#fff" strokeWidth="2"/>
                  <circle cx="440" cy="240" r="7" fill="#0E9F6E" stroke="#fff" strokeWidth="2"/>
                  <circle cx="560" cy="240" r="6" fill="#EF4444" stroke="#fff" strokeWidth="2"/>
                  <circle cx="700" cy="380" r="8" fill="#10B981" stroke="#fff" strokeWidth="2"/>

                  {/* Radar Sweep Effect */}
                  <circle cx="440" cy="240" r="90" stroke="rgba(14, 159, 110, 0.25)" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
                  <circle cx="440" cy="240" r="150" stroke="rgba(14, 159, 110, 0.15)" strokeWidth="1" fill="none"/>
                  
                  {/* Latitude / Longitude HUD Markers */}
                  <text x="25" y="30" fill="rgba(148, 163, 184, 0.7)" fontSize="10" fontFamily="monospace">LAT: 19.0760° N | LON: 72.8777° E | DATUM: WGS-84</text>
                  <text x="25" y="435" fill="rgba(148, 163, 184, 0.6)" fontSize="10" fontFamily="monospace">PROJECTION: UTM ZONE 43N | SCALE 1:5000 CADASTRAL</text>
                  <text x="590" y="435" fill="#0E9F6E" fontSize="10" fontFamily="monospace" fontWeight="bold">SATELLITE TELEMETRY: LOCKED</text>
                </svg>
                
                {/* Real-time HUD Callout Overlays */}
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

                <div className="absolute bottom-3 right-3 bg-govNavy/90 backdrop-blur-md border border-govAmber/50 rounded-lg p-2.5 text-xs shadow-lg flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-govAmber animate-ping"></div>
                  <div>
                    <div className="text-[10px] font-mono text-govSlate-400">BHARATMALA PH-2</div>
                    <div className="text-white font-semibold text-xs">Sec 11(1) Hearing Underway</div>
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
          <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-govSlate-400 gap-3">
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
              <span>•</span>
              <span className="text-govSlate-300">BHOOMI &amp; RoR Integrations</span>
            </div>
            <div className="text-[11px] font-mono text-govSlate-400">
              Govt. of India Initiative
            </div>
          </div>
        </section>

        {/* RIGHT HALF: Modern Enterprise GovTech Login Card (Col 8-12 on desktop) */}
        <section className="lg:col-span-5 bg-govSlate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-govSlate-200 p-7 sm:p-9 relative">
            
            {/* Header Logo & Portal Title */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-govSlate-100">
              <div className="w-14 h-14 rounded-2xl bg-govNavy flex items-center justify-center text-white mb-2.5 shadow-md">
                <Landmark className="w-8 h-8 text-govEmerald" />
              </div>
              <h2 className="text-xl font-bold text-govSlate-900 tracking-tight font-sans">
                Sign In to Unified Portal
              </h2>
              <p className="text-xs text-govSlate-500 mt-1 max-w-xs">
                Authenticate to access statutory filings, cadastral land maps, and compensation ledger.
              </p>
            </div>

            {/* 5-Segment Role Selector Tabs */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
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
              <p className="text-[11px] text-govSlate-500 mt-1.5 italic">
                {selectedRole.hint}
              </p>
            </div>

            {/* Quick 1-Click Demo Logins for Jury */}
            <div className="mt-4 p-2.5 bg-govSlate-50 rounded-xl border border-govSlate-200/80">
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

            {/* Error banner */}
            {error && (
              <div className="mt-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
                className="w-full py-2.5 px-4 bg-govNavy hover:bg-govNavyDark text-white font-semibold text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
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

            <div className="mt-5 pt-4 border-t border-govSlate-100 text-center">
              <p className="text-[11px] text-govSlate-500">
                Are you a Landowner / Affected Person?{' '}
                <button 
                  onClick={() => handleDirectDemoLogin(ROLES_CONFIG[0])}
                  className="font-bold text-govEmerald hover:underline"
                >
                  Citizen Self-Service Portal
                </button>
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
