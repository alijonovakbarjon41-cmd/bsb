/**
 * BSB Baholash Tizimi - Excel Eksport Moduli
 * Senior dasturchi tomonidan yaratilgan:
 * 1. ExcelJS (.xlsx) orqali to'liq Excel formulali eksport:
 *    - =SUM(C6:G6)
 *    - =(H6/$H$5)*100
 *    - =AVERAGE(C6:C23)
 *    - =(C24/C$5)*100
 * 2. 100% Offline XML Spreadsheet 2003 (.xls) formulali eksport (Internet talab qilmaydi)
 * 3. CSV eksport
 */

const ExcelExporter = {
  /**
   * Asosiy eksport funksiyasi: ExcelJS mavjud bo'lsa .xlsx, bo'lmasa XML .xls formatida yuklaydi
   */
  async exportToExcel(data) {
    if (window.ExcelJS) {
      try {
        await this.exportWithExcelJS(data);
        return;
      } catch (err) {
        console.warn("ExcelJS orqali eksportda xatolik yuz berdi, XML fallback ishga tushirilmoqda:", err);
      }
    }
    // Agar ExcelJS bo'lmasa yoki xato bersa, offline XML Spreadsheet yuklanadi
    this.exportToSpreadsheetXML(data);
  },

  /**
   * 1. ExcelJS orqali rasmiy .xlsx fayl yaratish (formulalar va to'liq dizayn bilan)
   */
  async exportWithExcelJS(data) {
    const { schoolInfo, maxScores, students, statistics } = data;
    const maxTotal = maxScores.reduce((a, b) => a + b, 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "BSB Tahlil Pro";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("BSB Tahlil", {
      views: [{ showGridLines: true }]
    });

    // Ustun kengliklari
    worksheet.columns = [
      { width: 6 },  // A: №
      { width: 28 }, // B: F.I.O
      { width: 9 },  // C: 1-bosqich
      { width: 9 },  // D: 2-bosqich
      { width: 9 },  // E: 3-bosqich
      { width: 9 },  // F: 4-bosqich
      { width: 9 },  // G: 5-bosqich
      { width: 14 }, // H: Jami ball
      { width: 14 }  // I: Foiz %
    ];

    // Umumiy uslublar
    const borderThin = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      right: { style: "thin", color: { argb: "FFD1D5DB" } }
    };

    const borderHeader = {
      top: { style: "medium", color: { argb: "FF1E3A8A" } },
      left: { style: "thin", color: { argb: "FF93C5FD" } },
      bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
      right: { style: "thin", color: { argb: "FF93C5FD" } }
    };

    // 1-qator: Sarlavha (Mirzaobod tumani 14-maktab...)
    const titleText = `${schoolInfo.schoolName}  ${schoolInfo.quarter}- Chorak ${schoolInfo.bsbNumber}-BSB bo'yicha tahlil  (${schoolInfo.academicYear} o'quv yili)`;
    worksheet.mergeCells("A1:I1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = titleText;
    titleCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 26;

    // 2-qator: Sinf
    const r2 = worksheet.getRow(2);
    r2.getCell(2).value = "Sinf";
    r2.getCell(2).font = { name: "Calibri", size: 11, bold: true };
    r2.getCell(3).value = schoolInfo.className;
    r2.getCell(3).font = { name: "Calibri", size: 11, bold: true };
    r2.getCell(3).alignment = { horizontal: "center" };

    // 3-qator: Fan
    const r3 = worksheet.getRow(3);
    r3.getCell(2).value = "Fan";
    r3.getCell(2).font = { name: "Calibri", size: 11, bold: true };
    r3.getCell(3).value = schoolInfo.subject;
    r3.getCell(3).font = { name: "Calibri", size: 11, bold: true };
    r3.getCell(3).alignment = { horizontal: "center" };

    // 4-qator: Jadval ustun sarlavhalari
    const r4 = worksheet.getRow(4);
    r4.height = 24;
    const headers = ["№", "F.I.O", "1", "2", "3", "4", "5", "Jami ball", "Foiz %"];
    headers.forEach((h, idx) => {
      const cell = r4.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E40AF" } // Chuqur moviy rang
      };
      cell.alignment = {
        horizontal: idx === 1 ? "left" : "center",
        vertical: "middle"
      };
      cell.border = borderHeader;
    });

    // 5-qator: Maksimal ballar qatori
    const r5 = worksheet.getRow(5);
    r5.height = 20;
    const maxRowValues = ["", "", maxScores[0], maxScores[1], maxScores[2], maxScores[3], maxScores[4], maxTotal, 100];
    maxRowValues.forEach((val, idx) => {
      const cell = r5.getCell(idx + 1);
      cell.value = val;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF374151" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" } // Yumshoq kulrang
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderThin;
    });

    // 6..N: O'quvchilar qatorlari
    const startRow = 6;
    const studentCount = students.length;

    students.forEach((student, index) => {
      const currentRow = startRow + index;
      const row = worksheet.getRow(currentRow);
      row.height = 20;

      // №
      const c1 = row.getCell(1);
      c1.value = index + 1;
      c1.alignment = { horizontal: "center", vertical: "middle" };

      // F.I.O
      const c2 = row.getCell(2);
      c2.value = student.name;
      c2.alignment = { horizontal: "left", vertical: "middle" };

      // 1..5 bosqich ballari
      for (let s = 0; s < 5; s++) {
        const stageCell = row.getCell(3 + s);
        stageCell.value = student.scores[s] || 0;
        stageCell.alignment = { horizontal: "center", vertical: "middle" };
        stageCell.numFmt = "0";
      }

      // Jami ball - FORMULA: =SUM(C6:G6)
      const totalCell = row.getCell(8);
      totalCell.value = {
        formula: `SUM(C${currentRow}:G${currentRow})`,
        result: student.total
      };
      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: "center", vertical: "middle" };
      totalCell.numFmt = "0";

      // Foiz % - FORMULA: =(H6/$H$5)*100
      const pctCell = row.getCell(9);
      pctCell.value = {
        formula: `ROUND((H${currentRow}/$H$5)*100, 1)`,
        result: Math.round(((student.total || 0) / (maxTotal || 50)) * 1000) / 10
      };
      pctCell.font = { bold: true };
      pctCell.alignment = { horizontal: "center", vertical: "middle" };
      pctCell.numFmt = "0.0";

      // Fon rangi (zebra) va chegara
      const isEven = index % 2 === 1;
      for (let col = 1; col <= 9; col++) {
        const c = row.getCell(col);
        c.border = borderThin;
        if (isEven) {
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" }
          };
        }
      }
    });

    const lastStudentRow = startRow + studentCount - 1;

    // Agar o'quvchilar bo'lsa, O'rtacha hisoblash qatorlari qo'shiladi
    if (studentCount > 0) {
      // O'rtacha ball qatori
      const avgRowNum = lastStudentRow + 1;
      const avgRow = worksheet.getRow(avgRowNum);
      avgRow.height = 22;

      avgRow.getCell(1).value = "O'rtacha ball";
      worksheet.mergeCells(`A${avgRowNum}:B${avgRowNum}`);
      avgRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      avgRow.getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF1E3A8A" } };

      const colLetters = ["C", "D", "E", "F", "G", "H", "I"];
      colLetters.forEach((colLetter, idx) => {
        const cell = avgRow.getCell(3 + idx);
        cell.value = {
          formula: `AVERAGE(${colLetter}${startRow}:${colLetter}${lastStudentRow})`,
          result: statistics ? statistics.stageAverages[idx] : 0
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true, color: { argb: "FF1E3A8A" } };
        cell.numFmt = "0.00";
      });

      for (let col = 1; col <= 9; col++) {
        const c = avgRow.getCell(col);
        c.border = borderThin;
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEFF6FF" } // Yumshoq moviy
        };
      }

      // O'rtacha ko'rsatkich % da qatori
      const pctRowNum = avgRowNum + 1;
      const pctRow = worksheet.getRow(pctRowNum);
      pctRow.height = 22;

      pctRow.getCell(1).value = "O`rtacha ko`rsatkich % da";
      worksheet.mergeCells(`A${pctRowNum}:B${pctRowNum}`);
      pctRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      pctRow.getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF065F46" } };

      // C..G ustunlari bo'yicha: =(C_avg / C_max) * 100
      for (let s = 0; s < 5; s++) {
        const colLetter = colLetters[s];
        const cell = pctRow.getCell(3 + s);
        cell.value = {
          formula: `(${colLetter}${avgRowNum}/${colLetter}$5)*100`,
          result: statistics && statistics.stagePercentages ? statistics.stagePercentages[s] : 0
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true, color: { argb: "FF065F46" } };
        cell.numFmt = "0.00";
      }

      for (let col = 1; col <= 9; col++) {
        const c = pctRow.getCell(col);
        c.border = borderThin;
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFECFDF5" } // Yumshoq yashil
        };
      }

      // Imzolar bloki
      const sig1Row = pctRowNum + 3;
      const rSig1 = worksheet.getRow(sig1Row);
      rSig1.getCell(2).value = "Metod birlashma rahbari:";
      rSig1.getCell(2).font = { name: "Calibri", size: 11, bold: true };
      rSig1.getCell(4).value = schoolInfo.methodLeader || "";
      rSig1.getCell(4).font = { name: "Calibri", size: 11, italic: true };

      const sig2Row = sig1Row + 1;
      const rSig2 = worksheet.getRow(sig2Row);
      rSig2.getCell(2).value = "Fan o`qituvchi:";
      rSig2.getCell(2).font = { name: "Calibri", size: 11, bold: true };
      rSig2.getCell(4).value = schoolInfo.teacherName || "";
      rSig2.getCell(4).font = { name: "Calibri", size: 11, italic: true };
    }

    // Faylni generatsiya qilib yuklash
    const safeSubject = (schoolInfo.subject || "Fan").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    const safeClass = (schoolInfo.className || "Sinf").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    const fileName = `${safeClass}_${safeSubject}_${schoolInfo.bsbNumber || 1}-BSB_tahlil.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    this.downloadBlob(blob, fileName);
  },

  /**
   * 2. 100% Offline XML Spreadsheet 2003 (.xls) formatida eksport
   * Internet aloqasi bo'lmagan maktab kompyuterlarida ham formulali va to'liq ochiladi!
   */
  exportToSpreadsheetXML(data) {
    const { schoolInfo, maxScores, students, statistics } = data;
    const maxTotal = maxScores.reduce((a, b) => a + b, 0);
    const titleText = `${schoolInfo.schoolName}  ${schoolInfo.quarter}- Chorak ${schoolInfo.bsbNumber}-BSB bo'yicha tahlil  (${schoolInfo.academicYear} o'quv yili)`;

    const startRow = 6;
    const studentCount = students.length;
    const lastStudentRow = startRow + studentCount - 1;
    const avgRowNum = lastStudentRow + 1;
    const pctRowNum = avgRowNum + 1;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>BSB Tahlil Pro</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="MetaVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MaxRow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#374151"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellNormal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <NumberFormat ss:Format="0"/>
  </Style>
  <Style ss:ID="CellName">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
  </Style>
  <Style ss:ID="CellBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <NumberFormat ss:Format="0"/>
  </Style>
  <Style ss:ID="CellPct">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <NumberFormat ss:Format="0.0"/>
  </Style>
  <Style ss:ID="AvgStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E3A8A"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="0.00"/>
  </Style>
  <Style ss:ID="AvgLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E3A8A"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="PctStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="0.00"/>
  </Style>
  <Style ss:ID="PctLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="BSB Tahlil">
  <Table ss:ExpandedColumnCount="9" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="18">
   <Column ss:Width="35"/>
   <Column ss:Width="180"/>
   <Column ss:Width="50" ss:Span="4"/>
   <Column ss:Index="8" ss:Width="70"/>
   <Column ss:Width="70"/>

   <!-- 1-qator: Title -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="8" ss:StyleID="Title"><Data ss:Type="String">${this.escapeXml(titleText)}</Data></Cell>
   </Row>

   <!-- 2-qator: Sinf -->
   <Row>
    <Cell ss:Index="2" ss:StyleID="MetaLabel"><Data ss:Type="String">Sinf</Data></Cell>
    <Cell ss:StyleID="MetaVal"><Data ss:Type="String">${this.escapeXml(schoolInfo.className)}</Data></Cell>
   </Row>

   <!-- 3-qator: Fan -->
   <Row>
    <Cell ss:Index="2" ss:StyleID="MetaLabel"><Data ss:Type="String">Fan</Data></Cell>
    <Cell ss:StyleID="MetaVal"><Data ss:Type="String">${this.escapeXml(schoolInfo.subject)}</Data></Cell>
   </Row>

   <!-- 4-qator: Sarlavhalar -->
   <Row ss:Height="22">
    <Cell ss:StyleID="Header"><Data ss:Type="String">№</Data></Cell>
    <Cell ss:StyleID="HeaderLeft"><Data ss:Type="String">F.I.O</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">1</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">2</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">3</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">4</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">5</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Jami ball</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Foiz %</Data></Cell>
   </Row>

   <!-- 5-qator: Maksimal ballar -->
   <Row ss:Height="20">
    <Cell ss:StyleID="MaxRow"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxScores[0]}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxScores[1]}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxScores[2]}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxScores[3]}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxScores[4]}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">${maxTotal}</Data></Cell>
    <Cell ss:StyleID="MaxRow"><Data ss:Type="Number">100</Data></Cell>
   </Row>
`;

    // O'quvchilar qatorlari
    students.forEach((s, idx) => {
      const rowNum = startRow + idx;
      xml += `   <Row ss:Height="20">
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="CellName"><Data ss:Type="String">${this.escapeXml(s.name)}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${s.scores[0] || 0}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${s.scores[1] || 0}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${s.scores[2] || 0}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${s.scores[3] || 0}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="Number">${s.scores[4] || 0}</Data></Cell>
    <Cell ss:StyleID="CellBold" ss:Formula="=SUM(RC[-5]:RC[-1])"><Data ss:Type="Number">${s.total || 0}</Data></Cell>
    <Cell ss:StyleID="CellPct" ss:Formula="=ROUND((RC[-1]/R5C8)*100, 1)"><Data ss:Type="Number">${Math.round(((s.total || 0) / (maxTotal || 50)) * 1000) / 10}</Data></Cell>
   </Row>\n`;
    });

    // Statistik qatorlar
    if (studentCount > 0) {
      xml += `   <!-- O'rtacha ball -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="AvgLabel"><Data ss:Type="String">O'rtacha ball</Data></Cell>
    <Cell ss:Index="3" ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.stageAverages[0] : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.stageAverages[1] : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.stageAverages[2] : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.stageAverages[3] : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.stageAverages[4] : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.totalAverage : 0}</Data></Cell>
    <Cell ss:StyleID="AvgStyle" ss:Formula="=AVERAGE(R${startRow}C:R${lastStudentRow}C)"><Data ss:Type="Number">${statistics ? statistics.percentAverage : 0}</Data></Cell>
   </Row>

   <!-- O'rtacha ko'rsatkich % da -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="PctLabel"><Data ss:Type="String">O\`rtacha ko\`rsatkich % da</Data></Cell>
    <Cell ss:Index="3" ss:StyleID="PctStyle" ss:Formula="=(R[-1]C/R5C)*100"><Data ss:Type="Number">${statistics ? statistics.stagePercentages[0] : 0}</Data></Cell>
    <Cell ss:StyleID="PctStyle" ss:Formula="=(R[-1]C/R5C)*100"><Data ss:Type="Number">${statistics ? statistics.stagePercentages[1] : 0}</Data></Cell>
    <Cell ss:StyleID="PctStyle" ss:Formula="=(R[-1]C/R5C)*100"><Data ss:Type="Number">${statistics ? statistics.stagePercentages[2] : 0}</Data></Cell>
    <Cell ss:StyleID="PctStyle" ss:Formula="=(R[-1]C/R5C)*100"><Data ss:Type="Number">${statistics ? statistics.stagePercentages[3] : 0}</Data></Cell>
    <Cell ss:StyleID="PctStyle" ss:Formula="=(R[-1]C/R5C)*100"><Data ss:Type="Number">${statistics ? statistics.stagePercentages[4] : 0}</Data></Cell>
    <Cell ss:StyleID="PctStyle"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="PctStyle"><Data ss:Type="String"></Data></Cell>
   </Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Imzolar -->
   <Row>
    <Cell ss:Index="2" ss:StyleID="MetaLabel"><Data ss:Type="String">Metod birlashma rahbari:</Data></Cell>
    <Cell ss:Index="4"><Data ss:Type="String">${this.escapeXml(schoolInfo.methodLeader || "")}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:Index="2" ss:StyleID="MetaLabel"><Data ss:Type="String">Fan o\`qituvchi:</Data></Cell>
    <Cell ss:Index="4"><Data ss:Type="String">${this.escapeXml(schoolInfo.teacherName || "")}</Data></Cell>
   </Row>
`;
    }

    xml += `  </Table>
 </Worksheet>
</Workbook>`;

    const safeSubject = (schoolInfo.subject || "Fan").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    const safeClass = (schoolInfo.className || "Sinf").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    const fileName = `${safeClass}_${safeSubject}_${schoolInfo.bsbNumber || 1}-BSB_tahlil.xls`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
    this.downloadBlob(blob, fileName);
  },

  /**
   * 3. Standart CSV eksport (zahira va oddiy matnli ko'rinish)
   */
  exportToCSV(data) {
    const { schoolInfo, maxScores, students, statistics } = data;
    const maxTotal = maxScores.reduce((a, b) => a + b, 0);

    const titleText = `${schoolInfo.schoolName}  ${schoolInfo.quarter}- Chorak ${schoolInfo.bsbNumber}-BSB bo'yicha tahlil  (${schoolInfo.academicYear} o'quv yili)`;

    const lines = [
      `"${titleText}",,,,,,,,`,
      `,Sinf,"${schoolInfo.className}",,,,,,`,
      `,Fan,"${schoolInfo.subject}",,,,,,`,
      `№,F.I.O,1,2,3,4,5,Jami ball,Foiz %`,
      `,,${maxScores[0]},${maxScores[1]},${maxScores[2]},${maxScores[3]},${maxScores[4]},${maxTotal},100`
    ];

    students.forEach((s, idx) => {
      const pct = Math.round(((s.total || 0) / (maxTotal || 50)) * 1000) / 10;
      lines.push(`${idx + 1},"${s.name}",${s.scores[0]},${s.scores[1]},${s.scores[2]},${s.scores[3]},${s.scores[4]},${s.total},${pct}`);
    });

    if (students.length > 0 && statistics) {
      lines.push(`O'rtacha ball,,${statistics.stageAverages[0]},${statistics.stageAverages[1]},${statistics.stageAverages[2]},${statistics.stageAverages[3]},${statistics.stageAverages[4]},${statistics.totalAverage},${statistics.percentAverage}`);
      lines.push(`O\`rtacha ko\`rsatkich % da,,${statistics.stagePercentages[0]},${statistics.stagePercentages[1]},${statistics.stagePercentages[2]},${statistics.stagePercentages[3]},${statistics.stagePercentages[4]},,`);
      lines.push(`,,,,,,,,`);
      lines.push(`,,,,,,,,`);
      lines.push(`,Metod birlashma rahbari:,,${schoolInfo.methodLeader || ""},,,,,`);
      lines.push(`,Fan o\`qituvchi:,,${schoolInfo.teacherName || ""},,,,,`);
    }

    const csvContent = "\uFEFF" + lines.join("\r\n"); // BOM for UTF-8 in Excel
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const safeSubject = (schoolInfo.subject || "Fan").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    const safeClass = (schoolInfo.className || "Sinf").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
    this.downloadBlob(blob, `${safeClass}_${safeSubject}_${schoolInfo.bsbNumber || 1}-BSB_tahlil.csv`);
  },

  escapeXml(unsafe) {
    if (unsafe == null) return "";
    return String(unsafe).replace(/[<>&'"]/g, c => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
      }
    });
  },

  downloadBlob(blob, fileName) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

window.ExcelExporter = ExcelExporter;
