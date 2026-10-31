# BSB Baholash va Tahlil Tizimi (Enterprise Pro)

Umumiy o'rta ta'lim maktablari o'qituvchilari uchun BSB (Baholash / Nazorat ishlari) tahlilini avtomatlashtirish, bosqichlarni chegaralangan tasodifiy taqsimlash va hisobotlarni Excel formulalari asosida eksport qilish tizimi.

---

## Tizim Imkoniyatlari

1. **Jadval Strukturasi**:
   - Vazirlik va maktab o'quv bo'limi tomonidan tasdiqlangan rasmiy tahlil jadvali bilan 100% bir xil shaklda ishlaydi.
   - Sarlavha, Sinf, Fan, Bosqichlar maksimal ballari, O'quvchilar ro'yxati, O'rtacha ball, O'rtacha ko'rsatkich % da hamda mas'ul xodimlar imzolari qat'iy saqlangan.

2. **O'quvchi Kiritish va Bosqichlar Taqsimoti**:
   - O'qituvchi faqat o'quvchining F.I.O va Jami ballini kiritadi.
   - 1-dan 5-gacha bo'lgan bosqich ballari avtomatik ravishda tasodifiy (random) proporsional taqsimlanadi.
   - **Cheklov**: 4- va 5-bosqich ballari maksimal **8 balldan oshmaydi**.
   - 5 ta bosqich yig'indisi har doim kiritilgan Jami ballga qat'iy teng bo'ladi.
   - Istalgan vaqtda har bir o'quvchi yoki barcha o'quvchilar uchun bosqichlarni qayta taqsimlash mumkin.

3. **Interaktiv Tahrirlash (Inline Editing)**:
   - Jadvaldagi ixtiyoriy katakka to'g'ridan-to'g'ri bosib, ism yoki bosqich ballarini o'zgartirish mumkin.
   - Agar biror bosqich balli o'zgartirilsa, jami ball va foizlar bir lahzada qayta hisoblanadi.
   - Agar jami ball o'zgartirilsa, bosqichlar unga mos ravishda yangilanadi.

4. **Avtomatik Ko'rsatkichlar va Pedagogik Tahlil**:
   - Har bir bosqich bo'yicha sinf o'rtacha bali.
   - Har bir bosqich bo'yicha o'rtacha ko'rsatkich foizi.
   - Sifat ko'rsatkichi (4 va 5 baholar ulushi).
   - O'zlashtirish ko'rsatkichi (3, 4 va 5 baholar ulushi).
   - Baholar tahlili: A'lo (5), Yaxshi (4), Qoniqarli (3), Qoniqarsiz (2).

5. **Excel Eksport (Haqiqiy Formulalar Bilan)**:
   - Eksport qilingan `.xlsx` faylda hisob-kitoblar formula ko'rinishida yoziladi:
     - Jami ball: `=SUM(C6:G6)`
     - Foiz: `=(H6/$H$5)*100`
     - Ustunlar bo'yicha o'rtacha: `=AVERAGE(C6:C...)`
     - O'rtacha ko'rsatkich %: `=(C.../C$5)*100`
   - Shuningdek, internet aloqasi bo'lmagan sharoitda ham ishlaydigan formulali Offline Excel (`.xls`) va CSV formatlari taqdim etiladi.

6. **Tungi Rejim (Night Mode)**:
   - Tizim to'liq yorug' va qorong'u rejimlar (Dark/Light Mode) bilan ta'minlangan.
   - Foydalanuvchi tanlovi xotirada saqlanadi.

7. **To'liq Responsivlik va Chop Etish (Print)**:
   - Mobil qurilmalarda jadvalning № va F.I.O ustunlari qotirilgan (sticky) bo'lib, gorizontal surishda ham o'quvchi nomi ko'rinib turadi.
   - Bosma nusxa olish (`window.print`) vaqtida barcha boshqaruv tugmalari yashirilib, hujjat toza A4 varag'iga tayyorlanadi.

---

## Foydalanish Tartibi

1. `index.html` faylini brauzerda (Chrome, Edge, Firefox, Safari) oching.
2. Dastlab jadval bo'sh holatda ochiladi.
3. Kerak bo'lsa, "Sozlamalar" bo'limida maktab, sinf, fan va o'qituvchilar nomini to'g'rilang.
4. "O'quvchi qo'shish" maydonida o'quvchi F.I.O va Jami ballini kiritib `Enter` tugmasini bosing.
5. Tayyor jadvalni "Excel (.xlsx) yuklash" tugmasi orqali yuklab oling.

---

## Fayllar Tarkibi

- `index.html` — Tizimning asosiy boshqaruv paneli
- `css/style.css` — Korporativ dizayn, Dark/Light rejim va chop etish uslublari
- `js/app.js` — BSB hisob-kitoblari, random algoritmi va holat boshqaruvi
- `js/excel-export.js` — Excel formulalari va eksport generatori
- `README.md` — Tizim hujjatlari
