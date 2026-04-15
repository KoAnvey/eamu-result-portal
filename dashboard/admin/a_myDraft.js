// a_myDraft.js
document.addEventListener("DOMContentLoaded", () => {
  let deleteDraftKey = null;
 
  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      + " " + d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
  }
 
  function render() {
    const drafts = loadDrafts();
 
    // ── Drafts ──────────────────────────────────────────────
    const grid = document.getElementById("draft-grid");
    const empty = document.getElementById("draft-empty");
    const draftCount = document.getElementById("draft-count");
    
    if (draftCount) {
      draftCount.textContent = `${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`;
    }
 
    if (drafts.length === 0) {
      if (grid) grid.innerHTML = "";
      if (empty) empty.style.display = "flex";
      if (empty) empty.style.flexDirection = "column";
      if (empty) empty.style.alignItems = "center";
      if (empty) empty.style.justifyContent = "center";
    } else {
      if (empty) empty.style.display = "none";
      if (grid) {
        grid.innerHTML = drafts.map(d => `
          <div class="draft-card">
            <div class="draft-label">Draft · Unsaved</div>
            <div class="draft-title">${escapeHtml(d.year)} · ${escapeHtml(d.term)}</div>
            <div class="draft-meta">
              ${d.studentCount} student${d.studentCount !== 1 ? "s" : ""} &nbsp;·&nbsp; Saved ${formatDate(d.savedAt)}
            </div>
            <div class="draft-actions">
              <button class="btn btn-primary btn-sm" onclick="continueDraft('${d.key}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Continue Editing
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteDraft('${d.key}','${escapeHtml(d.year)} · ${escapeHtml(d.term)}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
                Delete
              </button>
            </div>
          </div>`).join("");
      }
    }
  }
 
  // Continue editing a draft - redirect to createResult with draft info
  window.continueDraft = (draftKey) => {
    sessionStorage.setItem("loadDraftKey", draftKey);
    window.location.href = "a_createResult.html";
  };
 
  window.deleteDraft = (key, label) => {
    deleteDraftKey = key;
    const delText = document.getElementById("del-draft-text");
    if (delText) delText.textContent = `Delete draft for "${label}"? Entered scores will remain saved.`;
    openModal("modal-del-draft");
  };
 
  const yesDeleteBtn = document.getElementById("btn-yes-del-draft");
  if (yesDeleteBtn) {
    yesDeleteBtn.addEventListener("click", () => {
      const drafts = loadDrafts().filter(d => d.key !== deleteDraftKey);
      saveDrafts(drafts);
      closeModal("modal-del-draft");
      render();
      showToast("Draft deleted.", "info");
    });
  }
 
  // Close modals on overlay click
  document.querySelectorAll(".modal-overlay").forEach(o => {
    o.addEventListener("click", e => { if (e.target === o) o.classList.remove("open"); });
  });
 
  render();
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