// ============================================================
//  EAMU — Shared Data & Utilities (Enhanced)
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

// Add helper function to get subjects for a specific year+term
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
  if (s >= 90) return "A+";
  if (s >= 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  if (s >= 50) return "D";
  return "F";
}

function getGradeClass(grade) {
  const map = {
    "A+": "grade-Aplus",
    A: "grade-A",
    B: "grade-B",
    C: "grade-C",
    D: "grade-D",
    F: "grade-F",
  };
  return map[grade] || "grade-IP";
}

function gradeColor(grade) {
  const map = {
    "A+": "#5fd99a",
    A: "#4caf7d",
    B: "#4a90d9",
    C: "#c9a84c",
    D: "#e0a050",
    F: "#e05c5c",
    "—": "#7a90ab",
  };
  return map[grade] || "#7a90ab";
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

// ── Score key: studentId + subject ────────────────────────
function scoreKey(enrollmentId, subject) {
  return `${enrollmentId}|${subject}`;
}

// ── Helper: Check if results are published for a session ───
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
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
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

// ── Modal helpers ──────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

// ── Hamburger nav toggle ───────────────────────────────────
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("topbar-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
    btn.classList.toggle("open");
  });
}

// ── Highlight active nav link ──────────────────────────────
function highlightNav() {
  const page = location.pathname.split("/").pop() || "a_dashboard.html";
  document.querySelectorAll(".topbar-nav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === page);
  });
}

// ── Format date helper ─────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initHamburger();
  highlightNav();
});
