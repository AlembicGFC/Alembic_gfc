const STORAGE_KEY = "ALEMBIC_CSR_FOUNDATION_V5";
const SUPABASE_URL = "https://gtkbbuvefzxxuqupsnlw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WmuUD6Bz6FryTgzN-OvZqw_VM1yEvv3";
const sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

let isSyncingFromSupabase = false;
let supabaseSyncTimer = null;

function buildDefaultData() {
  const users = [
    {
      uid: "U_SANJAY",
      email: "sanjay.bhattacharya@alembic.co.in",
      password: "Admin@123",
      fullName: "Sanjay Bhattacharya",
      designation: "CSR Head",
      role: "CSR_HEAD",
      assignedProjects: ["P_1_4_5", "P_4_1", "P_5_1", "P_7_2", "P_8_1"]
    },
    {
      uid: "U_PRASHANT",
      email: "prashant.chauhan@alembic.co.in",
      password: "Admin@123",
      fullName: "Prashant Chauhan",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_1_1", "P_1_4_1"]
    },
    {
      uid: "U_ANJALI",
      email: "anjali.burman@alembic.co.in",
      password: "Admin@123",
      fullName: "Anjali Burman",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_1_4_1", "P_1_4_6", "P_1_4_7", "P_7_1", "P_7_3"]
    },
    {
      uid: "U_NISARG",
      email: "nisarg.brahmbhatt@alembic.co.in",
      password: "Admin@123",
      fullName: "Nisarg Brahmbhatt",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_1_2", "P_1_3", "P_1_4_4", "P_3_1"]
    },
    {
      uid: "U_RICHA",
      email: "richa.mohite@alembic.co.in",
      password: "Admin@123",
      fullName: "Richa Mohite",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_1_4_2", "P_3_4"]
    },
    {
      uid: "U_DILIP",
      email: "Dilip.solanki@alembic.co.in",
      password: "Admin@123",
      fullName: "Dilip Solanki",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_3_2", "P_3_3", "P_6_1"]
    },
    {
      uid: "U_MADHAV",
      email: "rds.panelav@alembic.co.in",
      password: "Admin@123",
      fullName: "Madhav Joshi",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: ["P_2_1"]
    },
    {
      uid: "U_NIDA",
      email: "nida.rathore@alembic.co.in",
      password: "Admin@123",
      fullName: "Nida Rathore",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: []
    }
  ];

  // Master Budget FY 2026-27 (Total: 11,60,99,526)
  const projects = [
    { id: "P_1_1", code: "1.1", theme: "1. Health", name: "Swasthya Setu (360° Health Care)", budget: 11317909, logoUrl: "" },
    { id: "P_1_2", code: "1.2", theme: "1. Health", name: "Suposhan (Reducing Malnutrition)", budget: 9769000, logoUrl: "" },
    { id: "P_1_3", code: "1.3", theme: "1. Health", name: "Alembic Sports", budget: 7585000, logoUrl: "" },
    { id: "P_1_4_1", code: "1.4.1", theme: "1. Health — SEWA*", name: "Group Foster Care", budget: 7481000, logoUrl: "" },
    { id: "P_1_4_2", code: "1.4.2", theme: "1. Health — SEWA*", name: "SAA Adoption Agency", budget: 2691600, logoUrl: "" },
    { id: "P_1_4_3", code: "1.4.3", theme: "1. Health — SEWA*", name: "Blood Transfusion Centre", budget: 0, logoUrl: "" },
    { id: "P_1_4_4", code: "1.4.4", theme: "1. Health — SEWA*", name: "Water, Sanitation & Hygiene", budget: 200000, logoUrl: "" },
    { id: "P_1_4_5", code: "1.4.5", theme: "1. Health — SEWA*", name: "Coordination Office", budget: 5519426, logoUrl: "" },
    { id: "P_1_4_6", code: "1.4.6", theme: "1. Health — SEWA*", name: "SOS Village", budget: 240000, logoUrl: "" },
    { id: "P_1_4_7", code: "1.4.7", theme: "1. Health — SEWA*", name: "Donation to be Decided", budget: 500000, logoUrl: "" },
    { id: "P_2_1", code: "2.1", theme: "2. Education", name: "VIKAS", budget: 24805000, logoUrl: "" },
    { id: "P_2_2", code: "2.2", theme: "2. Education", name: "Shiksha Setu", budget: 9333000, logoUrl: "" },
    { id: "P_3_1", code: "3.1", theme: "3. Livelihood", name: "Empowerment of Youth", budget: 500000, logoUrl: "" },
    { id: "P_3_2", code: "3.2", theme: "3. Livelihood", name: "FEP - Sustainable Agriculture", budget: 8471000, logoUrl: "" },
    { id: "P_3_3", code: "3.3", theme: "3. Livelihood", name: "FEP - Cattle Breed Development", budget: 9089000, logoUrl: "" },
    { id: "P_3_4", code: "3.4", theme: "3. Livelihood", name: "Empowering Marginalised", budget: 3500000, logoUrl: "" },
    { id: "P_4_1", code: "4.1", theme: "4. Art & Culture", name: "Promotion of Art", budget: 10000000, logoUrl: "" },
    { id: "P_5_1", code: "5.1", theme: "5. Environment", name: "Sanrakshit Paryavaran", budget: 665000, logoUrl: "" },
    { id: "P_6_1", code: "6.1", theme: "6. Strengthening Local Governance", name: "GPDP", budget: 532500, logoUrl: "" },
    { id: "P_7_1", code: "7.1", theme: "7. Monitoring, Evaluation & Documentation", name: "Design & Creative support", budget: 400000, logoUrl: "" },
    { id: "P_7_2", code: "7.2", theme: "7. Monitoring, Evaluation & Documentation", name: "PR & Publicity (Feasibility Study)", budget: 300000, logoUrl: "" },
    { id: "P_7_3", code: "7.3", theme: "7. Monitoring, Evaluation & Documentation", name: "Impact Assessment", budget: 500000, logoUrl: "" },
    { id: "P_8_1", code: "8.1", theme: "8. CSR Office & Admin Expense", name: "CSR Office", budget: 2700000, logoUrl: "" }
  ];

  const budgetHeads = [
    { id: "H_11_1", projectId: "P_1_1", code: "1.0", name: "NQAS (Jarod PHC & Ujeti)", budget: 5784768 },
    { id: "H_11_2", projectId: "P_1_1", code: "2.0", name: "Bloodlink Helpline - 24/7", budget: 642000 },
    { id: "H_11_3", projectId: "P_1_1", code: "3.0", name: "Vikas Arogya Kendra", budget: 1559868 },
    { id: "H_11_4", projectId: "P_1_1", code: "4.0", name: "Vikas Clinic Outreach", budget: 131000 },
    { id: "H_11_5", projectId: "P_1_1", code: "5.0", name: "Social Protection", budget: 1323791 },
    { id: "H_11_6", projectId: "P_1_1", code: "6.0", name: "Swasthya Setu Field Staff Salary", budget: 957882 },
    { id: "H_11_7", projectId: "P_1_1", code: "7.0", name: "Safety & First Aid Trainings", budget: 175000 },
    { id: "H_11_8", projectId: "P_1_1", code: "8.0", name: "CSR Staff (Swasthya Setu)", budget: 743600 },
    { id: "H_12_1", projectId: "P_1_2", code: "1.0", name: "Strengthening of Anganwadi Centres (AWC)", budget: 276210 },
    { id: "H_12_2", projectId: "P_1_2", code: "2.0", name: "Community Meetings & Mother-Child Health", budget: 882140 },
    { id: "H_12_3", projectId: "P_1_2", code: "3.0", name: "Capacity Building Workshops & Review Meetings", budget: 153750 },
    { id: "H_12_4", projectId: "P_1_2", code: "4.0", name: "Celebration of Important Days", budget: 126000 },
    { id: "H_12_5", projectId: "P_1_2", code: "5.0", name: "Adolescents Health (School & Community)", budget: 1030676 },
    { id: "H_12_6", projectId: "P_1_2", code: "6.0", name: "Poshan Vatika & Field Operations", budget: 7300224 },
    { id: "H_13_1", projectId: "P_1_3", code: "1.0", name: "Regular Coaching in Selected Sports", budget: 3408000 },
    { id: "H_13_2", projectId: "P_1_3", code: "2.0", name: "Sports Equipment & Infrastructure", budget: 547880 },
    { id: "H_13_3", projectId: "P_1_3", code: "3.0", name: "Programmatic Inputs & Camps", budget: 2761200 },
    { id: "H_13_4", projectId: "P_1_3", code: "4.0", name: "Project Implementation & Travel", budget: 867920 },
    { id: "H_141_1", projectId: "P_1_4_1", code: "1.0", name: "Staff Salary (House Fathers, Cook, Security)", budget: 2461700 },
    { id: "H_141_2", projectId: "P_1_4_1", code: "3.0", name: "Repairs, Renovation & Maintenance", budget: 12000 },
    { id: "H_141_3", projectId: "P_1_4_1", code: "4.0", name: "Programmatic Expense (Education, Fees, Trips)", budget: 1819500 },
    { id: "H_141_4", projectId: "P_1_4_1", code: "5.0", name: "Recurring & Household Living Expenses", budget: 2461800 },
    { id: "H_141_5", projectId: "P_1_4_1", code: "6.0", name: "Rent & Administrative Overheads", budget: 726000 },
    { id: "H_142_1", projectId: "P_1_4_2", code: "1.0", name: "CSR Staff Salary & Travel", budget: 496320 },
    { id: "H_142_2", projectId: "P_1_4_2", code: "2.0", name: "Salary of SAA Staff placed by Alembic CSR", budget: 929080 },
    { id: "H_142_3", projectId: "P_1_4_2", code: "3.0", name: "Performance Allowance to Govt Contract Staff", budget: 228000 },
    { id: "H_142_4", projectId: "P_1_4_2", code: "4.0", name: "Capital / Equipments & Child Care", budget: 1038200 },
    { id: "H_21_1", projectId: "P_2_1", code: "1.0", name: "Salary (School & Hostel)", budget: 8103151 },
    { id: "H_21_2", projectId: "P_2_1", code: "2.0", name: "Capital Expense", budget: 434860 },
    { id: "H_21_3", projectId: "P_2_1", code: "3.0", name: "Repairs and Maintenance", budget: 3817173 },
    { id: "H_21_4", projectId: "P_2_1", code: "4.0", name: "Programmatic Expense", budget: 1680632 },
    { id: "H_21_5", projectId: "P_2_1", code: "5.0", name: "Printing", budget: 66740 },
    { id: "H_21_6", projectId: "P_2_1", code: "6.0", name: "Recurring Expense", budget: 10543444 },
    { id: "H_21_7", projectId: "P_2_1", code: "7.0", name: "Professional Fees", budget: 159000 },
    { id: "H_22_1", projectId: "P_2_2", code: "1.0", name: "Salary", budget: 7109782 },
    { id: "H_22_2", projectId: "P_2_2", code: "2.0", name: "Capital", budget: 218000 },
    { id: "H_22_3", projectId: "P_2_2", code: "3.0", name: "Repair & Renovation", budget: 3300 },
    { id: "H_22_4", projectId: "P_2_2", code: "4.0", name: "Programmatic Expense", budget: 431780 },
    { id: "H_22_5", projectId: "P_2_2", code: "5.0", name: "Recurring Expense", budget: 418160 },
    { id: "H_22_6", projectId: "P_2_2", code: "6.0", name: "Shiksha Setu Science", budget: 1151978 },
    { id: "H_32_1", projectId: "P_3_2", code: "1.0", name: "Agriculture Practices for Productivity", budget: 1606000 },
    { id: "H_32_2", projectId: "P_3_2", code: "2.0", name: "Crop Diversification (Kharif)", budget: 1042800 },
    { id: "H_32_3", projectId: "P_3_2", code: "3.0", name: "Rabi Seed Variety Improvement", budget: 1240000 },
    { id: "H_32_4", projectId: "P_3_2", code: "4.0", name: "Summer Seed Variety Improvement", budget: 258000 },
    { id: "H_32_5", projectId: "P_3_2", code: "5.0", name: "Institution Dev & Capacity Building", budget: 447000 },
    { id: "H_32_6", projectId: "P_3_2", code: "7.0", name: "Field & CSR Staff Salary + Knowledge Partner", budget: 3877200 },
    { id: "H_34_1", projectId: "P_3_4", code: "1.0", name: "Pink Auto (50% Contribution + Training + Staff)", budget: 3114000 },
    { id: "H_34_2", projectId: "P_3_4", code: "2.0", name: "Stitching Training Unit", budget: 386000 },
    { id: "H_81_1", projectId: "P_8_1", code: "1.0", name: "Admin Salary & Mediclaim", budget: 1639817 },
    { id: "H_81_2", projectId: "P_8_1", code: "2.0", name: "Capital Expenditure (Computer)", budget: 50000 },
    { id: "H_81_3", projectId: "P_8_1", code: "3.0", name: "Repair & Maintenance", budget: 303943 },
    { id: "H_81_4", projectId: "P_8_1", code: "4.0", name: "Recurring Office Expenses", budget: 235039 },
    { id: "H_81_5", projectId: "P_8_1", code: "5.0", name: "Professional Fees & Events/Workshops", budget: 471201 }
  ];

  const vendors = [
    { id: "V1", name: "Mr.Krushna Parmar", type: "Staff / Coordinator", projectIds: ["P_2_1", "P_1_1"], contact: "Field Coordination", acc: "3645028499", ifsc: "CBIN0282394" },
    { id: "V2", name: "Lalabhai C Bharavad (Shree Radhe Transport)", type: "Vendor", projectIds: ["P_2_1"], contact: "Transport Services", acc: "1978104000021687", ifsc: "IBKL0001978" },
    { id: "V3", name: "Ocean inc.", type: "Vendor", projectIds: ["P_2_1", "P_1_1"], contact: "General Supplies", acc: "50200040653209", ifsc: "HDFC0000033" },
    { id: "V4", name: "KING STATIONARY XEROX", type: "Vendor", projectIds: ["P_2_2", "P_1_1"], contact: "Printing & Stationery", acc: "2010200000289", ifsc: "BARB0MSUNIV" },
    { id: "V5", name: "HET YOGESHBHAI LIMBACHIYA", type: "Vendor", projectIds: ["P_1_4_1"], contact: "GFC Services", acc: "50100775407070", ifsc: "HDFC0009277" },
    { id: "V6", name: "Shashi catering services", type: "Vendor", projectIds: ["P_3_4"], contact: "Catering / Events", acc: "77980500000323", ifsc: "BARB0VJRAOP" }
  ];

  const staffProfiles = [];
  const salaryRecords = [];

  const expenses = [
    {
      id: "EXP-01",
      category: "PROGRAM",
      date: "2026-11-21",
      projectId: "P_2_1",
      headId: "H_21_6",
      enteredByUid: "U_MADHAV",
      enteredBy: "Madhav Joshi",
      enteredByDesignation: "Program Manager",
      enteredByEmail: "rds.panelav@alembic.co.in",
      payeeName: "Mr.Krushna Parmar",
      acc: "3645028499",
      ifsc: "CBIN0282394",
      mode: "NEFT",
      amount: 727,
      remark: "",
      bankExported: false,
      bankExportedAt: null
    },
    {
      id: "EXP-02",
      category: "PROGRAM",
      date: "2026-11-24",
      projectId: "P_1_1",
      headId: "H_11_2",
      enteredByUid: "U_PRASHANT",
      enteredBy: "Prashant Chauhan",
      enteredByDesignation: "Program Manager",
      enteredByEmail: "prashant.chauhan@alembic.co.in",
      payeeName: "KING STATIONARY XEROX",
      acc: "2010200000289",
      ifsc: "BARB0MSUNIV",
      mode: "NEFT",
      amount: 145000,
      remark: "",
      bankExported: false,
      bankExportedAt: null
    },
    {
      id: "EXP-03",
      category: "PROGRAM",
      date: "2026-11-24",
      projectId: "P_1_4_1",
      headId: "H_141_4",
      enteredByUid: "U_PRASHANT",
      enteredBy: "Prashant Chauhan",
      enteredByDesignation: "Program Manager",
      enteredByEmail: "prashant.chauhan@alembic.co.in",
      payeeName: "HET YOGESHBHAI LIMBACHIYA",
      acc: "50100775407070",
      ifsc: "HDFC0009277",
      mode: "NEFT",
      amount: 10000,
      remark: "",
      bankExported: false,
      bankExportedAt: null
    }
  ];

  return {
    users,
    activeFy: "FY 2026-27",
    fyList: [
      {
        fy: "FY 2026-27",
        status: "ACTIVE",
        projects,
        budgetHeads,
        vendors,
        staffProfiles,
        salaryRecords,
        expenses
      }
    ],
    ui: {
      loggedUid: null,
      headProjectScope: "ALL",
      selectedPmUid: "U_PRASHANT",
      pmSelectedProjectId: null,
      chartType: "bar",
      pmChartType: "bar",
      headFilterFromDate: "",
      headFilterToDate: "",
      headFilterCategory: "ALL",
      pmSalaryMonth: "2026-11",
      headSalaryMonth: "2026-11",
      headQuarterFilter: "ALL",
      pmQuarterFilter: "ALL",
      headVendorProjectFilter: "ALL"
    }
  };
}

let state = loadState();
let headChart = null;
let pmChart = null;
let pendingDeleteCallback = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) {}

  try {
    const oldRaw = localStorage.getItem("ALEMBIC_CSR_FOUNDATION_V4") || localStorage.getItem("ALEMBIC_CSR_FOUNDATION_V3");
    if (oldRaw) return normalizeState(JSON.parse(oldRaw));
  } catch (e) {}

  return normalizeState(buildDefaultData());
}

function normalizeState(data) {
  const base = buildDefaultData();
  const merged = {
    ...base,
    ...data,
    activeFy: data.activeFy || "FY 2026-27",
    ui: {
      ...base.ui,
      ...(data.ui || {})
    }
  };

  if (!Array.isArray(merged.users) || !merged.users.length) {
    merged.users = base.users;
  }

  if (!merged.users.some(u => u.email.toLowerCase() === "nida.rathore@alembic.co.in")) {
    merged.users.push({
      uid: "U_NIDA",
      email: "nida.rathore@alembic.co.in",
      password: "Admin@123",
      fullName: "Nida Rathore",
      designation: "Program Manager",
      role: "PM",
      assignedProjects: []
    });
  }

  merged.users = merged.users.map(u => ({
    ...u,
    designation: u.designation || (u.role === "CSR_HEAD" ? "CSR Head" : "Program Manager"),
    assignedProjects: Array.isArray(u.assignedProjects) ? u.assignedProjects : []
  }));

  if (!Array.isArray(merged.fyList) || !merged.fyList.length) {
    merged.fyList = base.fyList;
  }

  merged.fyList = merged.fyList.map((f, idx) => ({
    fy: f.fy || (idx === 0 ? "FY 2026-27" : `FY 202${6 + idx}-2${7 + idx}`),
    status: f.status || "ACTIVE",
    projects: (f.projects || []).map(p => ({ ...p, logoUrl: p.logoUrl || "" })),
    budgetHeads: f.budgetHeads || [],
    vendors: f.vendors || [],
    staffProfiles: f.staffProfiles || [],
    salaryRecords: f.salaryRecords || [],
    expenses: (f.expenses || []).map(exp => {
      const matchedUser = merged.users.find(
        u =>
          (exp.enteredByUid && u.uid === exp.enteredByUid) ||
          (exp.enteredBy && exp.enteredBy.toLowerCase().includes(u.email.toLowerCase())) ||
          (exp.enteredBy && exp.enteredBy.toLowerCase().includes(u.fullName.toLowerCase()))
      );
      return {
        ...exp,
        category: exp.category || (exp.salaryRecordId ? "SALARY" : "PROGRAM"),
        enteredByUid: exp.enteredByUid || (matchedUser ? matchedUser.uid : null),
        enteredBy: matchedUser ? matchedUser.fullName : (exp.enteredBy || "PM"),
        enteredByDesignation: exp.enteredByDesignation || (matchedUser ? matchedUser.designation : "Program Manager"),
        enteredByEmail: exp.enteredByEmail || (matchedUser ? matchedUser.email : ""),
        bankExported: Boolean(exp.bankExported),
        bankExportedAt: exp.bankExportedAt || null
      };
    })
  }));

  if (!merged.fyList.some(f => f.fy === merged.activeFy)) {
    merged.activeFy = merged.fyList[0].fy;
  }

  return merged;
}

// State mein varianceNotes store karein
state.varianceNotes = state.varianceNotes || [];

async function pullVarianceNotes() {
  if (!sb) return;
  const { data, error } = await sb
    .from("budget_variance_notes")
    .select("*")
    .order("project_code", { ascending: true });
  if (!error && Array.isArray(data)) {
    state.varianceNotes = data;
  }
}

function getReconciliationBlockHTML(projectId) {
  const fy = typeof getCurrentFy === "function" ? getCurrentFy() : {};
  const proj = (fy.projects || []).find(p => p.id === projectId);
  const heads = (fy.budgetHeads || []).filter(h => h.projectId === projectId);
  const mainBudget = Number(proj?.budget || 0);
  const headsTotal = heads.reduce((sum, h) => sum + Number(h.budget || 0), 0);

  const savedNote = (state.varianceNotes || []).find(n => n.project_id === projectId);
  const diff = savedNote ? Number(savedNote.variance_amount) : (mainBudget - headsTotal);
  const noteText = savedNote?.note_text || (
    diff === 0
      ? "Main budget aur budget heads ka total bilkul match kar raha hai (₹0 difference)."
      : `Main budget (${mainBudget.toLocaleString("en-IN")}) aur budget heads total (${headsTotal.toLocaleString("en-IN")}) mein ${diff >= 0 ? "+" : ""}${diff.toLocaleString("en-IN")} ka difference hai.`
  );

  const currentUser = typeof getLoggedUser === "function" ? getLoggedUser() : state.currentUser;
  const isHead = currentUser?.role === "CSR_HEAD";

  return `
    <div id="variance-note-box" style="margin-top:16px;padding:14px;border:1px solid #f59e0b;background:#fffbeb;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <strong>Budget Variance / Reconciliation Note</strong>
        <span style="font-weight:600;color:${diff === 0 ? "#15803d" : "#b45309"};">
          Difference: ${diff >= 0 ? "+" : ""}₹${diff.toLocaleString("en-IN")}
        </span>
      </div>
      <div style="font-size:13px;margin-top:6px;color:#374151;">
        Main Budget: <b>₹${mainBudget.toLocaleString("en-IN")}</b> |
        Heads Total: <b>₹${headsTotal.toLocaleString("en-IN")}</b>
      </div>
      <p style="margin:8px 0 0;font-size:13.5px;color:#111827;line-height:1.45;">${noteText}</p>
      ${isHead ? `
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          <input id="variance-note-input" type="text" value="${escapeHtmlAttr(noteText)}"
            style="flex:1;min-width:240px;padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;" />
          <button type="button" onclick="saveVarianceNote('${projectId}')"
            style="padding:6px 12px;border:none;border-radius:6px;background:#111827;color:#fff;cursor:pointer;">
            Save Note
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

async function saveVarianceNote(projectId) {
  const input = document.getElementById("variance-note-input");
  if (!input || !sb) return;
  const fy = typeof getCurrentFy === "function" ? getCurrentFy() : {};
  const proj = (fy.projects || []).find(p => p.id === projectId);
  const heads = (fy.budgetHeads || []).filter(h => h.projectId === projectId);
  const mainBudget = Number(proj?.budget || 0);
  const headsTotal = heads.reduce((sum, h) => sum + Number(h.budget || 0), 0);
  const diff = mainBudget - headsTotal;
  const noteText = input.value.trim();

  const payload = {
    id: `VAR_${projectId}`,
    fy: fy?.fy || proj?.fy || "FY 2026-27",
    project_id: projectId,
    project_code: proj?.code || "",
    project_name: proj?.name || "",
    main_budget: mainBudget,
    detail_total: headsTotal,
    variance_amount: diff,
    note_text: noteText,
    updated_at: new Date().toISOString()
  };

  const { error } = await sb
    .from("budget_variance_notes")
    .upsert(payload, { onConflict: "id" });

  if (!error) {
    await pullVarianceNotes();
    if (typeof renderApp === "function") renderApp();
  }
}

/* ==================== SUPABASE SYNC HELPERS ==================== */
async function pushStateToSupabase() {
  if (!sb || isSyncingFromSupabase) return;
  try {
    const userRows = (state.users || []).map(u => ({
      uid: u.uid,
      email: u.email,
      password: u.password,
      full_name: u.fullName,
      designation: u.designation || "Program Manager",
      role: u.role || "PM",
      assigned_projects: Array.isArray(u.assignedProjects) ? u.assignedProjects : []
    }));
    if (userRows.length) {
      await sb.from("app_users").upsert(userRows, { onConflict: "uid" });
    }

    for (const f of state.fyList || []) {
      const fyName = f.fy || "FY 2026-27";
      await sb.from("financial_years").upsert(
        [{ fy: fyName, status: f.status || "ACTIVE" }],
        { onConflict: "fy" }
      );

      const projRows = (f.projects || []).map(p => ({
        id: p.id,
        fy: fyName,
        code: p.code,
        theme: p.theme,
        name: p.name,
        budget: Number(p.budget) || 0,
        logo_url: p.logoUrl || ""
      }));
      if (projRows.length) {
        await sb.from("projects").upsert(projRows, { onConflict: "id" });
      }

      const headRows = (f.budgetHeads || []).map(h => ({
        id: h.id,
        fy: fyName,
        project_id: h.projectId,
        code: h.code,
        name: h.name,
        budget: Number(h.budget) || 0
      }));
      if (headRows.length) {
        await sb.from("budget_heads").upsert(headRows, { onConflict: "id" });
      }

      const vendorRows = (f.vendors || []).map(v => ({
        id: v.id,
        fy: fyName,
        name: v.name,
        type: v.type || "Vendor",
        project_ids: Array.isArray(v.projectIds) ? v.projectIds : [],
        contact: v.contact || "",
        acc: v.acc || "",
        ifsc: v.ifsc || ""
      }));
      if (vendorRows.length) {
        await sb.from("vendors").upsert(vendorRows, { onConflict: "id" });
      }

      const staffRows = (f.staffProfiles || []).map(s => ({
        id: s.id,
        fy: fyName,
        project_id: s.projectId,
        emp_id: s.empId || "",
        name: s.name,
        designation: s.designation || "",
        uan: s.uan || "",
        acc: s.acc || "",
        ifsc: s.ifsc || "",
        base_days: Number(s.baseDays) || 30,
        basic: Number(s.basic) || 0,
        hra: Number(s.hra) || 0,
        lta: Number(s.lta) || 0,
        special: Number(s.special) || 0,
        supp: Number(s.supp) || 0,
        gratuity: Number(s.gratuity) || 0,
        pf: Number(s.pf) || 0,
        pt: Number(s.pt) || 200
      }));
      if (staffRows.length) {
        await sb.from("staff_profiles").upsert(staffRows, { onConflict: "id" });
      }

      const salRows = (f.salaryRecords || []).map(r => ({
        id: r.id,
        fy: fyName,
        staff_id: r.staffId,
        project_id: r.projectId,
        month: r.month,
        base_days: Number(r.baseDays) || 30,
        present_days: Number(r.presentDays) || 30,
        basic: Number(r.basic) || 0,
        hra: Number(r.hra) || 0,
        lta: Number(r.lta) || 0,
        special: Number(r.special) || 0,
        supp: Number(r.supp) || 0,
        gratuity: Number(r.gratuity) || 0,
        pf: Number(r.pf) || 0,
        pt: Number(r.pt) || 200,
        final_ctc: Number(r.finalCtc) || 0,
        posted_expense_id: r.postedExpenseId || null
      }));
      if (salRows.length) {
        await sb.from("salary_records").upsert(salRows, { onConflict: "id" });
      }

      const expRows = (f.expenses || []).map(e => ({
        id: e.id,
        fy: fyName,
        category: e.category || "PROGRAM",
        salary_record_id: e.salaryRecordId || null,
        date: e.date,
        project_id: e.projectId,
        head_id: e.headId || null,
        entered_by_uid: e.enteredByUid || null,
        entered_by: e.enteredBy || "PM",
        entered_by_designation: e.enteredByDesignation || "Program Manager",
        entered_by_email: e.enteredByEmail || "",
        payee_name: e.payeeName,
        acc: e.acc || "",
        ifsc: e.ifsc || "",
        mode: e.mode || "NEFT",
        amount: Number(e.amount) || 0,
        remark: e.remark || "",
        bank_exported: Boolean(e.bankExported),
        bank_exported_at: e.bankExportedAt || null
      }));
      if (expRows.length) {
        await sb.from("expenses").upsert(expRows, { onConflict: "id" });
      }
    }
  } catch (err) {
    console.warn("Supabase push warning:", err);
  }
}

async function deleteRowFromSupabase(table, column, value) {
  if (!sb || !value) return;
  try {
    await sb.from(table).delete().eq(column, value);
  } catch (err) {
    console.warn(`Supabase delete warning (${table}):`, err);
  }
}

async function pullAllFromSupabase() {
  if (!sb) return;
  isSyncingFromSupabase = true;
  try {
    const [
      { data: users },
      { data: fys },
      { data: projects },
      { data: heads },
      { data: vendors },
      { data: staff },
      { data: salary },
      { data: expenses }
    ] = await Promise.all([
      sb.from("app_users").select("*"),
      sb.from("financial_years").select("*"),
      sb.from("projects").select("*"),
      sb.from("budget_heads").select("*"),
      sb.from("vendors").select("*"),
      sb.from("staff_profiles").select("*"),
      sb.from("salary_records").select("*"),
      sb.from("expenses").select("*")
    ]);

    const prevLoggedUid = state.ui ? state.ui.loggedUid : null;

    if (users && users.length) {
      state.users = users.map(u => ({
        uid: u.uid,
        email: u.email,
        password: u.password,
        fullName: u.full_name,
        designation: u.designation || "Program Manager",
        role: u.role || "PM",
        assignedProjects: Array.isArray(u.assigned_projects) ? u.assigned_projects : []
      }));
    }

    if (fys && fys.length) {
      const activeRow = fys.find(f => f.status === "ACTIVE") || fys[0];
      state.activeFy = activeRow.fy;
      state.fyList = fys.map(f => ({
        fy: f.fy,
        status: f.status || "ACTIVE",
        projects: (projects || []).filter(p => p.fy === f.fy).map(p => ({
          id: p.id, code: p.code, theme: p.theme, name: p.name,
          budget: Number(p.budget) || 0, logoUrl: p.logo_url || ""
        })),
        budgetHeads: (heads || []).filter(h => h.fy === f.fy).map(h => ({
          id: h.id, projectId: h.project_id, code: h.code, name: h.name,
          budget: Number(h.budget) || 0
        })),
        vendors: (vendors || []).filter(v => v.fy === f.fy).map(v => ({
          id: v.id, name: v.name, type: v.type || "Vendor",
          projectIds: Array.isArray(v.project_ids) ? v.project_ids : [],
          contact: v.contact || "", acc: v.acc || "", ifsc: v.ifsc || ""
        })),
        staffProfiles: (staff || []).filter(s => s.fy === f.fy).map(s => ({
          id: s.id, projectId: s.project_id, empId: s.emp_id || "", name: s.name,
          designation: s.designation || "", uan: s.uan || "", acc: s.acc || "",
          ifsc: s.ifsc || "", baseDays: Number(s.base_days) || 30,
          basic: Number(s.basic) || 0, hra: Number(s.hra) || 0, lta: Number(s.lta) || 0,
          special: Number(s.special) || 0, supp: Number(s.supp) || 0,
          gratuity: Number(s.gratuity) || 0, pf: Number(s.pf) || 0, pt: Number(s.pt) || 200
        })),
        salaryRecords: (salary || []).filter(r => r.fy === f.fy).map(r => ({
          id: r.id, staffId: r.staff_id, projectId: r.project_id, month: r.month,
          baseDays: Number(r.base_days) || 30, presentDays: Number(r.present_days) || 30,
          basic: Number(r.basic) || 0, hra: Number(r.hra) || 0, lta: Number(r.lta) || 0,
          special: Number(r.special) || 0, supp: Number(r.supp) || 0,
          gratuity: Number(r.gratuity) || 0, pf: Number(r.pf) || 0, pt: Number(r.pt) || 200,
          finalCtc: Number(r.final_ctc) || 0, postedExpenseId: r.posted_expense_id || null
        })),
        expenses: (expenses || []).filter(e => e.fy === f.fy).map(e => ({
          id: e.id, category: e.category || "PROGRAM", salaryRecordId: e.salary_record_id || null,
          date: e.date, projectId: e.project_id, headId: e.head_id || null,
          enteredByUid: e.entered_by_uid || null, enteredBy: e.entered_by || "PM",
          enteredByDesignation: e.entered_by_designation || "Program Manager",
          enteredByEmail: e.entered_by_email || "", payeeName: e.payee_name,
          acc: e.acc || "", ifsc: e.ifsc || "", mode: e.mode || "NEFT",
          amount: Number(e.amount) || 0, remark: e.remark || "",
          bankExported: Boolean(e.bank_exported), bankExportedAt: e.bank_exported_at || null
        }))
      }));
    }
await pullVarianceNotes();
    state = normalizeState(state);
    if (prevLoggedUid && state.users.some(u => u.uid === prevLoggedUid)) {
      state.ui.loggedUid = prevLoggedUid;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderApp();
  } catch (err) {
    console.error("Supabase pull error:", err);
  } finally {
    isSyncingFromSupabase = false;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (sb && !isSyncingFromSupabase) {
    clearTimeout(supabaseSyncTimer);
    supabaseSyncTimer = setTimeout(() => {
      pushStateToSupabase();
    }, 250);
  }
}

function getCurrentFy() {
  return state.fyList.find(f => f.fy === state.activeFy) || state.fyList[0];
}

function getLoggedUser() {
  return state.users.find(u => u.uid === state.ui.loggedUid) || null;
}

function formatINR(num) {
  const n = Number(num) || 0;
  return (n < 0 ? "-" : "") + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function formatPct(part, total) {
  if (!total || total <= 0) return part > 0 ? "100.0%" : "0.0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

function formatDateDDMMYYYY(isoDate) {
  if (!isoDate) return "—";
  const parts = String(isoDate).split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatMonthLabel(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = Number(m) - 1;
  return `${names[idx] || m}-${y}`;
}

function escapeHtmlAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ==================== CUSTOM CONFIRM DELETE POPUP ==================== */
function openConfirmDelete(message, onConfirm) {
  document.getElementById("confirmDeleteMessage").textContent = message;
  pendingDeleteCallback = onConfirm;
  document.getElementById("confirmDeleteModal").classList.add("open");
}

const btnConfirmDeleteProceed = document.getElementById("btnConfirmDeleteProceed");
if (btnConfirmDeleteProceed) {
  btnConfirmDeleteProceed.addEventListener("click", () => {
    const delModal = document.getElementById("confirmDeleteModal");
    if (delModal) delModal.classList.remove("open");
    if (typeof pendingDeleteCallback === "function") {
      const fn = pendingDeleteCallback;
      pendingDeleteCallback = null;
      fn();
    }
  });
}

/* ==================== CTC & SALARY CALCULATION ENGINE (HRMS MATCHED) ==================== */
function computeSalaryBreakdown(profile, overrideRecord = null) {
  const src = overrideRecord || profile;
  const baseDays = Number(src.baseDays ?? profile.baseDays ?? 30) || 30;
  const presentDays = Number(src.presentDays ?? baseDays);
  const ratio = baseDays > 0 ? presentDays / baseDays : 1;

  const fullBasic = Number(src.basic ?? profile.basic) || 0;
  const fullHra = Number(src.hra ?? profile.hra) || 0;
  const fullLta = Number(src.lta ?? profile.lta) || 0;
  const fullSpecial = Number(src.special ?? profile.special) || 0;
  const fullSupp = Number(src.supp ?? profile.supp) || 0;
  const fullGratuity = Number(src.gratuity ?? profile.gratuity) || 0;
  const fullPf = Number(src.pf ?? profile.pf) || 0;
  const pt = presentDays > 0 ? (Number(src.pt ?? profile.pt) || 0) : 0;

  const earnedBasic = Math.round(fullBasic * ratio);
  const earnedHra = Math.round(fullHra * ratio);
  const earnedLta = Math.round(fullLta * ratio);
  const earnedSpecial = Math.round(fullSpecial * ratio);
  const earnedSupp = Math.round(fullSupp * ratio);
  const earnedGratuity = Math.round(fullGratuity * ratio);
  const earnedPf = Math.round(fullPf * ratio);

  const grossEarned = earnedBasic + earnedHra + earnedLta + earnedSpecial + earnedSupp;
  const dedTotal = earnedPf + pt;
  const netPay = Math.max(0, grossEarned - dedTotal);
  const autoCtc = grossEarned + earnedPf + earnedGratuity;
  const finalCtc =
    overrideRecord && overrideRecord.finalCtc !== undefined && overrideRecord.finalCtc !== "" && overrideRecord.finalCtc !== null
      ? Number(overrideRecord.finalCtc)
      : profile.finalCtc !== undefined && profile.finalCtc !== "" && profile.finalCtc !== null
      ? Number(profile.finalCtc)
      : autoCtc;

  return {
    baseDays,
    presentDays,
    earnedBasic,
    earnedHra,
    earnedLta,
    earnedSpecial,
    earnedSupp,
    earnedGratuity,
    earnedPf,
    pt,
    grossEarned,
    dedTotal,
    netPay,
    autoCtc,
    finalCtc
  };
}

function getOrSeedSalaryRecordForMonth(fy, staffProfile, monthYm) {
  let rec = (fy.salaryRecords || []).find(r => r.staffId === staffProfile.id && r.month === monthYm);
  if (rec) return rec;

  const prevRecs = (fy.salaryRecords || [])
    .filter(r => r.staffId === staffProfile.id && r.month < monthYm)
    .sort((a, b) => b.month.localeCompare(a.month));
  const prev = prevRecs[0] || staffProfile;

  const calc = computeSalaryBreakdown(staffProfile, prev);
  rec = {
    id: "SAL_" + staffProfile.id + "_" + monthYm,
    staffId: staffProfile.id,
    projectId: staffProfile.projectId,
    month: monthYm,
    baseDays: prev.baseDays ?? staffProfile.baseDays ?? 30,
    presentDays: prev.presentDays ?? staffProfile.baseDays ?? 30,
    basic: prev.basic ?? staffProfile.basic ?? 0,
    hra: prev.hra ?? staffProfile.hra ?? 0,
    lta: prev.lta ?? staffProfile.lta ?? 0,
    special: prev.special ?? staffProfile.special ?? 0,
    supp: prev.supp ?? staffProfile.supp ?? 0,
    gratuity: prev.gratuity ?? staffProfile.gratuity ?? 0,
    pf: prev.pf ?? staffProfile.pf ?? 0,
    pt: prev.pt ?? staffProfile.pt ?? 200,
    finalCtc: calc.finalCtc,
    postedExpenseId: null
  };
  fy.salaryRecords.push(rec);
  return rec;
}

function getDefaultSalaryHeadId(fy, projectId) {
  const heads = fy.budgetHeads.filter(h => h.projectId === projectId);
  const salHead = heads.find(h => h.name.toLowerCase().includes("salary"));
  return salHead ? salHead.id : "";
}

function getQuarterFromDate(isoDate) {
  if (!isoDate) return null;
  const m = Number(String(isoDate).split("-")[1]);
  if (m >= 4 && m <= 6) return "Q1";
  if (m >= 7 && m <= 9) return "Q2";
  if (m >= 10 && m <= 12) return "Q3";
  if (m >= 1 && m <= 3) return "Q4";
  return null;
}

function matchesQuarter(isoDate, qFilter) {
  if (!qFilter || qFilter === "ALL") return true;
  return getQuarterFromDate(isoDate) === qFilter;
}

function syncProjectBudgetFromHeads(fy, projectId) {
  const proj = fy.projects.find(p => p.id === projectId);
  if (!proj) return;
  const heads = fy.budgetHeads.filter(h => h.projectId === projectId);
  if (heads.length > 0) {
    proj.budget = heads.reduce((sum, h) => sum + (Number(h.budget) || 0), 0);
  }
}

function getProjectSpent(projectId, quarter = "ALL") {
  const fy = getCurrentFy();
  return (fy.expenses || [])
    .filter(e => e.projectId === projectId && matchesQuarter(e.date, quarter))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

function getProjectSalarySpent(projectId, quarter = "ALL") {
  const fy = getCurrentFy();
  return fy.expenses
    .filter(e => e.projectId === projectId && e.category === "SALARY" && matchesQuarter(e.date, quarter))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

function getHeadSpent(headId, quarter = "ALL") {
  const fy = getCurrentFy();
  return fy.expenses
    .filter(e => e.headId === headId && matchesQuarter(e.date, quarter))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

function getProjectOwnerEntries(projectId) {
  return state.users.filter(u => (u.assignedProjects || []).includes(projectId));
}

function getExpenseCreatorLabel(exp) {
  const matchedByUid = exp.enteredByUid ? state.users.find(u => u.uid === exp.enteredByUid) : null;
  const name = matchedByUid ? matchedByUid.fullName : (exp.enteredBy || "PM");
  const desig = matchedByUid ? matchedByUid.designation : (exp.enteredByDesignation || "Program Manager");
  const email = matchedByUid ? matchedByUid.email : (exp.enteredByEmail || "");
  return { name, desig, email };
}

function toggleExpenseBankExported(expId) {
  const fy = getCurrentFy();
  const exp = fy.expenses.find(e => e.id === expId);
  if (!exp) return;
  exp.bankExported = !exp.bankExported;
  exp.bankExportedAt = exp.bankExported ? new Date().toISOString().slice(0, 10) : null;
  saveState();
  const user = getLoggedUser();
  if (user?.role === "CSR_HEAD") renderCsrHeadView();
  else if (user) renderPmDashboardView(user);
}

/* ==================== PASSWORD EYE TOGGLE & LOGIN ==================== */
document.getElementById("toggleLoginPass").addEventListener("click", () => {
  const inp = document.getElementById("loginPassInput");
  inp.type = inp.type === "password" ? "text" : "password";
});

document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const emailVal = document.getElementById("loginEmailInput").value.trim().toLowerCase();
  const passVal = document.getElementById("loginPassInput").value;
  const errBox = document.getElementById("loginError");

  const matched = state.users.find(u => u.email.toLowerCase() === emailVal && u.password === passVal);
  if (!matched) {
    errBox.textContent = "Invalid Email ID or Password. Please check spelling/case and try again.";
    errBox.style.display = "block";
    return;
  }

  errBox.style.display = "none";
  state.ui.loggedUid = matched.uid;
  if (matched.role === "PM") {
    const firstPid = (matched.assignedProjects || [])[0] || null;
    state.ui.pmSelectedProjectId = firstPid;
  }
  saveState();
  renderApp();
});

document.getElementById("btnLogout").addEventListener("click", () => {
  state.ui.loggedUid = null;
  saveState();
  document.getElementById("loginForm").reset();
  renderApp();
});

document.getElementById("btnOpenResetPass").addEventListener("click", () => {
  document.getElementById("resetPassForm").reset();
  document.getElementById("rpEmail").value = document.getElementById("loginEmailInput").value.trim();
  document.getElementById("resetPassModal").classList.add("open");
});

document.getElementById("btnTopResetPass").addEventListener("click", () => {
  const user = getLoggedUser();
  document.getElementById("resetPassForm").reset();
  if (user) document.getElementById("rpEmail").value = user.email;
  document.getElementById("resetPassModal").classList.add("open");
});

document.getElementById("resetPassForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("rpEmail").value.trim().toLowerCase();
  const oldPass = document.getElementById("rpOldPass").value;
  const newPass = document.getElementById("rpNewPass").value;

  const user = state.users.find(u => u.email.toLowerCase() === email && u.password === oldPass);
  if (!user) {
    alert("Current Email ID or Password is incorrect.");
    return;
  }
  user.password = newPass;
  saveState();
  document.getElementById("resetPassModal").classList.remove("open");
  alert(`Password updated successfully for ${user.email}!`);
});

/* ==================== RENDER CONTROLLER ==================== */
function renderApp() {
  const user = getLoggedUser();
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");

  if (!user) {
    loginScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");

  const fy = getCurrentFy();
  const fyName = fy.fy || "FY 2026-27";
  const statusTag = fy.status === "ARCHIVED" ? " [ARCHIVED]" : "";
  document.getElementById("loggedUserMeta").textContent =
    `${user.fullName} (${user.designation}) • ${user.email} • ${fyName}${statusTag}`;
  document.getElementById("headFyLabel").textContent = `${fyName}${statusTag}`;

  const fySel = document.getElementById("fySelect");
  fySel.innerHTML = state.fyList
    .map(f => {
      const label = f.fy || "FY 2026-27";
      return `<option value="${label}" ${label === state.activeFy ? "selected" : ""}>${label}${f.status === "ARCHIVED" ? " (Archived)" : ""}</option>`;
    })
    .join("");

  document.querySelectorAll(".head-only-btn").forEach(btn => {
    btn.classList.toggle("hidden", user.role !== "CSR_HEAD");
  });

  if (user.role === "CSR_HEAD") {
    document.getElementById("csrHeadMain").classList.remove("hidden");
    document.getElementById("pmDashboardMain").classList.add("hidden");
    renderCsrHeadView();
  } else {
    document.getElementById("csrHeadMain").classList.add("hidden");
    document.getElementById("pmDashboardMain").classList.remove("hidden");
    renderPmDashboardView(user);
  }
}

/* ==================== FINANCIAL YEAR ADD / EDIT / ARCHIVE (CSR HEAD) ==================== */
document.getElementById("btnEditFy").addEventListener("click", () => {
  const current = getCurrentFy();
  document.getElementById("fyModalTitle").textContent = "Edit Financial Year";
  document.getElementById("fyModalMode").value = "EDIT";
  document.getElementById("fyNameInput").value = current.fy || "FY 2026-27";
  document.getElementById("fyStatusInput").value = current.status || "ACTIVE";
  document.getElementById("fyModal").classList.add("open");
});

document.getElementById("btnAddNewFy").addEventListener("click", () => {
  document.getElementById("fyModalTitle").textContent = "Add New Financial Year";
  document.getElementById("fyModalMode").value = "ADD";
  document.getElementById("fyNameInput").value = "FY 2027-28";
  document.getElementById("fyStatusInput").value = "ACTIVE";
  document.getElementById("fyModal").classList.add("open");
});

document.getElementById("fyModalForm").addEventListener("submit", e => {
  e.preventDefault();
  const mode = document.getElementById("fyModalMode").value;
  const newName = document.getElementById("fyNameInput").value.trim();
  const newStatus = document.getElementById("fyStatusInput").value;
  if (!newName) return;

  if (mode === "EDIT") {
    const current = getCurrentFy();
    const oldFyName = current.fy;
    current.fy = newName;
    current.status = newStatus;
    state.activeFy = newName;
    if (oldFyName && oldFyName !== newName) {
      deleteRowFromSupabase("financial_years", "fy", oldFyName);
    }
  } else {
    if (state.fyList.some(f => f.fy.toLowerCase() === newName.toLowerCase())) {
      alert("This Financial Year already exists.");
      return;
    }
    const current = getCurrentFy();
    state.fyList.push({
      fy: newName,
      status: newStatus,
      projects: current.projects.map(p => ({ ...p })),
      budgetHeads: current.budgetHeads.map(h => ({ ...h })),
      vendors: current.vendors.map(v => ({ ...v, projectIds: [...(v.projectIds || [])] })),
      staffProfiles: (current.staffProfiles || []).map(s => ({ ...s })),
      salaryRecords: [],
      expenses: []
    });
    state.activeFy = newName;
  }

  document.getElementById("fyModal").classList.remove("open");
  saveState();
  renderApp();
});

document.getElementById("btnArchiveCurrentFy").addEventListener("click", () => {
  const current = getCurrentFy();
  const nextFyName = prompt(
    `Archive "${current.fy}" (save as read-only archive) and create new active Financial Year:`,
    "FY 2027-28"
  );
  if (!nextFyName || !nextFyName.trim()) return;
  const cleanNext = nextFyName.trim();
  if (state.fyList.some(f => f.fy.toLowerCase() === cleanNext.toLowerCase())) {
    alert("This Financial Year already exists.");
    return;
  }

  current.status = "ARCHIVED";

  state.fyList.push({
    fy: cleanNext,
    status: "ACTIVE",
    projects: current.projects.map(p => ({ ...p })),
    budgetHeads: current.budgetHeads.map(h => ({ ...h })),
    vendors: current.vendors.map(v => ({ ...v, projectIds: [...(v.projectIds || [])] })),
    staffProfiles: (current.staffProfiles || []).map(s => ({ ...s })),
    salaryRecords: [],
    expenses: []
  });

  state.activeFy = cleanNext;
  state.ui.headProjectScope = "ALL";
  saveState();
  renderApp();
  alert(`"${current.fy}" has been archived and "${cleanNext}" is now active!`);
});

let pendingDeleteFyName = null;

function fyHasAnyData(fyObj) {
  if (!fyObj) return false;
  return Boolean(
    (fyObj.expenses && fyObj.expenses.length) ||
    (fyObj.salaryRecords && fyObj.salaryRecords.length) ||
    (fyObj.staffProfiles && fyObj.staffProfiles.length)
  );
}

function exportFyBackupFile(fyObj, format) {
  const safeName = (fyObj.fy || "FY").replace(/\s+/g, "_");
  if (format === "JSON") {
    const blob = new Blob([JSON.stringify(fyObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fyObj.projects || []), "Projects");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fyObj.expenses || []), "Expenses");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fyObj.salaryRecords || []), "Salary_Records");
    XLSX.writeFile(wb, `${safeName}_Backup.xlsx`);
  }
}

document.getElementById("btnDeleteCurrentFy").addEventListener("click", () => {
  if (state.fyList.length <= 1) {
    alert("At least one Financial Year must remain in the system.");
    return;
  }
  const current = getCurrentFy();
  pendingDeleteFyName = current.fy;
  document.getElementById("fyDelStep1Msg").textContent = `Step 1: Kya aap "${current.fy}" ko delete karna chahte hain?`;
  document.getElementById("fyDelStep1Body").classList.remove("hidden");
  document.getElementById("fyDelExportBody").classList.add("hidden");
  document.getElementById("fyDelStep2Body").classList.add("hidden");
  document.getElementById("safeFyDeleteModal").classList.add("open");
});

document.getElementById("btnFyDelStep1Next").addEventListener("click", () => {
  const targetFy = state.fyList.find(f => f.fy === pendingDeleteFyName);
  document.getElementById("fyDelStep1Body").classList.add("hidden");
  if (fyHasAnyData(targetFy)) {
    document.getElementById("fyDelExportBody").classList.remove("hidden");
  } else {
    document.getElementById("fyDelStep2Msg").textContent = `Step 2 (Final): "${pendingDeleteFyName}" ko permanently delete karein?`;
    document.getElementById("fyDelStep2Body").classList.remove("hidden");
  }
});

function moveFyDeleteToStep2() {
  document.getElementById("fyDelExportBody").classList.add("hidden");
  document.getElementById("fyDelStep2Msg").textContent = `Step 2 (Final): "${pendingDeleteFyName}" ka data permanently delete ho jayega. Confirm karein.`;
  document.getElementById("fyDelStep2Body").classList.remove("hidden");
}

document.getElementById("btnFyDelExportYes").addEventListener("click", () => {
  const targetFy = state.fyList.find(f => f.fy === pendingDeleteFyName);
  const fmt = document.getElementById("fyDelExportFormat").value || "EXCEL";
  if (targetFy) exportFyBackupFile(targetFy, fmt);
  moveFyDeleteToStep2();
});

document.getElementById("btnFyDelExportNo").addEventListener("click", moveFyDeleteToStep2);

document.getElementById("btnFyDelFinalConfirm").addEventListener("click", () => {
  if (!pendingDeleteFyName || state.fyList.length <= 1) return;
  const deletedFyName = pendingDeleteFyName;
  state.fyList = state.fyList.filter(f => f.fy !== deletedFyName);
  if (state.activeFy === deletedFyName) {
    state.activeFy = state.fyList[0].fy;
  }
  pendingDeleteFyName = null;
  document.getElementById("safeFyDeleteModal").classList.remove("open");
  deleteRowFromSupabase("financial_years", "fy", deletedFyName);
  saveState();
  renderApp();
});

/* ==================== CSR HEAD DASHBOARD ==================== */
function renderCsrHeadView() {
  const fy = getCurrentFy();
  const scopeSel = document.getElementById("headProjectScope");

  if (state.ui.headProjectScope !== "ALL" && !fy.projects.some(p => p.id === state.ui.headProjectScope)) {
    state.ui.headProjectScope = "ALL";
  }

  scopeSel.innerHTML =
    `<option value="ALL" ${state.ui.headProjectScope === "ALL" ? "selected" : ""}>All Projects — Master Summary (${fy.projects.length})</option>` +
    fy.projects.map(p => `<option value="${p.id}" ${state.ui.headProjectScope === p.id ? "selected" : ""}>${p.code} — ${p.name}</option>`).join("");

  document.getElementById("headFilterFromDate").value = state.ui.headFilterFromDate || "";
  document.getElementById("headFilterToDate").value = state.ui.headFilterToDate || "";
  document.getElementById("headFilterCategory").value = state.ui.headFilterCategory || "ALL";
  document.getElementById("headFromFormatted").textContent = state.ui.headFilterFromDate
    ? `From: ${formatDateDDMMYYYY(state.ui.headFilterFromDate)}`
    : "From: Any";
  document.getElementById("headToFormatted").textContent = state.ui.headFilterToDate
    ? `To: ${formatDateDDMMYYYY(state.ui.headFilterToDate)}`
    : "To: Any";

  document.getElementById("headSalaryMonth").value = state.ui.headSalaryMonth || "2026-11";

  renderStep1BudgetSection();
  renderStep2PmAllocationSection();
  renderStep3VendorListSection();
  renderHeadStaffSalarySection();
  renderStep4ExpensesAndChartsSection();
  saveState();
}

function renderOwnerBadges(projectId) {
  const owners = getProjectOwnerEntries(projectId);
  if (!owners.length) {
    return `<span class="badge badge-amber">Unassigned</span>`;
  }
  return owners
    .map(u => `<span class="badge badge-blue">${u.fullName} <em style="font-style:normal; opacity:0.85;">(${u.designation})</em></span>`)
    .join(" ");
}

function renderLogoCell(logoUrl, label) {
  if (!logoUrl) return `<span style="color:var(--muted); font-size:11px;">—</span>`;
  return `<img src="${logoUrl}" alt="${escapeHtmlAttr(label)}" class="proj-logo-thumb" />`;
}

function renderStep1BudgetSection() {
  const fy = getCurrentFy();
  const scope = state.ui.headProjectScope;
  const q = state.ui.headQuarterFilter || "ALL";
  if (document.getElementById("headQuarterFilter")) {
    document.getElementById("headQuarterFilter").value = q;
  }

  const scopedProjects = scope === "ALL" ? fy.projects : fy.projects.filter(p => p.id === scope);

  const totBudget = scopedProjects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const totSpent = scopedProjects.reduce((s, p) => s + getProjectSpent(p.id, q), 0);
  const totSalSpent = scopedProjects.reduce((s, p) => s + getProjectSalarySpent(p.id, q), 0);
  const totProgSpent = totSpent - totSalSpent;
  const totBal = totBudget - totSpent;
  const isOver = totBal < 0;

  document.getElementById("headScopeKpis").innerHTML = `
    <div class="kpi-box">
      <div class="lbl">Proposed Budget</div>
      <div class="val">${formatINR(totBudget)}</div>
      <div class="sub">${scopedProjects.length} Project(s) Selected</div>
    </div>
    <div class="kpi-box ${isOver ? "over" : ""}">
      <div class="lbl">Total Actual Expense</div>
      <div class="val ${isOver ? "text-danger" : ""}">${formatINR(totSpent)}</div>
      <div class="sub">Prog: ${formatINR(totProgSpent)} • Salary: ${formatINR(totSalSpent)}</div>
    </div>
    <div class="kpi-box ${isOver ? "over" : ""}">
      <div class="lbl">Remaining Balance</div>
      <div class="val ${isOver ? "text-danger" : "text-success"}">${formatINR(totBal)}</div>
      <div class="sub ${isOver ? "text-danger" : ""}">${isOver ? "OVER BUDGET ALERT" : formatPct(totBal, totBudget) + " Remaining"}</div>
    </div>
  `;

  const tbody = document.getElementById("headBudgetTableBody");
  let html = "";

  if (scope === "ALL") {
    const themes = [...new Set(fy.projects.map(p => p.theme))];
    themes.forEach(theme => {
      const tProjs = fy.projects.filter(p => p.theme === theme);
      const tBud = tProjs.reduce((s, p) => s + p.budget, 0);
      const tSp = tProjs.reduce((s, p) => s + getProjectSpent(p.id, q), 0);
      const tBl = tBud - tSp;

      html += `
        <tr class="theme-row">
          <td>—</td><td>—</td><td>${theme}</td><td>—</td>
          <td class="num">${formatINR(tBud)}</td>
          <td class="num">${formatINR(tSp)}</td>
          <td class="num ${tBl < 0 ? "text-danger" : ""}">${formatINR(tBl)}</td>
          <td class="num">${formatPct(tSp, tBud)}</td>
          <td class="num">${formatPct(tBl, tBud)}</td>
          <td class="center">—</td>
        </tr>
      `;

      tProjs.forEach(p => {
        const sp = getProjectSpent(p.id, q);
        const salSp = getProjectSalarySpent(p.id, q);
        const bl = p.budget - sp;
        html += `
          <tr class="${bl < 0 ? "over-row" : ""}">
            <td class="center">${renderLogoCell(p.logoUrl, p.name)}</td>
            <td><strong>${p.code}</strong></td>
            <td>
              ${p.name}
              ${salSp > 0 ? `<div style="font-size:11px; color:var(--success);">Incl. Staff Salary: ${formatINR(salSp)}</div>` : ""}
            </td>
            <td>${renderOwnerBadges(p.id)}</td>
            <td class="num">${formatINR(p.budget)}</td>
            <td class="num ${bl < 0 ? "text-danger" : ""}">${formatINR(sp)}</td>
            <td class="num ${bl < 0 ? "text-danger" : "text-success"}">${formatINR(bl)}</td>
            <td class="num">${formatPct(sp, p.budget)}</td>
            <td class="num">${formatPct(bl, p.budget)}</td>
            <td class="center" style="white-space:nowrap;">
              <button class="btn-outline btn-sm" onclick="openEditProjectModal('${p.id}')">Edit</button>
              <button class="btn-danger btn-sm" onclick="deleteProjectItem('${p.id}')">Delete</button>
            </td>
          </tr>
        `;
      });
    });
  } else {
    const proj = scopedProjects[0];
    const pSp = getProjectSpent(proj.id, q);
    const pBl = proj.budget - pSp;

    html += `
      <tr class="theme-row">
        <td class="center">${renderLogoCell(proj.logoUrl, proj.name)}</td>
        <td>${proj.code}</td><td>${proj.name} (Project Master)</td><td>${renderOwnerBadges(proj.id)}</td>
        <td class="num">${formatINR(proj.budget)}</td>
        <td class="num ${pBl < 0 ? "text-danger" : ""}">${formatINR(pSp)}</td>
        <td class="num ${pBl < 0 ? "text-danger" : "text-success"}">${formatINR(pBl)}</td>
        <td class="num">${formatPct(pSp, proj.budget)}</td>
        <td class="num">${formatPct(pBl, proj.budget)}</td>
        <td class="center" style="white-space:nowrap;">
          <button class="btn-outline btn-sm" onclick="openEditProjectModal('${proj.id}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteProjectItem('${proj.id}')">Delete</button>
        </td>
      </tr>
    `;

    const heads = fy.budgetHeads.filter(h => h.projectId === proj.id);
    heads.forEach(h => {
      const hSp = getHeadSpent(h.id, q);
      const hBl = h.budget - hSp;
      html += `
        <tr class="${hBl < 0 ? "over-row" : ""}">
          <td>—</td>
          <td><strong>${h.code}</strong></td>
          <td>↳ ${h.name}</td>
          <td><span style="color:var(--muted); font-size:12px;">Section Head</span></td>
          <td class="num">${formatINR(h.budget)}</td>
          <td class="num ${hBl < 0 ? "text-danger" : ""}">${formatINR(hSp)}</td>
          <td class="num ${hBl < 0 ? "text-danger" : "text-success"}">${formatINR(hBl)}</td>
          <td class="num">${formatPct(hSp, h.budget)}</td>
          <td class="num">${formatPct(hBl, h.budget)}</td>
          <td class="center" style="white-space:nowrap;">
            <button class="btn-outline btn-sm" onclick="openEditHeadModal('${h.id}')">Edit</button>
            <button class="btn-danger btn-sm" onclick="deleteHeadItem('${h.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  }

  html += `
    <tr class="total-row">
      <td></td><td></td><td>TOTAL (${scopedProjects.length} Project${scopedProjects.length === 1 ? "" : "s"})</td><td></td>
      <td class="num">${formatINR(totBudget)}</td>
      <td class="num ${isOver ? "text-danger" : ""}">${formatINR(totSpent)}</td>
      <td class="num ${isOver ? "text-danger" : ""}">${formatINR(totBal)}</td>
      <td class="num">${formatPct(totSpent, totBudget)}</td>
      <td class="num">${formatPct(totBal, totBudget)}</td>
      <td></td>
    </tr>
  `;
  tbody.innerHTML = html;
let noteHost = document.getElementById("singleProjectVarianceHost");
  if (!noteHost) {
    noteHost = document.createElement("div");
    noteHost.id = "singleProjectVarianceHost";
    tbody.closest(".table-wrap")?.insertAdjacentElement("afterend", noteHost);
  }
  noteHost.innerHTML = scope !== "ALL" && scopedProjects[0]
    ? getReconciliationBlockHTML(scopedProjects[0].id)
    : "";
}

/* --- PROJECT LOGO UPLOAD PREVIEW IN BUDGET MODAL --- */
function syncBudgetLogoPreview(logoDataUrl) {
  document.getElementById("bmLogoDataUrl").value = logoDataUrl || "";
  const img = document.getElementById("bmLogoPreview");
  const clearBtn = document.getElementById("btnClearBmLogo");
  if (logoDataUrl) {
    img.src = logoDataUrl;
    img.classList.remove("hidden");
    clearBtn.classList.remove("hidden");
  } else {
    img.src = "";
    img.classList.add("hidden");
    clearBtn.classList.add("hidden");
  }
}

document.getElementById("bmLogoFile").addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => syncBudgetLogoPreview(String(reader.result || ""));
  reader.readAsDataURL(file);
});

document.getElementById("btnClearBmLogo").addEventListener("click", () => {
  document.getElementById("bmLogoFile").value = "";
  syncBudgetLogoPreview("");
});

function openEditProjectModal(projectId) {
  const fy = getCurrentFy();
  const p = fy.projects.find(x => x.id === projectId);
  if (!p) return;
  document.getElementById("budgetModalTitle").textContent = "Edit Project Budget & Logo";
  document.getElementById("bmMode").value = "EDIT_PROJECT";
  document.getElementById("bmTargetId").value = p.id;
  document.getElementById("bmThemeWrap").classList.remove("hidden");
  document.getElementById("bmLogoWrap").classList.remove("hidden");
  document.getElementById("bmLogoFile").value = "";
  document.getElementById("bmTheme").value = p.theme;
  document.getElementById("bmCode").value = p.code;
  document.getElementById("bmName").value = p.name;
  document.getElementById("bmAmount").value = p.budget;
  syncBudgetLogoPreview(p.logoUrl || "");
  document.getElementById("budgetModal").classList.add("open");
}

function deleteHeadItem(headId) {
  const fy = getCurrentFy();
  const h = fy.budgetHeads.find(x => x.id === headId);
  openConfirmDelete(`Delete budget head "${h ? h.code + " " + h.name : headId}"?`, () => {
    const parentProjectId = h ? h.projectId : null;
    fy.budgetHeads = fy.budgetHeads.filter(x => x.id !== headId);
    fy.expenses.forEach(e => {
      if (e.headId === headId) e.headId = null;
    });
    if (parentProjectId) syncProjectBudgetFromHeads(fy, parentProjectId);
    deleteRowFromSupabase("budget_heads", "id", headId);
    saveState();
    renderCsrHeadView();
  });
}

function openEditHeadModal(headId) {
  const fy = getCurrentFy();
  const h = fy.budgetHeads.find(x => x.id === headId);
  if (!h) return;
  document.getElementById("budgetModalTitle").textContent = "Edit Budget Head / Section";
  document.getElementById("bmMode").value = "EDIT_HEAD";
  document.getElementById("bmTargetId").value = h.id;
  document.getElementById("bmThemeWrap").classList.add("hidden");
  document.getElementById("bmLogoWrap").classList.add("hidden");
  document.getElementById("bmCode").value = h.code;
  document.getElementById("bmName").value = h.name;
  document.getElementById("bmAmount").value = h.budget;
  document.getElementById("budgetModal").classList.add("open");
}

function deleteProjectItem(projectId) {
  const fy = getCurrentFy();
  const p = fy.projects.find(x => x.id === projectId);
  openConfirmDelete(`Delete project "${p ? p.code + " " + p.name : projectId}" and all its budget heads, expenses & staff?`, () => {
    fy.projects = fy.projects.filter(x => x.id !== projectId);
    fy.budgetHeads = fy.budgetHeads.filter(h => h.projectId !== projectId);
    fy.expenses = fy.expenses.filter(e => e.projectId !== projectId);
    fy.staffProfiles = (fy.staffProfiles || []).filter(s => s.projectId !== projectId);
    fy.salaryRecords = (fy.salaryRecords || []).filter(r => r.projectId !== projectId);
    fy.vendors.forEach(v => {
      v.projectIds = (v.projectIds || []).filter(pid => pid !== projectId);
    });
    if (state.ui.headProjectScope === projectId) state.ui.headProjectScope = "ALL";
    deleteRowFromSupabase("projects", "id", projectId);
    saveState();
    renderCsrHeadView();
  });
}

document.getElementById("btnAddSubHead").addEventListener("click", () => {
  if (state.ui.headProjectScope === "ALL") {
    alert("Please select a specific project in Project Scope dropdown first.");
    return;
  }
  document.getElementById("budgetModalTitle").textContent = "Add Budget Head / Section";
  document.getElementById("bmMode").value = "ADD_HEAD";
  document.getElementById("bmTargetId").value = state.ui.headProjectScope;
  document.getElementById("bmThemeWrap").classList.add("hidden");
  document.getElementById("bmLogoWrap").classList.add("hidden");
  document.getElementById("bmCode").value = "";
  document.getElementById("bmName").value = "";
  document.getElementById("bmAmount").value = "";
  document.getElementById("budgetModal").classList.add("open");
});

document.getElementById("btnAddProject").addEventListener("click", () => {
  document.getElementById("budgetModalTitle").textContent = "Add New Project";
  document.getElementById("bmMode").value = "ADD_PROJECT";
  document.getElementById("bmTargetId").value = "";
  document.getElementById("bmThemeWrap").classList.remove("hidden");
  document.getElementById("bmLogoWrap").classList.remove("hidden");
  document.getElementById("bmLogoFile").value = "";
  document.getElementById("bmTheme").value = "1. Health";
  document.getElementById("bmCode").value = "";
  document.getElementById("bmName").value = "";
  document.getElementById("bmAmount").value = "";
  syncBudgetLogoPreview("");
  document.getElementById("budgetModal").classList.add("open");
});

document.getElementById("budgetModalForm").addEventListener("submit", e => {
  e.preventDefault();
  const fy = getCurrentFy();
  const mode = document.getElementById("bmMode").value;
  const targetId = document.getElementById("bmTargetId").value;
  const code = document.getElementById("bmCode").value.trim();
  const name = document.getElementById("bmName").value.trim();
  const budget = Number(document.getElementById("bmAmount").value) || 0;
  const logoUrl = document.getElementById("bmLogoDataUrl").value || "";

  if (mode === "EDIT_PROJECT") {
    const p = fy.projects.find(x => x.id === targetId);
    if (p) {
      p.theme = document.getElementById("bmTheme").value.trim() || p.theme;
      p.code = code;
      p.name = name;
      p.budget = budget;
      p.logoUrl = logoUrl;
    }
  } else if (mode === "ADD_PROJECT") {
    fy.projects.push({
      id: "P_" + Date.now(),
      theme: document.getElementById("bmTheme").value.trim() || "General",
      code,
      name,
      budget,
      logoUrl
    });
  } else if (mode === "EDIT_HEAD") {
    const h = fy.budgetHeads.find(x => x.id === targetId);
    if (h) {
      h.code = code;
      h.name = name;
      h.budget = budget;
      syncProjectBudgetFromHeads(fy, h.projectId);
    }
  } else if (mode === "ADD_HEAD") {
    fy.budgetHeads.push({ id: "H_" + Date.now(), projectId: targetId, code, name, budget });
    syncProjectBudgetFromHeads(fy, targetId);
  }

  document.getElementById("budgetModal").classList.remove("open");
  saveState();
  renderCsrHeadView();
});

/* --- STEP 2: TEAM / PM ADD, EDIT, DELETE, DESIGNATION & RIGHTS (CSR HEAD ONLY) --- */
function renderStep2PmAllocationSection() {
  const fy = getCurrentFy();
  const members = state.users;
  if (!members.some(u => u.uid === state.ui.selectedPmUid) && members[0]) {
    state.ui.selectedPmUid = members[0].uid;
  }

  const listEl = document.getElementById("pmUsersList");
  listEl.innerHTML = members.map(u => {
    const count = (u.assignedProjects || []).filter(pid => fy.projects.some(p => p.id === pid)).length;
    return `
      <div class="pm-list-item ${u.uid === state.ui.selectedPmUid ? "active" : ""}" onclick="selectPmForRights('${u.uid}')">
        <div>
          <strong>${u.fullName}</strong>
          <div style="font-size:11.5px; color:var(--primary); font-weight:600;">${u.designation || "Program Manager"}</div>
          <div style="font-size:12px; color:var(--muted);">${u.email}</div>
        </div>
        <span class="badge ${u.role === "CSR_HEAD" ? "badge-amber" : "badge-blue"}">${count} Project(s)</span>
      </div>
    `;
  }).join("");

  const activeUser = members.find(u => u.uid === state.ui.selectedPmUid);
  if (!activeUser) return;

  document.getElementById("selectedPmTitle").textContent =
    `Project Rights for: ${activeUser.fullName} — ${activeUser.designation || "Program Manager"}`;
  document.getElementById("selectedPmCreds").textContent =
    `Designation: ${activeUser.designation || "Program Manager"}  |  Email ID: ${activeUser.email}  |  Password: ${activeUser.password}`;

  const assignedSet = new Set(activeUser.assignedProjects || []);
  const gridEl = document.getElementById("pmRightsCheckboxes");
  gridEl.innerHTML = fy.projects.map(p => {
    const isChecked = assignedSet.has(p.id);
    return `
      <label class="right-check-card ${isChecked ? "checked" : ""}">
        <input type="checkbox" class="pm-proj-checkbox" value="${p.id}" ${isChecked ? "checked" : ""} />
        <div>
          <strong>${p.code} ${p.name}</strong>
          <div style="font-size:11.5px; color:var(--muted);">${p.theme} • ${formatINR(p.budget)}</div>
        </div>
      </label>
    `;
  }).join("");
}

function selectPmForRights(uid) {
  state.ui.selectedPmUid = uid;
  renderStep2PmAllocationSection();
}

document.getElementById("btnSavePmRights").addEventListener("click", () => {
  const activeUser = state.users.find(u => u.uid === state.ui.selectedPmUid);
  if (!activeUser) return;
  activeUser.assignedProjects = [...document.querySelectorAll(".pm-proj-checkbox:checked")].map(cb => cb.value);
  saveState();
  renderCsrHeadView();
  alert(`Saved ${activeUser.assignedProjects.length} project right(s) for ${activeUser.fullName}!`);
});

document.getElementById("btnAddPmUser").addEventListener("click", () => {
  document.getElementById("pmUserModalTitle").textContent = "Add New PM / Team Member";
  document.getElementById("pmEditUid").value = "";
  document.getElementById("pmUserForm").reset();
  document.getElementById("pmDesignation").value = "Program Manager";
  document.getElementById("pmPassword").value = "Admin@123";
  document.getElementById("pmUserModal").classList.add("open");
});

document.getElementById("btnEditPmCreds").addEventListener("click", () => {
  const u = state.users.find(x => x.uid === state.ui.selectedPmUid);
  if (!u) return;
  document.getElementById("pmUserModalTitle").textContent = "Edit Name, Designation & Login";
  document.getElementById("pmEditUid").value = u.uid;
  document.getElementById("pmFullName").value = u.fullName;
  document.getElementById("pmDesignation").value = u.designation || "Program Manager";
  document.getElementById("pmEmailInput").value = u.email;
  document.getElementById("pmPassword").value = u.password;
  document.getElementById("pmUserModal").classList.add("open");
});

document.getElementById("btnDeletePmUser").addEventListener("click", () => {
  const u = state.users.find(x => x.uid === state.ui.selectedPmUid);
  if (!u) return;
  if (u.role === "CSR_HEAD") {
    alert("CSR Head account cannot be deleted.");
    return;
  }
  openConfirmDelete(`Delete account for ${u.fullName} (${u.designation} • ${u.email})?`, () => {
    state.users = state.users.filter(x => x.uid !== u.uid);
    state.ui.selectedPmUid = state.users[0]?.uid || null;
    deleteRowFromSupabase("app_users", "uid", u.uid);
    saveState();
    renderCsrHeadView();
  });
});

document.getElementById("pmUserForm").addEventListener("submit", e => {
  e.preventDefault();
  const editUid = document.getElementById("pmEditUid").value;
  const fullName = document.getElementById("pmFullName").value.trim();
  const designation = document.getElementById("pmDesignation").value.trim() || "Program Manager";
  const email = document.getElementById("pmEmailInput").value.trim();
  const password = document.getElementById("pmPassword").value;

  if (editUid) {
    const u = state.users.find(x => x.uid === editUid);
    if (u) {
      u.fullName = fullName;
      u.designation = designation;
      u.email = email;
      u.password = password;
    }
  } else {
    const newUid = "U_PM_" + Date.now();
    state.users.push({
      uid: newUid,
      email,
      password,
      fullName,
      designation,
      role: "PM",
      assignedProjects: []
    });
    state.ui.selectedPmUid = newUid;
  }

  document.getElementById("pmUserModal").classList.remove("open");
  saveState();
  renderCsrHeadView();
});

/* ==================== VENDOR ADD / EDIT / DELETE (HEAD & PM) ==================== */
function populateVendorProjectSelect(selectedProjectId) {
  const fy = getCurrentFy();
  const sel = document.getElementById("vmProjectId");
  const defaultId =
    selectedProjectId ||
    (state.ui.headProjectScope !== "ALL" ? state.ui.headProjectScope : state.ui.pmSelectedProjectId) ||
    (fy.projects[0] ? fy.projects[0].id : "");

  sel.innerHTML = fy.projects
    .map(p => `<option value="${p.id}" ${p.id === defaultId ? "selected" : ""}>${p.code} — ${p.name}</option>`)
    .join("");
}

function openAddVendorModal(defaultProjId) {
  document.getElementById("vendorModalTitle").textContent = "Add New Vendor / Payee";
  document.getElementById("vmEditId").value = "";
  document.getElementById("vendorForm").reset();
  document.getElementById("vmType").value = "Vendor";
  populateVendorProjectSelect(defaultProjId);
  document.getElementById("vendorModal").classList.add("open");
}

function openEditVendorModal(vendorId) {
  const fy = getCurrentFy();
  const v = fy.vendors.find(x => x.id === vendorId);
  if (!v) return;
  document.getElementById("vendorModalTitle").textContent = "Edit Vendor / Payee";
  document.getElementById("vmEditId").value = v.id;
  document.getElementById("vmName").value = v.name;
  document.getElementById("vmType").value = v.type || "Vendor";
  populateVendorProjectSelect((v.projectIds && v.projectIds[0]) || "");
  document.getElementById("vmContact").value = v.contact || "";
  document.getElementById("vmAcc").value = v.acc || "";
  document.getElementById("vmIfsc").value = v.ifsc || "";
  document.getElementById("vendorModal").classList.add("open");
}

function deleteVendorItem(vendorId) {
  const fy = getCurrentFy();
  const v = fy.vendors.find(x => x.id === vendorId);
  openConfirmDelete(`Delete vendor "${v ? v.name : vendorId}" from the directory?`, () => {
    fy.vendors = fy.vendors.filter(x => x.id !== vendorId);
    deleteRowFromSupabase("vendors", "id", vendorId);
    saveState();
    const user = getLoggedUser();
    if (user?.role === "CSR_HEAD") renderCsrHeadView();
    else if (user) renderPmDashboardView(user);
  });
}

document.getElementById("btnHeadAddVendor").addEventListener("click", () => {
  const vf = state.ui.headVendorProjectFilter;
  if (vf && vf !== "ALL") {
    openAddVendorModal(vf);
    return;
  }
  openAddVendorModal(state.ui.headProjectScope !== "ALL" ? state.ui.headProjectScope : "");
});

document.getElementById("headVendorProjectFilter").addEventListener("change", e => {
  state.ui.headVendorProjectFilter = e.target.value;
  renderStep3VendorListSection();
});

document.getElementById("btnPmAddVendor").addEventListener("click", () => {
  openAddVendorModal(state.ui.pmSelectedProjectId || "");
});

document.getElementById("vendorForm").addEventListener("submit", e => {
  e.preventDefault();
  const fy = getCurrentFy();
  const editId = document.getElementById("vmEditId").value;
  const name = document.getElementById("vmName").value.trim();
  const type = document.getElementById("vmType").value;
  const projId = document.getElementById("vmProjectId").value;
  const contact = document.getElementById("vmContact").value.trim();
  const acc = document.getElementById("vmAcc").value.trim();
  const ifsc = document.getElementById("vmIfsc").value.trim().toUpperCase();

  let savedVendorId = editId;
  if (editId) {
    const v = fy.vendors.find(x => x.id === editId);
    if (v) {
      v.name = name;
      v.type = type;
      v.projectIds = projId ? [projId] : v.projectIds || [];
      v.contact = contact;
      v.acc = acc;
      v.ifsc = ifsc;
    }
  } else {
    savedVendorId = "V_" + Date.now();
    fy.vendors.push({
      id: savedVendorId,
      name,
      type,
      projectIds: projId ? [projId] : [],
      contact,
      acc,
      ifsc
    });
  }

  document.getElementById("vendorModal").classList.remove("open");
  saveState();

  const user = getLoggedUser();
  if (user?.role === "CSR_HEAD") {
    renderCsrHeadView();
  } else if (user) {
    renderPmDashboardView(user);
    const dd = document.getElementById("pmVendorDropdown");
    if (dd && savedVendorId) {
      dd.value = savedVendorId;
      applySelectedVendorToPmForm(savedVendorId);
    }
  }
});

/* --- STEP 3: VENDOR LIST --- */
function renderStep3VendorListSection() {
  const fy = getCurrentFy();
  const vSel = document.getElementById("headVendorProjectFilter");
  let vFilter = state.ui.headVendorProjectFilter || "ALL";
  if (vFilter !== "ALL" && !fy.projects.some(p => p.id === vFilter)) {
    vFilter = "ALL";
    state.ui.headVendorProjectFilter = "ALL";
  }
  if (vSel) {
    vSel.innerHTML =
      `<option value="ALL" ${vFilter === "ALL" ? "selected" : ""}>All Projects (${fy.vendors.length})</option>` +
      fy.projects.map(p => `<option value="${p.id}" ${p.id === vFilter ? "selected" : ""}>${p.code} — ${p.name}</option>`).join("");
  }

  const filteredVendors = vFilter === "ALL" ? fy.vendors : fy.vendors.filter(v => (v.projectIds || []).includes(vFilter));
  document.getElementById("vendorScopeBadge").textContent = `${filteredVendors.length} Vendor(s) Found`;

  const tbody = document.getElementById("headVendorTableBody");
  if (!filteredVendors.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="center" style="color:var(--muted); padding:14px;">No vendors linked to this project yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredVendors.map(v => {
    const projNames = (v.projectIds || [])
      .map(pid => fy.projects.find(p => p.id === pid))
      .filter(Boolean)
      .map(p => `${p.code} ${p.name}`)
      .join(", ");
    return `
      <tr>
        <td><strong>${v.name}</strong></td>
        <td><span class="badge badge-blue">${v.type}</span></td>
        <td>${projNames || "General"}</td>
        <td>${v.contact || "—"}</td>
        <td>${v.acc || "—"}</td>
        <td>${v.ifsc || "—"}</td>
        <td class="center" style="white-space:nowrap;">
          <button class="btn-outline btn-sm" onclick="openEditVendorModal('${v.id}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteVendorItem('${v.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

/* --- STEP 5: EXPENSES, DD/MM/YYYY FILTER, EDIT/DELETE & CHARTS --- */
function getHeadFilteredExpenses() {
  const fy = getCurrentFy();
  const scope = state.ui.headProjectScope;
  const scopedIds = new Set(
    (scope === "ALL" ? fy.projects : fy.projects.filter(p => p.id === scope)).map(p => p.id)
  );
  const fromDate = state.ui.headFilterFromDate || "";
  const toDate = state.ui.headFilterToDate || "";
  const cat = state.ui.headFilterCategory || "ALL";

  return fy.expenses.filter(e => {
    if (!matchesQuarter(e.date, state.ui.headQuarterFilter || "ALL")) return false;
    if (!scopedIds.has(e.projectId)) return false;
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    if (cat === "PROGRAM" && e.category === "SALARY") return false;
    if (cat === "SALARY" && e.category !== "SALARY") return false;
    return true;
  });
}

function renderStep4ExpensesAndChartsSection() {
  const fy = getCurrentFy();
  const scope = state.ui.headProjectScope;
  const q = state.ui.headQuarterFilter || "ALL";
  const scopedProjects = scope === "ALL" ? fy.projects : fy.projects.filter(p => p.id === scope);
  const scopedIds = new Set(scopedProjects.map(p => p.id));

  const canvas = document.getElementById("headAnalyticsChart");
  if (headChart) headChart.destroy();
  const ctx = canvas.getContext("2d");

  const labels = scopedProjects.map(p => `${p.code} ${p.name.slice(0, 18)}`);
  const budgets = scopedProjects.map(p => p.budget);
  const spents = scopedProjects.map(p => getProjectSpent(p.id, q));

  if (state.ui.chartType === "bar") {
    headChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Proposed Budget (₹)", data: budgets, backgroundColor: "#0b4a7d" },
          { label: "Actual Expense + Salary (₹)", data: spents, backgroundColor: spents.map((s, i) => s > budgets[i] ? "#dc2626" : "#eab308") }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } else if (state.ui.chartType === "line") {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthly = new Array(12).fill(0);
    fy.expenses.forEach(e => {
      if (!scopedIds.has(e.projectId)) return;
      const parts = String(e.date || "").split("-");
      if (parts.length !== 3) return;
      const m = Number(parts[1]) - 1;
      if (m >= 0 && m < 12) {
        monthly[(m + 9) % 12] += Number(e.amount) || 0;
      }
    });
    headChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Monthly Expense + Salary Trend (₹)",
          data: monthly,
          borderColor: "#0b4a7d",
          backgroundColor: "rgba(11, 74, 125, 0.14)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } else {
    headChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          label: "Budget Allocation (₹)",
          data: budgets,
          backgroundColor: ["#0b4a7d", "#eab308", "#0d9488", "#6366f1", "#f97316", "#ec4899", "#22c55e", "#64748b"]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const filteredExps = getHeadFilteredExpenses();
  const filteredTotal = filteredExps.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  document.getElementById("headFilteredCountBadge").textContent =
    `${filteredExps.length} Entry(ies) • Total: ${formatINR(filteredTotal)}`;

  const tbody = document.getElementById("headExpenseLedgerBody");

  if (!filteredExps.length) {
    tbody.innerHTML = `<tr><td colspan="11" class="center" style="color:var(--muted); padding:16px;">No expenses match the selected project / date filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredExps.map(e => {
    const p = fy.projects.find(x => x.id === e.projectId);
    const h = fy.budgetHeads.find(x => x.id === e.headId);
    const creator = getExpenseCreatorLabel(e);
    const isSal = e.category === "SALARY";
    const statusBadge = e.bankExported
      ? `<button type="button" class="badge badge-green status-toggle-btn" onclick="toggleExpenseBankExported('${e.id}')" title="Click to toggle status">Exported</button>`
      : `<button type="button" class="badge badge-amber status-toggle-btn" onclick="toggleExpenseBankExported('${e.id}')" title="Click to toggle status">Pending</button>`;

    return `
      <tr class="${isSal ? "salary-row" : ""}">
        <td style="white-space:nowrap;">${formatDateDDMMYYYY(e.date)}</td>
        <td>${isSal ? `<span class="badge badge-green">STAFF SALARY</span>` : `<span class="badge badge-slate">PROGRAM</span>`}</td>
        <td><strong>${p ? p.code + " " + p.name : e.projectId}</strong></td>
        <td>${h ? h.code + " " + h.name : (isSal ? "Staff Salary" : "Project General")}</td>
        <td>
          <span class="badge badge-blue">${creator.name}</span>
          <div style="font-size:11px; color:var(--muted); margin-top:2px;">${creator.desig}</div>
        </td>
        <td>${e.payeeName}</td>
        <td>${e.mode}</td>
        <td class="num"><strong>${formatINR(e.amount)}</strong></td>
        <td class="center">${statusBadge}</td>
        <td>${e.remark ? `<span class="text-danger">${e.remark}</span>` : "—"}</td>
        <td class="center" style="white-space:nowrap;">
          <button class="btn-outline btn-sm" onclick="openHeadEditExpense('${e.id}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteHeadExpense('${e.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function openHeadEditExpense(expId) {
  const fy = getCurrentFy();
  const exp = fy.expenses.find(x => x.id === expId);
  if (!exp) return;
  document.getElementById("eeId").value = exp.id;
  document.getElementById("eeDate").value = exp.date;

  const heads = fy.budgetHeads.filter(h => h.projectId === exp.projectId);
  document.getElementById("eeHeadId").innerHTML =
    `<option value="">Project General / Unspecified Head</option>` +
    heads.map(h => `<option value="${h.id}" ${h.id === exp.headId ? "selected" : ""}>${h.code} — ${h.name}</option>`).join("");

  document.getElementById("eePayee").value = exp.payeeName || "";
  document.getElementById("eeMode").value = exp.mode || "NEFT";
  document.getElementById("eeAmount").value = exp.amount;
  document.getElementById("eeBankExported").value = exp.bankExported ? "true" : "false";
  document.getElementById("eeRemark").value = exp.remark || "";
  document.getElementById("editExpenseModal").classList.add("open");
}

document.getElementById("editExpenseForm").addEventListener("submit", e => {
  e.preventDefault();
  const fy = getCurrentFy();
  const expId = document.getElementById("eeId").value;
  const exp = fy.expenses.find(x => x.id === expId);
  if (!exp) return;

  exp.date = document.getElementById("eeDate").value;
  exp.headId = document.getElementById("eeHeadId").value || null;
  exp.payeeName = document.getElementById("eePayee").value.trim();
  exp.mode = document.getElementById("eeMode").value;
  exp.amount = Number(document.getElementById("eeAmount").value) || 0;
  exp.bankExported = document.getElementById("eeBankExported").value === "true";
  exp.bankExportedAt = exp.bankExported ? (exp.bankExportedAt || new Date().toISOString().slice(0, 10)) : null;
  exp.remark = document.getElementById("eeRemark").value.trim();

  document.getElementById("editExpenseModal").classList.remove("open");
  saveState();
  renderCsrHeadView();
});

function deleteHeadExpense(expId) {
  const fy = getCurrentFy();
  const exp = fy.expenses.find(x => x.id === expId);
  openConfirmDelete(`Delete expense entry for "${exp ? exp.payeeName : expId}" (${exp ? formatINR(exp.amount) : ""})?`, () => {
    if (exp && exp.salaryRecordId) {
      const sRec = (fy.salaryRecords || []).find(r => r.id === exp.salaryRecordId);
      if (sRec) sRec.postedExpenseId = null;
    }
    fy.expenses = fy.expenses.filter(x => x.id !== expId);
    deleteRowFromSupabase("expenses", "id", expId);
    saveState();
    renderCsrHeadView();
  });
}

document.getElementById("headFilterFromDate").addEventListener("change", e => {
  state.ui.headFilterFromDate = e.target.value;
  document.getElementById("headFromFormatted").textContent = e.target.value
    ? `From: ${formatDateDDMMYYYY(e.target.value)}`
    : "From: Any";
  saveState();
  renderStep4ExpensesAndChartsSection();
});

document.getElementById("headFilterToDate").addEventListener("change", e => {
  state.ui.headFilterToDate = e.target.value;
  document.getElementById("headToFormatted").textContent = e.target.value
    ? `To: ${formatDateDDMMYYYY(e.target.value)}`
    : "To: Any";
  saveState();
  renderStep4ExpensesAndChartsSection();
});

document.getElementById("headFilterCategory").addEventListener("change", e => {
  state.ui.headFilterCategory = e.target.value;
  saveState();
  renderStep4ExpensesAndChartsSection();
});

document.getElementById("btnClearHeadDateFilter").addEventListener("click", () => {
  state.ui.headFilterFromDate = "";
  state.ui.headFilterToDate = "";
  state.ui.headFilterCategory = "ALL";
  document.getElementById("headFilterFromDate").value = "";
  document.getElementById("headFilterToDate").value = "";
  document.getElementById("headFilterCategory").value = "ALL";
  document.getElementById("headFromFormatted").textContent = "From: Any";
  document.getElementById("headToFormatted").textContent = "To: Any";
  saveState();
  renderStep4ExpensesAndChartsSection();
});

/* ==================== FIXED STAFF SALARY & CTC (PM & CSR HEAD) ==================== */
function populateStaffProjectSelect(defaultProjId) {
  const fy = getCurrentFy();
  const user = getLoggedUser();
  const availableProjects =
    user && user.role === "PM"
      ? fy.projects.filter(p => (user.assignedProjects || []).includes(p.id))
      : fy.projects;

  const sel = document.getElementById("sfProjectId");
  const chosenId = defaultProjId || (availableProjects[0] ? availableProjects[0].id : "");
  sel.innerHTML = availableProjects
    .map(p => `<option value="${p.id}" ${p.id === chosenId ? "selected" : ""}>${p.code} — ${p.name}</option>`)
    .join("");
}

function updateStaffModalLiveCalc() {
  const mockProfile = {
    baseDays: Number(document.getElementById("sfBaseDays").value) || 30,
    presentDays: Number(document.getElementById("sfPresentDays").value) || 0,
    basic: Number(document.getElementById("sfBasic").value) || 0,
    hra: Number(document.getElementById("sfHra").value) || 0,
    lta: Number(document.getElementById("sfLta").value) || 0,
    special: Number(document.getElementById("sfSpecial").value) || 0,
    supp: Number(document.getElementById("sfSupp").value) || 0,
    gratuity: Number(document.getElementById("sfGratuity").value) || 0,
    pf: Number(document.getElementById("sfPf").value) || 0,
    pt: Number(document.getElementById("sfPt").value) || 0,
    finalCtc: document.getElementById("sfFinalCtc").value
  };
  const c = computeSalaryBreakdown(mockProfile, mockProfile);
  document.getElementById("sfLiveCalcBanner").innerHTML =
    `Earned Gross: <strong>${formatINR(c.grossEarned)}</strong> | Deductions (PF+PT): <strong>${formatINR(c.dedTotal)}</strong> | Net Pay: <strong>${formatINR(c.netPay)}</strong> | Auto CTC (Gross+PF+Gratuity): <strong>${formatINR(c.autoCtc)}</strong>`;
}

["sfBaseDays", "sfPresentDays", "sfBasic", "sfHra", "sfLta", "sfSpecial", "sfSupp", "sfGratuity", "sfPf", "sfPt", "sfFinalCtc"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateStaffModalLiveCalc);
});

function openAddStaffModal(defaultProjId) {
  document.getElementById("staffModalTitle").textContent = "Add Fixed Staff & CTC Structure";
  document.getElementById("sfEditId").value = "";
  document.getElementById("staffForm").reset();
  document.getElementById("sfBaseDays").value = 30;
  document.getElementById("sfPresentDays").value = 30;
  document.getElementById("sfPt").value = 200;
  populateStaffProjectSelect(defaultProjId);
  updateStaffModalLiveCalc();
  document.getElementById("staffModal").classList.add("open");
}

function openEditStaffModal(staffId, monthYm) {
  const fy = getCurrentFy();
  const profile = (fy.staffProfiles || []).find(s => s.id === staffId);
  if (!profile) return;
  const activeMonth = monthYm || state.ui.pmSalaryMonth || "2026-11";
  const rec = getOrSeedSalaryRecordForMonth(fy, profile, activeMonth);

  document.getElementById("staffModalTitle").textContent = `Edit Staff Salary (${formatMonthLabel(activeMonth)})`;
  document.getElementById("sfEditId").value = profile.id;
  populateStaffProjectSelect(profile.projectId);
  document.getElementById("sfEmpId").value = profile.empId || "";
  document.getElementById("sfName").value = profile.name || "";
  document.getElementById("sfDesignation").value = profile.designation || "";
  document.getElementById("sfUan").value = profile.uan || "";
  document.getElementById("sfAcc").value = profile.acc || "";
  document.getElementById("sfIfsc").value = profile.ifsc || "";
  document.getElementById("sfBaseDays").value = rec.baseDays ?? 30;
  document.getElementById("sfPresentDays").value = rec.presentDays ?? 30;
  document.getElementById("sfBasic").value = rec.basic ?? 0;
  document.getElementById("sfHra").value = rec.hra ?? 0;
  document.getElementById("sfLta").value = rec.lta ?? 0;
  document.getElementById("sfSpecial").value = rec.special ?? 0;
  document.getElementById("sfSupp").value = rec.supp ?? 0;
  document.getElementById("sfGratuity").value = rec.gratuity ?? 0;
  document.getElementById("sfPf").value = rec.pf ?? 0;
  document.getElementById("sfPt").value = rec.pt ?? 200;
  document.getElementById("sfFinalCtc").value = rec.finalCtc ?? "";
  updateStaffModalLiveCalc();
  document.getElementById("staffModal").classList.add("open");
}

function deleteStaffProfile(staffId) {
  const fy = getCurrentFy();
  const profile = (fy.staffProfiles || []).find(s => s.id === staffId);
  openConfirmDelete(`Delete fixed staff "${profile ? profile.name : staffId}" and their salary records?`, () => {
    const removedRecIds = new Set(
      (fy.salaryRecords || []).filter(r => r.staffId === staffId).map(r => r.id)
    );
    fy.staffProfiles = (fy.staffProfiles || []).filter(s => s.id !== staffId);
    fy.salaryRecords = (fy.salaryRecords || []).filter(r => r.staffId !== staffId);
    fy.expenses = (fy.expenses || []).filter(e => !removedRecIds.has(e.salaryRecordId));
    deleteRowFromSupabase("staff_profiles", "id", staffId);
    saveState();
    const user = getLoggedUser();
    if (user?.role === "CSR_HEAD") renderCsrHeadView();
    else if (user) renderPmDashboardView(user);
  });
}

document.getElementById("btnPmAddStaff").addEventListener("click", () => {
  openAddStaffModal(state.ui.pmSelectedProjectId || "");
});

document.getElementById("btnHeadAddStaff").addEventListener("click", () => {
  openAddStaffModal(state.ui.headProjectScope !== "ALL" ? state.ui.headProjectScope : "");
});

document.getElementById("staffForm").addEventListener("submit", e => {
  e.preventDefault();
  const fy = getCurrentFy();
  if (!Array.isArray(fy.staffProfiles)) fy.staffProfiles = [];
  if (!Array.isArray(fy.salaryRecords)) fy.salaryRecords = [];

  const editId = document.getElementById("sfEditId").value;
  const projectId = document.getElementById("sfProjectId").value;
  const empId = document.getElementById("sfEmpId").value.trim();
  const name = document.getElementById("sfName").value.trim();
  const designation = document.getElementById("sfDesignation").value.trim();
  const uan = document.getElementById("sfUan").value.trim();
  const acc = document.getElementById("sfAcc").value.trim();
  const ifsc = document.getElementById("sfIfsc").value.trim().toUpperCase();
  const baseDays = Number(document.getElementById("sfBaseDays").value) || 30;
  const presentDays = Number(document.getElementById("sfPresentDays").value) || 0;
  const basic = Number(document.getElementById("sfBasic").value) || 0;
  const hra = Number(document.getElementById("sfHra").value) || 0;
  const lta = Number(document.getElementById("sfLta").value) || 0;
  const special = Number(document.getElementById("sfSpecial").value) || 0;
  const supp = Number(document.getElementById("sfSupp").value) || 0;
  const gratuity = Number(document.getElementById("sfGratuity").value) || 0;
  const pf = Number(document.getElementById("sfPf").value) || 0;
  const pt = Number(document.getElementById("sfPt").value) || 0;
  const rawOverrideCtc = document.getElementById("sfFinalCtc").value;

  const user = getLoggedUser();
  const activeMonth =
    user?.role === "CSR_HEAD" ? (state.ui.headSalaryMonth || "2026-11") : (state.ui.pmSalaryMonth || "2026-11");

  if (editId) {
    const profile = fy.staffProfiles.find(s => s.id === editId);
    if (profile) {
      profile.projectId = projectId;
      profile.empId = empId;
      profile.name = name;
      profile.designation = designation;
      profile.uan = uan;
      profile.acc = acc;
      profile.ifsc = ifsc;
      profile.baseDays = baseDays;
      profile.basic = basic;
      profile.hra = hra;
      profile.lta = lta;
      profile.special = special;
      profile.supp = supp;
      profile.gratuity = gratuity;
      profile.pf = pf;
      profile.pt = pt;

      const rec = getOrSeedSalaryRecordForMonth(fy, profile, activeMonth);
      rec.projectId = projectId;
      rec.baseDays = baseDays;
      rec.presentDays = presentDays;
      rec.basic = basic;
      rec.hra = hra;
      rec.lta = lta;
      rec.special = special;
      rec.supp = supp;
      rec.gratuity = gratuity;
      rec.pf = pf;
      rec.pt = pt;
      const calc = computeSalaryBreakdown(profile, rec);
      rec.finalCtc = rawOverrideCtc !== "" ? Number(rawOverrideCtc) : calc.autoCtc;

      if (rec.postedExpenseId) {
        const exp = fy.expenses.find(x => x.id === rec.postedExpenseId);
        if (exp) {
          exp.projectId = projectId;
          exp.amount = rec.finalCtc;
          exp.acc = acc;
          exp.ifsc = ifsc;
          exp.payeeName = `${profile.name} (${profile.designation})`;
          exp.remark = `Fixed Staff Salary (${formatMonthLabel(rec.month)}) • Present: ${rec.presentDays}/${rec.baseDays}d`;
        }
      }
    }
  } else {
    const newId = "STF_" + Date.now();
    const newProfile = {
      id: newId,
      projectId,
      empId,
      name,
      designation,
      uan,
      acc,
      ifsc,
      baseDays,
      basic,
      hra,
      lta,
      special,
      supp,
      gratuity,
      pf,
      pt
    };
    fy.staffProfiles.push(newProfile);
    const rec = getOrSeedSalaryRecordForMonth(fy, newProfile, activeMonth);
    rec.presentDays = presentDays;
    const calc = computeSalaryBreakdown(newProfile, rec);
    rec.finalCtc = rawOverrideCtc !== "" ? Number(rawOverrideCtc) : calc.autoCtc;
  }

  document.getElementById("staffModal").classList.remove("open");
  saveState();
  if (user?.role === "CSR_HEAD") renderCsrHeadView();
  else if (user) renderPmDashboardView(user);
});

function updatePmSalaryInlineField(recId, field, val) {
  const fy = getCurrentFy();
  const rec = (fy.salaryRecords || []).find(r => r.id === recId);
  if (!rec) return;
  const profile = (fy.staffProfiles || []).find(s => s.id === rec.staffId);
  if (!profile) return;

  rec[field] = Number(val) || 0;
  if (field !== "finalCtc") {
    const calc = computeSalaryBreakdown(profile, rec);
    rec.finalCtc = calc.autoCtc;
  }

  if (rec.postedExpenseId) {
    const exp = fy.expenses.find(x => x.id === rec.postedExpenseId);
    if (exp) {
      exp.amount = Number(rec.finalCtc) || 0;
      exp.remark = `Fixed Staff Salary (${formatMonthLabel(rec.month)}) • Present: ${rec.presentDays}/${rec.baseDays}d`;
    }
  }

  saveState();
  const user = getLoggedUser();
  if (user?.role === "CSR_HEAD") renderCsrHeadView();
  else if (user) renderPmDashboardView(user);
}

function postSingleSalaryRecordToExpense(recId) {
  const fy = getCurrentFy();
  const user = getLoggedUser();
  const rec = (fy.salaryRecords || []).find(r => r.id === recId);
  if (!rec) return;
  const profile = (fy.staffProfiles || []).find(s => s.id === rec.staffId);
  if (!profile) return;

  const selectedHeadId =
    document.getElementById("pmSalaryHeadSelect")?.value || getDefaultSalaryHeadId(fy, profile.projectId) || null;
  const finalAmount = Number(rec.finalCtc) || 0;
  const expDate = `${rec.month}-28`;
  const monthLabel = formatMonthLabel(rec.month);

  if (rec.postedExpenseId) {
    const existingExp = fy.expenses.find(x => x.id === rec.postedExpenseId);
    if (existingExp) {
      existingExp.amount = finalAmount;
      existingExp.headId = selectedHeadId;
      existingExp.acc = profile.acc || "";
      existingExp.ifsc = profile.ifsc || "";
      existingExp.payeeName = `${profile.name} (${profile.designation})`;
      existingExp.remark = `Fixed Staff Salary (${monthLabel}) • Present: ${rec.presentDays}/${rec.baseDays}d`;
      return;
    }
  }

  const newExpId = "EXP_SAL_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  fy.expenses.push({
    id: newExpId,
    category: "SALARY",
    salaryRecordId: rec.id,
    date: expDate,
    projectId: profile.projectId,
    headId: selectedHeadId,
    enteredByUid: user.uid,
    enteredBy: user.fullName,
    enteredByDesignation: user.designation || "Program Manager",
    enteredByEmail: user.email,
    payeeName: `${profile.name} (${profile.designation})`,
    acc: profile.acc || "",
    ifsc: profile.ifsc || "",
    mode: "NEFT",
    amount: finalAmount,
    remark: `Fixed Staff Salary (${monthLabel}) • Present: ${rec.presentDays}/${rec.baseDays}d`,
    bankExported: false,
    bankExportedAt: null
  });
  rec.postedExpenseId = newExpId;
}

document.getElementById("btnPmPostMonthlySalary").addEventListener("click", () => {
  const fy = getCurrentFy();
  const user = getLoggedUser();
  const projId = state.ui.pmSelectedProjectId;
  const monthYm = state.ui.pmSalaryMonth || "2026-11";
  if (!projId) return;

  const staffList = (fy.staffProfiles || []).filter(s => s.projectId === projId);
  if (!staffList.length) {
    alert("No Fixed Staff added for this project yet. Click '+ Add Fixed Staff' first.");
    return;
  }

  staffList.forEach(profile => {
    const rec = getOrSeedSalaryRecordForMonth(fy, profile, monthYm);
    postSingleSalaryRecordToExpense(rec.id);
  });

  saveState();
  renderPmDashboardView(user);
  alert(`Posted ${staffList.length} staff salary entry(ies) for ${formatMonthLabel(monthYm)} into Project Expenses!`);
});

function renderPmStaffSalarySection(activeProj) {
  const fy = getCurrentFy();
  const monthYm = state.ui.pmSalaryMonth || "2026-11";
  document.getElementById("pmSalaryMonth").value = monthYm;

  const heads = fy.budgetHeads.filter(h => h.projectId === activeProj.id);
  const salHeadSel = document.getElementById("pmSalaryHeadSelect");
  if (salHeadSel) {
    const defaultHeadId = getDefaultSalaryHeadId(fy, activeProj.id);
    salHeadSel.innerHTML =
      `<option value="">-- Select Salary Budget Head --</option>` +
      heads.map(h => `<option value="${h.id}" ${h.id === defaultHeadId ? "selected" : ""}>${h.code} — ${h.name}</option>`).join("");
  }

  const staffList = (fy.staffProfiles || []).filter(s => s.projectId === activeProj.id);
  const tbody = document.getElementById("pmStaffSalaryBody");

  if (!staffList.length) {
    tbody.innerHTML = `<tr><td colspan="11" class="center" style="color:var(--muted); padding:14px;">No fixed staff added for ${activeProj.name} yet. Click "+ Add Fixed Staff" to add employees with PF/CTC structure.</td></tr>`;
    return;
  }

  let totalCtc = 0;
  let totalNet = 0;

  const rowsHtml = staffList.map(profile => {
    const rec = getOrSeedSalaryRecordForMonth(fy, profile, monthYm);
    const calc = computeSalaryBreakdown(profile, rec);
    totalCtc += Number(rec.finalCtc) || 0;
    totalNet += calc.netPay;

    const allowancesTotal = calc.earnedHra + calc.earnedLta + calc.earnedSpecial + calc.earnedSupp;
    const isPosted = Boolean(rec.postedExpenseId && fy.expenses.some(e => e.id === rec.postedExpenseId));

    return `
      <tr>
        <td>${profile.empId || "—"}</td>
        <td>
          <strong>${profile.name}</strong>
          <div style="font-size:11px; color:var(--muted);">${profile.designation}</div>
        </td>
        <td class="num">
          <input type="number" step="0.5" min="0" max="31" class="inline-num-input" style="width:68px !important;" value="${rec.presentDays}" onchange="updatePmSalaryInlineField('${rec.id}', 'presentDays', this.value)" />
        </td>
        <td class="num">${formatINR(calc.earnedBasic)}</td>
        <td class="num">${formatINR(allowancesTotal)}</td>
        <td class="num">${formatINR(calc.earnedGratuity)}</td>
        <td class="num">${formatINR(calc.dedTotal)}</td>
        <td class="num"><strong>${formatINR(calc.netPay)}</strong></td>
        <td class="num">
          <input type="number" step="0.01" class="inline-num-input" value="${rec.finalCtc}" onchange="updatePmSalaryInlineField('${rec.id}', 'finalCtc', this.value)" title="Enter final CTC from Accounts Department" />
        </td>
        <td class="center">
          ${isPosted ? `<span class="badge badge-green">Posted to Expense</span>` : `<span class="badge badge-amber">Draft</span>`}
        </td>
        <td class="center" style="white-space:nowrap;">
          <button class="btn-outline btn-sm" onclick="openEditStaffModal('${profile.id}', '${monthYm}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteStaffProfile('${profile.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML =
    rowsHtml +
    `
    <tr class="total-row">
      <td colspan="7" class="num">TOTAL STAFF SALARY (${formatMonthLabel(monthYm)})</td>
      <td class="num">${formatINR(totalNet)}</td>
      <td class="num">${formatINR(totalCtc)}</td>
      <td colspan="2"></td>
    </tr>
  `;
}

function renderHeadStaffSalarySection() {
  const fy = getCurrentFy();
  const scope = state.ui.headProjectScope;
  const monthYm = state.ui.headSalaryMonth || "2026-11";
  const staffList = (fy.staffProfiles || []).filter(s => scope === "ALL" || s.projectId === scope);
  const tbody = document.getElementById("headStaffSalaryBody");

  if (!staffList.length) {
    tbody.innerHTML = `<tr><td colspan="12" class="center" style="color:var(--muted); padding:14px;">No fixed staff profiles configured for the selected project scope.</td></tr>`;
    return;
  }

  let grandNet = 0;
  let grandCtc = 0;

  const rows = staffList.map(profile => {
    const proj = fy.projects.find(p => p.id === profile.projectId);
    const rec = getOrSeedSalaryRecordForMonth(fy, profile, monthYm);
    const calc = computeSalaryBreakdown(profile, rec);
    grandNet += calc.netPay;
    grandCtc += Number(rec.finalCtc) || 0;
    const isPosted = Boolean(rec.postedExpenseId && fy.expenses.some(e => e.id === rec.postedExpenseId));

    return `
      <tr>
        <td><strong>${proj ? proj.code + " " + proj.name : profile.projectId}</strong></td>
        <td>${profile.empId || "—"}</td>
        <td>
          <strong>${profile.name}</strong>
          <div style="font-size:11px; color:var(--muted);">${profile.designation}</div>
        </td>
        <td class="num">${rec.presentDays} / ${rec.baseDays}</td>
        <td class="num">${formatINR(calc.earnedBasic)}</td>
        <td class="num">${formatINR(calc.earnedHra + calc.earnedLta + calc.earnedSpecial + calc.earnedSupp)}</td>
        <td class="num">${formatINR(calc.earnedGratuity)}</td>
        <td class="num">${formatINR(calc.dedTotal)}</td>
        <td class="num"><strong>${formatINR(calc.netPay)}</strong></td>
        <td class="num"><strong>${formatINR(rec.finalCtc)}</strong></td>
        <td class="center">
          ${isPosted ? `<span class="badge badge-green">Posted</span>` : `<span class="badge badge-amber">Not Posted</span>`}
        </td>
        <td class="center" style="white-space:nowrap;">
          <button class="btn-outline btn-sm" onclick="openEditStaffModal('${profile.id}', '${monthYm}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteStaffProfile('${profile.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML =
    rows +
    `
    <tr class="total-row">
      <td colspan="8" class="num">TOTAL STAFF SALARY (${formatMonthLabel(monthYm)})</td>
      <td class="num">${formatINR(grandNet)}</td>
      <td class="num">${formatINR(grandCtc)}</td>
      <td colspan="2"></td>
    </tr>
  `;
}

document.getElementById("pmSalaryMonth").addEventListener("change", e => {
  state.ui.pmSalaryMonth = e.target.value || "2026-11";
  saveState();
  renderPmDashboardView(getLoggedUser());
});

document.getElementById("headSalaryMonth").addEventListener("change", e => {
  state.ui.headSalaryMonth = e.target.value || "2026-11";
  saveState();
  renderHeadStaffSalarySection();
});

/* ==================== PM WORKSPACE & DIRECT EXPENSE ENTRY ==================== */
function applySelectedVendorToPmForm(vendorId) {
  const fy = getCurrentFy();
  const v = fy.vendors.find(x => x.id === vendorId);
  if (!v) return;
  document.getElementById("pmExpPayee").value = v.name || "";
  document.getElementById("pmExpAcc").value = v.acc || "";
  document.getElementById("pmExpIfsc").value = v.ifsc || "";
}

document.getElementById("pmVendorDropdown").addEventListener("change", e => {
  if (e.target.value) {
    applySelectedVendorToPmForm(e.target.value);
  }
});

document.getElementById("pmExpPayee").addEventListener("input", e => {
  const val = e.target.value.trim().toLowerCase();
  const fy = getCurrentFy();
  const matched = fy.vendors.find(v => v.name.toLowerCase() === val);
  const dd = document.getElementById("pmVendorDropdown");
  if (matched) {
    dd.value = matched.id;
    document.getElementById("pmExpAcc").value = matched.acc || "";
    document.getElementById("pmExpIfsc").value = matched.ifsc || "";
  } else {
    dd.value = "";
  }
});

function renderPmChart(activeProj) {
  const fy = getCurrentFy();
  const canvas = document.getElementById("pmAnalyticsChart");
  if (!canvas) return;
  if (pmChart) pmChart.destroy();
  const ctx = canvas.getContext("2d");

  const q = state.ui.pmQuarterFilter || "ALL";
  const sp = getProjectSpent(activeProj.id, q);
  const bl = Math.max(0, activeProj.budget - sp);

  if (state.ui.pmChartType === "doughnut") {
    const heads = fy.budgetHeads.filter(h => h.projectId === activeProj.id);
    const headSpentMap = heads.map(h => ({
      label: `${h.code} ${h.name}`,
      spent: getHeadSpent(h.id, q)
    })).filter(item => item.spent > 0);

    const generalSpent = fy.expenses
      .filter(e => e.projectId === activeProj.id && !e.headId && matchesQuarter(e.date, q))
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    if (generalSpent > 0) {
      headSpentMap.push({ label: "Project General / Unassigned Salary", spent: generalSpent });
    }

    if (!headSpentMap.length) {
      pmChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Utilized Expense (₹)", "Remaining Budget (₹)"],
          datasets: [{
            data: [sp, bl],
            backgroundColor: ["#eab308", "#0b4a7d"]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    } else {
      pmChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: headSpentMap.map(x => x.label),
          datasets: [{
            label: "Expense Share (₹)",
            data: headSpentMap.map(x => x.spent),
            backgroundColor: ["#0b4a7d", "#eab308", "#0d9488", "#6366f1", "#f97316", "#ec4899", "#22c55e"]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  } else {
    pmChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [activeProj.code + " " + activeProj.name],
        datasets: [
          { label: "Proposed Budget (₹)", data: [activeProj.budget], backgroundColor: "#0b4a7d" },
          { label: "Total Expense + Salary (₹)", data: [sp], backgroundColor: sp > activeProj.budget ? "#dc2626" : "#eab308" }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function renderPmDashboardView(user) {
  const fy = getCurrentFy();
  document.getElementById("pmHeadingTitle").textContent =
    `Program Manager Workspace — ${user.fullName} (${user.designation || "Program Manager"})`;
  document.getElementById("pmRoleSubtitle").textContent =
    `Designation: ${user.designation || "Program Manager"} • Enter program expenses & monthly fixed staff salary for your assigned projects`;

  const assigned = fy.projects.filter(p => (user.assignedProjects || []).includes(p.id));
  const sel = document.getElementById("pmProjectSelect");

  if (!assigned.length) {
    sel.innerHTML = `<option value="">No project assigned yet</option>`;
    document.getElementById("pmProjectKpis").innerHTML = `<div class="kpi-box">No project rights tick-marked yet. Please ask CSR Head to assign your projects.</div>`;
    const emptyNoteHost = document.getElementById("pmProjectVarianceHost");
    if (emptyNoteHost) emptyNoteHost.innerHTML = "";
    document.getElementById("pmExpenseTableBody").innerHTML = "";
    document.getElementById("pmStaffSalaryBody").innerHTML = "";
    if (pmChart) pmChart.destroy();
    return;
  }

  if (!assigned.some(p => p.id === state.ui.pmSelectedProjectId)) {
    state.ui.pmSelectedProjectId = assigned[0].id;
  }

  sel.innerHTML = assigned
    .map(p => `<option value="${p.id}" ${p.id === state.ui.pmSelectedProjectId ? "selected" : ""}>${p.code} — ${p.name}</option>`)
    .join("");

  const activeProj = assigned.find(p => p.id === state.ui.pmSelectedProjectId);
  const q = state.ui.pmQuarterFilter || "ALL";
  if (document.getElementById("pmQuarterFilter")) {
    document.getElementById("pmQuarterFilter").value = q;
  }
  const sp = getProjectSpent(activeProj.id, q);
  const salSp = getProjectSalarySpent(activeProj.id, q);
  const progSp = sp - salSp;
  const bl = activeProj.budget - sp;
  const isOver = bl < 0;

  document.getElementById("pmProjectKpis").innerHTML = `
    <div class="kpi-box">
      <div class="lbl">Project Budget</div>
      <div class="val">${formatINR(activeProj.budget)}</div>
      <div class="sub">${activeProj.code} ${activeProj.name}</div>
    </div>
    <div class="kpi-box ${isOver ? "over" : ""}">
      <div class="lbl">Total Actual Expense</div>
      <div class="val ${isOver ? "text-danger" : ""}">${formatINR(sp)}</div>
      <div class="sub">Prog: ${formatINR(progSp)} • Salary: ${formatINR(salSp)}</div>
    </div>
    <div class="kpi-box ${isOver ? "over" : ""}">
      <div class="lbl">Remaining Balance</div>
      <div class="val ${isOver ? "text-danger" : "text-success"}">${formatINR(bl)}</div>
      <div class="sub ${isOver ? "text-danger" : ""}">${isOver ? "OVER BUDGET" : formatPct(bl, activeProj.budget) + " Available"}</div>
    </div>
  `;

  let pmNoteHost = document.getElementById("pmProjectVarianceHost");
  if (!pmNoteHost) {
    pmNoteHost = document.createElement("div");
    pmNoteHost.id = "pmProjectVarianceHost";
    document.getElementById("pmProjectKpis")?.insertAdjacentElement("afterend", pmNoteHost);
  }
  pmNoteHost.innerHTML = getReconciliationBlockHTML(activeProj.id);


  const heads = fy.budgetHeads.filter(h => h.projectId === activeProj.id);
  document.getElementById("pmExpHead").innerHTML =
    `<option value="">Project General / Unspecified Head</option>` +
    heads.map(h => `<option value="${h.id}">${h.code} — ${h.name} (Bal: ${formatINR(h.budget - getHeadSpent(h.id, q))})</option>`).join("");

  const projVendors = fy.vendors.filter(v => (v.projectIds || []).includes(activeProj.id));
  const otherVendors = fy.vendors.filter(v => !(v.projectIds || []).includes(activeProj.id));
  const orderedVendors = [...projVendors, ...otherVendors];
  const vendorOptionsHtml =
    `<option value="">-- Choose saved vendor --</option>` +
    orderedVendors
      .map(v => {
        const tag = (v.projectIds || []).includes(activeProj.id) ? "Project Vendor" : "Other Vendor";
        return `<option value="${v.id}">${v.name} (${tag})</option>`;
      })
      .join("");

  document.getElementById("pmVendorDropdown").innerHTML = vendorOptionsHtml;
  document.getElementById("reqVendorSelect").innerHTML = vendorOptionsHtml;

  if (!document.getElementById("pmExpDate").value) {
    document.getElementById("pmExpDate").value = new Date().toISOString().slice(0, 10);
  }

  if (!document.getElementById("reqDateInput").value) {
    document.getElementById("reqDateInput").value = new Date().toISOString().slice(0, 10);
  }
  document.getElementById("reqProjectName").value = `${activeProj.code} - ${activeProj.name}`;

  renderPmStaffSalarySection(activeProj);

  const exps = fy.expenses.filter(e => e.projectId === activeProj.id && matchesQuarter(e.date, q));
  const tbody = document.getElementById("pmExpenseTableBody");
  if (!exps.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="center" style="color:var(--muted); padding:14px;">No expenses entered yet for ${activeProj.name}.</td></tr>`;
  } else {
    tbody.innerHTML = exps.map(e => {
      const h = fy.budgetHeads.find(x => x.id === e.headId);
      const isSal = e.category === "SALARY";
      const statusBadge = e.bankExported
        ? `<button type="button" class="badge badge-green status-toggle-btn" onclick="toggleExpenseBankExported('${e.id}')" title="Click to mark Pending again">Exported</button>`
        : `<button type="button" class="badge badge-amber status-toggle-btn" onclick="toggleExpenseBankExported('${e.id}')" title="Click to mark Exported">Pending</button>`;

      return `
        <tr class="${isSal ? "salary-row" : ""}">
          <td style="white-space:nowrap;">${formatDateDDMMYYYY(e.date)}</td>
          <td>${isSal ? `<span class="badge badge-green">STAFF SALARY</span>` : `<span class="badge badge-slate">PROGRAM</span>`}</td>
          <td>${h ? h.code + " " + h.name : (isSal ? "Staff Salary" : "General")}</td>
          <td><strong>${e.payeeName}</strong></td>
          <td>${e.mode}</td>
          <td class="num"><strong>${formatINR(e.amount)}</strong></td>
          <td class="center">${statusBadge}</td>
          <td>${e.remark || "—"}</td>
          <td class="center"><button class="btn-danger btn-sm" onclick="deletePmExpense('${e.id}')">Delete</button></td>
        </tr>
      `;
    }).join("");
  }

  renderRequisitionPaymentPicker();
  renderPmChart(activeProj);
  saveState();
}

function checkPmOverBudgetWarning() {
  const user = getLoggedUser();
  if (!user || user.role !== "PM") return;
  const projId = state.ui.pmSelectedProjectId;
  const fy = getCurrentFy();
  const proj = fy.projects.find(p => p.id === projId);
  if (!proj) return;

  const amt = Number(document.getElementById("pmExpAmount").value) || 0;
  const headId = document.getElementById("pmExpHead").value;
  const projRem = proj.budget - getProjectSpent(proj.id, "ALL");

  let over = amt > projRem;
  if (headId) {
    const h = fy.budgetHeads.find(x => x.id === headId);
    if (h && amt > (h.budget - getHeadSpent(h.id, "ALL"))) over = true;
  }

  document.getElementById("pmOverBudgetAlert").style.display = over ? "block" : "none";
}

document.getElementById("pmExpAmount").addEventListener("input", checkPmOverBudgetWarning);
document.getElementById("pmExpHead").addEventListener("change", checkPmOverBudgetWarning);

document.getElementById("pmExpenseForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = getLoggedUser();
  const fy = getCurrentFy();
  const projId = state.ui.pmSelectedProjectId;
  if (!projId) return;

  const q = state.ui.pmQuarterFilter || "ALL";
  const amt = Number(document.getElementById("pmExpAmount").value) || 0;
  const headId = document.getElementById("pmExpHead").value;
  const remarkInput = document.getElementById("pmExpRemark").value.trim();
  const proj = fy.projects.find(p => p.id === projId);

  let isOver = amt > (proj.budget - getProjectSpent(projId, q));
  if (headId) {
    const h = fy.budgetHeads.find(x => x.id === headId);
    if (h && amt > (h.budget - getHeadSpent(h.id, q))) isOver = true;
  }

  if (isOver && !remarkInput) {
    alert("This expense exceeds remaining budget. Please enter a Remark / Extra Fund Source before saving.");
    return;
  }

  const payeeVal = document.getElementById("pmExpPayee").value.trim();
  const accVal = document.getElementById("pmExpAcc").value.trim();
  const ifscVal = document.getElementById("pmExpIfsc").value.trim().toUpperCase();

  const existingVendor = fy.vendors.find(v => v.name.toLowerCase() === payeeVal.toLowerCase());
  if (existingVendor) {
    if (accVal) existingVendor.acc = accVal;
    if (ifscVal) existingVendor.ifsc = ifscVal;
    if (!existingVendor.projectIds.includes(projId)) {
      existingVendor.projectIds.push(projId);
    }
  }

  fy.expenses.push({
    id: "EXP-" + Date.now(),
    category: "PROGRAM",
    date: document.getElementById("pmExpDate").value,
    projectId: projId,
    headId: headId || null,
    enteredByUid: user.uid,
    enteredBy: user.fullName,
    enteredByDesignation: user.designation || "Program Manager",
    enteredByEmail: user.email,
    payeeName: payeeVal,
    acc: accVal,
    ifsc: ifscVal,
    mode: document.getElementById("pmExpMode").value,
    amount: amt,
    remark: remarkInput,
    bankExported: false,
    bankExportedAt: null
  });

  saveState();
  document.getElementById("pmVendorDropdown").value = "";
  document.getElementById("pmExpPayee").value = "";
  document.getElementById("pmExpAmount").value = "";
  document.getElementById("pmExpAcc").value = "";
  document.getElementById("pmExpIfsc").value = "";
  document.getElementById("pmExpRemark").value = "";
  document.getElementById("pmOverBudgetAlert").style.display = "none";
  renderPmDashboardView(user);
});

function deletePmExpense(expId) {
  const user = getLoggedUser();
  const fy = getCurrentFy();
  const exp = fy.expenses.find(x => x.id === expId);
  openConfirmDelete(`Delete expense entry for "${exp ? exp.payeeName : expId}" (${exp ? formatINR(exp.amount) : ""})?`, () => {
    if (exp && exp.salaryRecordId) {
      const sRec = (fy.salaryRecords || []).find(r => r.id === exp.salaryRecordId);
      if (sRec) sRec.postedExpenseId = null;
    }
    fy.expenses = fy.expenses.filter(x => x.id !== expId);
    deleteRowFromSupabase("expenses", "id", expId);
    saveState();
    renderPmDashboardView(user);
  });
}

document.getElementById("pmProjectSelect").addEventListener("change", e => {
  state.ui.pmSelectedProjectId = e.target.value;
  renderPmDashboardView(getLoggedUser());
});

document.querySelectorAll(".pm-chart-switch").forEach(btn => {
  btn.addEventListener("click", () => {
    state.ui.pmChartType = btn.dataset.type;
    document.querySelectorAll(".pm-chart-switch").forEach(b => {
      b.className = "btn-sm pm-chart-switch " + (b.dataset.type === state.ui.pmChartType ? "btn-primary" : "btn-outline");
    });
    const fy = getCurrentFy();
    const activeProj = fy.projects.find(p => p.id === state.ui.pmSelectedProjectId);
    if (activeProj) renderPmChart(activeProj);
  });
});

/* ==================== PM EXCEL & PDF EXPORT ==================== */
document.getElementById("btnPmExportExcel").addEventListener("click", () => {
  const fy = getCurrentFy();
  const projId = state.ui.pmSelectedProjectId;
  const proj = fy.projects.find(p => p.id === projId);
  const exps = fy.expenses.filter(e => e.projectId === projId);

  const rows = exps.map((e, i) => {
    const h = fy.budgetHeads.find(x => x.id === e.headId);
    return {
      Sr_No: i + 1,
      Date: formatDateDDMMYYYY(e.date),
      Category: e.category === "SALARY" ? "Staff Salary" : "Program Expense",
      Project: proj ? `${proj.code} ${proj.name}` : projId,
      Budget_Head: h ? `${h.code} ${h.name}` : "General",
      Entered_By: e.enteredBy,
      Designation: e.enteredByDesignation || "Program Manager",
      Payee_Name: e.payeeName,
      Payment_Mode: e.mode,
      Amount_INR: e.amount,
      Bank_Export_Status: e.bankExported ? "Exported" : "Pending",
      Remark: e.remark || ""
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Project_Expenses");
  XLSX.writeFile(wb, `Expenses_${proj ? proj.code : "Project"}_${fy.fy.replace(/\s+/g, "_")}.xlsx`);
});

document.getElementById("btnPmExportPdf").addEventListener("click", () => {
  const fy = getCurrentFy();
  const user = getLoggedUser();
  const projId = state.ui.pmSelectedProjectId;
  const proj = fy.projects.find(p => p.id === projId);
  if (!proj) return;

  const exps = fy.expenses.filter(e => e.projectId === projId);
  const sp = getProjectSpent(projId);
  const bl = proj.budget - sp;

  const rowsHtml = exps.length
    ? exps.map((e, i) => {
        const h = fy.budgetHeads.find(x => x.id === e.headId);
        return `
          <tr>
            <td>${i + 1}</td>
            <td>${formatDateDDMMYYYY(e.date)}</td>
            <td>${e.category === "SALARY" ? "Staff Salary" : "Program"}</td>
            <td>${h ? h.code + " " + h.name : "General"}</td>
            <td>${e.payeeName}</td>
            <td>${e.mode}</td>
            <td style="text-align:right;">${formatINR(e.amount)}</td>
            <td>${e.remark || "—"}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="8" style="text-align:center;">No expenses recorded for this project.</td></tr>`;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>${proj.code} ${proj.name} — Expense Report</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: Arial, sans-serif; padding: 12px; color: #0f172a; }
          h2 { margin: 0 0 4px; color: #072f52; }
          .meta { font-size: 13px; color: #475569; margin-bottom: 16px; }
          .summary { display: flex; gap: 16px; margin-bottom: 18px; }
          .card { border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; flex: 1; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 7px; text-align: left; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h2>Alembic CSR Foundation — ${proj.code} ${proj.name}</h2>
        <div class="meta">FY: ${fy.fy} | Prepared by: ${user.fullName} (${user.designation}) | Generated: ${formatDateDDMMYYYY(new Date().toISOString().slice(0, 10))}</div>
        <div class="summary">
          <div class="card"><strong>Proposed Budget:</strong><br/>${formatINR(proj.budget)}</div>
          <div class="card"><strong>Total Actual Expense:</strong><br/>${formatINR(sp)}</div>
          <div class="card"><strong>Remaining Balance:</strong><br/>${formatINR(bl)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Type</th><th>Budget Head</th><th>Payee / Staff</th><th>Mode</th><th style="text-align:right;">Amount</th><th>Remark</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
});

/* ==================== REQUISITION FORM: PAYMENT SELECTION + DYNAMIC ROWS ==================== */
function buildRequisitionRowHtml(srNo, prefill = {}) {
  const prodVal = escapeHtmlAttr(prefill.product || "");
  const descVal = escapeHtmlAttr(prefill.description || "");
  const qtyVal = prefill.qty !== undefined && prefill.qty !== "" ? prefill.qty : "";
  const priceVal = prefill.price !== undefined && prefill.price !== "" ? prefill.price : "";

  return `
    <tr>
      <td class="center req-sr-cell">${srNo}</td>
      <td><input type="text" class="req-line-input req-prod" placeholder="Product name" value="${prodVal}" /></td>
      <td><input type="text" class="req-line-input req-desc" placeholder="Item description" value="${descVal}" /></td>
      <td><input type="number" step="any" min="0" class="req-line-input num req-qty" value="${qtyVal}" oninput="recalcRequisition()" /></td>
      <td><input type="number" step="any" min="0" class="req-line-input num req-price" value="${priceVal}" oninput="recalcRequisition()" /></td>
      <td class="num req-row-total">0</td>
      <td class="center no-print">
        <button type="button" class="btn-danger btn-sm" onclick="deleteRequisitionRow(this)">Delete</button>
      </td>
    </tr>
  `;
}

function initRequisitionRows() {
  const tbody = document.getElementById("reqRowsBody");
  tbody.innerHTML = buildRequisitionRowHtml(1);
  recalcRequisition();
}

function renumberRequisitionRows() {
  document.querySelectorAll("#reqRowsBody tr").forEach((tr, idx) => {
    const cell = tr.querySelector(".req-sr-cell");
    if (cell) cell.textContent = idx + 1;
  });
}

function deleteRequisitionRow(btn) {
  const tbody = document.getElementById("reqRowsBody");
  const tr = btn.closest("tr");
  if (!tr) return;
  if (tbody.querySelectorAll("tr").length <= 1) {
    alert("At least 1 line item is required in the Requisition Form.");
    return;
  }
  openConfirmDelete("Delete this requisition item line?", () => {
    tr.remove();
    renumberRequisitionRows();
    recalcRequisition();
  });
}

function recalcRequisition() {
  let grand = 0;
  document.querySelectorAll("#reqRowsBody tr").forEach(tr => {
    const qtyEl = tr.querySelector(".req-qty");
    const priceEl = tr.querySelector(".req-price");

    const rawQ = Number(qtyEl?.value) || 0;
    const rawP = Number(priceEl?.value) || 0;

    const q = Math.max(0, rawQ);
    const p = Math.max(0, rawP);

    if (qtyEl && rawQ < 0) qtyEl.value = 0;
    if (priceEl && rawP < 0) priceEl.value = 0;

    const tot = q * p;
    const rowTotalEl = tr.querySelector(".req-row-total");
    if (rowTotalEl) {
      rowTotalEl.textContent = tot ? formatINR(tot) : "0";
    }
    grand += tot;
  });

  const grandTotalEl = document.getElementById("reqGrandTotal");
  if (grandTotalEl) {
    grandTotalEl.textContent = formatINR(grand);
  }
}

function renderRequisitionPaymentPicker() {
  const fy = getCurrentFy();
  const projId = state.ui.pmSelectedProjectId;
  const tbody = document.getElementById("reqPaymentPickerBody");
  if (!tbody || !projId) return;

  const filterMode = document.getElementById("reqPaymentFilter")?.value || "PENDING";
  const projExps = fy.expenses.filter(e => {
    if (e.projectId !== projId) return false;
    if (filterMode === "PENDING" && e.bankExported) return false;
    return true;
  });

  if (!projExps.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="center" style="color:var(--muted); padding:10px;">No ${filterMode === "PENDING" ? "pending" : ""} payments found for this project.</td></tr>`;
    return;
  }

  tbody.innerHTML = projExps.map(e => {
    const h = fy.budgetHeads.find(x => x.id === e.headId);
    const headLabel = h ? `${h.code} ${h.name}` : (e.category === "SALARY" ? "Staff Salary" : "General");
    return `
      <tr>
        <td class="center"><input type="checkbox" class="req-pay-cb" value="${e.id}" /></td>
        <td style="white-space:nowrap;">${formatDateDDMMYYYY(e.date)}</td>
        <td><strong>${e.payeeName}</strong></td>
        <td>${headLabel}</td>
        <td>${e.mode}</td>
        <td class="num"><strong>${formatINR(e.amount)}</strong></td>
        <td class="center">${e.bankExported ? `<span class="badge badge-green">Exported</span>` : `<span class="badge badge-amber">Pending</span>`}</td>
      </tr>
    `;
  }).join("");
}

document.getElementById("reqPaymentFilter").addEventListener("change", () => {
  document.getElementById("reqSelectAllCb").checked = false;
  renderRequisitionPaymentPicker();
});

document.getElementById("reqSelectAllCb").addEventListener("change", e => {
  document.querySelectorAll(".req-pay-cb").forEach(cb => {
    cb.checked = e.target.checked;
  });
});

document.getElementById("btnToggleReqPaymentPicker").addEventListener("click", () => {
  document.getElementById("reqPaymentPickerBox").classList.toggle("hidden");
});

document.getElementById("btnLoadSelectedToReq").addEventListener("click", () => {
  const fy = getCurrentFy();
  const projId = state.ui.pmSelectedProjectId;
  const proj = fy.projects.find(p => p.id === projId);
  const checkedIds = [...document.querySelectorAll(".req-pay-cb:checked")].map(cb => cb.value);

  if (!checkedIds.length) {
    alert("Please tick at least 1 payment entry above to load into the Requisition Form.");
    return;
  }

  const selectedExps = fy.expenses.filter(e => checkedIds.includes(e.id));
  if (!selectedExps.length) return;

  const uniquePayees = [...new Set(selectedExps.map(e => e.payeeName).filter(Boolean))];
  const uniqueModes = [...new Set(selectedExps.map(e => e.mode).filter(Boolean))];
  const uniqueHeads = [
    ...new Set(
      selectedExps
        .map(e => {
          const h = fy.budgetHeads.find(x => x.id === e.headId);
          return h ? `${h.code} ${h.name}` : (e.category === "SALARY" ? "Staff Salary" : "Project General");
        })
        .filter(Boolean)
    )
  ];

  document.getElementById("reqToInput").value = uniquePayees.join(", ");
  document.getElementById("reqDateInput").value = selectedExps[selectedExps.length - 1].date || new Date().toISOString().slice(0, 10);
  if (proj) document.getElementById("reqProjectName").value = `${proj.code} - ${proj.name}`;
  document.getElementById("reqPaymentHead").value = uniqueHeads.join(", ");
  document.getElementById("reqPaymentMode").value = uniqueModes.join(" / ");

  const tbody = document.getElementById("reqRowsBody");
  tbody.innerHTML = selectedExps
    .map((exp, idx) => {
      const h = fy.budgetHeads.find(x => x.id === exp.headId);
      const desc = [
        h ? `${h.code} ${h.name}` : "",
        exp.remark || "",
        `(${formatDateDDMMYYYY(exp.date)})`
      ]
        .filter(Boolean)
        .join(" • ");
      return buildRequisitionRowHtml(idx + 1, {
        product: exp.payeeName,
        description: desc,
        qty: 1,
        price: Number(exp.amount) || 0
      });
    })
    .join("");

  recalcRequisition();
});

document.getElementById("btnClearReqForm").addEventListener("click", () => {
  document.getElementById("reqVendorSelect").value = "";
  document.getElementById("reqToInput").value = "";
  document.getElementById("reqPaymentHead").value = "";
  document.getElementById("reqPaymentMode").value = "NEFT";
  document.getElementById("reqSelectAllCb").checked = false;
  document.querySelectorAll(".req-pay-cb").forEach(cb => { cb.checked = false; });
  initRequisitionRows();
});

document.getElementById("reqVendorSelect").addEventListener("change", e => {
  const fy = getCurrentFy();
  const v = fy.vendors.find(x => x.id === e.target.value);
  if (v) {
    document.getElementById("reqToInput").value = v.name;
  }
});

document.getElementById("btnAddReqRow").addEventListener("click", () => {
  const tbody = document.getElementById("reqRowsBody");
  const nextIdx = tbody.querySelectorAll("tr").length + 1;
  tbody.insertAdjacentHTML("beforeend", buildRequisitionRowHtml(nextIdx));
});

document.getElementById("btnToggleRequisition").addEventListener("click", () => {
  const sec = document.getElementById("requisitionSection");
  sec.classList.toggle("hidden");
  if (!sec.classList.contains("hidden")) {
    renderRequisitionPaymentPicker();
    if (!document.getElementById("reqRowsBody").children.length) {
      initRequisitionRows();
    }
    sec.scrollIntoView({ behavior: "smooth" });
  }
});

document.getElementById("btnPrintRequisition").addEventListener("click", () => {
  window.print();
});

/* ==================== BANK EXCEL EXPORT SELECTION MODAL ==================== */
function updateBankExportSummary() {
  const fy = getCurrentFy();
  const checkedIds = [...document.querySelectorAll(".bank-exp-cb:checked")].map(cb => cb.value);
  const selectedExps = fy.expenses.filter(e => checkedIds.includes(e.id));
  const totalAmt = selectedExps.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  document.getElementById("bankExportSummaryBadge").textContent =
    `${selectedExps.length} Selected • ${formatINR(totalAmt)}`;
}

function renderBankExportModalTable() {
  const fy = getCurrentFy();
  const projId = state.ui.pmSelectedProjectId;
  const filterMode = document.getElementById("bankExportFilter").value || "PENDING";

  const list = fy.expenses.filter(e => {
    if (e.projectId !== projId) return false;
    if (filterMode === "PENDING" && e.bankExported) return false;
    return true;
  });

  const tbody = document.getElementById("bankExportTableBody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="center" style="color:var(--muted); padding:16px;">No ${filterMode === "PENDING" ? "pending" : ""} payment entries available for this project.</td></tr>`;
    document.getElementById("bankExportSelectAllCb").checked = false;
    updateBankExportSummary();
    return;
  }

  tbody.innerHTML = list.map(e => {
    const matchedVendor = fy.vendors.find(v => v.name.toLowerCase() === (e.payeeName || "").toLowerCase());
    const acc = e.acc || (matchedVendor ? matchedVendor.acc : "—");
    const ifsc = e.ifsc || (matchedVendor ? matchedVendor.ifsc : "—");
    const shouldDefaultCheck = !e.bankExported;

    return `
      <tr>
        <td class="center"><input type="checkbox" class="bank-exp-cb" value="${e.id}" ${shouldDefaultCheck ? "checked" : ""} onchange="updateBankExportSummary()" /></td>
        <td style="white-space:nowrap;">${formatDateDDMMYYYY(e.date)}</td>
        <td>${e.category === "SALARY" ? `<span class="badge badge-green">Salary</span>` : `<span class="badge badge-slate">Program</span>`}</td>
        <td><strong>${e.payeeName}</strong></td>
        <td>${acc}</td>
        <td>${ifsc}</td>
        <td>${e.mode}</td>
        <td class="num"><strong>${formatINR(e.amount)}</strong></td>
        <td class="center">${e.bankExported ? `<span class="badge badge-green">Exported</span>` : `<span class="badge badge-amber">Pending</span>`}</td>
      </tr>
    `;
  }).join("");

  const allCbs = [...document.querySelectorAll(".bank-exp-cb")];
  document.getElementById("bankExportSelectAllCb").checked = allCbs.length > 0 && allCbs.every(cb => cb.checked);
  updateBankExportSummary();
}

document.getElementById("btnExportBankExcel").addEventListener("click", () => {
  const projId = state.ui.pmSelectedProjectId;
  if (!projId) return;
  document.getElementById("bankExportFilter").value = "PENDING";
  document.getElementById("chkMarkBankExported").checked = true;
  renderBankExportModalTable();
  document.getElementById("bankExportModal").classList.add("open");
});

document.getElementById("bankExportFilter").addEventListener("change", renderBankExportModalTable);

document.getElementById("bankExportSelectAllCb").addEventListener("change", e => {
  document.querySelectorAll(".bank-exp-cb").forEach(cb => {
    cb.checked = e.target.checked;
  });
  updateBankExportSummary();
});

document.getElementById("btnBankSelectPending").addEventListener("click", () => {
  const fy = getCurrentFy();
  document.querySelectorAll(".bank-exp-cb").forEach(cb => {
    const exp = fy.expenses.find(e => e.id === cb.value);
    cb.checked = Boolean(exp && !exp.bankExported);
  });
  updateBankExportSummary();
});

document.getElementById("btnBankClearSelection").addEventListener("click", () => {
  document.querySelectorAll(".bank-exp-cb").forEach(cb => {
    cb.checked = false;
  });
  document.getElementById("bankExportSelectAllCb").checked = false;
  updateBankExportSummary();
});

document.getElementById("btnConfirmBankExcelDownload").addEventListener("click", () => {
  const fy = getCurrentFy();
  const user = getLoggedUser();
  const projId = state.ui.pmSelectedProjectId;
  const proj = fy.projects.find(p => p.id === projId);

  const checkedIds = [...document.querySelectorAll(".bank-exp-cb:checked")].map(cb => cb.value);
  if (!checkedIds.length) {
    alert("Please tick at least 1 payment entry to export.");
    return;
  }

  const selectedExps = fy.expenses.filter(e => checkedIds.includes(e.id));
  const markExported = document.getElementById("chkMarkBankExported").checked;
  const todayIso = new Date().toISOString().slice(0, 10);
  const ddMmYyyyDash = todayIso.split("-").reverse().join("-");
  const ddMmYyDash = `${todayIso.slice(8, 10)}-${todayIso.slice(5, 7)}-${todayIso.slice(2, 4)}`;

  const bankRows = selectedExps.map((e, idx) => {
    const matchedVendor = fy.vendors.find(v => v.name.toLowerCase() === (e.payeeName || "").toLowerCase());
    if (markExported) {
      e.bankExported = true;
      e.bankExportedAt = todayIso;
    }
    const accNo = String(e.acc || (matchedVendor ? matchedVendor.acc : "") || "");
    const ifscCode = String(e.ifsc || (matchedVendor ? matchedVendor.ifsc : "") || "").toUpperCase();
    const remitDetail = (e.remark && e.remark.trim())
      ? e.remark.trim()
      : `Vendor Payment / ${proj ? proj.name : ""}`;

    return {
      Transaction_Ref_No: idx + 1,
      Amount: Number(e.amount) || 0,
      Value_Date: "",
      Branch_Code: "",
      Sender_Account_Type: "",
      Remitter_Account_No: "",
      Remitter_Name: "",
      IFSC_Code: ifscCode,
      Debit_Account: "",
      Beneficiary_Account_type: "",
      Bank_Account_Number: accNo,
      Beneficiary_Name: e.payeeName || "",
      Remittance_Details: remitDetail,
      Debit_Account_System: "",
      Originator_Of_Remmittance: ""
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(bankRows);
  XLSX.utils.book_append_sheet(wb, ws, ddMmYyyyDash);
  XLSX.writeFile(wb, `Vendor Payment_${ddMmYyDash}.xlsx`);

  document.getElementById("bankExportModal").classList.remove("open");
  saveState();
  if (user) renderPmDashboardView(user);
});

/* ==================== GLOBAL LISTENERS ==================== */
document.getElementById("headProjectScope").addEventListener("change", e => {
  state.ui.headProjectScope = e.target.value;
  renderCsrHeadView();
});

document.getElementById("fySelect").addEventListener("change", e => {
  state.activeFy = e.target.value;
  state.ui.headProjectScope = "ALL";
  state.ui.pmSelectedProjectId = null;
  saveState();
  renderApp();
});

document.getElementById("headQuarterFilter").addEventListener("change", e => {
  state.ui.headQuarterFilter = e.target.value;
  renderCsrHeadView();
});

document.getElementById("pmQuarterFilter").addEventListener("change", e => {
  state.ui.pmQuarterFilter = e.target.value;
  renderPmDashboardView(getLoggedUser());
});

document.querySelectorAll(".chart-switch").forEach(btn => {
  btn.addEventListener("click", () => {
    state.ui.chartType = btn.dataset.type;
    document.querySelectorAll(".chart-switch").forEach(b => {
      b.className = "btn-sm chart-switch " + (b.dataset.type === state.ui.chartType ? "btn-primary" : "btn-outline");
    });
    renderStep4ExpensesAndChartsSection();
  });
});

document.getElementById("btnExportMasterExcel").addEventListener("click", () => {
  const fy = getCurrentFy();
  const q = state.ui.headQuarterFilter || "ALL";
  const rows = fy.projects.map(p => {
    const sp = getProjectSpent(p.id, q);
    const salSp = getProjectSalarySpent(p.id, q);
    const owners = getProjectOwnerEntries(p.id).map(u => `${u.fullName} (${u.designation})`).join(", ");
    return {
      Sr_No: p.code,
      Theme: p.theme,
      Particulars: p.name,
      Assigned_Owners_And_Designation: owners,
      Proposed_Budget: p.budget,
      Program_Expense: sp - salSp,
      Staff_Salary_Expense: salSp,
      Total_Actual_Expense: sp,
      Remaining_Balance: p.budget - sp,
      Spent_Pct: p.budget ? Number(((sp / p.budget) * 100).toFixed(1)) : 0
    };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, fy.fy);
  XLSX.writeFile(wb, `Alembic_CSR_Budget_${fy.fy.replace(/\s+/g, "_")}.xlsx`);
});

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.close === "confirmDeleteModal") {
      pendingDeleteCallback = null;
    }
    const el = document.getElementById(btn.dataset.close);
    if (el) el.classList.remove("open");
  });
});

initRequisitionRows();
renderApp();
pullAllFromSupabase();