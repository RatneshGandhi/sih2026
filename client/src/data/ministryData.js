/**
 * Dedicated Mock Data for Central Ministry (MoRD / PM-GatiShakti) Dashboard
 * National Land Acquisition & Management System (NLAMS)
 * Strictly scoped to National / Central Government oversight.
 * 
 * IMPORTANT:
 * Synthetic Cadastral & Workflow Benchmark Data for Hackathon Prototype Demonstration.
 * Not live Government of India statistics.
 */

export const MINISTRY_INFO = {
  jurisdiction: 'National Sovereign Command — India',
  ministry: 'Ministry of Rural Development & Department of Land Resources, Government of India',
  portal: 'NLAMS Central Apex Monitoring Portal',
  role: 'Central Ministry (MoRD / PM-GatiShakti)',
  official: 'Joint Secretary (Land Resources), GoI',
  statutoryAct: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)',
  syncTimestamp: '10 Sep 2026, 12:30 PM IST',
  cadastreSyncStatus: 'ACTIVE_CADASTRE_STREAM',
  dataClassification: 'SYNTHETIC BENCHMARK PROTOTYPE (SIH 2026)'
};

export const NATIONAL_KPIS = {
  totalProjects: 184,
  landProposedHa: 48250,
  landAcquiredHa: 36720,
  acquisitionProgressPct: 76.1, // 36,720 / 48,250 Ha (76%)
  affectedFamilies: 42850,
  notificationsCount: 162,
  awardsDeclared: 138,
  compensationAssessedCr: 9200,
  compensationApprovedCr: 8760,
  compensationDisbursedCr: 8420,
  compensationPendingCr: 340,
  rrCompletedPct: 78,
  rrPendingPct: 22,
  possessionCompletedPct: 71,
  possessionPendingPct: 29,
  timelineAdherencePct: 74,
  delayedPct: 26,
  highRiskProjectsCount: 18,
  highRiskStatesCount: 7,
  totalStatesTracked: 12,
  totalDistrictsTracked: 148,
  averageAcquisitionMonths: 15.1
};

export const STATES_DATA = [
  {
    code: 'MH',
    name: 'Maharashtra',
    projectsCount: 32,
    landProposedHa: 8420,
    landAcquiredHa: 6910,
    acquisitionPct: 82.0,
    riskScore: 68,
    riskLevel: 'ATTENTION',
    riskBadge: 'warning',
    disputesCount: 214,
    highRiskProjects: 3,
    compensationAssessedCr: 1800,
    compensationApprovedCr: 1720,
    compensationDisbursedCr: 1620,
    compensationPendingCr: 100,
    rrCompletedPct: 82,
    possessionCompletedPct: 79,
    timelineAdherencePct: 78,
    districtsCount: 36,
    districts: [
      {
        name: 'Ratnagiri',
        projectsCount: 12,
        landProposedHa: 4250,
        landAcquiredHa: 3100,
        acquisitionPct: 78.0,
        riskScore: 82,
        highRiskProjects: 2,
        disputesCount: 32,
        activeProjects: [
          {
            id: 'PRJ-001',
            code: 'PRJ-001',
            name: 'Mumbai-Goa Railway Double Track Line',
            agency: 'Konkan Railway Corporation Limited (KRCL)',
            progressPct: 72,
            riskScore: 82,
            riskLevel: 'HIGH_RISK',
            expectedCompletion: 'March 2027',
            predictedCompletion: 'April 2027',
            predictedDelay: '+1 month',
            parcelsCount: 342,
            disputedParcels: 27,
            compPending: 18,
            verifPending: 11,
            rrPending: 9,
            mainBottleneck: 'Ownership Disputes & Compensation Verification',
            recommendedAction: 'Prioritize legal/revenue verification for disputed parcels and monitor compensation clearance.'
          },
          {
            id: 'PRJ-002',
            code: 'PRJ-002',
            name: 'NH-66 Coastal Link Four-Laning',
            agency: 'National Highways Authority of India (NHAI)',
            progressPct: 84,
            riskScore: 71,
            riskLevel: 'HIGH_RISK',
            expectedCompletion: 'Nov 2026',
            predictedCompletion: 'Dec 2026',
            predictedDelay: '+3 weeks',
            parcelsCount: 210,
            disputedParcels: 14,
            compPending: 12,
            verifPending: 6,
            rrPending: 4,
            mainBottleneck: 'Section 15 Objections on Orchard Valuations',
            recommendedAction: 'Convene joint horticulture valuation panel to resolve solatium discrepancies.'
          }
        ]
      },
      {
        name: 'Thane',
        projectsCount: 8,
        landProposedHa: 1980,
        landAcquiredHa: 1650,
        acquisitionPct: 83.3,
        riskScore: 54,
        highRiskProjects: 1,
        disputesCount: 68
      },
      {
        name: 'Raigad',
        projectsCount: 6,
        landProposedHa: 1240,
        landAcquiredHa: 1040,
        acquisitionPct: 83.8,
        riskScore: 61,
        highRiskProjects: 0,
        disputesCount: 52
      },
      {
        name: 'Pune',
        projectsCount: 6,
        landProposedHa: 950,
        landAcquiredHa: 820,
        acquisitionPct: 86.3,
        riskScore: 45,
        highRiskProjects: 0,
        disputesCount: 62
      }
    ]
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    projectsCount: 28,
    landProposedHa: 7480,
    landAcquiredHa: 5840,
    acquisitionPct: 78.0,
    riskScore: 38,
    riskLevel: 'ON_TRACK',
    riskBadge: 'success',
    disputesCount: 86,
    highRiskProjects: 1,
    compensationAssessedCr: 1250,
    compensationApprovedCr: 1210,
    compensationDisbursedCr: 1180,
    compensationPendingCr: 30,
    rrCompletedPct: 85,
    possessionCompletedPct: 76,
    timelineAdherencePct: 82,
    districtsCount: 33,
    districts: [
      {
        name: 'Bharuch',
        projectsCount: 10,
        landProposedHa: 2600,
        landAcquiredHa: 2050,
        acquisitionPct: 78.8,
        riskScore: 71,
        highRiskProjects: 1,
        disputesCount: 34
      },
      {
        name: 'Surat',
        projectsCount: 9,
        landProposedHa: 2400,
        landAcquiredHa: 1910,
        acquisitionPct: 79.5,
        riskScore: 32,
        highRiskProjects: 0,
        disputesCount: 28
      },
      {
        name: 'Ahmedabad',
        projectsCount: 9,
        landProposedHa: 2480,
        landAcquiredHa: 1880,
        acquisitionPct: 75.8,
        riskScore: 28,
        highRiskProjects: 0,
        disputesCount: 24
      }
    ]
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    projectsCount: 26,
    landProposedHa: 8600,
    landAcquiredHa: 6100,
    acquisitionPct: 70.9,
    riskScore: 84,
    riskLevel: 'HIGH_RISK',
    riskBadge: 'error',
    disputesCount: 342,
    highRiskProjects: 5,
    compensationAssessedCr: 1480,
    compensationApprovedCr: 1320,
    compensationDisbursedCr: 1050,
    compensationPendingCr: 270,
    rrCompletedPct: 61,
    possessionCompletedPct: 63,
    timelineAdherencePct: 62,
    districtsCount: 33,
    districts: [
      {
        name: 'Alwar',
        projectsCount: 8,
        landProposedHa: 2800,
        landAcquiredHa: 1920,
        acquisitionPct: 68.5,
        riskScore: 88,
        highRiskProjects: 2,
        disputesCount: 114
      },
      {
        name: 'Jaipur',
        projectsCount: 7,
        landProposedHa: 2100,
        landAcquiredHa: 1540,
        acquisitionPct: 73.3,
        riskScore: 68,
        highRiskProjects: 1,
        disputesCount: 82
      },
      {
        name: 'Jodhpur',
        projectsCount: 6,
        landProposedHa: 2200,
        landAcquiredHa: 1510,
        acquisitionPct: 68.6,
        riskScore: 81,
        highRiskProjects: 1,
        disputesCount: 79
      },
      {
        name: 'Bhilwara',
        projectsCount: 5,
        landProposedHa: 1500,
        landAcquiredHa: 1130,
        acquisitionPct: 75.3,
        riskScore: 82,
        highRiskProjects: 1,
        disputesCount: 67
      }
    ]
  },
  {
    code: 'KA',
    name: 'Karnataka',
    projectsCount: 24,
    landProposedHa: 7120,
    landAcquiredHa: 4920,
    acquisitionPct: 69.1,
    riskScore: 65,
    riskLevel: 'ATTENTION',
    riskBadge: 'warning',
    disputesCount: 194,
    highRiskProjects: 3,
    compensationAssessedCr: 1320,
    compensationApprovedCr: 1180,
    compensationDisbursedCr: 980,
    compensationPendingCr: 200,
    rrCompletedPct: 67,
    possessionCompletedPct: 68,
    timelineAdherencePct: 68,
    districtsCount: 31,
    districts: [
      {
        name: 'Belagavi',
        projectsCount: 8,
        landProposedHa: 2400,
        landAcquiredHa: 1640,
        acquisitionPct: 68.3,
        riskScore: 74,
        highRiskProjects: 1,
        disputesCount: 68
      },
      {
        name: 'Bengaluru Rural',
        projectsCount: 9,
        landProposedHa: 2800,
        landAcquiredHa: 1960,
        acquisitionPct: 70.0,
        riskScore: 73,
        highRiskProjects: 1,
        disputesCount: 72
      },
      {
        name: 'Mysuru',
        projectsCount: 7,
        landProposedHa: 1920,
        landAcquiredHa: 1320,
        acquisitionPct: 68.7,
        riskScore: 52,
        highRiskProjects: 1,
        disputesCount: 54
      }
    ]
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    projectsCount: 22,
    landProposedHa: 6530,
    landAcquiredHa: 4310,
    acquisitionPct: 66.0,
    riskScore: 58,
    riskLevel: 'ATTENTION',
    riskBadge: 'warning',
    disputesCount: 145,
    highRiskProjects: 2,
    compensationAssessedCr: 1190,
    compensationApprovedCr: 1080,
    compensationDisbursedCr: 890,
    compensationPendingCr: 190,
    rrCompletedPct: 72,
    possessionCompletedPct: 69,
    timelineAdherencePct: 71,
    districtsCount: 38,
    districts: [
      {
        name: 'Salem',
        projectsCount: 7,
        landProposedHa: 2100,
        landAcquiredHa: 1380,
        acquisitionPct: 65.7,
        riskScore: 77,
        highRiskProjects: 1,
        disputesCount: 48
      },
      {
        name: 'Kanchipuram',
        projectsCount: 8,
        landProposedHa: 2350,
        landAcquiredHa: 1590,
        acquisitionPct: 67.6,
        riskScore: 72,
        highRiskProjects: 1,
        disputesCount: 52
      },
      {
        name: 'Coimbatore',
        projectsCount: 7,
        landProposedHa: 2080,
        landAcquiredHa: 1340,
        acquisitionPct: 64.4,
        riskScore: 46,
        highRiskProjects: 0,
        disputesCount: 45
      }
    ]
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    projectsCount: 30,
    landProposedHa: 7040,
    landAcquiredHa: 5210,
    acquisitionPct: 74.0,
    riskScore: 62,
    riskLevel: 'ATTENTION',
    riskBadge: 'warning',
    disputesCount: 280,
    highRiskProjects: 3,
    compensationAssessedCr: 1680,
    compensationApprovedCr: 1540,
    compensationDisbursedCr: 1420,
    compensationPendingCr: 120,
    rrCompletedPct: 75,
    possessionCompletedPct: 73,
    timelineAdherencePct: 70,
    districtsCount: 75,
    districts: [
      {
        name: 'Varanasi',
        projectsCount: 11,
        landProposedHa: 2600,
        landAcquiredHa: 1920,
        acquisitionPct: 73.8,
        riskScore: 78,
        highRiskProjects: 1,
        disputesCount: 96
      },
      {
        name: 'Prayagraj',
        projectsCount: 10,
        landProposedHa: 2400,
        landAcquiredHa: 1760,
        acquisitionPct: 73.3,
        riskScore: 79,
        highRiskProjects: 1,
        disputesCount: 94
      },
      {
        name: 'Lucknow',
        projectsCount: 9,
        landProposedHa: 2040,
        landAcquiredHa: 1530,
        acquisitionPct: 75.0,
        riskScore: 48,
        highRiskProjects: 1,
        disputesCount: 90
      }
    ]
  },
  {
    code: 'OD',
    name: 'Odisha',
    projectsCount: 22,
    landProposedHa: 5360,
    landAcquiredHa: 3430,
    acquisitionPct: 64.0,
    riskScore: 79,
    riskLevel: 'HIGH_RISK',
    riskBadge: 'error',
    disputesCount: 268,
    highRiskProjects: 4,
    compensationAssessedCr: 980,
    compensationApprovedCr: 890,
    compensationDisbursedCr: 680,
    compensationPendingCr: 210,
    rrCompletedPct: 64,
    possessionCompletedPct: 61,
    timelineAdherencePct: 60,
    districtsCount: 30,
    districts: [
      {
        name: 'Sundargarh',
        projectsCount: 8,
        landProposedHa: 1950,
        landAcquiredHa: 1210,
        acquisitionPct: 62.0,
        riskScore: 86,
        highRiskProjects: 1,
        disputesCount: 98
      },
      {
        name: 'Angul',
        projectsCount: 7,
        landProposedHa: 1720,
        landAcquiredHa: 1090,
        acquisitionPct: 63.3,
        riskScore: 83,
        highRiskProjects: 1,
        disputesCount: 86
      },
      {
        name: 'Keonjhar',
        projectsCount: 7,
        landProposedHa: 1690,
        landAcquiredHa: 1130,
        acquisitionPct: 66.8,
        riskScore: 84,
        highRiskProjects: 2,
        disputesCount: 84
      }
    ]
  }
];

export const PREDICTIVE_DELAY_PROJECTS = [
  {
    rank: 1,
    id: 'PRJ-001',
    name: 'Mumbai-Goa Railway Double Track Line',
    state: 'Maharashtra',
    district: 'Ratnagiri',
    agency: 'Konkan Railway Corporation Limited (KRCL)',
    progressPct: 72,
    expectedCompletion: 'March 2027',
    predictedCompletion: 'April 2027',
    delayFormatted: '+1 month',
    riskScore: 82,
    riskLevel: 'HIGH',
    mainBottleneck: 'Land disputes, Compensation delay, R&R pending',
    reasons: [
      '27 disputed parcels in Ratnagiri civil bench',
      '18 compensation payments stuck in escrow verification',
      '9 R&R families awaiting housing allotment consensus'
    ],
    bottleneckBreakdown: {
      disputes: 35,
      compensation: 25,
      verification: 20,
      rr: 12,
      other: 8
    },
    recommendedAction: 'Prioritize legal/revenue verification for disputed parcels and monitor compensation clearance.'
  },
  {
    rank: 2,
    id: 'PRJ-014',
    name: 'Industrial Corridor Feeder Highway',
    state: 'Rajasthan',
    district: 'Alwar',
    agency: 'RIICO / MoRTH',
    progressPct: 61,
    expectedCompletion: 'Dec 2026',
    predictedCompletion: 'Feb 2027',
    delayFormatted: '+2 months',
    riskScore: 88,
    riskLevel: 'HIGH',
    mainBottleneck: 'Land record verification & Compensation processing',
    reasons: [
      'Unresolved mutation entries dating back to legacy consolidation',
      'Section 19 solatium disputes in 4 villages'
    ],
    bottleneckBreakdown: {
      disputes: 28,
      compensation: 34,
      verification: 26,
      rr: 8,
      other: 4
    },
    recommendedAction: 'Review districts with prolonged compensation processing and identify administrative bottlenecks.'
  },
  {
    rank: 3,
    id: 'PRJ-028',
    name: 'Highway Expansion & Multi-Modal Bypass',
    state: 'Karnataka',
    district: 'Belagavi',
    agency: 'NHAI / PWD Karnataka',
    progressPct: 68,
    expectedCompletion: 'Nov 2026',
    predictedCompletion: 'Dec 2026',
    delayFormatted: '+3 weeks',
    riskScore: 74,
    riskLevel: 'HIGH',
    mainBottleneck: 'Section 15 Objections & Title Verification',
    reasons: [
      'Boundary overlap with state irrigation canal buffer',
      'Joint survey verification pending for 16 agricultural plots'
    ],
    bottleneckBreakdown: {
      disputes: 30,
      compensation: 20,
      verification: 32,
      rr: 10,
      other: 8
    },
    recommendedAction: 'Deploy joint surveyor taskforce to finalize RoR-Mutation cross-matching.'
  },
  {
    rank: 4,
    id: 'PRJ-035',
    name: 'Western Dedicated Freight Corridor Spur',
    state: 'Gujarat',
    district: 'Bharuch',
    agency: 'DFCCIL',
    progressPct: 74,
    expectedCompletion: 'Jan 2027',
    predictedCompletion: 'Feb 2027',
    delayFormatted: '+1 month',
    riskScore: 71,
    riskLevel: 'HIGH',
    mainBottleneck: 'Industrial Estate Resettlement & Canal RoW Clearance',
    reasons: [
      'GIDC estate boundary dispute on parcel G-441',
      'Pending utility pipeline shifting NOCs'
    ],
    bottleneckBreakdown: {
      disputes: 22,
      compensation: 28,
      verification: 18,
      rr: 22,
      other: 10
    },
    recommendedAction: 'Escalate to State Level Apex Committee for inter-agency clearance coordination.'
  },
  {
    rank: 5,
    id: 'PRJ-049',
    name: 'Mineral Logistics Expressway',
    state: 'Odisha',
    district: 'Sundargarh',
    agency: 'Odisha Mining Corporation / NHAI',
    progressPct: 54,
    expectedCompletion: 'May 2027',
    predictedCompletion: 'Aug 2027',
    delayFormatted: '+3 months',
    riskScore: 86,
    riskLevel: 'HIGH',
    mainBottleneck: 'Tribal Land Rights (FRA) & Gram Sabha Resolutions',
    reasons: [
      'Schedule V Gram Sabha quorum pending in 7 tribal hamlets',
      'Discrepancy in forest rights claims under Section 4(e)'
    ],
    bottleneckBreakdown: {
      disputes: 42,
      compensation: 18,
      verification: 20,
      rr: 15,
      other: 5
    },
    recommendedAction: 'Execute transparent Gram Sabha consultation with District Collector and Tribal Welfare representative.'
  },
  {
    rank: 6,
    id: 'PRJ-062',
    name: 'Multi-Modal Logistics Park (MMLP)',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    agency: 'National Highways Logistics Management (NHLML)',
    progressPct: 65,
    expectedCompletion: 'Feb 2027',
    predictedCompletion: 'April 2027',
    delayFormatted: '+2 months',
    riskScore: 78,
    riskLevel: 'HIGH',
    mainBottleneck: 'Multiple Land Title Claims & Joint Family Disputes',
    reasons: [
      'Unpartitioned ancestral properties in 3 revenue villages',
      'Court stay on 19 parcels regarding solatium apportionment'
    ],
    bottleneckBreakdown: {
      disputes: 38,
      compensation: 24,
      verification: 22,
      rr: 10,
      other: 6
    },
    recommendedAction: 'Convene Lok Adalat settlement bench for rapid intra-family apportionment consensus.'
  },
  {
    rank: 7,
    id: 'PRJ-077',
    name: 'Green Energy Corridor Transmission Line',
    state: 'Rajasthan',
    district: 'Jodhpur',
    agency: 'PGCIL',
    progressPct: 58,
    expectedCompletion: 'Oct 2026',
    predictedCompletion: 'Dec 2026',
    delayFormatted: '+2 months',
    riskScore: 81,
    riskLevel: 'HIGH',
    mainBottleneck: 'Tower Footing Land Acquisition & Crop Compensation Rates',
    reasons: [
      'Farmer associations demanding revision of per-tree solatium',
      'Section 23 award determination objections'
    ],
    bottleneckBreakdown: {
      disputes: 32,
      compensation: 36,
      verification: 16,
      rr: 8,
      other: 8
    },
    recommendedAction: 'Issue standardized revenue norms for transmission tower right-of-way solatium.'
  },
  {
    rank: 8,
    id: 'PRJ-083',
    name: 'Coastal Highway Ring Bypass',
    state: 'Maharashtra',
    district: 'Raigad',
    agency: 'MSRDC',
    progressPct: 69,
    expectedCompletion: 'April 2027',
    predictedCompletion: 'May 2027',
    delayFormatted: '+1 month',
    riskScore: 75,
    riskLevel: 'HIGH',
    mainBottleneck: 'Mangrove Buffer Clarification & Wetland Mapping',
    reasons: [
      'CRZ zone boundaries need geo-referencing update with state remote sensing center',
      '8 compensation awards on hold'
    ],
    bottleneckBreakdown: {
      disputes: 24,
      compensation: 26,
      verification: 30,
      rr: 12,
      other: 8
    },
    recommendedAction: 'Obtain expedited state coastal management clearance using drone geo-orthomosaics.'
  },
  {
    rank: 9,
    id: 'PRJ-091',
    name: 'High-Speed Rail Terminal Access Spur',
    state: 'Gujarat',
    district: 'Surat',
    agency: 'NHSRCL',
    progressPct: 76,
    expectedCompletion: 'Aug 2026',
    predictedCompletion: 'Sept 2026',
    delayFormatted: '+3 weeks',
    riskScore: 72,
    riskLevel: 'HIGH',
    mainBottleneck: 'Urban Commercial Plot Re-alignments & Compensation Valuation',
    reasons: [
      'Commercial tenant rehabilitation claims pending',
      'Survey alignment adjustments near municipality junction'
    ],
    bottleneckBreakdown: {
      disputes: 26,
      compensation: 34,
      verification: 18,
      rr: 16,
      other: 6
    },
    recommendedAction: 'Finalize urban tenant resettlement package in accordance with Section 31(2).'
  },
  {
    rank: 10,
    id: 'PRJ-105',
    name: 'Defence Industrial Node Expansion',
    state: 'Tamil Nadu',
    district: 'Salem',
    agency: 'TIDCO',
    progressPct: 63,
    expectedCompletion: 'March 2027',
    predictedCompletion: 'May 2027',
    delayFormatted: '+2 months',
    riskScore: 77,
    riskLevel: 'HIGH',
    mainBottleneck: 'Water Body Buffer Verification & Village Common Land (Poramboke)',
    reasons: [
      'Classification dispute between private Patta and government Poramboke',
      'Objections filed under Section 15(1)'
    ],
    bottleneckBreakdown: {
      disputes: 36,
      compensation: 22,
      verification: 26,
      rr: 10,
      other: 6
    },
    recommendedAction: 'Direct District Revenue Officer to finalize village settlement register verification.'
  },
  {
    rank: 11,
    id: 'PRJ-118',
    name: 'Inland Port Inter-Connectivity Corridor',
    state: 'Odisha',
    district: 'Angul',
    agency: 'Inland Waterways Authority / IDCO',
    progressPct: 59,
    expectedCompletion: 'June 2027',
    predictedCompletion: 'Aug 2027',
    delayFormatted: '+2 months',
    riskScore: 83,
    riskLevel: 'HIGH',
    mainBottleneck: 'Displacement of Fishing Communities & Livelihood Grants',
    reasons: [
      'R&R scheme dispute regarding non-land titleholder rehabilitation',
      'Pending Section 16 administrator review'
    ],
    bottleneckBreakdown: {
      disputes: 28,
      compensation: 24,
      verification: 14,
      rr: 28,
      other: 6
    },
    recommendedAction: 'Accelerate livelihood restoration grants disbursement under First Schedule parameters.'
  },
  {
    rank: 12,
    id: 'PRJ-126',
    name: 'National Highway Ring Road Peripheral Section',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    agency: 'NHAI',
    progressPct: 66,
    expectedCompletion: 'Dec 2026',
    predictedCompletion: 'Jan 2027',
    delayFormatted: '+1 month',
    riskScore: 73,
    riskLevel: 'HIGH',
    mainBottleneck: 'Guidance Value vs Market Value Solatium Discrepancies',
    reasons: [
      'Landowners demanding 2026 revised guidance value adoption',
      '42 writ petitions pending in High Court of Karnataka'
    ],
    bottleneckBreakdown: {
      disputes: 40,
      compensation: 32,
      verification: 16,
      rr: 6,
      other: 6
    },
    recommendedAction: 'Engage government special counsel to seek early vacation of interim status quo orders.'
  },
  {
    rank: 13,
    id: 'PRJ-139',
    name: 'Metro Rail Phase-III Depot & Alignment',
    state: 'Maharashtra',
    district: 'Pune',
    agency: 'Maha-Metro',
    progressPct: 71,
    expectedCompletion: 'July 2027',
    predictedCompletion: 'Aug 2027',
    delayFormatted: '+1 month',
    riskScore: 76,
    riskLevel: 'HIGH',
    mainBottleneck: 'Institutional Land Transfer from Agriculture College',
    reasons: [
      'Inter-departmental lease alienation awaiting state cabinet approval',
      'Compensation offset mechanism dispute'
    ],
    bottleneckBreakdown: {
      disputes: 20,
      compensation: 30,
      verification: 32,
      rr: 10,
      other: 8
    },
    recommendedAction: 'Convene State Empowered Committee to execute inter-departmental book transfer.'
  },
  {
    rank: 14,
    id: 'PRJ-144',
    name: 'Petroleum Hub Feeder Pipeline',
    state: 'Gujarat',
    district: 'Vadodara',
    agency: 'IOCL / GSPL',
    progressPct: 70,
    expectedCompletion: 'Nov 2026',
    predictedCompletion: 'Dec 2026',
    delayFormatted: '+3 weeks',
    riskScore: 70,
    riskLevel: 'HIGH',
    mainBottleneck: 'Underground RoU (Right of User) Pipeline Solatium Calculation',
    reasons: [
      'Objections over crop damage estimation in seasonal fertile belt',
      'Competent authority hearing schedules backlog'
    ],
    bottleneckBreakdown: {
      disputes: 24,
      compensation: 38,
      verification: 20,
      rr: 10,
      other: 8
    },
    recommendedAction: 'Harmonize PMP Act rules with RFCTLARR solatium standard for underground pipelines.'
  },
  {
    rank: 15,
    id: 'PRJ-153',
    name: 'Thermal Power Evacuation Corridor',
    state: 'Uttar Pradesh',
    district: 'Prayagraj',
    agency: 'UPPCL / NTPC',
    progressPct: 62,
    expectedCompletion: 'Jan 2027',
    predictedCompletion: 'March 2027',
    delayFormatted: '+2 months',
    riskScore: 79,
    riskLevel: 'HIGH',
    mainBottleneck: 'Substation Land Transfer & Gram Sabha Common Land',
    reasons: [
      'Gram Panchayat resolution quashed by local court over pasturage rights',
      'Alternate grazing land proposal under review'
    ],
    bottleneckBreakdown: {
      disputes: 35,
      compensation: 20,
      verification: 25,
      rr: 12,
      other: 8
    },
    recommendedAction: 'Notify equivalent revenue land for compensatory pasture allotment in Tehsil registry.'
  },
  {
    rank: 16,
    id: 'PRJ-167',
    name: 'Agro-Processing Mega Cluster Link',
    state: 'Rajasthan',
    district: 'Bhilwara',
    agency: 'RIICO',
    progressPct: 55,
    expectedCompletion: 'April 2027',
    predictedCompletion: 'June 2027',
    delayFormatted: '+2 months',
    riskScore: 82,
    riskLevel: 'HIGH',
    mainBottleneck: 'Pasture Land Conversion & Animal Husbandry NOCs',
    reasons: [
      'Pending de-reservation of Siway Chak (government waste land)',
      'Delayed Section 19 declaration'
    ],
    bottleneckBreakdown: {
      disputes: 30,
      compensation: 25,
      verification: 30,
      rr: 8,
      other: 7
    },
    recommendedAction: 'Direct District Collector to expedite de-reservation file with Revenue Board.'
  },
  {
    rank: 17,
    id: 'PRJ-172',
    name: 'Special Economic Zone Expressway Corridor',
    state: 'Tamil Nadu',
    district: 'Kanchipuram',
    agency: 'SIPCOT',
    progressPct: 67,
    expectedCompletion: 'Feb 2027',
    predictedCompletion: 'March 2027',
    delayFormatted: '+1 month',
    riskScore: 72,
    riskLevel: 'HIGH',
    mainBottleneck: 'Survey Number Bifurcation & Missing Title Deeds',
    reasons: [
      'Sub-division survey pending for 31 fragmented parcels',
      'Heirship certificates awaited from Taluk office'
    ],
    bottleneckBreakdown: {
      disputes: 28,
      compensation: 22,
      verification: 34,
      rr: 10,
      other: 6
    },
    recommendedAction: 'Organize Special Revenue Camp in Sriperumbudur Taluka for instant heir certificate issuance.'
  },
  {
    rank: 18,
    id: 'PRJ-180',
    name: 'Steel Logistics Rail Link Feeder',
    state: 'Odisha',
    district: 'Keonjhar',
    agency: 'East Coast Railway / IDCO',
    progressPct: 58,
    expectedCompletion: 'May 2027',
    predictedCompletion: 'July 2027',
    delayFormatted: '+2 months',
    riskScore: 84,
    riskLevel: 'HIGH',
    mainBottleneck: 'Forest Rights Title Verification & Mining Corridor Overlap',
    reasons: [
      'Overlapping non-coal mining lease boundaries',
      'Stage-II Forest clearance compliance queries from MoEFCC'
    ],
    bottleneckBreakdown: {
      disputes: 36,
      compensation: 22,
      verification: 24,
      rr: 12,
      other: 6
    },
    recommendedAction: 'Submit joint GIS boundary verification to MoEFCC Regional Office for swift Stage-II sign-off.'
  }
];

export const WHY_PROJECT_AT_RISK = {
  projectCode: 'PRJ-001',
  projectName: 'Mumbai-Goa Railway Double Track Line',
  state: 'Maharashtra',
  district: 'Ratnagiri',
  riskScore: 82,
  riskDenominator: 100,
  riskLevel: 'HIGH RISK',
  riskBadge: 'error',
  bottlenecksSummary: 'Land disputes, Compensation delay, R&R pending',
  factors: [
    { factor: 'Ownership Disputes', percentage: 35, count: '27 disputed parcels', color: '#BA1A1A', description: 'Civil title disputes & pending court stays under Section 64 reference' },
    { factor: 'Compensation Delay', percentage: 25, count: '18 compensation cases pending', color: '#F2A93B', description: 'Solatium apportionment verification & escrow release delays' },
    { factor: 'Verification Issues', percentage: 20, count: '11 verification cases pending', color: '#3B82F6', description: 'Discrepancy between 7/12 extract and ground cadastral boundary' },
    { factor: 'R&R Delay', percentage: 12, count: '9 R&R cases pending', color: '#8B5CF6', description: 'Alternate homestead plot allocation consensus pending in Mirya colony' },
    { factor: 'Other Factors', percentage: 8, count: 'Panchayat & Forest NOCs', color: '#64748B', description: 'Statutory environmental clearing in coastal CRZ buffer' }
  ],
  verifiedBreakdown: {
    totalParcels: 342,
    disputedParcels: 27,
    compensationPendingCases: 18,
    verificationPendingCases: 11,
    rrPendingCases: 9,
    possessionPendingPct: 28
  },
  timelinePrediction: {
    scheduledCompletion: 'March 2027',
    predictedCompletion: 'April 2027',
    slippage: '+1 month',
    confidenceScore: '91% (Rule-Based Prediction Engine)'
  },
  recommendedAction: 'Prioritize legal/revenue verification for disputed parcels and monitor compensation clearance.',
  systemLogicPath: [
    { step: '1. VERIFIED DATA', detail: 'Integrated 7/12 RoR, PFMS Escrow, and CALA hearing records for PRJ-001.' },
    { step: '2. ANALYSIS', detail: 'Cross-matched survey polygons against Section 15 objection registry.' },
    { step: '3. RISK SCORE', detail: 'Composite risk calculated at 82/100 (Threshold >70 = Critical High Risk).' },
    { step: '4. BOTTLENECK', detail: '35% dispute weightage concentrated across 27 Ratnagiri parcels.' },
    { step: '5. PREDICTION', detail: 'Historical workflow velocity indicates scheduled March 2027 will slip to April 2027 (+1 mo).' },
    { step: '6. RECOMMENDED ACTION', detail: 'Prioritize legal/revenue verification for disputed parcels and monitor compensation clearance.' }
  ]
};

export const POLICY_INSIGHTS = [
  {
    id: 'POLICY-01',
    number: '01',
    title: 'Land acquisition is taking longer in districts with high dispute rates',
    headline: 'High dispute concentration adds an average of 8 months to project lifecycles.',
    evidence: 'In districts with >25 unresolved land disputes, average completion duration is 19 months, compared to 11 months in districts with low dispute volume (<10 disputes).',
    supportingData: [
      { label: 'High-Dispute Districts Average', value: '19 Months', color: 'text-error' },
      { label: 'Low-Dispute Districts Average', value: '11 Months', color: 'text-govEmerald' },
      { label: 'Net Administrative Slippage', value: '+8 Months', color: 'text-amber-600' }
    ],
    impact: 'Compounding delay causes infrastructure project cost escalation averaging ₹42 Cr per major corridor.',
    policyAction: 'Standardize digital fast-track revenue reconciliation benches at the District CALA level for projects exceeding 20 disputed parcels.',
    category: 'Judicial & Revenue Reconciliation'
  },
  {
    id: 'POLICY-02',
    number: '02',
    title: 'Compensation processing is the biggest bottleneck in 32% of delayed projects',
    headline: 'Disbursement lag beyond 60 days after award declaration directly stalls possession.',
    evidence: '32% of delayed national projects have approved statutory awards where compensation funds remain undisbursed beyond the defined statutory 60-day PFMS window.',
    supportingData: [
      { label: 'Delayed Projects Analyzed', value: '18 Projects', color: 'text-govSlate-900' },
      { label: 'Driven by Compensation Bottleneck', value: '32%', color: 'text-error' },
      { label: 'National Compensation Pending', value: '₹340 Cr', color: 'text-amber-600' }
    ],
    impact: 'Section 38 legally prohibits taking physical possession until 100% of assessed compensation is deposited into landowner bank accounts or reference escrow.',
    policyAction: 'Mandate automated escrow-to-DBT integration with real-time treasury webhook alerts for CALA authorities.',
    category: 'Financial Flow & DBT'
  },
  {
    id: 'POLICY-03',
    number: '03',
    title: 'Projects with incomplete land-record verification show significantly higher delay risk',
    headline: 'Inadequate pre-notification verification correlates with a 3.4x surge in Section 15 objections.',
    evidence: 'Corridors where pre-notification 5-pillar digital verification was skipped show a 78% dispute correlation, triggering repeated public hearings and gazette amendments.',
    supportingData: [
      { label: 'Dispute Correlation', value: '78%', color: 'text-error' },
      { label: 'Section 15 Hearing Spikes', value: '3.4x Higher', color: 'text-amber-600' },
      { label: 'Digital Verification Benchmark', value: '5 Pillars', color: 'text-govEmerald' }
    ],
    impact: 'Section 19 declaration is delayed by an average of 4.2 months when title chains have unverified mutation entries.',
    policyAction: 'Mandate digital 5-pillar cadastral verification (RoR, Registry, Mutation, Spatial Map, Encumbrance) before Section 11 preliminary notification issuance.',
    category: 'Land Records & Cadastre'
  },
  {
    id: 'POLICY-04',
    number: '04',
    title: 'R&R implementation is lagging behind compensation disbursement in several high-risk districts',
    headline: 'Physical resettlement progress lags financial payout by up to 24 percentage points.',
    evidence: 'In 5 high-risk states, financial compensation has reached an average of 85% disbursement, while physical R&R housing allotment and amenity delivery stands at only 61%.',
    supportingData: [
      { label: 'Compensation Disbursed (5 States)', value: '85%', color: 'text-govEmerald' },
      { label: 'R&R Housing Handover', value: '61%', color: 'text-error' },
      { label: 'Implementation Divergence', value: '24% Lag', color: 'text-amber-600' }
    ],
    impact: 'Affected families refuse site clearance, resulting in contractor demobilization and legal stay injunctions.',
    policyAction: 'Link final award notifications to concurrent R&R colony infrastructure development milestones to ensure parallel delivery.',
    category: 'Rehabilitation & Resettlement'
  }
];

export const NATIONAL_ALERTS = [
  {
    id: 'ALT-01',
    severity: 'critical',
    badge: 'HIGH RISK',
    icon: 'warning',
    text: '18 projects predicted to miss their statutory completion deadlines across 7 states.',
    subtext: 'Algorithmic delay projection shows cumulative delay of 1 to 3 months.',
    targetTab: 'predictions',
    actionLabel: 'View Predictive Analysis'
  },
  {
    id: 'ALT-02',
    severity: 'critical',
    badge: 'HIGH RISK',
    icon: 'map',
    text: '7 states currently have high-risk infrastructure corridors requiring Central intervention.',
    subtext: 'Rajasthan (5), Odisha (4), Maharashtra (3), and Karnataka (3) top the risk index.',
    targetTab: 'comparison',
    actionLabel: 'View State Comparison'
  },
  {
    id: 'ALT-03',
    severity: 'warning',
    badge: 'ATTENTION',
    icon: 'payments',
    text: '32% of delayed projects show severe compensation disbursement bottlenecks.',
    subtext: '₹340 Cr in approved compensation awaiting direct benefit transfer or escrow release.',
    targetTab: 'compensation',
    actionLabel: 'View Compensation Audit'
  },
  {
    id: 'ALT-04',
    severity: 'warning',
    badge: 'ATTENTION',
    icon: 'gavel',
    text: '214 parcels have unresolved title disputes in Maharashtra revenue divisions.',
    subtext: 'Concentrated heavily in Konkan division (Ratnagiri: 32 cases) and Thane (68 cases).',
    targetTab: 'gis',
    actionLabel: 'Drill Down in GIS'
  },
  {
    id: 'ALT-05',
    severity: 'warning',
    badge: 'ATTENTION',
    icon: 'home_work',
    text: 'R&R completion is below 65% in Rajasthan and Odisha corridors.',
    subtext: 'Section 38 possession cannot be legally certified until alternate housing is physically delivered.',
    targetTab: 'rr',
    actionLabel: 'View R&R Monitoring'
  }
];

export const TIMELINE_PERFORMANCE = {
  onSchedulePct: 74,
  delayedPct: 26,
  averageAcquisitionMonths: 15.1,
  stageDurations: [
    { stage: 'Notification to Award (Sec 11 to Sec 23)', durationMonths: 7.2, targetMonths: 6.0, status: 'attention' },
    { stage: 'Award to Compensation (Sec 23 to Sec 30)', durationMonths: 3.1, targetMonths: 2.0, status: 'attention' },
    { stage: 'Compensation to Possession (Sec 30 to Sec 38)', durationMonths: 4.8, targetMonths: 3.5, status: 'delayed' },
    { stage: 'Overall End-to-End Cycle', durationMonths: 15.1, targetMonths: 11.5, status: 'delayed' }
  ]
};

export const NATIONAL_REPORTS = [
  {
    id: 'REP-01',
    code: 'GOI-NLAMS-2026-Q3',
    title: 'National Land Acquisition Comprehensive Progress Report',
    date: '10 Sep 2026',
    scope: 'All-India (184 Projects)',
    format: 'PDF / GeoJSON Dossier',
    pages: 28,
    status: 'Certified'
  },
  {
    id: 'REP-02',
    code: 'GOI-RISK-2026-SEP',
    title: 'Inter-State Risk Benchmark & Delay Prediction Dossier',
    date: '10 Sep 2026',
    scope: 'Top 7 High-Risk States (18 Projects)',
    format: 'Executive Decision Brief',
    pages: 16,
    status: 'Actionable'
  },
  {
    id: 'REP-03',
    code: 'GOI-COMP-2026-AUD',
    title: 'Direct Benefit Transfer (DBT) & Escrow Disbursal Audit',
    date: '09 Sep 2026',
    scope: 'Financial Flow (₹8,420 Cr Disbursed)',
    format: 'Financial Compliance Matrix',
    pages: 22,
    status: 'Verified'
  },
  {
    id: 'REP-04',
    code: 'GOI-RNR-2026-M4',
    title: 'Statutory R&R Compliance & Resettlement Tracking Brief',
    date: '08 Sep 2026',
    scope: '42,850 Affected Families (Sec 31-38)',
    format: 'Social Impact Dossier',
    pages: 19,
    status: 'Certified'
  },
  {
    id: 'REP-05',
    code: 'GOI-DISP-2026-LEG',
    title: 'Section 15 Objections & Title Dispute Resolution Matrix',
    date: '06 Sep 2026',
    scope: '1,329 Active Cadastral Disputes',
    format: 'Legal Bench Summary',
    pages: 14,
    status: 'Under Review'
  }
];

export const PARCEL_P103_READONLY = {
  id: 'P103',
  surveyNumber: 'SRV-103',
  khasraNumber: '103/1A',
  state: 'Maharashtra',
  district: 'Ratnagiri',
  taluka: 'Ratnagiri',
  village: 'Shirgaon',
  projectId: 'PRJ-001',
  projectName: 'Mumbai-Goa Railway Double Track Line',
  areaHa: 2.45,
  landType: 'Agricultural (Horticulture - Alphonso Mango Orchard)',
  status: 'disputed',
  statusLabel: 'Disputed (Civil Title Suit)',
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
    paymentStage: 'Escrow Frozen (Court Dispute Reference)',
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
    status: 'pending',
    handoverDate: 'Tentative Oct 2026',
    noticeIssued: true,
    policeAssistanceRequired: false,
    remarks: 'Possession stayed pending court determination of title apportionments under Section 64.'
  }
};
