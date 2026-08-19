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
    bigTree(636,H-462,e,night);
  }
};
