import {T,box,cyl,group,plant,avatar,textSprite,mat,inkGroup} from './art.js';
import {makeDirt,makeScrew,makeRepairTools} from './details.js?v=4';
import {extraMachine,extraMini,specialTools} from './extra-models.js';
const ringGeometry=new T.TorusGeometry(1,.085,6,40),diskGeometry=new T.CircleGeometry(1,12);
const ring=(parent,r,color,x,y,z)=>{const m=new T.Mesh(ringGeometry,mat(color));m.scale.setScalar(r);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
const disk=(parent,r,color,x,y,z)=>{const m=cyl(parent,r,.08,color,x,y,z);m.rotation.x=Math.PI/2;return m;};
export function makePart(kind,parent,color){const g=group(parent);if(kind==='rotor'){disk(g,.18,0xf8d36e,0,0,0);for(let i=0;i<4;i++){const a=group(g);a.rotation.z=i*Math.PI/2;box(a,.67,.3,.12,0xffcf68,.43,.04,0);box(a,.24,.24,.12,0xffe79f,.75,.04,0);}}
 else if(kind==='antenna'){cyl(g,.05,1.08,0x91bbc9,0,.53,0);cyl(g,.035,.55,0xe9e8ce,0,1.25,0);box(g,.22,.12,.22,0x4b7898,0,0,0);cyl(g,.075,.12,0xf0ca79,0,1.55,0);}
 else if(kind==='dial'){disk(g,.28,0xa8bcb8,0,0,0);disk(g,.22,0x6a7da7,0,0,.07);box(g,.05,.17,.04,0xffedbc,0,.06,.13);}
 else{box(g,.27,.54,.24,color,0,0,0);box(g,.3,.1,.27,0xffe5ac,0,.24,0);box(g,.1,.06,.12,0x9dafb2,0,.32,0);box(g,.16,.035,.03,0xffedc4,0,.05,.14);if(kind==='cell-a')box(g,.035,.16,.03,0xffedc4,0,.05,.15);}
 inkGroup(g);return g;}
export function makeMachine(spec,parent,primary){const root=group(parent),parts={},slots={},bolts=[],dirt=[],fx={};
 if(!['fan','radio','robot'].includes(spec.id)){const extra=extraMachine(spec,root,primary);Object.assign(parts,extra.parts);Object.assign(fx,extra.fx);}
 if(spec.id==='fan'){
  box(root,1.65,.24,1.15,primary,0,.14,.1);box(root,1.72,.08,1.2,0xffd779,0,.03,.1);box(root,.28,.85,.28,primary,0,.65,-.12);box(root,.55,.16,.45,0xffdb87,0,1.07,-.1);
  disk(root,.91,primary,0,1.85,.08);ring(root,.98,0xffdb87,0,1.85,.15);disk(root,.2,0x3d6d83,0,1.85,.28);box(root,.55,.16,.08,0x3e8598,0,1.85,.31);
  const p=makePart('rotor',root);p.position.set(0,1.85,.34);parts.rotor=p;fx.rotor=p;
  const ribbons=group(root,1.3,1.8,1.35);for(let i=0;i<3;i++){const s=box(ribbons,.08,.4,.035,0xffecc1,(i-1)*.2,0,0);s.rotation.z=.2*(i-1);}fx.ribbons=ribbons;
 }
 if(spec.id==='radio'){
  box(root,2.5,1.6,.85,primary,0,.98,0);box(root,2.62,.15,.94,0xffdf98,0,1.8,0);box(root,2.55,.15,.94,0xe49a56,0,.18,0);box(root,.13,.46,.14,0x4a6b79,-.65,2.04,0);box(root,.13,.46,.14,0x4a6b79,.65,2.04,0);box(root,1.43,.14,.16,0x4a6b79,0,2.25,0);
  disk(root,.57,0x466c83,-.58,1,.49);ring(root,.56,0xffe0a1,-.58,1,.55);for(let i=-2;i<=2;i++)box(root,.04,.75-.08*Math.abs(i),.035,0x88bcbe,-.58+i*.15,1,.57);
  box(root,.76,.21,.08,0x2e747c,.75,1.45,.5);const bars=[];for(let i=0;i<5;i++)bars.push(box(root,.07,.1,.04,0xc8ed9f,.48+i*.13,1.44,.56));fx.bars=bars;
  for(const p of spec.parts){const node=makePart(p.id,root);node.position.fromArray(p.position);parts[p.id]=node;}fx.dial=parts.dial;
 }
 if(spec.id==='robot'){
  for(const side of [-1,1]){box(root,.42,.5,.48,0x59738e,side*.4,.3,0);box(root,.55,.15,.7,0xffdf8c,side*.4,.09,.09);}box(root,1.42,1,.75,primary,0,1.08,0);box(root,1.2,.67,.8,primary,0,1.98,0);box(root,1.32,.12,.87,0xffd36d,0,2.36,0);cyl(root,.06,.25,0x517d8b,0,2.52,0);box(root,.2,.17,.2,0xffaa62,0,2.7,0);
  const eyes=[];for(const x of [-.29,.29]){box(root,.32,.27,.06,0x36536a,x,2.03,.44);const e=box(root,.18,.12,.03,0x8da098,x,2.03,.48);eyes.push(e);}box(root,.3,.055,.05,0x536e77,0,1.82,.44);fx.eyes=eyes;
  const arms=[];for(const side of [-1,1]){const a=group(root,side*.93,1.47,0);box(a,.32,.62,.38,0x6b8c9f,0,-.25,0);box(a,.42,.25,.44,0xffd985,0,-.63,.02);arms.push(a);}fx.arms=arms;
  for(const p of spec.parts){box(root,.38,.7,.065,0x426b7b,p.position[0],p.position[1],.42);const node=makePart(p.id,root,p.id==='cell-a'?0x40baa7:0xf2a45e);node.position.fromArray(p.position);parts[p.id]=node;}
 }
 for(const p of spec.parts){const target=group(root,...p.position);slots[p.slot]=target;parts[p.id].visible=false;}
 for(const pos of spec.bolts)bolts.push(makeScrew(root,pos));
 spec.dirt.forEach((pos,i)=>dirt.push(makeDirt(root,pos,i,spec.id)));
 inkGroup(root);return {root,parts,slots,bolts,dirt,fx};
}
export function makeWorkshop(world,persona={}){const r=world.sceneRoot;world.scene.background.set(0xb7e7cc);world.scene.fog.color.set(0xb7e7cc);
 box(r,50,.2,50,0xc3e178,0,-1.65,0);box(r,8,.3,4.5,0xffdb9c,0,-.18,0);box(r,8,.9,.18,0x42bdae,0,-.8,2.15);box(r,8,.12,.25,0xffe4ae,0,-.37,2.19);for(const x of [-3.4,3.4])for(const z of [-1.6,1.6])box(r,.22,1.45,.22,0xb98558,x,-.9,z);
 for(let i=-3;i<=3;i++)box(r,.012,.008,4.4,0xe9ad7c,i,.002,0);
 box(r,9,5,.2,0xffc982,0,.8,-3);box(r,.2,5,5,0x61cbb9,-4.4,.8,-.5);box(r,8.9,.14,.22,0xffe6b6,0,2.7,-2.85);
 for(const x of [-2.8,0,2.8]){box(r,2.3,.16,.95,0xf8df9f,x,2.55,-2.65);box(r,.12,.5,.15,0xb9885f,x-.85,2.25,-2.9);box(r,.12,.5,.15,0xb9885f,x+.85,2.25,-2.9);}
 const sign=textSprite(r,'FIX & FIZZ','#39665e','#fff2c5',3.2);sign.position.set(0,3.65,-2.8);
 box(r,1.5,1.55,.12,0xffe9b5,-3.1,1.15,-2.85);box(r,1.22,1.3,.13,0x6ac7e1,-3.1,1.15,-2.77);box(r,.08,1.35,.16,0xffedbf,-3.1,1.15,-2.7);box(r,1.26,.08,.16,0xffedbf,-3.1,1.15,-2.7);
 plant(r,3.25,.02,-1.4,1.1);const pencils=group(r,-3.2,0,1);box(pencils,.42,.48,.42,0xf1a36a,0,.24,0);for(let i=0;i<4;i++){const p=box(pencils,.065,.8,.065,[0xf3c452,0x4ebbaa,0xa596d8,0xf6dba8][i],(i-1.5)*.08,.75,0);p.rotation.z=(i-1.5)*.13;}
 const rag=box(r,.65,.05,.5,0x88c8c2,2.6,.025,1.35);rag.rotation.y=.3;const customer=avatar(r,persona.palette?.[0]||0xf2ae65,persona.palette?.[1]||0x74c6b3);customer.root.position.set(-3.0,-1.55,-2.6);customer.root.rotation.y=.35;customer.root.scale.setScalar(.85);
 const waiting=[];for(let i=0;i<2;i++){const a=avatar(r,[0x9bafe0,0xe8ae91][i],[0xf2cf83,0x85c8b1][i]);a.root.position.set(3.25-i*.75,-1.45,-2.65);a.legs.forEach(leg=>leg.rotation.x=-Math.PI/2);a.root.scale.setScalar(.64);a.root.rotation.y=-.25;waiting.push(a);}box(r,1.9,.16,.55,0x85ba9a,2.8,-.75,-2.55);for(const x of [2.15,3.45])box(r,.12,.7,.12,0xc09b6e,x,-1.17,-2.55);
 return {customer,waiting,...makeRepairTools(r),special:specialTools(r)};
}
export function makeMini(parent,type,x){const g=group(parent,x,2.66,-2.55);g.scale.setScalar(.38);if(type==='fan'){box(g,.95,.2,.7,0x41bcac,0,.1,0);box(g,.13,.65,.13,0x41bcac,0,.5,0);disk(g,.65,0x62cdbb,0,1.35,0);ring(g,.67,0xffd476,0,1.35,.06);const p=makePart('rotor',g);p.scale.setScalar(.7);p.position.set(0,1.35,.12);}
 else if(type==='radio'){box(g,1.6,.9,.6,0xf8bd55,0,.5,0);disk(g,.3,0x548b96,-.35,.5,.35);disk(g,.15,0x8c94be,.45,.5,.35);box(g,1,.1,.12,0x467b7c,0,1.1,0);}
 else if(type==='robot'){box(g,.85,.7,.6,0xb29ae8,0,.55,0);box(g,.8,.45,.65,0xb29ae8,0,1.2,0);for(const a of [-.2,.2])box(g,.12,.1,.05,0xffdc72,a,1.23,.35);for(const a of [-.25,.25])box(g,.24,.3,.3,0x607995,a,.1,0);}
 else extraMini(g,type);
 return g;}
