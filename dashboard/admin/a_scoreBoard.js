// a_scoreBoard.js
document.addEventListener("DOMContentLoaded", () => {
  // Populate major filter
  const majorSelect = document.getElementById("sb-major");
  if (majorSelect) {
    MAJOR_KEYS.forEach(m => {
      const o = document.createElement("option");
      o.value = m; 
      o.textContent = m; 
      majorSelect.appendChild(o);
    });
  }

  // State for current sort
  let currentSort = { column: "studentName", direction: "asc" };

  function gradeStyle(grade) {
    const map = {
      "A+": "background:rgba(95,217,154,0.15);color:#5fd99a;",
      "A":  "background:rgba(30,123,72,0.15);color:#1e7b48;",
      "B":  "background:rgba(13,110,253,0.15);color:#0d6efd;",
      "C":  "background:rgba(184,0,110,0.15);color:#b8006e;",
      "D":  "background:rgba(253,126,20,0.15);color:#fd7e14;",
      "F":  "background:rgba(220,53,69,0.15);color:#dc3545;",
      "—":  "background:rgba(122,122,144,0.1);color:#7a7a90;"
    };
    return map[grade] || map["—"];
  }

  function render() {
    const students = loadStudents();
    const scores = loadScores();
    
    // Get filter values
    const search = document.getElementById("sb-search")?.value.toLowerCase() || "";
    const fMajor = document.getElementById("sb-major")?.value || "";
    const fYear = document.getElementById("sb-year")?.value || "";
    const fTerm = document.getElementById("sb-term")?.value || "";
    const fGrade = document.getElementById("sb-grade")?.value || "";

    // Build flat rows: one per (student, subject)
    let rows = [];
    
    students.forEach(s => {
      // Apply student filters
      if (fMajor && s.major !== fMajor) return;
      if (fYear && s.year !== fYear) return;
      if (fTerm && s.term !== fTerm) return;
      if (search && !s.name.toLowerCase().includes(search) && !s.id.toLowerCase().includes(search)) return;

      const subjects = getSubjectsForYearTerm(s.major, s.year, s.term);
      
      subjects.forEach(subj => {
        const key = scoreKey(s.id, subj);
        const score = scores[key] !== undefined ? scores[key] : null;
        const grade = getGrade(score);
        
        // Apply grade filter
        if (fGrade && grade !== fGrade) return;
        
        rows.push({ 
          student: s, 
          subject: subj, 
          score: score, 
          grade: grade,
          // For sorting
          studentName: s.name,
          studentId: s.id,
          major: s.major,
          year: s.year,
          term: s.term
        });
      });
    });

    // Apply sorting
    rows = sortRows(rows, currentSort.column, currentSort.direction);

    const tbody = document.getElementById("sb-tbody");
    const empty = document.getElementById("sb-empty");
    const recordCount = document.getElementById("record-count");
    
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    if (recordCount) {
      recordCount.textContent = `${rows.length} record${rows.length !== 1 ? "s" : ""}`;
    }

    if (rows.length === 0) {
      if (empty) empty.style.display = "block";
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:48px; color:var(--ink3);">No score records found. Publish results first.</td></tr>`;
      if (empty) empty.style.display = "none";
    } else {
      if (empty) empty.style.display = "none";
      rows.forEach((r, i) => {
        const tr = document.createElement("tr");
        const scoreDisplay = r.score !== null ? r.score : "—";
        tr.innerHTML = `
          <td class="td-id">${i + 1}</td>
          <td class="td-id">${escapeHtml(r.student.id)}</td>
          <td class="td-name">${escapeHtml(r.student.name)}</td>
          <td><span class="badge badge-blue" style="font-size:0.7rem;">${escapeHtml(r.student.major)}</span></td>
          <td>${r.student.year}</td>
          <td>${r.student.term}</td>
          <td style="color:var(--ink2);">${escapeHtml(r.subject)}</td>
          <td style="font-weight:600;color:var(--ink);">${scoreDisplay}</td>
          <td><span class="badge" style="${gradeStyle(r.grade)};font-weight:700;">${r.grade}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Update summary stats
    updateSummaryStats(rows);
  }

  // Sorting function
  function sortRows(rows, column, direction) {
    const sorted = [...rows];
    const multiplier = direction === "asc" ? 1 : -1;
    
    sorted.sort((a, b) => {
      let valA, valB;
      
      switch(column) {
        case "studentName":
          valA = a.student.name.toLowerCase();
          valB = b.student.name.toLowerCase();
          break;
        case "studentId":
          valA = a.student.id;
          valB = b.student.id;
          break;
        case "major":
          valA = a.student.major;
          valB = b.student.major;
          break;
        case "year":
          valA = parseInt(a.student.year.split(" ")[1]) || 0;
          valB = parseInt(b.student.year.split(" ")[1]) || 0;
          break;
        case "term":
          valA = parseInt(a.student.term.split(" ")[1]) || 0;
          valB = parseInt(b.student.term.split(" ")[1]) || 0;
          break;
        case "subject":
          valA = a.subject;
          valB = b.subject;
          break;
        case "score":
          valA = a.score !== null ? a.score : -1;
          valB = b.score !== null ? b.score : -1;
          break;
        case "grade":
          const gradeOrder = { "A+": 12, "A": 11, "B": 10, "C": 9, "D": 8, "F": 7, "—": 0 };
          valA = gradeOrder[a.grade] || 0;
          valB = gradeOrder[b.grade] || 0;
          break;
        default:
          valA = a.student.name.toLowerCase();
          valB = b.student.name.toLowerCase();
      }
      
      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
      return 0;
    });
    
    return sorted;
  }

  // Update summary statistics
  function updateSummaryStats(rows) {
    const total = rows.length;
    const withScore = rows.filter(r => r.score !== null);
    const avg = withScore.length > 0
      ? (withScore.reduce((s, r) => s + r.score, 0) / withScore.length).toFixed(1)
      : "—";
    const highest = withScore.length ? Math.max(...withScore.map(r => r.score)) : "—";
    const lowest = withScore.length ? Math.min(...withScore.map(r => r.score)) : "—";
    const passCount = withScore.filter(r => r.score >= 50).length;

    const summaryContainer = document.getElementById("summary-cards");
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="summary-card"><div class="val">${total}</div><div class="lbl">Total Records</div></div>
        <div class="summary-card"><div class="val" style="color:var(--m);">${avg}</div><div class="lbl">Average Score</div></div>
        <div class="summary-card"><div class="val" style="color:var(--ok);">${highest}</div><div class="lbl">Highest Score</div></div>
        <div class="summary-card"><div class="val" style="color:var(--danger);">${lowest}</div><div class="lbl">Lowest Score</div></div>
        <div class="summary-card"><div class="val" style="color:var(--info);">${passCount}</div><div class="lbl">Passed (≥50)</div></div>`;
    }
  }

  // Setup sortable headers
  function setupSortableHeaders() {
    const headers = [
      { id: "sort-name", column: "studentName", text: "Student Name" },
      { id: "sort-id", column: "studentId", text: "Enrollment ID" },
      { id: "sort-major", column: "major", text: "Major" },
      { id: "sort-year", column: "year", text: "Year" },
      { id: "sort-term", column: "term", text: "Term" },
      { id: "sort-subject", column: "subject", text: "Subject" },
      { id: "sort-score", column: "score", text: "Score" },
      { id: "sort-grade", column: "grade", text: "Grade" }
    ];

    // Find the table header row and add sort buttons
    const theadRow = document.querySelector("#sb-table thead tr");
    if (!theadRow) return;

    // Store original headers to replace
    const thElements = theadRow.querySelectorAll("th");
    
    headers.forEach((header, idx) => {
      const th = thElements[idx + 1]; // +1 because first column is #
      if (th && header.id) {
        const currentText = th.textContent;
        th.style.cursor = "pointer";
        th.style.userSelect = "none";
        th.style.transition = "color 0.2s";
        th.innerHTML = `${currentText} <span style="font-size:10px; margin-left:4px;" class="sort-icon-${header.column}">↕️</span>`;
        
        th.addEventListener("click", () => {
          // Toggle direction if same column, otherwise reset to asc
          if (currentSort.column === header.column) {
            currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
          } else {
            currentSort.column = header.column;
            currentSort.direction = "asc";
          }
          
          // Update all sort icons
          headers.forEach(h => {
            const iconSpan = document.querySelector(`.sort-icon-${h.column}`);
            if (iconSpan) {
              if (currentSort.column === h.column) {
                iconSpan.innerHTML = currentSort.direction === "asc" ? "↑" : "↓";
              } else {
                iconSpan.innerHTML = "↕️";
              }
            }
          });
          
          render();
        });
        
        // Hover effect
        th.addEventListener("mouseenter", () => {
          th.style.color = "var(--m)";
        });
        th.addEventListener("mouseleave", () => {
          th.style.color = "";
        });
      }
    });
  }

  // Add reset filters button
  function addResetButton() {
    const filterBar = document.querySelector(".filter-bar");
    if (filterBar && !document.getElementById("btn-reset-filters")) {
      const resetBtn = document.createElement("button");
      resetBtn.id = "btn-reset-filters";
      resetBtn.className = "btn btn-outline btn-sm";
      resetBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M6 12h12M10 18h4"/>
          <path d="M3 6l3-3M3 6l3 3M21 6l-3-3M21 6l-3 3"/>
        </svg>
        Reset Filters
      `;
      resetBtn.style.marginLeft = "auto";
      resetBtn.addEventListener("click", () => {
        // Reset all filter inputs
        const searchInput = document.getElementById("sb-search");
        const majorSelect = document.getElementById("sb-major");
        const yearSelect = document.getElementById("sb-year");
        const termSelect = document.getElementById("sb-term");
        const gradeSelect = document.getElementById("sb-grade");
        
        if (searchInput) searchInput.value = "";
        if (majorSelect) majorSelect.value = "";
        if (yearSelect) yearSelect.value = "";
        if (termSelect) termSelect.value = "";
        if (gradeSelect) gradeSelect.value = "";
        
        // Reset sort
        currentSort = { column: "studentName", direction: "asc" };
        
        // Update sort icons
        const headers = ["studentName", "studentId", "major", "year", "term", "subject", "score", "grade"];
        headers.forEach(col => {
          const iconSpan = document.querySelector(`.sort-icon-${col}`);
          if (iconSpan) iconSpan.innerHTML = "↕️";
        });
        
        render();
        showToast("All filters reset", "info");
      });
      filterBar.appendChild(resetBtn);
    }
  }

  // Initial render and setup
  render();
  setupSortableHeaders();
  addResetButton();
  
  // Add event listeners for filters
  const filterIds = ["sb-search", "sb-major", "sb-year", "sb-term", "sb-grade"];
  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    }
  });
});

// Helper function to escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}