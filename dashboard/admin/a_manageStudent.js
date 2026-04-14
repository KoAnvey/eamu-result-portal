// a_manageStudent.js
document.addEventListener("DOMContentLoaded", () => {
  let students = loadStudents();
  let editTargetId = null;
  let deleteTargetId = null;
  let pendingStudent = null;

  // Populate major selects
  const majorSelects = ["f-major", "e-major", "filter-major"];
  majorSelects.forEach((id) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    MAJOR_KEYS.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      sel.appendChild(opt);
    });
  });

  // ── Render Table ──────────────────────────────────────────
  function renderTable() {
    const tbody = document.getElementById("student-tbody");
    const empty = document.getElementById("empty-state");
    const search = document.getElementById("search-input").value.toLowerCase();
    const fMajor = document.getElementById("filter-major").value;
    const fYear = document.getElementById("filter-year").value;
    const fTerm = document.getElementById("filter-term").value;

    let filtered = students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search) ||
        s.id.toLowerCase().includes(search);
      const matchMajor = !fMajor || s.major === fMajor;
      const matchYear = !fYear || s.year === fYear;
      const matchTerm = !fTerm || s.term === fTerm;
      return matchSearch && matchMajor && matchYear && matchTerm;
    });

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "";
    } else {
      empty.style.display = "none";
      filtered.forEach((s, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="td-id">${i + 1}</td>
          <td class="td-id">${s.id}</td>
          <td class="td-name">${s.name}</td>
          <td>${s.dob || "—"}</td>
          <td><span class="badge badge-blue">${s.major}</span></td>
          <td>${s.year}</td>
          <td>${s.term}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn-icon" title="Edit" onclick="openEditModal('${s.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon" title="Delete" style="color:var(--danger);border-color:rgba(224,92,92,0.2);" onclick="openDeleteModal('${s.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          </td>`;
        tbody.appendChild(tr);
      });
    }
  }

  renderTable();

  // ── Filters ───────────────────────────────────────────────
  ["search-input", "filter-major", "filter-year", "filter-term"].forEach(
    (id) => {
      document.getElementById(id)?.addEventListener("input", renderTable);
      document.getElementById(id)?.addEventListener("change", renderTable);
    },
  );

  // ── Open Add Modal ────────────────────────────────────────
  document.getElementById("btn-add-student").addEventListener("click", () => {
    document.getElementById("add-student-form").reset();
    openModal("modal-add");
  });

  // ── Confirm button in add form ────────────────────────────
  document.getElementById("btn-confirm-add").addEventListener("click", () => {
    const id = document.getElementById("f-id").value.trim();
    const name = document.getElementById("f-name").value.trim();
    const dob = document.getElementById("f-dob").value;
    const gender = document.getElementById("f-gender").value;
    const major = document.getElementById("f-major").value;
    const year = document.getElementById("f-year").value;
    const term = document.getElementById("f-term").value;

    if (!id || !name || !dob || !major || !year || !term) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    if (students.some((s) => s.id === id)) {
      showToast("Enrollment ID already exists.", "error");
      return;
    }

    pendingStudent = { id, name, dob, gender, major, year, term };
    document.getElementById("confirm-add-text").textContent =
      `Register "${name}" (${id}) under ${major}, ${year}, ${term}?`;
    closeModal("modal-add");
    openModal("modal-confirm-add");
  });

  document.getElementById("btn-yes-add").addEventListener("click", () => {
    if (!pendingStudent) return;
    students.push(pendingStudent);
    saveStudents(students);
    pendingStudent = null;
    closeModal("modal-confirm-add");
    renderTable();
    showToast("Student registered successfully.", "success");
  });

  // ── Edit ──────────────────────────────────────────────────
  window.openEditModal = (id) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    editTargetId = id;
    document.getElementById("e-id").value = s.id;
    document.getElementById("e-name").value = s.name;
    document.getElementById("e-dob").value = s.dob;
    document.getElementById("e-gender").value = s.gender;
    document.getElementById("e-major").value = s.major;
    document.getElementById("e-year").value = s.year;
    document.getElementById("e-term").value = s.term;
    openModal("modal-edit");
  };

  document.getElementById("btn-save-edit").addEventListener("click", () => {
    const idx = students.findIndex((s) => s.id === editTargetId);
    if (idx === -1) return;
    students[idx].name = document.getElementById("e-name").value.trim();
    students[idx].dob = document.getElementById("e-dob").value;
    students[idx].gender = document.getElementById("e-gender").value;
    students[idx].major = document.getElementById("e-major").value;
    students[idx].year = document.getElementById("e-year").value;
    students[idx].term = document.getElementById("e-term").value;
    saveStudents(students);
    closeModal("modal-edit");
    renderTable();
    showToast("Student updated successfully.", "success");
  });

  // ── Delete ────────────────────────────────────────────────
  window.openDeleteModal = (id) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    deleteTargetId = id;
    document.getElementById("delete-text").textContent =
      `Remove "${s.name}" (${s.id})? This action cannot be undone.`;
    openModal("modal-delete");
  };

  document.getElementById("btn-yes-delete").addEventListener("click", () => {
    students = students.filter((s) => s.id !== deleteTargetId);
    saveStudents(students);
    closeModal("modal-delete");
    renderTable();
    showToast("Student removed.", "info");
  });

  // Close modals on overlay click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});
