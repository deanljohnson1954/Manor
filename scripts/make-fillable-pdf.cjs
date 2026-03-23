// UW Manor — Fillable Rental Application PDF
// Professional redesign: forest green + warm gold, clean field styling

const { PDFDocument, rgb, StandardFonts, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');

const GREEN      = rgb(0.173, 0.290, 0.243);  // #2c4a3e
const GREEN_DARK = rgb(0.102, 0.176, 0.145);  // #1a2d25
const GOLD       = rgb(0.788, 0.663, 0.380);  // #c9a961
const GOLD_LIGHT = rgb(0.910, 0.835, 0.659);  // #e8d5a8
const CREAM      = rgb(0.980, 0.973, 0.957);  // #faf8f4
const GRAY_FIELD = rgb(0.965, 0.965, 0.965);
const GRAY_LINE  = rgb(0.780, 0.780, 0.780);
const BLACK      = rgb(0.15, 0.15, 0.15);
const WHITE      = rgb(1, 1, 1);

async function build() {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([612, 864]); // slightly taller for breathing room
  const form = doc.getForm();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);

  // ── drawing helpers ──────────────────────────────────────────────────────

  const t = (str, x, y, size, font, color) =>
    page.drawText(str, { x, y, size: size||9, font: font||reg, color: color||BLACK });

  // Section heading: gold left bar + green text label
  function section(label, x, y, w) {
    // full-width light cream background
    page.drawRectangle({ x, y, width: w, height: 18, color: CREAM });
    // gold left accent bar
    page.drawRectangle({ x, y, width: 4, height: 18, color: GOLD });
    // bottom border line
    page.drawLine({ start:{x, y}, end:{x:x+w, y}, thickness: 0.75, color: GOLD });
    t(label.toUpperCase(), x+12, y+5, 8, bold, GREEN);
  }

  // Labeled input field
  function field(name, label, x, y, w, h) {
    // light field background
    page.drawRectangle({ x, y, width: w, height: h, color: GRAY_FIELD,
      borderColor: GRAY_LINE, borderWidth: 0.5 });
    // small label above
    if (label) t(label, x+2, y+h+2, 6.5, reg, rgb(0.4,0.4,0.4));
    const f = form.createTextField(name);
    f.addToPage(page, { x:x+2, y:y+2, width:w-4, height:h-4,
      borderWidth:0, backgroundColor: GRAY_FIELD });
    f.setFontSize(9);
    return f;
  }

  const L = 36;   // left margin
  const R = 576;  // right edge
  const W = R - L; // content width = 540

  // ── HEADER ───────────────────────────────────────────────────────────────
  // green header bar
  page.drawRectangle({ x:0, y:810, width:612, height:54, color: GREEN });
  // gold accent line under header
  page.drawRectangle({ x:0, y:808, width:612, height:2, color: GOLD });

  t('UW MANOR', 36, 845, 20, bold, GOLD);
  t('STUDENT RENTAL APPLICATION', 36, 826, 10, bold, GOLD_LIGHT);
  t('5048 17th Ave NE  |  Seattle, WA 98105  |  206-858-2843  |  uwmanor@gmail.com',
    36, 815, 7.5, reg, GOLD_LIGHT);

  // ── BODY ─────────────────────────────────────────────────────────────────
  let y = 796;

  // ── Applicant Information ─────────────────────────────────────────────
  section('Applicant Information', L, y, W);
  y -= 26;
  field('groupName',  'Name of Group (Sorority / Fraternity, or group leader)', L, y, W, 18);

  y -= 26;
  field('name',       'Full Name',             L,       y, 320, 18);
  field('uwStatus',   'UW Student Status',     L+328,   y, W-328, 18);

  y -= 26;
  field('dob',        'Date of Birth',         L,       y, 190, 18);
  field('phone',      'Phone',                 L+198,   y, 162, 18);
  field('email',      'Email',                 L+368,   y, W-368, 18);

  y -= 26;
  field('address1',   'Current Address',       L,       y, W, 18);

  y -= 26;
  field('city1',      'City',                  L,       y, 220, 18);
  field('state1',     'State',                 L+228,   y, 80,  18);
  field('zip1',       'ZIP Code',              L+316,   y, 100, 18);
  field('rent1',      'Monthly Rent',          L+424,   y, 72,  18);
  field('howLong1',   'How Long?',             L+504,   y, W-504, 18);

  y -= 26;
  field('prevAddress','Previous Address',      L,       y, W, 18);

  y -= 26;
  field('city2',      'City',                  L,       y, 220, 18);
  field('state2',     'State',                 L+228,   y, 80,  18);
  field('zip2',       'ZIP Code',              L+316,   y, 100, 18);
  field('rent2',      'Monthly Rent',          L+424,   y, 72,  18);
  field('howLong2',   'How Long?',             L+504,   y, W-504, 18);

  // ── Emergency Contact ──────────────────────────────────────────────────
  y -= 12;
  section('Emergency Contact', L, y, W);
  y -= 26;
  field('ecName',     'Name of Person Not Residing With You', L, y, W, 18);

  y -= 26;
  field('ecAddress',  'Address',               L,       y, W, 18);

  y -= 26;
  field('ecCity',     'City',                  L,       y, 200, 18);
  field('ecState',    'State',                 L+208,   y, 80,  18);
  field('ecZip',      'ZIP Code',              L+296,   y, 100, 18);
  field('ecPhone',    'Phone',                 L+404,   y, 100, 18);
  field('ecRel',      'Relationship',          L+512,   y, W-512, 18);

  // ── Parent Information ─────────────────────────────────────────────────
  y -= 12;
  section('Parent Information', L, y, W);
  y -= 26;
  field('parentName1',  'Parent / Guardian Name',  L,     y, 340, 18);
  field('parentPhone1', 'Phone',                   L+348, y, W-348, 18);

  y -= 26;
  field('parentName2',  'Parent / Guardian Name',  L,     y, 340, 18);
  field('parentPhone2', 'Phone',                   L+348, y, W-348, 18);

  y -= 26;
  field('parentAddr',   'Parent Address',          L,     y, W, 18);

  y -= 26;
  field('parentCity',   'City',    L,       y, 220, 18);
  field('parentState',  'State',   L+228,   y, 80,  18);
  field('parentZip',    'ZIP Code',L+316,   y, 100, 18);
  field('parentEmailM', 'Mother\'s Email', L+424, y, W/2-20, 18);
  field('parentEmailF', 'Father\'s Email', L+424+(W/2-20)+8, y, W-(424+(W/2-20)+8), 18);

  // ── References ────────────────────────────────────────────────────────
  y -= 12;
  section('References', L, y, W);
  y -= 26;
  t('Name', L+2, y+20, 6.5, reg, rgb(0.4,0.4,0.4));
  t('Address', L+182, y+20, 6.5, reg, rgb(0.4,0.4,0.4));
  t('Phone', L+462, y+20, 6.5, reg, rgb(0.4,0.4,0.4));
  for (let i = 1; i <= 3; i++) {
    field(`refName${i}`,  '', L,     y, 172, 18);
    field(`refAddr${i}`,  '', L+180, y, 272, 18);
    field(`refPhone${i}`, '', L+460, y, W-460, 18);
    y -= 22;
  }

  // ── Certification ─────────────────────────────────────────────────────
  y -= 4;
  page.drawRectangle({ x:L, y:y-24, width:W, height:30,
    color: CREAM, borderColor: GOLD_LIGHT, borderWidth: 0.75 });
  t('I certify that the information provided on this form is correct.',
    L+8, y-10, 8.5, reg, BLACK);

  y -= 32;
  field('signature', 'Typewritten Signature of Applicant', L,     y, 400, 18);
  field('date',      'Date',                               L+408, y, W-408, 18);

  // ── Footer ────────────────────────────────────────────────────────────
  y -= 18;
  page.drawLine({ start:{x:L,y}, end:{x:R,y}, thickness:0.5, color:GOLD });
  y -= 10;
  t('Please include a copy of your University of Washington Student ID and Driver\'s License or Passport with each application.',
    L, y, 7.5, bold, GREEN);

  // ── Email button ──────────────────────────────────────────────────────
  y -= 20;
  const btnW = 240, btnH = 22, btnX = (612 - btnW) / 2;
  page.drawRectangle({ x:btnX, y, width:btnW, height:btnH,
    color:GREEN, borderColor:GOLD, borderWidth:1 });
  t('Email to uwmanor@gmail.com', btnX + 52, y + 7, 9, bold, GOLD);

  const btn = form.createButton('emailBtn');
  btn.addToPage('', page, { x:btnX, y, width:btnW, height:btnH,
    borderWidth:0, backgroundColor:GREEN });
  const widget = btn.acroField.getWidgets()[0];
  if (widget) {
    widget.dict.set(PDFName.of('A'), doc.context.obj({
      Type: PDFName.of('Action'),
      S:    PDFName.of('URI'),
      URI:  PDFString.of('mailto:uwmanor@gmail.com?subject=UW Manor Rental Application'),
    }));
  }

  // ── Green footer bar ──────────────────────────────────────────────────
  page.drawRectangle({ x:0, y:0, width:612, height:14, color:GREEN });
  page.drawRectangle({ x:0, y:14, width:612, height:2, color:GOLD });
  t('UW MANOR  |  5048 17th Ave NE, Seattle WA 98105  |  uwmanor@gmail.com  |  206-858-2843',
    80, 4, 6, reg, GOLD_LIGHT);

  const bytes = await doc.save();
  fs.writeFileSync('public/Student-Rental-Application.pdf', bytes);
  console.log('Done — ' + bytes.length + ' bytes');
}

build().catch(console.error);
