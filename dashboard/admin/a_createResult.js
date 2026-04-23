// a_createResult.js
function safeId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, (c) => "_" + c.charCodeAt(0) + "_");
}

function gradeClass(grade) {
  const map = {
    "A+": "gp-Ap",
    "A": "gp-A",
    "B+": "gp-Bp",
    "B": "gp-B",
    "C+": "gp-Cp",
    "C": "gp-C",
    "D": "gp-D",
    "F": "gp-F",
    "—": "gp-empty",
  };
  return map[grade] || "gp-empty";
}

document.addEventListener("DOMContentLoaded", () => {
  let currentSession = null;

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
  const sessionNotice = document.getElementById("session-notice");

  function showSessionNotice(type, title, message) {
    if (!sessionNotice) return;
    
    sessionNotice.classList.remove('info', 'success', 'warning', 'error', 'neutral');
    sessionNotice.classList.add('notice-banner', type);
    
    const iconSvg = sessionNotice.querySelector('.notice-banner-icon svg');
    if (iconSvg) {
      if (type === 'success') {
        iconSvg.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      } else if (type === 'warning') {
        iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
      } else if (type === 'error') {
        iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
      } else if (type === 'info') {
        iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>';
      } else {
        iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>';
      }
    }
    
    document.getElementById("notice-title").textContent = title;
    document.getElementById("notice-message").textContent = message;
    sessionNotice.style.display = "flex";
  }

  function hideSessionNotice() {
    if (sessionNotice) sessionNotice.style.display = "none";
  }

  function checkForDraftOnLoad() {
    const draftKey = sessionStorage.getItem("loadDraftKey");
    if (draftKey) {
      sessionStorage.removeItem("loadDraftKey");
      const [year, term] = draftKey.split("|");
      if (year && term && selYear && selTerm) {
        selYear.value = year;
        selTerm.value = term;
        setTimeout(() => {
          if (btnLoad) btnLoad.click();
          setTimeout(() => {
            showSessionNotice('neutral', 'Draft Loaded', `Continuing work on ${year} · ${term}. Enter scores and publish when ready.`);
          }, 500);
        }, 100);
      }
    }
  }

  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      const year = selYear.value;
      const term = selTerm.value;

      if (!year || !term) {
        showToast("Please select both academic year and term.", "error");
        return;
      }

      const isPublished = isSessionPublished(year, term);
      
      if (isPublished) {
        showSessionNotice('info', 'Published Session — Editable', 
          `${year} · ${term} results have been previously published. You may edit scores below. After making changes, click "Publish Results" to update the official record.`);
      } else {
        hideSessionNotice();
      }

      const all = loadStudents();
      const filtered = all.filter((s) => s.year === year && s.term === term);

      if (resultArea) resultArea.style.display = "none";
      if (noStudentsMsg) noStudentsMsg.style.display = "none";

      if (filtered.length === 0) {
        if (noStudentsMsg) noStudentsMsg.style.display = "block";
        showToast(`No students enrolled for ${year} · ${term}. Please register students first.`, "error");
        return;
      }

      currentSession = { year, term, students: filtered, isPublished };
      
      if (resultTitle) resultTitle.textContent = `Score Entry — ${year} · ${term}${isPublished ? ' (Published - Editable)' : ''}`;
      if (studentCountBadge) studentCountBadge.textContent = `${filtered.length} student${filtered.length > 1 ? "s" : ""}`;

      buildStudentBlocks(filtered);
      if (resultArea) resultArea.style.display = "block";
      updateOverallStats();
      
      showToast(`Loaded ${filtered.length} students for ${year} · ${term}`, "success");
    });
  }

  function buildStudentBlocks(students) {
    if (!studentBlocksContainer) return;
    studentBlocksContainer.innerHTML = "";

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      const initials = student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      const safeSid = safeId(student.id);

      const scores = loadScores();
      const studentScores = [];
      subjects.forEach(subj => {
        const key = scoreKey(student.id, subj);
        const score = scores[key];
        if (score !== undefined && score !== "") {
          studentScores.push(score);
        }
      });
      const currentGPA = calculateGPA(studentScores);
      const gpaLetter = getLetterGradeFromGPA(currentGPA);

      const block = document.createElement("div");
      block.className = "student-block";
      block.id = "block-" + safeSid;

      const header = document.createElement("div");
      header.className = "student-block-header";
      header.innerHTML = `
        <div class="s-left">
          <div class="s-avatar">${escapeHtml(initials)}</div>
          <div>
            <div class="s-name">${escapeHtml(student.name)}</div>
            <div class="s-id">${escapeHtml(student.id)} · ${escapeHtml(student.major)}</div>
          </div>
        </div>
        <div class="s-right">
          <span class="s-avg-chip" id="avg-${safeSid}">GPA: ${currentGPA.toFixed(2)} (${gpaLetter})</span>
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

      header.addEventListener("click", () => {
        block.classList.toggle("collapsed");
      });

      const rowsDiv = document.createElement("div");
      rowsDiv.className = "subject-rows";

      subjects.forEach((subj, idx) => {
        const key = scoreKey(student.id, subj);
        const existing = scores[key] !== undefined ? scores[key] : "";
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
            <input type="number" id="${inputId}" min="0" max="100" step="1"
              value="${existing}" placeholder="Enter score"
              data-sid="${student.id}" data-subj="${escapeHtml(subj)}"
              data-gradeid="${gradeId}" data-blockid="block-${safeSid}">
          </div>
          <div><div class="grade-pill ${gClass}" id="${gradeId}">${grade}</div></div>
        `;

        rowsDiv.appendChild(row);
      });

      block.appendChild(header);
      block.appendChild(rowsDiv);
      studentBlocksContainer.appendChild(block);

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

  function onScoreInput(e) {
    const input = e.target;
    const sid = input.dataset.sid;
    const subj = input.dataset.subj;
    const gradeId = input.dataset.gradeid;
    const val = input.value.trim();

    input.classList.remove("score-error");
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 100)) {
      input.classList.add("score-error");
      showToast("Score must be between 0 and 100", "error");
      return;
    }

    const grade = getGrade(val);
    const gEl = document.getElementById(gradeId);
    if (gEl) {
      gEl.textContent = grade;
      gEl.className = "grade-pill " + gradeClass(grade);
    }

    const scores = loadScores();
    const key = scoreKey(sid, subj);
    if (val === "" || isNaN(parseFloat(val))) {
      delete scores[key];
    } else {
      scores[key] = parseFloat(val);
    }
    saveScores(scores);

    if (currentSession) {
      const student = currentSession.students.find((x) => x.id === sid);
      if (student) refreshStudentProgress(student);
    }
    updateOverallStats();
    
    input.style.borderColor = "var(--ok)";
    setTimeout(() => { if (input) input.style.borderColor = ""; }, 500);
  }

  function onScoreBlur(e) {
    const input = e.target;
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      const clamped = Math.min(100, Math.max(0, val));
      if (clamped !== val) {
        input.value = clamped;
        input.dispatchEvent(new Event("input"));
      }
    }
  }

  function refreshStudentProgress(student) {
    const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
    const scores = loadScores();
    const safeSid = safeId(student.id);

    let filled = 0;
    let studentScores = [];
    
    subjects.forEach((subj) => {
      const v = scores[scoreKey(student.id, subj)];
      if (v !== undefined && v !== "") {
        filled++;
        studentScores.push(v);
      }
    });

    const total = subjects.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    const gpa = calculateGPA(studentScores);
    const gpaLetter = getLetterGradeFromGPA(gpa);

    const pbar = document.getElementById("pbar-" + safeSid);
    const pcount = document.getElementById("pcount-" + safeSid);
    const avgEl = document.getElementById("avg-" + safeSid);

    if (pbar) pbar.style.width = pct + "%";
    if (pcount) pcount.textContent = `${filled}/${total}`;
    if (avgEl) avgEl.textContent = `GPA: ${gpa.toFixed(2)} (${gpaLetter})`;
  }

  function updateOverallStats() {
    if (!currentSession) return;

    const scores = loadScores();
    const students = currentSession.students;

    let entered = 0;
    let total = 0;
    let allScores = [];

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      subjects.forEach((subj) => {
        total++;
        const v = scores[scoreKey(student.id, subj)];
        if (v !== undefined && v !== "") {
          entered++;
          allScores.push(v);
        }
      });
    });

    const pct = total > 0 ? Math.round((entered / total) * 100) : 0;
    const overallGPA = calculateGPA(allScores);
    const overallGpaLetter = getLetterGradeFromGPA(overallGPA);
    
    if (overallBar) overallBar.style.width = pct + "%";
    if (progressText) progressText.innerHTML = `${entered} / ${total} scores | GPA: ${overallGPA.toFixed(2)} (${overallGpaLetter})`;
    if (progressPct) progressPct.textContent = `${pct}%`;
  }

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

  if (btnSaveDraft) {
    btnSaveDraft.addEventListener("click", () => {
      if (!currentSession) {
        showToast("No session loaded. Please select year and term first.", "error");
        return;
      }
      
      const drafts = loadDrafts();
      const key = `${currentSession.year}|${currentSession.term}`;
      const idx = drafts.findIndex((d) => d.key === key);
      const draft = {
        key, year: currentSession.year, term: currentSession.term,
        savedAt: new Date().toISOString(), studentCount: currentSession.students.length,
      };
      if (idx >= 0) drafts[idx] = draft;
      else drafts.push(draft);
      saveDrafts(drafts);
      showToast("Draft saved successfully.", "success");
    });
  }

  if (btnPublish) {
    btnPublish.addEventListener("click", () => {
      if (!currentSession) {
        showToast("No session loaded. Please select year and term first.", "error");
        return;
      }
      
      const scores = loadScores();
      let allScores = [];
      currentSession.students.forEach((student) => {
        const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
        subjects.forEach((subj) => {
          const v = scores[scoreKey(student.id, subj)];
          if (v !== undefined && v !== "") allScores.push(v);
        });
      });
      const overallGPA = calculateGPA(allScores);
      const overallGpaLetter = getLetterGradeFromGPA(overallGPA);
      
      const isUpdate = currentSession.isPublished;
      const confirmText = document.getElementById("publish-confirm-text");
      if (confirmText) {
        confirmText.innerHTML = `${isUpdate ? 'Update' : 'Publish'} results for ${currentSession.year}, ${currentSession.term}?<br><strong>Overall GPA: ${overallGPA.toFixed(2)} (${overallGpaLetter})</strong><br>This action will ${isUpdate ? 'replace previously published' : 'finalize the'} results.`;
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
        key, year: currentSession.year, term: currentSession.term,
        publishedAt: new Date().toISOString(), studentCount: currentSession.students.length,
        lastUpdated: new Date().toISOString(),
      };
      
      if (idx >= 0) {
        published[idx] = entry;
        showSessionNotice('success', 'Results Updated', `${currentSession.year} · ${currentSession.term} results have been successfully updated.`);
      } else {
        published.push(entry);
        showSessionNotice('success', 'Results Published', `${currentSession.year} · ${currentSession.term} results have been successfully published.`);
      }
      savePublished(published);
      saveDrafts(loadDrafts().filter((d) => d.key !== key));
      closeModal("modal-publish-confirm");
      
      currentSession.isPublished = true;
      if (resultTitle) resultTitle.textContent = `Score Entry — ${currentSession.year} · ${currentSession.term} (Published - Editable)`;
    });
  }

  document.querySelectorAll(".modal-overlay").forEach((o) => {
    o.addEventListener("click", (e) => {
      if (e.target === o) o.classList.remove("open");
    });
  });

  checkForDraftOnLoad();
});

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}