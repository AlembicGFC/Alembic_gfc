const SUPABASE_URL = 'https://jcsnapkopkeeepugtitf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Kk8FjimVFuMeEIfH8Zq_XQ_aQ-rX_Vj';
const ADMIN_PASSWORD = 'GFC@123';

const sb = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

function getClient() {
  if (sb) return sb;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return null;
}

let allChildrenCache = [];
let allStaffCache = [];
let isAdmin = false;
let currentCharts = {};
let dashboardAvailableItems = [];
let selectedDashboardKey = null;
let currentProfileChildData = null;
let currentProfileHealthAll = [];
let currentProfileChildExtra = { edu: [], act: [], inc: [], counsel: [] };

// Exact 10 Child Case Study Headings (1 to 10)
const EXCEL_PROFILE_FIELDS = {
  fFamHistory: '1. Family Background',
  fHealthNotes: '2. Health & Medical Information',
  fSocialHistory: '3. Social and Emotional History',
  fEduHistory: '4. Educational History',
  fExtraActivities: '5. Participation in Extracurricular Activities:',
  fHobbies: '6. Hobbies and Interests',
  fTriggersCoping: '7. Emotional Triggers and Coping Mechanisms',
  fGoals: '8. Goals and Aspirations',
  fStrengthWeakness: "9. Child's strength and weakness",
  fConclusion: '10. Conclusion'
};

// Backward-compatibility map for older records saved with 2..11 numbering
const LEGACY_CASE_STUDY_MAP = {
  '1. Family Background': '2. Family Background',
  '2. Health & Medical Information': '3. Health & Medical Information',
  '3. Social and Emotional History': '4. Social and Emotional History',
  '4. Educational History': '5. Educational History',
  '5. Participation in Extracurricular Activities:': '6. Participation in Extracurricular Activities:',
  '6. Hobbies and Interests': '7. Hobbies and Interests',
  '7. Emotional Triggers and Coping Mechanisms': '8. Emotional Triggers and Coping Mechanisms',
  '8. Goals and Aspirations': '9. Goals and Aspirations',
  "9. Child's strength and weakness": "10. Child's strength and weakness",
  '10. Conclusion': '11. Conclusion'
};

// Extra optional metadata stored safely inside `remark` so no extra DB column is required
const EXTRA_CHILD_META_FIELDS = {
  fCwcOrderNo: 'cwc_order_no',
  fAltContact: 'alt_contact_no',
  fMedium: 'school_medium'
};

const EXTRA_STAFF_META_FIELDS = {
  sBloodGroup: 'blood_group',
  sQualification: 'qualification',
  sEmergencyContact: 'emergency_contact',
  sAadhar: 'aadhar_card',
  sPan: 'pan_card',
  sBranch: 'branch_name'
};

function getCaseStudyValue(parsedObj, label) {
  if (!parsedObj || typeof parsedObj !== 'object') return '';
  if (parsedObj[label] !== undefined && parsedObj[label] !== null) {
    return String(parsedObj[label]);
  }
  const legacyKey = LEGACY_CASE_STUDY_MAP[label];
  if (legacyKey && parsedObj[legacyKey] !== undefined && parsedObj[legacyKey] !== null) {
    return String(parsedObj[legacyKey]);
  }
  return '';
}

function parseSubjectMarks(rawMarks) {
  if (!rawMarks) return {};
  if (typeof rawMarks === 'object') return rawMarks;
  if (typeof rawMarks === 'string') {
    try {
      const parsed = JSON.parse(rawMarks);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  return {};
}

function serializeExcelSections() {
  const obj = {};
  Object.entries(EXCEL_PROFILE_FIELDS).forEach(([elId, label]) => {
    const el = document.getElementById(elId);
    if (el && el.value.trim()) obj[label] = el.value.trim();
  });

  const meta = {};
  Object.entries(EXTRA_CHILD_META_FIELDS).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el && el.value.trim()) meta[key] = el.value.trim();
  });
  if (Object.keys(meta).length) obj['__meta'] = meta;

  return Object.keys(obj).length ? `[EXCEL_PROFILE_JSON]${JSON.stringify(obj)}` : '';
}

function parseExcelSections(remarkText) {
  if (!remarkText) return {};
  const marker = '[EXCEL_PROFILE_JSON]';
  const idx = remarkText.indexOf(marker);
  if (idx !== -1) {
    try {
      const parsed = JSON.parse(remarkText.slice(idx + marker.length));
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
  }
  return {};
}

function getChildMeta(childData) {
  const parsed = parseExcelSections(childData?.remark || '');
  return (parsed && typeof parsed.__meta === 'object' && parsed.__meta) ? parsed.__meta : {};
}

function populateExcelFormFields(childData) {
  const parsed = parseExcelSections(childData?.remark || '');
  const meta = getChildMeta(childData);

  Object.entries(EXCEL_PROFILE_FIELDS).forEach(([elId, label]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    const savedVal = getCaseStudyValue(parsed, label);
    if (elId === 'fHealthNotes') {
      el.value = savedVal || childData?.health_notes || '';
    } else {
      el.value = savedVal;
    }
  });

  Object.entries(EXTRA_CHILD_META_FIELDS).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.value = meta[key] || '';
  });
}

function renderExcelProfileSectionsHTML(childData) {
  const parsed = parseExcelSections(childData?.remark || '');
  const entries = Object.entries(EXCEL_PROFILE_FIELDS).map(([elId, label]) => {
    let val = getCaseStudyValue(parsed, label);
    if (!val && elId === 'fHealthNotes') val = childData?.health_notes || '';
    return { label, val: val && String(val).trim() ? val.trim() : '–' };
  });

  return `
    <div class="form-section">📋 Child Case Study</div>
    <div class="profile-grid">
      ${entries.map(item => `
        <div class="profile-item" style="grid-column: 1 / -1;">
          <span class="pl">${escapeHTML(item.label)}</span>
          <span class="pv" style="font-weight:500; white-space:pre-line;">${escapeHTML(item.val)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function serializeStaffMeta() {
  const meta = {};
  Object.entries(EXTRA_STAFF_META_FIELDS).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el && el.value.trim()) meta[key] = el.value.trim();
  });
  return Object.keys(meta).length ? `[STAFF_META_JSON]${JSON.stringify(meta)}` : '';
}

function parseStaffMeta(staffData) {
  const raw = staffData?.notes || staffData?.remark || '';
  const marker = '[STAFF_META_JSON]';
  const idx = raw.indexOf(marker);
  if (idx !== -1) {
    try {
      const parsed = JSON.parse(raw.slice(idx + marker.length));
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
  }
  return {};
}

function escapeHTML(s) {
  return (s == null ? '' : String(s)).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function fmtDate(d) {
  if (!d) return '–';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob), n = new Date();
  if (isNaN(d.getTime())) return null;
  let a = n.getFullYear() - d.getFullYear();
  const m = n.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
  return a;
}

function calc18(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 18);
  return d.toISOString().slice(0, 10);
}

function getDisplayName(fullName) {
  if (!fullName) return '–';
  return fullName.trim().split(' ')[0];
}

function isBirthday(dob) {
  if (!dob) return false;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
}

function maskAadhar(a) {
  if (!a || !String(a).trim()) return '–';
  return String(a).trim();
}
function maskAcc(a) {
  if (a === null || a === undefined) return '–';
  const s = String(a).trim();
  return s ? s : '–';
}

function getPediatricBMI(age, gender, heightCm, weightKg) {
  if (!heightCm || !weightKg) return { bmi: null, status: 'No Data', color: '#6b7280' };
  const hM = heightCm / 100;
  const bmi = weightKg / (hM * hM);
  const thresholds = {
    5: { boy: [13.4, 16.6, 18.2], girl: [13.1, 16.7, 18.2] }, 6: { boy: [13.4, 16.9, 18.5], girl: [13.1, 17.0, 18.8] },
    7: { boy: [13.5, 17.3, 19.1], girl: [13.1, 17.4, 19.6] }, 8: { boy: [13.7, 17.9, 20.0], girl: [13.3, 18.0, 20.6] },
    9: { boy: [14.0, 18.6, 21.0], girl: [13.5, 18.6, 21.6] }, 10: { boy: [14.4, 19.4, 22.1], girl: [13.7, 19.4, 22.7] },
    11: { boy: [14.8, 20.2, 23.2], girl: [14.1, 20.2, 23.7] }, 12: { boy: [15.4, 21.0, 24.4], girl: [14.6, 21.1, 24.8] },
    13: { boy: [16.0, 21.9, 25.6], girl: [15.2, 22.0, 25.9] }, 14: { boy: [16.7, 22.7, 26.8], girl: [15.8, 22.8, 26.9] },
    15: { boy: [17.4, 23.5, 27.9], girl: [16.4, 23.5, 27.9] }, 16: { boy: [18.2, 24.3, 28.9], girl: [17.0, 24.1, 28.8] },
    17: { boy: [18.9, 25.0, 29.8], girl: [17.5, 24.6, 29.5] }, 18: { boy: [19.5, 25.6, 30.5], girl: [18.0, 25.0, 30.1] }
  };
  let ageInt = parseInt(age, 10) || 0;
  if (ageInt < 5) ageInt = 5;
  if (ageInt > 18) ageInt = 18;
  const genderKey = (gender && gender.toLowerCase().startsWith('f')) ? 'girl' : 'boy';
  const limits = thresholds[ageInt][genderKey];
  let status = 'Normal';
  let color = '#16a34a';
  if (bmi < limits[0]) { status = 'Underweight'; color = '#92400e'; }
  else if (bmi > limits[2]) { status = 'Obese'; color = '#991b1b'; }
  else if (bmi > limits[1]) { status = 'Overweight'; color = '#9a3412'; }
  return { bmi: bmi.toFixed(1), status, color };
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    ['h_date', 'c_date', 'a_start', 'i_date', 's_date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = today;
    });

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 3);
    const fromEl = document.getElementById('filterFromDate');
    const toEl = document.getElementById('filterToDate');
    if (fromEl) fromEl.value = fromDate.toISOString().slice(0, 10);
    if (toEl) toEl.value = toDate.toISOString().slice(0, 10);

    if (document.getElementById('subjects_container')) {
      ['Gujarati', 'Hindi', 'English', 'Maths'].forEach(sub => addSubjectRow(sub));
    }
  } catch (e) {
    console.error('Init UI Error:', e);
  }

  await loadBaseData();
  await loadDashboardData();
});

function handleAuth() {
  if (isAdmin) {
    isAdmin = false;
    const authBtn = document.getElementById('authBtn');
    if (authBtn) authBtn.textContent = '🔒 Admin Login';
    const adminView = document.getElementById('adminView');
    const publicView = document.getElementById('publicView');
    if (adminView) adminView.style.display = 'none';
    if (publicView) publicView.style.display = 'block';
    loadBaseData();
    loadDashboardData();
  } else {
    const pwdInput = document.getElementById('passwordInput');
    const errEl = document.getElementById('loginErr');
    const modal = document.getElementById('loginModal');
    if (pwdInput) pwdInput.value = '';
    if (errEl) errEl.style.display = 'none';
    if (modal) modal.classList.add('show');
  }
}

function doLogin() {
  const pwdEl = document.getElementById('passwordInput');
  const errEl = document.getElementById('loginErr');
  if (!pwdEl) return;

  if (pwdEl.value.trim() === ADMIN_PASSWORD) {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('show');
    if (errEl) errEl.style.display = 'none';
    isAdmin = true;
    const authBtn = document.getElementById('authBtn');
    const publicView = document.getElementById('publicView');
    const adminView = document.getElementById('adminView');
    if (authBtn) authBtn.textContent = '🚪 Logout';
    if (publicView) publicView.style.display = 'none';
    if (adminView) adminView.style.display = 'block';
    loadAdminTables();
  } else if (errEl) {
    errEl.style.display = 'block';
  }
}
window.doLogin = doLogin;
window.handleAuth = handleAuth;

async function loadBaseData() {
  try {
    const client = getClient();
    if (!client) {
      console.warn('Supabase client not initialized yet.');
      return;
    }

    const { data: children, error: childErr } = await client.from('children').select('*');
    const { data: staff, error: staffErr } = await client.from('staff').select('*');
    if (childErr) console.error('Children fetch error:', childErr);
    if (staffErr) console.error('Staff fetch error:', staffErr);

    allChildrenCache = children || [];
    allStaffCache = staff || [];

    const activeChildren = allChildrenCache.filter(c => c.status === 'active');
    const opts = '<option value="">-- Select Child --</option>' + activeChildren.map(c =>
      `<option value="${c.id}">${escapeHTML(c.full_name)} (${escapeHTML(c.gfc_id || '')})</option>`
    ).join('');

    document.querySelectorAll('.child-select').forEach(sel => { sel.innerHTML = opts; });
    const filterChildEl = document.getElementById('filterChildId');
    if (filterChildEl) filterChildEl.innerHTML = opts;

    if (document.getElementById('kpiActive')) document.getElementById('kpiActive').textContent = activeChildren.length;
    if (document.getElementById('kpiInactive')) document.getElementById('kpiInactive').textContent = allChildrenCache.filter(c => c.status === 'inactive').length;

    const withSchool = activeChildren.filter(c => c.present_school && c.present_school.trim() !== '');
    if (document.getElementById('kpiEnroll')) {
      document.getElementById('kpiEnroll').textContent = (activeChildren.length ? Math.round((withSchool.length / activeChildren.length) * 100) : 0) + '%';
    }

    if (document.getElementById('treeCanopy')) {
      const sortedChildren = activeChildren.slice().sort((a, b) => (calcAge(b.dob) || 0) - (calcAge(a.dob) || 0));
      document.getElementById('treeCanopy').innerHTML = sortedChildren.map(c => {
        const isBday = isBirthday(c.dob);
        return `
        <div class="tree-node" onclick="openProfile('${c.id}')">
          ${isBday ? '<div class="bday-emoji">🎂</div><div class="bday-emoji-2">🎉</div>' : ''}
          <div class="tree-node-photo ${isBday ? 'birthday-photo' : ''}">${c.photo_url ? `<img src="${escapeHTML(c.photo_url)}"/>` : '👦'}</div>
          <div class="tree-node-name">${escapeHTML(getDisplayName(c.full_name))}</div>
        </div>`;
      }).join('');
    }

    if (document.getElementById('staffTreeCanopy')) {
      const sortedStaff = allStaffCache.filter(s => s.status === 'active').sort((a, b) => (a.serial_no || 999) - (b.serial_no || 999));
      document.getElementById('staffTreeCanopy').innerHTML = sortedStaff.map(s => {
        const isBday = isBirthday(s.dob);
        return `
        <div class="tree-node" onclick="openStaffProfile('${s.id}')" title="${escapeHTML(s.full_name)} - ${escapeHTML(s.role)}">
          ${isBday ? '<div class="bday-emoji">🎂</div><div class="bday-emoji-2">🎉</div>' : ''}
          <div class="tree-node-photo ${isBday ? 'birthday-photo' : ''}">${s.photo_url ? `<img src="${escapeHTML(s.photo_url)}"/>` : '👨‍🏫'}</div>
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;margin-top:8px;">
            <div class="tree-node-name staff-name" style="line-height:1.2;margin-bottom:4px;white-space:normal;padding:0 5px;">
              ${escapeHTML(s.full_name || 'Staff')}
            </div>
            <div style="font-size:0.68rem;color:#166534;font-weight:700;line-height:1.3;padding:0 5px;width:100%;word-wrap:break-word;">
              ${escapeHTML(s.role || '').replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>`;
      }).join('');
    }
  } catch (error) {
    console.error('Data Error:', error);
  }
}

async function loadAdminTables() {
  try {
    const client = getClient();
    if (!client) return;

    const { data: children } = await client.from('children').select('*');
    const sortedChildren = (children || []).sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return (calcAge(b.dob) || 0) - (calcAge(a.dob) || 0);
    });

    document.getElementById('adminTableBody').innerHTML = sortedChildren.map(c => `
      <tr>
        <td>${c.serial_no || '–'}</td>
        <td>${escapeHTML(c.gfc_id || '–')}</td>
        <td>${escapeHTML(c.full_name)}</td>
        <td>${calcAge(c.dob) || '–'}</td>
        <td><span class="badge ${c.status}">${c.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="editChildById('${c.id}')">✏️ Edit</button>
          <button class="btn ${c.status === 'active' ? 'btn-danger' : 'btn-ok'} btn-sm" onclick="toggleChildStatus('${c.id}','${c.status}')">${c.status === 'active' ? '⏸ Inactive' : '▶ Active'}</button>
        </td>
      </tr>`).join('');

    const { data: staff } = await client.from('staff').select('*').order('serial_no', { ascending: true });
    document.getElementById('adminStaffTableBody').innerHTML = (staff || []).map(s => `
      <tr>
        <td>${s.serial_no || '–'}</td>
        <td>${escapeHTML(s.full_name)}</td>
        <td>${escapeHTML(s.role || '–')}</td>
        <td>${escapeHTML(s.shift_timing || '–')}</td>
        <td><span class="badge ${s.status}">${s.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="editStaffById('${s.id}')">✏️ Edit</button>
          <button class="btn ${s.status === 'active' ? 'btn-danger' : 'btn-ok'} btn-sm" onclick="toggleStaffStatus('${s.id}','${s.status}')">${s.status === 'active' ? '⏸ Inactive' : '▶ Active'}</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error('Admin Load Err:', err);
  }
}

async function toggleChildStatus(id, current) {
  const client = getClient();
  if (!client) return;
  const { error } = await client.from('children').update({ status: current === 'active' ? 'inactive' : 'active' }).eq('id', id);
  if (error) alert('❌ ' + error.message);
  else { loadAdminTables(); loadBaseData(); }
}

async function toggleStaffStatus(id, current) {
  const client = getClient();
  if (!client) return;
  const { error } = await client.from('staff').update({ status: current === 'active' ? 'inactive' : 'active' }).eq('id', id);
  if (error) alert('❌ ' + error.message);
  else { loadAdminTables(); loadBaseData(); }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
  if (activeBtn) activeBtn.classList.add('active');
  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) activeTab.classList.add('active');
}

function addSubjectRow(defaultName = '') {
  const container = document.getElementById('subjects_container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'subject-row';
  div.innerHTML = `<input type="text" placeholder="Subject Name" value="${escapeHTML(defaultName)}" class="sub-name"><input type="number" placeholder="Marks" class="sub-mark" oninput="calcEduTotal()"><button class="btn-remove-sub" onclick="this.parentElement.remove(); calcEduTotal();">X</button>`;
  container.appendChild(div);
}

function calcEduTotal() {
  let total = 0;
  let count = 0;
  document.querySelectorAll('.sub-mark').forEach(inp => {
    const val = parseFloat(inp.value);
    if (!isNaN(val)) { total += val; count++; }
  });
  if (document.getElementById('e_total')) document.getElementById('e_total').value = count > 0 ? total : '';
  if (document.getElementById('e_perc')) document.getElementById('e_perc').value = count > 0 ? ((total / (count * 100)) * 100).toFixed(1) : '';
}

async function saveHealth() {
  const client = getClient();
  if (!client) return;
  const childId = document.getElementById('h_child_id').value;
  const recordDate = document.getElementById('h_date').value;
  const heightVal = document.getElementById('h_height').value;
  const weightVal = document.getElementById('h_weight').value;
  const isSickVal = document.getElementById('h_is_sick').value === 'yes';

  let sicknessDetails = null;
  if (isSickVal) {
    const disease = document.getElementById('h_sick_name').value.trim() || '-';
    const place = document.getElementById('h_sick_place').value.trim() || '-';
    const recovery = document.getElementById('h_sick_recovery').value.trim() || '-';
    sicknessDetails = `Disease: ${disease} | Place: ${place} | Recovery: ${recovery} Days`;
  }

  if (!childId || !recordDate) return alert('⚠️ Child aur Date select karna zaroori hai!');

  const { error } = await client.from('child_health').insert({
    child_id: childId,
    record_date: recordDate,
    height_cm: heightVal ? parseFloat(heightVal) : null,
    weight_kg: weightVal ? parseFloat(weightVal) : null,
    is_sick: isSickVal,
    sickness_details: sicknessDetails
  });

  if (error) {
    alert('❌ Error: ' + error.message);
  } else {
    alert('✅ Health Record Saved!');
    document.getElementById('h_height').value = '';
    document.getElementById('h_weight').value = '';
    document.getElementById('h_is_sick').value = 'no';
    document.getElementById('sick_details_box').style.display = 'none';
    loadDashboardData();
  }
}

async function saveEducation() {
  const client = getClient();
  if (!client) return;

  const child_id = document.getElementById('e_child_id').value;
  const academic_year = document.getElementById('e_year').value.trim();
  const exam_term = document.getElementById('e_term').value.trim();

  if (!child_id) return alert('⚠️ Please select a child');
  if (!academic_year) return alert('⚠️ Please enter Academic Year (e.g. 2024-25)');

  const subjects = {};
  document.querySelectorAll('.subject-row').forEach(row => {
    const name = row.querySelector('.sub-name').value.trim();
    const mark = row.querySelector('.sub-mark').value;
    if (name && mark !== '') subjects[name] = parseFloat(mark);
  });

  const rawTotal = document.getElementById('e_total').value;
  const rawPerc = String(document.getElementById('e_perc').value || '').replace('%', '').trim();
  const total_marks = rawTotal !== '' && !isNaN(parseFloat(rawTotal)) ? parseFloat(rawTotal) : null;
  const percentage = rawPerc !== '' && !isNaN(parseFloat(rawPerc)) ? parseFloat(rawPerc) : null;

  const { error } = await client.from('child_education').insert({
    child_id,
    academic_year,
    exam_term: exam_term || null,
    subject_marks: subjects,
    total_marks,
    percentage
  });

  if (error) {
    alert('❌ ' + error.message);
  } else {
    alert('✅ Education Record Saved!');
    document.getElementById('e_year').value = '';
    document.getElementById('e_term').value = '';
    document.querySelectorAll('.sub-mark').forEach(inp => { inp.value = ''; });
    calcEduTotal();
    loadDashboardData();
  }
}

async function saveCounselling() {
  const client = getClient();
  if (!client) return;
  const { error } = await client.from('counselor_reports').insert({
    child_id: document.getElementById('c_child_id').value,
    report_date: document.getElementById('c_date').value,
    counselor_name: document.getElementById('c_name').value,
    behavior_notes: document.getElementById('c_behavior').value,
    progress_notes: document.getElementById('c_notes').value
  });
  if (error) alert(error.message);
  else alert('✅ Counselling Report Saved!');
}

async function saveActivity() {
  const client = getClient();
  if (!client) return;
  const { error } = await client.from('child_activities').insert({
    child_id: document.getElementById('a_child_id').value,
    activity_name: document.getElementById('a_name').value,
    start_date: document.getElementById('a_start').value,
    end_date: document.getElementById('a_end').value || null,
    achievements: document.getElementById('a_details').value
  });
  if (error) alert(error.message);
  else alert('✅ Activity Saved!');
}

async function saveIncident() {
  const client = getClient();
  if (!client) return;
  const combinedReason = `Reason: ${document.getElementById('i_reason').value.trim() || '-'} | Action: ${document.getElementById('i_action').value.trim() || '-'}`;
  const { error } = await client.from('child_incidents').insert({
    child_id: document.getElementById('i_child_id').value,
    incident_date: document.getElementById('i_date').value,
    incident_type: document.getElementById('i_type').value,
    location: document.getElementById('i_location').value,
    reason: combinedReason,
    is_resolved: document.getElementById('i_resolved').value === 'yes'
  });
  if (error) alert(error.message);
  else alert('✅ Incident Logged!');
}

async function saveScheme() {
  const client = getClient();
  if (!client) return;
  const { error } = await client.from('child_schemes').insert({
    child_id: document.getElementById('s_child_id').value,
    scheme_name: document.getElementById('s_name').value,
    amount_received: document.getElementById('s_amount').value,
    received_date: document.getElementById('s_date').value,
    bank_account: document.getElementById('s_bank').value,
    status: document.getElementById('s_status').value
  });
  if (error) alert(error.message);
  else alert('✅ Scheme Record Saved!');
}

function toggleFilterMode() {
  document.getElementById('childFilterGroup').style.display =
    document.getElementById('filterMode').value === 'individual' ? 'flex' : 'none';
}

function buildDashboardChartConfig(key, data, mode) {
  const xTicksConfig = {
    x: {
      ticks: {
        maxTicksLimit: 12,
        autoSkip: true
      }
    }
  };

  if (key === 'edu') {
    let labels = [], dataset = [], chartLabel = '';
    if (mode === 'individual' && data.length > 0) {
      const latest = data[data.length - 1];
      const marksObj = parseSubjectMarks(latest.subject_marks);
      labels = Object.keys(marksObj);
      dataset = Object.values(marksObj).map(v => parseFloat(v) || 0);
      chartLabel = 'Marks';
    } else {
      const yearMap = {};
      data.forEach(d => {
        const yr = (d.academic_year || 'Unspecified').trim();
        if (d.percentage !== null && d.percentage !== undefined && d.percentage !== '') {
          const num = parseFloat(String(d.percentage).replace('%', ''));
          if (!isNaN(num)) {
            if (!yearMap[yr]) yearMap[yr] = { sum: 0, count: 0 };
            yearMap[yr].sum += num;
            yearMap[yr].count += 1;
          }
        }
      });
      labels = Object.keys(yearMap).sort();
      dataset = labels.map(yr => Number((yearMap[yr].sum / yearMap[yr].count).toFixed(1)));
      chartLabel = 'Year-wise Avg %';
    }
    return {
      title: '🎓 Education Progress',
      canvasId: 'chartEdu',
      config: {
        type: 'bar',
        data: { labels, datasets: [{ label: chartLabel, data: dataset, backgroundColor: '#3b82f6', borderRadius: 4 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 }, ...xTicksConfig }
        }
      }
    };
  }

  if (key === 'health') {
    if (mode === 'individual') {
      const childObj = allChildrenCache.find(c => String(c.id) === String(data[0]?.child_id || document.getElementById('filterChildId')?.value || ''));
      const gender = childObj ? childObj.gender : 'Male';
      const bmiPoints = data
        .map(d => {
          const age = childObj?.dob ? (calcAge(childObj.dob) || 10) : 10;
          const bmiRes = getPediatricBMI(age, gender, d.height_cm, d.weight_kg);
          const bmiNum = bmiRes.bmi ? parseFloat(bmiRes.bmi) : null;
          return (bmiNum !== null && !isNaN(bmiNum))
            ? { label: fmtDate(d.record_date), value: bmiNum }
            : null;
        })
        .filter(Boolean);

      return {
        title: '🏥 Health & BMI Trend',
        canvasId: 'chartHealth',
        config: {
          type: 'line',
          data: {
            labels: bmiPoints.map(p => p.label),
            datasets: [{
              label: 'BMI',
              data: bmiPoints.map(p => p.value),
              borderColor: '#16a34a',
              backgroundColor: '#16a34a',
              fill: false,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: xTicksConfig
          }
        }
      };
    }

    const dateBmiMap = {};
    data.forEach(d => {
      if (!d.record_date) return;
      const childObj = allChildrenCache.find(c => String(c.id) === String(d.child_id));
      const age = childObj?.dob ? (calcAge(childObj.dob) || 10) : 10;
      const gender = childObj ? childObj.gender : 'Male';
      const bmiRes = getPediatricBMI(age, gender, d.height_cm, d.weight_kg);
      const bmiNum = bmiRes.bmi ? parseFloat(bmiRes.bmi) : null;
      if (bmiNum !== null && !isNaN(bmiNum)) {
        if (!dateBmiMap[d.record_date]) dateBmiMap[d.record_date] = { sum: 0, count: 0 };
        dateBmiMap[d.record_date].sum += bmiNum;
        dateBmiMap[d.record_date].count += 1;
      }
    });

    const sortedDates = Object.keys(dateBmiMap).sort();
    return {
      title: '🏥 Health & BMI Trend',
      canvasId: 'chartHealth',
      config: {
        type: 'line',
        data: {
          labels: sortedDates.map(dt => fmtDate(dt)),
          datasets: [{
            label: 'Average BMI',
            data: sortedDates.map(dt => Number((dateBmiMap[dt].sum / dateBmiMap[dt].count).toFixed(1))),
            borderColor: '#16a34a',
            backgroundColor: '#16a34a',
            fill: false,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: xTicksConfig
        }
      }
    };
  }

  if (key === 'counsel') {
    const countsMap = {};
    data.forEach(d => {
      const raw = (d.behavior_notes || 'Session Logged').trim();
      const shortLabel = raw.length > 28 ? raw.slice(0, 28) + '...' : raw;
      countsMap[shortLabel] = (countsMap[shortLabel] || 0) + 1;
    });
    return {
      title: '🧠 Counselling Overview',
      canvasId: 'chartCounsel',
      config: {
        type: 'bar',
        data: { labels: Object.keys(countsMap), datasets: [{ label: 'Sessions', data: Object.values(countsMap), backgroundColor: '#6366f1', borderRadius: 4 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      }
    };
  }

  if (key === 'inc') {
    const resolved = data.filter(d => d.is_resolved).length;
    return {
      title: '⚠️ Incidents Overview',
      canvasId: 'chartInc',
      config: {
        type: 'doughnut',
        data: { labels: ['Resolved', 'Pending'], datasets: [{ data: [resolved, data.length - resolved], backgroundColor: ['#16a34a', '#dc2626'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      }
    };
  }

  if (key === 'act') {
    const activityCounts = {};
    data.forEach(d => {
      const name = d.activity_name || 'Other';
      activityCounts[name] = (activityCounts[name] || 0) + 1;
    });
    const labels = Object.keys(activityCounts);
    const counts = Object.values(activityCounts);
    const colors = ['#f59e0b', '#3b82f6', '#16a34a', '#ec4899', '#8b5cf6'];
    return {
      title: '🎨 Co-curricular Activities',
      canvasId: 'chartAct',
      config: {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Total Children', data: counts, backgroundColor: colors.slice(0, labels.length), borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      }
    };
  }

  if (key === 'schemes') {
    const schemeMap = {};
    data.forEach(d => {
      const k = (d.scheme_name || 'Scheme').trim();
      schemeMap[k] = (schemeMap[k] || 0) + 1;
    });
    return {
      title: '📜 Govt Schemes Overview',
      canvasId: 'chartSchemes',
      config: {
        type: 'bar',
        data: { labels: Object.keys(schemeMap), datasets: [{ label: 'Records', data: Object.values(schemeMap), backgroundColor: '#0ea5e9', borderRadius: 4 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      }
    };
  }

  return null;
}

function renderDashboardListUI() {
  const listEl = document.getElementById('reportListItems');
  if (!listEl) return;

  if (!dashboardAvailableItems.length) {
    listEl.innerHTML = `<div style="padding:12px;font-size:0.82rem;color:#64748b;text-align:center;">No reports available</div>`;
    return;
  }

  listEl.innerHTML = dashboardAvailableItems.map(item => {
    const active = item.key === selectedDashboardKey;
    return `
      <button type="button" class="dashboard-list-btn ${active ? 'active' : ''}" onclick="selectDashboardReport('${item.key}')">
        <span>${escapeHTML(item.label)}</span>
        <span class="dashboard-list-count">${item.count}</span>
      </button>
    `;
  }).join('');
}

function selectDashboardReport(key) {
  selectedDashboardKey = key;
  renderDashboardListUI();

  Object.values(currentCharts).forEach(c => c.destroy());
  currentCharts = {};

  const gridEl = document.getElementById('chartsGrid');
  if (!gridEl) return;

  const item = dashboardAvailableItems.find(x => x.key === key);
  if (!item) {
    gridEl.innerHTML = `<div style="padding:24px;text-align:center;color:#6b7280;">Select a report from the list.</div>`;
    return;
  }

  const built = buildDashboardChartConfig(item.key, item.data, item.mode);
  if (!built) return;

  gridEl.innerHTML = `
    <div class="chart-card">
      <h4>${built.title}</h4>
      <div class="chart-wrap-lg"><canvas id="${built.canvasId}"></canvas></div>
    </div>
  `;

  const canvas = document.getElementById(built.canvasId);
  if (canvas && window.Chart) {
    currentCharts[built.canvasId] = new Chart(canvas, built.config);
  }
}
window.selectDashboardReport = selectDashboardReport;

async function loadDashboardData() {
  try {
    const client = getClient();
    if (!client) return;

    const mode = document.getElementById('filterMode')?.value || 'all';
    const childId = document.getElementById('filterChildId')?.value || '';

    let fromStr = document.getElementById('filterFromDate')?.value || '';
    let toStr = document.getElementById('filterToDate')?.value || '';

    if (!fromStr || !toStr) {
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - 3);
      fromStr = from.toISOString().slice(0, 10);
      toStr = to.toISOString().slice(0, 10);
      if (document.getElementById('filterFromDate')) document.getElementById('filterFromDate').value = fromStr;
      if (document.getElementById('filterToDate')) document.getElementById('filterToDate').value = toStr;
    }

    if (mode === 'individual' && !childId) return alert('Please select a child');

    Object.values(currentCharts).forEach(c => c.destroy());
    currentCharts = {};
    dashboardAvailableItems = [];
    selectedDashboardKey = null;

    const chartsGrid = document.getElementById('chartsGrid');
    if (chartsGrid) chartsGrid.innerHTML = '';

    let hwQuery = client.from('child_health').select('*').gte('record_date', fromStr).lte('record_date', toStr).order('record_date');
    let srQuery = client.from('child_education').select('*');
    let cQuery = client.from('counselor_reports').select('*').gte('report_date', fromStr).lte('report_date', toStr);
    let incQuery = client.from('child_incidents').select('*').gte('incident_date', fromStr).lte('incident_date', toStr);
    let actQuery = client.from('child_activities').select('*').gte('start_date', fromStr).lte('start_date', toStr);
    let schQuery = client.from('child_schemes').select('*');

    if (mode === 'individual') {
      hwQuery = hwQuery.eq('child_id', childId);
      srQuery = srQuery.eq('child_id', childId);
      cQuery = cQuery.eq('child_id', childId);
      incQuery = incQuery.eq('child_id', childId);
      actQuery = actQuery.eq('child_id', childId);
      schQuery = schQuery.eq('child_id', childId);
    }

    const [hwRes, srRes, cRes, incRes, actRes, schRes] = await Promise.all([hwQuery, srQuery, cQuery, incQuery, actQuery, schQuery]);

    if (document.getElementById('kpiCounselling')) {
      document.getElementById('kpiCounselling').textContent = cRes.data ? cRes.data.length : 0;
    }

    const hasHealth = hwRes.data && hwRes.data.length > 0;
    const hasEdu = srRes.data && srRes.data.length > 0;
    const hasCounsel = cRes.data && cRes.data.length > 0;
    const hasInc = incRes.data && incRes.data.length > 0;
    const hasAct = actRes.data && actRes.data.length > 0;
    const hasSchemes = schRes.data && schRes.data.length > 0;

    if (hasEdu) dashboardAvailableItems.push({ key: 'edu', label: '🎓 Education Progress', count: srRes.data.length, data: srRes.data, mode });
    if (hasHealth) dashboardAvailableItems.push({ key: 'health', label: '🏥 Health & BMI Trend', count: hwRes.data.length, data: hwRes.data, mode });
    if (hasCounsel) dashboardAvailableItems.push({ key: 'counsel', label: '🧠 Counselling', count: cRes.data.length, data: cRes.data, mode });
    if (hasAct) dashboardAvailableItems.push({ key: 'act', label: '🎨 Co-curricular Activities', count: actRes.data.length, data: actRes.data, mode });
    if (hasInc) dashboardAvailableItems.push({ key: 'inc', label: '⚠️ Incidents Overview', count: incRes.data.length, data: incRes.data, mode });
    if (hasSchemes) dashboardAvailableItems.push({ key: 'schemes', label: '📜 Govt Schemes', count: schRes.data.length, data: schRes.data, mode });

    renderDashboardListUI();

    if (!dashboardAvailableItems.length) {
      if (chartsGrid) {
        chartsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:#6b7280;">Selected period me koi data nahi mila.</div>';
      }
      return;
    }

    selectDashboardReport(dashboardAvailableItems[0].key);
  } catch (error) {
    console.error('Dashboard Error:', error);
  }
}

// ==========================================
// CHILD PROFILE & STAFF PROFILE (STRICTLY SEPARATED)
// ==========================================
async function openProfile(id) {
  try {
    const client = getClient();
    if (!client) return;

    const bodyEl = document.getElementById('profileBody');
    const titleEl = document.getElementById('profileModalTitle');
    const modalEl = document.getElementById('profileModal');

    if (titleEl) titleEl.textContent = '👤 Full Child Profile';
    if (bodyEl) {
      bodyEl.setAttribute('data-child-id', id);
      bodyEl.removeAttribute('data-staff-id');
      bodyEl.innerHTML = `<div id="profileContent" style="text-align:center;padding:20px;">Loading...</div>`;
    }
    if (modalEl) modalEl.classList.add('show');

    let c = allChildrenCache.find(x => String(x.id) === String(id));
    if (!c) {
      const { data: singleChild } = await client.from('children').select('*').eq('id', id).maybeSingle();
      if (!singleChild) {
        if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:20px;color:#dc2626;">Child record not found.</div>`;
        return;
      }
      c = singleChild;
    }

    const [cReportsRes, hwRes, srRes, actRes, incRes] = await Promise.all([
      client.from('counselor_reports').select('*').eq('child_id', id).order('report_date', { ascending: false }),
      client.from('child_health').select('*').eq('child_id', id).order('record_date', { ascending: true }),
      client.from('child_education').select('*').eq('child_id', id),
      client.from('child_activities').select('*').eq('child_id', id),
      client.from('child_incidents').select('*').eq('child_id', id).order('incident_date', { ascending: false })
    ]);

    currentProfileChildExtra = {
      counsel: cReportsRes.data || [],
      edu: (srRes.data || []).slice().sort((a, b) => String(b.academic_year || '').localeCompare(String(a.academic_year || ''))),
      act: actRes.data || [],
      inc: incRes.data || []
    };

    initChildProfileWithDefaults(c, hwRes.data || []);
  } catch (err) {
    console.error('Profile Err:', err);
  }
}
window.openProfile = openProfile;

function openStaffProfile(id) {
  const s = allStaffCache.find(x => String(x.id) === String(id));
  if (!s) return;
  const meta = parseStaffMeta(s);

  const titleEl = document.getElementById('profileModalTitle');
  const bodyEl = document.getElementById('profileBody');
  const modalEl = document.getElementById('profileModal');

  if (titleEl) titleEl.textContent = '👨‍🏫 Full Staff Profile';
  if (bodyEl) {
    bodyEl.setAttribute('data-staff-id', id);
    bodyEl.removeAttribute('data-child-id');
    bodyEl.innerHTML = `
      <div class="profile-header-bg">
        <div class="profile-avatar">${s.photo_url ? `<img src="${escapeHTML(s.photo_url)}"/>` : '👨‍🏫'}</div>
        <div>
          <div style="font-size:1.3rem;font-weight:800">${escapeHTML(s.full_name)}</div>
          <div style="font-size:.85rem;color:#166534">${escapeHTML(s.role || 'Staff')} • ${escapeHTML(s.shift_timing || 'Shift')}</div>
        </div>
      </div>
      <div class="form-section">Staff Basic Details</div>
      <div class="profile-grid">
        <div class="profile-item"><span class="pl">Serial No.</span><span class="pv">${escapeHTML(s.serial_no || '–')}</span></div>
        <div class="profile-item"><span class="pl">Role</span><span class="pv">${escapeHTML(s.role || '–')}</span></div>
        <div class="profile-item"><span class="pl">Gender</span><span class="pv">${escapeHTML(s.gender || '–')}</span></div>
        <div class="profile-item"><span class="pl">DOB</span><span class="pv">${fmtDate(s.dob)}</span></div>
        <div class="profile-item"><span class="pl">Blood Group</span><span class="pv">${escapeHTML(meta.blood_group || '–')}</span></div>
        <div class="profile-item"><span class="pl">Qualification</span><span class="pv">${escapeHTML(meta.qualification || '–')}</span></div>
        <div class="profile-item"><span class="pl">Shift Timing</span><span class="pv">${escapeHTML(s.shift_timing || '–')}</span></div>
        <div class="profile-item"><span class="pl">Joining Date</span><span class="pv">${fmtDate(s.join_date)}</span></div>
        <div class="profile-item"><span class="pl">Status</span><span class="pv"><span class="badge ${s.status}">${escapeHTML((s.status || '').toUpperCase())}</span></span></div>
      </div>
      <div class="form-section">Contact & Emergency Info</div>
      <div class="profile-grid">
        <div class="profile-item"><span class="pl">Mobile Number</span><span class="pv">${escapeHTML(s.contact_no || '–')}</span></div>
        <div class="profile-item"><span class="pl">Emergency Contact</span><span class="pv">${escapeHTML(meta.emergency_contact || '–')}</span></div>
        <div class="profile-item" style="grid-column: 1 / -1;"><span class="pl">Address</span><span class="pv">${escapeHTML(s.address || '–')}</span></div>
      </div>
      <div class="form-section">ID & Bank Details</div>
      <div class="profile-grid">
        <div class="profile-item"><span class="pl">Aadhar Card</span><span class="pv">${maskAadhar(meta.aadhar_card)}</span></div>
        <div class="profile-item"><span class="pl">PAN Card</span><span class="pv">${escapeHTML(meta.pan_card || '–')}</span></div>
        <div class="profile-item"><span class="pl">Bank Name</span><span class="pv">${escapeHTML(s.bank_name || '–')}</span></div>
        <div class="profile-item"><span class="pl">Branch Name</span><span class="pv">${escapeHTML(meta.branch_name || '–')}</span></div>
        <div class="profile-item"><span class="pl">Account No</span><span class="pv">${maskAcc(s.account_no)}</span></div>
        <div class="profile-item"><span class="pl">IFSC Code</span><span class="pv">${escapeHTML(s.ifsc_code || '–')}</span></div>
      </div>`;
  }
  if (modalEl) modalEl.classList.add('show');
}
window.openStaffProfile = openStaffProfile;

function printSelectedProfile() {
  const titleText = document.getElementById('profileModalTitle')?.textContent || '';
  const bodyEl = document.getElementById('profileBody');
  const staffId = bodyEl?.getAttribute('data-staff-id') || '';
  const childId = bodyEl?.getAttribute('data-child-id') || '';

 // Staff Profile Print
  if (staffId && (!childId || titleText.includes('Staff Profile'))) {
    const s = allStaffCache.find(x => String(x.id) === String(staffId));
    if (!s) {
      alert('⚠️ Staff record nahi mila, profile dobara kholkar try karo.');
      return;
    }
    const meta = parseStaffMeta(s);
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="margin:0;">Alembic GFC - Staff Profile</h2>
        <p style="margin:5px 0;font-size:14px;">Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
      </div>
      <div style="border:1px solid #000;padding:15px;margin-bottom:20px;">
        <h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:5px;">Staff Basic Details</h3>
        <table style="width:100%;font-size:13px;">
          <tr><td style="width:22%;font-weight:bold;">Name:</td><td>${escapeHTML(s.full_name || '–')}</td><td style="width:22%;font-weight:bold;">Serial No.:</td><td>${escapeHTML(s.serial_no || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Role:</td><td>${escapeHTML(s.role || '–')}</td><td style="font-weight:bold;">Shift Timing:</td><td>${escapeHTML(s.shift_timing || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Gender:</td><td>${escapeHTML(s.gender || '–')}</td><td style="font-weight:bold;">DOB:</td><td>${fmtDate(s.dob)}</td></tr>
          <tr><td style="font-weight:bold;">Blood Group:</td><td>${escapeHTML(meta.blood_group || '–')}</td><td style="font-weight:bold;">Qualification:</td><td>${escapeHTML(meta.qualification || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Joining Date:</td><td>${fmtDate(s.join_date)}</td><td style="font-weight:bold;">Status:</td><td>${escapeHTML((s.status || '').toUpperCase())}</td></tr>
        </table>
      </div>
      <div style="border:1px solid #000;padding:15px;margin-bottom:20px;">
        <h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:5px;">Contact & Emergency Info</h3>
        <table style="width:100%;font-size:13px;">
          <tr><td style="width:22%;font-weight:bold;">Mobile Number:</td><td>${escapeHTML(s.contact_no || '–')}</td><td style="width:22%;font-weight:bold;">Emergency No.:</td><td>${escapeHTML(meta.emergency_contact || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Address:</td><td colspan="3">${escapeHTML(s.address || '–')}</td></tr>
        </table>
      </div>
      <div style="border:1px solid #000;padding:15px;margin-bottom:20px;">
        <h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:5px;">ID & Bank Details</h3>
        <table style="width:100%;font-size:13px;">
          <tr><td style="width:22%;font-weight:bold;">Aadhaar Card:</td><td>${escapeHTML(maskAadhar(meta.aadhar_card))}</td><td style="width:22%;font-weight:bold;">PAN Card:</td><td>${escapeHTML(meta.pan_card || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Bank Name:</td><td>${escapeHTML(s.bank_name || '–')}</td><td style="font-weight:bold;">Branch Name:</td><td>${escapeHTML(meta.branch_name || '–')}</td></tr>
          <tr><td style="font-weight:bold;">Account No.:</td><td>${escapeHTML(maskAcc(s.account_no))}</td><td style="font-weight:bold;">IFSC Code:</td><td>${escapeHTML(s.ifsc_code || '–')}</td></tr>
        </table>
      </div>
    `;
    setTimeout(() => { window.print(); }, 250);
    return;
  }

  // Child Profile Print (Date Filter Modal)
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date();
  past.setFullYear(past.getFullYear() - 3);

  if (document.getElementById('printFromDate')) document.getElementById('printFromDate').value = past.toISOString().slice(0, 10);
  if (document.getElementById('printToDate')) document.getElementById('printToDate').value = today;
  if (document.getElementById('profilePrintFilterModal')) document.getElementById('profilePrintFilterModal').classList.add('show');
}
window.printSelectedProfile = printSelectedProfile;

async function executeProfilePrint() {
  const client = getClient();
  if (!client) return;
  const fromDate = document.getElementById('printFromDate')?.value;
  const toDate = document.getElementById('printToDate')?.value;
  const childId = document.getElementById('profileBody')?.getAttribute('data-child-id');

  if (!childId) {
    alert('⚠️ Child profile select nahi hai.');
    return;
  }
  if (!fromDate || !toDate) return alert('Select dates first');

  const btn = document.querySelector('#profilePrintFilterModal .btn-primary');
  if (btn) {
    btn.textContent = 'Loading...';
    btn.disabled = true;
  }

  try {
    const [cReportsRes, hwRes, srRes, actRes, incRes] = await Promise.all([
      client.from('counselor_reports').select('*').eq('child_id', childId).gte('report_date', fromDate).lte('report_date', toDate).order('report_date', { ascending: false }),
      client.from('child_health').select('*').eq('child_id', childId).gte('record_date', fromDate).lte('record_date', toDate).order('record_date', { ascending: false }),
      client.from('child_education').select('*').eq('child_id', childId),
      client.from('child_activities').select('*').eq('child_id', childId),
      client.from('child_incidents').select('*').eq('child_id', childId)
    ]);

    const cReports = cReportsRes.data || [];
    const hwData = hwRes.data || [];
    const srData = srRes.data || [];
    const actData = actRes.data || [];
    const incData = incRes.data || [];

    let c = (currentProfileChildData && String(currentProfileChildData.id) === String(childId))
      ? currentProfileChildData
      : allChildrenCache.find(x => String(x.id) === String(childId));

    if (!c) {
      const { data: singleChild } = await client.from('children').select('*').eq('id', childId).maybeSingle();
      c = singleChild;
    }

    if (!c) {
      alert('⚠️ Child record nahi mila, profile dobara kholkar try karo.');
      return;
    }

    const childAge = calcAge(c.dob) || 10;

    let hwHTML = '<div style="padding:10px;font-size:0.85rem;color:#6b7280;">No growth records found in this period.</div>';
    if (hwData.length > 0) {
      hwHTML = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #000;">
        <thead><tr style="background:#f3f4f6;">
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Date</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Height</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Weight</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">BMI</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Status</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Sickness Details</th>
        </tr></thead><tbody>
        ${hwData.map(h => {
          const bmiData = getPediatricBMI(childAge, c.gender, h.height_cm, h.weight_kg);
          const sickClean = cleanSicknessText(h.sickness_details || h.sickness, h.is_sick);
          return `<tr>
            <td style="border:1px solid #000;padding:7px 8px;white-space:nowrap;">${fmtDate(h.record_date)}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${h.height_cm || '–'}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${h.weight_kg || '–'}</td>
            <td style="border:1px solid #000;padding:7px 8px;"><b>${bmiData.bmi || '–'}</b></td>
            <td style="border:1px solid #000;padding:7px 8px;">${bmiData.status}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(sickClean)}</td>
          </tr>`;
        }).join('')}
      </tbody></table>`;
    }

    let eduHTML = '<div style="padding:10px;font-size:0.85rem;color:#6b7280;">No education records found.</div>';
    if (srData.length > 0) {
      eduHTML = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #000;">
        <thead><tr style="background:#f3f4f6;">
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Year</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Term</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Subjects (Marks)</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Percentage</th>
        </tr></thead><tbody>
        ${srData.map(s => {
          const marksObj = parseSubjectMarks(s.subject_marks);
          const subjStr = Object.entries(marksObj).map(([k, v]) => `${escapeHTML(k)}: ${escapeHTML(v)}`).join(', ') || '–';
          return `<tr>
            <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(s.academic_year || '–')}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(s.exam_term || '–')}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${subjStr}</td>
            <td style="border:1px solid #000;padding:7px 8px;">${s.percentage != null && s.percentage !== '' ? escapeHTML(s.percentage) + '%' : '–'}</td>
          </tr>`;
        }).join('')}
      </tbody></table>`;
    }

    let timelineHTML = '<div style="padding:10px;font-size:0.85rem;color:#6b7280;">No counselling reports in this period.</div>';
    if (cReports.length > 0) {
      timelineHTML = cReports.map(r => `
        <div style="margin-bottom:10px;padding:8px 10px;border:1px solid #e5e7eb;border-radius:6px;">
          <div style="font-size:12px;font-weight:bold;margin-bottom:3px;">Date: ${fmtDate(r.report_date)}</div>
          <div style="font-size:12px;margin-bottom:2px;">Counselor: ${escapeHTML(r.counselor_name || 'N/A')}</div>
          <div style="font-size:12px;margin-bottom:2px;">Behavior: ${escapeHTML(r.behavior_notes || 'N/A')}</div>
          <div style="font-size:12px;">Notes: ${escapeHTML(r.progress_notes || '')}</div>
        </div>`).join('');
    }

    let actHTML = '<div style="padding:10px;font-size:0.85rem;color:#6b7280;">No activities found.</div>';
    if (actData.length > 0) {
      actHTML = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #000;">
        <thead><tr style="background:#f3f4f6;">
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Activity</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Duration</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Achievements</th>
        </tr></thead><tbody>
        ${actData.map(a => `<tr>
          <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(a.activity_name)}</td>
          <td style="border:1px solid #000;padding:7px 8px;">${fmtDate(a.start_date)} to ${a.end_date ? fmtDate(a.end_date) : 'Ongoing'}</td>
          <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(a.achievements || '–')}</td>
        </tr>`).join('')}
      </tbody></table>`;
    }

    let incHTML = '<div style="padding:10px;font-size:0.85rem;color:#6b7280;">No incidents found.</div>';
    if (incData.length > 0) {
      incHTML = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #000;">
        <thead><tr style="background:#f3f4f6;">
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Date</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Type</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Reason</th>
          <th style="border:1px solid #000;padding:7px 8px;text-align:left;">Status</th>
        </tr></thead><tbody>
        ${incData.map(i => `<tr>
          <td style="border:1px solid #000;padding:7px 8px;">${fmtDate(i.incident_date)}</td>
          <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(i.incident_type)}</td>
          <td style="border:1px solid #000;padding:7px 8px;">${escapeHTML(i.reason)}</td>
          <td style="border:1px solid #000;padding:7px 8px;">${i.is_resolved ? 'Resolved' : 'Pending'}</td>
        </tr>`).join('')}
      </tbody></table>`;
    }

    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="margin:0;">Alembic GFC - Child Profile</h2>
        <p style="margin:5px 0;font-size:14px;">Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
      </div>

      <div style="border:1px solid #000;border-radius:4px;padding:15px;margin-bottom:18px;">
        <h3 style="margin-top:0;margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:6px;">Basic Information</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Name:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.full_name)}</td>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">GFC ID:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.gfc_id || '–')}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Age:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${childAge} Years</td>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Category:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.child_type || '–')}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Gender:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.gender || '–')}</td>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">DOB:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${fmtDate(c.dob)}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;">Blood Group:</td>
            <td style="padding:7px 8px;">${escapeHTML(c.blood_group || '–')}</td>
            <td style="font-weight:bold;padding:7px 8px;">School / Class:</td>
            <td style="padding:7px 8px;">${escapeHTML(cleanSchoolClassText([c.present_school, c.current_class ? `(${c.current_class})` : ''].filter(Boolean).join(' ')))}</td>
          </tr>
        </table>
      </div>

      <div style="border:1px solid #000;border-radius:4px;padding:15px;margin-bottom:18px;">
        <h3 style="margin-top:0;margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:6px;">Guardian Info</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Guardian Name:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.guardian_name || '–')}</td>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Relation:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.relation || '–')}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;">Mobile Number:</td>
            <td style="padding:7px 8px;">${escapeHTML(c.contact_no || '–')}</td>
            <td style="font-weight:bold;padding:7px 8px;">Address:</td>
            <td style="padding:7px 8px;">${escapeHTML(c.full_address || '–')}</td>
          </tr>
        </table>
      </div>

      <div style="border:1px solid #000;border-radius:4px;padding:15px;margin-bottom:18px;">
        <h3 style="margin-top:0;margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:6px;">ID & Bank Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Aadhaar Card:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(maskAadhar(c.aadhar_card))}</td>
            <td style="width:18%;font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Account Holder:</td>
            <td style="width:32%;padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.account_holder_name || '–')}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Bank Name:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.bank_name || '–')}</td>
            <td style="font-weight:bold;padding:7px 8px;border-bottom:1px solid #e5e7eb;">Branch Name:</td>
            <td style="padding:7px 8px;border-bottom:1px solid #e5e7eb;">${escapeHTML(c.branch_name || '–')}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:7px 8px;">Account No.:</td>
            <td style="padding:7px 8px;">${escapeHTML(maskAcc(c.account_number || c.account_no || c.bank_account))}</td>
            <td style="font-weight:bold;padding:7px 8px;">IFSC Code:</td>
            <td style="padding:7px 8px;">${escapeHTML(c.ifsc_code || '–')}</td>
          </tr>
        </table>
      </div>

      ${renderExcelProfileSectionsHTML(c)}

      <div style="margin-bottom:18px;">
        <h3 style="border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">🏥 Health Logs (${hwData.length} Records)</h3>
        ${hwHTML}
      </div>

      <div style="margin-bottom:18px;">
        <h3 style="border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">🎓 Education History</h3>
        ${eduHTML}
      </div>

      <div style="margin-bottom:18px;">
        <h3 style="border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">🎨 Activities</h3>
        ${actHTML}
      </div>

      <div style="margin-bottom:18px;">
        <h3 style="border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">⚠️ Incidents</h3>
        ${incHTML}
      </div>

      <div style="margin-bottom:18px;">
        <h3 style="border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">🧠 Counselling Timeline (${fromDate} to ${toDate})</h3>
        ${timelineHTML}
      </div>
    `;

    if (document.getElementById('profilePrintFilterModal')) document.getElementById('profilePrintFilterModal').classList.remove('show');
    setTimeout(() => { window.print(); }, 300);
  } catch (err) {
    alert('Print Error: ' + err.message);
  } finally {
    if (btn) {
      btn.textContent = '🖨️ Print Now';
      btn.disabled = false;
    }
  }
}
window.executeProfilePrint = executeProfilePrint;

// ==========================================
// EXTERNAL PRINT & EXCEL EXPORT (CHILDREN + STAFF)
// ==========================================
function openPrintModal() {
  const modal = document.getElementById('printModal');
  if (modal) modal.classList.add('show');
}
window.openPrintModal = openPrintModal;

function executePrint() {
  const printArea = document.getElementById('printArea');
  if (!printArea) return;
  printArea.innerHTML = '';

  const selectedChildOpts = Array.from(document.querySelectorAll('.print-child-opt:checked')).map(cb => cb.value);
  const childStatusOpt = document.querySelector('input[name="printChildStatus"]:checked')?.value || 'active';
  const staffOption = document.querySelector('input[name="printStaff"]:checked')?.value || 'none';
  const staffStatusOpt = document.querySelector('input[name="printStaffStatus"]:checked')?.value || 'active';

  let html = `<div class="print-title">Alembic GFC Report</div><div style="text-align:center;margin-bottom:16px;font-size:13px;"><small>Generated on: ${new Date().toLocaleDateString('en-GB')}</small></div>`;

  if (selectedChildOpts.length > 0) {
    let children = allChildrenCache.slice();
    if (childStatusOpt === 'active') children = children.filter(c => c.status === 'active');
    if (childStatusOpt === 'inactive') children = children.filter(c => c.status === 'inactive');

    html += `<h3 style="margin-top:14px;margin-bottom:8px;border-bottom:1px solid #ccc;padding-bottom:4px;">Children List (${childStatusOpt.toUpperCase()})</h3><table class="print-table"><thead><tr>`;
    if (selectedChildOpts.includes('basic')) html += `<th>Sr</th><th>GFC ID</th><th>Name</th><th>Category</th><th>Age</th><th>Gender</th>`;
    if (selectedChildOpts.includes('school')) html += `<th>School</th><th>Class</th><th>Medium</th>`;
    if (selectedChildOpts.includes('guardian')) html += `<th>Guardian</th><th>Relation</th><th>Mobile</th><th>Address</th>`;
    if (selectedChildOpts.includes('bank')) html += `<th>Holder</th><th>Bank</th><th>Branch</th><th>Account No</th><th>IFSC</th>`;
    if (selectedChildOpts.includes('aadhar')) html += `<th>Aadhar</th>`;
    html += `</tr></thead><tbody>`;

    if (!children.length) {
      const colCount = document.querySelectorAll('.print-table thead th').length || 1;
      html += `<tr><td colspan="${colCount}" style="text-align:center;">No records found.</td></tr>`;
    } else {
      children.forEach((c, index) => {
        const meta = getChildMeta(c);
        html += `<tr>`;
        if (selectedChildOpts.includes('basic')) {
          html += `<td>${index + 1}</td><td>${escapeHTML(c.gfc_id || '–')}</td><td>${escapeHTML(c.full_name)}</td><td>${escapeHTML(c.child_type || '–')}</td><td>${calcAge(c.dob) ?? '–'}</td><td>${escapeHTML(c.gender || '–')}</td>`;
        }
        if (selectedChildOpts.includes('school')) {
          html += `<td>${escapeHTML(c.present_school || '–')}</td><td>${escapeHTML(c.current_class || '–')}</td><td>${escapeHTML(meta.school_medium || '–')}</td>`;
        }
        if (selectedChildOpts.includes('guardian')) {
          html += `<td>${escapeHTML(c.guardian_name || '–')}</td><td>${escapeHTML(c.relation || '–')}</td><td>${escapeHTML(c.contact_no || '–')}</td><td>${escapeHTML(c.full_address || '–')}</td>`;
        }
        if (selectedChildOpts.includes('bank')) {
          html += `<td>${escapeHTML(c.account_holder_name || '–')}</td><td>${escapeHTML(c.bank_name || '–')}</td><td>${escapeHTML(c.branch_name || '–')}</td><td>${escapeHTML(maskAcc(c.account_number))}</td><td>${escapeHTML(c.ifsc_code || '–')}</td>`;
        }
        if (selectedChildOpts.includes('aadhar')) {
          html += `<td>${maskAadhar(c.aadhar_card)}</td>`;
        }
        html += `</tr>`;
      });
    }
    html += `</tbody></table>`;
  }

  if (staffOption !== 'none') {
    let staffList = allStaffCache.slice();
    if (staffStatusOpt === 'active') staffList = staffList.filter(s => s.status === 'active');
    if (staffStatusOpt === 'inactive') staffList = staffList.filter(s => s.status === 'inactive');

    html += `<h3 style="margin-top:20px;margin-bottom:8px;border-bottom:1px solid #ccc;padding-bottom:4px;">Staff List (${staffStatusOpt.toUpperCase()})</h3><table class="print-table"><thead><tr><th>Sr</th><th>Name</th><th>Role</th><th>Shift</th><th>Contact</th>`;
    if (staffOption === 'full') html += `<th>Qualification</th><th>Bank</th><th>Account No</th><th>IFSC</th>`;
    html += `</tr></thead><tbody>`;

    if (!staffList.length) {
      html += `<td colspan="${staffOption === 'full' ? 9 : 5}" style="text-align:center;">No staff records found.</td>`;
    } else {
      staffList.forEach((s, index) => {
        const sMeta = parseStaffMeta(s);
        html += `<tr><td>${index + 1}</td><td>${escapeHTML(s.full_name)}</td><td>${escapeHTML(s.role || '–')}</td><td>${escapeHTML(s.shift_timing || '–')}</td><td>${escapeHTML(s.contact_no || '–')}</td>`;
        if (staffOption === 'full') {
          html += `<td>${escapeHTML(sMeta.qualification || '–')}</td><td>${escapeHTML(s.bank_name || '–')}</td><td>${escapeHTML(maskAcc(s.account_no))}</td><td>${escapeHTML(s.ifsc_code || '–')}</td>`;
        }
        html += `</tr>`;
      });
    }
    html += `</tbody></table>`;
  }

  if (selectedChildOpts.length === 0 && staffOption === 'none') {
    html += `<div style="padding:20px;text-align:center;color:#64748b;">Please select at least one Children or Staff print option.</div>`;
  }

  printArea.innerHTML = html;
  if (document.getElementById('printModal')) document.getElementById('printModal').classList.remove('show');
  setTimeout(() => { window.print(); }, 300);
}
window.executePrint = executePrint;

function executeExcel() {
  const selectedChildOpts = Array.from(document.querySelectorAll('.print-child-opt:checked')).map(cb => cb.value);
  const childStatusOpt = document.querySelector('input[name="printChildStatus"]:checked')?.value || 'active';
  const staffOption = document.querySelector('input[name="printStaff"]:checked')?.value || 'none';
  const staffStatusOpt = document.querySelector('input[name="printStaffStatus"]:checked')?.value || 'active';

  let children = allChildrenCache.slice();
  if (childStatusOpt === 'active') children = children.filter(c => c.status === 'active');
  if (childStatusOpt === 'inactive') children = children.filter(c => c.status === 'inactive');

  const activeChildCols = selectedChildOpts.length > 0 ? selectedChildOpts : ['basic'];
  let csvContent = '';
  const headers = [];
  if (activeChildCols.includes('basic')) headers.push('Sr No', 'GFC ID', 'Full Name', 'Category', 'Age', 'Gender');
  if (activeChildCols.includes('school')) headers.push('School', 'Class', 'Medium');
  if (activeChildCols.includes('guardian')) headers.push('Guardian Name', 'Relation', 'Mobile No', 'Address');
  if (activeChildCols.includes('bank')) headers.push('Account Holder', 'Bank', 'Branch', 'Account No', 'IFSC');
  if (activeChildCols.includes('aadhar')) headers.push('Aadhar No');
  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

  children.forEach((c, index) => {
    const meta = getChildMeta(c);
    const row = [];
    if (activeChildCols.includes('basic')) row.push(index + 1, c.gfc_id || '-', c.full_name, c.child_type || '-', calcAge(c.dob) || '-', c.gender || '-');
    if (activeChildCols.includes('school')) row.push(c.present_school || '-', c.current_class || '-', meta.school_medium || '-');
    if (activeChildCols.includes('guardian')) row.push(c.guardian_name || '-', c.relation || '-', c.contact_no || '-', c.full_address || '-');
    if (activeChildCols.includes('bank')) row.push(c.account_holder_name || '-', c.bank_name || '-', c.branch_name || '-', maskAcc(c.account_number), c.ifsc_code || '-');
    if (activeChildCols.includes('aadhar')) row.push(maskAadhar(c.aadhar_card));
    const formattedRow = row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    csvContent += formattedRow + '\n';
  });

  if (staffOption !== 'none') {
    let staffList = allStaffCache.slice();
    if (staffStatusOpt === 'active') staffList = staffList.filter(s => s.status === 'active');
    if (staffStatusOpt === 'inactive') staffList = staffList.filter(s => s.status === 'inactive');

    csvContent += '\n';
    const staffHeaders = ['Sr No', 'Staff Name', 'Role', 'Shift Timing', 'Contact No', 'Status'];
    if (staffOption === 'full') staffHeaders.push('Qualification', 'Bank', 'Account No', 'IFSC');
    csvContent += staffHeaders.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

    staffList.forEach((s, idx) => {
      const sMeta = parseStaffMeta(s);
      const sRow = [idx + 1, s.full_name, s.role || '-', s.shift_timing || '-', s.contact_no || '-', (s.status || '').toUpperCase()];
      if (staffOption === 'full') sRow.push(sMeta.qualification || '-', s.bank_name || '-', maskAcc(s.account_no), s.ifsc_code || '-');
      csvContent += sRow.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `GFC_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  if (document.getElementById('printModal')) document.getElementById('printModal').classList.remove('show');
}
window.executeExcel = executeExcel;

// ==========================================
// FORMS & EDITORS (CHILD + STAFF)
// ==========================================
function handlePhotoUpload(event, urlInputId, previewId) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      const max_size = 250;
      if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } }
      else { if (height > max_size) { width *= max_size / height; height = max_size; } }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      document.getElementById(urlInputId).value = dataUrl;
      const preview = document.getElementById(previewId);
      if (preview) {
        preview.src = dataUrl;
        preview.style.display = 'block';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function calcAge18() {
  const dob = document.getElementById('fDob').value;
  document.getElementById('fAge').value = calcAge(dob) || '';
  document.getElementById('f18').value = calc18(dob) || '';
}

function openForm() {
  document.getElementById('editId').value = '';
  ['fSerialNo', 'fGfcId', 'fPhotoUrl', 'fFirstName', 'fFatherName', 'fLastName', 'fChildType', 'fGender', 'fDob', 'fAge', 'fBloodGroup', 'f18', 'fCwcOrder', 'fCwcOrderNo', 'fGfcJoin', 'fFosterBenefit', 'fCwcLeave', 'fAadhar', 'fAccHolder', 'fBank', 'fBranch', 'fAccNo', 'fIfsc', 'fGuardian', 'fRelation', 'fContact', 'fAltContact', 'fAddress', 'fPrevCci', 'fPresentSchool', 'fCurrentClass', 'fMedium', 'fSchoolRemark', 'fFamHistory', 'fHealthNotes', 'fSocialHistory', 'fEduHistory', 'fExtraActivities', 'fHobbies', 'fTriggersCoping', 'fGoals', 'fStrengthWeakness', 'fConclusion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const photoUp = document.getElementById('fPhotoUpload');
  if (photoUp) photoUp.value = '';
  const photoPrev = document.getElementById('fPhotoPreview');
  if (photoPrev) photoPrev.style.display = 'none';
  if (document.getElementById('fStatus')) document.getElementById('fStatus').value = 'active';
  if (document.getElementById('formTitle')) document.getElementById('formTitle').textContent = '➕ Add New Child';
  document.getElementById('formModal').classList.add('show');
}

function openStaffForm() {
  document.getElementById('editStaffId').value = '';
  ['sSerialNo', 'sName', 'sPhotoUrl', 'sRole', 'sGender', 'sDob', 'sBloodGroup', 'sQualification', 'sShift', 'sJoinDate', 'sContact', 'sEmergencyContact', 'sAddress', 'sAadhar', 'sPan', 'sBank', 'sBranch', 'sAccNo', 'sIfsc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const photoUp = document.getElementById('sPhotoUpload');
  if (photoUp) photoUp.value = '';
  const photoPrev = document.getElementById('sPhotoPreview');
  if (photoPrev) photoPrev.style.display = 'none';
  if (document.getElementById('sStatus')) document.getElementById('sStatus').value = 'active';
  if (document.getElementById('staffFormTitle')) document.getElementById('staffFormTitle').textContent = '➕ Add New Staff';
  document.getElementById('staffModal').classList.add('show');
}

async function editChildById(id) {
  const client = getClient();
  if (!client) return;
  const { data, error } = await client.from('children').select('*').eq('id', id).single();
  if (error || !data) { alert('❌ Not found'); return; }
  openForm();
  document.getElementById('editId').value = data.id;
  const parts = (data.full_name || '').trim().split(/\s+/);
  if (document.getElementById('fFirstName')) document.getElementById('fFirstName').value = parts[0] || '';
  if (document.getElementById('fFatherName')) document.getElementById('fFatherName').value = parts[1] || '';
  if (document.getElementById('fLastName')) document.getElementById('fLastName').value = parts.slice(2).join(' ') || '';

  const fields = {
    fSerialNo: 'serial_no', fGfcId: 'gfc_id', fPhotoUrl: 'photo_url', fChildType: 'child_type', fGender: 'gender',
    fDob: 'dob', fAge: 'age', fBloodGroup: 'blood_group', f18: 'date_18_completed', fCwcOrder: 'cwc_order_date',
    fGfcJoin: 'gfc_join_date', fFosterBenefit: 'foster_care_benefit_date', fCwcLeave: 'cwc_leave_order_date',
    fAadhar: 'aadhar_card', fAccHolder: 'account_holder_name', fBank: 'bank_name', fBranch: 'branch_name',
    fAccNo: 'account_number', fIfsc: 'ifsc_code', fGuardian: 'guardian_name', fRelation: 'relation',
    fContact: 'contact_no', fAddress: 'full_address', fPrevCci: 'previous_cci', fPresentSchool: 'present_school',
    fCurrentClass: 'current_class', fSchoolRemark: 'school_remark', fStatus: 'status'
  };
  for (const k in fields) {
    if (document.getElementById(k)) document.getElementById(k).value = data[fields[k]] || '';
  }
  if (document.getElementById('fDob')) document.getElementById('fDob').value = data.dob || '';
  if (document.getElementById('fAge')) document.getElementById('fAge').value = calcAge(data.dob) || '';
  if (document.getElementById('f18')) document.getElementById('f18').value = calc18(data.dob) || '';
  if (data.photo_url && document.getElementById('fPhotoPreview')) {
    const preview = document.getElementById('fPhotoPreview');
    preview.src = data.photo_url;
    preview.style.display = 'block';
  }
  populateExcelFormFields(data);
  if (document.getElementById('formTitle')) document.getElementById('formTitle').textContent = '✏️ Edit Child – ' + data.full_name;
}

async function editStaffById(id) {
  const client = getClient();
  if (!client) return;
  const { data, error } = await client.from('staff').select('*').eq('id', id).single();
  if (error || !data) { alert('❌ Not found'); return; }
  openStaffForm();
  document.getElementById('editStaffId').value = data.id;
  if (document.getElementById('sSerialNo')) document.getElementById('sSerialNo').value = data.serial_no || '';
  if (document.getElementById('sName')) document.getElementById('sName').value = data.full_name || '';
  if (document.getElementById('sPhotoUrl')) document.getElementById('sPhotoUrl').value = data.photo_url || '';
  if (document.getElementById('sRole')) document.getElementById('sRole').value = data.role || '';
  if (document.getElementById('sGender')) document.getElementById('sGender').value = data.gender || 'Male';
  if (document.getElementById('sDob')) document.getElementById('sDob').value = data.dob || '';
  if (document.getElementById('sShift')) document.getElementById('sShift').value = data.shift_timing || '';
  if (document.getElementById('sJoinDate')) document.getElementById('sJoinDate').value = data.join_date || '';
  if (document.getElementById('sContact')) document.getElementById('sContact').value = data.contact_no || '';
  if (document.getElementById('sAddress')) document.getElementById('sAddress').value = data.address || '';
  if (document.getElementById('sBank')) document.getElementById('sBank').value = data.bank_name || '';
  if (document.getElementById('sAccNo')) document.getElementById('sAccNo').value = data.account_no || '';
  if (document.getElementById('sIfsc')) document.getElementById('sIfsc').value = data.ifsc_code || '';
  if (document.getElementById('sStatus')) document.getElementById('sStatus').value = data.status || 'active';

  const meta = parseStaffMeta(data);
  Object.entries(EXTRA_STAFF_META_FIELDS).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.value = meta[key] || '';
  });

  if (data.photo_url && document.getElementById('sPhotoPreview')) {
    const preview = document.getElementById('sPhotoPreview');
    preview.src = data.photo_url;
    preview.style.display = 'block';
  }
  if (document.getElementById('staffFormTitle')) document.getElementById('staffFormTitle').textContent = '✏️ Edit Staff – ' + data.full_name;
}

async function saveChild() {
  const client = getClient();
  if (!client) return;
  const fName = document.getElementById('fFirstName').value.trim();
  const schoolName = document.getElementById('fPresentSchool').value.trim();
  const statusVal = document.getElementById('fStatus').value;
  if (!fName) return alert('First Name is required');
  if (statusVal === 'active' && !schoolName) return alert('⚠️ Present School is required for Active children!');

  const id = document.getElementById('editId').value;
  const excelBlock = serializeExcelSections();

  const payload = {
    serial_no: document.getElementById('fSerialNo').value || null,
    gfc_id: document.getElementById('fGfcId').value.trim() || null,
    photo_url: document.getElementById('fPhotoUrl').value || null,
    full_name: [fName, document.getElementById('fFatherName').value.trim(), document.getElementById('fLastName').value.trim()].filter(Boolean).join(' '),
    child_type: document.getElementById('fChildType').value.trim() || null,
    gender: document.getElementById('fGender').value,
    dob: document.getElementById('fDob').value || null,
    status: statusVal,
    blood_group: document.getElementById('fBloodGroup').value || null,
    date_18_completed: document.getElementById('f18').value || null,
    cwc_order_date: document.getElementById('fCwcOrder').value || null,
    gfc_join_date: document.getElementById('fGfcJoin').value || null,
    foster_care_benefit_date: document.getElementById('fFosterBenefit').value || null,
    cwc_leave_order_date: document.getElementById('fCwcLeave').value || null,
    aadhar_card: document.getElementById('fAadhar').value.trim() || null,
    account_holder_name: document.getElementById('fAccHolder').value.trim() || null,
    bank_name: document.getElementById('fBank').value.trim() || null,
    branch_name: document.getElementById('fBranch').value.trim() || null,
    account_number: document.getElementById('fAccNo').value.trim() || null,
    ifsc_code: document.getElementById('fIfsc').value.trim() || null,
    guardian_name: document.getElementById('fGuardian').value.trim() || null,
    relation: document.getElementById('fRelation').value.trim() || null,
    contact_no: document.getElementById('fContact').value.trim() || null,
    full_address: document.getElementById('fAddress').value.trim() || null,
    previous_cci: document.getElementById('fPrevCci').value.trim() || null,
    present_school: schoolName || null,
    current_class: document.getElementById('fCurrentClass').value.trim() || null,
    school_remark: document.getElementById('fSchoolRemark').value.trim() || null,
    health_notes: document.getElementById('fHealthNotes').value.trim() || null,
    remark: excelBlock || null
  };

  try {
    let res;
    if (id) res = await client.from('children').update(payload).eq('id', id);
    else res = await client.from('children').insert(payload);
    if (res.error) throw new Error(res.error.message);
    alert('✅ Child Data Saved Successfully!');
    document.getElementById('formModal').classList.remove('show');
    await loadBaseData();
    await loadAdminTables();
  } catch (err) {
    alert('❌ Save Failed!\n\nError: ' + err.message);
  }
}

async function saveStaff() {
  const client = getClient();
  if (!client) return;
  const name = document.getElementById('sName').value.trim();
  if (!name) return alert('Name is required');
  const id = document.getElementById('editStaffId').value;
  const metaStr = serializeStaffMeta();
  const payload = {
    serial_no: document.getElementById('sSerialNo').value || null,
    full_name: name,
    photo_url: document.getElementById('sPhotoUrl').value || null,
    role: document.getElementById('sRole').value.trim() || null,
    gender: document.getElementById('sGender').value,
    dob: document.getElementById('sDob').value || null,
    shift_timing: document.getElementById('sShift').value.trim() || null,
    join_date: document.getElementById('sJoinDate').value || null,
    contact_no: document.getElementById('sContact').value.trim() || null,
    address: document.getElementById('sAddress').value.trim() || null,
    bank_name: document.getElementById('sBank').value.trim() || null,
    account_no: document.getElementById('sAccNo').value.trim() || null,
    ifsc_code: document.getElementById('sIfsc').value.trim() || null,
    status: document.getElementById('sStatus').value
  };
  if (metaStr) payload.notes = metaStr;

  try {
    let res;
    if (id) res = await client.from('staff').update(payload).eq('id', id);
    else res = await client.from('staff').insert(payload);
    if (res.error && metaStr) {
      delete payload.notes;
      if (id) res = await client.from('staff').update(payload).eq('id', id);
      else res = await client.from('staff').insert(payload);
    }
    if (res.error) throw new Error(res.error.message);
    alert('✅ Staff Data Saved Successfully!');
    document.getElementById('staffModal').classList.remove('show');
    await loadBaseData();
    await loadAdminTables();
  } catch (err) {
    alert('❌ Save Failed!\n\nError: ' + err.message);
  }
}

// ==========================================
// PHOTO GALLERY MODULE (Supabase Bucket + Table)
// ==========================================
const GALLERY_BUCKET = 'gfc-gallery';
let allGalleryPhotosCache = [];
let lightboxList = [];
let lightboxIndex = 0;

function openGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (!modal) return;

  const dateEl = document.getElementById('galDate');
  if (dateEl && !dateEl.value) {
    dateEl.value = new Date().toISOString().slice(0, 10);
  }

  syncGalleryAdminControls();
  modal.classList.add('show');
  loadGalleryPhotos();
}
window.openGalleryModal = openGalleryModal;

function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (modal) modal.classList.remove('show');
}
window.closeGalleryModal = closeGalleryModal;

function syncGalleryAdminControls() {
  const uploadBox = document.getElementById('galleryAdminUploadBox');
  const guestNotice = document.getElementById('galleryGuestNotice');
  if (uploadBox) uploadBox.style.display = isAdmin ? 'block' : 'none';
  if (guestNotice) guestNotice.style.display = isAdmin ? 'none' : 'flex';
}

function previewGalleryFiles(event) {
  const strip = document.getElementById('galPreviewStrip');
  if (!strip) return;
  strip.innerHTML = '';

  const files = Array.from(event.target.files || []);
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '76px';
    img.style.height = '76px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    img.style.border = '1px solid #cbd5e1';
    strip.appendChild(img);
  });
}
window.previewGalleryFiles = previewGalleryFiles;

function compressImageFile(file, maxDim = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h >= w && h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Image compression failed'));
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadGalleryPhotos() {
  if (!isAdmin) {
    alert('🔒 Sirf Admin login ke baad hi photo upload ho sakti hai!');
    return;
  }

  const client = getClient();
  if (!client) return alert('Supabase client ready nahi hai.');

  const titleInput = document.getElementById('galTitle');
  const dateInput = document.getElementById('galDate');
  const fileInput = document.getElementById('galFiles');
  const btn = document.getElementById('galUploadBtn');

  const title = (titleInput?.value || '').trim();
  const eventDate = dateInput?.value || new Date().toISOString().slice(0, 10);
  const files = Array.from(fileInput?.files || []);

  if (!title) return alert('⚠️ Event / Album Title likhna zaroori hai (e.g. Diwali Celebration).');
  if (!files.length) return alert('⚠️ Kam se kam 1 photo select karo.');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Uploading...';
  }

  try {
    for (let i = 0; i < files.length; i++) {
      const compressedBlob = await compressImageFile(files[i]);
      const safeTitleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event';
      const filePath = `${safeTitleSlug}/${Date.now()}_${i + 1}.jpg`;

      const { error: upErr } = await client.storage
        .from(GALLERY_BUCKET)
        .upload(filePath, compressedBlob, { contentType: 'image/jpeg', upsert: false });

      if (upErr) throw new Error(upErr.message);

      const { data: pubData } = client.storage.from(GALLERY_BUCKET).getPublicUrl(filePath);
      const photoUrl = pubData?.publicUrl;
      if (!photoUrl) throw new Error('Public URL generate nahi ho paya.');

      const { error: dbErr } = await client.from('gallery_photos').insert({
        title,
        photo_url: photoUrl,
        storage_path: filePath,
        event_date: eventDate
      });

      if (dbErr) throw new Error(dbErr.message);
    }

    alert(`✅ "${title}" ke under ${files.length} photo(s) upload ho gayi!`);
    if (titleInput) titleInput.value = '';
    if (fileInput) fileInput.value = '';
    const strip = document.getElementById('galPreviewStrip');
    if (strip) strip.innerHTML = '';

    await loadGalleryPhotos();
  } catch (err) {
    alert('❌ Upload Failed: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '☁️ Upload Photos';
    }
  }
}
window.uploadGalleryPhotos = uploadGalleryPhotos;

async function loadGalleryPhotos() {
  const container = document.getElementById('galleryAlbumsContainer');
  if (!container) return;

  const client = getClient();
  if (!client) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#dc2626;">Supabase client not found.</div>`;
    return;
  }

  try {
    const { data, error } = await client
      .from('gallery_photos')
      .select('*')
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    allGalleryPhotosCache = data || [];
    populateGalleryFilterDropdown();
    renderGalleryAlbums();
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#dc2626;">Gallery Load Error: ${escapeHTML(err.message)}</div>`;
  }
}

function populateGalleryFilterDropdown() {
  const select = document.getElementById('galleryEventFilter');
  if (!select) return;
  const prevVal = select.value || 'ALL';

  const titles = Array.from(new Set(allGalleryPhotosCache.map(p => (p.title || 'Untitled Event').trim())));
  select.innerHTML = `<option value="ALL">All Events (${allGalleryPhotosCache.length})</option>` +
    titles.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');

  if (prevVal === 'ALL' || titles.includes(prevVal)) {
    select.value = prevVal;
  } else {
    select.value = 'ALL';
  }
}

function renderGalleryAlbums() {
  syncGalleryAdminControls();
  const container = document.getElementById('galleryAlbumsContainer');
  if (!container) return;

  const filterVal = document.getElementById('galleryEventFilter')?.value || 'ALL';
  const filtered = filterVal === 'ALL'
    ? allGalleryPhotosCache
    : allGalleryPhotosCache.filter(p => (p.title || 'Untitled Event').trim() === filterVal);

  if (!filtered.length) {
    container.innerHTML = `<div style="text-align:center;padding:28px;color:#64748b;background:#f8fafc;border-radius:12px;">Abhi koi gallery photo nahi mili.</div>`;
    return;
  }

  const groupsMap = {};
  filtered.forEach(photo => {
    const groupTitle = (photo.title || 'Untitled Event').trim();
    if (!groupsMap[groupTitle]) {
      groupsMap[groupTitle] = {
        title: groupTitle,
        eventDate: photo.event_date,
        photos: []
      };
    }
    groupsMap[groupTitle].photos.push(photo);
  });

  const groups = Object.values(groupsMap);

  container.innerHTML = groups.map((grp, gIdx) => {
    return `
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin-bottom:22px;background:#ffffff;box-shadow:0 6px 20px rgba(15,23,42,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #f1f5f9;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-size:1.18rem;font-weight:800;color:#0f172a;">✨ ${escapeHTML(grp.title)}</span>
            <span style="font-size:0.8rem;background:#dbeafe;color:#1d4ed8;padding:4px 11px;border-radius:999px;font-weight:700;">${grp.photos.length} Photo${grp.photos.length > 1 ? 's' : ''}</span>
          </div>
          <div style="font-size:0.84rem;color:#475569;font-weight:700;background:#f8fafc;padding:5px 12px;border-radius:8px;border:1px solid #e2e8f0;">📅 ${fmtDate(grp.eventDate)}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">
          ${grp.photos.map((p, pIdx) => `
            <div style="position:relative;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;background:#0f172a;box-shadow:0 4px 12px rgba(0,0,0,0.08);transition:transform 0.25s ease,box-shadow 0.25s ease;"
                 onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 24px rgba(15,23,42,0.16)';"
                 onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';">
              <img src="${escapeHTML(p.photo_url)}" alt="${escapeHTML(grp.title)}" onclick="openGalleryLightbox(${gIdx}, ${pIdx})"
                   style="width:100%;height:230px;object-fit:cover;display:block;cursor:pointer;transition:transform 0.35s ease;"
                   onmouseover="this.style.transform='scale(1.04)'"
                   onmouseout="this.style.transform='scale(1)'">
              <div onclick="openGalleryLightbox(${gIdx}, ${pIdx})" style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(2,6,23,0.78));color:#fff;padding:18px 12px 9px;font-size:0.78rem;font-weight:600;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
                <span>🔍 Click to view full</span>
                <span>#${pIdx + 1}</span>
              </div>
              ${isAdmin ? `
                <button type="button" title="Delete Photo" onclick="deleteGalleryPhoto('${p.id}', '${escapeHTML(p.storage_path || '')}')" style="position:absolute;top:10px;right:10px;background:rgba(220,38,38,0.94);color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:0.8rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🗑️ Delete</button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}
window.renderGalleryAlbums = renderGalleryAlbums;

function openGalleryLightbox(groupIdx, photoIdx) {
  const filterVal = document.getElementById('galleryEventFilter')?.value || 'ALL';
  const filtered = filterVal === 'ALL'
    ? allGalleryPhotosCache
    : allGalleryPhotosCache.filter(p => (p.title || 'Untitled Event').trim() === filterVal);

  const groupsMap = {};
  filtered.forEach(photo => {
    const groupTitle = (photo.title || 'Untitled Event').trim();
    if (!groupsMap[groupTitle]) groupsMap[groupTitle] = [];
    groupsMap[groupTitle].push(photo);
  });

  const groupKeys = Object.keys(groupsMap);
  const targetGroupKey = groupKeys[groupIdx];
  lightboxList = targetGroupKey ? groupsMap[targetGroupKey] : filtered;
  lightboxIndex = Math.max(0, Math.min(photoIdx, lightboxList.length - 1));

  updateLightboxUI();
  const lbModal = document.getElementById('galleryLightboxModal');
  if (lbModal) lbModal.classList.add('show');
}
window.openGalleryLightbox = openGalleryLightbox;

function stepLightbox(delta) {
  if (!lightboxList.length) return;
  lightboxIndex = (lightboxIndex + delta + lightboxList.length) % lightboxList.length;
  updateLightboxUI();
}
window.stepLightbox = stepLightbox;

function updateLightboxUI() {
  const item = lightboxList[lightboxIndex];
  if (!item) return;

  const imgEl = document.getElementById('lbImage');
  const titleEl = document.getElementById('lbTitle');
  const metaEl = document.getElementById('lbMeta');
  const counterEl = document.getElementById('lbCounter');

  if (imgEl) imgEl.src = item.photo_url;
  if (titleEl) titleEl.textContent = item.title || 'Photo';
  if (metaEl) metaEl.textContent = `📅 ${fmtDate(item.event_date)}`;
  if (counterEl) counterEl.textContent = `Photo ${lightboxIndex + 1} of ${lightboxList.length}`;
}

function closeLightboxModal() {
  const lbModal = document.getElementById('galleryLightboxModal');
  if (lbModal) lbModal.classList.remove('show');
}
window.closeLightboxModal = closeLightboxModal;

async function deleteGalleryPhoto(photoId, storagePath) {
  if (!isAdmin) {
    alert('🔒 Delete ke liye Admin Login zaroori hai!');
    return;
  }
  if (!confirm('Kya aap is photo ko gallery se permanently delete karna chahte hain?')) return;

  const client = getClient();
  if (!client) return;

  try {
    if (storagePath) {
      await client.storage.from(GALLERY_BUCKET).remove([storagePath]);
    }
    const { error } = await client.from('gallery_photos').delete().eq('id', photoId);
    if (error) throw new Error(error.message);

    alert('✅ Photo delete ho gayi.');
    await loadGalleryPhotos();
  } catch (err) {
    alert('❌ Delete Failed: ' + err.message);
  }
}
window.deleteGalleryPhoto = deleteGalleryPhoto;

// ==========================================
// CHILD PROFILE CLEANUP, LATEST BMI & 3M/1Y FILTER
// ==========================================
function cleanSchoolClassText(rawText) {
  if (!rawText) return 'Not recorded';
  let t = String(rawText).trim();
  t = t.replace(/\(\s*Electric\s*Course\s*ITI\s*Gotri\s*\)/i, '(Electrician Course)');
  t = t.replace(/\bElectric\s+Course\b/i, 'Electrician Course');
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t || 'Not recorded';
}

function cleanSicknessText(rawSickness, isSickFlag) {
  if (isSickFlag && rawSickness && String(rawSickness).trim()) {
    return String(rawSickness).trim();
  }
  if (!rawSickness || !String(rawSickness).trim()) return 'Healthy';
  const s = String(rawSickness).trim();
  if (/healthy/i.test(s) && !/fever|cough|cold|pain|vomiting|injury|disease|sickness/i.test(s)) {
    return 'Healthy';
  }
  return s;
}

function getMonthsAgoISO(monthsBack) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  return d.toISOString().slice(0, 10);
}

function setProfileLatestThreeMonths() {
  const fromEl = document.getElementById('profHealthFrom');
  const toEl = document.getElementById('profHealthTo');
  const todayISO = new Date().toISOString().slice(0, 10);

  const sorted = [...(currentProfileHealthAll || [])].sort((a, b) =>
    String(b.record_date || '').localeCompare(String(a.record_date || ''))
  );
  const anchorDateStr = sorted[0]?.record_date ? String(sorted[0].record_date).slice(0, 10) : todayISO;
  const anchorDate = new Date(anchorDateStr + 'T00:00:00');
  const threeMonthsBack = new Date(anchorDate);
  threeMonthsBack.setMonth(threeMonthsBack.getMonth() - 2);
  threeMonthsBack.setDate(1);

  if (fromEl) fromEl.value = threeMonthsBack.toISOString().slice(0, 10);
  if (toEl) toEl.value = anchorDateStr;
  applyProfileHealthFilter();
}
window.setProfileLatestThreeMonths = setProfileLatestThreeMonths;

function setProfileLastOneYear() {
  const fromEl = document.getElementById('profHealthFrom');
  const toEl = document.getElementById('profHealthTo');
  const todayISO = new Date().toISOString().slice(0, 10);
  if (fromEl) fromEl.value = getMonthsAgoISO(12);
  if (toEl) toEl.value = todayISO;
  applyProfileHealthFilter();
}
window.setProfileLastOneYear = setProfileLastOneYear;

function showAllProfileHealthLogs() {
  const fromEl = document.getElementById('profHealthFrom');
  const toEl = document.getElementById('profHealthTo');
  if (fromEl) fromEl.value = '';
  if (toEl) toEl.value = '';
  applyProfileHealthFilter();
}
window.showAllProfileHealthLogs = showAllProfileHealthLogs;

function applyProfileHealthFilter() {
  if (!currentProfileChildData) return;
  const fromVal = document.getElementById('profHealthFrom')?.value || '';
  const toVal = document.getElementById('profHealthTo')?.value || '';

  const filteredLogs = (currentProfileHealthAll || []).filter(row => {
    const dt = String(row.record_date || '').slice(0, 10);
    if (!dt) return false;
    if (fromVal && dt < fromVal) return false;
    if (toVal && dt > toVal) return false;
    return true;
  });

  renderFormattedChildProfile(currentProfileChildData, currentProfileHealthAll, filteredLogs);
}
window.applyProfileHealthFilter = applyProfileHealthFilter;

function buildLatestBmiSummaryCard(child, allHealthLogs) {
  const sorted = [...(allHealthLogs || [])].sort((a, b) =>
    String(b.record_date || '').localeCompare(String(a.record_date || ''))
  );
  const latest = sorted[0];
  if (!latest) {
    return `<div style="border:1px solid #cbd5e1;border-radius:10px;padding:10px 14px;margin:12px 0;background:#f8fafc;font-size:0.84rem;color:#475569;">📊 <strong>Latest BMI Summary:</strong> No health records available.</div>`;
  }

  const age = child?.dob ? (calcAge(child.dob) || 10) : 10;
  const gender = child?.gender || 'Male';
  const bmiInfo = getPediatricBMI(age, gender, latest.height_cm, latest.weight_kg);
  const bmiVal = bmiInfo?.bmi || '-';
  const statusVal = bmiInfo?.status || 'Normal';

  return `
    <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:10px;padding:12px 14px;margin:12px 0;">
      <div style="font-size:0.82rem;font-weight:800;color:#1e3a8a;margin-bottom:8px;">
        📊 LATEST BMI SUMMARY (As of ${escapeHTML(fmtDate(latest.record_date))})
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
        <div style="background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:8px;">
          <div style="font-size:0.7rem;color:#64748b;font-weight:700;">LATEST BMI</div>
          <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">${escapeHTML(String(bmiVal))}</div>
        </div>
        <div style="background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:8px;">
          <div style="font-size:0.7rem;color:#64748b;font-weight:700;">HEIGHT</div>
          <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">${escapeHTML(String(latest.height_cm ?? '-'))} cm</div>
        </div>
        <div style="background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:8px;">
          <div style="font-size:0.7rem;color:#64748b;font-weight:700;">WEIGHT</div>
          <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">${escapeHTML(String(latest.weight_kg ?? '-'))} kg</div>
        </div>
        <div style="background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:8px;">
          <div style="font-size:0.7rem;color:#64748b;font-weight:700;">STATUS</div>
          <div style="font-size:0.98rem;font-weight:800;color:#1d4ed8;">${escapeHTML(String(statusVal))}</div>
        </div>
      </div>
    </div>
  `;
}

function renderFormattedChildProfile(child, allHealthLogs, visibleHealthLogs) {
  const container = document.getElementById('profileContent') || document.getElementById('profileBody');
  if (!container || !child) return;

  const currentFrom = document.getElementById('profHealthFrom')?.value || '';
  const currentTo = document.getElementById('profHealthTo')?.value || '';

  const age = child?.dob ? (calcAge(child.dob) || 10) : 10;
  const gender = child?.gender || 'Male';
  const childName = child.full_name || child.name || '-';
  const childCategory = child.child_type || child.category || '-';
  const schoolClassRaw = [child.present_school, child.current_class ? `(${child.current_class})` : ''].filter(Boolean).join(' ') || child.school_class || '';
  const schoolClassClean = cleanSchoolClassText(schoolClassRaw);
  const latestBmiCard = buildLatestBmiSummaryCard(child, allHealthLogs);

  const parsedCase = parseExcelSections(child.remark || '');
  const caseSections = [
    ['1. FAMILY BACKGROUND', getCaseStudyValue(parsedCase, '1. Family Background') || child.family_background],
    ['2. HEALTH & MEDICAL INFORMATION', getCaseStudyValue(parsedCase, '2. Health & Medical Information') || child.health_notes || child.medical_info],
    ['3. SOCIAL AND EMOTIONAL HISTORY', getCaseStudyValue(parsedCase, '3. Social and Emotional History') || child.social_emotional_history],
    ['4. EDUCATIONAL HISTORY', getCaseStudyValue(parsedCase, '4. Educational History') || child.educational_history],
    ['5. PARTICIPATION IN EXTRACURRICULAR ACTIVITIES:', getCaseStudyValue(parsedCase, '5. Participation in Extracurricular Activities:') || child.extracurricular_participation],
    ['6. HOBBIES AND INTERESTS', getCaseStudyValue(parsedCase, '6. Hobbies and Interests') || child.hobbies_interests],
    ['7. EMOTIONAL TRIGGERS AND COPING MECHANISMS', getCaseStudyValue(parsedCase, '7. Emotional Triggers and Coping Mechanisms') || child.emotional_triggers],
    ['8. GOALS AND ASPIRATIONS', getCaseStudyValue(parsedCase, '8. Goals and Aspirations') || child.goals_aspirations],
    ["9. CHILD'S STRENGTH AND WEAKNESS", getCaseStudyValue(parsedCase, "9. Child's strength and weakness") || child.strengths_weaknesses],
    ['10. CONCLUSION', getCaseStudyValue(parsedCase, '10. Conclusion') || child.conclusion]
  ];

  const caseStudyHtml = caseSections.map(([heading, val]) => {
    const cleanVal = (val && String(val).trim()) ? String(val).trim() : 'Not recorded';
    return `
      <div style="margin-bottom:10px;">
        <div style="font-weight:800;font-size:0.84rem;color:#0f172a;">${escapeHTML(heading)}</div>
        <div style="font-size:0.84rem;color:#334155;white-space:pre-line;margin-top:2px;">${escapeHTML(cleanVal)}</div>
      </div>
    `;
  }).join('');

  const healthRowsHtml = (visibleHealthLogs && visibleHealthLogs.length)
    ? [...visibleHealthLogs]
        .sort((a, b) => String(b.record_date || '').localeCompare(String(a.record_date || '')))
        .map(row => {
          const bmiRes = getPediatricBMI(age, gender, row.height_cm, row.weight_kg);
          const sickClean = cleanSicknessText(row.sickness_details || row.sickness, row.is_sick);
          return `
            <tr>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(fmtDate(row.record_date))}</td>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(String(row.height_cm ?? '-'))}</td>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(String(row.weight_kg ?? '-'))}</td>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(String(bmiRes?.bmi ?? '-'))}</td>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(String(bmiRes?.status ?? '-'))}</td>
              <td style="white-space:nowrap;padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(sickClean)}</td>
            </tr>
          `;
        }).join('')
    : `<tr><td colspan="6" style="text-align:center;padding:12px;color:#64748b;border:1px solid #e2e8f0;">No health logs found for selected date range.</td></tr>`;

  const extra = currentProfileChildExtra || { edu: [], act: [], inc: [], counsel: [] };

  const eduHtml = (extra.edu && extra.edu.length)
    ? `<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
        <thead>
          <tr style="background:#f1f5f9;text-align:left;">
            <th style="padding:6px 8px;border:1px solid #cbd5e1;">Year</th>
            <th style="padding:6px 8px;border:1px solid #cbd5e1;">Term</th>
            <th style="padding:6px 8px;border:1px solid #cbd5e1;">Subjects (Marks)</th>
            <th style="padding:6px 8px;border:1px solid #cbd5e1;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${extra.edu.map(s => {
            const marksObj = parseSubjectMarks(s.subject_marks);
            const subjStr = Object.entries(marksObj).map(([k, v]) => `${escapeHTML(k)}: ${escapeHTML(v)}`).join(', ') || '–';
            return `<tr>
              <td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(s.academic_year || '–')}</td>
              <td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHTML(s.exam_term || '–')}</td>
              <td style="padding:6px 8px;border:1px solid #e2e8f0;">${subjStr}</td>
              <td style="padding:6px 8px;border:1px solid #e2e8f0;">${s.percentage != null && s.percentage !== '' ? escapeHTML(s.percentage) + '%' : '–'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`
    : `<div style="font-size:0.82rem;color:#64748b;padding:6px 0;">No education records found.</div>`;

  const actHtml = (extra.act && extra.act.length)
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${extra.act.map(a => `<span class="badge" style="background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">${escapeHTML(a.activity_name)} (${fmtDate(a.start_date)} to ${a.end_date ? fmtDate(a.end_date) : 'Ongoing'})</span>`).join('')}
      </div>`
    : `<div style="font-size:0.82rem;color:#64748b;padding:6px 0;">No activities enrolled.</div>`;

  const incHtml = (extra.inc && extra.inc.length)
    ? extra.inc.map(i => `<div style="background:#fef2f2;border:1px solid #fecaca;padding:8px 10px;border-radius:6px;margin-bottom:6px;font-size:0.82rem;">
        <b>${escapeHTML(i.incident_type)}</b> (${fmtDate(i.incident_date)}) - ${escapeHTML(i.reason)}
        <span class="badge ${i.is_resolved ? 'active' : 'inactive'}" style="margin-left:6px;">${i.is_resolved ? 'Resolved' : 'Pending'}</span>
      </div>`).join('')
    : `<div style="font-size:0.82rem;color:#64748b;padding:6px 0;">No incidents reported.</div>`;

  const counselHtml = (extra.counsel && extra.counsel.length)
    ? `<div class="timeline">${extra.counsel.map(r => `<div class="timeline-item">
        <div style="font-size:0.75rem;color:#64748b;font-weight:700;">${fmtDate(r.report_date)} - ${escapeHTML(r.counselor_name || 'Counselor')}</div>
        <div style="font-weight:800;color:#be185d;margin:4px 0;">Behavior: ${escapeHTML(r.behavior_notes || 'N/A')}</div>
        <div style="font-size:0.84rem;color:#334155;">${escapeHTML(r.progress_notes || '')}</div>
      </div>`).join('')}</div>`
    : `<div style="font-size:0.82rem;color:#64748b;padding:6px 0;">No counselling reports yet.</div>`;

  container.innerHTML = `
    <div id="profileContent" style="padding:8px 4px;color:#0f172a;text-align:left;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1e3a8a;padding-bottom:6px;margin-bottom:10px;text-align:left;">
        <h2 style="margin:0;font-size:1.15rem;color:#1e3a8a;text-align:left;">Alembic GFC - Child Profile</h2>
        <span style="font-size:0.78rem;color:#475569;text-align:right;">Generated on: ${escapeHTML(fmtDate(new Date().toISOString().slice(0, 10)))}</span>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:0.84rem;margin-bottom:10px;text-align:left;">
        <tr>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>Name:</strong> ${escapeHTML(childName)}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>GFC ID:</strong> ${escapeHTML(child.gfc_id || '-')}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>Age:</strong> ${escapeHTML(String(age))} Years</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>Category:</strong> ${escapeHTML(childCategory)}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>Gender:</strong> ${escapeHTML(child.gender || '-')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>DOB:</strong> ${escapeHTML(fmtDate(child.dob))}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>Blood Group:</strong> ${escapeHTML(child.blood_group || '-')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;text-align:left;"><strong>School / Class:</strong> ${escapeHTML(schoolClassClean)}</td>
        </tr>
      </table>

      ${latestBmiCard}

      <div style="margin-top:14px;text-align:left;">
        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;text-align:left;">CHILD CASE STUDY</h3>
        ${caseStudyHtml}
      </div>

      <div style="margin-top:18px;">
        <div id="profileHealthFilterBar" class="no-print" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:8px 12px;margin-bottom:10px;">
          <span style="font-size:0.8rem;font-weight:800;color:#0f172a;">📅 Health Log Filter:</span>
          <label style="font-size:0.76rem;font-weight:700;color:#334155;">From <input type="date" id="profHealthFrom" value="${escapeHTML(currentFrom)}" onchange="applyProfileHealthFilter()" style="padding:4px 6px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.78rem;"></label>
          <label style="font-size:0.76rem;font-weight:700;color:#334155;">To <input type="date" id="profHealthTo" value="${escapeHTML(currentTo)}" onchange="applyProfileHealthFilter()" style="padding:4px 6px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.78rem;"></label>
          <button type="button" class="btn btn-light btn-sm" onclick="setProfileLatestThreeMonths()">Latest 3 Months</button>
          <button type="button" class="btn btn-light btn-sm" onclick="setProfileLastOneYear()">Last 1 Year</button>
          <button type="button" class="btn btn-light btn-sm" onclick="showAllProfileHealthLogs()">Show All</button>
        </div>

        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;">
          🏥 Health Logs (Pediatric BMI) (${visibleHealthLogs.length} of ${allHealthLogs.length} record${allHealthLogs.length === 1 ? '' : 's'})
        </h3>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
            <thead>
              <tr style="background:#f1f5f9;text-align:left;">
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">Date</th>
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">Height</th>
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">Weight</th>
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">BMI</th>
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">Status</th>
                <th style="white-space:nowrap;padding:6px 8px;border:1px solid #cbd5e1;">Sickness Details</th>
              </tr>
            </thead>
            <tbody>
              ${healthRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:18px;">
        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;">🎓 Education History</h3>
        <div style="overflow-x:auto;">${eduHtml}</div>
      </div>

      <div style="margin-top:18px;">
        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;">🎨 Co-curricular Activities</h3>
        ${actHtml}
      </div>

      <div style="margin-top:18px;">
        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;">⚠️ Incidents / Runaways</h3>
        ${incHtml}
      </div>

      <div style="margin-top:18px;">
        <h3 style="font-size:0.95rem;color:#1e3a8a;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:8px;">🧠 Counselling Timeline</h3>
        ${counselHtml}
      </div>
    </div>
  `;
}

// Default to Latest 3 Months on profile open; user can switch to Last 1 Year, Show All, or custom dates
function initChildProfileWithDefaults(child, healthLogs) {
  currentProfileChildData = child;
  currentProfileHealthAll = healthLogs || [];
  renderFormattedChildProfile(child, currentProfileHealthAll, currentProfileHealthAll);
  setProfileLatestThreeMonths();
}
window.initChildProfileWithDefaults = initChildProfileWithDefaults;