// Tiny Web Audio synth for sound effects (no audio files needed)
let AC=null,MUTE=false;
export const setMute=v=>{MUTE=v};
const tone=(f,d=.12,type='sine',v=.12,t0=0,f2)=>{const t=AC.currentTime+t0,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.03)};
const FX={
  tap:()=>tone(900,.04,'sine',.06),
  cmp:()=>{tone(520,.07,'triangle',.1);tone(660,.07,'triangle',.08,.07)},
  swap:()=>{tone(280,.2,'sine',.14,0,640);tone(640,.16,'sine',.09,.1,300)},
  move:()=>tone(350,.28,'triangle',.14,0,780),
  turn:()=>{tone(1200,.04,'square',.05);tone(500,.25,'sine',.1,.03,900)},
  hold:()=>{tone(440,.1,'sine',.12);tone(660,.14,'sine',.1,.09)},
  pass:()=>{tone(660,.08,'triangle',.1);tone(990,.12,'triangle',.1,.07)},
  pivot:()=>{tone(784,.3,'sine',.12);tone(1176,.35,'sine',.08,.05)},
  up:()=>tone(400,.3,'sawtooth',.07,0,900),
  down:()=>tone(900,.3,'sawtooth',.07,0,400),
  split:()=>{tone(700,.12,'triangle',.1);tone(420,.2,'triangle',.1,.1)},
  join:()=>{tone(420,.12,'triangle',.1);tone(700,.2,'triangle',.1,.1)},
  repos:()=>{tone(420,.1,'triangle',.1);tone(760,.18,'triangle',.1,.08)},
  aside:()=>tone(300,.18,'sine',.12,0,560),
  sorted:()=>{tone(880,.12,'sine',.1);tone(1320,.2,'sine',.09,.08)},
  bad:()=>tone(150,.3,'sawtooth',.13,0,90),
  done:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,'sine',.12,i*.11))
};
export function sfx(k){if(MUTE)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();(FX[k]||FX.cmp)()}catch(e){}}
