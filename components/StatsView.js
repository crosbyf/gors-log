import { useState } from 'react';
import * as Icons from './Icons';
import { ConfirmDialog } from './Modal';
import { getTodayDate } from '../utils/storage';

function BackBtn({ onClick, label, dark }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 ${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} mb-2`}>
      <Icons.ChevronLeft /><span className="font-semibold">{label}</span>
    </button>
  );
}

// Volume Trend
function VolumeChart({ workouts, dark }) {
  const FE = ['Pull-ups','Chin-ups','Dips','Push-ups','Inverted rows','Pike push-ups','Decline push-ups','Bicep curls','Hammer curls','Lateral raises','Overhead press','Deadhang'];
  const EC = ['from-blue-600 to-blue-400','from-purple-600 to-purple-400','from-green-600 to-green-400','from-orange-600 to-orange-400','from-pink-600 to-pink-400','from-cyan-600 to-cyan-400','from-yellow-600 to-yellow-400','from-red-600 to-red-400'];
  const [sel, setSel] = useState([]);
  const [sf, setSf] = useState(false);
  const now = new Date(), dow = now.getDay(), tm = dow === 0 ? 6 : dow - 1;
  const mon = new Date(now); mon.setDate(now.getDate() - tm); mon.setHours(0,0,0,0);
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const ws = new Date(mon); ws.setDate(mon.getDate() - i*7);
    const wsS = `${ws.getFullYear()}-${String(ws.getMonth()+1).padStart(2,'0')}-${String(ws.getDate()).padStart(2,'0')}`;
    const we = new Date(ws); we.setDate(ws.getDate()+6);
    const weS = `${we.getFullYear()}-${String(we.getMonth()+1).padStart(2,'0')}-${String(we.getDate()).padStart(2,'0')}`;
    const ww = workouts.filter(w => w.date >= wsS && w.date <= weS);
    const er = {}; let tot = 0;
    ww.forEach(w => w.exercises.forEach(ex => {
      const r = ex.sets.reduce((s,x) => s+(x.reps||0), 0);
      if (!sel.length || sel.includes(ex.name)) { er[ex.name] = (er[ex.name]||0)+r; tot += r; }
    }));
    data.push({ lb: `${ws.getMonth()+1}/${ws.getDate()}`, v: tot, er, cur: i===0 });
  }
  const mx = Math.max(...data.map(d => d.v), 1);
  return (
    <div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-lg">Volume Trend</h3>
        <button onClick={() => setSf(!sf)} className={`text-xs px-2 py-1 rounded-lg ${sel.length?'bg-blue-600 text-white':dark?'bg-gray-700 text-gray-300':'bg-gray-200 text-gray-700'}`}>{sel.length?`${sel.length} selected`:'Filter'}</button>
      </div>
      {sf && <div className={`${dark?'bg-gray-700':'bg-gray-100'} rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">Filter by Exercise</span>{sel.length>0&&<button onClick={()=>setSel([])} className="text-xs text-blue-400">Clear</button>}</div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {FE.map((ex,idx) => {const on=sel.includes(ex); return <button key={ex} onClick={()=>setSel(on?sel.filter(e=>e!==ex):[...sel,ex])} className={`text-xs px-2 py-1 rounded-full ${on?`bg-gradient-to-r ${EC[idx%EC.length]} text-white`:dark?'bg-gray-600 text-gray-300':'bg-gray-200 text-gray-700'}`}>{ex}</button>;})}
        </div>
      </div>}
      <div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} mb-4`}>Total reps per week (last 12 weeks)</div>
      <div className="h-48 flex items-end gap-1">
        {data.map((w,i) => {
          const h = mx>0?(w.v/mx)*100:0;
          const segs = [];
          if (sel.length>1) sel.forEach((ex) => { const r=w.er[ex]||0; if(r>0&&w.v>0) segs.push({h:(r/w.v)*100, c:EC[FE.indexOf(ex)%EC.length]}); });
          return <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex flex-col justify-end relative" style={{height:170}}>
              {w.v>0&&<>{segs.length>1?<div className="w-full flex flex-col-reverse" style={{height:`${h}%`}}>{segs.map((s,si)=><div key={si} className={`w-full bg-gradient-to-t ${s.c} ${si===segs.length-1?'rounded-t':''}`} style={{height:`${s.h}%`}}/>)}</div>:<div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{height:`${h}%`}}/>}<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">{w.v}</div></>}
            </div>
            <div className={`text-[9px] ${dark?'text-gray-500':'text-gray-600'} truncate w-full text-center ${w.cur?'font-bold text-blue-400':''}`}>{w.lb}</div>
          </div>;
        })}
      </div>
      <div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} mt-3 text-center`}>This week: {data[data.length-1].v} reps</div>
    </div>
  );
}

// Exercise detail
function ExDetail({ name, workouts, dark, onBack }) {
  const wk = {}, mo = {};
  workouts.forEach(w => {
    const d = new Date(w.date), dw = d.getDay();
    const m = new Date(d); m.setDate(d.getDate()-(dw===0?6:dw-1));
    const mk = w.date.substring(0,7), wkk = m.toISOString().split('T')[0];
    const ex = w.exercises.find(e => e.name === name);
    if (ex) { const r = ex.sets.reduce((s,x) => s+(x.reps||0),0); wk[wkk] = (wk[wkk]||0)+r; mo[mk] = (mo[mk]||0)+r; }
  });
  const mxW = Math.max(...Object.values(wk),1), mxM = Math.max(...Object.values(mo),1);
  const Bar = ({data, max, color}) => (
    <div className="space-y-2">{Object.entries(data).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>(
      <div key={k} className="flex items-center gap-2">
        <span className={`text-sm ${dark?'text-gray-400':'text-gray-600'} w-24 text-right`}>{k.length===7?k:new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
        <div className={`flex-1 ${dark?'bg-gray-700':'bg-gray-200'} rounded-full h-6 overflow-hidden`}><div className={`${color} h-full rounded-full`} style={{width:`${(v/max)*100}%`}}/></div>
        <span className="text-base font-semibold w-16 text-right">{v}</span>
      </div>))}</div>
  );
  return (
    <div className="space-y-4 -mt-9">
      <BackBtn onClick={onBack} label="Back to All Exercises" dark={dark}/>
      <h2 className="text-2xl font-bold">{name}</h2>
      <div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}><h3 className="font-bold text-lg mb-3">Weekly Volume</h3><Bar data={wk} max={mxW} color="bg-gradient-to-r from-blue-500 to-purple-500"/></div>
      <div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}><h3 className="font-bold text-lg mb-3">Monthly Volume</h3><Bar data={mo} max={mxM} color="bg-green-500"/></div>
    </div>
  );
}

// Exercise list
function ExList({ workouts, dark, onBack }) {
  const [sel, setSel] = useState(null);
  const [vd, setVd] = useState(new Date());
  if (sel) return <ExDetail name={sel} workouts={workouts} dark={dark} onBack={()=>setSel(null)}/>;
  const all = [...new Set(workouts.flatMap(w=>w.exercises.map(e=>e.name)))].sort();
  const top = ['Pull-ups','Dips','Chin-ups'], emo = ['💪','🔥','⚡'];
  return (
    <div className="space-y-3 -mt-9">
      <BackBtn onClick={onBack} label="Back to Stats" dark={dark}/>
      <h2 className="text-base font-semibold mb-2">Exercise Statistics</h2>
      <div className={`${dark?'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30':'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'} rounded-xl p-2 shadow-xl border-2 mb-3`}>
        <div className="flex items-center justify-between mb-1">
          <button onClick={()=>{const d=new Date(vd);d.setMonth(d.getMonth()-1);setVd(d);}} className={`p-1 ${dark?'hover:bg-blue-500/20 text-blue-400':'hover:bg-blue-100 text-blue-600'} rounded`}><Icons.ChevronLeft/></button>
          <h3 className={`text-sm font-bold`}>{vd.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h3>
          <button onClick={()=>{const d=new Date(vd);d.setMonth(d.getMonth()+1);setVd(d);}} className={`p-1 ${dark?'hover:bg-blue-500/20 text-blue-400':'hover:bg-blue-100 text-blue-600'} rounded`}><Icons.ChevronRight/></button>
        </div>
        <div className="space-y-2">{top.map((n,idx)=>{
          const ms=`${vd.getFullYear()}-${String(vd.getMonth()+1).padStart(2,'0')}`;
          const v=workouts.filter(w=>w.date.startsWith(ms)).reduce((t,w)=>{const e=w.exercises.find(x=>x.name===n);return t+(e?e.sets.reduce((s,x)=>s+(x.reps||0),0):0);},0);
          const pd=new Date(vd);pd.setMonth(pd.getMonth()-1);
          const ps=`${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,'0')}`;
          const pv=workouts.filter(w=>w.date.startsWith(ps)).reduce((t,w)=>{const e=w.exercises.find(x=>x.name===n);return t+(e?e.sets.reduce((s,x)=>s+(x.reps||0),0):0);},0);
          const pct=pv>0?Math.min((v/pv)*100,100):0;
          return <div key={n} className={`${dark?'bg-gray-800/50':'bg-white/70'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-xl">{emo[idx]}</span><span className="text-sm font-bold">{n}</span></div><div className="text-right"><span className="text-lg font-bold">{v}</span>{pv>0&&<span className={`text-xs ${dark?'text-gray-400':'text-gray-600'}`}> / {pv}</span>}</div></div>
            <div className={`w-full h-2 ${dark?'bg-gray-700':'bg-gray-300'} rounded-full overflow-hidden`}><div className="h-full bg-blue-500 transition-all" style={{width:`${pct}%`}}/></div>
          </div>;
        })}</div>
      </div>
      {all.map(n=>{
        const tot=workouts.reduce((t,w)=>{const e=w.exercises.find(x=>x.name===n);return t+(e?e.sets.reduce((s,x)=>s+(x.reps||0),0):0);},0);
        const cnt=workouts.filter(w=>w.exercises.some(e=>e.name===n)).length;
        return <button key={n} onClick={()=>{setSel(n);window.scrollTo({top:0,behavior:'smooth'});}} className={`w-full ${dark?'bg-gray-800 hover:bg-gray-700':'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left shadow-md`}>
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-lg mb-1">{n}</h3><div className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>{cnt} workout{cnt!==1?'s':''} • {tot.toLocaleString()} total reps</div></div><Icons.ChevronRight/></div>
        </button>;
      })}
    </div>
  );
}

// Weight sub-view
function WeightView({ weightEntries, dark, onBack, onSave, onDelete }) {
  const [showM, setShowM] = useState(false);
  const [ed, setEd] = useState(null);
  const [f, setF] = useState({date:'',weight:'',notes:''});
  const [cm, setCm] = useState(new Date().getMonth());
  const [cy, setCy] = useState(new Date().getFullYear());
  const [di, setDi] = useState(null);
  const openAdd = () => { const t=new Date(); setF({date:getTodayDate(),weight:'',notes:''}); setEd(null); setCm(t.getMonth()); setCy(t.getFullYear()); setShowM(true); };
  const openEdit = (idx) => { const e=weightEntries[idx]; setF({date:e.date,weight:e.weight.toString(),notes:e.notes||''}); setEd(idx); const d=new Date(e.date); setCm(d.getMonth()); setCy(d.getFullYear()); setShowM(true); };
  const save = () => { if(!f.date||!f.weight) return; onSave({date:f.date,weight:parseFloat(f.weight),notes:f.notes},ed); setShowM(false); };
  const sorted = [...weightEntries].sort((a,b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-3 -mt-9">
      <BackBtn onClick={onBack} label="Back to Stats" dark={dark}/>
      <h2 className="text-base font-semibold mb-2">Body Weight</h2>
      <button onClick={openAdd} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-3 mb-3 flex items-center justify-center gap-2 text-lg font-bold shadow-lg"><Icons.Plus/> Add Weight Entry</button>
      {sorted.length>0&&(()=>{const l=sorted[0],o=sorted[sorted.length-1],ch=l.weight-o.weight,d=(new Date(l.date)-new Date(o.date))/(864e5),wk=d/7,r=wk>=1?(ch/wk).toFixed(2):null;
        return <div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md mb-4`}><h3 className="font-bold text-lg mb-3">Summary</h3><div className="grid grid-cols-2 gap-3">
          <div><div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} uppercase tracking-wide mb-1`}>Current</div><div className="text-2xl font-bold">{l.weight} <span className="text-sm font-normal">lbs</span></div></div>
          <div><div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} uppercase tracking-wide mb-1`}>Starting</div><div className="text-2xl font-bold">{o.weight} <span className="text-sm font-normal">lbs</span></div></div>
          <div><div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} uppercase tracking-wide mb-1`}>Change</div><div className="text-xl font-bold">{ch>0?'+':''}{ch.toFixed(1)} lbs</div></div>
          {r&&<div><div className={`text-xs ${dark?'text-gray-400':'text-gray-600'} uppercase tracking-wide mb-1`}>Rate</div><div className="text-xl font-bold">{r>0?'+':''}{r} lbs/wk</div></div>}
        </div></div>;
      })()}
      {/* Chart */}
      {weightEntries.length>1&&(()=>{
        const s=[...weightEntries].sort((a,b)=>a.date.localeCompare(b.date));
        const w=s.map(e=>parseFloat(e.weight)),dt=s.map(e=>e.date);
        const mn=Math.min(...w),mx=Math.max(...w),rg=mx-mn,pd=rg*.15||2;
        const cMn=Math.floor(mn-pd),cMx=Math.ceil(mx+pd),cR=cMx-cMn;
        const tk=Array.from({length:5},(_,i)=>cMx-(i*cR/4));
        const pts=w.map((v,i)=>({x:w.length>1?(i/(w.length-1))*100:50,y:((cMx-v)/cR)*100}));
        const path=pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
        return <div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md mb-4`}><h3 className="font-bold text-lg mb-3">Weight Trend</h3>
          <div className="relative" style={{height:200}}>
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between w-10 text-right pr-2">{tk.map((t,i)=><span key={i} className={`text-[10px] ${dark?'text-gray-500':'text-gray-400'}`}>{t.toFixed(0)}</span>)}</div>
            <div className="absolute left-10 right-0 top-0 bottom-6">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                {tk.map((_,i)=><line key={i} x1="0" y1={i*25} x2="100" y2={i*25} stroke={dark?'#374151':'#e5e7eb'} strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>)}
                <defs><linearGradient id="wg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/></linearGradient></defs>
                <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#wg)"/>
                <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#3b82f6" stroke="white" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>)}</svg>
            </div>
            <div className="absolute bottom-0 left-10 right-0 flex justify-between px-1">{[dt[0],dt.length>2?dt[Math.floor(dt.length/2)]:null,dt[dt.length-1]].filter(Boolean).map((d,i)=><span key={i} className={`text-[10px] ${dark?'text-gray-500':'text-gray-400'}`}>{new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>)}</div>
          </div></div>;
      })()}
      {/* History */}
      {sorted.length>0&&<div className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}><h3 className="font-bold text-lg mb-3">History</h3><div className="space-y-2 max-h-96 overflow-y-auto">{sorted.map((e,idx)=>{
        const [y,m,d]=e.date.split('-'), dow=new Date(parseInt(y),parseInt(m)-1,parseInt(d)).toLocaleDateString('en-US',{weekday:'short'});
        const prev=sorted[idx+1], ch=prev?e.weight-prev.weight:null;
        const ri=weightEntries.findIndex(x=>x.date===e.date&&x.weight===e.weight);
        return <div key={`${e.date}-${e.weight}-${idx}`} className={`${dark?'bg-gray-700/50 hover:bg-gray-700':'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3`}>
          <div className="flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{dow} {m}/{d}/{y.slice(2)}</span>{ch!==null&&<span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ch>0?'bg-red-500/20 text-red-400':ch<0?'bg-green-500/20 text-green-400':'bg-gray-500/20 text-gray-400'}`}>{ch>0?'+':''}{ch.toFixed(1)}</span>}</div>{e.notes&&<div className={`text-xs ${dark?'text-gray-400':'text-gray-500'} mt-0.5`}>{e.notes}</div>}</div>
          <div className="flex items-center gap-2"><span className="text-xl font-bold">{e.weight}</span><span className={`text-sm ${dark?'text-gray-400':'text-gray-500'}`}>lbs</span>
          <div className="flex gap-1 ml-2"><button onClick={()=>openEdit(ri)} className={`p-1.5 rounded ${dark?'hover:bg-gray-600 text-gray-400':'hover:bg-gray-200 text-gray-500'}`}><Icons.Edit/></button><button onClick={()=>setDi(ri)} className={`p-1.5 rounded ${dark?'hover:bg-red-900/50 text-red-400':'hover:bg-red-100 text-red-500'}`}><Icons.Trash/></button></div></div></div>
        </div>;
      })}</div></div>}
      {/* Weight modal */}
      {showM&&<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={()=>setShowM(false)}>
        <div className={`${dark?'bg-gray-800':'bg-white'} rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4">{ed!==null?'Edit':'Add'} Weight Entry</h3>
          <div className="space-y-3">
            <div><label className={`block text-sm font-medium mb-1 ${dark?'':'text-gray-700'}`}>Date</label>
              <div className={`${dark?'bg-gray-700':'bg-gray-50'} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={()=>{if(cm===0){setCm(11);setCy(cy-1);}else setCm(cm-1);}} className={`p-1 ${dark?'hover:bg-gray-600':'hover:bg-gray-200'} rounded`}><Icons.ChevronLeft/></button>
                  <div className="font-semibold">{new Date(cy,cm).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
                  <button type="button" onClick={()=>{if(cm===11){setCm(0);setCy(cy+1);}else setCm(cm+1);}} className={`p-1 ${dark?'hover:bg-gray-600':'hover:bg-gray-200'} rounded`}><Icons.ChevronRight/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">{['M','T','W','T','F','S','S'].map((d,i)=><div key={i} className="text-center text-xs text-gray-500 font-bold">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">{(()=>{const fd=new Date(cy,cm,1).getDay(),aj=fd===0?6:fd-1,dim=new Date(cy,cm+1,0).getDate(),td=new Date(),cells=[];
                  for(let i=0;i<aj;i++)cells.push(<div key={`e${i}`}/>);
                  for(let i=1;i<=dim;i++){const ds=`${cy}-${String(cm+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`,sl=f.date===ds,isT=i===td.getDate()&&cm===td.getMonth()&&cy===td.getFullYear();
                    cells.push(<button key={i} type="button" onClick={()=>setF({...f,date:ds})} className={`aspect-square rounded text-sm font-medium ${sl?'bg-blue-600 text-white':isT?dark?'bg-gray-600':'bg-gray-300':dark?'hover:bg-gray-600':'hover:bg-gray-200'}`}>{i}</button>);}
                  return cells;})()}</div>
              </div>
            </div>
            <div><label className={`block text-sm font-medium mb-1 ${dark?'':'text-gray-700'}`}>Weight (lbs)</label><input type="number" step="0.1" value={f.weight} onChange={e=>setF({...f,weight:e.target.value})} placeholder="185.5" className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-3 py-2`}/></div>
            <div><label className={`block text-sm font-medium mb-1 ${dark?'':'text-gray-700'}`}>Notes</label><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Morning weigh-in..." className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-3 py-2 resize-none h-20`}/></div>
          </div>
          <div className="flex gap-3 mt-6"><button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold">{ed!==null?'Update':'Add'}</button><button onClick={()=>setShowM(false)} className={`flex-1 ${dark?'bg-gray-700':'bg-gray-200'} py-3 rounded-lg font-semibold`}>Cancel</button></div>
        </div></div>}
      <ConfirmDialog open={di!==null} title="Delete Weight Entry?" message="This cannot be undone." confirmText="Delete" dark={dark} onConfirm={()=>{onDelete(di);setDi(null);}} onCancel={()=>setDi(null)}/>
    </div>
  );
}

// Protein sub-view
function ProteinView({ proteinEntries, dark, onBack, onAdd, onUpdate, onDeleteEntry }) {
  const [exp, setExp] = useState(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editDate, setEditDate] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [addDate, setAddDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), g = fd.get('grams'), fo = fd.get('food');
    if (g && parseInt(g) > 0) { onAdd({date:addDate||getTodayDate(),grams:parseInt(g),food:fo||'Food',timestamp:Date.now()}); setShowAdd(false); setAddDate(null); }
  };
  const handleEdit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), g = fd.get('grams'), fo = fd.get('food');
    if (g && parseInt(g) > 0) { onUpdate(editEntry.timestamp, {grams:parseInt(g),food:fo||'Food'}); setEditEntry(null); }
  };

  const last30 = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now); d.setDate(now.getDate()-i);
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const entries = proteinEntries.filter(e => e.date === ds);
    last30.push({date:ds, dayName:i===0?'Today':i===1?'Yesterday':d.toLocaleDateString('en-US',{weekday:'short'}), dateDisp:d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), total:entries.reduce((s,e)=>s+e.grams,0), entries, isToday:i===0});
  }

  const Entries = ({entries}) => entries.length>0 ? (
    <div className={`${dark?'bg-gray-700/50':'bg-gray-50'} rounded-lg p-2 space-y-1`}>
      {entries.map(e => {
        const time = e.timestamp ? new Date(e.timestamp).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}).toLowerCase() : '';
        return <div key={e.timestamp} className="flex items-center text-sm"><span className={`flex-1 ${dark?'text-gray-300':'text-gray-700'}`}>{e.food}</span><span className={`w-16 text-center ${dark?'text-gray-500':'text-gray-400'} text-xs`}>{time}</span><span className="w-12 text-right font-bold">{e.grams}g</span></div>;
      })}
    </div>
  ) : null;

  return (
    <div className="space-y-3 -mt-9">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onBack} className={`${dark?'text-gray-400 hover:text-gray-200':'text-gray-500 hover:text-gray-700'} p-1`}><Icons.ChevronLeft/></button>
        <h2 className="text-xl font-bold">🥩 Protein Intake</h2>
      </div>
      <button onClick={()=>{setAddDate(null);setShowAdd(true);}} className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-md">+ Add Protein</button>
      <div className="space-y-2">
        {last30.map(({date,dayName,dateDisp,total,entries,isToday}) => {
          const isExp = isToday || exp.has(date);
          return (
            <div key={date} className={`${dark?'bg-gray-800':'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}>
              {isToday ? (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div><div className="font-bold text-base">{dayName}</div><div className="text-xs text-gray-500">{dateDisp}</div></div>
                    <div className="flex items-center gap-3"><div className="text-right"><div className="text-2xl font-black text-green-500">{total}g</div><div className="text-xs text-gray-500">{entries.length} meal{entries.length!==1?'s':''}</div></div>
                    <button onClick={()=>setEditDate(date)} className={`${dark?'text-blue-400':'text-blue-600'} p-2`}><Icons.EditPen/></button></div>
                  </div>
                  <Entries entries={entries}/>
                </div>
              ) : (
                <>
                  <button onClick={()=>{const n=new Set(exp);n.has(date)?n.delete(date):n.add(date);setExp(n);}} className={`w-full p-3 text-left ${dark?'hover:bg-white/5':'hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-bold text-base">{dayName}</div><div className="text-xs text-gray-500">{dateDisp}</div></div>
                      <div className="flex items-center gap-3"><div className="text-right"><div className="text-2xl font-black text-green-500">{total}g</div><div className="text-xs text-gray-500">{entries.length} meal{entries.length!==1?'s':''}</div></div>
                      <div className={`transform transition-transform ${isExp?'rotate-180':''}`}><Icons.ChevronDown/></div></div>
                    </div>
                  </button>
                  {isExp && <div className="px-3 pb-3">
                    <div className="flex justify-end mb-2"><button onClick={()=>setEditDate(date)} className={`${dark?'text-blue-400':'text-blue-600'} p-1 text-xs flex items-center gap-1`}><Icons.EditPen/> Edit</button></div>
                    {entries.length>0?<Entries entries={entries}/>:<div className={`text-sm ${dark?'text-gray-500':'text-gray-400'} text-center py-2`}>No entries</div>}
                  </div>}
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* Add modal */}
      {showAdd&&<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={()=>setShowAdd(false)}><div className={`${dark?'bg-gray-800':'bg-white'} rounded-t-2xl w-full pb-8`} onClick={e=>e.stopPropagation()}>
        <div className={`sticky top-0 ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-200'} z-10 pt-3 pb-2 border-b`}><div className="flex justify-center pb-2"><div className={`w-10 h-1 ${dark?'bg-gray-600':'bg-gray-300'} rounded-full`}/></div><div className="flex items-center justify-between px-4"><h3 className="font-bold text-lg">Add Protein</h3><button onClick={()=>setShowAdd(false)}><Icons.X/></button></div></div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div><label className="block text-sm font-semibold mb-2">Grams</label><input type="number" name="grams" placeholder="45" autoFocus required min="1" className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-4 py-3 text-lg font-bold`}/></div>
          <div><label className="block text-sm font-semibold mb-2">Food</label><input type="text" name="food" placeholder="Protein shake" className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-4 py-3`}/></div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-bold">Add Entry</button>
          <div className="h-40"/>
        </form>
      </div></div>}
      {/* Edit date modal */}
      {editDate&&<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={()=>setEditDate(null)}><div className={`${dark?'bg-gray-800':'bg-white'} rounded-t-2xl w-full max-h-[75vh] overflow-y-auto pb-8`} onClick={e=>e.stopPropagation()}>
        <div className={`sticky top-0 ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-200'} z-10 pt-3 pb-2 border-b`}><div className="flex justify-center pb-2"><div className={`w-10 h-1 ${dark?'bg-gray-600':'bg-gray-300'} rounded-full`}/></div><div className="flex items-center justify-between px-4"><h3 className="font-bold text-lg">Edit - {new Date(editDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</h3><button onClick={()=>setEditDate(null)}><Icons.X/></button></div></div>
        <div className="p-4 space-y-3">
          <button onClick={()=>{setAddDate(editDate);setShowAdd(true);}} className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2">+ Add Entry</button>
          {(()=>{const de=proteinEntries.filter(e=>e.date===editDate),tot=de.reduce((s,e)=>s+e.grams,0);return<>
            <div className={`${dark?'bg-green-900/30':'bg-green-50'} rounded-lg p-3`}><div className="text-sm font-semibold text-green-600 mb-1">Total</div><div className="text-3xl font-black">{tot}g</div></div>
            {de.length>0?<div className="space-y-2"><div className="text-sm font-semibold">Meals ({de.length})</div>{de.map(e=><div key={e.timestamp} className={`${dark?'bg-gray-700':'bg-gray-100'} rounded-lg p-3`}><div className="flex items-center justify-between"><div><div className="font-semibold">{e.food}</div><div className="text-2xl font-bold text-green-500 mt-1">{e.grams}g</div></div><div className="flex items-center gap-2">
              <button onClick={()=>setEditEntry(e)} className={`${dark?'text-blue-400':'text-blue-600'} p-2`}><Icons.EditPen/></button>
              <button onClick={()=>{if(confirm(`Delete ${e.food}?`))onDeleteEntry(e.timestamp);}} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-bold">Delete</button>
            </div></div></div>)}</div>:<div className="text-center text-gray-500 py-8">No entries</div>}
          </>;})()}
        </div>
      </div></div>}
      {/* Edit entry modal */}
      {editEntry&&<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={()=>setEditEntry(null)}><div className={`${dark?'bg-gray-800':'bg-white'} rounded-t-2xl w-full pb-8`} onClick={e=>e.stopPropagation()}>
        <div className={`sticky top-0 ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-200'} z-10 pt-3 pb-2 border-b`}><div className="flex justify-center pb-2"><div className={`w-10 h-1 ${dark?'bg-gray-600':'bg-gray-300'} rounded-full`}/></div><div className="flex items-center justify-between px-4"><h3 className="font-bold text-lg">Edit Entry</h3><button onClick={()=>setEditEntry(null)}><Icons.X/></button></div></div>
        <form onSubmit={handleEdit} className="p-4 space-y-4">
          <div><label className="block text-sm font-semibold mb-2">Grams</label><input type="number" name="grams" defaultValue={editEntry.grams} autoFocus required min="1" className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-4 py-3 text-lg font-bold`}/></div>
          <div><label className="block text-sm font-semibold mb-2">Food</label><input type="text" name="food" defaultValue={editEntry.food} className={`w-full ${dark?'bg-gray-700 border-gray-600':'bg-white border-gray-300'} border rounded-lg px-4 py-3`}/></div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-bold">Save Changes</button>
        </form>
      </div></div>}
    </div>
  );
}

// Main StatsView
export default function StatsView({ workouts, weightEntries, proteinEntries, dark, theme, onWeightSave, onWeightDelete, onProteinAdd, onProteinUpdate, onProteinDelete, onToast }) {
  const [sub, setSub] = useState('menu');
  const go = (v) => { setSub(v); setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),50); };

  if (sub === 'exercises') return <ExList workouts={workouts} dark={dark} onBack={()=>go('menu')}/>;
  if (sub === 'weight') return <WeightView weightEntries={weightEntries} dark={dark} onBack={()=>go('menu')} onSave={onWeightSave} onDelete={onWeightDelete}/>;
  if (sub === 'protein') return <ProteinView proteinEntries={proteinEntries} dark={dark} onBack={()=>go('menu')} onAdd={onProteinAdd} onUpdate={onProteinUpdate} onDeleteEntry={onProteinDelete}/>;

  const todayP = proteinEntries.filter(e=>e.date===getTodayDate()).reduce((s,e)=>s+e.grams,0);
  const exCount = [...new Set(workouts.flatMap(w=>w.exercises.map(e=>e.name)))].length;

  return (
    <div className="space-y-3 -mt-9">
      <VolumeChart workouts={workouts} dark={dark}/>
      {[
        {icon:'🥩',title:'Protein Intake',sub:todayP>0?`${todayP}g today`:'Track daily protein intake',key:'protein',btn:{text:'+ Add',color:'bg-green-600 hover:bg-green-700',fn:(e)=>{e.stopPropagation();go('protein');}}},
        {icon:'⚖️',title:'Body Weight',sub:weightEntries.length>0?`${weightEntries[weightEntries.length-1].weight} lbs • ${weightEntries.length} entries`:'Track your weight',key:'weight',btn:{text:'+ Add',color:'bg-blue-600 hover:bg-blue-700',fn:(e)=>{e.stopPropagation();go('weight');}}},
        {icon:'📊',title:'Exercise Stats',sub:`${exCount} exercises tracked`,key:'exercises'},
      ].map(({icon,title,sub:s,key,btn})=>(
        <button key={key} onClick={()=>go(key)} className={`w-full ${dark?'bg-gray-800 hover:bg-gray-700':'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left shadow-md`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="text-3xl">{icon}</div><div><h3 className="font-bold text-lg mb-1">{title}</h3><div className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>{s}</div></div></div>
            <div className="flex items-center gap-2">
              {btn&&<button onClick={btn.fn} className={`${btn.color} px-3 py-1.5 rounded-lg text-xs font-bold`}>{btn.text}</button>}
              <Icons.ChevronRight/>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
