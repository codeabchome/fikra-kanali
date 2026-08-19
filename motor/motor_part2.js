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
  ctx.rotate(p.bodyAngle||0); ctx.scale(p.squashX||1,p.squashY||1);
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
             bowl:function(p){drawBowl(p.x,p.y,p.scale||1);},
             spoon:function(p){drawSpoon(p.x,p.y,p.angle||0,p.scale||1);}};

// ================= ALTYAZI + FILIGRAN =================
function easeOB(t){ const c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); }
function isEmphasis(wRaw){
  const w=wRaw.replace(/[^A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc]/g,'');
  if(w.length<2) return false;
  return w===w.toLocaleUpperCase('tr-TR') && /[A-Z\u00c7\u011e\u0130\u00d6\u015e\u00dc]/.test(w);
}
const FONT='"Comic Neue","Comic Sans MS",sans-serif';
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
  const fontPx=punch?42:31, lineH=punch?54:42;
  ctx.save();
  ctx.globalAlpha=clamp(localT/0.15,0,1);
  ctx.translate(W/2,H-158); ctx.rotate(wob); ctx.scale(s,s);
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
  (SCENES[panel.env]||SCENES.courtyard)({elapsed:elapsed, warmth:panel.warmth||0, night:!!panel.night});
  (panel.props||[]).forEach(function(pr){ if(PROPS[pr.type]) PROPS[pr.type](pr); });
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
