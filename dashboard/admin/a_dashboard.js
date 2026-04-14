// a_dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const students = loadStudents();
  const scores   = loadScores();
  const drafts   = loadDrafts();
 
  document.getElementById("stat-students").textContent = students.length;
 
  // count unique subjects across majors
  let totalSubjects = Object.values(MAJORS).reduce((s, arr) => s + arr.length, 0);
  document.getElementById("stat-subjects").textContent = totalSubjects;
 
  // count score entries
  document.getElementById("stat-scores").textContent = Object.keys(scores).length;
 
  // count drafts
  document.getElementById("stat-drafts").textContent = drafts.length;
});
 