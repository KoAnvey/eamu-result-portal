// ============================================================
//  EAMU — Shared Data & Utilities (Professional Edition)
// ============================================================

// ── Majors and their subjects ──────────────────────────────

const MAJORS = {
  "Accounting & Finance": {
    "Year 1": {
      "Term 1": ["Financial Accounting", "Principles of Economics"],
      "Term 2": ["Management Accounting", "Business Law"],
      "Term 3": ["Corporate Finance", "Statistics"],
    },
    "Year 2": {
      "Term 1": ["Taxation", "Financial Reporting"],
      "Term 2": ["Auditing", "Cost Accounting"],
      "Term 3": ["Advanced Finance", "Accounting Information Systems"],
    },
    "Year 3": {
      "Term 1": ["Strategic Management Accounting", "International Finance"],
      "Term 2": ["Forensic Accounting", "Risk Management"],
      "Term 3": ["Corporate Governance", "Financial Modelling"],
    },
    "Year 4": {
      "Term 1": ["Advanced Auditing", "Portfolio Management"],
      "Term 2": ["Accounting Theory", "Research Methods"],
      "Term 3": ["Capstone Project", "Professional Ethics"],
    },
  },
  "International Business": {
    "Year 1": {
      "Term 1": ["Global Marketing", "International Trade"],
      "Term 2": ["Cross-Cultural Management", "Business Communication"],
      "Term 3": ["Foreign Exchange", "International Economics"],
    },
    "Year 2": {
      "Term 1": ["Export-Import Management", "Global Supply Chain"],
      "Term 2": ["International Business Law", "Market Entry Strategies"],
      "Term 3": ["Global HRM", "Country Risk Analysis"],
    },
    "Year 3": {
      "Term 1": ["Multinational Finance", "Trade Policies"],
      "Term 2": ["International Negotiation", "Global Brand Management"],
      "Term 3": ["Emerging Markets", "International Logistics"],
    },
    "Year 4": {
      "Term 1": ["Strategic Alliances", "Global Corporate Strategy"],
      "Term 2": ["International Business Research", "Cross-Border M&A"],
      "Term 3": ["Global Business Capstone", "Trade Compliance"],
    },
  },
  "Business Management": {
    "Year 1": {
      "Term 1": ["Principles of Management", "Organizational Behavior"],
      "Term 2": ["Business Mathematics", "Communication Skills"],
      "Term 3": ["Introduction to Marketing", "Business Ethics"],
    },
    "Year 2": {
      "Term 1": ["Human Resource Management", "Operations Management"],
      "Term 2": ["Strategic Management", "Consumer Behavior"],
      "Term 3": ["Project Management", "Entrepreneurship"],
    },
    "Year 3": {
      "Term 1": ["Leadership & Change", "Supply Chain Management"],
      "Term 2": ["Business Analytics", "Corporate Strategy"],
      "Term 3": ["Innovation Management", "Decision Making"],
    },
    "Year 4": {
      "Term 1": ["Advanced HRM", "International Management"],
      "Term 2": ["Business Research Methods", "Management Consulting"],
      "Term 3": ["Strategic Leadership Capstone", "Corporate Governance"],
    },
  },
  "Business Information Systems": {
    "Year 1": {
      "Term 1": ["Introduction to IT", "Database Management"],
      "Term 2": ["Programming Fundamentals", "Systems Analysis"],
      "Term 3": ["Web Development", "Business Computing"],
    },
    "Year 2": {
      "Term 1": ["IT Project Management", "Network Security"],
      "Term 2": ["Business Intelligence", "ERP Systems"],
      "Term 3": ["Data Analytics", "Cloud Computing"],
    },
    "Year 3": {
      "Term 1": ["Cybersecurity", "Digital Transformation"],
      "Term 2": ["Information Systems Strategy", "UX Design"],
      "Term 3": ["IT Governance", "E-commerce Systems"],
    },
    "Year 4": {
      "Term 1": ["Advanced Data Science", "IT Consulting"],
      "Term 2": ["Business Process Automation", "AI in Business"],
      "Term 3": ["IS Capstone Project", "Emerging Technologies"],
    },
  },
  "Hospitality & Tourism": {
    "Year 1": {
      "Term 1": ["Hotel Operations", "Tourism Principles"],
      "Term 2": ["Food & Beverage Management", "Customer Service"],
      "Term 3": ["Front Office Management", "Travel Geography"],
    },
    "Year 2": {
      "Term 1": ["Event Planning", "Sustainable Tourism"],
      "Term 2": ["Hospitality Marketing", "Revenue Management"],
      "Term 3": ["Tourism Economics", "Resort Management"],
    },
    "Year 3": {
      "Term 1": ["Cruise Management", "Heritage Tourism"],
      "Term 2": ["Hospitality Law", "Guest Relations"],
      "Term 3": ["International Tourism", "Food Safety"],
    },
    "Year 4": {
      "Term 1": ["Strategic Hospitality Management", "Tourism Policy"],
      "Term 2": ["Experience Design", "Crisis Management"],
      "Term 3": ["Hospitality Capstone", "Luxury Brand Management"],
    },
  },
};

const MAJOR_KEYS = Object.keys(MAJORS);

function getSubjectsForYearTerm(major, year, term) {
  if (!MAJORS[major]) return [];
  const yearData = MAJORS[major][year];
  if (!yearData) return [];
  return yearData[term] || [];
}

// ── Grade Calculator ───────────────────────────────────────
function getGrade(score) {
  if (score === null || score === undefined || score === "") return "—";
  const s = parseFloat(score);
  if (isNaN(s)) return "—";
  
  if (s >= 80) return "A+";
  if (s >= 75) return "A";
  if (s >= 70) return "B+";
  if (s >= 65) return "B";
  if (s >= 60) return "C+";
  if (s >= 55) return "C";
  if (s >= 50) return "D";
  return "F";
}

function getGradeClass(grade) {
  const map = {
    "A+": "grade-Aplus",
    "A": "grade-A",
    "B+": "grade-Bplus",
    "B": "grade-B",
    "C+": "grade-Cplus",
    "C": "grade-C",
    "D": "grade-D",
    "F": "grade-F",
    "—": "grade-IP",
  };
  return map[grade] || "grade-IP";
}

function gradeColor(grade) {
  const map = {
    "A+": "#5fd99a",
    "A": "#4caf7d",
    "B+": "#6ab0e6",
    "B": "#4a90d9",
    "C+": "#d4b85c",
    "C": "#c9a84c",
    "D": "#e0a050",
    "F": "#e05c5c",
    "—": "#7a90ab",
  };
  return map[grade] || "#7a90ab";
}

// ── GPA Calculator ─────────────────────────────────────────
function getGradePoint(grade) {
  const map = {
    "A+": 4.0,
    "A": 4.0,
    "B+": 3.5,
    "B": 3.0,
    "C+": 2.5,
    "C": 2.0,
    "D": 1.0,
    "F": 0.0,
    "—": 0.0,
  };
  return map[grade] || 0.0;
}

function calculateGPA(scores) {
  if (!scores || scores.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = scores.length;
  
  scores.forEach(score => {
    const grade = getGrade(score);
    const gradePoint = getGradePoint(grade);
    totalPoints += gradePoint;
  });
  
  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
}

function calculateStudentGPA(studentId, year, term) {
  const scores = loadScores();
  const student = loadStudents().find(s => s.id === studentId);
  if (!student) return 0;
  
  const subjects = getSubjectsForYearTerm(student.major, year, term);
  const studentScores = [];
  
  subjects.forEach(subj => {
    const key = scoreKey(studentId, subj);
    const score = scores[key];
    if (score !== undefined && score !== "") {
      studentScores.push(score);
    }
  });
  
  return calculateGPA(studentScores);
}

function getLetterGradeFromGPA(gpa) {
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

// ── LocalStorage helpers ───────────────────────────────────
function loadStudents() {
  return JSON.parse(localStorage.getItem("eamu_students") || "[]");
}
function saveStudents(arr) {
  localStorage.setItem("eamu_students", JSON.stringify(arr));
}
function loadScores() {
  return JSON.parse(localStorage.getItem("eamu_scores") || "{}");
}
function saveScores(obj) {
  localStorage.setItem("eamu_scores", JSON.stringify(obj));
}
function loadPublished() {
  return JSON.parse(localStorage.getItem("eamu_published") || "[]");
}
function savePublished(arr) {
  localStorage.setItem("eamu_published", JSON.stringify(arr));
}
function loadDrafts() {
  return JSON.parse(localStorage.getItem("eamu_drafts") || "[]");
}
function saveDrafts(arr) {
  localStorage.setItem("eamu_drafts", JSON.stringify(arr));
}

function scoreKey(enrollmentId, subject) {
  return `${enrollmentId}|${subject}`;
}

function isSessionPublished(year, term) {
  const published = loadPublished();
  return published.some((p) => p.year === year && p.term === term);
}

// ── Toast Notification ─────────────────────────────────────
function showToast(msg, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `${icons[type] || icons.info}<span class="toast-msg">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(20px)";
    t.style.transition = "all 0.3s";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function initHamburger() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("topbar-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
    btn.classList.toggle("open");
  });
}

function highlightNav() {
  const page = location.pathname.split("/").pop() || "a_dashboard.html";
  document.querySelectorAll(".topbar-nav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === page);
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

document.addEventListener("DOMContentLoaded", () => {
  initHamburger();
  highlightNav();
});