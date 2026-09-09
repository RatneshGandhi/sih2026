const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('[SEED] Starting realistic data seed for NLAMS...');

    await client.query('BEGIN');

    // Clean existing tables in reverse dependency order
    await client.query('TRUNCATE notifications, activity_log, documents, compensation, land_parcels, projects, users RESTART IDENTITY CASCADE;');

    // 1. SEED 5 USERS (One per role with memorable passwords)
    const saltRounds = 10;
    const usersData = [
      {
        name: 'Ramesh Patel (Citizen / Landowner)',
        email: 'citizen@nlams.gov.in',
        password: 'citizen123',
        role: 'citizen',
        state: 'Maharashtra',
        district: 'Palghar',
        designation: 'Khatedar / Landowner',
        department: 'Public / Beneficiary'
      },
      {
        name: 'Anil Deshmukh (Field Surveyor)',
        email: 'field@nlams.gov.in',
        password: 'field123',
        role: 'field_officer',
        state: 'Maharashtra',
        district: 'Palghar',
        designation: 'Cadastral Surveyor Grade-I',
        department: 'District Land Records'
      },
      {
        name: 'Dr. Rajesh Sharma, IAS (District Collector)',
        email: 'district@nlams.gov.in',
        password: 'district123',
        role: 'district_official',
        state: 'Maharashtra',
        district: 'Palghar',
        designation: 'District Magistrate & CALA',
        department: 'Revenue & Disaster Management'
      },
      {
        name: 'Sunita Meena, IAS (State Revenue Secretary)',
        email: 'state@nlams.gov.in',
        password: 'state123',
        role: 'state_official',
        state: 'Maharashtra',
        district: 'Mumbai Sub',
        designation: 'Principal Secretary (Revenue)',
        department: 'State Land Acquisition Directorate'
      },
      {
        name: 'Shri R. K. Verma, IAS (Joint Secretary)',
        email: 'ministry@nlams.gov.in',
        password: 'ministry123',
        role: 'ministry_official',
        state: 'National Capital Territory',
        district: 'New Delhi',
        designation: 'Joint Secretary (Land Resources)',
        department: 'Ministry of Rural Development (MoRD)'
      }
    ];

    const userRows = [];
    for (const u of usersData) {
      const hash = await bcrypt.hash(u.password, saltRounds);
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, state, district, designation, department)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role;`,
        [u.name, u.email, hash, u.role, u.state, u.district, u.designation, u.department]
      );
      userRows.push(res.rows[0]);
    }
    console.log(`[SEED] Inserted ${userRows.length} users with memorable credentials.`);

    // 2. SEED 9 REALISTIC PROJECTS ACROSS 4 STATES & ALL 7 WORKFLOW STAGES
    const projectsData = [
      {
        name: 'NH-48 Western Freight Spur & Multi-Modal Logistics Hub',
        code: 'PROP-2025-MH-0891',
        type: 'highway',
        requesting_body: 'National Highways Authority of India (NHAI)',
        state: 'Maharashtra',
        district: 'Palghar',
        status: 'district_scrutiny', // Stage 3
        completion: '2027-03-31',
        budget: 842.60,
        desc: 'Widening of NH-48 freight corridor with grade separators and truck terminal to decongest JNPT connectivity.'
      },
      {
        name: 'Delhi-Varanasi High Speed Rail Corridor (Bullet Train)',
        code: 'PROP-2025-UP-0412',
        type: 'railway',
        requesting_body: 'National High Speed Rail Corporation Ltd (NHSRCL)',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        status: 'state_approval', // Stage 4
        completion: '2028-12-15',
        budget: 1450.00,
        desc: 'Dedicated 350 km/h elevated track alignment passing through eastern agricultural tracts.'
      },
      {
        name: 'Dholera Special Investment Region Phase-2 Logistics Trunk',
        code: 'PROP-2025-GJ-0104',
        type: 'industrial_corridor',
        requesting_body: 'Delhi-Mumbai Industrial Corridor Dev Corp (DMICDC)',
        state: 'Gujarat',
        district: 'Ahmedabad',
        status: 'possession_taken', // Stage 7
        completion: '2026-10-30',
        budget: 620.40,
        desc: 'Smart city industrial enclave connectivity to expressway network and sea terminals.'
      },
      {
        name: 'Upper Bhadra Lift Irrigation Canal Network',
        code: 'PROP-2025-KA-0782',
        type: 'irrigation',
        requesting_body: 'Karnataka Neeravari Nigam Limited (KNNL)',
        state: 'Karnataka',
        district: 'Chitradurga',
        status: 'award_declared', // Stage 5
        completion: '2027-06-30',
        budget: 395.20,
        desc: 'Distributary pipeline and open feeder canals serving drought-prone talukas.'
      },
      {
        name: 'Bengaluru Peripheral Ring Road Corridor (PRR Pkg 3)',
        code: 'PROP-2025-KA-1120',
        type: 'urban_development',
        requesting_body: 'Bangalore Development Authority (BDA)',
        state: 'Karnataka',
        district: 'Bengaluru Rural',
        status: 'compensation_disbursed', // Stage 6
        completion: '2027-09-15',
        budget: 1180.00,
        desc: '100m wide right-of-way ring corridor easing transit between Hosur Road and Tumkur Road.'
      },
      {
        name: 'Pavagada Solar Park Expansion (Zone-C 500MW)',
        code: 'PROP-2025-KA-0941',
        type: 'renewable_energy',
        requesting_body: 'Karnataka Solar Power Dev Corp (KSPDCL)',
        state: 'Karnataka',
        district: 'Tumakuru',
        status: 'proposal_submitted', // Stage 1
        completion: '2026-12-31',
        budget: 280.00,
        desc: 'Aggregating semi-arid dry land parcels on 25-year statutory lease framework.'
      },
      {
        name: 'Pune-Nashik Semi-High Speed Double Rail Line',
        code: 'PROP-2025-MH-1055',
        type: 'railway',
        requesting_body: 'Maharashtra Rail Infrastructure Dev Corp (Maharail)',
        state: 'Maharashtra',
        district: 'Pune',
        status: 'document_verification', // Stage 2
        completion: '2028-04-30',
        budget: 960.00,
        desc: 'Strategic agricultural transport corridor facilitating rapid fruit and perishable freight transit.'
      },
      {
        name: 'Jewar Noida International Airport Cargo Link Expressway',
        code: 'PROP-2025-UP-0881',
        type: 'highway',
        requesting_body: 'Yamuna Expressway Industrial Dev Authority (YEIDA)',
        state: 'Uttar Pradesh',
        district: 'Gautam Buddha Nagar',
        status: 'possession_taken', // Stage 7
        completion: '2026-08-31',
        budget: 710.00,
        desc: 'Multi-lane grade separated spur connecting Eastern Peripheral Expressway to Jewar cargo terminals.'
      },
      {
        name: 'Bhopal Green Energy Industrial Corridor & Battery Giga-Hub',
        code: 'PROP-2025-MP-0331',
        type: 'industrial_corridor',
        requesting_body: 'MP Industrial Development Corporation (MPIDC)',
        state: 'Madhya Pradesh',
        district: 'Bhopal',
        status: 'district_scrutiny', // Stage 3
        completion: '2027-11-30',
        budget: 540.00,
        desc: 'Clean energy manufacturing mega-cluster along Berasia highway spur.'
      }
    ];

    const projectRows = [];
    for (const p of projectsData) {
      const res = await client.query(
        `INSERT INTO projects (name, project_code, project_type, requesting_body, state, district, status, target_completion_date, estimated_budget_cr, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, status, state, district;`,
        [p.name, p.code, p.type, p.requesting_body, p.state, p.district, p.status, p.completion, p.budget, p.desc]
      );
      projectRows.push(res.rows[0]);
    }
    console.log(`[SEED] Inserted ${projectRows.length} projects spanning 4 states and all 7 workflow stages.`);

    // 3. SEED 18 LAND PARCELS WITH REAL-LOOKING POLYGONS (Pune, NCR, Bengaluru, Bhopal, Palghar)
    // GeoJSON Polygon: coordinates: [[[lng, lat], [lng, lat], ... [lng, lat]]]
    const parcelsData = [
      // Palghar / Maharashtra (linked to project 1: NH-48)
      {
        projectIndex: 0,
        survey: 'SY-104/2B',
        village: 'Vangaon',
        area: 4.8520,
        owner: 'Ramesh Patel & Brothers',
        aadhaar: 'XXXX-XXXX-9182',
        status: 'possession_taken',
        type: 'agricultural',
        coords: [
          [72.7450, 19.8820],
          [72.7485, 19.8835],
          [72.7490, 19.8795],
          [72.7445, 19.8785],
          [72.7450, 19.8820]
        ]
      },
      {
        projectIndex: 0,
        survey: 'SY-105/1A',
        village: 'Vangaon',
        area: 3.1200,
        owner: 'Savitribai Ganpat More',
        aadhaar: 'XXXX-XXXX-4421',
        status: 'acquired',
        type: 'agricultural',
        coords: [
          [72.7495, 19.8838],
          [72.7530, 19.8850],
          [72.7535, 19.8810],
          [72.7492, 19.8800],
          [72.7495, 19.8838]
        ]
      },
      {
        projectIndex: 0,
        survey: 'SY-108/3',
        village: 'Talasari',
        area: 6.4500,
        owner: 'Murlidhar Somnath Koli',
        aadhaar: 'XXXX-XXXX-1109',
        status: 'disputed',
        type: 'horticultural',
        coords: [
          [72.7540, 19.8855],
          [72.7580, 19.8870],
          [72.7590, 19.8825],
          [72.7542, 19.8815],
          [72.7540, 19.8855]
        ]
      },
      {
        projectIndex: 0,
        survey: 'SY-112/4',
        village: 'Dahanu Road',
        area: 2.8900,
        owner: 'Prakash Mahadev Vartak',
        aadhaar: 'XXXX-XXXX-7320',
        status: 'notified',
        type: 'commercial_strip',
        coords: [
          [72.7380, 19.8750],
          [72.7415, 19.8765],
          [72.7420, 19.8730],
          [72.7382, 19.8720],
          [72.7380, 19.8750]
        ]
      },

      // Pune / Maharashtra (linked to project 7: Pune-Nashik Rail)
      {
        projectIndex: 6,
        survey: 'GAT-342/1',
        village: 'Chakan',
        area: 5.6000,
        owner: 'Dattatray Babanrao Gawade',
        aadhaar: 'XXXX-XXXX-8821',
        status: 'notified',
        type: 'agricultural',
        coords: [
          [73.8500, 18.7550],
          [73.8545, 18.7570],
          [73.8550, 18.7525],
          [73.8502, 18.7510],
          [73.8500, 18.7550]
        ]
      },
      {
        projectIndex: 6,
        survey: 'GAT-344/2A',
        village: 'Khed-Rajgurunagar',
        area: 8.2100,
        owner: 'Pandurang Tukaram Shinde',
        aadhaar: 'XXXX-XXXX-3312',
        status: 'acquired',
        type: 'agricultural',
        coords: [
          [73.8560, 18.7580],
          [73.8610, 18.7600],
          [73.8620, 18.7550],
          [73.8565, 18.7535],
          [73.8560, 18.7580]
        ]
      },

      // Uttar Pradesh / Varanasi (linked to project 2: Bullet Train)
      {
        projectIndex: 1,
        survey: 'KHASRA-892',
        village: 'Rohaniya',
        area: 7.1500,
        owner: 'Kamal Kishore Upadhyay',
        aadhaar: 'XXXX-XXXX-5529',
        status: 'possession_taken',
        type: 'agricultural',
        coords: [
          [82.9350, 25.2850],
          [82.9400, 25.2870],
          [82.9410, 25.2825],
          [82.9355, 25.2810],
          [82.9350, 25.2850]
        ]
      },
      {
        projectIndex: 1,
        survey: 'KHASRA-905',
        village: 'Mirzamurad',
        area: 4.3000,
        owner: 'Ram Prasad Bind',
        aadhaar: 'XXXX-XXXX-9901',
        status: 'disputed',
        type: 'agricultural',
        coords: [
          [82.9420, 25.2880],
          [82.9465, 25.2900],
          [82.9470, 25.2855],
          [82.9422, 25.2840],
          [82.9420, 25.2880]
        ]
      },

      // Gujarat / Dholera (linked to project 3: Dholera Industrial)
      {
        projectIndex: 2,
        survey: 'REV-BLOCK-58',
        village: 'Bhangadh',
        area: 12.8000,
        owner: 'Govindbhai Mavjibhai Gohil',
        aadhaar: 'XXXX-XXXX-6744',
        status: 'possession_taken',
        type: 'non_agricultural',
        coords: [
          [72.1900, 22.2450],
          [72.1960, 22.2475],
          [72.1970, 22.2415],
          [72.1905, 22.2395],
          [72.1900, 22.2450]
        ]
      },
      {
        projectIndex: 2,
        survey: 'REV-BLOCK-62',
        village: 'Kadipur',
        area: 9.4500,
        owner: 'Jayeshbhai Somabhai Zala',
        aadhaar: 'XXXX-XXXX-1238',
        status: 'possession_taken',
        type: 'non_agricultural',
        coords: [
          [72.1980, 22.2480],
          [72.2035, 22.2505],
          [72.2045, 22.2445],
          [72.1985, 22.2425],
          [72.1980, 22.2480]
        ]
      },

      // Bengaluru Rural / Karnataka (linked to project 5: PRR Corridor)
      {
        projectIndex: 4,
        survey: 'SY-42/1P',
        village: 'Hosakote Rural',
        area: 3.7500,
        owner: 'Muniyappa K. & Sons',
        aadhaar: 'XXXX-XXXX-7811',
        status: 'possession_taken',
        type: 'semi_urban',
        coords: [
          [77.7950, 13.0720],
          [77.7990, 13.0740],
          [77.7995, 13.0695],
          [77.7952, 13.0680],
          [77.7950, 13.0720]
        ]
      },
      {
        projectIndex: 4,
        survey: 'SY-43/3',
        village: 'Hosakote Rural',
        area: 4.1500,
        owner: 'Laxmamma Venkataramanappa',
        aadhaar: 'XXXX-XXXX-9023',
        status: 'acquired',
        type: 'agricultural',
        coords: [
          [77.8005, 13.0745],
          [77.8045, 13.0765],
          [77.8050, 13.0720],
          [77.8008, 13.0705],
          [77.8005, 13.0745]
        ]
      },
      {
        projectIndex: 4,
        survey: 'SY-48/2',
        village: 'Devanagundi',
        area: 2.9200,
        owner: 'Channappa Gowda',
        aadhaar: 'XXXX-XXXX-4566',
        status: 'acquired',
        type: 'horticultural',
        coords: [
          [77.8060, 13.0770],
          [77.8100, 13.0790],
          [77.8105, 13.0745],
          [77.8062, 13.0730],
          [77.8060, 13.0770]
        ]
      },

      // Chitradurga / Karnataka (linked to project 4: Upper Bhadra)
      {
        projectIndex: 3,
        survey: 'SY-201/1',
        village: 'Holalkere',
        area: 6.8000,
        owner: 'Basavarajappa Siddalingappa',
        aadhaar: 'XXXX-XXXX-3419',
        status: 'notified',
        type: 'dry_agricultural',
        coords: [
          [76.2800, 14.0450],
          [76.2850, 14.0475],
          [76.2860, 14.0420],
          [76.2805, 14.0400],
          [76.2800, 14.0450]
        ]
      },

      // Jewar / Greater Noida (linked to project 8: Jewar Cargo Link)
      {
        projectIndex: 7,
        survey: 'KH-512',
        village: 'Ranhera',
        area: 8.5000,
        owner: 'Choudhary Sukhbir Singh',
        aadhaar: 'XXXX-XXXX-8712',
        status: 'possession_taken',
        type: 'agricultural',
        coords: [
          [77.5800, 28.1650],
          [77.5860, 28.1680],
          [77.5870, 28.1620],
          [77.5805, 28.1600],
          [77.5800, 28.1650]
        ]
      },
      {
        projectIndex: 7,
        survey: 'KH-514/2',
        village: 'Rohi',
        area: 6.2000,
        owner: 'Babu Lal Bhati',
        aadhaar: 'XXXX-XXXX-2918',
        status: 'possession_taken',
        type: 'agricultural',
        coords: [
          [77.5880, 28.1690],
          [77.5935, 28.1720],
          [77.5945, 28.1660],
          [77.5885, 28.1640],
          [77.5880, 28.1690]
        ]
      },

      // Bhopal / MP (linked to project 9: Green Energy Industrial)
      {
        projectIndex: 8,
        survey: 'GAT-190',
        village: 'Berasia Industrial Zone',
        area: 11.4000,
        owner: 'Shivnarayan Raghuwanshi',
        aadhaar: 'XXXX-XXXX-6102',
        status: 'notified',
        type: 'waste_land',
        coords: [
          [77.4200, 23.6300],
          [77.4270, 23.6335],
          [77.4280, 23.6265],
          [77.4210, 23.6240],
          [77.4200, 23.6300]
        ]
      },
      {
        projectIndex: 8,
        survey: 'GAT-194/B',
        village: 'Berasia Industrial Zone',
        area: 7.9000,
        owner: 'Radheshyam Meena',
        aadhaar: 'XXXX-XXXX-5541',
        status: 'acquired',
        type: 'agricultural',
        coords: [
          [77.4290, 23.6340],
          [77.4350, 23.6375],
          [77.4360, 23.6305],
          [77.4295, 23.6280],
          [77.4290, 23.6340]
        ]
      }
    ];

    const parcelRows = [];
    for (const p of parcelsData) {
      const projId = projectRows[p.projectIndex].id;
      const geomObj = {
        type: 'Polygon',
        coordinates: [p.coords]
      };

      const res = await client.query(
        `INSERT INTO land_parcels (project_id, survey_number, area_hectares, geom, owner_name, aadhaar_masked, status, land_type, village)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, project_id, survey_number, area_hectares, status, owner_name;`,
        [projId, p.survey, p.area, JSON.stringify(geomObj), p.owner, p.aadhaar, p.status, p.type, p.village]
      );
      parcelRows.push(res.rows[0]);
    }
    console.log(`[SEED] Inserted ${parcelRows.length} land parcels with realistic polygon boundaries.`);

    // 4. SEED COMPENSATION & R&R DATA FOR EACH PARCEL
    // Calculate realistic assessed amounts (e.g. ₹ 40-90 Lakhs per Hectare with solatium)
    for (let i = 0; i < parcelRows.length; i++) {
      const p = parcelRows[i];
      const ratePerHa = 6500000 + ((i % 5) * 800000); // 65-100 Lakhs per Ha
      const assessed = Math.round(Number(p.area_hectares) * ratePerHa);
      let paid = 0;
      let payStatus = 'pending';
      let rnrStatus = 'not_started';
      const families = 1 + (i % 4);

      if (p.status === 'possession_taken') {
        paid = assessed;
        payStatus = 'paid';
        rnrStatus = 'completed';
      } else if (p.status === 'acquired') {
        paid = Math.round(assessed * 0.7); // partially settled
        payStatus = 'processing';
        rnrStatus = 'in_progress';
      } else if (p.status === 'disputed') {
        paid = 0;
        payStatus = 'pending';
        rnrStatus = 'not_started';
      } else {
        // notified
        paid = 0;
        payStatus = 'pending';
        rnrStatus = 'not_started';
      }

      await client.query(
        `INSERT INTO compensation (parcel_id, assessed_amount, paid_amount, payment_status, rnr_status, families_affected, bank_account_masked, ifsc_code, utr_number, disbursed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          p.id,
          assessed,
          paid,
          payStatus,
          rnrStatus,
          families,
          `SBIN000${1000 + i}`,
          'SBIN0001824',
          payStatus === 'paid' ? `RBI${Date.now()}${i}` : null,
          payStatus === 'paid' ? new Date(Date.now() - (i * 86400000)) : null
        ]
      );
    }
    console.log(`[SEED] Inserted compensation & R&R ledger records for all ${parcelRows.length} parcels.`);

    // 5. SEED SAMPLE DOCUMENTS IN DB & WRITE DUMMY PDF/TXT FILES TO /server/uploads
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sampleDocs = [
      {
        projectIndex: 0,
        filename: 'Gazette_Sec11_Preliminary_Notification_NH48.pdf',
        size: 1420500,
        mime: 'application/pdf',
        version: 1,
        verified: true,
        verified_by: 'Dr. Rajesh Sharma, IAS (District Collector)'
      },
      {
        projectIndex: 0,
        filename: 'Social_Impact_Assessment_Report_Final_Vangaon.pdf',
        size: 3892000,
        mime: 'application/pdf',
        version: 2,
        verified: true,
        verified_by: 'Sunita Meena, IAS (State Revenue Sec)'
      },
      {
        projectIndex: 0,
        filename: 'Joint_Measurement_Survey_Cadastral_Map_Talasari.pdf',
        size: 5120000,
        mime: 'application/pdf',
        version: 1,
        verified: false,
        verified_by: null
      },
      {
        projectIndex: 1,
        filename: 'Gazette_Sec19_Declaration_BulletTrain_Varanasi.pdf',
        size: 1840000,
        mime: 'application/pdf',
        version: 1,
        verified: true,
        verified_by: 'Shri R. K. Verma, IAS (Joint Secretary)'
      },
      {
        projectIndex: 2,
        filename: 'Section38_Vesting_Order_Dholera_Logistics.pdf',
        size: 920400,
        mime: 'application/pdf',
        version: 1,
        verified: true,
        verified_by: 'Collector Ahmedabad'
      },
      {
        projectIndex: 4,
        filename: 'PFMS_Batch_Disbursement_Bank_Scroll_PRR.pdf',
        size: 2410800,
        mime: 'application/pdf',
        version: 3,
        verified: true,
        verified_by: 'Spl Deputy Commissioner, Bengaluru Rural'
      }
    ];

    for (const doc of sampleDocs) {
      const dummyFilePath = path.join(uploadsDir, doc.filename);
      if (!fs.existsSync(dummyFilePath)) {
        fs.writeFileSync(
          dummyFilePath,
          `%PDF-1.4 NLAMS Certified Statutory Gazette Docket: ${doc.filename}\nDigitally Sealed by National Informatics Centre (NIC).\nHash: ${Date.now()}`
        );
      }

      await client.query(
        `INSERT INTO documents (project_id, file_name, file_path, file_size, mime_type, version, uploaded_by, verified, verified_by, verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          projectRows[doc.projectIndex].id,
          doc.filename,
          `/uploads/${doc.filename}`,
          doc.size,
          doc.mime,
          doc.version,
          userRows[2].id, // District Official
          doc.verified,
          doc.verified_by,
          doc.verified ? new Date() : null
        ]
      );
    }
    console.log(`[SEED] Inserted ${sampleDocs.length} statutory document records.`);

    // 6. SEED ACTIVITY LOG (Audit Trail for Workflow Stepper)
    const logsData = [
      {
        projectIndex: 0,
        userIndex: 2, // district official
        action: 'Endorsed Section 15 Public Hearing Minutes & Overrule Objections',
        from: 'document_verification',
        to: 'district_scrutiny',
        remarks: 'Heard 48 objections across Dahanu and Talasari. 41 dismissed with reasons recorded; 7 awarded modified solatium.'
      },
      {
        projectIndex: 0,
        userIndex: 1, // field officer
        action: 'Uploaded DGPS Drone Survey Boundary Fixation GeoJSON',
        from: 'proposal_submitted',
        to: 'document_verification',
        remarks: 'Cadastral demarcation completed for 18 villages. Accuracy within ±0.15m NavIC satellite reference.'
      },
      {
        projectIndex: 1,
        userIndex: 3, // state official
        action: 'Issued Section 19(1) Formal Government Gazette Declaration',
        from: 'district_scrutiny',
        to: 'state_approval',
        remarks: 'State Cabinet approved statutory fund placement into designated CALA escrow account.'
      },
      {
        projectIndex: 2,
        userIndex: 4, // ministry official
        action: 'Handed over Full Physical Possession under Section 38',
        from: 'compensation_disbursed',
        to: 'possession_taken',
        remarks: 'Entire 220 Hectares unencumbered possession transferred to DMICDC contractors.'
      }
    ];

    for (const log of logsData) {
      await client.query(
        `INSERT INTO activity_log (project_id, user_id, action, from_status, to_status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [projectRows[log.projectIndex].id, userRows[log.userIndex].id, log.action, log.from, log.to, log.remarks]
      );
    }
    console.log(`[SEED] Inserted ${logsData.length} activity audit log records.`);

    // 7. SEED 8 NOTIFICATIONS SPREAD ACROSS USERS & TYPES
    const notifsData = [
      {
        userIndex: 2, // District official
        title: 'Section 19 SLA Limitation Warning',
        message: 'NH-48 Corridor Form-VI scrutiny must be forwarded within 18 days to avoid statutory lapse under Section 19(7).',
        type: 'approval_needed',
        projectIndex: 0,
        read: false
      },
      {
        userIndex: 2, // District official
        title: 'Title Dispute Hearing Scheduled',
        message: 'Objection filed for Survey SY-108/3 Talasari. Revenue Court notice issued for 15-Oct-2026.',
        type: 'delay',
        projectIndex: 0,
        read: false
      },
      {
        userIndex: 1, // Field officer
        title: 'New Field Boundary Inspection Task',
        message: 'Assigned to demarcate 4 new parcel boundaries for Pune-Nashik Semi-High Speed rail corridor.',
        type: 'update',
        projectIndex: 6,
        read: false
      },
      {
        userIndex: 3, // State official
        title: 'Form-VI Declaration Recommendation Pending',
        message: 'District Collector Palghar has submitted Form-VI recommendation for NH-48 Freight Spur package.',
        type: 'approval_needed',
        projectIndex: 0,
        read: false
      },
      {
        userIndex: 0, // Citizen
        title: 'Compensation Solatium Approved',
        message: 'Award order declared for Survey SY-104/2B Vangaon. Direct Benefit Transfer initiated to your bank account.',
        type: 'update',
        projectIndex: 0,
        read: false
      },
      {
        userIndex: 4, // Ministry official
        title: 'Quarterly Land Acquisition Review Meeting',
        message: 'Inter-ministerial project monitoring group review for Bharat Mala Phase-2 scheduled for Friday.',
        type: 'update',
        projectIndex: 0,
        read: true
      },
      {
        userIndex: 2, // District official
        title: 'PFMS Tranche Batch Reconciled',
        message: '₹ 14.20 Crore solatium successfully credited to 42 khatedars via RBI e-Kuber gateway.',
        type: 'update',
        projectIndex: 0,
        read: true
      },
      {
        userIndex: 3, // State official
        title: 'Forest Clearance Section 2 Delay',
        message: 'Environment & Forest department requested updated geo-tagged boundary map for 5.2 Ha tract in Palghar.',
        type: 'delay',
        projectIndex: 0,
        read: false
      }
    ];

    for (const n of notifsData) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, project_id)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [userRows[n.userIndex].id, n.title, n.message, n.type, n.read, projectRows[n.projectIndex].id]
      );
    }
    console.log(`[SEED] Inserted ${notifsData.length} notifications across all 3 types.`);

    await client.query('COMMIT');
    console.log('[SEED] NLAMS database seeding successfully completed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED ERROR]:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
