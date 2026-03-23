// UW Manor — Fillable Rental Application PDF (clean rebuild)

const { PDFDocument, rgb, StandardFonts, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');

// Colour palette matching the website
const GREEN      = rgb(0.173, 0.290, 0.243);   // #2c4a3e
const GOLD       = rgb(0.788, 0.663, 0.380);   // #c9a961
const GOLD_LIGHT = rgb(0.910, 0.835, 0.659);   // #e8d5a8
const CREAM      = rgb(0.980, 0.973, 0.957);   // #faf8f4
const FIELD_BG   = rgb(0.960, 0.960, 0.960);
const FIELD_BDR  = rgb(0.700, 0.700, 0.700);
const LABEL_CLR  = rgb(0.380, 0.380, 0.380);
const TEXT_CLR   = rgb(0.150, 0.150, 0.150);
const WHITE      = rgb(1, 1, 1);

async function build() {
  const doc  = await PDFDocument.create();
  const form = doc.getForm();

  // Use letter-size pages; add pages as needed
  function newPage() {
    const p = doc.addPage([612, 792]);
    // Green header strip
    p.drawRectangle({ x:0, y:762, width:612, height:30, color:GREEN });
    p.drawRectangle({ x:0, y:760, width:612, height:2,  color:GOLD  });
    p.drawText('UW MANOR  —  Student Rental Application  —  5048 17th Ave NE, Seattle WA 98105', {
      x:36, y:770, size:7.5, font:regFont, color:GOLD_LIGHT });
    // Green footer strip
    p.drawRectangle({ x:0, y:0,  width:612, height:16, color:GREEN });
    p.drawRectangle({ x:0, y:16, width:612, height:1.5, color:GOLD });
    p.drawText('uwmanor@gmail.com  |  206-858-2843', {
      x:220, y:4, size:7, font:regFont, color:GOLD_LIGHT });
    return p;
  }

  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont  = await doc.embedFont(StandardFonts.Helvetica);

  // ── Section heading helper ───────────────────────────────────────────────
  function section(page, label, x, y, w) {
    page.drawRectangle({ x, y, width:w, height:16, color:CREAM, borderColor:GOLD_LIGHT, borderWidth:0.5 });
    page.drawRectangle({ x, y, width:4, height:16, color:GOLD });
    page.drawText(label.toUpperCase(), { x:x+10, y:y+5, size:8, font:boldFont, color:GREEN });
  }

  // ── Single input field helper ────────────────────────────────────────────
  let fieldCount = 0;
  function field(page, name, label, x, y, w, h) {
    // background + border
    page.drawRectangle({ x, y, width:w, height:h, color:FIELD_BG, borderColor:FIELD_BDR, borderWidth:0.5 });
    // label text above field
    if (label) {
      page.drawText(label, { x:x+2, y:y+h+2, size:6.5, font:regFont, color:LABEL_CLR });
    }
    // PDF form field
    const tf = form.createTextField(name + '_' + (++fieldCount));
    tf.addToPage(page, { x:x+2, y:y+2, width:w-4, height:h-4, borderWidth:0, backgroundColor:FIELD_BG });
    tf.setFontSize(9);
    return tf;
  }

  // ── Row helper: draws several fields side-by-side given [{label,w},...] ──
  function row(page, specs, y, h, startX, totalW) {
    // specs: [{label, name, w}] where w is fraction of totalW or absolute px
    // Resolve widths
    const gap = 6;
    const n = specs.length;
    // if w is provided use it, else split equally
    const totalFixed = specs.reduce((s,sp) => s + (sp.w||0), 0);
    const flex = specs.filter(sp => !sp.w).length;
    const remaining = totalW - totalFixed - gap*(n-1);
    let x = startX;
    for (const sp of specs) {
      const w = sp.w || (remaining / flex);
      field(page, sp.name, sp.label, x, y, w, h);
      x += w + gap;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════
  const p1 = newPage();

  // Big title block below header
  p1.drawRectangle({ x:0, y:700, width:612, height:58, color:GREEN });
  p1.drawRectangle({ x:0, y:698, width:612, height:2, color:GOLD });
  p1.drawText('UW MANOR', { x:36, y:738, size:26, font:boldFont, color:GOLD });
  p1.drawText('STUDENT RENTAL APPLICATION', { x:36, y:718, size:13, font:boldFont, color:GOLD_LIGHT });
  p1.drawText('5048 17th Ave NE  ·  Seattle, WA 98105  ·  206-858-2843  ·  uwmanor@gmail.com',
    { x:36, y:705, size:8, font:regFont, color:GOLD_LIGHT });

  const L = 36, RW = 540, FH = 18, GAP = 10;
  let y = 688;

  // ── APPLICANT INFORMATION ─────────────────────────────────────────────
  y -= 4;
  section(p1, 'Applicant Information', L, y, RW);
  y -= (FH + GAP + 8); // room for label above

  row(p1, [
    { name:'groupName', label:'Name of Group (Sorority / Fraternity, or group leader)', w:RW }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'name',     label:'Full Name' },
    { name:'uwStatus', label:'UW Student Status', w:160 }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'dob',   label:'Date of Birth', w:160 },
    { name:'phone', label:'Phone',         w:160 },
    { name:'email', label:'Email Address'        }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'addr1', label:'Current Address' }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'city1',  label:'City'        },
    { name:'state1', label:'State', w:60 },
    { name:'zip1',   label:'ZIP',   w:80 },
    { name:'rent1',  label:'Monthly Rent', w:100 },
    { name:'long1',  label:'How Long?',    w:90  }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'addr2', label:'Previous Address' }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'city2',  label:'City'        },
    { name:'state2', label:'State', w:60 },
    { name:'zip2',   label:'ZIP',   w:80 },
    { name:'rent2',  label:'Monthly Rent', w:100 },
    { name:'long2',  label:'How Long?',    w:90  }
  ], y, FH, L, RW);
  y -= (16 + GAP);

  // ── EMERGENCY CONTACT ──────────────────────────────────────────────────
  section(p1, 'Emergency Contact', L, y, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'ecName', label:'Name of Person Not Residing With You' }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'ecAddr', label:'Address' }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'ecCity',  label:'City'              },
    { name:'ecState', label:'State',   w:60     },
    { name:'ecZip',   label:'ZIP',     w:80     },
    { name:'ecPhone', label:'Phone',   w:130    },
    { name:'ecRel',   label:'Relationship', w:120 }
  ], y, FH, L, RW);
  y -= (16 + GAP);

  // ── PARENT INFORMATION ─────────────────────────────────────────────────
  section(p1, 'Parent Information', L, y, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'par1name',  label:'Parent / Guardian Name' },
    { name:'par1phone', label:'Phone', w:150           }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'par2name',  label:'Parent / Guardian Name' },
    { name:'par2phone', label:'Phone', w:150           }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'parAddr', label:'Parent Address' }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'parCity',  label:'City'         },
    { name:'parState', label:'State', w:60  },
    { name:'parZip',   label:'ZIP',   w:80  }
  ], y, FH, L, RW);
  y -= (FH + GAP + 8);

  row(p1, [
    { name:'parEmailM', label:"Mother's Email" },
    { name:'parEmailF', label:"Father's Email" }
  ], y, FH, L, RW);
  y -= (16 + GAP);

  // ── REFERENCES ────────────────────────────────────────────────────────
  section(p1, 'References', L, y, RW);
  y -= 8;
  // column headers
  p1.drawText('Name', { x:L+2, y:y-2, size:6.5, font:regFont, color:LABEL_CLR });
  p1.drawText('Address', { x:L+182, y:y-2, size:6.5, font:regFont, color:LABEL_CLR });
  p1.drawText('Phone', { x:L+462, y:y-2, size:6.5, font:regFont, color:LABEL_CLR });
  y -= (FH - 2);
  for (let i = 1; i <= 3; i++) {
    row(p1, [
      { name:`ref${i}name`,  label:'', w:172 },
      { name:`ref${i}addr`,  label:'', w:270 },
      { name:`ref${i}phone`, label:'', w:92  }
    ], y, FH, L, RW);
    y -= (FH + 6);
  }

  // ── CERTIFICATION & SIGNATURE ─────────────────────────────────────────
  y -= 6;
  p1.drawRectangle({ x:L, y:y-4, width:RW, height:28,
    color:CREAM, borderColor:GOLD_LIGHT, borderWidth:0.75 });
  p1.drawText('I certify that the information provided on this form is correct.',
    { x:L+10, y:y+8, size:8.5, font:regFont, color:TEXT_CLR });
  y -= 32;

  row(p1, [
    { name:'signature', label:'Typewritten Signature of Applicant' },
    { name:'date',      label:'Date', w:120 }
  ], y, FH, L, RW);
  y -= (FH + 14);

  // ── FOOTER NOTE ───────────────────────────────────────────────────────
  p1.drawLine({ start:{x:L, y}, end:{x:L+RW, y}, thickness:0.75, color:GOLD });
  y -= 12;
  p1.drawText(
    'Please include a copy of your University of Washington Student ID and Driver\'s License or Passport with each application.',
    { x:L, y, size:7.5, font:boldFont, color:GREEN });
  y -= 14;
  p1.drawText(
    'Once all group members have completed their applications, submit them together as one package to uwmanor@gmail.com.',
    { x:L, y, size:7.5, font:regFont, color:TEXT_CLR });

  // ── SAVE ─────────────────────────────────────────────────────────────
  const bytes = await doc.save();
  fs.writeFileSync('public/Student-Rental-Application.pdf', bytes);
  console.log('Saved — ' + Math.round(bytes.length/1024) + ' KB');
}

build().catch(console.error);
