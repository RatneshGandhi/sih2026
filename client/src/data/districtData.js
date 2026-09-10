/**
 * Dedicated Mock Data for Ratnagiri District Magistrate / CALA Dashboard
 * Strictly scoped to Ratnagiri District, Maharashtra.
 * Synthetic Cadastral & Workflow Data for Hackathon Prototype Demonstration.
 */

export const DISTRICT_INFO = {
  state: 'Maharashtra',
  district: 'Ratnagiri',
  division: 'Konkan',
  office: 'Office of the District Magistrate & Competent Authority for Land Acquisition (CALA)',
  magistrateName: 'Shri Shekhar Singh, IAS',
  designation: 'Collector & District Magistrate / CALA',
  statutoryAct: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)',
  lastSynced: '10 Sep 2026, 12:15 PM IST',
  talukas: ['All', 'Ratnagiri', 'Chiplun', 'Guhagar', 'Rajapur', 'Sangameshwar'],
  villages: ['All', 'Shirgaon', 'Mirya', 'Karla', 'Zadgaon', 'Pomendi', 'Nivali', 'Khed-Budruk']
};

export const DISTRICT_KPIS = {
  totalProjects: 12,
  landProposedHa: 4250,
  landAcquiredHa: 3100,
  affectedFamilies: 2840,
  pendingVerification: 124,
  compensationPendingCases: 78,
  disputesCount: 32,
  highRiskProjects: 2,
  progressPct: 72.9
};

export const DISTRICT_FINANCIALS = {
  assessedCr: 120.0,
  approvedCr: 115.0,
  disbursedCr: 98.0,
  pendingCr: 17.0,
  escrowBalanceCr: 22.0
};

export const DISTRICT_RR_KPIS = {
  totalAffectedFamilies: 2840,
  displacedFamilies: 1120,
  rrCompletedPct: 82,
  rrPendingPct: 18,
  housingAllotted: 918,
  annuityGranted: 1045,
  landForLandCases: 157
};

export const DISTRICT_PROJECTS = [
  {
    id: 'PRJ-001',
    code: 'PRJ-001',
    name: 'Mumbai-Goa Railway Double Track Line',
    agency: 'Konkan Railway Corporation Limited (KRCL)',
    parcels: 342,
    affectedFamilies: 487,
    landProposedHa: 680,
    landAcquiredHa: 512,
    progressPct: 75,
    riskScore: 82,
    riskLevel: 'HIGH',
    compensationStatus: 'Disbursing (₹48 Cr / ₹65 Cr)',
    rrStatus: 'In Progress (78%)',
    currentStage: 'Compensation & R&R',
    delayedStage: 'Ownership Verification',
    mainBottleneck: 'Ownership Disputes',
    disputedParcels: 27,
    compPending: 18,
    verifPending: 11,
    rrPending: 9,
    predictedDelay: '4–6 Months',
    recommendedAction: 'Prioritize legal/revenue verification for disputed parcels and clear pending ownership conflicts.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 35, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 25, color: '#EA580C' },
      { name: 'Verification Issues', pct: 20, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 12, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 8, color: '#64748B' }
    ],
    whyHighRisk: [
      '27 parcels have ownership disputes pending before Revenue Tribunal / Civil Court',
      '18 compensation cases are pending bank KYC validation & succession verification',
      '11 parcels have incomplete 7/12 mutation verification across 2 talukas',
      'R&R implementation in Shirgaon & Mirya villages is behind statutory schedule'
    ],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'delayed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'completed' },
      { name: 'Valuation', status: 'completed' },
      { name: 'Award', status: 'completed' },
      { name: 'Compensation', status: 'in-progress' },
      { name: 'R&R', status: 'in-progress' },
      { name: 'Possession', status: 'pending' }
    ]
  },
  {
    id: 'PRJ-002',
    code: 'PRJ-002',
    name: 'National Highway NH-66 4-Lane Expansion',
    agency: 'National Highways Authority of India (NHAI)',
    parcels: 280,
    affectedFamilies: 390,
    landProposedHa: 520,
    landAcquiredHa: 440,
    progressPct: 84,
    riskScore: 54,
    riskLevel: 'MEDIUM',
    compensationStatus: 'Advanced (₹38 Cr / ₹42 Cr)',
    rrStatus: 'Satisfactory (88%)',
    currentStage: 'Possession Handover',
    delayedStage: 'Compensation Disbursement',
    mainBottleneck: 'Court Deposit for Minors',
    disputedParcels: 8,
    compPending: 12,
    verifPending: 4,
    rrPending: 6,
    predictedDelay: '1–2 Months',
    recommendedAction: 'Direct deposit into Reference Authority under Section 77 for minors to take early possession.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 18, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 45, color: '#EA580C' },
      { name: 'Verification Issues', pct: 12, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 15, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 10, color: '#64748B' }
    ],
    whyHighRisk: [
      '8 parcels subject to civil inheritance suits',
      '12 compensation awards pending court deposit',
      'Minor forest clearance pending at Sangameshwar border'
    ],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'completed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'completed' },
      { name: 'Valuation', status: 'completed' },
      { name: 'Award', status: 'completed' },
      { name: 'Compensation', status: 'in-progress' },
      { name: 'R&R', status: 'completed' },
      { name: 'Possession', status: 'in-progress' }
    ]
  },
  {
    id: 'PRJ-003',
    code: 'PRJ-003',
    name: 'Ratnagiri Ultra-Mega Solar Power Park',
    agency: 'MAHAGENCO / SECI',
    parcels: 195,
    affectedFamilies: 210,
    landProposedHa: 950,
    landAcquiredHa: 710,
    progressPct: 74,
    riskScore: 28,
    riskLevel: 'LOW',
    compensationStatus: 'On Track (₹28 Cr / ₹32 Cr)',
    rrStatus: 'Near Complete (92%)',
    currentStage: 'Award Declaration',
    delayedStage: 'None',
    mainBottleneck: 'Government Grazing Land Formal Transfer',
    disputedParcels: 3,
    compPending: 6,
    verifPending: 2,
    rrPending: 2,
    predictedDelay: 'None (On Track)',
    recommendedAction: 'Expedite inter-departmental transfer order for 120 Ha revenue wasteland.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 10, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 15, color: '#EA580C' },
      { name: 'Verification Issues', pct: 15, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 10, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 50, color: '#64748B' }
    ],
    whyHighRisk: [
      'Government wasteland transfer letter awaiting Revenue Commissioner sign-off',
      'Solar easement clearance for transmission towers'
    ],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'completed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'completed' },
      { name: 'Valuation', status: 'completed' },
      { name: 'Award', status: 'in-progress' },
      { name: 'Compensation', status: 'pending' },
      { name: 'R&R', status: 'completed' },
      { name: 'Possession', status: 'pending' }
    ]
  },
  {
    id: 'PRJ-004',
    code: 'PRJ-004',
    name: 'Coastal Industrial & Logistics Corridor',
    agency: 'MIDC (Maharashtra Industrial Development Corp)',
    parcels: 410,
    affectedFamilies: 620,
    landProposedHa: 1100,
    landAcquiredHa: 680,
    progressPct: 61,
    riskScore: 79,
    riskLevel: 'HIGH',
    compensationStatus: 'Pending (₹22 Cr / ₹55 Cr)',
    rrStatus: 'Needs Intervention (64%)',
    currentStage: 'Objections & Hearings',
    delayedStage: 'Section 15 Objections',
    mainBottleneck: 'Valuation Disputes & CRZ Verification',
    disputedParcels: 21,
    compPending: 24,
    verifPending: 19,
    rrPending: 15,
    predictedDelay: '3–5 Months',
    recommendedAction: 'Convene joint CALA-Town Planning hearing bench to re-appraise circle rates for orchards.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 28, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 32, color: '#EA580C' },
      { name: 'Verification Issues', pct: 22, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 10, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 8, color: '#64748B' }
    ],
    whyHighRisk: [
      'Alphonso mango orchard owners contested non-agricultural valuation',
      'Coastal Regulation Zone (CRZ) setback demarcation conflicting with village tippen',
      '19 joint mutation titles unsettled since 2018'
    ],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'delayed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'in-progress' },
      { name: 'Valuation', status: 'pending' },
      { name: 'Award', status: 'pending' },
      { name: 'Compensation', status: 'pending' },
      { name: 'R&R', status: 'pending' },
      { name: 'Possession', status: 'pending' }
    ]
  },
  {
    id: 'PRJ-005',
    code: 'PRJ-005',
    name: 'Chiplun Flood Mitigation & Water Canal',
    agency: 'Water Resources Department (WRD)',
    parcels: 160,
    affectedFamilies: 245,
    landProposedHa: 450,
    landAcquiredHa: 380,
    progressPct: 84,
    riskScore: 22,
    riskLevel: 'LOW',
    compensationStatus: 'Settled (₹19.5 Cr / ₹21 Cr)',
    rrStatus: 'Well Executed (95%)',
    currentStage: 'Possession Handover',
    delayedStage: 'None',
    mainBottleneck: 'Final Culvert Handover',
    disputedParcels: 1,
    compPending: 3,
    verifPending: 1,
    rrPending: 1,
    predictedDelay: 'None',
    recommendedAction: 'Issue Section 38 vesting notification for remaining 2 plots.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 5, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 10, color: '#EA580C' },
      { name: 'Verification Issues', pct: 15, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 10, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 60, color: '#64748B' }
    ],
    whyHighRisk: [],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'completed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'completed' },
      { name: 'Valuation', status: 'completed' },
      { name: 'Award', status: 'completed' },
      { name: 'Compensation', status: 'completed' },
      { name: 'R&R', status: 'completed' },
      { name: 'Possession', status: 'in-progress' }
    ]
  },
  {
    id: 'PRJ-006',
    code: 'PRJ-006',
    name: 'Jaigad Deepwater Port Road Connectivity',
    agency: 'Maharashtra Maritime Board (MMB)',
    parcels: 145,
    affectedFamilies: 188,
    landProposedHa: 350,
    landAcquiredHa: 260,
    progressPct: 74,
    riskScore: 45,
    riskLevel: 'MEDIUM',
    compensationStatus: 'Ongoing (₹14 Cr / ₹18 Cr)',
    rrStatus: 'In Progress (81%)',
    currentStage: 'Valuation & Award',
    delayedStage: 'Tree Valuation',
    mainBottleneck: 'Forest Department Tree Enumeration',
    disputedParcels: 4,
    compPending: 7,
    verifPending: 3,
    rrPending: 4,
    predictedDelay: '1 Month',
    recommendedAction: 'Expedite Forest Department valuation certificate for teak & cashew trees.',
    riskBreakdown: [
      { name: 'Ownership Disputes', pct: 15, color: '#BA1A1A' },
      { name: 'Compensation Delays', pct: 25, color: '#EA580C' },
      { name: 'Verification Issues', pct: 35, color: '#F2A93B' },
      { name: 'R&R Delays', pct: 15, color: '#3B82F6' },
      { name: 'Other Statutory', pct: 10, color: '#64748B' }
    ],
    whyHighRisk: [
      'Tree count certificate delayed by Range Forest Officer',
      '4 parcels require joint measurement verification'
    ],
    stages: [
      { name: 'Proposal', status: 'completed' },
      { name: 'Scrutiny', status: 'completed' },
      { name: 'Land Identification', status: 'completed' },
      { name: 'Verification', status: 'completed' },
      { name: 'Notification', status: 'completed' },
      { name: 'Objections', status: 'completed' },
      { name: 'Valuation', status: 'in-progress' },
      { name: 'Award', status: 'pending' },
      { name: 'Compensation', status: 'pending' },
      { name: 'R&R', status: 'pending' },
      { name: 'Possession', status: 'pending' }
    ]
  }
];

export const DISTRICT_PARCELS = [
  {
    id: 'P103',
    surveyNumber: 'SRV-103',
    khasraNumber: '103/1A',
    taluka: 'Ratnagiri',
    village: 'Shirgaon',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    areaHa: 2.45,
    landType: 'Agricultural (Horticulture)',
    status: 'disputed', // 'acquired' | 'under_process' | 'disputed' | 'compensation_pending' | 'verification_pending'
    statusLabel: 'Disputed',
    rightsHolder: 'Rahul Sharma',
    coOwners: ['Vikas Sharma (Brother)', 'Sunita Sharma (Sister)'],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-08-12', docRef: 'ROR-RTN-7819' },
      registration: { status: 'verified', label: 'Verified', date: '2026-08-14', docRef: 'SRO-RTN-4421' },
      mutation: { status: 'pending', label: 'Mutation Pending', note: 'Ferfar entry 1841 contested by legal heirs' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-08-18', docRef: 'CAD-SHIR-103' },
      disputeCheck: { status: 'conflict', label: 'Conflict', note: 'Civil Suit 44/2025 in Ratnagiri Court' },
      overall: {
        code: 'CASE_5',
        status: 'Legal/Revenue Review Required',
        badge: 'error',
        recommendedAction: 'Send for Legal / Revenue Review'
      }
    },
    compensation: {
      assessedAmount: 6500000,
      approvedAmount: 6500000,
      disbursedAmount: 0,
      solatiumAmount: 6500000,
      interestAmount: 780000,
      totalCompensation: 13780000,
      status: 'pending',
      paymentStage: 'Escrow Frozen (Court Dispute)',
      bankDetails: { bank: 'State Bank of India', ifsc: 'SBIN0000465', accountStatus: 'Held in Reference Escrow' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1023',
      members: 5,
      status: 'pending',
      package: 'Housing Assistance & Agricultural Resettlement',
      allottedPlot: 'Site Plot #14, Mirya R&R Colony',
      delayReason: 'Documentation & Heir Consensus pending'
    },
    possession: {
      status: 'awaiting_approval',
      fieldVerification: 'complete',
      fieldSurveyor: 'A. K. More (Surveyor Circle 2)',
      gpsEvidence: 'Available (RTK-GPS 8-Corner Tagged)',
      documentsCount: 5,
      submittedDate: '2026-09-08'
    },
    coordinates: [
      [73.298, 16.992],
      [73.302, 16.993],
      [73.303, 16.989],
      [73.297, 16.988],
      [73.298, 16.992]
    ]
  },
  {
    id: 'P104',
    surveyNumber: 'SRV-104',
    khasraNumber: '104/2',
    taluka: 'Ratnagiri',
    village: 'Shirgaon',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    areaHa: 1.80,
    landType: 'Agricultural (Paddy)',
    status: 'acquired',
    statusLabel: 'Acquired',
    rightsHolder: 'Anita Patil',
    coOwners: [],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-07-10', docRef: 'ROR-RTN-6512' },
      registration: { status: 'verified', label: 'Verified', date: '2026-07-12', docRef: 'SRO-RTN-3129' },
      mutation: { status: 'verified', label: 'Verified', date: '2026-07-15', docRef: 'MUT-FER-8902' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-07-18', docRef: 'CAD-SHIR-104' },
      disputeCheck: { status: 'clear', label: 'Clear', note: 'No encumbrances recorded' },
      overall: {
        code: 'CASE_1',
        status: 'Verified',
        badge: 'success',
        recommendedAction: 'Proceed with Possession Notification'
      }
    },
    compensation: {
      assessedAmount: 4200000,
      approvedAmount: 4200000,
      disbursedAmount: 4200000,
      solatiumAmount: 4200000,
      interestAmount: 504000,
      totalCompensation: 8904000,
      status: 'disbursed',
      paymentStage: 'Disbursed (Direct DBT)',
      bankDetails: { bank: 'Bank of Maharashtra', ifsc: 'MAHB0000124', accountStatus: 'Credited' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1024',
      members: 4,
      status: 'settled',
      package: 'Financial Solatium & One-time Grant',
      allottedPlot: 'Self Relocation Grant Disbursed',
      delayReason: 'None'
    },
    possession: {
      status: 'approved',
      fieldVerification: 'complete',
      fieldSurveyor: 'A. K. More (Surveyor Circle 2)',
      gpsEvidence: 'Available (RTK-GPS 6-Corner Tagged)',
      documentsCount: 6,
      submittedDate: '2026-08-20'
    },
    coordinates: [
      [73.303, 16.994],
      [73.308, 16.995],
      [73.309, 16.991],
      [73.304, 16.990],
      [73.303, 16.994]
    ]
  },
  {
    id: 'P105',
    surveyNumber: 'SRV-105',
    khasraNumber: '105/B',
    taluka: 'Ratnagiri',
    village: 'Mirya',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    areaHa: 3.15,
    landType: 'Agricultural (Coconut/Cashew)',
    status: 'compensation_pending',
    statusLabel: 'Compensation Pending',
    rightsHolder: 'Ganesh Sawant',
    coOwners: ['Prakash Sawant'],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-07-22', docRef: 'ROR-RTN-9011' },
      registration: { status: 'verified', label: 'Verified', date: '2026-07-25', docRef: 'SRO-RTN-5120' },
      mutation: { status: 'verified', label: 'Verified', date: '2026-08-01', docRef: 'MUT-FER-9114' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-08-05', docRef: 'CAD-MIR-105' },
      disputeCheck: { status: 'clear', label: 'Clear', note: 'No disputes recorded' },
      overall: {
        code: 'CASE_1',
        status: 'Verified',
        badge: 'success',
        recommendedAction: 'Disburse Compensation DBT'
      }
    },
    compensation: {
      assessedAmount: 7800000,
      approvedAmount: 7800000,
      disbursedAmount: 0,
      solatiumAmount: 7800000,
      interestAmount: 936000,
      totalCompensation: 16536000,
      status: 'pending',
      paymentStage: 'Mandate Awaiting CALA Digital Signature',
      bankDetails: { bank: 'Union Bank of India', ifsc: 'UBIN0530182', accountStatus: 'Aadhaar Seeded & Validated' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1025',
      members: 6,
      status: 'in-progress',
      package: 'Housing Assistance',
      allottedPlot: 'Mirya Sector 3, Plot #8',
      delayReason: 'Plinth construction in progress'
    },
    possession: {
      status: 'awaiting_compensation',
      fieldVerification: 'complete',
      fieldSurveyor: 'S. N. Joshi',
      gpsEvidence: 'Available',
      documentsCount: 4,
      submittedDate: '2026-08-25'
    },
    coordinates: [
      [73.288, 17.005],
      [73.294, 17.007],
      [73.295, 17.001],
      [73.289, 16.999],
      [73.288, 17.005]
    ]
  },
  {
    id: 'P106',
    surveyNumber: 'SRV-106',
    khasraNumber: '106/1',
    taluka: 'Ratnagiri',
    village: 'Mirya',
    projectId: 'PRJ-002',
    projectName: 'National Highway NH-66 4-Lane Expansion',
    areaHa: 0.95,
    landType: 'Non-Agricultural (Commercial frontage)',
    status: 'verification_pending',
    statusLabel: 'Verification Pending',
    rightsHolder: 'Late Sitaram Jadhav (Heirs Unsettled)',
    coOwners: ['Ramesh Jadhav', 'Dilip Jadhav'],
    verification: {
      ror: { status: 'verified', label: 'Verified (Deceased Recorded)', date: '2026-06-18', docRef: 'ROR-RTN-4301' },
      registration: { status: 'verified', label: 'Verified', date: '2026-06-20', docRef: 'SRO-RTN-2190' },
      mutation: { status: 'succession_pending', label: 'Succession / Mutation Pending', note: 'Death certificate filed; Waras Certificate pending from Tahsildar' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-06-25', docRef: 'CAD-MIR-106' },
      disputeCheck: { status: 'pending', label: 'Under Review', note: 'Heir apportionment claim filed' },
      overall: {
        code: 'CASE_4',
        status: 'Succession / Mutation Pending',
        badge: 'warning',
        recommendedAction: 'Review Succession Case (No Auto-Heir Assignment)'
      }
    },
    compensation: {
      assessedAmount: 3100000,
      approvedAmount: 0,
      disbursedAmount: 0,
      solatiumAmount: 3100000,
      interestAmount: 372000,
      totalCompensation: 6572000,
      status: 'pending',
      paymentStage: 'Award Pending Heir Finalization',
      bankDetails: { bank: 'State Bank of India', ifsc: 'SBIN0000465', accountStatus: 'Joint Escrow Pending' }
    },
    rr: {
      required: false,
      familyId: null,
      members: 0,
      status: 'not_applicable',
      package: 'Commercial Solatium Only',
      allottedPlot: 'N/A',
      delayReason: 'None'
    },
    possession: {
      status: 'pending_verification',
      fieldVerification: 'pending',
      fieldSurveyor: 'S. N. Joshi',
      gpsEvidence: 'Under Capture',
      documentsCount: 3,
      submittedDate: '2026-08-15'
    },
    coordinates: [
      [73.295, 17.009],
      [73.300, 17.010],
      [73.301, 17.006],
      [73.296, 17.005],
      [73.295, 17.009]
    ]
  },
  {
    id: 'P107',
    surveyNumber: 'SRV-107',
    khasraNumber: '107/3',
    taluka: 'Chiplun',
    village: 'Khed-Budruk',
    projectId: 'PRJ-005',
    projectName: 'Chiplun Flood Mitigation & Water Canal',
    areaHa: 4.10,
    landType: 'Agricultural',
    status: 'under_process',
    statusLabel: 'Under Process',
    rightsHolder: 'Vitthal Kadam',
    coOwners: ['Parvati Kadam'],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-07-02', docRef: 'ROR-CHP-1092' },
      registration: { status: 'verified', label: 'Verified', date: '2026-07-05', docRef: 'SRO-CHP-0881' },
      mutation: { status: 'verified', label: 'Verified', date: '2026-07-12', docRef: 'MUT-FER-7721' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-07-15', docRef: 'CAD-KHED-107' },
      disputeCheck: { status: 'clear', label: 'Clear', note: 'No disputes' },
      overall: {
        code: 'CASE_1',
        status: 'Verified',
        badge: 'success',
        recommendedAction: 'Publish Section 23 Award Declaration'
      }
    },
    compensation: {
      assessedAmount: 8900000,
      approvedAmount: 8900000,
      disbursedAmount: 4500000,
      solatiumAmount: 8900000,
      interestAmount: 1068000,
      totalCompensation: 18868000,
      status: 'in-progress',
      paymentStage: '1st Tranche Cleared; 2nd Tranche in Progress',
      bankDetails: { bank: 'Canara Bank', ifsc: 'CNRB0001923', accountStatus: 'Partially Disbursed' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1026',
      members: 7,
      status: 'settled',
      package: 'Housing + Annuity grant',
      allottedPlot: 'Chiplun WRD Colony #4',
      delayReason: 'None'
    },
    possession: {
      status: 'under_process',
      fieldVerification: 'complete',
      fieldSurveyor: 'P. D. Rane',
      gpsEvidence: 'Available (Dual Frequency GPS)',
      documentsCount: 7,
      submittedDate: '2026-08-28'
    },
    coordinates: [
      [73.310, 16.985],
      [73.316, 16.987],
      [73.318, 16.980],
      [73.311, 16.979],
      [73.310, 16.985]
    ]
  },
  {
    id: 'P108',
    surveyNumber: 'SRV-108',
    khasraNumber: '108/4',
    taluka: 'Guhagar',
    village: 'Karla',
    projectId: 'PRJ-004',
    projectName: 'Coastal Industrial & Logistics Corridor',
    areaHa: 5.60,
    landType: 'Horticultural (Mango Orchards)',
    status: 'disputed',
    statusLabel: 'Disputed',
    rightsHolder: 'Bhalchandra Joshi & 4 Others',
    coOwners: ['Suresh Joshi', 'Mahesh Joshi', 'Sunita Kelkar', 'Alka Bhagwat'],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-05-10', docRef: 'ROR-GUH-2144' },
      registration: { status: 'verified', label: 'Verified', date: '2026-05-12', docRef: 'SRO-GUH-1102' },
      mutation: { status: 'conflict', label: 'Conflict', note: 'Multiple mutation entries recorded without partition deed' },
      cadastralMap: { status: 'conflict', label: 'Boundary Mismatch', note: 'Boundary conflicts with adjacent CRZ line by 12 meters' },
      disputeCheck: { status: 'conflict', label: 'Dispute Registered', note: 'Objection OB-108 filed by co-owners against tree valuation' },
      overall: {
        code: 'CASE_5',
        status: 'Ownership Conflict',
        badge: 'error',
        recommendedAction: 'Send for Legal / Revenue Review & Re-survey'
      }
    },
    compensation: {
      assessedAmount: 14500000,
      approvedAmount: 0,
      disbursedAmount: 0,
      solatiumAmount: 14500000,
      interestAmount: 1740000,
      totalCompensation: 30740000,
      status: 'pending',
      paymentStage: 'Valuation Hearing Under Section 15',
      bankDetails: { bank: 'HDFC Bank', ifsc: 'HDFC0001029', accountStatus: 'Joint Signature Mandate Required' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1027',
      members: 9,
      status: 'pending',
      package: 'Commercial Solatium + Alternate Orchard Land',
      allottedPlot: 'Pending site identification',
      delayReason: 'Family consensus on cash vs land settlement'
    },
    possession: {
      status: 'rejected_returned',
      fieldVerification: 'incomplete',
      fieldSurveyor: 'V. M. Pawar',
      gpsEvidence: 'Boundary Overlap Detected',
      documentsCount: 4,
      submittedDate: '2026-08-05'
    },
    coordinates: [
      [73.275, 17.020],
      [73.282, 17.022],
      [73.284, 17.015],
      [73.276, 17.013],
      [73.275, 17.020]
    ]
  },
  {
    id: 'P109',
    surveyNumber: 'SRV-109',
    khasraNumber: '109/C',
    taluka: 'Ratnagiri',
    village: 'Zadgaon',
    projectId: 'PRJ-003',
    projectName: 'Ratnagiri Ultra-Mega Solar Power Park',
    areaHa: 6.20,
    landType: 'Barren / Rocky Wasteland',
    status: 'acquired',
    statusLabel: 'Acquired',
    rightsHolder: 'Government of Maharashtra (Revenue Dept)',
    coOwners: ['Grazing Rights Holders: Village Panchayat'],
    verification: {
      ror: { status: 'verified', label: 'Verified', date: '2026-06-01', docRef: 'ROR-ZAD-001' },
      registration: { status: 'verified', label: 'State Title', date: '2026-06-01', docRef: 'GOVT-GAZ-2026' },
      mutation: { status: 'verified', label: 'Verified', date: '2026-06-05', docRef: 'MUT-FER-6501' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-06-10', docRef: 'CAD-ZAD-109' },
      disputeCheck: { status: 'clear', label: 'Clear', note: 'Gram Sabha NOC obtained' },
      overall: {
        code: 'CASE_1',
        status: 'Verified',
        badge: 'success',
        recommendedAction: 'Handover to MAHAGENCO'
      }
    },
    compensation: {
      assessedAmount: 5200000,
      approvedAmount: 5200000,
      disbursedAmount: 5200000,
      solatiumAmount: 0,
      interestAmount: 0,
      totalCompensation: 5200000,
      status: 'disbursed',
      paymentStage: 'Transferred to Panchayat Development Fund',
      bankDetails: { bank: 'District Central Co-op Bank', ifsc: 'DCCB0000012', accountStatus: 'Credited to Gram Nidhi' }
    },
    rr: {
      required: false,
      familyId: null,
      members: 0,
      status: 'not_applicable',
      package: 'Community Grazing Land Substitution',
      allottedPlot: '10 Ha alternate pasture assigned',
      delayReason: 'None'
    },
    possession: {
      status: 'approved',
      fieldVerification: 'complete',
      fieldSurveyor: 'K. R. Deshmukh',
      gpsEvidence: 'Verified via Drone Orthomosaic',
      documentsCount: 8,
      submittedDate: '2026-07-20'
    },
    coordinates: [
      [73.325, 17.030],
      [73.332, 17.032],
      [73.335, 17.025],
      [73.326, 17.023],
      [73.325, 17.030]
    ]
  },
  {
    id: 'P110',
    surveyNumber: 'SRV-110',
    khasraNumber: '110/2A',
    taluka: 'Rajapur',
    village: 'Pomendi',
    projectId: 'PRJ-004',
    projectName: 'Coastal Industrial & Logistics Corridor',
    areaHa: 3.40,
    landType: 'Agricultural',
    status: 'verification_pending',
    statusLabel: 'Verification Pending',
    rightsHolder: 'Manohar Shinde',
    coOwners: [],
    verification: {
      ror: { status: 'unavailable', label: 'Record Unavailable', note: 'Old survey record physically damaged at taluka tehsil' },
      registration: { status: 'verified', label: 'Verified', date: '2026-07-15', docRef: 'SRO-RAJ-9921' },
      mutation: { status: 'pending', label: 'Pending Reconstruction', note: 'Reconstruction of paper register in progress' },
      cadastralMap: { status: 'verified', label: 'Verified', date: '2026-07-20', docRef: 'CAD-POM-110' },
      disputeCheck: { status: 'pending', label: 'Pending Search', note: '30-year search report awaited' },
      overall: {
        code: 'CASE_2',
        status: 'Record Unavailable',
        badge: 'neutral',
        recommendedAction: 'Create Manual Verification Case'
      }
    },
    compensation: {
      assessedAmount: 5100000,
      approvedAmount: 0,
      disbursedAmount: 0,
      solatiumAmount: 5100000,
      interestAmount: 612000,
      totalCompensation: 10812000,
      status: 'pending',
      paymentStage: 'Valuation Finalization Pending Record Reconstruction',
      bankDetails: { bank: 'Bank of Baroda', ifsc: 'BARB0RTNXXX', accountStatus: 'Aadhaar Seeded' }
    },
    rr: {
      required: true,
      familyId: 'FAM-1028',
      members: 4,
      status: 'pending',
      package: 'Housing Assistance',
      allottedPlot: 'Pending confirmation',
      delayReason: 'Record reconstruction under Tehsil inquiry'
    },
    possession: {
      status: 'pending_verification',
      fieldVerification: 'pending',
      fieldSurveyor: 'N. T. Tawade',
      gpsEvidence: 'Under Review',
      documentsCount: 2,
      submittedDate: '2026-08-22'
    },
    coordinates: [
      [73.315, 17.002],
      [73.320, 17.004],
      [73.322, 16.998],
      [73.316, 16.997],
      [73.315, 17.002]
    ]
  }
];

export const DISTRICT_OBJECTIONS = [
  {
    id: 'OB-103',
    objectionCode: 'OB-RTN-2026-103',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    applicant: 'Rahul Sharma',
    contact: '+91 98201 44921',
    reason: 'Boundary discrepancy & exclusion of newly built tube-well from valuation',
    submittedDate: '2026-08-16',
    documentsCount: 3,
    status: 'hearing_pending', // 'hearing_pending' | 'hearing_scheduled' | 'under_review' | 'accepted' | 'rejected'
    statusLabel: 'Hearing Pending',
    hearingDate: '2026-09-18 (CALA Bench 1)',
    officerRemarks: 'Boundary re-measurement ordered under Taluka Inspector of Land Records (TILR). Deposition scheduled.',
    verificationResult: 'Preliminary inspection affirms 0.15 Ha overlap with railway corridor boundary.',
    documents: [
      { name: 'Objection Petition Form 7.pdf', size: '1.2 MB', date: '16 Aug 2026' },
      { name: 'Private Surveyor Cross-Section Map.pdf', size: '3.4 MB', date: '16 Aug 2026' },
      { name: 'Tube-well Electricity Connection Receipt.pdf', size: '0.8 MB', date: '18 Aug 2026' }
    ]
  },
  {
    id: 'OB-106',
    objectionCode: 'OB-RTN-2026-106',
    parcelId: 'P106',
    surveyNumber: 'SRV-106',
    projectId: 'PRJ-002',
    projectName: 'National Highway NH-66 4-Lane Expansion',
    applicant: 'Ramesh Jadhav',
    contact: '+91 94220 88129',
    reason: 'Succession apportionment dispute: Brother claiming 100% solatium illegally',
    submittedDate: '2026-08-20',
    documentsCount: 4,
    status: 'hearing_scheduled',
    statusLabel: 'Hearing Scheduled',
    hearingDate: '2026-09-15, 11:30 AM',
    officerRemarks: 'Notice issued to all legal heirs to produce registered Family Settlement Deed or Waras certificate.',
    verificationResult: 'Deceased father title confirmed. Mutation pending legally in Tahsil office.',
    documents: [
      { name: 'Death Certificate of Late Sitaram Jadhav.pdf', size: '0.9 MB', date: '20 Aug 2026' },
      { name: 'Ration Card & Legal Heir Affidavit.pdf', size: '2.1 MB', date: '20 Aug 2026' }
    ]
  },
  {
    id: 'OB-108',
    objectionCode: 'OB-RTN-2026-108',
    parcelId: 'P108',
    surveyNumber: 'SRV-108',
    projectId: 'PRJ-004',
    projectName: 'Coastal Industrial & Logistics Corridor',
    applicant: 'Bhalchandra Joshi',
    contact: '+91 98902 33118',
    reason: 'Undervaluation of 142 yielding Alphonso mango trees under Section 29',
    submittedDate: '2026-08-25',
    documentsCount: 5,
    status: 'under_review',
    statusLabel: 'Under Review',
    hearingDate: '2026-09-22 (Joint Agriculture Bench)',
    officerRemarks: 'Horticulture Department Officer instructed to carry out re-enumeration of orchard trees.',
    verificationResult: 'Discrepancy found between initial DPR tree count (85) and owner census (142).',
    documents: [
      { name: 'Orchard Valuation Objection.pdf', size: '1.8 MB', date: '25 Aug 2026' },
      { name: 'APMC Krishi Utpanna Sale Receipts (3 Yrs).pdf', size: '4.5 MB', date: '27 Aug 2026' }
    ]
  },
  {
    id: 'OB-112',
    objectionCode: 'OB-RTN-2026-112',
    parcelId: 'P112',
    surveyNumber: 'SRV-112',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    applicant: 'Sanjay Vichare',
    contact: '+91 98221 66102',
    reason: 'Right of Way severed: Agricultural access to remaining 1.2 Ha plot cut off',
    submittedDate: '2026-08-30',
    documentsCount: 2,
    status: 'accepted',
    statusLabel: 'Accepted (Mitigation Ordered)',
    hearingDate: 'Concluded on 05 Sep 2026',
    officerRemarks: 'KRCL directed to construct a 4.5m vehicular underpass (RUB) at Chainage 184+200. Objection accepted.',
    verificationResult: 'Technical feasibility confirmed by Konkan Railway Chief Engineer.',
    documents: [
      { name: 'Severance Petition.pdf', size: '1.1 MB', date: '30 Aug 2026' },
      { name: 'Underpass Order Sec 15.pdf', size: '2.0 MB', date: '05 Sep 2026' }
    ]
  }
];

export const DISTRICT_AWARDS = [
  {
    id: 'AWD-103',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    affectedPerson: 'Rahul Sharma',
    areaHa: 2.45,
    baseLandValue: 6500000,
    solatium100Pct: 6500000,
    interest12Pct: 780000,
    totalAwardCompensation: 13780000,
    verificationStatus: 'Legal Conflict Resolved via Escrow Order',
    objectionStatus: 'Resolved (Boundary re-demarcated)',
    awardStatus: 'pending_declaration', // 'pending_declaration' | 'declared'
    awardStatusLabel: 'Pending Declaration',
    formNotice: 'Form 11 / Section 23 Award Draft',
    gazetteRef: 'MAH-GAZ-2026-RTN-892',
    valuationOfficer: 'Sub-Divisional Officer (SDO) Ratnagiri'
  },
  {
    id: 'AWD-105',
    parcelId: 'P105',
    surveyNumber: 'SRV-105',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    affectedPerson: 'Ganesh Sawant',
    areaHa: 3.15,
    baseLandValue: 7800000,
    solatium100Pct: 7800000,
    interest12Pct: 936000,
    totalAwardCompensation: 16536000,
    verificationStatus: 'Verified (All 5 Pillars Clear)',
    objectionStatus: 'No Objections Recorded',
    awardStatus: 'pending_declaration',
    awardStatusLabel: 'Pending Declaration',
    formNotice: 'Form 11 / Section 23 Award Draft',
    gazetteRef: 'MAH-GAZ-2026-RTN-894',
    valuationOfficer: 'Sub-Divisional Officer (SDO) Ratnagiri'
  },
  {
    id: 'AWD-107',
    parcelId: 'P107',
    surveyNumber: 'SRV-107',
    projectId: 'PRJ-005',
    projectName: 'Chiplun Flood Mitigation & Water Canal',
    affectedPerson: 'Vitthal Kadam',
    areaHa: 4.10,
    baseLandValue: 8900000,
    solatium100Pct: 8900000,
    interest12Pct: 1068000,
    totalAwardCompensation: 18868000,
    verificationStatus: 'Verified & Certified',
    objectionStatus: 'Settled by Agreement',
    awardStatus: 'declared',
    awardStatusLabel: 'Award Declared',
    declarationDate: '02 Sep 2026',
    formNotice: 'Statutory Form 12 Award Notice Dispatched',
    gazetteRef: 'MAH-GAZ-2026-CHP-110',
    valuationOfficer: 'CALA Chiplun Division'
  },
  {
    id: 'AWD-104',
    parcelId: 'P104',
    surveyNumber: 'SRV-104',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    affectedPerson: 'Anita Patil',
    areaHa: 1.80,
    baseLandValue: 4200000,
    solatium100Pct: 4200000,
    interest12Pct: 504000,
    totalAwardCompensation: 8904000,
    verificationStatus: 'Verified & Fully Cleared',
    objectionStatus: 'Nil',
    awardStatus: 'declared',
    declarationDate: '15 Aug 2026',
    formNotice: 'Section 23 Statutory Award Finalized',
    gazetteRef: 'MAH-GAZ-2026-RTN-701',
    valuationOfficer: 'CALA Ratnagiri Division'
  }
];

export const DISTRICT_COMPENSATION_RECORDS = [
  {
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    affectedPerson: 'Rahul Sharma',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway',
    village: 'Shirgaon',
    assessedAmount: 6500000,
    approvedAmount: 6500000,
    disbursedAmount: 0,
    pendingAmount: 6500000,
    status: 'pending',
    statusLabel: 'Pending Escrow Deposit',
    paymentStage: 'Court Dispute Hold',
    bank: 'SBI Ratnagiri',
    lastUpdated: '08 Sep 2026'
  },
  {
    parcelId: 'P104',
    surveyNumber: 'SRV-104',
    affectedPerson: 'Anita Patil',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway',
    village: 'Shirgaon',
    assessedAmount: 4200000,
    approvedAmount: 4200000,
    disbursedAmount: 4200000,
    pendingAmount: 0,
    status: 'disbursed',
    statusLabel: 'Disbursed',
    paymentStage: 'DBT Direct Credit',
    bank: 'Bank of Maharashtra',
    lastUpdated: '18 Aug 2026'
  },
  {
    parcelId: 'P105',
    surveyNumber: 'SRV-105',
    affectedPerson: 'Ganesh Sawant',
    projectId: 'PRJ-001',
    projectName: 'Mumbai-Goa Railway',
    village: 'Mirya',
    assessedAmount: 7800000,
    approvedAmount: 7800000,
    disbursedAmount: 0,
    pendingAmount: 7800000,
    status: 'approved',
    statusLabel: 'Approved (Pending Release)',
    paymentStage: 'PFMS Mandate Generated',
    bank: 'Union Bank of India',
    lastUpdated: '06 Sep 2026'
  },
  {
    parcelId: 'P107',
    surveyNumber: 'SRV-107',
    affectedPerson: 'Vitthal Kadam',
    projectId: 'PRJ-005',
    projectName: 'Chiplun Flood Canal',
    village: 'Khed-Budruk',
    assessedAmount: 8900000,
    approvedAmount: 8900000,
    disbursedAmount: 4500000,
    pendingAmount: 4400000,
    status: 'in_process',
    statusLabel: 'In Process (Tranche 2)',
    paymentStage: '2nd Tranche Milestone',
    bank: 'Canara Bank Chiplun',
    lastUpdated: '02 Sep 2026'
  },
  {
    parcelId: 'P109',
    surveyNumber: 'SRV-109',
    affectedPerson: 'Govt / Shirgaon Gram Panchayat',
    projectId: 'PRJ-003',
    projectName: 'Solar Power Park',
    village: 'Zadgaon',
    assessedAmount: 5200000,
    approvedAmount: 5200000,
    disbursedAmount: 5200000,
    pendingAmount: 0,
    status: 'disbursed',
    statusLabel: 'Disbursed',
    paymentStage: 'Inter-Govt Credit',
    bank: 'DCCB Zadgaon',
    lastUpdated: '25 Jul 2026'
  },
  {
    parcelId: 'P110',
    surveyNumber: 'SRV-110',
    affectedPerson: 'Manohar Shinde',
    projectId: 'PRJ-004',
    projectName: 'Coastal Industrial Corridor',
    village: 'Pomendi',
    assessedAmount: 5100000,
    approvedAmount: 0,
    disbursedAmount: 0,
    pendingAmount: 5100000,
    status: 'pending',
    statusLabel: 'Under Assessment',
    paymentStage: 'Valuation Hearing',
    bank: 'Bank of Baroda',
    lastUpdated: '28 Aug 2026'
  },
  {
    parcelId: 'P108',
    surveyNumber: 'SRV-108',
    affectedPerson: 'Bhalchandra Joshi & Co-owners',
    projectId: 'PRJ-004',
    projectName: 'Coastal Industrial Corridor',
    village: 'Karla',
    assessedAmount: 14500000,
    approvedAmount: 0,
    disbursedAmount: 0,
    pendingAmount: 14500000,
    status: 'disputed',
    statusLabel: 'Valuation Contested',
    paymentStage: 'Horticulture Re-audit',
    bank: 'HDFC Ratnagiri',
    lastUpdated: '04 Sep 2026'
  }
];

export const DISTRICT_RR_FAMILIES = [
  {
    id: 'FAM-1023',
    parcelId: 'P103',
    projectName: 'Mumbai-Goa Railway',
    headOfFamily: 'Rahul Sharma',
    members: 5,
    rrPackage: 'Housing Assistance + Shifting Grant',
    status: 'pending',
    statusLabel: 'Pending',
    reasonForDelay: 'Documentation & Heir Consensus pending',
    allocatedSite: 'Mirya R&R Site #14',
    grantAmount: 550000,
    actionRequired: 'Verify ration card & obtain consensus deed'
  },
  {
    id: 'FAM-1024',
    parcelId: 'P104',
    projectName: 'Mumbai-Goa Railway',
    headOfFamily: 'Anita Patil',
    members: 4,
    rrPackage: 'One-time Resettlement Grant + Livelihood Solatium',
    status: 'completed',
    statusLabel: 'Completed',
    reasonForDelay: 'None',
    allocatedSite: 'Self Relocation (Beneficiary Choice)',
    grantAmount: 850000,
    actionRequired: 'None (Utilisation Certificate Filed)'
  },
  {
    id: 'FAM-1025',
    parcelId: 'P105',
    projectName: 'Mumbai-Goa Railway',
    headOfFamily: 'Ganesh Sawant',
    members: 6,
    rrPackage: 'Constructed House in Model Resettlement Colony',
    status: 'in_progress',
    statusLabel: 'In Progress (80%)',
    reasonForDelay: 'Roofing & sanitation works near completion',
    allocatedSite: 'Mirya Sector 3, Plot #8',
    grantAmount: 700000,
    actionRequired: 'CALA inspection for possession key handover'
  },
  {
    id: 'FAM-1027',
    parcelId: 'P108',
    projectName: 'Coastal Industrial Corridor',
    headOfFamily: 'Bhalchandra Joshi',
    members: 9,
    rrPackage: 'Alternative Horticultural Land Allocation',
    status: 'pending',
    statusLabel: 'Pending',
    reasonForDelay: 'Dispute over soil quality of offered site in Karla',
    allocatedSite: 'Karla Sector 2 Land Parcel',
    grantAmount: 1200000,
    actionRequired: 'Agronomist joint inspection report scheduled'
  },
  {
    id: 'FAM-1028',
    parcelId: 'P110',
    projectName: 'Coastal Industrial Corridor',
    headOfFamily: 'Manohar Shinde',
    members: 4,
    rrPackage: 'Homestead Assistance + Vocational Training Seat',
    status: 'pending',
    statusLabel: 'Pending',
    reasonForDelay: 'Old cadastral record reconstruction under Tehsil inquiry',
    allocatedSite: 'Pomendi East Extension',
    grantAmount: 600000,
    actionRequired: 'Expedite Tahsildar pedigree confirmation'
  }
];

export const DISTRICT_POSSESSION_REQUESTS = [
  {
    id: 'POS-001',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    taluka: 'Ratnagiri',
    village: 'Shirgaon',
    areaHa: 2.45,
    fieldOfficer: 'A. K. More (Surveyor Circle 2)',
    fieldVerification: 'Complete',
    compensationDisbursed: 'Disbursed / Held in Escrow',
    rrComplete: 'Complete',
    legalVerification: 'Complete',
    documentsCount: 5,
    gpsEvidence: 'Available (RTK-GPS 8-Corner Tagged)',
    submittedDate: '08 Sep 2026',
    status: 'awaiting_approval',
    statusLabel: 'Awaiting District Approval',
    checklist: [
      { item: 'Section 19 Gazette Notification Affirmed', passed: true },
      { item: 'Section 23 Statutory Award Declared', passed: true },
      { item: '100% Compensation Escrow Deposited', passed: true },
      { item: 'R&R Housing / Solatium Allotted', passed: true },
      { item: 'Physical Demarcation & Boundary Pegging Done', passed: true },
      { item: 'Drone Orthomosaic & Geo-tag Photos Uploaded', passed: true }
    ],
    coordinatesPreview: '16.992°N, 73.298°E to 16.989°N, 73.303°E'
  },
  {
    id: 'POS-002',
    parcelId: 'P104',
    surveyNumber: 'SRV-104',
    projectName: 'Mumbai-Goa Railway Double Track Line',
    taluka: 'Ratnagiri',
    village: 'Shirgaon',
    areaHa: 1.80,
    fieldOfficer: 'A. K. More (Surveyor Circle 2)',
    fieldVerification: 'Complete',
    compensationDisbursed: 'Complete (100% DBT Done)',
    rrComplete: 'Complete',
    legalVerification: 'Complete',
    documentsCount: 6,
    gpsEvidence: 'Available (RTK-GPS Verified)',
    submittedDate: '20 Aug 2026',
    status: 'approved',
    statusLabel: 'Possession Approved',
    handoverDate: '25 Aug 2026',
    checklist: [
      { item: 'Section 19 Gazette Notification Affirmed', passed: true },
      { item: 'Section 23 Statutory Award Declared', passed: true },
      { item: '100% Compensation Escrow Deposited', passed: true },
      { item: 'R&R Housing / Solatium Allotted', passed: true },
      { item: 'Physical Demarcation & Boundary Pegging Done', passed: true },
      { item: 'Drone Orthomosaic & Geo-tag Photos Uploaded', passed: true }
    ],
    coordinatesPreview: '16.994°N, 73.303°E to 16.991°N, 73.309°E'
  },
  {
    id: 'POS-003',
    parcelId: 'P107',
    surveyNumber: 'SRV-107',
    projectName: 'Chiplun Flood Mitigation & Water Canal',
    taluka: 'Chiplun',
    village: 'Khed-Budruk',
    areaHa: 4.10,
    fieldOfficer: 'P. D. Rane (WRD Surveyor)',
    fieldVerification: 'Complete',
    compensationDisbursed: '50% Initial Disbursed',
    rrComplete: 'Complete',
    legalVerification: 'Complete',
    documentsCount: 7,
    gpsEvidence: 'Available (Dual Frequency GPS)',
    submittedDate: '28 Aug 2026',
    status: 'awaiting_approval',
    statusLabel: 'Awaiting District Approval',
    checklist: [
      { item: 'Section 19 Gazette Notification Affirmed', passed: true },
      { item: 'Section 23 Statutory Award Declared', passed: true },
      { item: '100% Compensation Escrow Deposited', passed: true },
      { item: 'R&R Housing / Solatium Allotted', passed: true },
      { item: 'Physical Demarcation & Boundary Pegging Done', passed: true },
      { item: 'Drone Orthomosaic & Geo-tag Photos Uploaded', passed: true }
    ],
    coordinatesPreview: '16.985°N, 73.310°E to 16.980°N, 73.318°E'
  }
];

export const DISTRICT_ALERTS = [
  {
    id: 'ALT-001',
    severity: 'critical', // 'critical' | 'high' | 'warning'
    title: '27 parcels have unresolved ownership disputes',
    subtitle: 'Mumbai-Goa Railway Corridor (PRJ-001) has 27 active disputes causing a 4–6 month statutory delay.',
    targetTab: 'risk',
    actionText: 'Inspect Risk Bottlenecks',
    viewText: 'View Disputed Parcels'
  },
  {
    id: 'ALT-002',
    severity: 'high',
    title: '18 compensation cases pending for more than 30 days',
    subtitle: 'Escrow release pending bank validation & CALA digital signatures for ₹17 Cr.',
    targetTab: 'compensation',
    actionText: 'Review DBT Queue',
    viewText: 'View 18 Cases'
  },
  {
    id: 'ALT-003',
    severity: 'warning',
    title: '11 parcels require manual verification',
    subtitle: 'Paper 7/12 extract damaged or missing mutation registers across Shirgaon and Pomendi.',
    targetTab: 'verification',
    actionText: 'Assign to Tahsildar',
    viewText: 'View 11 Parcels'
  },
  {
    id: 'ALT-004',
    severity: 'critical',
    title: '2 projects are at high risk of delay',
    subtitle: 'Mumbai-Goa Railway (82/100) and Coastal Industrial Corridor (79/100) require CALA intervention.',
    targetTab: 'projects',
    actionText: 'Convene Special Scrutiny',
    viewText: 'Inspect Projects'
  },
  {
    id: 'ALT-005',
    severity: 'high',
    title: '9 R&R cases require action',
    subtitle: 'Family consensus & housing plot allocation pending under Model Resettlement Scheme.',
    targetTab: 'rr',
    actionText: 'Allot R&R Plots',
    viewText: 'View Families'
  }
];

export const DISTRICT_DOCUMENTS = [
  {
    id: 'DOC-001',
    title: 'Village 7/12 Extract (Record of Rights) - Parcel P103',
    docType: 'RoR / 7-12 Extract',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    date: '12 Aug 2026',
    issuer: 'Talathi Office, Shirgaon Circle, Ratnagiri',
    status: 'Verified with Mutation Note',
    signStatus: 'Digitally Signed by Revenue Circle Officer (SHA-256)',
    contentSnippet: `GOVERNMENT OF MAHARASHTRA - REVENUE & FOREST DEPARTMENT
FORM VII-XII (RECORD OF RIGHTS)
District: Ratnagiri | Taluka: Ratnagiri | Village: Shirgaon
Survey/Gat No: 103 | Hissa: 1A | Area: 2.45 Hectares
Pota Kharab (Uncultivable): 0.10 Ha | Cultivable: 2.35 Ha
Primary Occupant / Khatedar: Rahul Sharma (S/o Devendra Sharma)
Co-occupants: Vikas Sharma, Sunita Sharma
Encumbrances & Other Rights:
1. Entry 1841: Civil Court Injunction Notice pending in Suit 44/2025.
2. Section 11(1) Preliminary Notification published in Gazette on 14 Jan 2026 for Railway Track Double Line.
Certified true copy generated from e-Mahabhumi Cadastral Server.`
  },
  {
    id: 'DOC-002',
    title: 'Registered Sale Deed & Title Chain - Parcel P103',
    docType: 'Registration / Deed',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    date: '14 Aug 2026',
    issuer: 'Sub-Registrar Office, Ratnagiri Class-I',
    status: 'Registered Record Verified',
    signStatus: 'NIC-CERT Certified',
    contentSnippet: `SUB-REGISTRAR OFFICE RATNAGIRI
Deed of Absolute Sale | Document No: 4421/2014
Date of Execution: 18 March 2014 | Stamp Duty Paid: ₹3,25,000
Vendors: Shri Jagannath Joshi & Sons
Purchaser: Late Devendra Sharma (Father of Rahul Sharma)
Schedule of Property: All that piece and parcel of agricultural land bearing Survey No 103/1A, admeasuring 2.45 Ha situated at Village Shirgaon.
Title confirmed free from prior mortgage.`
  },
  {
    id: 'DOC-003',
    title: 'Section 15 Statutory Hearing Notice & Deposition Record',
    docType: 'Objection & Hearing',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    date: '02 Sep 2026',
    issuer: 'Office of the CALA, Ratnagiri',
    status: 'Statutory Notice Dispatched',
    signStatus: 'Sealed by CALA Ratnagiri',
    contentSnippet: `BEFORE THE COMPETENT AUTHORITY FOR LAND ACQUISITION (CALA)
DISTRICT MAGISTRATE COURT, RATNAGIRI
Case No: CALA/SEC-15/OB-103/2026
In the Matter of: Rahul Sharma vs Konkan Railway Corp. Ltd.
Notice under Section 15(2) of the RFCTLARR Act, 2013:
The applicant having raised boundary discrepancies regarding 0.15 Ha orchard parcel and inclusion of borewell asset, all parties are summoned to appear in person or by advocate on 18 Sep 2026 at 11:00 AM in the CALA Chamber.
Field Surveyor directed to submit Joint Measurement Report (JMR) prior to hearing.`
  },
  {
    id: 'DOC-004',
    title: 'Statutory Award Declaration Draft (Form 11 / Sec 23)',
    docType: 'Award Notice',
    parcelId: 'P103',
    surveyNumber: 'SRV-103',
    date: '05 Sep 2026',
    issuer: 'Office of the District Magistrate & Collector, Ratnagiri',
    status: 'Draft Ready for Sign-off',
    signStatus: 'Pending Digital Signature of DM',
    contentSnippet: `STATUTORY AWARD UNDER SECTION 23 OF RFCTLARR ACT, 2013
Project: Mumbai-Goa Railway Double Track (PRJ-001)
District: Ratnagiri | Village: Shirgaon | Survey No: 103/1A
Area Acquired: 2.45 Hectares
1. Market Value Determined (Sec 26): ₹65,00,000/-
2. Factor 1.5 Applicable (Rural Area): Included
3. Solatium @ 100% (Sec 30(1)): ₹65,00,000/-
4. Additional Interest @ 12% p.a. (Sec 30(3)): ₹7,80,000/-
TOTAL COMPENSATION AWARDED: ₹1,37,80,000/- (Rupees One Crore Thirty-Seven Lakhs Eighty Thousand Only)
Disbursement Condition: Release conditional upon resolution of Civil Court Escrow.`
  }
];

export const DISTRICT_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    time: '11:45 AM Today',
    action: 'Possession Evidence Review Opened',
    parcel: 'P103',
    project: 'Mumbai-Goa Railway',
    role: 'District Magistrate / CALA',
    statutoryRef: 'Section 38 RFCTLARR Act',
    details: 'Verified 8-corner RTK-GPS survey coordinates and boundary demarcation tags.'
  },
  {
    id: 'LOG-002',
    time: '10:42 AM Today',
    action: 'Field Officer submitted possession evidence',
    parcel: 'P103',
    project: 'Mumbai-Goa Railway',
    role: 'Field Surveyor A. K. More',
    statutoryRef: 'Survey Form 9',
    details: 'Uploaded drone orthomosaic clearance certificate and pillar geotags.'
  },
  {
    id: 'LOG-003',
    time: '10:15 AM Today',
    action: 'Objection OB-103 scheduled for hearing',
    parcel: 'P103',
    project: 'Mumbai-Goa Railway',
    role: 'CALA Hearing Officer',
    statutoryRef: 'Section 15(2)',
    details: 'Hearing scheduled for 18 Sep 2026 with TILR joint re-survey order.'
  },
  {
    id: 'LOG-004',
    time: 'Yesterday, 4:30 PM',
    action: 'Mutation verification requested from Tahsildar',
    parcel: 'P104',
    project: 'Mumbai-Goa Railway',
    role: 'Revenue Circle Officer',
    statutoryRef: 'MLR Code Sec 149',
    details: 'Issued Ferfar verification requisition to Tahsildar Ratnagiri for prompt mutation entry.'
  },
  {
    id: 'LOG-005',
    time: 'Yesterday, 2:15 PM',
    action: 'Statutory Award declared under Section 23',
    parcel: 'P104',
    project: 'Mumbai-Goa Railway',
    role: 'District Magistrate',
    statutoryRef: 'Section 23 Award',
    details: 'Signed statutory award of ₹89.04 Lakhs for Anita Patil. Dispatched DBT credit mandate.'
  },
  {
    id: 'LOG-006',
    time: '08 Sep 2026, 11:20 AM',
    action: 'Inter-Agency Risk Flag Issued',
    parcel: 'All Disputed',
    project: 'Mumbai-Goa Railway',
    role: 'District Magistrate',
    statutoryRef: 'High Risk Review',
    details: 'Notified State Revenue Secretary regarding 27 court dispute bottlenecks in corridor.'
  }
];

// Helper to get GeoJSON FeatureCollection of all parcels
export function getDistrictParcelsGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: DISTRICT_PARCELS.map((p) => ({
      type: 'Feature',
      id: p.id,
      properties: {
        id: p.id,
        survey_number: p.surveyNumber,
        khasra_number: p.khasraNumber,
        taluka: p.taluka,
        village: p.village,
        project_id: p.projectId,
        project_name: p.projectName,
        area_ha: p.areaHa,
        land_type: p.landType,
        status: p.status,
        status_label: p.statusLabel,
        rights_holder: p.rightsHolder,
        compensation_amount: p.compensation.assessedAmount,
        compensation_status: p.compensation.status,
        rr_required: p.rr.required,
        rr_status: p.rr.status,
        possession_status: p.possession.status,
        overall_verification: p.verification.overall.status
      },
      geometry: {
        type: 'Polygon',
        coordinates: [p.coordinates]
      }
    }))
  };
}
