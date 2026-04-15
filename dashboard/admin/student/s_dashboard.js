// s_dashboard.js - Updated with matching grade colors

const DB = [
  {
    id: "r1",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 3,
    term: 2,
    subject: "Internet and Network Security",
    score: 90,
    grade: "A+",
  },
  {
    id: "r2",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 3,
    term: 2,
    subject: "E-commerce",
    score: 88,
    grade: "B+",
  },
  {
    id: "r3",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 3,
    term: 2,
    subject: "Management Information System",
    score: 92,
    grade: "A",
  },
  {
    id: "r4",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 2,
    term: 1,
    subject: "Database Fundamentals",
    score: 85,
    grade: "B",
  },
  {
    id: "r5",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 2,
    term: 1,
    subject: "Web Development",
    score: 82,
    grade: "B",
  },
  {
    id: "r6",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 4,
    term: 1,
    subject: "Strategic IT Management",
    score: 94,
    grade: "A",
  },
  {
    id: "r7",
    eid: "2404064V",
    name: "Ko Anvey",
    major: "Business Information System",
    year: 1,
    term: 2,
    subject: "Introduction to Programming",
    score: 78,
    grade: "C+",
  },
];

let selectedYear = "";
let selectedTerm = "";
let tempYear = "";
let tempTerm = "";

// Calculate GPA from scores (4.0 scale)
function calculateGPA(scores) {
  if (!scores.length) return 0;
  let totalPoints = 0;
  scores.forEach(score => {
    if (score >= 90) totalPoints += 4.0;
    else if (score >= 85) totalPoints += 3.7;
    else if (score >= 80) totalPoints += 3.3;
    else if (score >= 75) totalPoints += 3.0;
    else if (score >= 70) totalPoints += 2.7;
    else if (score >= 65) totalPoints += 2.3;
    else if (score >= 60) totalPoints += 2.0;
    else if (score >= 55) totalPoints += 1.7;
    else if (score >= 50) totalPoints += 1.0;
    else totalPoints += 0.0;
  });
  return (totalPoints / scores.length).toFixed(2);
}

// Get letter grade from GPA
function getGradeFromGPA(gpa) {
  const g = parseFloat(gpa);
  if (g >= 3.67) return "A+";
  if (g >= 3.33) return "A";
  if (g >= 3.0) return "B+";
  if (g >= 2.67) return "B";
  if (g >= 2.33) return "C+";
  if (g >= 2.0) return "C";
  if (g >= 1.0) return "D";
  return "F";
}

// Get grade class for styling - MATCHING ADMIN SITE
function getGradeClass(grade) {
  const map = {
    "A+": "grade-Aplus",
    "A": "grade-A",
    "B+": "grade-Bplus",
    "B": "grade-B",
    "C+": "grade-Cplus",
    "C": "grade-C",
    "D": "grade-D",
    "F": "grade-F"
  };
  return map[grade] || "grade-F";
}

const SVG = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  id: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4M8 3v4M2 11h20"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`,
  wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  pct: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  bar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

function sectionHd(icon, label) {
  return `<div class="section-hd">
    <div class="section-hd-icon">${icon}</div>
    <span class="section-hd-title">${label}</span>
    <div class="section-hd-rule"></div>
  </div>`;
}

function computeSummary(rows) {
  if (!rows.length) return { total: 0, avg: "—", gpa: "0.00", grade: "N/A" };
  const total = rows.reduce((s, r) => s + r.score, 0);
  const avg = total / rows.length;
  const scores = rows.map(r => r.score);
  const gpa = calculateGPA(scores);
  const grade = getGradeFromGPA(gpa);
  return { total, avg: avg.toFixed(1), gpa: gpa, grade: grade };
}

function render() {
  const app = document.getElementById("appRoot");
  
  const filtered = DB.filter(
    (r) => {
      const matchYear = !selectedYear || r.year == selectedYear;
      const matchTerm = !selectedTerm || r.term == selectedTerm;
      return matchYear && matchTerm;
    }
  );
  const sm = computeSummary(filtered);

  const yearOpts = [
    ["", "All Years"],
    ["1", "Year 1"],
    ["2", "Year 2"],
    ["3", "Year 3"],
    ["4", "Year 4"],
  ];
  const termOpts = [
    ["", "All Terms"],
    ["1", "Term 1"],
    ["2", "Term 2"],
    ["3", "Term 3"],
  ];
  const mkOpts = (opts, cur) =>
    opts
      .map(
        ([v, l]) =>
          `<option value="${v}"${cur == v ? " selected" : ""}>${l}</option>`,
      )
      .join("");
  
  const periodLabel = `${selectedYear ? "Year " + selectedYear : "All Years"} · ${selectedTerm ? "Term " + selectedTerm : "All Terms"}`;

  const tableRows =
    filtered.length === 0
      ? `<tr><td class="empty-td" colspan="8">No records found for the selected period.</td></tr>`
      : filtered
          .map(
            (r) => {
              const gradeClass = getGradeClass(r.grade);
              return `<tr>
          <td style="font-family:monospace;font-size:12.5px;color:#7a7a90">${r.eid}</td>
          <td style="font-weight:600;color:#0f0f12">${r.name}</td>
          <td style="font-size:13px">${r.major}</td>
          <td><span class="t-chip">Y${r.year}</span></td>
          <td><span class="t-chip">T${r.term}</span></td>
          <td style="font-weight:500">${r.subject}</td>
          <td><span class="t-score">📊 ${r.score} / 100</span></td>
          <td><span class="grade ${gradeClass}">${r.grade}</span></td>
        </tr>`;
            }
          )
          .join("");

  app.innerHTML = `
    <!-- HERO -->
    <div class="hero">
      <div>
        <h1>Student <em>Records</em></h1>
        <p>Filter and track your academic performance by year and term.</p>
      </div>
    </div>

    <!-- STUDENT PROFILE -->
    <div class="card">
      <div class="card-accent"></div>
      <div class="card-body">
        ${sectionHd(SVG.user, "Student Profile")}
        <div class="profile-row">
          <div class="profile-av">K</div>
          <div>
            <div class="profile-name">Ko Anvey</div>
            <div class="chips">
              <span class="chip">${SVG.id} ID: 2404064V</span>
              <span class="chip">${SVG.book} Business Information System</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="card">
      <div class="card-accent"></div>
      <div class="card-body">
        ${sectionHd(SVG.filter, "Filter by Period")}
        <div class="filter-grid">
          <div class="fl">
            <label class="fl-label">${SVG.cal} Academic Year</label>
            <div class="sel-wrap">
              <select id="yearSel">${mkOpts(yearOpts, tempYear)}</select>
              <span class="sel-arrow">${SVG.chevron}</span>
            </div>
          </div>
          <div class="fl">
            <label class="fl-label">${SVG.clock} Term</label>
            <div class="sel-wrap">
              <select id="termSel">${mkOpts(termOpts, tempTerm)}</select>
              <span class="sel-arrow">${SVG.chevron}</span>
            </div>
          </div>
          <button class="btn-apply" id="applyBtn">${SVG.search} Apply Filters</button>
        </div>
      </div>
    </div>

    <!-- RESULTS TABLE -->
    <div class="card">
      <div class="card-accent"></div>
      <div class="card-body">
        ${sectionHd(SVG.table, "Results — " + periodLabel)}
        <div class="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Student Name</th>
                <th>Major</th>
                <th>Year</th>
                <th>Term</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrap si1">${SVG.wave}</div>
        <div class="stat-val">${sm.total}</div>
        <div class="stat-label">Total Marks</div>
        <div class="stat-trend">📊 ${filtered.length} subjects tracked</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si2">${SVG.plus}</div>
        <div class="stat-val">${sm.avg}</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-trend">📊 per subject</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si3">${SVG.pct}</div>
        <div class="stat-val">${sm.gpa}</div>
        <div class="stat-label">GPA</div>
        <div class="stat-trend">⭐ out of 4.0</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si4">${SVG.award}</div>
        <div class="stat-val">${sm.grade}</div>
        <div class="stat-label">Final Grade</div>
        <div class="stat-trend">🏆 overall rating</div>
      </div>
    </div>

    <div class="footer">© 2025 EAMU — East Asia Management University · Academic Affairs Division</div>
  `;

  const yearSelect = document.getElementById("yearSel");
  const termSelect = document.getElementById("termSel");
  
  if (yearSelect) {
    yearSelect.addEventListener("change", (e) => {
      tempYear = e.target.value;
    });
  }
  if (termSelect) {
    termSelect.addEventListener("change", (e) => {
      tempTerm = e.target.value;
    });
  }
  
  const applyBtn = document.getElementById("applyBtn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      selectedYear = tempYear;
      selectedTerm = tempTerm;
      render();
    });
  }
}

document
  .getElementById("logoutBtn")
  ?.addEventListener("click", () => alert("Logged out (demo session)."));
render();