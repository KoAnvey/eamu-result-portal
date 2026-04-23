document.addEventListener("DOMContentLoaded", () => {
  const students = loadStudents();
  const scores = loadScores();
  const drafts = loadDrafts();
  const published = loadPublished();

  document.getElementById("stat-students").textContent = students.length;

  let totalSubjects = 0;
  let subjectsByMajor = {};

  Object.keys(MAJORS).forEach(major => {
    const years = MAJORS[major];
    let majorSubjectCount = 0;
    
    Object.keys(years).forEach(year => {
      const terms = years[year];
      Object.keys(terms).forEach(term => {
        const subjectCount = terms[term].length;
        majorSubjectCount += subjectCount;
        totalSubjects += subjectCount;
      });
    });
    
    subjectsByMajor[major] = majorSubjectCount;
  });

  // Update Subjects Tracked with detailed tooltip
  const subjectsElement = document.getElementById("stat-subjects");
  subjectsElement.textContent = totalSubjects;
  subjectsElement.title = `Total subjects across ${MAJOR_KEYS.length} majors:\n${Object.entries(subjectsByMajor).map(([m, c]) => `${m}: ${c}`).join('\n')}`;

  // Update Scores Recorded
  const scoresCount = Object.keys(scores).length;
  document.getElementById("stat-scores").textContent = scoresCount;
  
  // Add title showing completion rate
  if (students.length > 0 && totalSubjects > 0) {
    const totalPossibleScores = students.length * (totalSubjects / MAJOR_KEYS.length);
    const completionRate = Math.round((scoresCount / totalPossibleScores) * 100);
    document.getElementById("stat-scores").title = `${completionRate}% completion rate`;
  }

  // Update Pending Drafts
  document.getElementById("stat-drafts").textContent = drafts.length;
  
  // Add published count to drafts stat title
  const publishedCount = published.length;
  document.getElementById("stat-drafts").title = `${drafts.length} drafts pending · ${publishedCount} sessions published`;

});