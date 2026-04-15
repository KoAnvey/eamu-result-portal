// a_createResult.js
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
  const warningBanner = document.getElementById("already-published-warning");

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
          showToast(`Loaded draft for ${year} · ${term}`, "success");
        }, 100);
      }
    }
  }

  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      const year = selYear.value;
      const term = selTerm.value;

      if (!year || !term) {
        showToast("Please select both year and term.", "error");
        return;
      }

      const isPublished = isSessionPublished(year, term);
      
      if (isPublished) {
        if (warningBanner) warningBanner.style.display = "block";
        showToast(`Results for ${year} · ${term} are already published and cannot be modified.`, "error");
      } else {
        if (warningBanner) warningBanner.style.display = "none";
      }

      const all = loadStudents();
      const filtered = all.filter((s) => s.year === year && s.term === term);

      if (resultArea) resultArea.style.display = "none";
      if (noStudentsMsg) noStudentsMsg.style.display = "none";

      if (filtered.length === 0) {
        if (noStudentsMsg) noStudentsMsg.style.display = "block";
        showToast(`No students found for ${year} · ${term}. Please add students first.`, "error");
        return;
      }

      currentSession = { year, term, students: filtered, isPublished };
      
      if (resultTitle) resultTitle.textContent = `Score Entry — ${year} · ${term}`;
      if (studentCountBadge) studentCountBadge.textContent = `${filtered.length} student${filtered.length > 1 ? "s" : ""}`;

      buildStudentBlocks(filtered, isPublished);
      if (resultArea) resultArea.style.display = "block";
      updateOverallStats();
      
      if (!isPublished) {
        showToast(`Loaded ${filtered.length} students for ${year} · ${term}. Enter scores below.`, "success");
      }
    });
  }

  function buildStudentBlocks(students, isPublished) {
    if (!studentBlocksContainer) return;
    studentBlocksContainer.innerHTML = "";

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      const initials = student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      const safeSid = safeId(student.id);
      const blockId = "block-" + safeSid;

      const block = document.createElement("div");
      block.className = "student-block";
      block.id = blockId;

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

      header.addEventListener("click", () => {
        block.classList.toggle("collapsed");
      });

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
              data-blockid="${blockId}"
              ${isPublished ? 'disabled style="opacity:0.6;"' : ''}>
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

      if (!isPublished) {
        subjects.forEach((subj) => {
          const inputId = "inp-" + safeSid + "-" + safeId(subj);
          const input = document.getElementById(inputId);
          if (input) {
            input.addEventListener("input", onScoreInput);
            input.addEventListener("blur", onScoreBlur);
          }
        });
      }

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

  function updateOverallStats() {
    if (!currentSession) return;

    const scores = loadScores();
    const students = currentSession.students;

    let entered = 0;
    let total = 0;

    students.forEach((student) => {
      const subjects = getSubjectsForYearTerm(student.major, student.year, student.term);
      subjects.forEach((subj) => {
        total++;
        const v = scores[scoreKey(student.id, subj)];
        if (v !== undefined && v !== "") {
          entered++;
        }
      });
    });

    const pct = total > 0 ? Math.round((entered / total) * 100) : 0;
    
    if (overallBar) overallBar.style.width = pct + "%";
    if (progressText) progressText.textContent = `${entered} / ${total} scores entered`;
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
      
      if (currentSession.isPublished) {
        showToast("Cannot save draft for already published results.", "error");
        return;
      }
      
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

  if (btnPublish) {
    btnPublish.addEventListener("click", () => {
      if (!currentSession) {
        showToast("No session loaded. Please select year and term first.", "error");
        return;
      }
      
      if (currentSession.isPublished) {
        showToast(`Results for ${currentSession.year} · ${currentSession.term} are already published.`, "error");
        return;
      }
      
      const confirmText = document.getElementById("publish-confirm-text");
      if (confirmText) {
        confirmText.textContent = `Publish all results for ${currentSession.year}, ${currentSession.term}? This will finalize the results and they will appear in Published Results.`;
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

      saveDrafts(loadDrafts().filter((d) => d.key !== key));

      closeModal("modal-publish-confirm");
      showToast(`Results for ${currentSession.year} · ${currentSession.term} published successfully!`, "success");
      
      if (resultArea) resultArea.style.display = "none";
      currentSession = null;
      
      if (selYear) selYear.value = "";
      if (selTerm) selTerm.value = "";
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
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}