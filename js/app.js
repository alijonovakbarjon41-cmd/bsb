/**
 * BSB Baholash Tizimi - Korporativ Dastur Logikasi
 * Yangilangan mantiq:
 * 1. Har bir bosqich maksimal 10 ball (barcha 5 ta bosqich max = 10, jami = 50)
 * 2. Standart holatlarda (jami ball <= 46) 4 va 5-bosqichlar 8 dan oshmaydi
 * 3. Jami ball 46 dan oshganda (47, 48, 49, 50 ball) yoki bosqichlar 10 dan oshib ketmasligi uchun
 *    4 va 5-bosqich ballari 8 dan oshib, 9 yoki 10 gacha chiqishi mumkin (masalan, 49 -> 10, 10, 10, 10, 9; 50 -> 10, 10, 10, 10, 10)
 * 4. Hech qaysi bosqich hech qachon 10 balldan oshmaydi!
 */

(function () {
  "use strict";

  // Dasturning asosiy holati
  const state = {
    schoolInfo: {
      schoolName: "Mirzaobod tumani 14-maktab",
      quarter: "1",
      bsbNumber: "1",
      academicYear: "2025-2026",
      className: "5",
      subject: "Tabiiy fan",
      methodLeader: "Boboyeva N.",
      teacherName: "Shodmonqulova M."
    },
    // Har bir bosqich maksimal 10 ball (Jami = 50 ball)
    maxScores: [10, 10, 10, 10, 10],
    students: [], // Default holatda bo'sh
    statistics: null,
    theme: "light"
  };

  const STORAGE_KEY = "bsb_enterprise_state_v3";
  const THEME_KEY = "bsb_theme_preference";

  // ============================================================
  // 1. MAVZU (DARK / LIGHT MODE) BOSHQARUVI
  // ============================================================
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      state.theme = "dark";
    } else {
      state.theme = "light";
    }
    applyTheme(state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(state.theme);
    localStorage.setItem(THEME_KEY, state.theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("btnThemeToggle");
    if (!btn) return;

    if (theme === "dark") {
      btn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <span class="btn-label-text">Yorug' rejim</span>
      `;
      btn.title = "Yorug' rejimga o'tish";
    } else {
      btn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        <span class="btn-label-text">Tungi rejim</span>
      `;
      btn.title = "Tungi rejimga o'tish";
    }
  }

  // ============================================================
  // 2. YANGILANGAN RANDOM TAQSIMOT ALGORITMI
  // ============================================================
  /**
   * Jami ballni 5 ta bosqichga tasodifiy taqsimlaydi:
   * - Har bir bosqichning mutlaq maksimal qiymati 10 ball (maxScores[i])
   * - Odatdagi holatlarda (jami <= 46): 4 va 5-bosqich ballari maksimal 8 dan oshmaydi (s4 <= 8, s5 <= 8)
   * - Agar jami ball 46 dan oshsa (47, 48, 49, 50): boshqa bosqichlar 10 dan oshib ketmasligi uchun
   *   4 va 5-bosqichlar 8 dan oshib, 9 yoki 10 gacha ruxsat etiladi
   * - Jami ball = 50 bo'lganda: [10, 10, 10, 10, 10]
   * - Jami ball = 49 bo'lganda: [10, 10, 10, 10, 9] yoki [10, 10, 10, 9, 10]
   * - Butun sonlar va s1 + s2 + s3 + s4 + s5 = jami ball qat'iy saqlanadi
   */
  function distributeScore(total, maxScores) {
    const m = [
      Math.max(1, Number(maxScores[0]) || 10),
      Math.max(1, Number(maxScores[1]) || 10),
      Math.max(1, Number(maxScores[2]) || 10),
      Math.max(1, Number(maxScores[3]) || 10),
      Math.max(1, Number(maxScores[4]) || 10)
    ];

    const totalMax = m.reduce((a, b) => a + b, 0); // Odatda 50
    const clampedTotal = Math.max(0, Math.min(Number(total) || 0, totalMax));

    if (clampedTotal === 0) {
      return [0, 0, 0, 0, 0];
    }
    if (clampedTotal === totalMax) {
      return [...m]; // [10, 10, 10, 10, 10]
    }

    // Standart holatda 4 va 5-bosqichlar uchun chegara (8 ball)
    const stdLimit4 = Math.min(m[3], 8);
    const stdLimit5 = Math.min(m[4], 8);
    const standardSum = m[0] + m[1] + m[2] + stdLimit4 + stdLimit5; // masalan 10 + 10 + 10 + 8 + 8 = 46

    let effectiveLimits;

    if (clampedTotal <= standardSum) {
      // 46 yoki undan kam bo'lsa: 4 va 5-bosqichlar QAT'IY 8 dan oshmaydi!
      effectiveLimits = [m[0], m[1], m[2], stdLimit4, stdLimit5];
    } else {
      // 46 dan oshsa (47, 48, 49): oshib ketgan ballar 4 va 5-bosqichlarga o'tadi (10 gacha)
      const excess = clampedTotal - standardSum; // 47 da 1, 48 da 2, 49 da 3
      const canAbsorb4 = m[3] - stdLimit4; // 10 - 8 = 2
      const canAbsorb5 = m[4] - stdLimit5; // 10 - 8 = 2

      // Ortiqcha ballarni 4 va 5-bosqich o'rtasida tasodifiy taqsimlaymiz
      let add4 = 0;
      let add5 = 0;
      for (let i = 0; i < excess; i++) {
        if (add4 < canAbsorb4 && add5 < canAbsorb5) {
          if (Math.random() < 0.5) add4++;
          else add5++;
        } else if (add4 < canAbsorb4) {
          add4++;
        } else if (add5 < canAbsorb5) {
          add5++;
        }
      }

      effectiveLimits = [
        m[0],
        m[1],
        m[2],
        stdLimit4 + add4,
        stdLimit5 + add5
      ];
    }

    // Proportsional boshlang'ich taqsimot
    const effSum = effectiveLimits.reduce((a, b) => a + b, 0);
    const ratio = clampedTotal / effSum;
    const scores = [];

    for (let i = 0; i < 5; i++) {
      const lim = effectiveLimits[i];
      const jitter = (Math.random() * 2.4) - 1.2;
      let val = Math.round(ratio * lim + jitter);
      val = Math.max(0, Math.min(lim, val));
      scores.push(val);
    }

    // Yig'indi va farqni to'g'irlash
    let diff = clampedTotal - scores.reduce((a, b) => a + b, 0);
    let attempts = 0;

    while (diff !== 0 && attempts < 1000) {
      attempts++;
      if (diff > 0) {
        const candidates = [];
        for (let i = 0; i < 5; i++) {
          if (scores[i] < effectiveLimits[i]) {
            candidates.push(i);
          }
        }
        if (candidates.length === 0) break;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        scores[pick]++;
        diff--;
      } else {
        const candidates = [];
        for (let i = 0; i < 5; i++) {
          if (scores[i] > 0) {
            candidates.push(i);
          }
        }
        if (candidates.length === 0) break;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        scores[pick]--;
        diff++;
      }
    }

    // Yakuniy nazorat: hech bir bosqich 10 dan oshmasligi kafolatlanadi
    for (let i = 0; i < 5; i++) {
      scores[i] = Math.min(scores[i], m[i]);
    }

    return scores;
  }

  // ============================================================
  // 3. STATISTIKA VA HISOBLASHLAR
  // ============================================================
  function calculateStatistics() {
    const studentCount = state.students.length;
    const maxTotal = state.maxScores.reduce((a, b) => a + b, 0) || 50;

    if (studentCount === 0) {
      state.statistics = {
        count: 0,
        stageAverages: [0, 0, 0, 0, 0],
        totalAverage: 0,
        percentAverage: 0,
        stagePercentages: [0, 0, 0, 0, 0],
        grades: { excellent: 0, good: 0, satisfactory: 0, unsatisfactory: 0 },
        qualityPercent: 0,
        masteryPercent: 0
      };
      return;
    }

    const stageSums = [0, 0, 0, 0, 0];
    let totalSum = 0;
    let percentSum = 0;

    const grades = {
      excellent: 0,
      good: 0,
      satisfactory: 0,
      unsatisfactory: 0
    };

    state.students.forEach(student => {
      const currentTotal = student.scores.reduce((a, b) => a + b, 0);
      student.total = currentTotal;
      const pct = (currentTotal / maxTotal) * 100;

      for (let i = 0; i < 5; i++) {
        stageSums[i] += (student.scores[i] || 0);
      }
      totalSum += currentTotal;
      percentSum += pct;

      if (pct >= 85.5) {
        grades.excellent++;
      } else if (pct >= 70.5) {
        grades.good++;
      } else if (pct >= 55.5) {
        grades.satisfactory++;
      } else {
        grades.unsatisfactory++;
      }
    });

    const stageAverages = stageSums.map(sum => Math.round((sum / studentCount) * 100) / 100);
    const totalAverage = Math.round((totalSum / studentCount) * 100) / 100;
    const percentAverage = Math.round((percentSum / studentCount) * 100) / 100;

    const stagePercentages = stageAverages.map((avg, i) => {
      const maxVal = state.maxScores[i] || 10;
      return Math.round((avg / maxVal) * 10000) / 100;
    });

    const qualityPercent = Math.round(((grades.excellent + grades.good) / studentCount) * 1000) / 10;
    const masteryPercent = Math.round(((grades.excellent + grades.good + grades.satisfactory) / studentCount) * 1000) / 10;

    state.statistics = {
      count: studentCount,
      stageAverages,
      totalAverage,
      percentAverage,
      stagePercentages,
      grades,
      qualityPercent,
      masteryPercent
    };
  }

  // ============================================================
  // 4. INTERFEYSNI RENDER QILISH
  // ============================================================
  function renderAll() {
    calculateStatistics();
    renderHeaderInfo();
    renderMaxScoreInputs();
    renderStatisticsCards();
    renderStudentTable();
    saveToStorage();
  }

  function renderHeaderInfo() {
    document.getElementById("inputSchoolName").value = state.schoolInfo.schoolName;
    document.getElementById("inputQuarter").value = state.schoolInfo.quarter;
    document.getElementById("inputBsbNumber").value = state.schoolInfo.bsbNumber;
    document.getElementById("inputAcademicYear").value = state.schoolInfo.academicYear;
    document.getElementById("inputClassName").value = state.schoolInfo.className;
    document.getElementById("inputSubject").value = state.schoolInfo.subject;
    document.getElementById("inputMethodLeader").value = state.schoolInfo.methodLeader;
    document.getElementById("inputTeacherName").value = state.schoolInfo.teacherName;

    const fullTitle = `${state.schoolInfo.schoolName}  ${state.schoolInfo.quarter}- Chorak ${state.schoolInfo.bsbNumber}-BSB bo'yicha tahlil  (${state.schoolInfo.academicYear} o'quv yili)`;
    const elTitle = document.getElementById("tableLiveTitle");
    if (elTitle) elTitle.textContent = fullTitle;

    const elClassSubject = document.getElementById("tableClassSubject");
    if (elClassSubject) {
      elClassSubject.innerHTML = `<span>Sinf: <strong>${escapeHtml(state.schoolInfo.className)}</strong></span> &nbsp;•&nbsp; <span>Fan: <strong>${escapeHtml(state.schoolInfo.subject)}</strong></span>`;
    }

    const sigLeader = document.getElementById("sigMethodLeader");
    if (sigLeader) sigLeader.textContent = state.schoolInfo.methodLeader || "________________";

    const sigTeacher = document.getElementById("sigTeacherName");
    if (sigTeacher) sigTeacher.textContent = state.schoolInfo.teacherName || "________________";
  }

  function renderMaxScoreInputs() {
    for (let i = 0; i < 5; i++) {
      const input = document.getElementById(`maxStage${i + 1}`);
      if (input) {
        input.value = state.maxScores[i];
      }
    }
    const totalMax = state.maxScores.reduce((a, b) => a + b, 0);
    const badge = document.getElementById("totalMaxBadge");
    if (badge) badge.textContent = `Jami: ${totalMax} ball (100%)`;

    for (let i = 0; i < 5; i++) {
      const cell = document.getElementById(`tblHeaderMax${i + 1}`);
      if (cell) cell.textContent = state.maxScores[i];
    }
    const tblTotalMax = document.getElementById("tblHeaderMaxTotal");
    if (tblTotalMax) tblTotalMax.textContent = totalMax;
  }

  function renderStatisticsCards() {
    const stats = state.statistics;
    if (!stats) return;

    document.getElementById("statCount").textContent = stats.count;
    document.getElementById("statAvgScore").textContent = stats.totalAverage.toFixed(1);
    document.getElementById("statAvgPercent").textContent = `${stats.percentAverage.toFixed(1)}%`;
    document.getElementById("statQuality").textContent = `${stats.qualityPercent.toFixed(1)}%`;
    document.getElementById("statMastery").textContent = `${stats.masteryPercent.toFixed(1)}%`;

    const elGrade5 = document.getElementById("statGrade5");
    if (elGrade5) elGrade5.textContent = stats.grades.excellent;

    const elGrade4 = document.getElementById("statGrade4");
    if (elGrade4) elGrade4.textContent = stats.grades.good;

    const elGrade3 = document.getElementById("statGrade3");
    if (elGrade3) elGrade3.textContent = stats.grades.satisfactory;

    const elGrade2 = document.getElementById("statGrade2");
    if (elGrade2) elGrade2.textContent = stats.grades.unsatisfactory;
  }

  function renderStudentTable() {
    const tbody = document.getElementById("studentsTableBody");
    tbody.innerHTML = "";

    const maxTotal = state.maxScores.reduce((a, b) => a + b, 0) || 50;

    if (state.students.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state-row">
          <td colspan="10">
            <div class="empty-table-prompt">
              <svg class="icon icon-lg" style="width: 32px; height: 32px; stroke: var(--text-muted);" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div class="empty-prompt-title">Hozircha o'quvchilar ro'yxati bo'sh</div>
              <div class="empty-prompt-desc">Yuqoridagi shakl orqali o'quvchi F.I.O va Jami ballini kiriting yoki ro'yxatdan nusxalab joylang.</div>
            </div>
          </td>
        </tr>
      `;
      hideSummaryRows();
      return;
    }

    showSummaryRows();

    state.students.forEach((student, index) => {
      const tr = document.createElement("tr");
      tr.className = "student-data-row";
      tr.dataset.index = index;

      const pct = Math.round(((student.total || 0) / maxTotal) * 1000) / 10;
      const badgeClass = getBadgeClass(pct);

      tr.innerHTML = `
        <td class="col-index tabular-nums">${index + 1}</td>
        <td class="col-name">
          <input type="text" class="cell-edit-input" value="${escapeHtml(student.name)}" data-field="name" data-index="${index}" title="Tahrirlash uchun bosing" />
        </td>
        <td class="col-score-stage">
          <input type="number" min="0" max="${state.maxScores[0]}" class="cell-edit-input text-center tabular-nums" value="${student.scores[0]}" data-field="stage" data-stage="0" data-index="${index}" />
        </td>
        <td class="col-score-stage">
          <input type="number" min="0" max="${state.maxScores[1]}" class="cell-edit-input text-center tabular-nums" value="${student.scores[1]}" data-field="stage" data-stage="1" data-index="${index}" />
        </td>
        <td class="col-score-stage">
          <input type="number" min="0" max="${state.maxScores[2]}" class="cell-edit-input text-center tabular-nums" value="${student.scores[2]}" data-field="stage" data-stage="2" data-index="${index}" />
        </td>
        <td class="col-score-stage">
          <input type="number" min="0" max="${state.maxScores[3]}" class="cell-edit-input text-center tabular-nums" value="${student.scores[3]}" data-field="stage" data-stage="3" data-index="${index}" title="4-bosqich balli (maks. 10)" />
        </td>
        <td class="col-score-stage">
          <input type="number" min="0" max="${state.maxScores[4]}" class="cell-edit-input text-center tabular-nums" value="${student.scores[4]}" data-field="stage" data-stage="4" data-index="${index}" title="5-bosqich balli (maks. 10)" />
        </td>
        <td class="col-score-total">
          <input type="number" min="0" max="${maxTotal}" class="cell-edit-input text-center bold-score tabular-nums" value="${student.total}" data-field="total" data-index="${index}" title="Jami ballni o'zgartirsangiz bosqichlar qayta random taqsimlanadi" />
        </td>
        <td class="col-percent-badge">
          <span class="score-badge ${badgeClass}">${pct.toFixed(1)}%</span>
        </td>
        <td class="col-row-actions no-print">
          <div class="row-actions-group">
            <button class="row-action-btn" data-action="reroll" data-index="${index}" title="Bosqichlarni qayta taqsimlash">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button class="row-action-btn delete-btn" data-action="delete" data-index="${index}" title="O'quvchini o'chirish">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    renderSummaryRows();
  }

  function showSummaryRows() {
    const r1 = document.getElementById("rowAverageScore");
    const r2 = document.getElementById("rowAveragePercent");
    if (r1) r1.style.display = "";
    if (r2) r2.style.display = "";
  }

  function hideSummaryRows() {
    const r1 = document.getElementById("rowAverageScore");
    const r2 = document.getElementById("rowAveragePercent");
    if (r1) r1.style.display = "none";
    if (r2) r2.style.display = "none";
  }

  function renderSummaryRows() {
    const stats = state.statistics;
    if (!stats || stats.count === 0) return;

    for (let i = 0; i < 5; i++) {
      const avgCell = document.getElementById(`avgScoreStage${i + 1}`);
      if (avgCell) avgCell.textContent = stats.stageAverages[i].toFixed(2);

      const pctCell = document.getElementById(`avgPctStage${i + 1}`);
      if (pctCell) pctCell.textContent = `${stats.stagePercentages[i].toFixed(1)}%`;
    }

    const avgTotal = document.getElementById("avgScoreTotal");
    if (avgTotal) avgTotal.textContent = stats.totalAverage.toFixed(2);

    const avgPercent = document.getElementById("avgScorePercent");
    if (avgPercent) avgPercent.textContent = `${stats.percentAverage.toFixed(1)}%`;
  }

  function getBadgeClass(pct) {
    if (pct >= 85.5) return "score-badge-5";
    if (pct >= 70.5) return "score-badge-4";
    if (pct >= 55.5) return "score-badge-3";
    return "score-badge-2";
  }

  // ============================================================
  // 5. AMALLAR (ACTIONS)
  // ============================================================
  function handleAddStudent(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById("quickFioInput");
    const scoreInput = document.getElementById("quickScoreInput");

    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }

    const maxTotal = state.maxScores.reduce((a, b) => a + b, 0);
    let total = parseInt(scoreInput.value, 10);

    if (isNaN(total)) {
      scoreInput.focus();
      return;
    }

    if (total < 0) total = 0;
    if (total > maxTotal) {
      showToast(`Jami ball maksimal balldan (${maxTotal}) oshmasligi lozim! Ball ${maxTotal} ga moslashtirildi.`);
      total = maxTotal;
    }

    const scores = distributeScore(total, state.maxScores);

    state.students.push({
      id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name,
      scores,
      total
    });

    nameInput.value = "";
    scoreInput.value = "";
    nameInput.focus();

    renderAll();
    showToast(`${name} qo'shildi (${total} ball)`);
  }

  function handleRerollStudent(index) {
    const student = state.students[index];
    if (!student) return;

    student.scores = distributeScore(student.total, state.maxScores);
    renderAll();
    showToast(`${student.name} ballari qayta taqsimlandi`);
  }

  function handleRerollAll() {
    if (state.students.length === 0) return;

    state.students.forEach(student => {
      student.scores = distributeScore(student.total, state.maxScores);
    });

    renderAll();
    showToast("Barcha o'quvchilar ballari qayta taqsimlandi");
  }

  function handleDeleteStudent(index) {
    const student = state.students[index];
    if (!student) return;

    if (confirm(`"${student.name}" ro'yxatdan o'chirilsinmi?`)) {
      state.students.splice(index, 1);
      renderAll();
      showToast("O'quvchi o'chirildi");
    }
  }

  function handleClearAll() {
    if (state.students.length === 0) return;
    if (confirm("Jadvaldagi barcha o'quvchilar ro'yxati tozalansinmi?")) {
      state.students = [];
      renderAll();
      showToast("Jadval tozalandi");
    }
  }

  function handleTableInput(e) {
    const target = e.target;
    if (!target.classList.contains("cell-edit-input")) return;

    const index = parseInt(target.dataset.index, 10);
    const field = target.dataset.field;
    const student = state.students[index];
    if (!student) return;

    if (field === "name") {
      student.name = target.value.trim() || student.name;
      saveToStorage();
    } else if (field === "total") {
      const maxTotal = state.maxScores.reduce((a, b) => a + b, 0);
      let newTotal = parseInt(target.value, 10) || 0;
      if (newTotal < 0) newTotal = 0;
      if (newTotal > maxTotal) newTotal = maxTotal;

      student.total = newTotal;
      student.scores = distributeScore(newTotal, state.maxScores);
      renderAll();
    } else if (field === "stage") {
      const stageIdx = parseInt(target.dataset.stage, 10);
      let maxVal = state.maxScores[stageIdx] || 10;

      let val = parseInt(target.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      if (val > maxVal) {
        val = maxVal;
        target.value = val;
      }

      student.scores[stageIdx] = val;
      student.total = student.scores.reduce((a, b) => a + b, 0);
      renderAll();
    }
  }

  function handleMaxScoreChange(stageIndex, val) {
    let num = parseInt(val, 10) || 1;
    if (num > 50) num = 50;

    state.maxScores[stageIndex] = num;

    state.students.forEach(s => {
      s.scores = distributeScore(s.total, state.maxScores);
    });

    renderAll();
  }

  function handleSchoolInfoChange(field, value) {
    state.schoolInfo[field] = value;
    renderHeaderInfo();
    saveToStorage();
  }

  function handleBulkAdd(text) {
    const lines = text.split("\n");
    let addedCount = 0;
    const maxTotal = state.maxScores.reduce((a, b) => a + b, 0);

    lines.forEach(line => {
      let trimmed = line.trim();
      if (!trimmed) return;

      trimmed = trimmed.replace(/^\d+[\.\,\)\s]+/, "").trim();
      const match = trimmed.match(/^(.*?)[,\t\s]+(\d+)$/);
      let name = trimmed;
      let total = 0;

      if (match) {
        name = match[1].trim();
        total = parseInt(match[2], 10);
      } else {
        total = Math.round(maxTotal * (0.6 + Math.random() * 0.35));
      }

      total = Math.max(0, Math.min(total, maxTotal));
      const scores = distributeScore(total, state.maxScores);

      state.students.push({
        id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        name,
        scores,
        total
      });
      addedCount++;
    });

    renderAll();
    closeModal("bulkModal");
    showToast(`${addedCount} nafar o'quvchi ro'yxatga kiritildi`);
  }

  function loadPreset(presetName) {
    if (presetName === "tabiiy5") {
      state.schoolInfo = {
        schoolName: "Mirzaobod tumani 14-maktab",
        quarter: "1",
        bsbNumber: "1",
        academicYear: "2025-2026",
        className: "5",
        subject: "Tabiiy fan",
        methodLeader: "Boboyeva N.",
        teacherName: "Shodmonqulova M"
      };
      state.maxScores = [10, 10, 10, 10, 10];

      const rawList = [
        { name: "Abduazizova Ro’zigul", total: 39 },
        { name: "Abdullaxayev Bunyod", total: 29 },
        { name: "Abdullayev Ulug’bek", total: 31 },
        { name: "Alijonov Javlonbek", total: 34 },
        { name: "Baxtiyorov Umidjon", total: 31 },
        { name: "Boyyigitova Laziza", total: 33 },
        { name: "Erkinov Elshodbek", total: 36 },
        { name: "Fayzullayeva Parizoda", total: 33 },
        { name: "Ko’chkarova Marjona", total: 35 },
        { name: "Murodjonov Dostonbek", total: 35 },
        { name: "Nabijonova Nilufar", total: 37 },
        { name: "Quvondiqova Gulsanam", total: 40 },
        { name: "Salohiddinova Shabnam", total: 45 },
        { name: "Valiyeva Shodiyaxon", total: 28 },
        { name: "Xasanova Malikabonu", total: 45 },
        { name: "Xaydarqulov Beksulton", total: 27 },
        { name: "Yo’ldoshaliyeva Asaloy", total: 22 },
        { name: "Chimberdiyeva Yuzigul", total: 37 }
      ];

      state.students = rawList.map(item => ({
        id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        name: item.name,
        scores: distributeScore(item.total, state.maxScores),
        total: item.total
      }));

      renderAll();
      showToast("5-sinf (Tabiiy fan) namunasi yuklandi");
    } else if (presetName === "tarbiya9") {
      state.schoolInfo = {
        schoolName: "Mirzaobod tumani 14-maktab",
        quarter: "1",
        bsbNumber: "1",
        academicYear: "2025-2026",
        className: "9-sinf",
        subject: "Tarbiya va huquq",
        methodLeader: "Boboyeva. N",
        teacherName: "Xolmatov. O"
      };
      state.maxScores = [10, 10, 10, 10, 10];

      const rawList = [
        { name: "Abdunabiyev Z", total: 45 },
        { name: "Abdug'afforov S", total: 50 },
        { name: "Boyyigitov A", total: 50 },
        { name: "Ergashev H", total: 45 },
        { name: "Xasanov A", total: 45 },
        { name: "Xaydarqulov Sh", total: 45 },
        { name: "Jorayeva M", total: 45 },
        { name: "Komilova D", total: 45 },
        { name: "Muxtorova F", total: 45 },
        { name: "Ne'matullayev B", total: 45 },
        { name: "Nazirqulov S", total: 50 },
        { name: "To'gaymurodov L", total: 50 },
        { name: "Xaolboyeva S", total: 50 },
        { name: "Yo'ldasheva M", total: 45 },
        { name: "Yo'ldoshev M", total: 45 },
        { name: "Yo'ldosheva H", total: 50 },
        { name: "O'zbekboyev S", total: 45 },
        { name: "Boyyigitova A", total: 45 }
      ];

      state.students = rawList.map(item => ({
        id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        name: item.name,
        scores: distributeScore(item.total, state.maxScores),
        total: item.total
      }));

      renderAll();
      showToast("9-sinf (Tarbiya va huquq) namunasi yuklandi");
    }
  }

  // ============================================================
  // 6. LOCAL STORAGE
  // ============================================================
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schoolInfo: state.schoolInfo,
        maxScores: state.maxScores,
        students: state.students
      }));
      updateSaveIndicator();
    } catch (e) {
      console.warn("Xotiraga saqlashda xatolik:", e);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schoolInfo) state.schoolInfo = Object.assign(state.schoolInfo, parsed.schoolInfo);
        if (parsed.maxScores && Array.isArray(parsed.maxScores)) {
          state.maxScores = parsed.maxScores;
        }
        if (parsed.students && Array.isArray(parsed.students)) {
          state.students = parsed.students;
        }
        return true;
      }
    } catch (e) {
      console.warn("Xotiradan yuklashda xatolik:", e);
    }
    return false;
  }

  function updateSaveIndicator() {
    const el = document.getElementById("saveIndicatorTime");
    if (!el) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    el.textContent = timeStr;
  }

  // ============================================================
  // 7. MODALLAR VA BILDIRISHNOMA
  // ============================================================
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
  }

  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ============================================================
  // 8. TADBIRLARNI BOG'LASH
  // ============================================================
  function initEventListeners() {
    document.getElementById("btnThemeToggle")?.addEventListener("click", toggleTheme);

    const formQuickAdd = document.getElementById("quickAddForm");
    if (formQuickAdd) {
      formQuickAdd.addEventListener("submit", handleAddStudent);
    }

    const tblBody = document.getElementById("studentsTableBody");
    if (tblBody) {
      tblBody.addEventListener("input", handleTableInput);
      tblBody.addEventListener("click", e => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index, 10);
        if (action === "reroll") handleRerollStudent(index);
        if (action === "delete") handleDeleteStudent(index);
      });
    }

    for (let i = 0; i < 5; i++) {
      const input = document.getElementById(`maxStage${i + 1}`);
      if (input) {
        input.addEventListener("change", e => handleMaxScoreChange(i, e.target.value));
      }
    }

    const schoolInputs = [
      { id: "inputSchoolName", key: "schoolName" },
      { id: "inputQuarter", key: "quarter" },
      { id: "inputBsbNumber", key: "bsbNumber" },
      { id: "inputAcademicYear", key: "academicYear" },
      { id: "inputClassName", key: "className" },
      { id: "inputSubject", key: "subject" },
      { id: "inputMethodLeader", key: "methodLeader" },
      { id: "inputTeacherName", key: "teacherName" }
    ];
    schoolInputs.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.addEventListener("input", e => handleSchoolInfoChange(item.key, e.target.value));
      }
    });

    document.getElementById("btnRerollAll")?.addEventListener("click", handleRerollAll);
    document.getElementById("btnClearAll")?.addEventListener("click", handleClearAll);

    document.getElementById("btnPresetTabiiy")?.addEventListener("click", () => loadPreset("tabiiy5"));
    document.getElementById("btnPresetTarbiya")?.addEventListener("click", () => loadPreset("tarbiya9"));

    document.getElementById("btnExportExcel")?.addEventListener("click", () => {
      if (state.students.length === 0) {
        showToast("Eksport qilish uchun avval o'quvchilarni kiriting");
        return;
      }
      window.ExcelExporter.exportToExcel({
        schoolInfo: state.schoolInfo,
        maxScores: state.maxScores,
        students: state.students,
        statistics: state.statistics
      });
    });

    document.getElementById("btnExportOfflineXls")?.addEventListener("click", () => {
      if (state.students.length === 0) {
        showToast("Eksport qilish uchun avval o'quvchilarni kiriting");
        return;
      }
      window.ExcelExporter.exportToSpreadsheetXML({
        schoolInfo: state.schoolInfo,
        maxScores: state.maxScores,
        students: state.students,
        statistics: state.statistics
      });
    });

    document.getElementById("btnExportCSV")?.addEventListener("click", () => {
      if (state.students.length === 0) {
        showToast("Eksport qilish uchun avval o'quvchilarni kiriting");
        return;
      }
      window.ExcelExporter.exportToCSV({
        schoolInfo: state.schoolInfo,
        maxScores: state.maxScores,
        students: state.students,
        statistics: state.statistics
      });
    });

    document.getElementById("btnPrint")?.addEventListener("click", () => window.print());

    document.getElementById("btnOpenBulkModal")?.addEventListener("click", () => {
      openModal("bulkModal");
      document.getElementById("bulkTextarea")?.focus();
    });
    document.getElementById("btnCloseBulkModal")?.addEventListener("click", () => closeModal("bulkModal"));
    document.getElementById("btnCancelBulk")?.addEventListener("click", () => closeModal("bulkModal"));
    document.getElementById("btnSubmitBulk")?.addEventListener("click", () => {
      const text = document.getElementById("bulkTextarea")?.value || "";
      if (!text.trim()) return;
      handleBulkAdd(text);
      document.getElementById("bulkTextarea").value = "";
    });

    document.getElementById("btnToggleSettings")?.addEventListener("click", () => {
      const drawer = document.getElementById("settingsDrawer");
      if (drawer) {
        drawer.classList.toggle("open");
        const btn = document.getElementById("btnToggleSettings");
        btn.classList.toggle("btn-primary");
      }
    });

    window.addEventListener("click", e => {
      if (e.target.classList.contains("modal-backdrop")) {
        e.target.classList.remove("active");
      }
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeModal("bulkModal");
      }
    });
  }

  // ============================================================
  // 9. ISHGA TUSHIRISH
  // ============================================================
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
    loadFromStorage();
    renderAll();
  });

})();
