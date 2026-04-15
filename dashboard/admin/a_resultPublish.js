// a_publishedResults.js
document.addEventListener("DOMContentLoaded", () => {
  // Populate major filter
  const majorSelect = document.getElementById("filter-published-major");
  if (majorSelect) {
    MAJOR_KEYS.forEach(m => {
      const o = document.createElement("option");
      o.value = m;
      o.textContent = m;
      majorSelect.appendChild(o);
    });
  }

  let currentViewingStudent = null;

  function calculateGPA(scores) {
    if (!scores.length) return 0;
    const gradePoints = { "A+": 4.0, "A": 4.0, "B": 3.0, "C": 2.0, "D": 1.0, "F": 0.0, "—": 0 };
    let total = 0;
    let count = 0;
    scores.forEach(s => {
      const grade = getGrade(s.score);
      if (grade !== "—") {
        total += gradePoints[grade] || 0;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(2) : 0;
  }

  function render() {
    const published = loadPublished();
    const students = loadStudents();
    const scores = loadScores();
    
    const searchTerm = document.getElementById("search-published")?.value.toLowerCase() || "";
    const filterYear = document.getElementById("filter-published-year")?.value || "";
    const filterTerm = document.getElementById("filter-published-term")?.value || "";
    const filterMajor = document.getElementById("filter-published-major")?.value || "";

    // Filter published sessions
    let filteredSessions = published.filter(p => {
      if (filterYear && p.year !== filterYear) return false;
      if (filterTerm && p.term !== filterTerm) return false;
      return true;
    });

    const container = document.getElementById("published-results-container");
    const emptyMsg = document.getElementById("no-published-msg");
    
    if (!container) return;

    if (filteredSessions.length === 0) {
      container.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = "block";
    } else {
      if (emptyMsg) emptyMsg.style.display = "none";
      
      // Build HTML for each published session
      let sessionsHtml = "";
      let totalStudentsAssessed = 0;
      let totalGPASum = 0;
      let totalGPACount = 0;
      let totalSubjectsCount = 0;

      filteredSessions.forEach((session, idx) => {
        const sessionStudents = students.filter(s => s.year === session.year && s.term === session.term);
        const sessionKey = `${session.year}|${session.term}`;
        
        // Filter students by search and major
        let filteredStudents = sessionStudents.filter(s => {
          if (searchTerm && !s.name.toLowerCase().includes(searchTerm) && !s.id.toLowerCase().includes(searchTerm)) return false;
          if (filterMajor && s.major !== filterMajor) return false;
          return true;
        });

        if (filteredStudents.length === 0) return;

        totalStudentsAssessed += filteredStudents.length;
        
        // Calculate student results
        let studentsHtml = "";
        let sessionGPASum = 0;
        let sessionGPACount = 0;

        filteredStudents.forEach(student => {
          const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
          const studentScores = [];
          
          subjects.forEach(subj => {
            const key = scoreKey(student.id, subj);
            const score = scores[key];
            if (score !== undefined && score !== "") {
              studentScores.push({ subject: subj, score: score, grade: getGrade(score) });
              totalSubjectsCount++;
            }
          });
          
          const gpa = calculateGPA(studentScores);
          sessionGPASum += parseFloat(gpa);
          sessionGPACount++;
          totalGPASum += parseFloat(gpa);
          totalGPACount++;
          
          studentsHtml += `
            <div class="student-result-row">
              <div class="student-info">
                <div class="student-name">${escapeHtml(student.name)}</div>
                <div class="student-id">${escapeHtml(student.id)}</div>
                <div class="student-major">${escapeHtml(student.major)}</div>
              </div>
              <div class="student-gpa">
                <div class="gpa-value">${gpa}</div>
                <div class="gpa-label">GPA</div>
              </div>
              <div class="view-scores-btn">
                <button class="btn btn-outline btn-sm" onclick="viewStudentScores('${student.id}', '${escapeHtml(student.name)}', '${session.year}', '${session.term}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View Scores
                </button>
              </div>
            </div>
          `;
        });
        
        const sessionAvgGPA = sessionGPACount > 0 ? (sessionGPASum / sessionGPACount).toFixed(2) : "0.00";
        
        sessionsHtml += `
          <div class="result-card" data-session="${sessionKey}">
            <div class="result-card-header" onclick="toggleResultCard(this.parentElement)">
              <div class="result-info">
                <div class="result-year-term">${escapeHtml(session.year)} · ${escapeHtml(session.term)}</div>
                <span class="result-badge">Published</span>
                <div class="result-date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Published: ${formatDate(session.publishedAt)}
                </div>
                <span class="student-count">${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""}</span>
                <span class="student-count" style="background:var(--ok2);color:var(--ok);">Avg GPA: ${sessionAvgGPA}</span>
              </div>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="result-details">
              ${studentsHtml}
            </div>
          </div>
        `;
      });
      
      container.innerHTML = sessionsHtml;
      
      // Update stats
      document.getElementById("total-published-sessions").textContent = filteredSessions.length;
      document.getElementById("total-published-students").textContent = totalStudentsAssessed;
      document.getElementById("total-subjects-assessed").textContent = totalSubjectsCount;
      const overallAvgGPA = totalGPACount > 0 ? (totalGPASum / totalGPACount).toFixed(2) : "0.00";
      document.getElementById("overall-avg-gpa").textContent = overallAvgGPA;
    }
  }

  // View student scores modal
  window.viewStudentScores = (studentId, studentName, year, term) => {
    const students = loadStudents();
    const scores = loadScores();
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;
    
    const subjects = getSubjectsForYearTerm(student.major, year, term);
    const scoresList = [];
    
    subjects.forEach(subj => {
      const key = scoreKey(student.id, subj);
      const score = scores[key];
      if (score !== undefined && score !== "") {
        scoresList.push({ subject: subj, score: score, grade: getGrade(score) });
      }
    });
    
    const modalTitle = document.getElementById("scores-modal-title");
    const scoresContainer = document.getElementById("scores-list");
    
    if (modalTitle) modalTitle.textContent = `${escapeHtml(studentName)} - ${year} · ${term}`;
    
    if (scoresContainer) {
      if (scoresList.length === 0) {
        scoresContainer.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No scores found for this student.</p></div>';
      } else {
        scoresContainer.innerHTML = scoresList.map(s => `
          <div class="subject-item">
            <div class="subject-name">${escapeHtml(s.subject)}</div>
            <div class="subject-score">${s.score}</div>
            <div class="subject-grade"><span class="badge" style="background:${gradeColor(s.grade)}20;color:${gradeColor(s.grade)};font-weight:700;">${s.grade}</span></div>
          </div>
        `).join("");
      }
    }
    
    openModal("modal-view-scores");
  };

  window.toggleResultCard = (card) => {
    card.classList.toggle("collapsed");
  };

  // Add event listeners for filters
  const filterElements = ["search-published", "filter-published-year", "filter-published-term", "filter-published-major"];
  filterElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    }
  });

  const resetBtn = document.getElementById("reset-published-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const search = document.getElementById("search-published");
      const year = document.getElementById("filter-published-year");
      const term = document.getElementById("filter-published-term");
      const major = document.getElementById("filter-published-major");
      if (search) search.value = "";
      if (year) year.value = "";
      if (term) term.value = "";
      if (major) major.value = "";
      render();
      showToast("Filters reset", "info");
    });
  }

  // Close modal on overlay click
  document.querySelectorAll(".modal-overlay").forEach(o => {
    o.addEventListener("click", e => {
      if (e.target === o) o.classList.remove("open");
    });
  });

  render();
});

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}