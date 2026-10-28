export const TAU=Math.PI*2;
const clamp=n=>Math.max(0,Math.min(1,n));
// A small persistent surface mask: cleaning removes material only along the
// brush path. Deterministic grain keeps saves and the visible texture aligned.
export class DirtSurface{
 constructor(seed=0,saved){this.size=24;this.seed=seed;this.soil=new Float32Array(576);this.wet=new Float32Array(576);this.original=new Float32Array(576);this.version=0;
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const i=y*24+x,n=this.noise(x,y),r=Math.hypot((x-11.5)/11.3,(y-11.5)/10.5);const a=clamp((1-r+.13*Math.sin(x*.8+seed)+n*.12)*5);this.original[i]=a;this.soil[i]=a;}
  if(typeof saved?.soil==='string'&&saved.soil.length===1152)for(let i=0;i<576;i++)this.soil[i]=Math.min(this.original[i],(parseInt(saved.soil.slice(i*2,i*2+2),16)||0)/255);
  if(typeof saved?.wet==='string'&&saved.wet.length===1152)for(let i=0;i<576;i++)this.wet[i]=(parseInt(saved.wet.slice(i*2,i*2+2),16)||0)/255;
 }
 noise(x,y){const n=Math.sin(x*127.1+y*311.7+this.seed*73.3)*43758.5453;return n-Math.floor(n);}
 get remaining(){let a=0,b=0;for(let i=0;i<576;i++){a+=this.soil[i];b+=this.original[i];}return a/b;}
 get progress(){return 1-this.remaining;}
 get moisture(){let a=0,b=0;for(let i=0;i<576;i++){a+=this.wet[i]*this.soil[i];b+=this.soil[i];}return a/(b||1);}
 apply(u,v,radius=.28,amount=.2,mode='wipe'){
  if(![u,v,radius,amount].every(Number.isFinite)||amount<=0)return 0;
  let changed=0;for(let y=0;y<24;y++)for(let x=0;x<24;x++){const i=y*24+x,d=Math.hypot((x+.5)/24-u,(y+.5)/24-v);if(d>=radius||this.original[i]===0)continue;const weight=Math.pow(1-d/radius,.5);
   if(mode==='spray'){const next=clamp(this.wet[i]+amount*weight);changed+=next-this.wet[i];this.wet[i]=next;}
   else{const before=this.soil[i];this.soil[i]=Math.max(0,before-amount*weight*(mode==='dust'?1:.13+.87*this.wet[i]));changed+=before-this.soil[i];}
  }if(changed>0)this.version++;return changed;
 }
 finish(){this.soil.fill(0);this.version++;}
 toJSON(){const encode=a=>Array.from(a,n=>Math.round(n*255).toString(16).padStart(2,'0')).join('');return {soil:encode(this.soil),wet:encode(this.wet)};}
}
export function clockwiseDelta(previous,current){let d=current-previous;while(d>Math.PI)d-=TAU;while(d< -Math.PI)d+=TAU;return Math.max(-Math.PI/2,Math.min(Math.PI/2,d));}
export const SCREW_TURNS=2;
export function screwAmount(delta){return delta/(TAU*SCREW_TURNS);}
