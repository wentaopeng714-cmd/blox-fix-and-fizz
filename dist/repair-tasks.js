const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ZONES=[[.27,.41],[.53,.67],[.76,.88]];
export class RepairTask{
 constructor(def,saved={}){this.def=def;this.type=def.type;this.count=Math.max(0,Math.floor(saved.count||0));this.values=(def.points||[]).map((_,i)=>clamp(+saved.values?.[i]||0));this.value=clamp(Number.isFinite(saved.value)?saved.value:.12);this.level=clamp(+saved.level||0);this.progress=clamp(+saved.progress||0);this.armed=saved.armed!==false;this.done=!!saved.done;this.pluckId=0;this.lastPluckGood=false;}
 get zone(){return this.type==='strings'?ZONES[Math.min(2,this.count)]:this.type==='pump'?[.65,.85]:[.35,.62];}
 get fraction(){if(this.done)return 1;if(['wire','stitch','seal'].includes(this.type))return this.count/this.def.points.length;if(['oil','press'].includes(this.type))return this.values.reduce((a,b)=>a+b,0)/this.values.length;if(this.type==='strings')return this.count/3;if(this.type==='pump')return Math.min(1,this.level/.72);return this.progress;}
 act(kind,data={}){if(this.done)return {changed:false};let changed=false,wrong=false;
  if(kind==='value'&&Number.isFinite(data.value)){this.value=clamp(data.value);changed=true;if(this.type==='pump'){if(this.value<.15)this.armed=true;if(this.value>.85&&this.armed){this.armed=false;this.level=clamp(this.level+.18);this.count++;}}}
  if(this.type==='wire'&&kind==='connect'){if(data.source===data.target&&Number.isInteger(data.source)&&data.source>=0&&data.source<3){if(this.values[data.source]!==1){this.values[data.source]=1;this.count++;changed=true;}}else wrong=true;this.done=this.count>=3;}
  if(['oil','press'].includes(this.type)&&kind==='apply'&&Number.isInteger(data.index)&&this.values[data.index]!==undefined&&Number.isFinite(data.amount)){const i=data.index;this.values[i]=clamp(this.values[i]+Math.max(0,data.amount));changed=true;this.done=this.values.every(v=>v>=1);}
  if(['stitch','seal'].includes(this.type)&&kind==='trace'){if(data.index===this.count){this.count++;changed=true;this.done=this.count>=this.def.points.length;}else if(data.index>this.count)wrong=true;}
  if(this.type==='pump'&&kind==='vent'){this.level=clamp(this.level-.12);changed=true;}
  if(this.type==='pump'&&kind==='check'){if(this.level>=.65&&this.level<=.85){this.done=true;changed=true;}else wrong=true;}
  if(this.type==='wind'&&kind==='turn'&&Number.isFinite(data.angle)){this.progress=clamp(this.progress+data.angle/(Math.PI*4));changed=true;this.done=this.progress>=1;}
  if(this.type==='strings'&&kind==='pluck'){this.pluckId++;const [a,b]=this.zone;this.lastPluckGood=this.value>=a&&this.value<=b;if(this.lastPluckGood){this.count++;this.done=this.count>=3;this.value=.12;changed=true;}else wrong=true;}
  return {changed,wrong,done:this.done};
 }
 update(dt){if(this.done||this.type!=='pour')return false;if(this.value>=.35&&this.value<=.62){this.progress=clamp(this.progress+dt/3.6);if(this.progress>=1){this.done=true;return true;}}return false;}
 toJSON(){return {count:this.count,values:this.values,value:this.value,level:this.level,progress:this.progress,armed:this.armed,done:this.done};}
}
