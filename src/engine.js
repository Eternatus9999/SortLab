// Sorting engine: builds the list of moves for each algorithm
export const NAMES=['Ava','Ben','Chen','Dina','Eli','Farah','Gus'];
export const ALGOS=[['bubble','Bubble Sort'],['insert','Insertion Sort'],['select','Selection Sort'],['merge','Merge Sort'],['quick','Quick Sort'],['bubbleO','Bubble Sort (Optimized)'],['insertO','Insertion Sort (Optimized)'],['quickO','Quick Sort (Optimized)']];
export const AN=Object.fromEntries(ALGOS);
export const INFO={
bubble:['Compare neighbours and swap them if out of order. Every pass pushes one person into their final place.','Best O(n²) · Worst O(n²)'],
bubbleO:['Same as bubble sort, but you manage a flag yourself: raise it when a swap happens, lower it after every pass. If the flag stays down for a whole pass, nothing moved, so stop.','Best O(n) · Worst O(n²)'],
insert:['Everyone except the starting person faces backward. A person turns to face front and becomes the variable. Compare with the people on the left: every taller person (shorter when descending) moves aside, and the variable keeps going left until its correct position is found.','Best O(n) · Worst O(n²)'],
insertO:['Everyone except the starting person faces backward. A person turns to face front and becomes the variable, is compared with the people on the left until the correct position is found, then is inserted there in one step.','Best O(n) · Worst O(n²)'],
select:['Choose a person to hold the variable (the best candidate so far). Compare everyone else; whenever someone should come first, pass the variable to them. Finally swap the holder into the front of the unsorted part.','Best O(n²) · Worst O(n²)'],
merge:['Split the lineup in halves (every split drops to a new level) until single people remain, then merge back up: compare the front people of the two groups and reposition the one who goes first (shorter first when ascending, taller first when descending) back to the level before the split. When one group is used up, everyone left in the other group repositions together in one step. The left half is always handled first, then the right half, then they merge.','Best O(n log n) · Worst O(n log n)'],
quick:['The rightmost person is the pivot. A person holds the variable, which marks where the next person who belongs before the pivot goes (start left) or after it (start right). When the holder is swapped, the variable passes to the other person automatically; pass it on after each placement. Finally swap the pivot into its slot, then split around it. The left side is always done first, then the right side, then both merge. A sorted side waits at its level while the other side is still unsorted; once both sides are sorted they merge back to the level of the pivot together. A group of one person is not compared with anyone: you just press Sorted.','Best O(n log n) · Worst O(n²)'],
quickO:['Same rightmost pivot, variable and split. The variable holder is checked against the pivot first; if it belongs on the other side, search from the pivot side for a person to swap with it (the variable passes automatically). The left side is always done first, then the right side, then both merge; a sorted side waits until the other side is sorted before merging back. A group of one person is not compared with anyone: you just press Sorted.','Best O(n log n) · Worst O(n²)']};
export const actsFor=al=>{const q=al.startsWith('quick'),ins=al.startsWith('insert'),m=al==='merge',s=al==='select',b=al.startsWith('bubble');
  return [['cmp','Compare'],...(b||s||q?[['swap','Swap']]:[]),...(q?[['pivot','Pivot']]:[]),...(s||q?[['hold','Choose variable holder'],['pass','Pass variable']]:[]),...(ins?[['turn','Turn front'],...(al==='insert'?[['aside','Move aside']]:[['move','Insert']])]:[]),...(m?[['split','Split'],['repos','Reposition']]:[]),...(q?[['split','Split'],['sorted','Sorted'],['join','Merge']]:[]),...(al==='bubbleO'?[['up','Raise flag'],['down','Lower flag']]:[])]};
// which people must be tapped for a step
export const needOf=o=>(o.k==='up'||o.k==='down')?[]:(['cmp','swap','move','pass','split','join','aside'].includes(o.k)||o.all?[...new Set([o.i,o.j])]:[o.i]).filter(x=>x!==undefined);
export const hlOf=o=>!o?[]:o.all?Array.from({length:Math.abs(o.i-o.j)+1},(_,x)=>Math.min(o.i,o.j)+x):(o.k==='move'||o.k==='repos')?[o.j]:o.k==='join'?Array.from({length:o.r[1]-o.r[0]+1},(_,x)=>o.r[0]+x):(o.k==='up'||o.k==='down')?[]:[o.i,o.j].filter(x=>x!==undefined);

export function makeData(cs,asc){
  const hs=new Set();while(hs.size<7)hs.add(150+Math.floor(Math.random()*46));
  let l=[...hs].sort(()=>Math.random()-.5);
  const s=[...hs].sort((a,b)=>asc?a-b:b-a);
  if(cs==='Best')l=s;else if(cs==='Worst')l=[...s].reverse();
  return l.map((h,i)=>({id:i,n:NAMES[i],h}));
}

// Generates the list of primitive moves for one algorithm.
// Bubble, insertion, selection and merge sort run on a mirrored lineup when starting from the right.
// Quick sort always uses the rightmost person as the pivot, so it is never mirrored.
export function gen(al,arr,asc,right){
  const n=arr.length,O=al.endsWith('O'),qk=al.startsWith('quick'),mir=right&&!qk&&al!=='merge';
  const a=mir?[...arr].reverse():[...arr],ops=[];
  const rt=x=>mir?n-1-x:x,S=x=>rt(x)+1;
  const bf=(x,y)=>(asc!==mir)?x.h<y.h:x.h>y.h;
  const rg=(l,r)=>{const u=rt(l),v=rt(r);return[Math.min(u,v),Math.max(u,v)]};
  const cmp=(i,j,r)=>{const x=a[i],y=a[j];ops.push({k:'cmp',i:rt(i),j:rt(j),r,q:`Compare ${x.n} and ${y.n}`,t:`Compared ${x.n} (${x.h} cm) with ${y.n} (${y.h} cm): ${x.h>y.h?x.n:y.n} is taller.`});return bf(x,y)};
  const swap=(i,j,r)=>{const x=a[i],y=a[j];ops.push({k:'swap',i:rt(i),j:rt(j),r,q:`Swap ${x.n} and ${y.n}`,t:`Swapped ${x.n} and ${y.n} (slots ${S(i)} and ${S(j)}) because they were in the wrong order.`});[a[i],a[j]]=[a[j],a[i]]};
  const mv=(i,j,lab,r)=>{const x=a[i],y=a[j];ops.push({k:'move',i:rt(i),j:rt(j),r,q:`${lab} ${x.n} into slot ${S(j)} (where ${y.n} stands now)`,t:`${lab}: ${x.n} moves to slot ${S(j)} and the others shift over.`});a.splice(i,1);a.splice(j,0,x)};
  const piv=(i,r)=>ops.push({k:'pivot',i:rt(i),r,q:`Pick ${a[i].n} (the rightmost person) as the pivot`,t:`${a[i].n} (${a[i].h} cm), the rightmost person, is the pivot: everyone in this range is compared against them.`});
  const hold=(i,why,r)=>ops.push({k:'hold',i:rt(i),r,q:`Choose ${a[i].n} to hold the variable`,t:`${a[i].n} now holds the variable: ${why}.`});
  const pass=(i,j,why,r)=>ops.push({k:'pass',i:rt(i),j:rt(j),r,q:`Pass the variable from ${a[i].n} to ${a[j].n}`,t:`The variable passes from ${a[i].n} to ${a[j].n}: ${why}.`});
  const turn=i=>ops.push({k:'turn',i:rt(i),q:`Turn ${a[i].n} to face front (they become the variable)`,t:`${a[i].n} turns around to face front and holds the variable while we look for the right slot.`});
  const fin=r=>{const o=ops[ops.length-1];o.fin=[...(o.fin||[]),...r.map(rt)]};
  const L2=(l,r)=>{const g=rg(l,r);return `${g[0]+1}-${g[1]+1}`};
  if(al.startsWith('bubble')){
    for(let p=0;p<n-1;p++){let fl=false;
      for(let j=0;j<n-1-p;j++)if(cmp(j+1,j)){swap(j,j+1);if(O&&!fl){fl=true;ops.push({k:'up',q:'Raise the flag (a swap happened)',t:'The flag goes up because a swap happened in this pass.'})}}
      fin(p===n-2||(O&&!fl)?Array.from({length:n-p},(_,x)=>x):[n-1-p]);
      if(O){if(fl)ops.push({k:'down',q:'Lower the flag (the pass is over)',t:p===n-2?`Pass ${p+1} is over, so the flag goes down. All passes are done: the list is sorted.`:`Pass ${p+1} is over, so the flag goes down before the next pass.`});
        else{ops[ops.length-1].t+=' The flag stayed down for the whole pass, so nothing moved: the list is sorted. Stop.';break}}}
  }else if(al.startsWith('insert')){
    const as=(i,k)=>{const x=a[i],y=a[k];ops.push({k:'aside',i:rt(i),j:rt(k),q:`Move ${x.n} aside (behind ${y.n})`,t:`${x.n} (${x.h} cm) should come after ${y.n}, so ${x.n} moves aside to slot ${S(k)} and ${y.n} shifts to slot ${S(i)}.`});[a[i],a[k]]=[a[k],a[i]]};
    for(let i=1;i<n;i++){turn(i);
      if(!O){let k=i;while(k>0&&cmp(k,k-1)){as(k-1,k);k--}}
      else{let j=i-1;while(j>=0&&cmp(i,j))j--;if(j+1!==i)mv(i,j+1,'Insert')}
      ops[ops.length-1].drop=true}
  }else if(al==='select'){
    for(let i=0;i<n-1;i++){let m=i;hold(i,`the best candidate so far for slot ${S(i)}`);
      for(let j=i+1;j<n;j++)if(cmp(j,m)){pass(m,j,`${a[j].n} should come before ${a[m].n}`);m=j}
      if(m!==i)swap(i,m);fin(i===n-2?[i,n-1]:[i])}
  }else if(al==='merge'){
    const ms=(l,r,d)=>{if(l>=r)return;const m=(l+r)>>1;
      ops.push({k:'split',i:rt(m),j:rt(m+1),r:rg(l,r),c:[[...rg(l,m),d+1],[...rg(m+1,r),d+1]].sort((x,y)=>x[0]-y[0]),q:`Split slots ${L2(l,r)} in half (tap the two people at the cut)`,t:`Slots ${L2(l,r)} are split in half: ${L2(l,m)} and ${L2(m+1,r)} drop to a new level.`});
      ms(l,m,d+1);ms(m+1,r,d+1);
      let pl=l,L=m-l+1,R=r-m;
      const segs=()=>{const c=[];if(pl>l)c.push([...rg(l,pl-1),d]);if(L>0)c.push([...rg(pl,pl+L-1),d+1]);if(R>0)c.push([...rg(pl+L,r),d+1]);return c.sort((x,y)=>x[0]-y[0])};
      const rp=(i,left)=>{const x=a[i],to=pl,sl=S(to);if(i!==to){a.splice(i,1);a.splice(to,0,x)}pl++;if(left)L--;else R--;
        ops.push({k:'repos',i:rt(i),j:rt(to),r:rg(l,r),c:segs(),q:`Reposition ${x.n} back up to the level before the split (slot ${sl})`,t:`${x.n} (${x.h} cm) goes first, so ${x.n} moves back up to the level before the split, into slot ${sl}.`})};
      const rpAll=()=>{const f=pl,nm=a.slice(f,r+1).map(x=>x.n).join(', ');pl=r+1;L=0;R=0;
        ops.push({k:'repos',all:true,i:rt(f),j:rt(r),r:rg(l,r),c:segs(),q:`Reposition the rest (${nm}) back up together (tap the first and last of them)`,t:`${nm} are all that is left of one group and are already in order, so they all move back up to the level before the split together.`})};
      while(L>0||R>0){
        if(L>0&&R>0){if(cmp(pl+L,pl,rg(l,r)))rp(pl+L,false);else rp(pl,true)}
        else if(L+R===1)rp(pl,L>0);else rpAll()}};
    ms(0,n-1,0);
  }else{
    let H=-1;
    const hd=(i,w,r)=>{H=a[i].id;hold(i,w,r)},ps=(i,j,w,r)=>{H=a[j].id;pass(i,j,w,r)};
    const sw=(i,j,r)=>{const x=a[i].id,y=a[j].id,hv=x===H||y===H;swap(i,j,r);const o=ops[ops.length-1];o.av=true;if(hv){o.t+=' The variable passes to the other person automatically.';H=x===H?y:x}};
    const qs=(lo,hi,d)=>{if(lo>=hi)return;const R=[lo,hi];H=-1;piv(hi,R);let b;
      if(!O&&!right){let i=lo;hd(i,`it marks slot ${i+1}, where the next person who belongs before the pivot goes`,R);
        for(let j=lo;j<hi;j++)if(cmp(j,hi,R)){if(i!==j)sw(i,j,R);ps(i,i+1,'that slot is filled, so move to the next one',R);i++}
        if(i!==hi)sw(i,hi,R);b=i}
      else if(!O){let e=hi-1;hd(e,`it marks slot ${e+1}, where the next person who belongs after the pivot goes`,R);
        for(let j=hi-1;j>=lo;j--)if(!cmp(j,hi,R)){if(e!==j)sw(e,j,R);if(e>lo)ps(e,e-1,'that slot is filled, so move to the previous one',R);e--}
        if(e+1!==hi)sw(e+1,hi,R);b=e+1}
      else if(!right){
        // optimized, start left: check the holder against the pivot, then search from the pivot side for a person to swap with it
        let i=lo,j=hi-1;hd(i,'it is checked against the pivot first',R);
        for(;;){
          while(i<=j&&cmp(i,hi,R)){ps(i,i+1,'it belongs before the pivot, so the variable moves on',R);i++}
          if(i>j)break;
          while(j>i&&!cmp(j,hi,R))j--;
          if(j<=i)break;
          sw(i,j,R);ps(i,i+1,'the swapped-in person belongs before the pivot, so the variable moves on',R);i++;j--}
        if(i!==hi)sw(i,hi,R);b=i}
      else{
        // optimized, start right: mirror image (the partner is searched from the left end)
        let e=hi-1,s=lo;hd(e,'it is checked against the pivot first',R);
        for(;;){
          while(e>=s&&!cmp(e,hi,R)){if(e>lo)ps(e,e-1,'it belongs after the pivot, so the variable moves on',R);e--}
          if(e<s)break;
          while(s<e&&cmp(s,hi,R))s++;
          if(s>=e)break;
          sw(e,s,R);if(e>lo)ps(e,e-1,'the swapped-in person belongs after the pivot, so the variable moves on',R);e--;s++}
        if(e+1!==hi)sw(e+1,hi,R);b=e+1}
      ops.push({k:'split',i:b,r:R,c:[[lo,b-1,d+1],[b,b,d],[b+1,hi,d+1]].filter(x=>x[0]<=x[1]),q:`Split around the pivot ${a[b].n} (tap the pivot)`,t:`${a[b].n} is in the right slot. The people before and after drop to a new level.`});
      const Lf=[lo,b-1,d+1],Rt=[b+1,hi,d+1];
      [Lf,Rt].forEach(([x,y,z])=>{if(x>y)return;
        if(x===y){ops.push({k:'sorted',i:x,q:`Mark ${a[x].n} as sorted (it is the only person left)`,t:`${a[x].n} is the only person left in this group, so there is nothing to compare: sorted.`});return}
        qs(x,y,z)});
      const nm=`slots ${lo+1}-${hi+1}`;
      ops.push({k:'join',i:lo,j:hi,r:[lo,hi],d,q:`Merge ${nm} back together at the pivot's level (tap the first and last person)`,t:b>lo&&b<hi?`Both sides of the pivot are sorted, so ${nm} merge back together at the pivot's level.`:`The only side next to the pivot is sorted and nothing waits on the other side, so ${nm} merge back together at the pivot's level.`})};
    qs(0,n-1,0);
  }
  return ops;
}
// Insertion sort: everybody except the starting person faces backward at first.
export const startFd=(al,arr,right)=>al.startsWith('insert')?arr.filter((_,i)=>i!==(right?arr.length-1:0)).map(x=>x.id):[];
export function build(arr,ops,fd0=[]){
  const n=arr.length;let LV=1;
  const S=[{a:arr,h:-1,p:-1,v:-1,fl:false,fd:fd0,sg:[{l:0,r:n-1,d:0}],sd:[]}];
  ops.forEach(o=>{const s=S[S.length-1];let a=[...s.a],{h,p,v,fl,fd,sg,sd}=s;
    if(o.k==='swap'||o.k==='aside'){const x=a[o.i].id,y=a[o.j].id;[a[o.i],a[o.j]]=[a[o.j],a[o.i]];if(o.av){if(v===x)v=y;else if(v===y)v=x}}
    if(o.k==='move'){const [x]=a.splice(o.i,1);a.splice(o.j,0,x);h=-1;v=-1}
    if(o.k==='turn'){h=v=a[o.i].id;fd=fd.filter(x=>x!==h)}
    if(o.k==='hold')v=a[o.i].id;
    if(o.k==='pass')v=a[o.j].id;
    if(o.k==='pivot'){p=a[o.i].id;v=-1}
    if(o.k==='repos'){if(!o.all&&o.i!==o.j){const [x]=a.splice(o.i,1);a.splice(o.j,0,x)}sg=sg.filter(g=>g.r<o.r[0]||g.l>o.r[1]).concat(o.c.map(([l,r,d])=>({l,r,d}))).sort((x,y)=>x.l-y.l)}
    if(o.k==='sorted')sd=[...sd,a[o.i].id];
    if(o.drop){h=-1;v=-1}
    if(o.k==='up')fl=true;
    if(o.k==='down')fl=false;
    if(o.k==='split'){sg=sg.filter(g=>!(g.l===o.r[0]&&g.r===o.r[1])).concat(o.c.map(([l,r,d])=>({l,r,d}))).sort((x,y)=>x.l-y.l);p=-1;v=-1}
    if(o.k==='join')sg=sg.filter(g=>g.l<o.r[0]||g.r>o.r[1]).concat([{l:o.r[0],r:o.r[1],d:o.d}]).sort((x,y)=>x.l-y.l);
    if(o.fin)o.fin.forEach(i=>{const id=a[i].id;if(!fd.includes(id))fd=[...fd,id]});
    sg.forEach(g=>{LV=Math.max(LV,g.d+1)});
    S.push({a,h,p,v,fl,fd,sg,sd})});
  const z=S[S.length-1];if(z.sg.every(g=>g.d===0))S[S.length-1]={...z,sg:[{l:0,r:n-1,d:0}]};
  S.LV=LV;return S;
}
