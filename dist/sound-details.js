// Short, gesture-linked Foley, generated locally; no downloaded sound assets.
export class RepairSound{
 constructor(audio){this.audio=audio;this.last=0;this.noise=null;}
 noiseHit(duration,frequency,gain=.025){const a=this.audio,c=a.context;if(!a.enabled||!c)return;
  if(!this.noise){this.noise=c.createBuffer(1,c.sampleRate*.6,c.sampleRate);const data=this.noise.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=.6*previous+.4*(Math.random()*2-1);data[i]=previous*2;}}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),volume=c.createGain(),time=c.currentTime;source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.6;volume.gain.setValueAtTime(.0001,time);volume.gain.linearRampToValueAtTime(gain,time+.012);volume.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(filter);filter.connect(volume);volume.connect(c.destination);source.start(time);source.stop(time+duration+.02);
 }
 stroke(wet,speed){if(performance.now()-this.last<65)return;this.last=performance.now();this.noiseHit(.11,wet> .3?950:1900,Math.min(.065,.018+speed*.004));}
 spray(){if(performance.now()-this.last<95)return;this.last=performance.now();this.noiseHit(.15,3400,.047);}
 click(tension=0){this.noiseHit(.035,2500,.05);this.audio.tone(300+tension*400,.045,'triangle',.03,0,180);}
 seat(){this.audio.tone(145,.12,'triangle',.065,0,75);this.noiseHit(.075,1900,.06);this.audio.tone(910,.07,'sine',.025,.07,650);}
}
