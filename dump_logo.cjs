const fs = require('fs');

async function main() {
  const Jimp = (await import('jimp')).default; 
  try {
    const image = await Jimp.read('C:\\Users\\kanji\\.gemini\\antigravity\\brain\\26ba8626-b2b4-4a7f-8dd0-28b0b6eecb6c\\media__1773393413000.png');
    const { width, height } = image.bitmap;
    const cw = width / 120;
    const ch = height / 60;
    let out = '';
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < 120; x++) {
        let isDark = false;
        // Check average color in the downsampled grid to be accurate
        let r_sum=0, g_sum=0, b_sum=0, count=0;
        for(let dy=0; dy<ch; ++dy){
            for(let dx=0; dx<cw; ++dx){
                const px = image.getPixelColor(Math.floor(x*cw+dx), Math.floor(y*ch+dy));
                r_sum += (px >> 24) & 0xff;
                g_sum += (px >> 16) & 0xff;
                b_sum += (px >> 8) & 0xff;
                count++;
            }
        }
        if (count > 0) {
            const r_avg = r_sum/count;
            const g_avg = g_sum/count;
            const b_avg = b_sum/count;
            if (r_avg < 240 || g_avg < 240 || b_avg < 240) {
                out += '#';
            } else {
                out += ' ';
            }
        }
      }
      out += '\n';
    }
    fs.writeFileSync('logo_dump.txt', out);
    console.log('done');
  } catch(e) { console.error(e); }
}
main();
