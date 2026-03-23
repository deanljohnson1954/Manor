// Generates a fillable PDF version of the UW Manor rental application
// with a Submit by Email button targeting uwmanor@gmail.com

const { PDFDocument, rgb, StandardFonts, PDFName, PDFString, PDFArray, PDFNumber, PDFRef } = require('pdf-lib');
const fs = require('fs');

async function build() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const form = doc.getForm();

  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg    = await doc.embedFont(StandardFonts.Helvetica);

  const BLACK  = rgb(0,0,0);
  const WHITE  = rgb(1,1,1);
  const DARK   = rgb(0.12,0.12,0.12);
  const BORDER = rgb(0.55,0.55,0.55);
  const GOLD   = rgb(0.78, 0.66, 0.38);

  // ── helpers ────────────────────────────────────────────────────────────────

  function text(str, x, y, size, font, color) {
    page.drawText(str, { x, y, size: size||9, font: font||reg, color: color||BLACK });
  }

  function sectionBar(label, x, y, w) {
    page.drawRectangle({ x, y, width: w, height: 15, color: DARK });
    text(label, x+6, y+4, 8.5, bold, WHITE);
  }

  function box(x, y, w, h) {
    page.drawRectangle({ x, y, width: w, height: h, color: WHITE,
      borderColor: BORDER, borderWidth: 0.5 });
  }

  function field(name, label, x, y, w, h) {
    box(x, y, w, h);
    if (label) text(label, x+2, y+h+1, 7, reg, BLACK);
    const f = form.createTextField(name);
    f.addToPage(page, { x: x+1, y: y+1, width: w-2, height: h-2,
      borderWidth: 0, backgroundColor: rgb(1,1,1) });
    f.setFontSize(8);
    return f;
  }

  // ── Title ─────────────────────────────────────────────────────────────────
  text('UW STUDENT RENTAL APPLICATION FOR', 118, 762, 15, bold);
  text('5048 17th Ave NE   Seattle, WA 98105', 145, 745, 13, bold);

  // ── Applicant Information ─────────────────────────────────────────────────
  let y = 726;
  sectionBar('Applicant Information', 30, y, 552);

  y -= 22;
  field('name',          'Name:',             30,  y, 330, 16);
  field('uwStatus',      'UW Student Status:', 370, y, 212, 16);

  y -= 22;
  field('dob',           'Date of birth:',    30,  y, 200, 16);
  field('phone',         'Phone:',            240, y, 342, 16);

  y -= 22;
  field('address1',      'Current address:',  30,  y, 320, 16);
  field('email',         'Email:',            360, y, 222, 16);

  y -= 22;
  field('city1',         'City:',             30,  y, 200, 16);
  field('state1',        'State:',            240, y, 120, 16);
  field('zip1',          'ZIP Code:',         370, y, 212, 16);

  y -= 22;
  field('rent1',         'Monthly rent:',     30,  y, 270, 16);
  field('howLong1',      'How long?',         310, y, 272, 16);

  y -= 22;
  field('prevAddress',   'Previous address:', 30,  y, 552, 16);

  y -= 22;
  field('city2',         'City:',             30,  y, 200, 16);
  field('state2',        'State:',            240, y, 120, 16);
  field('zip2',          'ZIP Code:',         370, y, 212, 16);

  y -= 22;
  field('rent2',         'Monthly rent:',     30,  y, 270, 16);
  field('howLong2',      'How long?',         310, y, 272, 16);

  // ── Emergency Contact ─────────────────────────────────────────────────────
  y -= 10;
  sectionBar('Emergency Contact', 30, y, 552);

  y -= 22;
  field('ecName',        'Name of a person not residing with you:', 30, y, 552, 16);

  y -= 22;
  field('ecAddress',     'Address:', 30, y, 552, 16);

  y -= 22;
  field('ecCity',        'City:',     30,  y, 170, 16);
  field('ecState',       'State:',    210, y, 100, 16);
  field('ecZip',         'ZIP Code:', 320, y, 110, 16);
  field('ecPhone',       'Phone:',    440, y, 142, 16);

  y -= 22;
  field('ecRel',         'Relationship:', 30, y, 552, 16);

  // ── Parent Information ────────────────────────────────────────────────────
  y -= 10;
  sectionBar('Parent Information', 30, y, 552);

  y -= 22;
  field('parentName1',   'Name:',   30,  y, 330, 16);
  field('parentPhone1',  'Phone:',  370, y, 212, 16);

  y -= 22;
  field('parentName2',   'Name:',   30,  y, 330, 16);
  field('parentPhone2',  'Phone:',  370, y, 212, 16);

  y -= 22;
  field('parentAddr',    'Current address:', 30, y, 552, 16);

  y -= 22;
  field('parentCity',    'City:',     30,  y, 200, 16);
  field('parentState',   'State:',    240, y, 120, 16);
  field('parentZip',     'ZIP Code:', 370, y, 212, 16);

  y -= 22;
  field('parentEmailM',  'Email (Mother):', 30,  y, 270, 16);
  field('parentEmailF',  'Email (Father):', 310, y, 272, 16);

  // ── References ────────────────────────────────────────────────────────────
  y -= 10;
  sectionBar('References', 30, y, 552);

  for (let i = 1; i <= 3; i++) {
    y -= 22;
    const lbl = i === 1 ? 'Name:' : '';
    const lbl2 = i === 1 ? 'Address:' : '';
    const lbl3 = i === 1 ? 'Phone:' : '';
    field(`refName${i}`,  lbl,  30,  y, 170, 16);
    field(`refAddr${i}`,  lbl2, 210, y, 260, 16);
    field(`refPhone${i}`, lbl3, 480, y, 102, 16);
  }

  // ── Certification ─────────────────────────────────────────────────────────
  y -= 18;
  page.drawRectangle({ x: 30, y: y-18, width: 552, height: 34,
    borderColor: BORDER, borderWidth: 0.5 });
  text('I certify that the information provided on this form is correct.', 36, y-4, 8.5, reg);

  y -= 28;
  field('signature', 'Typewritten Signature of Applicant:', 30,  y, 430, 16);
  field('date',      'Date:',                               470, y, 112, 16);

  // ── Footer note ───────────────────────────────────────────────────────────
  y -= 22;
  text('Please Include a Copy of Your Driver\'s License (Or Passport) and University of Washington Student ID',
    50, y, 8, bold);

  // ── Submit button ─────────────────────────────────────────────────────────
  y -= 24;
  const btnW = 220, btnH = 22;
  const btnX = (612 - btnW) / 2;
  page.drawRectangle({ x: btnX, y, width: btnW, height: btnH, color: DARK });
  text('Submit Application by Email - uwmanor@gmail.com', btnX + 14, y + 7, 8, bold, WHITE);

  // Wire up the button with a mailto action via raw PDF objects
  const submitBtn = form.createButton('submitBtn');
  submitBtn.addToPage('', page, { x: btnX, y, width: btnW, height: btnH,
    borderWidth: 0, backgroundColor: rgb(0.12,0.12,0.12) });

  // Attach a URI action to the button widget
  const btnField = submitBtn.acroField;
  const widgets  = btnField.getWidgets();
  if (widgets.length > 0) {
    const widget = widgets[0];
    const uriAction = doc.context.obj({
      Type: PDFName.of('Action'),
      S:    PDFName.of('URI'),
      URI:  PDFString.of('mailto:uwmanor@gmail.com?subject=UW Manor Rental Application'),
    });
    widget.dict.set(PDFName.of('A'), uriAction);
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const bytes = await doc.save();
  fs.writeFileSync('public/Student-Rental-Application.pdf', bytes);
  console.log('Done — saved fillable PDF (' + bytes.length + ' bytes)');
}

build().catch(console.error);
