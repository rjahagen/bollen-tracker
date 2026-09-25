import { useState } from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';

const DARTBOARD_ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

function dbPolar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) };
}

function dbWedge(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const p1 = dbPolar(cx, cy, rOuter, startAngle);
  const p2 = dbPolar(cx, cy, rOuter, endAngle);
  const p3 = dbPolar(cx, cy, rInner, endAngle);
  const p4 = dbPolar(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

function DartBoard({ target, th, size=260 }) {
  const cx=130, cy=130;
  const R = { edge:116, dblOuter:116, dblInner:106, singleOuterOuter:106, singleOuterInner:64, trebleOuter:64, trebleInner:56, singleInnerOuter:56, singleInnerInner:16, bullOuter:16, bullInner:7 };
  const dark="#14161c", light="#e9e2d0", red="#c22a3e", green="#0c5c3c";
  return (
    <svg viewBox="0 0 260 260" style={{width:size,height:size,display:"block"}}>
      <circle cx={cx} cy={cy} r={122} fill="#05070a"/>
      {DARTBOARD_ORDER.map((num,i)=>{
        const center = i*18, start = center-9, end = center+9;
        const alt = i%2===1;
        const base = alt ? dark : light;
        const ring = alt ? green : red;
        const isTarget = target===num;
        const label = dbPolar(cx, cy, 135, center);
        return (
          <g key={num}>
            <path d={dbWedge(cx,cy,R.singleOuterInner,R.singleOuterOuter,start,end)} fill={base}/>
            <path d={dbWedge(cx,cy,R.dblInner,R.dblOuter,start,end)} fill={ring}/>
            <path d={dbWedge(cx,cy,R.singleInnerInner,R.singleInnerOuter,start,end)} fill={base}/>
            <path d={dbWedge(cx,cy,R.trebleInner,R.trebleOuter,start,end)} fill={ring}/>
            {isTarget && <path d={dbWedge(cx,cy,R.singleInnerInner,R.dblOuter,start,end)} fill={th.gold} opacity={0.32}/>}
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={isTarget?th.gold:"#c9c4b8"} fontFamily="Arial,sans-serif">{num}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={R.bullOuter} fill={green}/>
      <circle cx={cx} cy={cy} r={R.bullInner} fill={red}/>
      {target==="Bull" && <circle cx={cx} cy={cy} r={R.bullOuter+5} fill="none" stroke={th.gold} strokeWidth={3.5} opacity={0.95}/>}
    </svg>
  );
}

export default function DartsScreen({ th, go, S, themeName }) {
  const [players, setPlayers]     = useState([]); // {id,name,position,finished}
  const [newName, setNewName]     = useState("");
  const [started, setStarted]     = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [winner, setWinner]       = useState(null);

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    setPlayers(p => [...p, { id:`dp_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name, position:1, finished:false }]);
    setNewName("");
  }
  function removePlayer(id) { setPlayers(p => p.filter(pl=>pl.id!==id)); }

  function startGame() {
    if (players.length<1) return;
    setPlayers(p => p.map(pl=>({...pl,position:1,finished:false})));
    setCurrentIdx(0);
    setWinner(null);
    setStarted(true);
  }

  function targetOf(p) { return p.position<=20 ? p.position : "Bull"; }

  function hit(mult) {
    if (winner || players.length===0) return;
    setPlayers(prev => {
      const next = prev.map(p=>({...p}));
      const p = next[currentIdx];
      if (p.position<=20) {
        p.position = Math.min(21, p.position+mult);
      } else {
        p.finished = true;
        setWinner(p);
      }
      return next;
    });
  }

  function nextPlayer() {
    if (players.length<2) return;
    setCurrentIdx(i => {
      for (let k=1;k<=players.length;k++) {
        const n = (i+k) % players.length;
        if (!players[n].finished) return n;
      }
      return i;
    });
  }

  function newGame() { setStarted(false); setWinner(null); }

  const current = players[currentIdx];

  return (
    <div style={{...S.app,minHeight:"100dvh"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={S.wrap}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
          <h2 style={S.title}>Around The World</h2>
        </div>

        {!started ? (
          <div style={{padding:"16px 16px 96px"}}>
            <p style={{...S.label,margin:"8px 0 6px"}}>Spelers</p>
            <p style={{color:th.textDim,fontSize:12,margin:"0 0 14px",lineHeight:1.5}}>
              Iedereen moet om de beurt 1 t/m 20 en de bull raken, in volgorde. Single = +1, Double = +2, Triple = +3.
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {players.map(p=>(
                <span key={p.id} style={{display:"flex",alignItems:"center",gap:6,background:th.surface,border:`1px solid ${th.border}`,borderRadius:20,padding:"6px 8px 6px 14px",fontSize:13,color:th.text}}>
                  {p.name}
                  <button onClick={()=>removePlayer(p.id)} style={{background:"none",border:"none",color:th.textDim,cursor:"pointer",fontSize:14,padding:"2px 4px",lineHeight:1}}>✕</button>
                </span>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              <input style={{...S.input,flex:1}} placeholder="Naam speler…" value={newName} autoComplete="off"
                onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
              <button style={{...S.primary,width:"auto",padding:"11px 18px"}} onClick={addPlayer}>+</button>
            </div>
            <button style={S.primary} disabled={players.length<1} onClick={startGame}>Start spel</button>
          </div>
        ) : winner ? (
          <div style={{padding:"16px 16px 96px",textAlign:"center"}}>
            <div style={{fontSize:11,color:th.textDim,letterSpacing:4,textTransform:"uppercase",margin:"24px 0 16px"}}>Winnaar</div>
            <div style={{fontSize:26,fontWeight:700,color:th.gold,letterSpacing:2,textTransform:"uppercase",fontFamily:th.titleFont,marginBottom:24}}>🏆 {winner.name}</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
              <DartBoard target={null} th={th} size={220}/>
            </div>
            <button style={S.primary} onClick={newGame}>Nieuw spel</button>
          </div>
        ) : (
          <div style={{padding:"8px 16px 96px",textAlign:"center"}}>
            <p style={{color:th.textDim,fontSize:11,letterSpacing:2,textTransform:"uppercase",margin:"12px 0 4px"}}>Aan de beurt</p>
            <p style={{color:th.gold,fontSize:22,fontWeight:700,letterSpacing:1,margin:"0 0 4px",fontFamily:th.titleFont}}>{current?.name}</p>
            <p style={{color:th.textMid,fontSize:13,margin:"0 0 16px"}}>Doel: <b style={{color:th.gold}}>{current ? targetOf(current) : "-"}</b></p>

            <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
              <DartBoard target={current ? targetOf(current) : null} th={th}/>
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12,flexWrap:"wrap"}}>
              <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(1)}>Single</button>
              <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(2)}>Double</button>
              <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(3)}>Triple</button>
            </div>
            <button style={{...S.secondary,maxWidth:260,margin:"0 auto 20px"}} onClick={nextPlayer} disabled={players.length<2}>Volgende speler ›</button>

            <div style={{textAlign:"left"}}>
              <p style={{...S.label,margin:"8px 0"}}>Stand</p>
              {players.map((p,i)=>(
                <div key={p.id} style={{...S.card,display:"flex",alignItems:"center",gap:12,margin:"6px 0",border:`1px solid ${i===currentIdx?th.gold:th.border}`}}>
                  <div style={{flex:1,fontWeight:700,fontSize:14,color:i===currentIdx?th.gold:th.text,letterSpacing:1}}>{p.name}</div>
                  <div style={{fontSize:13,color:th.textDim}}>Doel: <b style={{color:th.text}}>{targetOf(p)}</b></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
