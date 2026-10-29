import {useState,useEffect,useMemo} from 'react';
import {ALGOS,AN,INFO,actsFor,needOf,hlOf,makeData,gen,build,startFd} from './engine.js';
import {sfx,setMute} from './sound.js';

const Seg=({v,o,on})=><div className="glass flex p-1 gap-1" style={{borderRadius:999}}>{o.map(([k,l])=><button key={String(k)} onClick={()=>on(k)} className={'px-3 py-1.5 rounded-full text-sm font-medium transition '+(v===k?'bg-white/25 shadow':'text-white/60 hover:text-white')}>{l}</button>)}</div>;
const Cfg=({c,set})=><div className="flex flex-wrap gap-2 items-center">
  <select value={c.algo} onChange={e=>set({...c,algo:e.target.value,right:e.target.value==='merge'?false:c.right})}>{ALGOS.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
  <Seg v={c.asc} on={v=>set({...c,asc:v})} o={[[true,'Ascending'],[false,'Descending']]}/>
  {c.algo!=='merge'&&<Seg v={c.right} on={v=>set({...c,right:v})} o={[[false,'Start left'],[true,'Start right']]}/>}
  <Seg v={c.cs} on={v=>set({...c,cs:v})} o={[['Random','Random'],['Best','Best case'],['Worst','Worst case']]}/>
</div>;

const FlagMeter=({up})=><div className="flex items-center gap-3 mb-3">
  <div className="relative w-7 h-14 rounded-full bg-white/10 border border-white/20 overflow-hidden"><div className="absolute left-1 right-1 h-5 rounded-md transition-all duration-500" style={{top:up?3:32,background:up?'#fb7185':'#64748b',boxShadow:up?'0 0 14px #fb7185':'none'}}/></div>
  <span className="text-sm"><b>Swap flag:</b> {up?'UP (a swap happened this pass)':'DOWN'}</span>
</div>;

function Board({st,hl=[],sel=[],rng,done,onPick,tick=0,LV=1}){
  const items=st.a.map((x,s)=>[x,s]).sort((p,q)=>p[0].id-q[0].id);
  const multi=LV>1,RH=138,G=multi?72:0;
  const seg=s=>{const k=st.sg.findIndex(g=>s>=g.l&&s<=g.r);return[k,k<0?0:st.sg[k].d]};
  return <div className="w-full">
    <div className="relative w-full" style={{height:multi?LV*RH+40:350}}>
      {multi&&Array.from({length:LV},(_,d)=><div key={d} className="absolute left-0 right-0 border-b border-dashed border-white/10 text-[10px] text-white/30 text-right" style={{bottom:(LV-1-d)*RH}}>Level {d+1}</div>)}
      {items.map(([x,s])=>{
        const [k,d]=seg(s),out=rng&&(s<rng[0]||s>rng[1]),ht=multi?50+(x.h-148)*1.55:80+(x.h-148)*4.6;
        return <div key={x.id} onClick={()=>onPick&&onPick(s)} className="absolute px-[3px] sm:px-1.5 cursor-pointer" style={{left:`calc((100% - ${G}px)/7*${s} + ${multi?k*12:0}px)`,width:`calc((100% - ${G}px)/7)`,bottom:multi?(LV-1-d)*RH:0,transition:'left .22s ease-out,bottom .22s ease-out,opacity .15s',opacity:out?.35:1}}>
          <div className={'bar '+(sel.includes(s)?'sel ':'')+(hl.includes(s)?'hl'+(tick%2)+' ':'')+(st.p===x.id?'pv ':'')+(done||st.sd.includes(x.id)?'ok':'')} style={{height:ht,transform:st.h===x.id?'translateY(-26px)':'none','--c':200+(x.h-150)*3}}>
            {st.p===x.id&&<span className="ind pvi" style={{top:-30}}>▼ PIVOT</span>}
            {st.v===x.id&&<span className="ind vai" style={{top:st.p===x.id?-58:-30}}>◆ VAR</span>}
            <div className="flip" style={{transform:st.fd.includes(x.id)?'rotateY(180deg)':'none'}}>
              <div className="face"><span className="text-[11px] sm:text-sm font-semibold">{x.h}</span><span className="text-[10px] sm:text-xs opacity-70 mt-auto">{x.n}</span></div>
              <div className="face back">?</div>
            </div>
          </div>
        </div>})}
    </div>
    {!multi&&<div className="flex mt-2 text-xs text-white/40">{[1,2,3,4,5,6,7].map(i=><div key={i} className="flex-1 text-center">slot {i}</div>)}</div>}
  </div>;
}

function Learn(){
  const [c,setC]=useState({algo:'bubble',asc:true,right:false,cs:'Random'}),[seed,setSeed]=useState(0),[i,setI]=useState(0),[pl,setPl]=useState(false),[sp,setSp]=useState(600);
  const M=useMemo(()=>{const d=makeData(c.cs,c.asc);const o=gen(c.algo,d,c.asc,c.right);return{o,S:build(d,o,startFd(c.algo,d,c.right))}},[c,seed]);
  useEffect(()=>{setI(0);setPl(false)},[M]);
  useEffect(()=>{if(!pl)return;const t=setInterval(()=>setI(v=>{if(v>=M.o.length){setPl(false);return v}return v+1}),sp);return()=>clearInterval(t)},[pl,M,sp]);
  const op=M.o[i-1],hl=hlOf(op);
  useEffect(()=>{if(i>0)sfx(M.o[i-1].k)},[i]);
  const end=i>=M.o.length;
  return <div className="fade space-y-4">
    <Cfg c={c} set={setC}/>
    <div className="glass p-4 sm:p-6">
      <p className="text-white/70 text-sm">{INFO[c.algo][0]}</p>
      <p className="text-cyan-300 text-sm font-semibold mt-1">{INFO[c.algo][1]}</p>
    </div>
    <div className="glass p-4 sm:p-6">
      {c.algo==='bubbleO'&&<FlagMeter up={M.S[i].fl}/>}
      <Board st={M.S[i]} hl={hl} rng={op&&op.r} done={end} tick={i} LV={M.S.LV}/>
      <div className="h-1.5 rounded-full bg-white/10 mt-4 overflow-hidden"><div className="h-full rounded-full" style={{width:`${i/M.o.length*100}%`,background:'linear-gradient(90deg,#5ee7ff,#a78bfa)',transition:'width .4s'}}/></div>
      <p key={i} className="fade mt-4 min-h-[3rem] text-base sm:text-lg">{i===0?`Lineup ready. Sort by height, ${c.asc?'shortest':'tallest'} on the left, starting from the ${c.right?'right':'left'}.`:op.t}</p>
      <p className="text-xs text-white/40 mb-3">Step {i} of {M.o.length}{end?' · Sorted!':''}</p>
      <div className="flex flex-wrap gap-2">
        <button className="btn" disabled={i===0} onClick={()=>{setPl(false);setI(i-1)}}>Back</button>
        <button className="btn pri" onClick={()=>{if(end)setI(0);setPl(!pl)}}>{pl?'Pause':'Play'}</button>
        <button className="btn" disabled={end} onClick={()=>{setPl(false);setI(i+1)}}>Next</button>
        <button className="btn" onClick={()=>setI(0)}>Restart</button>
        <button className="btn" onClick={()=>setSeed(seed+1)}>New heights</button>
        <Seg v={sp} on={setSp} o={[[1100,'Slow'],[600,'Normal'],[250,'Fast']]}/>
      </div>
    </div>
  </div>;
}

function Game({cfg,hint,quiz,onFinish}){
  const {ops,S}=useMemo(()=>{const d=makeData(cfg.cs,cfg.asc);const o=gen(cfg.algo,d,cfg.asc,cfg.right);return{ops:o,S:build(d,o,startFd(cfg.algo,d,cfg.right))}},[cfg]);
  const [p,setP]=useState(0),[sel,setSel]=useState([]),[bad,setBad]=useState(0),[msg,setMsg]=useState(''),[mis,setMis]=useState(0),[hints,setHints]=useState(0),[showFor,setShowFor]=useState(-1);
  const done=p>=ops.length,o=ops[p],last=ops[p-1];
  const pen=mis*5+hints*10;
  const pick=s=>{if(done)return;sfx('tap');setSel(v=>v.includes(s)?v.filter(x=>x!==s):[...v.slice(-1),s])};
  const act=k=>{
    if(done)return;
    const need=needOf(o);
    const ok=k===o.k&&((o.k==='up'||o.k==='down')||(need.length===sel.length&&need.every(x=>sel.includes(x))));
    if(ok){sfx(o.k);setMsg((o.k==='cmp'?'':'✓ ')+o.t);setP(p+1);setSel([]);if(p+1===ops.length){setTimeout(()=>sfx('done'),400);onFinish&&onFinish(pen)}}
    else{sfx('bad');setMis(m=>m+1);setBad(b=>b+1);setMsg('✗ Not quite. That was the wrong move for this step.');setSel([])}
  };
  const hl=hlOf(last);
  const showHint=hint||showFor===p;
  return <div className="glass p-4 sm:p-6 fade">
    <div className="flex flex-wrap justify-between gap-2 mb-4 text-sm">
      <span className="text-white/70">{AN[cfg.algo]} · {cfg.asc?'Ascending':'Descending'} · start {cfg.right?'right':'left'} · {cfg.cs==='Random'?'random':cfg.cs.toLowerCase()+' case'}</span>
      <span className="font-semibold">{quiz?`Marks ${Math.max(0,100-pen)}/100`:`Mistakes ${mis}`} · Step {Math.min(p+1,ops.length)}/{ops.length}</span>
    </div>
    {cfg.algo==='bubbleO'&&<FlagMeter up={S[p].fl}/>}
    <Board st={S[p]} hl={hl} sel={sel} rng={o&&o.r} done={done} onPick={pick} tick={p} LV={S.LV}/>
    <div key={bad} className={'mt-4 min-h-[3rem] '+(msg.startsWith('✗')?'shake text-rose-300':'')}>{msg||'Tap the people involved, then press the matching action.'}</div>
    {!done&&showHint&&<p className="text-amber-300 text-sm mt-1">Task: {o.q}</p>}
    {!done&&!hint&&showFor!==p&&<button className="text-xs text-white/50 underline mt-1" onClick={()=>{setHints(h=>h+1);setShowFor(p)}}>Show this step’s task (−10 marks)</button>}
    {done?<p className="mt-3 text-emerald-300 font-semibold fade">Sorted! {quiz?'':`You made ${mis} mistake${mis===1?'':'s'}.`}</p>
    :<div className="flex flex-wrap gap-2 mt-4">{actsFor(cfg.algo).map(([k,l])=><button key={k} className="btn" onClick={()=>act(k)}>{l}</button>)}</div>}
  </div>;
}

function Practice(){
  const [c,setC]=useState({algo:'bubble',asc:true,right:false,cs:'Random'}),[key,setKey]=useState(0);
  return <div className="space-y-4 fade">
    <Cfg c={c} set={v=>{setC(v);setKey(key+1)}}/>
    <Game key={key} cfg={c} hint/>
    <button className="btn" onClick={()=>setKey(key+1)}>New round</button>
  </div>;
}

function Quiz(){
  const [ph,setPh]=useState('name'),[name,setName]=useState(''),[cfg,setCfg]=useState(null),[res,setRes]=useState(null);
  const [scores,setScores]=useState(()=>{try{return JSON.parse(localStorage.getItem('sortlab_scores')||'[]')}catch(e){return[]}});
  const start=()=>{const r=a=>a[Math.floor(Math.random()*a.length)];setRes(null);const al=r(ALGOS)[0];setCfg({algo:al,asc:Math.random()<.5,right:al!=='merge'&&Math.random()<.5,cs:r(['Random','Random','Best','Worst']),key:Date.now()});setPh('play')};
  const fin=pen=>{const e={name,score:Math.max(0,100-pen),algo:AN[cfg.algo],t:new Date().toLocaleString()};const l=[...scores,e];setScores(l);try{localStorage.setItem('sortlab_scores',JSON.stringify(l))}catch(x){}setRes(e)};
  const dl=()=>{try{const b=new Blob([scores.map(s=>`${s.name} - ${s.score}/100 - ${s.algo} - ${s.t}`).join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='scores.txt';a.click()}catch(e){}};
  const top=[...scores].sort((a,b)=>b.score-a.score).slice(0,5);
  if(ph==='name')return <div className="glass p-6 sm:p-8 max-w-md mx-auto fade space-y-4">
    <h2 className="text-2xl font-semibold">Ready for the quiz?</h2>
    <p className="text-white/70 text-sm">You start with 100 marks. Each mistake costs 5 marks and each revealed task costs 10. You get a random algorithm, order and starting side.</p>
    <input placeholder="Enter your name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&name.trim()&&start()}/>
    <button className="btn pri w-full" disabled={!name.trim()} onClick={start}>Start quiz</button>
    {top.length>0&&<div className="text-sm text-white/70"><p className="font-semibold text-white mb-1">Top scores</p>{top.map((s,i)=><p key={i}>{s.name}: {s.score}/100 · {s.algo}</p>)}</div>}
  </div>;
  return <div className="space-y-4 fade">
    <p className="text-white/70">Player: <b className="text-white">{name}</b></p>
    <Game key={cfg.key} cfg={cfg} quiz onFinish={fin}/>
    {res&&<div className="glass p-5 fade space-y-3">
      <p className="text-xl font-semibold">{res.name}, you scored {res.score}/100</p>
      <p className="text-xs text-white/50">Saved as: {res.name} - {res.score}/100 - {res.algo}</p>
      <div className="flex flex-wrap gap-2"><button className="btn pri" onClick={start}>Next round</button><button className="btn" onClick={dl}>Download scores.txt</button></div>
    </div>}
  </div>;
}

function Home({go}){
  const hs=[60,120,90,180,140,210,100];
  return <div className="text-center fade pt-8 sm:pt-16">
    <div className="flex items-end justify-center gap-2 h-24 mb-6">{hs.map((h,i)=><span key={i} className="w-6 rounded-t-xl" style={{height:h*.45,background:`linear-gradient(180deg,hsl(${200+i*18} 90% 70%/.8),hsl(${200+i*18} 80% 50%/.2))`,transformOrigin:'bottom',animation:`bob ${2+i*.25}s ease-in-out infinite`,animationDelay:`${i*.15}s`}}/>)}</div>
    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight" style={{background:'linear-gradient(90deg,#5ee7ff,#a78bfa,#f472b6)',WebkitBackgroundClip:'text',color:'transparent'}}>SortLab</h1>
    <p className="max-w-xl mx-auto mt-4 text-white/70">Master the Data Structures &amp; Algorithms sorting methods: Bubble, Insertion, Selection, Merge and Quick sort, plus the optimized versions, in ascending and descending order from either side. Seven people, one lineup, sorted by height.</p>
    <p className="mt-3 text-sm text-white/50">Created by <b className="text-white/80">Chathusha Pehemina</b></p>
    <div className="grid sm:grid-cols-3 gap-4 mt-10 text-left">
      {[['learn','Learn','Watch every step animate for any method, order and starting side.'],['practice','Practice','Do the moves yourself: compare, swap, pivot, pass variable, insert and merge.'],['quiz','Quiz','Random challenge. Start with 100 marks and lose some for each mistake.']].map(([k,t,d],i)=>
        <button key={k} onClick={()=>go(k)} className="glass p-6 text-left transition hover:-translate-y-1 active:scale-95 fade" style={{animationDelay:`${i*.1}s`}}>
          <div className="text-2xl font-semibold mb-2">{t}</div><div className="text-sm text-white/65">{d}</div>
        </button>)}
    </div>
  </div>;
}

export default function App(){
  const [s,setS]=useState('home'),[mu,setMu]=useState(false);
  return <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
    <button className="btn !py-1.5 !px-3 text-sm" style={{position:'fixed',top:'calc(env(safe-area-inset-top,0px) + 10px)',right:10,zIndex:50}} onClick={()=>{setMute(!mu);setMu(!mu)}}>{mu?'Sound: off':'Sound: on'}</button>
    {s!=='home'&&<div className="flex items-center justify-between mb-6"><button className="btn" onClick={()=>setS('home')}>← Home</button><div className="flex gap-1">{['learn','practice','quiz'].map(k=><button key={k} onClick={()=>setS(k)} className={'px-3 py-1.5 rounded-full text-sm capitalize '+(s===k?'bg-white/20':'text-white/50')}>{k}</button>)}</div></div>}
    {s==='home'&&<Home go={setS}/>}
    {s==='learn'&&<Learn/>}
    {s==='practice'&&<Practice/>}
    {s==='quiz'&&<Quiz/>}
    <p className="text-center text-xs text-white/40 mt-10">Created by <b className="text-white/70">Chathusha Pehemina</b></p>
  </div>;
}
