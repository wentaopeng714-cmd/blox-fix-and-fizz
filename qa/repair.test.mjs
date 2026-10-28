import assert from 'node:assert/strict';
import {JOBS,RepairJob,collectCards} from '../dist/engine.js';
import {DirtSurface,clockwiseDelta,screwAmount,TAU} from '../dist/tactile.js';
let checks=0;
function solveSpecial(j){let guard=0;while(j.phase==='repair'&&guard++<15){const t=j.activeTask;if(t.type==='wire'){j.action('connect',{source:0,target:1});assert.equal(t.count,0);for(let i=0;i<3;i++)j.action('connect',{source:i,target:i});}
 else if(t.type==='oil'||t.type==='press'){t.values.forEach((_,i)=>j.action('apply',{index:i,amount:1}));}
 else if(t.type==='pump'){for(let i=0;i<4;i++){j.action('value',{value:0});j.action('value',{value:1});}assert.ok(Math.abs(t.level-.72)<1e-8);j.action('check');}
 else if(t.type==='wind'){j.action('turn',{angle:Math.PI*4});}
 else if(t.type==='strings'){j.action('pluck');assert.equal(t.count,0);for(let i=0;i<3;i++){j.action('value',{value:(t.zone[0]+t.zone[1])/2});j.action('pluck');}}
 else if(t.type==='stitch'||t.type==='seal'){j.action('trace',{index:2});assert.equal(t.count,0);t.def.points.forEach((_,i)=>j.action('trace',{index:i}));}
 else if(t.type==='pour'){j.action('value',{value:.95});j.update(5);assert.equal(t.progress,0);j.action('value',{value:.5});j.update(3.7);}
 else throw Error('Unverified task '+t.type);assert.equal(t.done,true);checks++;}assert.ok(guard<15);}
for(const spec of JOBS){
 const j=new RepairJob(spec);
 assert.equal(j.phase,spec.id==='fan'||spec.id==='can'?'clean':spec.id==='lamp'?'repair':'assemble');
 if(spec.dirt.length)assert.equal(j.install(spec.parts[0].id,spec.parts[0].slot),false);
 spec.dirt.forEach((_,i)=>assert.equal(j.clean(i),true));
 if(spec.repairFirst){assert.equal(j.install(spec.parts[0].id,spec.parts[0].slot),false);solveSpecial(j);}
 assert.equal(j.clean(0),false);assert.equal(j.phase,'assemble');checks++;
 assert.equal(j.install(spec.parts[0].id,'wrong-slot'),false);assert.equal(j.installed.size,0);checks++;
 spec.parts.forEach(p=>{assert.equal(j.install(p.id,p.slot),true);assert.equal(j.install(p.id,p.slot),false);});checks++;
 if(spec.id==='radio'){
  j.tune(.1);j.update(3);assert.equal(j.phase,'tune');
  j.tune(.69);j.update(.4);assert.equal(j.phase,'tune');
  j.tune(.2);j.update(.1);j.tune(.69);j.update(.3);assert.equal(j.phase,'tune');
  j.update(.31);assert.equal(j.phase,'test');checks++;
 }else{j.bolts.forEach((_,i)=>{assert.equal(j.tighten(i,.5),false);assert.equal(j.placeBolt(i),true);assert.equal(j.placeBolt(i),false);assert.equal(j.tighten(i,.6),true);assert.equal(j.phase,'screw');j.tighten(i,-.2);assert.ok(Math.abs(j.bolts[i]-.4)<1e-8);j.tighten(i,.7);assert.equal(j.tighten(i,1),false);});assert.equal(j.phase,spec.steps?.length&&!spec.repairFirst?'repair':'test');checks++;}
 solveSpecial(j);assert.equal(j.phase,'test');
 j.update(.7,true);assert.equal(j.completed,false);j.update(2,false);assert.equal(j.testProgress,0);checks++;
 const resumed=new RepairJob(spec,j.toJSON());assert.equal(resumed.phase,'test');assert.equal(resumed.testProgress,0);checks++;
 j.events=[];j.update(1.5,true);j.update(10,true);assert.equal(j.completed,true);assert.equal(j.events.filter(e=>e.type==='complete').length,1);checks++;
 assert.equal(j.returnItem(),true);assert.equal(j.returnItem(),false);const done=new RepairJob(spec,j.toJSON());assert.equal(done.phase,'done');assert.equal(done.returned,true);checks++;
}
const partial=new RepairJob(JOBS[0]);partial.clean(0);partial.clean(2);const restored=new RepairJob(JOBS[0],partial.toJSON());assert.deepEqual([...restored.cleaned],[0,2]);assert.equal(restored.phase,'clean');checks++;
const invalid=new RepairJob(JOBS[0],{completed:true,installed:['imaginary'],cleaned:[-1,NaN,999]});assert.equal(invalid.phase,'clean');assert.equal(invalid.completed,false);checks++;
console.log(`${checks} repair workflow checks passed.`);
const dry=new DirtSurface(7),wet=new DirtSurface(7);
wet.apply(.5,.5,.6,3,'spray');
assert.equal(wet.progress,0,'Spray must not erase dirt');checks++;
dry.apply(.5,.5,.3,.4,'wipe');wet.apply(.5,.5,.3,.4,'wipe');
assert.ok(dry.progress>0&&dry.progress<.15,'A short dry swipe removes only a local amount');checks++;
assert.ok(wet.progress>dry.progress*3,'Wetting makes an equivalent stroke more effective');checks++;
assert.ok(wet.progress<.5,'One local stroke must leave surrounding dirt');checks++;
const cellOutside=23*24+12;assert.equal(wet.soil[cellOutside],wet.original[cellOutside]);checks++;
const savedSurface=new DirtSurface(7,wet.toJSON());assert.ok(Math.abs(savedSurface.progress-wet.progress)<.006);checks++;
assert.equal(wet.apply(.5,.5,.3,0,'wipe'),0,'Holding a stationary sponge does not clean');checks++;
const actual=new RepairJob(JOBS[0]);actual.spec.dirt.forEach((_,i)=>{assert.equal(actual.brush(i,.5,.5,2,3,'spray'),false);actual.brush(i,.5,.5,2,3,'brush');});assert.equal(actual.phase,'assemble');checks++;
assert.ok(clockwiseDelta(3,-3)>0);assert.ok(clockwiseDelta(-3,3)<0);checks++;
assert.equal(screwAmount(TAU*2),1);assert.equal(screwAmount(-TAU),-.5);checks++;
const resumedScrew=new RepairJob(JOBS[0],{cleaned:JOBS[0].dirt.map((_,i)=>i),installed:['rotor'],bolts:[.4,0],boltsPlaced:[true,false]});assert.equal(resumedScrew.boltsPlaced[0],true);assert.equal(resumedScrew.boltsPlaced[1],false);assert.equal(resumedScrew.bolts[0],.4);checks++;
const residue=new RepairJob(JOBS[9]);for(const s of residue.surfaces){for(let i=0;i<s.soil.length;i++)s.soil[i]*=.05;}
const residueReloaded=new RepairJob(JOBS[9],residue.toJSON());assert.equal(residueReloaded.phase,'assemble','Tiny remaining edge pixels must not block the workflow after reload');checks++;
const beforeCleaning=new RepairJob(JOBS[0]);assert.equal(beforeCleaning.placeBolt(0),false,'Screws cannot be placed before preparing the object');checks++;
assert.equal(JOBS.length,10);assert.equal(new Set(JOBS.map(j=>j.id)).size,10);checks++;
const {RepairTask}=await import('../dist/repair-tasks.js');
const pump=new RepairTask(JOBS.find(j=>j.id==='bike').steps[1]);pump.act('value',{value:1});pump.act('value',{value:1});assert.equal(pump.count,1,'Holding the pump at the bottom must not add strokes');pump.act('value',{value:0});pump.act('value',{value:1});assert.equal(pump.count,2);checks++;
for(let i=0;i<4;i++){pump.act('value',{value:0});pump.act('value',{value:1});}assert.equal(pump.act('check').wrong,true);pump.act('vent');pump.act('vent');assert.equal(pump.act('check').done,true);checks++;
const partialTask=new RepairTask(JOBS.find(j=>j.id==='bear').steps[0]);partialTask.act('trace',{index:0});partialTask.act('trace',{index:1});const resumedTask=new RepairTask(partialTask.def,partialTask.toJSON());assert.equal(resumedTask.count,2);assert.equal(resumedTask.done,false);resumedTask.act('trace',{index:0});assert.equal(resumedTask.count,2);checks++;
const lampSpec=JOBS.find(j=>j.id==='lamp'),wrongWire=new RepairJob(lampSpec,{cleaned:lampSpec.dirt.map((_,i)=>i),installed:['bulb']});wrongWire.action('connect',{source:0,target:1});assert.equal(wrongWire.events.at(-1).type,'repairWrong');assert.equal(wrongWire.events.at(-1).repairType,'wire');checks++;
const legacy=[new RepairJob(JOBS[0],{cleaned:[0,1]}).toJSON(),{},{}],expanded=JOBS.map((s,i)=>new RepairJob(s,legacy[i]));assert.equal(expanded[0].cleaned.size,2);assert.equal(expanded.slice(3).filter(j=>j.phase==='clean'&&!j.completed).length,1);checks++;
assert.equal(new RepairJob(JOBS[9]).returnItem(),false,'An unfinished item must not award a thank-you card');checks++;
const carriedCards=collectCards(JOBS.map(s=>new RepairJob(s)),['lamp','bear']);assert.deepEqual(carriedCards,['lamp','bear'],'Thank-you cards survive starting a new day');assert.deepEqual(collectCards([],['lamp','lamp','invalid']),['lamp']);checks++;
console.log(`${checks} total checks passed, including surface masks and directional screws.`);

assert.equal(JOBS.filter(j=>j.cleaning==='wash').length,1);assert.equal(JOBS.filter(j=>j.cleaning==='brush').length,1);assert.equal(JOBS.filter(j=>j.cleaning==='none').length,8);checks++;
for(const spec of JOBS.filter(j=>j.cleaning==='none')){const j=new RepairJob(spec,{cleaned:[0,1],surfaces:[wet.toJSON()]});assert.equal(j.surfaces.length,0);assert.equal(j.cleaningProgress,1);assert.equal(j.brush(0,.5,.5,1,1,'spray'),false);checks++;}
const dryBrush=new DirtSurface(7);dryBrush.apply(.5,.5,.3,.4,'dust');assert.ok(dryBrush.progress>dry.progress*3);assert.equal(dryBrush.moisture,0);checks++;
const canWash=new RepairJob(JOBS[9]);assert.equal(canWash.brush(0,.5,.5,1,1,'brush'),false);assert.equal(canWash.brush(0,.5,.5,1,1,'spray'),true);assert.equal(canWash.cleaningProgress,0);checks++;
const oldRadio=new RepairJob(JOBS[1],{completed:true,returned:true,cleaned:[0,1,2,3,4,5,6],installed:['antenna','dial'],calibrated:true,time:142});assert.equal(oldRadio.phase,'done');assert.equal(oldRadio.returned,true);assert.equal(oldRadio.time,142);checks++;
const newLamp=new RepairJob(lampSpec);assert.equal(newLamp.phase,'repair');solveSpecial(newLamp);assert.equal(newLamp.phase,'assemble');assert.equal(newLamp.install('bulb','bulb'),true);assert.equal(newLamp.phase,'test');checks++;
console.log(checks+' total checks passed for varied workflows and legacy saves.');
