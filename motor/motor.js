// ====================================================================
// FIKRA MOTORU v3 — onayli "Ya Tutarsa v2" cizim dili, modul halinde
// Hem node-canvas (render) hem tarayici (onizleme) ile calisir.
// ====================================================================
(function(root){
'use strict';
let ctx, W=720, H=1280;
const INK='#161616';

function init(c, w, h){ ctx=c; W=w||720; H=h||1280;
  if(!ctx.roundRect){ ctx.roundRect=function(x,y,w2,h2,r){
    this.moveTo(x+r,y); this.arcTo(x+w2,y,x+w2,y+h2,r); this.arcTo(x+w2,y+h2,x,y+h2,r);
    this.arcTo(x,y+h2,x,y,r); this.arcTo(x,y,x+w2,y,r); this.closePath(); return this; }; }
}

function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function easeInOut(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }
function easeOutBack(t){ const c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); }
function hexToRgb(hex){ hex=hex.replace('#',''); return {r:parseInt(hex.substr(0,2),16),g:parseInt(hex.substr(2,2),16),b:parseInt(hex.substr(4,2),16)}; }
function lerpColorHex(c1,c2,t){ const a=hexToRgb(c1), b=hexToRgb(c2);
  return 'rgb('+Math.round(lerp(a.r,b.r,t))+','+Math.round(lerp(a.g,b.g,t))+','+Math.round(lerp(a.b,b.b,t))+')'; }
function solveIK(px,py,tx,ty,l1,l2,bend){
  let dx=tx-px, dy=ty-py, dist=Math.sqrt(dx*dx+dy*dy);
  dist=Math.min(dist,l1+l2-0.01); dist=Math.max(dist,Math.abs(l1-l2)+0.01);
  const a1=Math.atan2(dy,dx), a2=Math.acos((l1*l1+dist*dist-l2*l2)/(2*l1*dist));
  const sA=a1+bend*a2;
  return {elbowX:px+Math.cos(sA)*l1, elbowY:py+Math.sin(sA)*l1};
}
function sketch(x1,y1,x2,y2,width,color,seed){
  ctx.strokeStyle=color; ctx.lineCap='round';
  for(let pass=0;pass<2;pass++){
    const jit=pass===0?0:1.0;
    const mx=(x1+x2)/2+Math.sin(seed*13+pass)*jit, my=(y1+y2)/2+Math.cos(seed*7+pass)*jit;
    ctx.lineWidth=width*(pass===0?1:0.5); ctx.globalAlpha=pass===0?1:0.28;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx,my,x2,y2); ctx.stroke();
  }
  ctx.globalAlpha=1;
}

const PAL = {
  sky:'#f6c977', skyLow:'#e8955a', skyTop:'#ffe3a1',
  nightTop:'#2c3a63', nightLow:'#5a4a72',
  wall:'#e4cfa5', wallShade:'#c9ad78',
  ground:'#c9a06a', groundShade:'#a97f4d', groundDark:'#8f6a40',
  hocaRobe:'#e8e2c8', hocaRobeShade:'#c4bc98', hocaSkin:'#e3b287', hocaSkinShade:'#c9986d',
  turban:'#f7f6ef', turbanShade:'#d9d6c6',
  salvar:'#7a5b3a', salvarShade:'#5e4429',
  kusak:'#a34432', kusakShade:'#7e3325',
  shoe:'#6e3c22', shoeShade:'#4e2915',
  tree:'#5a7a4a', treeShade:'#41613a', treeLight:'#78966a', treeTrunk:'#6b4a2f',
  lake:'#7aa8b8', lakeDeep:'#527f95', lakeShine:'#e8f3f2', lakeSun:'#ffd9a0',
  kazan:'#2b2b2b', kazanShine:'#4a4a4a', tencere:'#5a5a5a'
};

// ================= SAHNE KUTUPHANESI =================
function skyAndSun(warmth, night, sunX, sunY){
  const top = night ? PAL.nightTop : lerpColorHex(PAL.skyTop,'#f2b16b',warmth);
  const bot = night ? PAL.nightLow : lerpColorHex(PAL.sky,PAL.skyLow,warmth);
  const g=ctx.createLinearGradient(0,-300,0,H-520);
  g.addColorStop(0,top); g.addColorStop(1,bot);
  ctx.fillStyle=g; ctx.fillRect(-300,-300,W+600,H-220);
  if(night){
    ctx.fillStyle='#f4efd9';
    ctx.beginPath(); ctx.arc(sunX,sunY,36,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(200,195,170,0.5)';
    ctx.beginPath(); ctx.arc(sunX-10,sunY-6,7,0,Math.PI*2); ctx.arc(sunX+12,sunY+8,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    for(let i=0;i<26;i++){ const sx=((i*173)%(W+400))-200, sy=((i*97)%500)-250;
      ctx.globalAlpha=0.5+((i*37)%50)/100; ctx.fillRect(sx,sy,2.4,2.4); }
    ctx.globalAlpha=1;
  } else {
    const rg=ctx.createRadialGradient(sunX,sunY,10,sunX,sunY,150);
    rg.addColorStop(0,'rgba(255,236,190,0.95)'); rg.addColorStop(0.35,'rgba(255,214,140,0.55)');
    rg.addColorStop(1,'rgba(255,214,140,0)');
    ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(sunX,sunY,150,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffe9bd'; ctx.strokeStyle='rgba(200,150,80,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(sunX,sunY,42,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(255,246,225,0.8)';
    [[150,H-940,70],[240,H-925,50],[610,H-1010,60]].forEach(function(c){
      ctx.beginPath(); ctx.ellipse(c[0],c[1],c[2],c[2]*0.34,0,0,Math.PI*2); ctx.fill(); });
  }
}
function foreGround(gy, night){
  const gg=ctx.createLinearGradient(0,gy,0,H+300);
  const g1=night?'#8a7458':PAL.ground, g2=night?'#5e4c38':PAL.groundDark;
  gg.addColorStop(0,g1); gg.addColorStop(1,g2);
  ctx.fillStyle=gg; ctx.fillRect(-300,gy,W+600,H+600-gy);
  ctx.strokeStyle=night?'#4e3f2e':PAL.groundShade; ctx.lineWidth=2; ctx.globalAlpha=0.6;
  for(let x=-280;x<W+300;x+=70){ ctx.beginPath(); ctx.moveTo(x,gy+2); ctx.lineTo(x-24,H+280); ctx.stroke(); }
  ctx.globalAlpha=1;
  ctx.fillStyle='#9a7b52'; ctx.strokeStyle='rgba(60,45,28,0.6)'; ctx.lineWidth=1.4;
  [[80,gy+40,10,6],[380,gy+26,12,7],[610,gy+58,9,5],[250,gy+110,13,8]].forEach(function(s){
    ctx.beginPath(); ctx.ellipse(s[0],s[1],s[2],s[3],0,0,Math.PI*2); ctx.fill(); ctx.stroke(); });
}
function grassTufts(list, elapsed, night){
  ctx.strokeStyle=night?'#5e6e40':'#7d8f47'; ctx.lineWidth=2.4; ctx.lineCap='round';
  list.forEach(function(gpos,gi){ for(let b=-2;b<=2;b++){
    const sway=Math.sin(elapsed*1.1+gi+b)*2;
    ctx.beginPath(); ctx.moveTo(gpos[0],gpos[1]);
    ctx.quadraticCurveTo(gpos[0]+b*4+sway,gpos[1]-16,gpos[0]+b*7+sway,gpos[1]-26); ctx.stroke(); }});
}
function bigTree(x, gy, elapsed, night){
  ctx.fillStyle=PAL.treeTrunk; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(x-14,gy+10); ctx.quadraticCurveTo(x-20,gy-70,x-10,gy-140);
  ctx.lineTo(x+10,gy-140); ctx.quadraticCurveTo(x+20,gy-70,x+16,gy+10); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#523823'; ctx.lineWidth=1.5; ctx.globalAlpha=0.8;
  ctx.beginPath(); ctx.moveTo(x-6,gy-10); ctx.quadraticCurveTo(x-2,gy-70,x-4,gy-130);
  ctx.moveTo(x+6,gy-8); ctx.quadraticCurveTo(x+10,gy-64,x+8,gy-126); ctx.stroke(); ctx.globalAlpha=1;
  const sway=Math.sin(elapsed*0.5)*3;
  function blob(bx,by,rx,ry,f){ ctx.fillStyle=f; ctx.beginPath(); ctx.ellipse(bx+sway,by,rx,ry,0,0,Math.PI*2); ctx.fill(); }
  const shade=night?'#31492e':PAL.treeShade, main=night?'#40603c':PAL.tree, light=night?'#557a4c':PAL.treeLight;
  blob(x+4,gy-190,96,74,shade);
  blob(x-14,gy-210,80,62,main); blob(x+48,gy-180,58,48,main); blob(x-54,gy-172,52,44,main);
  blob(x-28,gy-230,44,32,light); blob(x+32,gy-208,36,26,light);
  ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.ellipse(x+sway,gy-196,98,76,0,0,Math.PI*2); ctx.stroke();
}
function mudHouse(x, gy, s, night){
  const wall=night?'#b09a76':PAL.wall, shade=night?'#8d7a58':PAL.wallShade;
  ctx.fillStyle=wall; ctx.strokeStyle=INK; ctx.lineWidth=3;
  ctx.fillRect(x,gy-300*s,300*s,300*s); ctx.strokeRect(x,gy-300*s,300*s,300*s);
  ctx.fillStyle=shade; ctx.fillRect(x,gy-300*s,300*s,18*s);
  ctx.fillStyle='#8a4f33';
  ctx.beginPath(); ctx.moveTo(x-20*s,gy-300*s); ctx.lineTo(x+150*s,gy-378*s); ctx.lineTo(x+320*s,gy-300*s);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#7a4a2a'; ctx.fillRect(x+118*s,gy-118*s,66*s,118*s);
  ctx.strokeRect(x+118*s,gy-118*s,66*s,118*s);
  ctx.strokeStyle='#5e3a20'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(x+151*s,gy-112*s); ctx.lineTo(x+151*s,gy-8*s); ctx.stroke();
  ctx.fillStyle=night?'#f4d98a':'#3a4a5a'; ctx.strokeStyle=INK; ctx.lineWidth=3;
  ctx.fillRect(x+40*s,gy-230*s,58*s,58*s); ctx.strokeRect(x+40*s,gy-230*s,58*s,58*s);
  ctx.beginPath(); ctx.moveTo(x+69*s,gy-230*s); ctx.lineTo(x+69*s,gy-172*s);
  ctx.moveTo(x+40*s,gy-201*s); ctx.lineTo(x+98*s,gy-201*s); ctx.stroke();
}

const SCENES = {
  lakeside: function(o){
    const e=o.elapsed, warmth=o.warmth, night=o.night;
    skyAndSun(warmth,night,560,H-820);
    ctx.fillStyle='rgba(180,140,95,0.55)';
    ctx.beginPath(); ctx.moveTo(-300,H-640); ctx.quadraticCurveTo(60,H-760,420,H-650);
    ctx.quadraticCurveTo(720,H-580,1020,H-640); ctx.lineTo(1020,H-540); ctx.lineTo(-300,H-540); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#caa565';
    ctx.beginPath(); ctx.moveTo(-300,H-600); ctx.quadraticCurveTo(200,H-690,560,H-600);
    ctx.quadraticCurveTo(820,H-545,1020,H-590); ctx.lineTo(1020,H-520); ctx.lineTo(-300,H-520); ctx.closePath(); ctx.fill();
    const wg=ctx.createLinearGradient(0,H-620,0,H-290);
    wg.addColorStop(0,night?'#54718c':PAL.lake); wg.addColorStop(1,night?'#37506b':PAL.lakeDeep);
    ctx.fillStyle=wg; ctx.fillRect(-300,H-620,W+600,330);
    if(!night){
      const rp=ctx.createLinearGradient(0,H-620,0,H-330);
      rp.addColorStop(0,'rgba(255,220,160,0.55)'); rp.addColorStop(1,'rgba(255,220,160,0)');
      ctx.fillStyle=rp; ctx.beginPath(); ctx.moveTo(534,H-620); ctx.lineTo(586,H-620);
      ctx.lineTo(630,H-330); ctx.lineTo(490,H-330); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=PAL.lakeSun; ctx.lineWidth=3;
      for(let i=0;i<6;i++){ const y=H-600+i*44, w2=20+i*7, off=Math.sin(e*1.3+i*1.7)*10;
        ctx.globalAlpha=0.7-i*0.08; ctx.beginPath(); ctx.moveTo(560-w2/2+off,y); ctx.lineTo(560+w2/2+off,y); ctx.stroke(); }
      ctx.globalAlpha=1;
    }
    ctx.strokeStyle=PAL.lakeShine; ctx.lineWidth=2.5; ctx.globalAlpha=0.55;
    for(let i=0;i<8;i++){ const y=H-585+i*36, off=Math.sin(e*0.7+i)*9;
      ctx.beginPath(); ctx.moveTo(40+i*88+off,y); ctx.lineTo(128+i*88+off,y); ctx.stroke(); }
    ctx.globalAlpha=1;
    ctx.fillStyle='#7d5f3c';
    ctx.beginPath(); ctx.moveTo(-300,H-300); ctx.quadraticCurveTo(W/2,H-322,W+300,H-300);
    ctx.lineTo(W+300,H-282); ctx.lineTo(-300,H-282); ctx.closePath(); ctx.fill();
    foreGround(H-292,night);
    grassTufts([[46,H-240],[350,H-215],[660,H-250]],e,night);
    [[70,0],[92,-1],[648,0],[672,-1]].forEach(function(r,i){
      const sway=Math.sin(e*1.2+i)*3;
      ctx.strokeStyle='#6b7a3a'; ctx.lineWidth=4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(r[0],H-292); ctx.quadraticCurveTo(r[0]+r[1]*8+sway,H-380,r[0]+r[1]*4+sway,H-436); ctx.stroke();
      ctx.fillStyle='#8a6a3a'; ctx.strokeStyle='rgba(60,45,25,0.6)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.ellipse(r[0]+r[1]*4+sway,H-446,5.5,15,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); });
    bigTree(614,H-286,e,night);
    drawDonkey(500,H-310);
  },
  courtyard: function(o){
    const e=o.elapsed, warmth=o.warmth, night=o.night;
    skyAndSun(warmth,night,150,H-860);
    ctx.fillStyle='rgba(180,140,95,0.5)';
    ctx.beginPath(); ctx.moveTo(-300,H-560); ctx.quadraticCurveTo(300,H-660,760,H-560);
    ctx.lineTo(1020,H-540); ctx.lineTo(1020,H-460); ctx.lineTo(-300,H-460); ctx.closePath(); ctx.fill();
    mudHouse(400,H-292,1,night);
    // tas duvar
    ctx.fillStyle=night?'#8d7a58':PAL.wallShade; ctx.strokeStyle=INK; ctx.lineWidth=2;
    ctx.fillRect(-300,H-360,340,70); ctx.strokeRect(-300,H-360,340,70);
    for(let x=-290;x<30;x+=42){ ctx.beginPath(); ctx.moveTo(x,H-360); ctx.lineTo(x,H-290); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-300,H-325); ctx.lineTo(40,H-325); ctx.stroke();
    foreGround(H-292,night);
    grassTufts([[70,H-230],[590,H-210],[300,H-140]],e,night);
    bigTree(96,H-286,e,night);
    drawDonkey(210,H-306);
  },
  interior: function(o){
    const e=o.elapsed, night=o.night;
    const wt=night?'#6e5a7a':'#e8d2a8', wb=night?'#574663':'#d3b88a';
    const g=ctx.createLinearGradient(0,-300,0,H-360);
    g.addColorStop(0,wt); g.addColorStop(1,wb);
    ctx.fillStyle=g; ctx.fillRect(-300,-300,W+600,H-60);
    // ahsap kirisler
    ctx.fillStyle=night?'#4a3a2c':'#8a6a44';
    for(let i=0;i<4;i++){ ctx.fillRect(-300,60+i*90,W+600,16); }
    // pencere
    ctx.fillStyle=night?'#2c3a63':'#a8d4e8'; ctx.strokeStyle=INK; ctx.lineWidth=5;
    ctx.fillRect(470,420,190,260); ctx.strokeRect(470,420,190,260);
    ctx.beginPath(); ctx.moveTo(565,420); ctx.lineTo(565,680); ctx.moveTo(470,550); ctx.lineTo(660,550); ctx.stroke();
    if(night){ ctx.fillStyle='#f4efd9'; ctx.beginPath(); ctx.arc(610,480,22,0,Math.PI*2); ctx.fill(); }
    // raf + testiler
    ctx.fillStyle='#6b4a2f'; ctx.fillRect(80,540,280,14);
    ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.strokeRect(80,540,280,14);
    ctx.fillStyle='#a3623a'; ctx.beginPath(); ctx.ellipse(150,522,22,20,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#8a7561'; ctx.beginPath(); ctx.ellipse(240,518,18,24,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#b5764a'; ctx.beginPath(); ctx.ellipse(316,524,16,18,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // kandil (gece yanar)
    ctx.strokeStyle='#5a4a32'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(360,150); ctx.lineTo(360,240); ctx.stroke();
    ctx.fillStyle='#c9a227'; ctx.beginPath(); ctx.ellipse(360,258,26,16,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.stroke();
    if(night){ const fl=1+0.2*Math.sin(e*6);
      ctx.fillStyle='rgba(255,200,90,0.9)';
      ctx.beginPath(); ctx.ellipse(360,240,7,13*fl,0,0,Math.PI*2); ctx.fill();
      const rg=ctx.createRadialGradient(360,248,10,360,248,190);
      rg.addColorStop(0,'rgba(255,190,90,0.28)'); rg.addColorStop(1,'rgba(255,190,90,0)');
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(360,248,190,0,Math.PI*2); ctx.fill(); }
    // zemin
    const fg=ctx.createLinearGradient(0,H-360,0,H+300);
    fg.addColorStop(0,night?'#6e5138':'#b07f4f'); fg.addColorStop(1,night?'#4a3625':'#8a5f38');
    ctx.fillStyle=fg; ctx.fillRect(-300,H-360,W+600,700);
    ctx.strokeStyle='rgba(60,40,25,0.5)'; ctx.lineWidth=2;
    for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(-300,H-340+i*70); ctx.lineTo(W+300,H-352+i*70); ctx.stroke(); }
    // kilim
    ctx.save(); ctx.translate(W/2,H-120);
    ctx.fillStyle='#a34432'; ctx.strokeStyle=INK; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-290,-70); ctx.lineTo(290,-70); ctx.lineTo(340,80); ctx.lineTo(-340,80); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle='#5a7a8c';
    ctx.beginPath(); ctx.moveTo(-200,-40); ctx.lineTo(200,-40); ctx.lineTo(236,50); ctx.lineTo(-236,50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#7e3325'; ctx.lineWidth=2;
    for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*90,-40); ctx.lineTo(i*104,50); ctx.stroke(); }
    ctx.fillStyle='#e0c060';
    [[-250,-55],[250,-55],[-300,65],[300,65]].forEach(function(p){
      ctx.beginPath(); ctx.arc(p[0],p[1],7,0,Math.PI*2); ctx.fill(); });
    ctx.restore();
    // minder
    ctx.fillStyle='#5b7a5b'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.roundRect(60,H-250,150,60,18); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='#3f5a3f';
    ctx.beginPath(); ctx.moveTo(80,H-220); ctx.quadraticCurveTo(135,H-232,190,H-220); ctx.stroke();
  },
  bazaar: function(o){
    const e=o.elapsed, warmth=o.warmth, night=o.night;
    skyAndSun(warmth,night,600,H-880);
    mudHouse(-60,H-420,0.8,night); mudHouse(470,H-430,0.85,night);
    foreGround(H-300,night);
    // tezgah
    function stall(x,awn1,awn2){
      ctx.fillStyle='#8a6544'; ctx.strokeStyle=INK; ctx.lineWidth=3;
      ctx.fillRect(x,H-430,220,26); ctx.strokeRect(x,H-430,220,26);
      ctx.fillRect(x+12,H-404,14,110); ctx.strokeRect(x+12,H-404,14,110);
      ctx.fillRect(x+194,H-404,14,110); ctx.strokeRect(x+194,H-404,14,110);
      ctx.fillRect(x-6,H-540,232,14); ctx.strokeRect(x-6,H-540,232,14);
      for(let i=0;i<5;i++){
        ctx.fillStyle=i%2?awn1:awn2;
        ctx.beginPath(); ctx.moveTo(x-6+i*47,H-540); ctx.lineTo(x+41+i*47,H-540);
        ctx.quadraticCurveTo(x+18+i*47,H-496,x-6+i*47,H-540); ctx.closePath(); ctx.fill();
        ctx.strokeStyle=INK; ctx.lineWidth=2; ctx.stroke(); }
      // urunler: sepetlerde meyve
      ['#d9903a','#a8c060','#c05a48'].forEach(function(col,i){
        const bx=x+40+i*62;
        ctx.fillStyle='#b08a55'; ctx.strokeStyle=INK; ctx.lineWidth=2;
        ctx.beginPath(); ctx.ellipse(bx,H-436,26,12,0,0,Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle=col;
        for(let f=0;f<5;f++){ ctx.beginPath();
          ctx.arc(bx-14+f*7,H-442-(f%2)*6,6,0,Math.PI*2); ctx.fill(); }
      });
    }
    stall(60,'#c05a48','#e8dcc0'); stall(410,'#4a6a8a','#e8dcc0');
    grassTufts([[30,H-190],[680,H-210]],e,night);
  },
  palace: function(o){
    const e=o.elapsed, warmth=o.warmth;
    // zengin perde + sutunlu ic mekan
    const g=ctx.createLinearGradient(0,-300,0,H);
    g.addColorStop(0,'#7e2f3a'); g.addColorStop(1,'#5c2130');
    ctx.fillStyle=g; ctx.fillRect(-300,-300,W+600,H+600);
    // arka duvar deseni
    ctx.strokeStyle='rgba(230,180,90,0.22)'; ctx.lineWidth=2;
    for(let y=0;y<H-360;y+=70){ for(let x=-260;x<W+260;x+=70){
      ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2); ctx.stroke(); } }
    // sutunlar
    [-40,660].forEach(function(cx){
      ctx.fillStyle='#caa565'; ctx.strokeStyle=INK; ctx.lineWidth=3;
      ctx.fillRect(cx,80,100,H-460); ctx.strokeRect(cx,80,100,H-460);
      ctx.strokeStyle='#9a7b48';
      ctx.beginPath(); ctx.moveTo(cx+24,90); ctx.lineTo(cx+24,H-390);
      ctx.moveTo(cx+76,90); ctx.lineTo(cx+76,H-390); ctx.stroke();
      ctx.fillStyle='#e0c060'; ctx.strokeStyle=INK;
      ctx.fillRect(cx-12,60,124,26); ctx.strokeRect(cx-12,60,124,26);
      ctx.fillRect(cx-12,H-388,124,26); ctx.strokeRect(cx-12,H-388,124,26);
    });
    // perdeler
    ['#3f6a4f','#3f6a4f'].forEach(function(col,i){
      const px=i===0?-120:W-160;
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.moveTo(px,-40);
      for(let k=0;k<5;k++){ ctx.quadraticCurveTo(px+40+Math.sin(e*0.4+k)*8, k*180+80, px+20, (k+1)*180); }
      ctx.lineTo(px+280,-40); ctx.closePath(); ctx.globalAlpha=0.9; ctx.fill(); ctx.globalAlpha=1;
    });
    // podyum + hali
    ctx.fillStyle='#8a5f38'; ctx.strokeStyle=INK; ctx.lineWidth=3;
    ctx.fillRect(-300,H-360,W+600,60); ctx.strokeRect(-300,H-360,W+600,60);
    const fg=ctx.createLinearGradient(0,H-300,0,H+200);
    fg.addColorStop(0,'#a34432'); fg.addColorStop(1,'#6e2c22');
    ctx.fillStyle=fg; ctx.fillRect(-300,H-300,W+600,600);
    ctx.strokeStyle='#e0c060'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-300,H-282); ctx.lineTo(W+300,H-282); ctx.stroke();
    ctx.strokeStyle='rgba(224,192,96,0.5)'; ctx.lineWidth=2;
    for(let x=-240;x<W+300;x+=90){ ctx.beginPath(); ctx.arc(x,H-160,26,0,Math.PI*2); ctx.stroke(); }
  },
  road: function(o){
    const e=o.elapsed, warmth=o.warmth, night=o.night;
    skyAndSun(warmth,night,180,H-860);
    ctx.fillStyle='rgba(180,140,95,0.55)';
    ctx.beginPath(); ctx.moveTo(-300,H-600); ctx.quadraticCurveTo(220,H-720,640,H-610);
    ctx.quadraticCurveTo(880,H-560,1020,H-600); ctx.lineTo(1020,H-480); ctx.lineTo(-300,H-480); ctx.closePath(); ctx.fill();
    foreGround(H-470,night);
    // patika
    ctx.fillStyle=night?'#9a8262':'#dbb87f';
    ctx.beginPath(); ctx.moveTo(300,H-470); ctx.quadraticCurveTo(240,H-200,140,H+300);
    ctx.lineTo(560,H+300); ctx.quadraticCurveTo(470,H-200,420,H-470); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(90,65,40,0.5)'; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(352,H-460); ctx.quadraticCurveTo(330,H-150,300,H+280); ctx.stroke();
    // cit
    ctx.strokeStyle='#6b4a2f'; ctx.lineWidth=7; ctx.lineCap='round';
    for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(46+i*66,H-330); ctx.lineTo(50+i*66,H-430); ctx.stroke(); }
    ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(30,H-402); ctx.quadraticCurveTo(200,H-418,340,H-406); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34,H-360); ctx.quadraticCurveTo(200,H-376,336,H-366); ctx.stroke();
    grassTufts([[620,H-360],[540,H-240],[120,H-180]],e,night);
    if(!o.noTree) bigTree(636,H-462,e,night);
  }
};

// ================= ANATOMI PARCALARI =================
function drawHand(x,y,dirAngle,skin,skinShade,scale){
  ctx.save(); ctx.translate(x,y); ctx.rotate(dirAngle); ctx.scale(scale,scale);
  ctx.fillStyle=skin; ctx.strokeStyle=INK; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.ellipse(3,0,8,6,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,-6.5,4.5,3,-0.5,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle=skinShade; ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.moveTo(7,-3); ctx.lineTo(11,-2.4);
  ctx.moveTo(8,0); ctx.lineTo(12,0.4);
  ctx.moveTo(7,3); ctx.lineTo(11,2.8); ctx.stroke();
  ctx.restore();
}
function drawShoe(x,y,dir,col,colShade){
  ctx.save(); ctx.translate(x,y); ctx.scale(dir,1);
  ctx.fillStyle=col||PAL.shoe; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
  ctx.beginPath();
  ctx.moveTo(-8,-4); ctx.quadraticCurveTo(-11,2,-7,4);
  ctx.lineTo(9,4); ctx.quadraticCurveTo(16,3,17,-1);
  ctx.quadraticCurveTo(18,-5,14,-4); ctx.quadraticCurveTo(10,-2,4,-5); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle=colShade||PAL.shoeShade; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(-5,1.5); ctx.quadraticCurveTo(4,3,12,1); ctx.stroke();
  ctx.restore();
}
function drawSalvarLeg(originX,tx,ty,bend,salvar,salvarShade,footDir){
  const thighLen=36, shinLen=34;
  const dx=tx-originX, dy=ty, dist=Math.sqrt(dx*dx+dy*dy);
  let kx,ky;
  if(dist/(thighLen+shinLen)>0.92){ kx=(originX+tx)/2; ky=ty*0.55; }
  else { const ik=solveIK(originX,0,tx,ty,thighLen,shinLen,bend); kx=ik.elbowX; ky=ik.elbowY; }
  ctx.fillStyle=salvar; ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(originX-9,2); ctx.quadraticCurveTo(originX-14,ky*0.5,kx-7,ky);
  ctx.lineTo(kx+7,ky); ctx.quadraticCurveTo(originX+14,ky*0.5,originX+9,2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle=salvarShade; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(originX,6); ctx.quadraticCurveTo(originX+bend*5,ky*0.6,kx,ky-4); ctx.stroke();
  ctx.fillStyle=salvar; ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(kx-7,ky); ctx.quadraticCurveTo(kx-6,(ky+ty)/2,tx-4,ty-3);
  ctx.lineTo(tx+4,ty-3); ctx.quadraticCurveTo(kx+6,(ky+ty)/2,kx+7,ky);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  drawShoe(tx,ty+1,footDir);
}
function drawSleevedArm(shX,shY,tx,ty,bend,sleeve,sleeveShade,skin,skinShade,seed){
  const upperLen=32, lowerLen=30;
  const ik=solveIK(shX,shY,tx,ty,upperLen,lowerLen,bend);
  ctx.strokeStyle=sleeve; ctx.lineCap='round'; ctx.lineWidth=13;
  ctx.beginPath(); ctx.moveTo(shX,shY); ctx.lineTo(ik.elbowX,ik.elbowY); ctx.stroke();
  ctx.strokeStyle=sleeveShade; ctx.lineWidth=3; ctx.globalAlpha=0.55;
  ctx.beginPath(); ctx.moveTo(shX+2,shY+4); ctx.lineTo(ik.elbowX+2,ik.elbowY+3); ctx.stroke();
  ctx.globalAlpha=1;
  const cA=Math.atan2(ty-ik.elbowY,tx-ik.elbowX);
  ctx.fillStyle=sleeve; ctx.strokeStyle=INK; ctx.lineWidth=1.6;
  ctx.save(); ctx.translate(ik.elbowX,ik.elbowY); ctx.rotate(cA);
  ctx.beginPath(); ctx.ellipse(2,0,7.5,9,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
  sketch(ik.elbowX,ik.elbowY,tx,ty,7,skin,seed+21);
  ctx.strokeStyle=skinShade; ctx.lineWidth=2; ctx.globalAlpha=0.5;
  ctx.beginPath(); ctx.moveTo(ik.elbowX,ik.elbowY+2); ctx.lineTo(tx,ty+2); ctx.stroke(); ctx.globalAlpha=1;
  drawHand(tx,ty,cA,skin,skinShade,1);
}
function drawFace(headR,skin,skinShade,p,spec){
  // kulak+burun+yanak (ortak)
  ctx.fillStyle=skin; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.ellipse(-headR+1,2,3.8,5.6,0.15,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(214,120,90,0.22)';
  ctx.beginPath(); ctx.ellipse(-10,7,5.5,4,0,0,Math.PI*2); ctx.ellipse(12,7,4.5,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(1,-2); ctx.quadraticCurveTo(4.6,3,1,6); ctx.stroke();
  // gozler
  ctx.fillStyle=INK;
  if(p.eyesClosed){
    ctx.lineWidth=2; ctx.strokeStyle=INK;
    ctx.beginPath(); ctx.moveTo(-10,-5); ctx.quadraticCurveTo(-7,-3,-4,-5);
    ctx.moveTo(4,-5); ctx.quadraticCurveTo(7,-3,10,-5); ctx.stroke();
  } else if(p.eyesWide){
    ctx.strokeStyle=INK; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(-7,-4,4.5,0,Math.PI*2); ctx.arc(7,-4,4.5,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-7,-4,3.8,0,Math.PI*2); ctx.arc(7,-4,3.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(-7,-4,1.5,0,Math.PI*2); ctx.arc(7,-4,1.5,0,Math.PI*2); ctx.fill();
  } else {
    const sq=p.sly?0.5:1;
    ctx.beginPath(); ctx.ellipse(-7,-5,2.5,2.5*sq,0,0,Math.PI*2); ctx.ellipse(7,-5,2.5,2.5*sq,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(-7.8,-5.8,0.8,0,Math.PI*2); ctx.arc(6.2,-5.8,0.8,0,Math.PI*2); ctx.fill();
  }
  // kaslar
  ctx.strokeStyle=spec.browCol; ctx.lineWidth=2.5;
  if(p.angry){ ctx.beginPath(); ctx.moveTo(-13,-10); ctx.lineTo(-3,-7); ctx.moveTo(13,-10); ctx.lineTo(3,-7); ctx.stroke(); }
  else if(p.sly){ ctx.beginPath(); ctx.moveTo(-13,-11); ctx.lineTo(-3,-13); ctx.moveTo(13,-11); ctx.lineTo(3,-13); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-12,-10); ctx.quadraticCurveTo(-7,-13,-2,-10);
         ctx.moveTo(12,-10); ctx.quadraticCurveTo(7,-13,2,-10); ctx.stroke(); }
  // biyik
  if(spec.mustache){
    ctx.strokeStyle=spec.hairCol; ctx.lineWidth=spec.mustache===2?4.4:3.6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-1,6); ctx.quadraticCurveTo(-9,3.5,-14,8);
    ctx.moveTo(1,6); ctx.quadraticCurveTo(9,3.5,14,8); ctx.stroke();
  }
  // agiz
  ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath();
  const my=spec.mustache?13:11;
  if(p.mouthShape==='smile'){ ctx.arc(0,my,5,0.15*Math.PI,0.85*Math.PI); ctx.stroke(); }
  else if(p.mouthShape==='talk'){ ctx.ellipse(0,my+1,4,3,0,0,Math.PI*2); ctx.fillStyle='#7a4a3a'; ctx.fill(); ctx.stroke(); }
  else if(p.mouthShape==='shout'){ ctx.fillStyle='#a33'; ctx.ellipse(0,my+1,7,9,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }
  else { ctx.moveTo(-5,my); ctx.lineTo(5,my); ctx.stroke(); }
}
function drawHeadwear(kind, headR, col, col2){
  if(kind==='takke'){
    ctx.fillStyle=col; ctx.strokeStyle=INK; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(0,-headR+6,headR-3,Math.PI,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col2; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(-headR+3,-headR+6); ctx.quadraticCurveTo(0,-headR+9,headR-3,-headR+6); ctx.stroke();
  } else if(kind==='fes'){
    ctx.fillStyle=col; ctx.strokeStyle=INK; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-headR+5,-headR+8); ctx.lineTo(-headR+8,-headR-12);
    ctx.quadraticCurveTo(0,-headR-18,headR-8,-headR-12); ctx.lineTo(headR-5,-headR+8); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col2; ctx.lineWidth=2.6;
    ctx.beginPath(); ctx.moveTo(2,-headR-15); ctx.quadraticCurveTo(headR-2,-headR-6,headR+2,-headR+10); ctx.stroke();
    ctx.fillStyle=col2; ctx.beginPath(); ctx.arc(headR+2,-headR+12,3.4,0,Math.PI*2); ctx.fill();
  } else if(kind==='sarik'){
    ctx.fillStyle=col; ctx.strokeStyle=INK; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.ellipse(0,-headR+3,headR+5,headR*0.7,0,Math.PI*0.95,Math.PI*2.05); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-2,-headR-5,headR*0.85,headR*0.42,-0.06,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col2; ctx.lineWidth=1.5; ctx.globalAlpha=0.8;
    ctx.beginPath(); ctx.moveTo(-headR-2,-headR+6); ctx.quadraticCurveTo(0,-headR-9,headR+2,-headR+6); ctx.stroke();
    ctx.globalAlpha=1;
  } else if(kind==='yazma'){
    ctx.fillStyle=col; ctx.strokeStyle=INK; ctx.lineWidth=2.2;
    ctx.beginPath();
    ctx.moveTo(-headR-3,6); ctx.quadraticCurveTo(-headR-6,-headR-2,0,-headR-6);
    ctx.quadraticCurveTo(headR+6,-headR-2,headR+3,6);
    ctx.quadraticCurveTo(headR-2,-headR+7,0,-headR+6);
    ctx.quadraticCurveTo(-headR+2,-headR+7,-headR-3,6);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // ense ucu
    ctx.beginPath(); ctx.moveTo(headR-2,2); ctx.quadraticCurveTo(headR+10,14,headR+4,26);
    ctx.quadraticCurveTo(headR,16,headR-4,8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col2; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(-headR+4,-headR+10); ctx.quadraticCurveTo(0,-headR+2,headR-4,-headR+10); ctx.stroke();
  } else if(kind==='crown_sarik'){
    ctx.fillStyle=col; ctx.strokeStyle=INK; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.ellipse(0,-headR+2,headR+8,headR*0.8,0,Math.PI*0.95,Math.PI*2.05); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-2,-headR-7,headR*0.95,headR*0.5,-0.06,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col2;
    ctx.beginPath(); ctx.moveTo(-8,-headR-16); ctx.lineTo(8,-headR-16); ctx.lineTo(0,-headR-34); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(0,-headR-18,3.6,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
}

// ================= KARAKTER FABRIKASI =================
// spec: {skin,skinShade,top,topShade,vest,vestShade,salvar,salvarShade,
//        headwear,hwCol,hwCol2,hairCol,browCol,mustache(0/1/2),beard(0/1),
//        female,dress,dressShade,scale}
function drawVillager(p, spec){
  ctx.save(); ctx.translate(p.x,p.y);
  if(p.mirror) ctx.scale(-1,1);
  ctx.rotate(p.bodyAngle||0); const sc=spec.scale||1; ctx.scale(sc*(p.squashX||1),sc*(p.squashY||1));
  const seed=p.x*0.015+p.y*0.015+(spec.seed||0);
  const shoulderY=-78, headR=21, hipOffset=9;

  if(spec.female){
    // entari (uzun elbise) — bacaklar gizli, ayak uclari gorunur
    drawShoe(-10,72,1,'#5e3a4a','#3f2531'); drawShoe(12,72,-1,'#5e3a4a','#3f2531');
    ctx.fillStyle=spec.dress; ctx.strokeStyle=INK; ctx.lineWidth=2.4;
    ctx.beginPath();
    ctx.moveTo(-34,68); ctx.quadraticCurveTo(-22,70,-12,67); ctx.quadraticCurveTo(0,71,12,67);
    ctx.quadraticCurveTo(22,70,34,68);
    ctx.lineTo(15,shoulderY+10); ctx.lineTo(-15,shoulderY+10); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle=spec.dressShade; ctx.lineWidth=1.6; ctx.globalAlpha=0.8;
    ctx.beginPath(); ctx.moveTo(-12,shoulderY+30); ctx.quadraticCurveTo(-16,10,-14,60);
    ctx.moveTo(11,shoulderY+34); ctx.quadraticCurveTo(15,12,13,60);
    ctx.moveTo(0,-4); ctx.quadraticCurveTo(-2,26,0,58); ctx.stroke(); ctx.globalAlpha=1;
    // onluk
    ctx.fillStyle=spec.vest; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(-16,-6); ctx.quadraticCurveTo(0,-2,16,-6);
    ctx.lineTo(13,52); ctx.quadraticCurveTo(0,58,-13,52); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    drawSalvarLeg(-hipOffset,p.footL.x-hipOffset,p.footL.y,1,spec.salvar,spec.salvarShade,1);
    drawSalvarLeg( hipOffset,p.footR.x+hipOffset,p.footR.y,-1,spec.salvar,spec.salvarShade,-1);
    // govde
    ctx.strokeStyle=spec.top; ctx.lineWidth=20; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,shoulderY+5); ctx.stroke();
    ctx.strokeStyle=spec.topShade; ctx.lineWidth=3; ctx.globalAlpha=0.5;
    ctx.beginPath(); ctx.moveTo(4,-8); ctx.lineTo(4,shoulderY+8); ctx.stroke(); ctx.globalAlpha=1;
    if(spec.vest){
      ctx.fillStyle=spec.vest; ctx.strokeStyle=INK; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(-17,-8); ctx.lineTo(-14,shoulderY+9);
      ctx.quadraticCurveTo(-8,shoulderY+6,-6,shoulderY+12); ctx.lineTo(-6,-4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(17,-8); ctx.lineTo(14,shoulderY+9);
      ctx.quadraticCurveTo(8,shoulderY+6,6,shoulderY+12); ctx.lineTo(6,-4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle=spec.vestShade; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(-13,shoulderY+16); ctx.lineTo(-11,-8);
      ctx.moveTo(13,shoulderY+16); ctx.lineTo(11,-8); ctx.stroke();
      ctx.fillStyle='#2e2015';
      [-10,-30,-50].forEach(function(dy){ ctx.beginPath(); ctx.arc(-8.5,dy,1.7,0,Math.PI*2); ctx.fill(); });
    }
    // kusak
    ctx.fillStyle=spec.kusak||PAL.kusak; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(-16,-14); ctx.quadraticCurveTo(0,-9,16,-14);
    ctx.lineTo(15,-2); ctx.quadraticCurveTo(0,2,-15,-2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=spec.kusakShade||PAL.kusakShade; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(-13,-9); ctx.quadraticCurveTo(0,-5,13,-9); ctx.stroke();
  }
  // kollar
  drawSleevedArm(-12,shoulderY+12,p.handL.x,p.handL.y,-1,spec.top,spec.topShade,spec.skin,spec.skinShade,seed+20);
  drawSleevedArm( 12,shoulderY+12,p.handR.x,p.handR.y, 1,spec.top,spec.topShade,spec.skin,spec.skinShade,seed+22);
  // kafa
  ctx.save(); ctx.translate(0,shoulderY-headR+5); ctx.rotate(p.headTilt||0);
  ctx.fillStyle=spec.skin; ctx.strokeStyle=INK; ctx.lineWidth=3.2;
  ctx.beginPath(); ctx.arc(0,0,headR,0,Math.PI*2); ctx.fill(); ctx.stroke();
  if(spec.beard){
    ctx.fillStyle=spec.hairCol;
    ctx.beginPath(); ctx.moveTo(-15,4); ctx.quadraticCurveTo(-16,18,0,24);
    ctx.quadraticCurveTo(16,18,15,4); ctx.quadraticCurveTo(7,11,0,9); ctx.quadraticCurveTo(-7,11,-15,4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=INK; ctx.lineWidth=1.4; ctx.stroke();
  }
  drawHeadwear(spec.headwear,headR,spec.hwCol,spec.hwCol2);
  drawFace(headR,spec.skin,spec.skinShade,p,spec);
  ctx.restore();
  ctx.restore();
}

// ================= NASREDDIN HOCA (imza) =================
function drawHoca(p){
  ctx.save(); ctx.translate(p.x,p.y);
  if(p.mirror) ctx.scale(-1,1);
  ctx.rotate(p.bodyAngle||0);
  const _s=p.scale||1;
  ctx.scale(_s*(p.squashX||1),_s*(p.squashY||1));
  const seed=p.x*0.01+p.y*0.01;
  const shoulderY=-90, headR=23, hipOffset=10;
  drawSalvarLeg(-hipOffset,p.footL.x-hipOffset,p.footL.y,1,PAL.salvar,PAL.salvarShade,1);
  drawSalvarLeg( hipOffset,p.footR.x+hipOffset,p.footR.y,-1,PAL.salvar,PAL.salvarShade,-1);
  ctx.fillStyle=PAL.hocaRobe; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.beginPath();
  ctx.moveTo(-34,22);
  ctx.quadraticCurveTo(-30,24,-24,21); ctx.quadraticCurveTo(-16,25,-8,21);
  ctx.quadraticCurveTo(0,25,8,21); ctx.quadraticCurveTo(16,25,24,21);
  ctx.quadraticCurveTo(30,24,34,22);
  ctx.lineTo(17,shoulderY+14); ctx.lineTo(-17,shoulderY+14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle=PAL.hocaRobeShade; ctx.lineWidth=1.6; ctx.globalAlpha=0.8;
  ctx.beginPath(); ctx.moveTo(-14,shoulderY+30); ctx.quadraticCurveTo(-18,-20,-16,16);
  ctx.moveTo(12,shoulderY+34); ctx.quadraticCurveTo(16,-16,15,16);
  ctx.moveTo(0,-8); ctx.quadraticCurveTo(-2,6,0,18); ctx.stroke(); ctx.globalAlpha=1;
  ctx.strokeStyle=PAL.hocaRobeShade; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(-9,shoulderY+15); ctx.lineTo(0,shoulderY+34); ctx.lineTo(9,shoulderY+15); ctx.stroke();
  ctx.fillStyle=PAL.kusak; ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(-27,-34); ctx.quadraticCurveTo(0,-28,27,-34);
  ctx.lineTo(26,-18); ctx.quadraticCurveTo(0,-12,-26,-18); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle=PAL.kusakShade; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(-24,-29); ctx.quadraticCurveTo(0,-23,24,-29);
  ctx.moveTo(-24,-24); ctx.quadraticCurveTo(0,-18,24,-24); ctx.stroke();
  ctx.fillStyle=PAL.kusak;
  ctx.beginPath(); ctx.moveTo(14,-18); ctx.quadraticCurveTo(20,-4,15,6);
  ctx.quadraticCurveTo(11,-2,10,-16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=1.6; ctx.stroke();
  drawSleevedArm(-13,shoulderY+18,p.handL.x,p.handL.y,-1,PAL.hocaRobe,PAL.hocaRobeShade,PAL.hocaSkin,PAL.hocaSkinShade,seed);
  drawSleevedArm( 13,shoulderY+18,p.handR.x,p.handR.y, 1,PAL.hocaRobe,PAL.hocaRobeShade,PAL.hocaSkin,PAL.hocaSkinShade,seed+2);
  ctx.save(); ctx.translate(0,shoulderY-headR+8); ctx.rotate(p.headTilt||0);
  ctx.fillStyle=PAL.hocaSkin; ctx.strokeStyle=INK; ctx.lineWidth=3.2;
  ctx.beginPath(); ctx.arc(0,2,headR+2,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // sarik (uc kat)
  ctx.fillStyle=PAL.turban; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.ellipse(0,-headR+2,headR+10,headR*0.98,0,Math.PI*0.95,Math.PI*2.05); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-3,-headR-7,headR+3,headR*0.62,-0.08,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-1,-headR-15,headR*0.62,headR*0.34,0.05,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle=PAL.turbanShade; ctx.lineWidth=1.6; ctx.globalAlpha=0.85;
  ctx.beginPath(); ctx.moveTo(-headR-7,-headR+5); ctx.quadraticCurveTo(0,-headR-17,headR+7,-headR+5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-headR-3,-headR+11); ctx.quadraticCurveTo(0,-headR-7,headR+3,-headR+11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-headR*0.6,-headR-12); ctx.quadraticCurveTo(0,-headR-19,headR*0.6,-headR-12); ctx.stroke();
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(120,110,90,0.35)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.ellipse(0,-headR+9,headR+7,headR*0.4,0,Math.PI*1.05,Math.PI*1.95); ctx.stroke();
  ctx.fillStyle=PAL.turban; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(headR+4,-headR+8);
  ctx.quadraticCurveTo(headR+12,-headR+18,headR+8,-headR+30);
  ctx.quadraticCurveTo(headR+5,-headR+22,headR+1,-headR+14); ctx.closePath(); ctx.fill(); ctx.stroke();
  // sakal
  ctx.fillStyle='#f3f3ec';
  ctx.beginPath();
  ctx.moveTo(-17,3); ctx.quadraticCurveTo(-20,20,-8,29); ctx.quadraticCurveTo(0,33,8,29);
  ctx.quadraticCurveTo(20,20,17,3); ctx.quadraticCurveTo(8,12,0,10); ctx.quadraticCurveTo(-8,12,-17,3);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=1.6; ctx.stroke();
  ctx.strokeStyle='#d8d8cc'; ctx.lineWidth=1.1; ctx.globalAlpha=0.85;
  ctx.beginPath();
  ctx.moveTo(-9,12); ctx.quadraticCurveTo(-8,22,-3,27);
  ctx.moveTo(9,12); ctx.quadraticCurveTo(8,22,3,27);
  ctx.moveTo(-3,14); ctx.quadraticCurveTo(-2,22,0,28);
  ctx.moveTo(3,14); ctx.quadraticCurveTo(2,22,0,28); ctx.stroke(); ctx.globalAlpha=1;
  drawFace(headR,PAL.hocaSkin,PAL.hocaSkinShade,p,
    {browCol:'#e0e0d4',hairCol:'#e8e8de',mustache:2});
  ctx.restore();
  ctx.restore();
}

// ================= PROPLAR =================
function drawThornLoad(x,y,s){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.fillStyle='#8a6a3a'; ctx.strokeStyle='#5e4426'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(0,0,40,20,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.lineWidth=2.2; ctx.lineCap='round';
  for(let i=0;i<9;i++){ const a=Math.PI*(0.05+0.9*i/8);
    ctx.beginPath(); ctx.moveTo(0,-2);
    ctx.lineTo(Math.cos(a)*46,-2-Math.sin(a)*30); ctx.stroke(); }
  ctx.restore();
}
function drawFireCloud(x,y,s,t){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  const flick=1+0.14*Math.sin(t*9);
  const cols=['#b8371f','#e8611f','#f6a11f','#ffd23f'];
  cols.forEach(function(c,i){
    const r=(34-i*7)*flick;
    ctx.fillStyle=c;
    ctx.beginPath();
    ctx.moveTo(-r,4);
    ctx.quadraticCurveTo(-r*0.9,-r*0.7,-r*0.35,-r*0.75);
    ctx.quadraticCurveTo(-r*0.2,-r*1.35*flick,r*0.12,-r*0.8);
    ctx.quadraticCurveTo(r*0.55,-r*1.15*flick,r*0.6,-r*0.5);
    ctx.quadraticCurveTo(r,-r*0.35,r*0.85,3);
    ctx.closePath(); ctx.fill();
  });
  ctx.restore();
}
function drawSmokePuffs(x,y,t,n){
  ctx.fillStyle='rgba(90,80,70,0.5)';
  for(let i=0;i<(n||3);i++){
    const ph=((t*0.7)+i*0.33)%1;
    ctx.globalAlpha=(1-ph)*0.5;
    ctx.beginPath();
    ctx.arc(x - i*34 - ph*30, y - ph*46, 10+ph*16, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawSparkle(x,y,t){
  const p=1+0.3*Math.sin(t*12);
  ctx.strokeStyle='#ffd23f'; ctx.lineWidth=3; ctx.lineCap='round';
  for(let i=0;i<4;i++){ const a=Math.PI*i/2+0.4;
    ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*4*p,y+Math.sin(a)*4*p);
    ctx.lineTo(x+Math.cos(a)*12*p,y+Math.sin(a)*12*p); ctx.stroke(); }
  ctx.fillStyle='#fff3c0';
  ctx.beginPath(); ctx.arc(x,y,3.4*p,0,Math.PI*2); ctx.fill();
}
function drawDistantLake(x,y){
  ctx.fillStyle='#7aa8b8';
  ctx.beginPath(); ctx.ellipse(x,y,120,26,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#e8f3f2'; ctx.lineWidth=2.4; ctx.globalAlpha=0.8;
  ctx.beginPath(); ctx.moveTo(x-70,y-4); ctx.lineTo(x-20,y-4);
  ctx.moveTo(x+10,y+6); ctx.lineTo(x+66,y+6); ctx.stroke(); ctx.globalAlpha=1;
  ctx.strokeStyle='#6b7a3a'; ctx.lineWidth=3;
  [[-100,0],[104,-1]].forEach(function(r){
    ctx.beginPath(); ctx.moveTo(x+r[0],y+6);
    ctx.quadraticCurveTo(x+r[0]+r[1]*6,y-24,x+r[0]+r[1]*3,y-34); ctx.stroke(); });
}
// EsekEx: p={x,y,scale,dir(1/-1),run(0..1),panic,load:'none|thorn|fire',t}
function drawDonkeyEx(p){
  const t=p.t||0, run=p.run||0;
  ctx.save(); ctx.translate(p.x,p.y);
  if((p.dir||1)<0) ctx.scale(-1,1);
  ctx.scale(p.scale||1,p.scale||1);
  const bob=run? Math.abs(Math.sin(t*14))*6 : 0;
  ctx.translate(0,-bob);
  ctx.fillStyle='rgba(60,42,25,0.28)';
  ctx.beginPath(); ctx.ellipse(2,40+bob,44,9,0,0,Math.PI*2); ctx.fill();
  const swing=run? Math.sin(t*14)*34 : 0;
  ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  function leg(lx,phase,col){
    const a=run? swing*phase : 0;
    ctx.fillStyle=col;
    ctx.save(); ctx.translate(lx,10); ctx.rotate(a*Math.PI/180);
    ctx.fillRect(-3,0,6,28); ctx.strokeRect(-3,0,6,28);
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(-4,26,8,5);
    ctx.restore();
  }
  leg(-16,1,'#75634f'); leg(14,-1,'#75634f');
  ctx.fillStyle='#8a7561';
  ctx.beginPath(); ctx.ellipse(0,0,36,21,run?-0.08:0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#a3907a';
  ctx.beginPath(); ctx.ellipse(0,7,26,10,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#a34432'; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(-16,-18); ctx.quadraticCurveTo(0,-24,16,-18);
  ctx.lineTo(14,2); ctx.quadraticCurveTo(0,6,-14,2); ctx.closePath(); ctx.fill(); ctx.stroke();
  leg(-24,-1,'#8a7561'); leg(24,1,'#8a7561');
  // boyun+kafa (panikte one uzanmis)
  const ny=p.panic?-4:-10, hy2=p.panic?-16:-26;
  ctx.fillStyle='#8a7561'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(26,ny); ctx.quadraticCurveTo(42,hy2,50,hy2);
  ctx.quadraticCurveTo(66,hy2,66,hy2+12); ctx.quadraticCurveTo(66,hy2+22,52,hy2+22);
  ctx.quadraticCurveTo(38,hy2+24,30,4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#a3907a';
  ctx.beginPath(); ctx.ellipse(62,hy2+14,7,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(64,hy2+13,1.4,0,Math.PI*2); ctx.fill();
  // goz (panikte iri beyaz)
  if(p.panic){
    ctx.strokeStyle=INK; ctx.lineWidth=1.8;
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(50,hy2+8,5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(51,hy2+8,1.8,0,Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(50,hy2+8,2.2,0,Math.PI*2); ctx.fill();
  }
  // kulaklar (panikte geriye yatik)
  ctx.fillStyle='#8a7561'; ctx.strokeStyle=INK; ctx.lineWidth=2;
  const ea=p.panic?0.9:0.15, eb=p.panic?1.15:0.45;
  ctx.beginPath(); ctx.ellipse(44,hy2-8,5,13,ea,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(53,hy2-7,5,13,eb,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#5e4c39'; ctx.lineWidth=3; ctx.lineCap='round';
  for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(30+i*4,ny-6-i*2); ctx.lineTo(28+i*4,ny-14-i*2); ctx.stroke(); }
  // kuyruk (koşuda savrulur)
  const tw=run? Math.sin(t*14)*10 : 0;
  ctx.beginPath(); ctx.moveTo(-34,-6); ctx.quadraticCurveTo(-48,4+tw,-44,20+tw); ctx.stroke();
  ctx.fillStyle='#4a3a2a';
  ctx.beginPath(); ctx.ellipse(-44,24+tw,4,7,0.3,0,Math.PI*2); ctx.fill();
  // YUK
  if(p.load==='thorn') drawThornLoad(0,-34,1);
  if(p.load==='fire'){ drawThornLoad(0,-34,1); drawFireCloud(0,-52,1.15,t); }
  ctx.restore();
}
function drawDonkey(x,y){
  ctx.save(); ctx.translate(x,y);
  ctx.fillStyle='rgba(60,42,25,0.28)';
  ctx.beginPath(); ctx.ellipse(2,40,44,9,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  ctx.fillStyle='#75634f';
  [[-16,0],[14,0]].forEach(function(l){ ctx.fillRect(l[0]-3,10,6,28); ctx.strokeRect(l[0]-3,10,6,28); });
  ctx.fillStyle='#8a7561';
  ctx.beginPath(); ctx.ellipse(0,0,36,21,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#a3907a';
  ctx.beginPath(); ctx.ellipse(0,7,26,10,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#a34432'; ctx.strokeStyle=INK; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(-16,-18); ctx.quadraticCurveTo(0,-24,16,-18);
  ctx.lineTo(14,2); ctx.quadraticCurveTo(0,6,-14,2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#7e3325';
  ctx.beginPath(); ctx.moveTo(-12,-8); ctx.quadraticCurveTo(0,-4,12,-8); ctx.stroke();
  ctx.fillStyle='#8a7561'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
  [[-24,0],[24,0]].forEach(function(l){ ctx.fillRect(l[0]-3,10,6,28); ctx.strokeRect(l[0]-3,10,6,28); });
  ctx.fillStyle='#3a2a1a';
  [-24,-16,14,24].forEach(function(lx){ ctx.fillRect(lx-4,36,8,5); });
  ctx.fillStyle='#8a7561';
  ctx.beginPath(); ctx.moveTo(26,-10); ctx.quadraticCurveTo(40,-26,48,-26);
  ctx.quadraticCurveTo(64,-26,64,-14); ctx.quadraticCurveTo(64,-4,50,-4);
  ctx.quadraticCurveTo(38,-2,30,4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#a3907a';
  ctx.beginPath(); ctx.ellipse(60,-12,7,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(62,-13,1.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(48,-18,2.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#8a7561'; ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(44,-36,5,13,0.15,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(54,-34,5,13,0.45,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#c9b39a';
  ctx.beginPath(); ctx.ellipse(44,-35,2.2,8,0.15,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(54,-33,2.2,8,0.45,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#5e4c39'; ctx.lineWidth=3; ctx.lineCap='round';
  for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(30+i*4,-16-i*2); ctx.lineTo(28+i*4,-24-i*2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-34,-6); ctx.quadraticCurveTo(-48,4,-44,20); ctx.stroke();
  ctx.fillStyle='#4a3a2a';
  ctx.beginPath(); ctx.ellipse(-44,24,4,7,0.3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawKazan(x,y,scale,hasBaby){
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  ctx.fillStyle='rgba(60,42,25,0.28)';
  ctx.beginPath(); ctx.ellipse(0,26,46,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.kazan; ctx.strokeStyle=INK; ctx.lineWidth=3;
  ctx.beginPath(); ctx.ellipse(0,0,42,26,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,-14,42,14,0,0,Math.PI); ctx.fillStyle=PAL.kazanShine; ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.14)';
  ctx.beginPath(); ctx.ellipse(-16,2,10,14,0.3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(-42,-14); ctx.quadraticCurveTo(-60,-40,-40,-46); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(42,-14); ctx.quadraticCurveTo(60,-40,40,-46); ctx.stroke();
  if(hasBaby){
    ctx.fillStyle=PAL.tencere; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.ellipse(0,-6,14,9,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function drawBowl(x,y,scale){
  ctx.save(); ctx.translate(x,y); ctx.scale(scale||1,scale||1);
  ctx.fillStyle='rgba(60,42,25,0.25)';
  ctx.beginPath(); ctx.ellipse(1,9,22,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#b5764a'; ctx.strokeStyle=INK; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.ellipse(0,0,22,13,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#8a5432'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.ellipse(0,3,18,9,0,0.2,Math.PI-0.2); ctx.stroke();
  ctx.fillStyle='#f2ead4';
  ctx.beginPath(); ctx.ellipse(0,-4,17,8,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(-5,-6,6,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawSpoon(x,y,angle,scale){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle||0); ctx.scale(scale||1,scale||1);
  ctx.strokeStyle='#6b4a2f'; ctx.lineWidth=5.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30,-14); ctx.stroke();
  ctx.strokeStyle='#8a6544'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(2,-1.5); ctx.lineTo(28,-14.5); ctx.stroke();
  ctx.fillStyle='#8a5f3a'; ctx.strokeStyle=INK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(36,-17,9.5,6.5,-0.4,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#f2ead4';
  ctx.beginPath(); ctx.ellipse(36,-18,5.5,3.4,-0.4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
const PROPS={kazan:function(p){drawKazan(p.x,p.y,p.scale||1,p.hasBaby);},
             donkeyEx:function(p,t){p.t=t; drawDonkeyEx(p);},
             fire:function(p,t){drawFireCloud(p.x,p.y,p.scale||1,t);},
             smoke:function(p,t){drawSmokePuffs(p.x,p.y,t,p.n);},
             spark:function(p,t){drawSparkle(p.x,p.y,t);},
             lake_far:function(p){drawDistantLake(p.x,p.y);},
             thorn:function(p){drawThornLoad(p.x,p.y,p.scale||1);},
             bowl:function(p){drawBowl(p.x,p.y,p.scale||1);},
             spoon:function(p){drawSpoon(p.x,p.y,p.angle||0,p.scale||1);}};

// ================= ALTYAZI + FILIGRAN =================
function easeOB(t){ const c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); }
function isEmphasis(wRaw){
  const w=wRaw.replace(/[^A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc]/g,'');
  if(w.length<2) return false;
  return w===w.toLocaleUpperCase('tr-TR') && /[A-Z\u00c7\u011e\u0130\u00d6\u015e\u00dc]/.test(w);
}
const FONT='"Baloo 2","Comic Neue","Comic Sans MS",sans-serif';
function drawWatermark(name){
  ctx.save(); ctx.translate(W/2,54); ctx.rotate(-0.035);
  ctx.font='bold 27px '+FONT;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineJoin='round'; ctx.strokeStyle='rgba(25,18,10,0.85)'; ctx.lineWidth=6;
  ctx.strokeText(name,0,0);
  ctx.fillStyle='rgba(255,252,244,0.95)'; ctx.fillText(name,0,0);
  ctx.restore();
}
function drawCaption(text, localT, punch){
  const pop=clamp(localT/0.24,0,1);
  const s=0.82+0.18*easeOB(pop);
  const wob=punch? Math.sin(localT*7)*0.012 : -0.006;
  let fontPx=punch?42:31;
  // SIGDIRMA: en genis satiri olc, tasiyorsa fontu kucult
  const linesFit=text.split('\n');
  for(let tryPx=fontPx; tryPx>=20; tryPx-=2){
    ctx.font='bold '+tryPx+'px '+FONT;
    let mw=0; linesFit.forEach(function(ln){ mw=Math.max(mw,ctx.measureText(ln).width); });
    if(mw+64<=W-40){ fontPx=tryPx; break; }
    fontPx=tryPx;
  }
  const lineH=Math.round(fontPx*1.32);
  ctx.save();
  ctx.globalAlpha=clamp(localT/0.15,0,1);
  ctx.translate(W/2,H-190); ctx.rotate(wob); ctx.scale(s,s);
  ctx.font='bold '+fontPx+'px '+FONT;
  ctx.textBaseline='middle'; ctx.lineJoin='round';
  const lines=text.split('\n');
  let maxW=0; lines.forEach(function(ln){ maxW=Math.max(maxW,ctx.measureText(ln).width); });
  ctx.fillStyle='rgba(24,16,8,0.55)';
  ctx.beginPath();
  ctx.roundRect(-maxW/2-26,-(lines.length-1)*lineH/2-lineH/2-14,maxW+52,lines.length*lineH+28,18);
  ctx.fill();
  lines.forEach(function(line,i){
    const y=(i-(lines.length-1)/2)*lineH;
    const words=line.split(' ');
    const widths=words.map(function(w){ return ctx.measureText(w+' ').width; });
    const total=widths.reduce(function(a,b){return a+b;},0)-ctx.measureText(' ').width;
    let x=-total/2;
    words.forEach(function(word,wi){
      ctx.textAlign='left';
      ctx.strokeStyle='rgba(20,12,6,0.9)'; ctx.lineWidth=7;
      ctx.strokeText(word,x,y);
      ctx.fillStyle=isEmphasis(word)?'#ffd23f':'#fffdf6';
      ctx.fillText(word,x,y);
      x+=widths[wi];
    });
  });
  ctx.restore();
}

// ================= INTRO / OUTRO =================
function drawIntro(localT, dur, EP){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#f2dcae'); g.addColorStop(1,'#dcbb82');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(120,90,50,0.25)'; ctx.lineWidth=2;
  for(let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo(0,i*180+40); ctx.quadraticCurveTo(W/2,i*180+20,W,i*180+50); ctx.stroke(); }
  const t=clamp(localT/(dur*0.6),0,1);
  const popT=clamp((localT-dur*0.45)/(dur*0.3),0,1);
  ctx.save(); ctx.translate(W/2,H/2-40); ctx.rotate(-0.03);
  ctx.font='bold 64px '+FONT; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineJoin='round';
  ctx.strokeStyle='#3a2a18'; ctx.lineWidth=10;
  if(ctx.setLineDash){ ctx.setLineDash([1400]); ctx.lineDashOffset=1400*(1-t); }
  ctx.strokeText(EP.channel,0,0);
  if(ctx.setLineDash) ctx.setLineDash([]);
  if(popT>0){ ctx.globalAlpha=popT; ctx.fillStyle='#fffdf4'; ctx.fillText(EP.channel,0,0); ctx.globalAlpha=1; }
  ctx.restore();
  // altta kucuk hoca kafasi
  const hp=clamp((localT-dur*0.3)/(dur*0.5),0,1);
  if(hp>0){
    ctx.save(); ctx.translate(W/2,H/2+120); ctx.scale(hp*1.4,hp*1.4); ctx.globalAlpha=hp;
    ctx.fillStyle=PAL.hocaSkin; ctx.strokeStyle=INK; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(0,0,26,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=PAL.turban;
    ctx.beginPath(); ctx.ellipse(0,-22,34,18,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0,-36,20,10,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#f3f3ec';
    ctx.beginPath(); ctx.moveTo(-16,6); ctx.quadraticCurveTo(0,34,16,6);
    ctx.quadraticCurveTo(0,14,-16,6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle=INK;
    ctx.beginPath(); ctx.arc(-8,-4,2.4,0,Math.PI*2); ctx.arc(8,-4,2.4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
function drawOutro(localT, dur, EP, lastPanelDraw){
  lastPanelDraw();
  ctx.fillStyle='rgba(20,12,6,'+(0.55*clamp(localT/0.4,0,1))+')';
  ctx.fillRect(0,0,W,H);
  const pop=easeOB(clamp(localT/0.5,0,1));
  ctx.save(); ctx.translate(W/2,H/2-60); ctx.scale(pop,pop); ctx.rotate(-0.02);
  ctx.font='bold 58px '+FONT; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineJoin='round';
  ctx.strokeStyle='rgba(20,12,6,0.9)'; ctx.lineWidth=9;
  ctx.strokeText(EP.outroTitle,0,0);
  ctx.fillStyle='#ffd23f'; ctx.fillText(EP.outroTitle,0,0);
  ctx.font='bold 34px '+FONT;
  ctx.strokeStyle='rgba(20,12,6,0.9)'; ctx.lineWidth=7;
  ctx.strokeText(EP.outroSub,0,70);
  ctx.fillStyle='#fffdf6'; ctx.fillText(EP.outroSub,0,70);
  ctx.restore();
  // yukarı ok (abone bolgesine)
  const bob=Math.sin(localT*4)*8;
  ctx.save(); ctx.translate(W/2,H/2+120+bob);
  ctx.fillStyle='#ffd23f'; ctx.strokeStyle='rgba(20,12,6,0.9)'; ctx.lineWidth=4; ctx.lineJoin='round';
  ctx.beginPath();
  ctx.moveTo(0,-34); ctx.lineTo(26,0); ctx.lineTo(11,0); ctx.lineTo(11,30);
  ctx.lineTo(-11,30); ctx.lineTo(-11,0); ctx.lineTo(-26,0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ================= PANEL MOTORU =================
function applyCamera(cam){
  ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(cam.rot||0);
  ctx.scale(cam.zoom,cam.zoom); ctx.translate(-cam.fx,-cam.fy);
}
function drawPanel(panel, elapsed){
  applyCamera(panel.camera);
  (SCENES[panel.env]||SCENES.courtyard)({elapsed:elapsed, warmth:panel.warmth||0, night:!!panel.night, noTree:!!panel.noTree});
  (panel.props||[]).forEach(function(pr){ if(PROPS[pr.type]) PROPS[pr.type](pr, elapsed); });
  (panel.actors||[]).forEach(function(a){
    if(a.type==='hoca') drawHoca(a.pose);
    else drawVillager(a.pose, a.spec);
  });
  ctx.restore();
  // vinyet
  const vg=ctx.createRadialGradient(W/2,H/2,H*0.32,W/2,H/2,H*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(20,10,5,0.32)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
}
function totalDuration(EP){
  let d=EP.introDur+EP.outroDur;
  EP.panels.forEach(function(p){ d+=p.dur; });
  return d;
}
function renderFrame(t, EP){
  ctx.setTransform && ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  if(t<EP.introDur){ drawIntro(t,EP.introDur,EP); drawWatermark(EP.channel); return; }
  let acc=EP.introDur, panel=null, localT=0, lastIdx=EP.panels.length-1;
  for(let i=0;i<EP.panels.length;i++){
    const p=EP.panels[i];
    if(t<acc+p.dur){ panel=p; localT=t-acc; break; }
    acc+=p.dur;
  }
  if(panel===null){
    const p=EP.panels[lastIdx];
    const oT=t-acc;
    drawOutro(oT,EP.outroDur,EP,function(){ drawPanel(p, acc-p.dur+p.dur); });
    drawWatermark(EP.channel);
    return;
  }
  const fade=clamp(localT/0.1,0,1);
  ctx.globalAlpha=fade;
  drawPanel(panel, t);
  ctx.globalAlpha=1;
  drawWatermark(EP.channel);
  if(panel.caption) drawCaption(panel.caption, localT, !!panel.punch);
}

const API={init:init, renderFrame:renderFrame, totalDuration:totalDuration, SCENES:SCENES};
if(typeof module!=='undefined' && module.exports) module.exports=API;
else root.FikraMotor=API;
})(typeof window!=='undefined'?window:globalThis);
