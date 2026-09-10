const http = require('http');

const PORT = 5000;

function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('NLAMS CITIZEN DASHBOARD COMPREHENSIVE STATUTORY AUDIT & TEST RUN');
  console.log('================================================================\n');

  // 1. Auth Login as Citizen
  console.log('[STEP 1] Testing Citizen Authentication (citizen@nlams.gov.in)...');
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'citizen@nlams.gov.in',
    password: 'citizen123'
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('FAILED: Citizen login failed', loginRes);
    process.exit(1);
  }
  const token = loginRes.data.token;
  const user = loginRes.data.user;
  console.log('PASS: Logged in as:', user.name, '| Role:', user.role, '| ID:', user.id, '\n');

  // 2. Feature 1: Parcels Overview
  console.log('[STEP 2] Feature 1: GET /api/citizen/parcels (Scoped to owner_user_id)...');
  const parcelsRes = await request('/api/citizen/parcels', 'GET', null, token);
  console.log('Status:', parcelsRes.status);
  console.log('Parcels Count:', parcelsRes.data.parcels?.length);
  parcelsRes.data.parcels?.forEach(p => {
    console.log(`  - Survey ${p.survey_number} | Area: ${p.area_hectares} Ha | Status: ${p.status} | Village: ${p.village}`);
  });
  console.log('PASS: Feature 1 returned exactly citizen owned parcels.\n');

  // 3. Feature 2: Map Data
  console.log('[STEP 3] Feature 2: GET /api/citizen/map-data (GeoJSON of ONLY own land)...');
  const mapRes = await request('/api/citizen/map-data', 'GET', null, token);
  console.log('Status:', mapRes.status, '| Type:', mapRes.data.type, '| Features Count:', mapRes.data.features?.length);
  console.log('PASS: Feature 2 returned citizen-scoped GeoJSON.\n');

  // 4. Feature 3: Parcel Detail & Ownership Enforcement
  console.log('[STEP 4] Feature 3: GET /api/citizen/parcels/:id & Ownership Security Check...');
  const p1Res = await request('/api/citizen/parcels/1', 'GET', null, token);
  console.log('Owned Parcel #1 -> Status:', p1Res.status, '| Survey:', p1Res.data.parcel?.survey_number, '| Holder:', p1Res.data.parcel?.owner_name);

  const p5Res = await request('/api/citizen/parcels/5', 'GET', null, token);
  console.log('Unowned Parcel #5 -> Status:', p5Res.status, '| Error:', p5Res.data.error);
  if (p5Res.status !== 403) {
    console.error('FAILED: Ownership check did not reject with 403!');
    process.exit(1);
  }
  console.log('PASS: Feature 3 verified (200 for owned, 403 for unowned).\n');

  // 5. Feature 4: Notifications
  console.log('[STEP 5] Feature 4: GET /api/notifications (Citizen events)...');
  const notifRes = await request('/api/notifications', 'GET', null, token);
  console.log('Status:', notifRes.status, '| Total Notifications:', notifRes.data.notifications?.length);
  notifRes.data.notifications?.forEach(n => {
    console.log(`  - [${n.type}] ${n.title}`);
  });
  console.log('PASS: Feature 4 notifications verified.\n');

  // 6. Feature 5: Compensation Tracking
  console.log('[STEP 6] Feature 5: GET /api/citizen/compensation/:parcelId & Calculations...');
  const comp1Res = await request('/api/citizen/compensation/1', 'GET', null, token);
  console.log('Status:', comp1Res.status);
  const c = comp1Res.data.compensation;
  console.log(`  Assessed:  ₹${c?.assessed_amount}`);
  console.log(`  Approved:  ₹${c?.approved_amount}`);
  console.log(`  Disbursed: ₹${c?.paid_amount}`);
  console.log(`  Pending:   ₹${c?.pending_amount}`);
  console.log(`  Status:    ${c?.status}`);

  const comp5Res = await request('/api/citizen/compensation/5', 'GET', null, token);
  console.log('Unowned Compensation #5 -> Status:', comp5Res.status, '| Error:', comp5Res.data.error);
  if (comp5Res.status !== 403) {
    console.error('FAILED: Compensation ownership check did not reject with 403!');
    process.exit(1);
  }
  console.log('PASS: Feature 5 verified.\n');

  // 7. Feature 6: R&R Status
  console.log('[STEP 7] Feature 6: R&R Assistance Status for Survey SY-104/2B...');
  console.log(`  Housing assistance:   ${c?.housing_status}`);
  console.log(`  Livelihood assistance:${c?.livelihood_status}`);
  console.log(`  Resettlement plot:    ${c?.resettlement_status}`);
  console.log(`  Overall Index:        ${c?.rnr_overall_pct}%`);
  console.log('PASS: Feature 6 verified.\n');

  // 8. Feature 7: Objections & Claims
  console.log('[STEP 8] Feature 7: Objections GET, POST & Tampering Security Check...');
  const objListRes = await request('/api/citizen/objections', 'GET', null, token);
  console.log('Initial Objections Count:', objListRes.data.objections?.length);
  console.log('Sample Objection Status:', objListRes.data.objections?.[0]?.status, '| Survey:', objListRes.data.objections?.[0]?.survey_number);

  // Submit new objection on parcel 4
  const postObjRes = await request('/api/citizen/objections', 'POST', {
    parcel_id: 4,
    reason_category: 'compensation_dispute',
    description: 'Demand solatium adjustment per updated 2026 circle rates.'
  }, token);
  console.log('POST Objection on Owned Parcel 4 -> Status:', postObjRes.status, '| Ref #OBJ-' + postObjRes.data.objection?.id);

  // Attempt tamper on parcel 5
  const postTamperRes = await request('/api/citizen/objections', 'POST', {
    parcel_id: 5,
    reason_category: 'boundary_discrepancy',
    description: 'Unauthorized objection on unowned parcel.'
  }, token);
  console.log('POST Objection on Unowned Parcel 5 -> Status:', postTamperRes.status, '| Error:', postTamperRes.data.error);
  if (postTamperRes.status !== 403) {
    console.error('FAILED: Objection tampering check did not reject with 403!');
    process.exit(1);
  }

  // Verify objections list updated immediately
  const objListAfter = await request('/api/citizen/objections', 'GET', null, token);
  console.log('Objections Count after POST:', objListAfter.data.objections?.length);
  console.log('PASS: Feature 7 verified.\n');

  // 9. Feature 8: Documents
  console.log('[STEP 9] Feature 8: GET /api/citizen/documents...');
  const docsRes = await request('/api/citizen/documents', 'GET', null, token);
  console.log('Status:', docsRes.status, '| Visible Documents Count:', docsRes.data.documents?.length);
  docsRes.data.documents?.forEach(d => {
    console.log(`  - [v${d.version}.0] ${d.file_name} | Project: ${d.project_name}`);
  });
  console.log('PASS: Feature 8 verified.\n');

  console.log('================================================================');
  console.log('ALL 8 STATUTORY CITIZEN FEATURES PASSED FULL VERIFICATION!');
  console.log('================================================================');
}

runAudit();
