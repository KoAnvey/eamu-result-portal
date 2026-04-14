// a_resultPublish.js
// ─────────────────────────────────────────────────────────────
// Safe key for DOM IDs: encode student id + subject
// ─────────────────────────────────────────────────────────────
function safeId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, (c) => "_" + c.charCodeAt(0) + "_");
}

function gradeClass(grade) {
  const map = {
    "A+": "gp-Ap",
    "A": "gp-A",
    "B": "gp-B",
    "C": "gp-C",
    "D": "gp-D",
    "F": "gp-F",
    "—": "gp-empty",
  };
  return map[grade] || "gp-empty";
}

document.addEventListener("DOMContentLoaded", () => {
  let currentSession = null; // { year, term, students[] }

  // Get elements
  const btnLoad = document.getElementById("btn-load");
  const selYear = document.getElementById("sel-year");
  const selTerm = document.getElementById("sel-term");
  const resultArea = document.getElementById("result-area");
  const noStudentsMsg = document.getElementById("no-students-msg");
  const resultTitle = document.getElementById("result-title");
  const studentCountBadge = document.getElementById("student-count-badge");
  const studentBlocksContainer = document.getElementById("student-blocks");
  const overallBar = document.getElementById("overall-bar");
  const progressText = document.getElementById("progress-text");
  const progressPct = document.getElementById("progress-pct");
  const btnSaveDraft = document.getElementById("btn-save-draft");
  const btnPublish = document.getElementById("btn-publish");
  const btnExpandAll = document.getElementById("btn-expand-all");
  const btnCollapseAll = document.getElementById("btn-collapse-all");

  // ── Check if we need to load a draft on page load ─────────
  function checkForDraftOnLoad() {
    const draftKey = sessionStorage.getItem("loadDraftKey");
    if (draftKey) {
      // Clear it so it doesn't reload on refresh
      sessionStorage.removeItem("loadDraftKey");
      
      // Parse the draft key (format: "Year X|Term X")
      const [year, term] = draftKey.split("|");
      
      if (year && term) {
        // Set the select values
        if (selYear) selYear.value = year;
        if (selTerm) selTerm.value = term;
        
        // Auto-load the students
        setTimeout(() => {
          btnLoad.click();
          showToast(`Loaded draft for ${year} · ${term}`, "success");
        }, 100);
      }
    }
  }

  // ── Load button ───────────────────────────────────────────
  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      const year = selYear.value;
      const term = selTerm.value;

      if (!year || !term) {
        showToast("Please select both year and term.", "error");
        return;
      }

      const all = loadStudents();
      const filtered = all.filter((s) => s.year === year && s.term === term);

      if (resultArea) resultArea.style.display = "none";
      if (noStudentsMsg) noStudentsMsg.style.display = "none";

      if (filtered.length === 0) {
        if (noStudentsMsg) noStudentsMsg.style.display = "block";
        return;
      }

      currentSession = { year, term, students: filtered };
      if (resultTitle) resultTitle.textContent = `Score Entry — ${year} · ${term}`;
      if (studentCountBadge) studentCountBadge.textContent = `${filtered.length} student${filtered.length > 1 ? "s" : ""}`;

      buildStudentBlocks(filtered);
      if (resultArea) resultArea.style.display = "block";
      updateOverallStats();
    });
  }

  // ── Build per-student blocks ──────────────────────────────
  function buildStudentBlocks(students) {
    if (!studentBlocksContainer) return;
    studentBlocksContainer.innerHTML = "";

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      const initials = student.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const safeSid = safeId(student.id);
      const blockId = "block-" + safeSid;

      const block = document.createElement("div");
      block.className = "student-block";
      block.id = blockId;

      // Header
      const header = document.createElement("div");
      header.className = "student-block-header";
      header.innerHTML = `
        <div class="s-left">
          <div class="s-avatar">${escapeHtml(initials)}</div>
          <div>
            <div class="s-name">${escapeHtml(student.name)}</div>
            <div class="s-id">${escapeHtml(student.id)} &nbsp;·&nbsp; ${escapeHtml(student.major)}</div>
          </div>
        </div>
        <div class="s-right">
          <span class="s-avg-chip" id="avg-${safeSid}">Avg: —</span>
          <div class="s-progress">
            <div class="s-pbar-wrap">
              <div class="s-pbar-fill" id="pbar-${safeSid}" style="width:0%"></div>
            </div>
            <span id="pcount-${safeSid}">0/${subjects.length}</span>
          </div>
          <span class="badge badge-blue" style="font-size:0.68rem;">${student.year} · ${student.term}</span>
          <svg class="collapse-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      `;

      // Toggle on header click
      header.addEventListener("click", () => {
        block.classList.toggle("collapsed");
      });

      // Subject rows
      const rowsDiv = document.createElement("div");
      rowsDiv.className = "subject-rows";

      subjects.forEach((subj, idx) => {
        const scores = loadScores();
        const skey = scoreKey(student.id, subj);
        const existing = scores[skey] !== undefined ? scores[skey] : "";
        const grade = getGrade(existing);
        const gClass = gradeClass(grade);
        const inputId = "inp-" + safeSid + "-" + safeId(subj);
        const gradeId = "grd-" + safeSid + "-" + safeId(subj);

        const row = document.createElement("div");
        row.className = "subject-row";
        row.innerHTML = `
          <div class="subj-label">
            <span class="subj-num">${idx + 1}</span>
            ${escapeHtml(subj)}
          </div>
          <div class="score-wrap">
            <input
              type="number"
              id="${inputId}"
              min="0" max="100" step="1"
              value="${existing}"
              placeholder="Enter score"
              data-sid="${student.id}"
              data-subj="${escapeHtml(subj)}"
              data-gradeid="${gradeId}"
              data-blockid="${blockId}">
          </div>
          <div>
            <div class="grade-pill ${gClass}" id="${gradeId}">${grade}</div>
          </div>
        `;

        rowsDiv.appendChild(row);
      });

      block.appendChild(header);
      block.appendChild(rowsDiv);
      studentBlocksContainer.appendChild(block);

      // Attach input listeners after DOM insert
      subjects.forEach((subj) => {
        const inputId = "inp-" + safeSid + "-" + safeId(subj);
        const input = document.getElementById(inputId);
        if (input) {
          input.addEventListener("input", onScoreInput);
          input.addEventListener("blur", onScoreBlur);
        }
      });

      refreshStudentProgress(student);
    });
  }

  // ── Score input handler ───────────────────────────────────
  function onScoreInput(e) {
    const input = e.target;
    const sid = input.dataset.sid;
    const subj = input.dataset.subj;
    const gradeId = input.dataset.gradeid;
    const val = input.value.trim();

    // Validate range
    input.classList.remove("score-error");
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 100)) {
      input.classList.add("score-error");
      showToast("Score must be between 0 and 100", "error");
      return;
    }

    // Update grade pill
    const grade = getGrade(val);
    const gEl = document.getElementById(gradeId);
    if (gEl) {
      gEl.textContent = grade;
      gEl.className = "grade-pill " + gradeClass(grade);
    }

    // Persist immediately
    const scores = loadScores();
    const key = scoreKey(sid, subj);
    if (val === "" || isNaN(parseFloat(val))) {
      delete scores[key];
    } else {
      scores[key] = parseFloat(val);
    }
    saveScores(scores);

    // Refresh per-student and global stats
    if (currentSession) {
      const student = currentSession.students.find((x) => x.id === sid);
      if (student) refreshStudentProgress(student);
    }
    updateOverallStats();
  }

  function onScoreBlur(e) {
    const input = e.target;
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      // Clamp to 0–100
      const clamped = Math.min(100, Math.max(0, val));
      if (clamped !== val) {
        input.value = clamped;
        input.dispatchEvent(new Event("input"));
      }
    }
  }

  // ── Per-student progress update ──────────────────────────
  function refreshStudentProgress(student) {
    const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
    const scores = loadScores();
    const safeSid = safeId(student.id);

    let filled = 0;
    let sum = 0;
    subjects.forEach((subj) => {
      const v = scores[scoreKey(student.id, subj)];
      if (v !== undefined && v !== "") {
        filled++;
        sum += v;
      }
    });

    const total = subjects.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    const avg = filled > 0 ? (sum / filled).toFixed(1) : "—";

    const pbar = document.getElementById("pbar-" + safeSid);
    const pcount = document.getElementById("pcount-" + safeSid);
    const avgEl = document.getElementById("avg-" + safeSid);

    if (pbar) pbar.style.width = pct + "%";
    if (pcount) pcount.textContent = `${filled}/${total}`;
    if (avgEl) avgEl.textContent = `Avg: ${avg}`;
  }

  // ── Global stats update ───────────────────────────────────
  function updateOverallStats() {
    if (!currentSession) return;

    const scores = loadScores();
    const students = currentSession.students;

    let entered = 0;
    let total = 0;
    let sum = 0;

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      subjects.forEach((subj) => {
        total++;
        const v = scores[scoreKey(student.id, subj)];
        if (v !== undefined && v !== "") {
          entered++;
          sum += v;
        }
      });
    });

    const pct = total > 0 ? Math.round((entered / total) * 100) : 0;
    const avg = entered > 0 ? (sum / entered).toFixed(1) : "—";

    if (overallBar) overallBar.style.width = pct + "%";
    if (progressText) progressText.textContent = `${entered} / ${total} scores entered`;
    if (progressPct) progressPct.textContent = `${pct}%`;
  }

  // ── Expand / Collapse All ─────────────────────────────────
  if (btnExpandAll) {
    btnExpandAll.addEventListener("click", () => {
      document.querySelectorAll(".student-block").forEach((b) => b.classList.remove("collapsed"));
    });
  }

  if (btnCollapseAll) {
    btnCollapseAll.addEventListener("click", () => {
      document.querySelectorAll(".student-block").forEach((b) => b.classList.add("collapsed"));
    });
  }

  // ── Save as Draft ─────────────────────────────────────────
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener("click", () => {
      if (!currentSession) {
        showToast("No session loaded. Please select year and term first.", "error");
        return;
      }
      
      // Also save all current scores to localStorage (already happening real-time)
      // But we need to make sure draft is saved
      const drafts = loadDrafts();
      const key = `${currentSession.year}|${currentSession.term}`;
      const idx = drafts.findIndex((d) => d.key === key);
      const draft = {
        key,
        year: currentSession.year,
        term: currentSession.term,
        savedAt: new Date().toISOString(),
        studentCount: currentSession.students.length,
      };
      if (idx >= 0) drafts[idx] = draft;
      else drafts.push(draft);
      saveDrafts(drafts);
      showToast("Draft saved successfully. You can continue later from My Drafts.", "success");
    });
  }

  // ── Publish ───────────────────────────────────────────────
  if (btnPublish) {
    btnPublish.addEventListener("click", () => {
      if (!currentSession) {
        showToast("No session loaded. Please select year and term first.", "error");
        return;
      }
      const confirmText = document.getElementById("publish-confirm-text");
      if (confirmText) {
        confirmText.textContent = `Publish all results for ${currentSession.year}, ${currentSession.term}? Results will appear in the Score Board.`;
      }
      openModal("modal-publish-confirm");
    });
  }

  const yesPublishBtn = document.getElementById("btn-yes-publish");
  if (yesPublishBtn) {
    yesPublishBtn.addEventListener("click", () => {
      if (!currentSession) return;
      const published = loadPublished();
      const key = `${currentSession.year}|${currentSession.term}`;
      const idx = published.findIndex((p) => p.key === key);
      const entry = {
        key,
        year: currentSession.year,
        term: currentSession.term,
        publishedAt: new Date().toISOString(),
        studentCount: currentSession.students.length,
      };
      if (idx >= 0) published[idx] = entry;
      else published.push(entry);
      savePublished(published);

      // Remove from drafts
      saveDrafts(loadDrafts().filter((d) => d.key !== key));

      closeModal("modal-publish-confirm");
      showToast("Results published successfully!", "success");
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll(".modal-overlay").forEach((o) => {
    o.addEventListener("click", (e) => {
      if (e.target === o) o.classList.remove("open");
    });
  });

  // ── Check for draft on load ───────────────────────────────
  checkForDraftOnLoad();
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