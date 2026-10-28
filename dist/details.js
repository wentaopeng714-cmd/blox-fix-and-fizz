import {T,box,cyl,group,mat} from './art.js';
const planeGeometry=new T.PlaneGeometry(1,1),bubbleGeometry=new T.SphereGeometry(1,8,6),holeGeometry=new T.CircleGeometry(.1,16),rimGeometry=new T.TorusGeometry(.12,.018,5,16),threadGeometry=new T.TorusGeometry(.049,.009,4,12);
const foamMaterial=new T.MeshBasicMaterial({color:0xf1fff0,transparent:true,opacity:.65,depthWrite:false});
export function makeDirt(parent,pos,index,type){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const m=new T.Mesh(planeGeometry,new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));m.position.fromArray(pos);if(type==='fan'&&index>=5)m.position.z=.73;
 m.scale.set(.56+(index%3)*.1,.43+(index%2)*.14,1);m.rotation.z=index*1.8;m.userData.toonInk=true;m.userData.dirty=true;
 const foamCanvas=document.createElement('canvas');foamCanvas.width=foamCanvas.height=96;const foamTexture=new T.CanvasTexture(foamCanvas);foamTexture.colorSpace=T.SRGBColorSpace;foamTexture.generateMipmaps=false;
 const foam=new T.Mesh(planeGeometry,new T.MeshBasicMaterial({map:foamTexture,transparent:true,depthWrite:false,side:T.DoubleSide}));foam.position.z=.008;foam.userData.toonInk=true;m.add(foam);parent.add(m);
 m.userData.paint={canvas,texture,foamCanvas,foamTexture,version:-1};return m;
}
export function paintDirt(mesh,surface,original=false){const p=mesh.userData.paint,key=original?'original':surface.version;if(p.version===key)return;p.version=key;
 const ctx=p.canvas.getContext('2d'),image=ctx.createImageData(96,96);for(let y=0;y<96;y++)for(let x=0;x<96;x++){
  const i=Math.min(23,y>>2)*24+Math.min(23,x>>2),n=surface.noise(x,y),a=original?surface.original[i]:surface.soil[i],wet=original?0:surface.wet[i];const k=(y*96+x)*4;
  const streak=Math.sin(x*.32+y*.08+surface.seed)> .87?20:0;
  image.data[k]=99+n*36-wet*13+streak;image.data[k+1]=83+n*28-wet*10+streak;image.data[k+2]=66+n*27-wet*7;image.data[k+3]=a*(n>.92?115:224);
 }ctx.putImageData(image,0,0);p.texture.needsUpdate=true;
 const f=p.foamCanvas.getContext('2d');f.clearRect(0,0,96,96);if(!original)for(let y=2;y<24;y+=3)for(let x=2;x<24;x+=3){const i=y*24+x,amount=surface.wet[i]*surface.soil[i];if(amount<.08)continue;const n=surface.noise(x+30,y+70),cx=x*4+n*5,cy=y*4+n*4,r=3+n*5;f.fillStyle=`rgba(239,255,242,${amount*.65})`;f.strokeStyle=`rgba(255,255,248,${amount*.95})`;f.lineWidth=1.5;f.beginPath();f.arc(cx,cy,r,0,Math.PI*2);f.fill();f.stroke();f.fillStyle=`rgba(255,255,255,${amount*.9})`;f.fillRect(cx-r*.3,cy-r*.5,2,2);}p.foamTexture.needsUpdate=true;
}
export function makeScrew(parent,pos){const root=group(parent,...pos),hole=group(parent,...pos);const rim=new T.Mesh(rimGeometry,mat(0x5c7485));hole.add(rim);const dark=new T.Mesh(holeGeometry,mat(0x344a62));dark.position.z=-.015;hole.add(dark);
 const head=cyl(root,.11,.075,0xb9d2d5,0,0,0);head.rotation.x=Math.PI/2;
 const shaft=cyl(root,.044,.3,0x99b6b9,0,0,-.17);shaft.rotation.x=Math.PI/2;
 for(let i=0;i<7;i++){const thread=new T.Mesh(threadGeometry,mat(i%2?0xd0dee0:0x76939e));thread.position.z=-.035-i*.038;root.add(thread);}
 box(root,.135,.026,.018,0x3d586c,0,0,.043);box(root,.026,.135,.018,0x3d586c,0,0,.044);box(root,.065,.012,.02,0xf2ffff,-.035,.055,.045);
 root.userData.baseZ=pos[2];root.userData.hole=hole;return root;
}
export function makeRepairTools(parent){
 const sponge=group(parent);box(sponge,.48,.33,.13,0xffcf62);box(sponge,.5,.35,.055,0x9bd1ac,0,0,-.08);for(let i=0;i<12;i++)box(sponge,.025,.025,.01,0xd49e48,(i%4-1.5)*.1,(Math.floor(i/4)-1)*.08,.072);
 const hand=group(sponge,.08,.08,.17);box(hand,.23,.2,.15,0xffe7be);for(let i=0;i<4;i++)box(hand,.043,.16,.075,0xfff3d2,(i-1.5)*.05,-.12,-.035);box(hand,.11,.11,.12,0xf7d49f,.15,0,-.025);box(hand,.18,.17,.17,0x5dafb4,.04,.17,.02);sponge.visible=false;
 const spray=group(parent);box(spray,.27,.44,.21,0x76c6bd,0,-.12,0);box(spray,.23,.08,.19,0xffe8ba,0,.14,0);box(spray,.16,.12,.4,0xf7b86a,0,.22,-.1);box(spray,.08,.13,.07,0xf9e7c2,.07,.12,-.05);const nozzle=cyl(spray,.04,.1,0x344c67,0,.22,-.34);nozzle.rotation.x=Math.PI/2;box(spray,.12,.16,.015,0xeef0cf,0,-.1,.114);spray.visible=false;
 const driver=group(parent),shaft=cyl(driver,.026,.58,0xb4d0d5,0,0,.30);shaft.rotation.x=Math.PI/2;box(driver,.074,.02,.11,0x556e7d,0,0,.04);box(driver,.02,.074,.11,0x556e7d,0,0,.04);
 const handle=cyl(driver,.14,.5,0xf2a15c,0,0,.82);handle.rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;const grip=box(driver,.025,.025,.35,0xbb704f,Math.cos(a)*.135,Math.sin(a)*.135,.82);grip.rotation.z=a;}const end=cyl(driver,.16,.08,0xffdc8f,0,0,1.1);end.rotation.x=Math.PI/2;
 const gripHand=group(driver,.15,-.02,.8);box(gripHand,.2,.24,.24,0xffeac5);for(let i=0;i<4;i++)box(gripHand,.17,.055,.075,0xfff1d4,-.12,-.1+i*.06,.07);box(gripHand,.18,.22,.17,0x54aeb2,.12,-.04,-.09);driver.visible=false;
 const brush=group(parent);box(brush,.56,.16,.09,0xb97b47,0,0,0);box(brush,.54,.06,.08,0x6b8994,0,-.04,-.025);
 for(let i=0;i<9;i++){const tuft=box(brush,.045,.11,.16, i%2?0xf9db9c:0xe4bd7b,(i-4)*.057,-.05,-.105);tuft.rotation.y=(i-4)*.025;}
 box(brush,.12,.45,.1,0xdda264,0,.26,.015);const brushHand=group(brush,0,.23,.14);box(brushHand,.25,.22,.16,0xffe7be);for(let i=0;i<4;i++)box(brushHand,.048,.17,.07,0xfff2cf,(i-1.5)*.055,-.1,-.04);box(brushHand,.22,.16,.16,0x5dafb4,0,.18,.01);brush.visible=false;
 return {sponge,spray,driver,brush};
}
export class RepairFX{
 constructor(scene){this.root=new T.Group();scene.add(this.root);this.pool=[];for(let i=0;i<70;i++){const mesh=new T.Mesh(bubbleGeometry,foamMaterial);mesh.visible=false;this.root.add(mesh);this.pool.push({mesh,life:0,v:new T.Vector3(),scale:.03});}this.next=0;}
 emit(pos,mode='foam',count=3){for(let i=0;i<count;i++){const p=this.pool[this.next++%this.pool.length];p.mesh.visible=true;p.mesh.position.copy(pos);p.mesh.position.x+=(Math.random()-.5)*.16;p.mesh.position.y+=(Math.random()-.5)*.16;p.life=.35+Math.random()*.45;p.scale=mode==='spark'?.018:.028+Math.random()*.035;p.v.set((Math.random()-.5)*.35,.2+Math.random()*.4,.05+Math.random()*.2);p.mesh.scale.setScalar(p.scale);}}
 update(dt){for(const p of this.pool){if(p.life<=0)continue;p.life-=dt;p.mesh.visible=p.life>0;p.mesh.position.addScaledVector(p.v,dt);p.mesh.scale.setScalar(p.scale*Math.min(1,p.life*3));}}
 clear(){for(const p of this.pool){p.life=0;p.mesh.visible=false;}}
}
