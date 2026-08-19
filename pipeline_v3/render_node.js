// render_node.js — episode.json → kare kare PNG (deterministik, 30fps)
// kullanim: node render_node.js episode.json cikti_klasoru [fps]
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');
const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Baloo2.ttf');

if (fs.existsSync(fontPath)) registerFont(fontPath, { family: 'Baloo 2' });
const M = require(path.join(__dirname, '..', 'motor', 'motor.js'));

const [,, epPath, outDir, fpsArg] = process.argv;
const FPS = parseInt(fpsArg || '30', 10);
const EP = JSON.parse(fs.readFileSync(epPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const W = 720, H = 1280;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
M.init(ctx, W, H);

const total = M.totalDuration(EP);
const nFrames = Math.round(total * FPS);
console.log(`render: ${total.toFixed(2)}s, ${nFrames} kare @ ${FPS}fps`);
for (let f = 0; f < nFrames; f++) {
  const t = f / FPS;
  M.renderFrame(t, EP);
  fs.writeFileSync(path.join(outDir, `f${String(f).padStart(5, '0')}.png`),
                   canvas.toBuffer('image/png'));
  if (f % 120 === 0) console.log(`  kare ${f}/${nFrames}`);
}
console.log('render tamam');
