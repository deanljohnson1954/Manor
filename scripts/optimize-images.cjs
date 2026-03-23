const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg)$/i.test(f));

async function optimize() {
  let saved = 0;
  for (const file of files) {
    const fp = path.join(dir, file);
    const before = fs.statSync(fp).size;
    const tmp = fp + '.tmp';
    try {
      await sharp(fp)
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(tmp);
      const after = fs.statSync(tmp).size;
      fs.renameSync(tmp, fp);
      const pct = Math.round((1 - after / before) * 100);
      saved += (before - after);
      console.log(`${file}: ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB (${pct}% smaller)`);
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.error(`SKIP ${file}: ${e.message}`);
    }
  }
  console.log(`\nTotal saved: ${(saved/1024/1024).toFixed(1)} MB`);
}

optimize();
