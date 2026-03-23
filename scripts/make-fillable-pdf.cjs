// UW Manor — Fillable Rental Application PDF
// All field positions hardcoded to prevent any overlap

const { PDFDocument, rgb, StandardFonts, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');

const GREEN      = rgb(0.173, 0.290, 0.243);
const GOLD       = rgb(0.788, 0.663, 0.380);
const GOLD_LIGHT = rgb(0.910, 0.835, 0.659);
const CREAM      = rgb(0.980, 0.973, 0.957);
const FIELD_BG   = rgb(0.955, 0.955, 0.955);
const FIELD_BDR  = rgb(0.680, 0.680, 0.680);
const LABEL_CLR  = rgb(0.380, 0.380, 0.380);
const TEXT_CLR   = rgb(0.150, 0.150, 0.150);
const WHITE      = rgb(1, 1, 1);

async function build() {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const form = doc.getForm();

  const B = await doc.embedFont(StandardFonts.HelveticaBold);
  const R = await doc.embedFont(StandardFonts.Helvetica);

  let fc = 0; // unique field counter

  // ── Helpers ──────────────────────────────────────────────────────────────

  const txt = (str, x, y, size, font, color) =>
    page.drawText(str, { x, y, size, font: font||R, color: color||TEXT_CLR });

  // Draw a section bar at given y (y = bottom of bar)
  function sectionBar(label, y) {
    page.drawRectangle({ x:36, y, width:540, height:14, color:CREAM, borderColor:GOLD_LIGHT, borderWidth:0.5 });
    page.drawRectangle({ x:36, y, width:4,   height:14, color:GOLD });
    txt(label.toUpperCase(), 50, y+3.5, 7.5, B, GREEN);
  }

  // Draw one input field (y = bottom of field)
  function inp(name, label, x, y, w) {
    const h = 15;
    if (label) txt(label, x+2, y+h+2, 6, R, LABEL_CLR);
    page.drawRectangle({ x, y, width:w, height:h, color:FIELD_BG, borderColor:FIELD_BDR, borderWidth:0.5 });
    const tf = form.createTextField('f' + (++fc) + '_' + name);
    tf.addToPage(page, { x:x+2, y:y+2, width:w-4, height:h-4, borderWidth:0, backgroundColor:FIELD_BG });
    tf.setFontSize(8);
  }

  // ── Page chrome ───────────────────────────────────────────────────────────

  // Top header band
  page.drawRectangle({ x:0, y:762, width:612, height:30, color:GREEN });
  page.drawRectangle({ x:0, y:760, width:612, height:2,  color:GOLD  });
  txt('UW MANOR  –  Student Rental Application  –  5048 17th Ave NE, Seattle WA 98105  –  uwmanor@gmail.com',
    38, 771, 7, R, GOLD_LIGHT);

  // Title block
  page.drawRectangle({ x:0, y:702, width:612, height:56, color:GREEN });
  page.drawRectangle({ x:0, y:700, width:612, height:2,  color:GOLD  });
  txt('UW MANOR',                    38, 740, 22, B, GOLD);
  txt('STUDENT RENTAL APPLICATION',  38, 720, 12, B, GOLD_LIGHT);
  txt('5048 17th Ave NE  ·  Seattle, WA 98105  ·  706-603-0022  ·  uwmanor@gmail.com',
    38, 706, 7.5, R, GOLD_LIGHT);

  // Bottom footer band
  page.drawRectangle({ x:0, y:0, width:612, height:16, color:GREEN });
  page.drawRectangle({ x:0, y:16, width:612, height:1.5, color:GOLD });
  txt('uwmanor@gmail.com  ·  706-603-0022  ·  5048 17th Ave NE, Seattle WA 98105',
    140, 5, 6.5, R, GOLD_LIGHT);

  // ── Layout constants ──────────────────────────────────────────────────────
  // All Y values measured from BOTTOM of page (PDF default).
  // Each section bar is 14pt tall.
  // Each field row: 6pt label space + 15pt field = 21pt total visual height.
  // Row spacing (bottom of one field to bottom of next): 23pt.
  // Gap between last field and next section bar: 10pt.
  // Gap between section bar and first field bottom: 23pt.

  // Working from top down. Start just below title:
  // Title bottom = 702. First section bar top = 692.
  // First section bar: top=692, bottom=692-14=678.

  // SECTION 1: Applicant Information — bar bottom = 678
  sectionBar('Applicant Information', 678);
  // First field bottom = 678 - 23 = 655
  inp('groupName','Name of Group (Sorority / Fraternity or group leader)', 36, 655, 540);

  // Row 2: Name | UW Status  — bottom = 655 - 23 = 632
  inp('name',     'Full Name',          36,  632, 342);
  inp('uwStatus', 'UW Student Status', 384,  632, 192);

  // Row 3: DOB | Phone | Email  — bottom = 632 - 23 = 609
  inp('dob',   'Date of Birth',  36,  609, 148);
  inp('phone', 'Phone',         190,  609, 148);
  inp('email', 'Email',         344,  609, 232);

  // Row 4: Current Address  — bottom = 609 - 23 = 586
  inp('addr1', 'Current Address', 36, 586, 540);

  // Row 5: City | State | ZIP | Rent | How Long  — bottom = 586 - 23 = 563
  inp('city1',  'City',          36,  563, 196);
  inp('state1', 'State',        238,  563,  62);
  inp('zip1',   'ZIP Code',     306,  563,  86);
  inp('rent1',  'Monthly Rent', 398,  563,  90);
  inp('long1',  'How Long?',    494,  563,  82);

  // Row 6: Previous Address  — bottom = 563 - 23 = 540
  inp('addr2', 'Previous Address', 36, 540, 540);

  // Row 7: City | State | ZIP | Rent | How Long  — bottom = 540 - 23 = 517
  inp('city2',  'City',          36,  517, 196);
  inp('state2', 'State',        238,  517,  62);
  inp('zip2',   'ZIP Code',     306,  517,  86);
  inp('rent2',  'Monthly Rent', 398,  517,  90);
  inp('long2',  'How Long?',    494,  517,  82);

  // SECTION 2: Emergency Contact — bar bottom = 517 - 10 - 14 = 493
  sectionBar('Emergency Contact', 493);
  // First field bottom = 493 - 23 = 470
  inp('ecName', 'Name of Person Not Residing With You', 36, 470, 540);

  // Row: Address — bottom = 470 - 23 = 447
  inp('ecAddr', 'Address', 36, 447, 540);

  // Row: City | State | ZIP | Phone | Relationship — bottom = 447 - 23 = 424
  inp('ecCity',  'City',          36,  424, 170);
  inp('ecState', 'State',        212,  424,  60);
  inp('ecZip',   'ZIP Code',     278,  424,  80);
  inp('ecPhone', 'Phone',        364,  424, 100);
  inp('ecRel',   'Relationship', 470,  424, 106);

  // SECTION 3: Parent Information — bar bottom = 424 - 10 - 14 = 400
  sectionBar('Parent Information', 400);
  // First field bottom = 400 - 23 = 377
  inp('par1name',  'Parent / Guardian Name',  36,  377, 342);
  inp('par1phone', 'Phone',                  384,  377, 192);

  // Row — bottom = 377 - 23 = 354
  inp('par2name',  'Parent / Guardian Name',  36,  354, 342);
  inp('par2phone', 'Phone',                  384,  354, 192);

  // Row: Address — bottom = 354 - 23 = 331
  inp('parAddr', 'Current Address', 36, 331, 540);

  // Row: City | State | ZIP — bottom = 331 - 23 = 308
  inp('parCity',  'City',      36,  308, 278);
  inp('parState', 'State',    320,  308,  62);
  inp('parZip',   'ZIP Code', 388,  308,  86);

  // Row: Mother Email | Father Email — bottom = 308 - 23 = 285
  inp('emailMom', "Mother's Email",  36,  285, 264);
  inp('emailDad', "Father's Email", 312,  285, 264);

  // SECTION 4: References — bar bottom = 285 - 10 - 14 = 261
  sectionBar('References', 261);
  // Column headers (no label above — draw headers manually)
  txt('Name',    38,  261-10, 6, R, LABEL_CLR);
  txt('Address', 200, 261-10, 6, R, LABEL_CLR);
  txt('Phone',   470, 261-10, 6, R, LABEL_CLR);

  // Ref row 1 — bottom = 261 - 20 = 241
  inp('ref1name', '', 36,  241, 158);
  inp('ref1addr', '', 200, 241, 264);
  inp('ref1ph',   '', 470, 241, 106);

  // Ref row 2 — bottom = 241 - 20 = 221
  inp('ref2name', '', 36,  221, 158);
  inp('ref2addr', '', 200, 221, 264);
  inp('ref2ph',   '', 470, 221, 106);

  // Ref row 3 — bottom = 221 - 20 = 201
  inp('ref3name', '', 36,  201, 158);
  inp('ref3addr', '', 200, 201, 264);
  inp('ref3ph',   '', 470, 201, 106);

  // ── Certification box — bottom = 201 - 10 = 191, height 24 ───────────────
  page.drawRectangle({ x:36, y:167, width:540, height:24,
    color:CREAM, borderColor:GOLD_LIGHT, borderWidth:0.75 });
  txt('I certify that the information provided on this form is correct.',
    44, 176, 8, R, TEXT_CLR);

  // Signature | Date — bottom = 167 - 23 = 144
  inp('signature', 'Typewritten Signature of Applicant', 36,  144, 396);
  inp('date',      'Date',                              438,  144, 138);

  // ── Footer note ───────────────────────────────────────────────────────────
  page.drawLine({ start:{x:36, y:136}, end:{x:576, y:136}, thickness:0.75, color:GOLD });
  txt('Please include a copy of your University of Washington Student ID and your Driver\'s License or Passport with each application.',
    36, 124, 7.5, B, GREEN);
  txt('Once all group members have completed their applications, submit them together as one package to uwmanor@gmail.com.',
    36, 112, 7.5, R, TEXT_CLR);

  // ── Save ──────────────────────────────────────────────────────────────────
  const bytes = await doc.save();
  fs.writeFileSync('public/Student-Rental-Application.pdf', bytes);
  console.log('Saved — ' + Math.round(bytes.length/1024) + ' KB, fields: ' +
    form.getFields().length);
}

build().catch(console.error);
