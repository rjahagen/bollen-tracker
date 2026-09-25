import { useState } from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';
import Avatar from '../components/Avatar';

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

function unitLabel(unit) { return unit ? unit.members.map(m=>m.name).join(" & ") : ""; }

function UnitAvatars({ unit, th, size=56 }) {
  if (!unit) return null;
  if (unit.members.length===1) {
    return <Avatar player={unit.members[0]} th={th} size={size} style={{margin:"0 auto 8px",border:`1px solid ${th.gold}`}}/>;
  }
  return (
    <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8}}>
      {unit.members.map(m=>(
        <Avatar key={m.id} player={m} th={th} size={size*0.78} style={{border:`1px solid ${th.gold}`}}/>
      ))}
    </div>
  );
}

export default function DartsScreen({ th, go, S, themeName, groupFriends=[] }) {
  const [players, setPlayers]       = useState([]); // roster before start: {id,name,photo}
  const [newName, setNewName]       = useState("");
  const [teamMode, setTeamMode]     = useState(false);
  const [started, setStarted]       = useState(false);
  const [units, setUnits]           = useState([]); // {id,members:[player,...],position,finished,finishedWith}
  const [currentIdx, setCurrentIdx] = useState(0);
  const [winner, setWinner]         = useState(null);
  const [history, setHistory]       = useState([]); // stack of {units,currentIdx,winner} snapshots

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    setPlayers(p => [...p, { id:`dp_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name }]);
    setNewName("");
  }
  function addFriendPlayer(f) {
    if (players.find(p=>p.id===f.id)) return;
    setPlayers(p => [...p, { id:f.id, name:f.name, photo:f.photo }]);
  }
  function removePlayer(id) { setPlayers(p => p.filter(pl=>pl.id!==id)); }

  const canStart = teamMode ? (players.length>=2 && players.length%2===0) : players.length>=1;

  function startGame() {
    if (!canStart) return;
    let newUnits;
    if (teamMode) {
      newUnits = [];
      for (let i=0; i<players.length; i+=2) {
        newUnits.push({ id:`team_${i/2}`, members:[players[i],players[i+1]], position:1, finished:false, finishedWith:null });
      }
    } else {
      newUnits = players.map(p=>({ id:p.id, members:[p], position:1, finished:false, finishedWith:null }));
    }
    setUnits(newUnits);
    setCurrentIdx(0);
    setWinner(null);
    setHistory([]);
    setStarted(true);
  }

  function targetOf(u) { return u.position<=20 ? u.position : "Bull"; }

  function pushHistory() {
    setHistory(h => [...h, { units: units.map(u=>({...u})), currentIdx, winner }]);
  }

  function hit(mult) {
    if (winner || units.length===0) return;
    pushHistory();
    setUnits(prev => {
      const next = prev.map(u=>({...u}));
      const u = next[currentIdx];
      u.position = Math.min(21, u.position+mult);
      return next;
    });
  }

  function hitBull(label) {
    if (winner || units.length===0) return;
    pushHistory();
    setUnits(prev => {
      const next = prev.map(u=>({...u}));
      const u = next[currentIdx];
      u.finished = true;
      u.finishedWith = label;
      setWinner(u);
      return next;
    });
  }

  function nextTurn() {
    if (units.length<2) return;
    pushHistory();
    setCurrentIdx(i => {
      for (let k=1;k<=units.length;k++) {
        const n = (i+k) % units.length;
        if (!units[n].finished) return n;
      }
      return i;
    });
  }

  function undo() {
    setHistory(h => {
      if (h.length===0) return h;
      const last = h[h.length-1];
      setUnits(last.units);
      setCurrentIdx(last.currentIdx);
      setWinner(last.winner);
      return h.slice(0,-1);
    });
  }

  function newGame() { setStarted(false); setWinner(null); setHistory([]); }

  const current = units[currentIdx];
  const pickableFriends = groupFriends.filter(f=>!players.find(p=>p.id===f.id));
  const teamPairs = teamMode ? Array.from({length:Math.floor(players.length/2)}, (_,i)=>[players[i*2],players[i*2+1]]) : [];

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
            <p style={{...S.label,margin:"8px 0 8px"}}>Speelvorm</p>
            <div style={{display:"flex",gap:8,marginBottom:24}}>
              <button onClick={()=>setTeamMode(false)} style={{
                flex:1,padding:"12px 0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,
                fontFamily:th.font,textTransform:"uppercase",letterSpacing:1,
                background: !teamMode ? th.gold : "transparent",
                color: !teamMode ? th.bg : th.textDim,
                border:`1px solid ${!teamMode?th.gold:th.border}`,
              }}>Individueel</button>
              <button onClick={()=>setTeamMode(true)} style={{
                flex:1,padding:"12px 0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,
                fontFamily:th.font,textTransform:"uppercase",letterSpacing:1,
                background: teamMode ? th.gold : "transparent",
                color: teamMode ? th.bg : th.textDim,
                border:`1px solid ${teamMode?th.gold:th.border}`,
              }}>Team (2 spelers)</button>
            </div>

            <p style={{...S.label,margin:"8px 0 6px"}}>Spelers</p>
            <p style={{color:th.textDim,fontSize:12,margin:"0 0 14px",lineHeight:1.5}}>
              Iedereen (of elk team) moet om de beurt 1 t/m 20 en de bull raken, in volgorde. Single = +1, Double = +2, Triple = +3.
            </p>
            {players.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                {players.map(p=>(
                  <span key={p.id} style={{display:"flex",alignItems:"center",gap:6,background:th.surface,border:`1px solid ${th.border}`,borderRadius:20,padding:"4px 8px 4px 6px",fontSize:13,color:th.text}}>
                    <Avatar player={p} th={th} size={22}/>
                    {p.name}
                    <button onClick={()=>removePlayer(p.id)} style={{background:"none",border:"none",color:th.textDim,cursor:"pointer",fontSize:14,padding:"2px 4px",lineHeight:1}}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              <input style={{...S.input,flex:1}} placeholder="Naam gast…" value={newName} autoComplete="off"
                onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
              <button style={{...S.primary,width:"auto",padding:"11px 18px"}} onClick={addPlayer}>+</button>
            </div>
            {pickableFriends.length>0 && (
              <>
                <p style={{...S.label,margin:"0 0 8px"}}>Vrienden</p>
                <div style={{marginBottom:20}}>
                  {pickableFriends.map(f=>(
                    <div key={f.id} onClick={()=>addFriendPlayer(f)} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"10px 12px",margin:"6px 0",cursor:"pointer"}}>
                      <Avatar player={f} size={36} th={th}/>
                      <div style={{fontWeight:700,fontSize:15,color:th.text,letterSpacing:1}}>{f.name}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {teamMode && (
              <div style={{marginBottom:20}}>
                <p style={{...S.label,margin:"0 0 8px"}}>Teams</p>
                {teamPairs.length===0 && (
                  <p style={{color:th.textDim,fontSize:12,margin:0}}>Voeg spelers toe om teams te vormen.</p>
                )}
                {teamPairs.map(([a,b],i)=>(
                  <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:10,margin:"6px 0",padding:"8px 12px"}}>
                    <Avatar player={a} th={th} size={28}/>
                    <span style={{fontSize:13,color:th.text}}>{a.name}</span>
                    <span style={{color:th.textDim,fontSize:12}}>&amp;</span>
                    <Avatar player={b} th={th} size={28}/>
                    <span style={{fontSize:13,color:th.text}}>{b.name}</span>
                  </div>
                ))}
                {players.length%2!==0 && (
                  <p style={{color:"#cc6060",fontSize:12,margin:"6px 0 0"}}>Voeg nog 1 speler toe voor een even aantal — elk team heeft 2 spelers.</p>
                )}
              </div>
            )}

            <button style={S.primary} disabled={!canStart} onClick={startGame}>Start spel</button>
          </div>
        ) : winner ? (
          <div style={{padding:"16px 16px 96px",textAlign:"center"}}>
            <div style={{fontSize:11,color:th.textDim,letterSpacing:4,textTransform:"uppercase",margin:"24px 0 16px"}}>Winnaar</div>
            <UnitAvatars unit={winner} th={th} size={88}/>
            <div style={{fontSize:26,fontWeight:700,color:th.gold,letterSpacing:2,textTransform:"uppercase",fontFamily:th.titleFont}}>🏆 {unitLabel(winner)}</div>
            <div style={{fontSize:13,color:th.textMid,marginTop:4,marginBottom:20}}>Uitgegooid met de {winner.finishedWith==="Bullseye"?"Bullseye 🎯":"Bull"}</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
              <DartBoard target={null} th={th} size={220}/>
            </div>
            <button style={{...S.secondary,marginBottom:10}} disabled={history.length===0} onClick={undo}>↺ Ongedaan maken</button>
            <button style={S.primary} onClick={newGame}>Nieuw spel</button>
          </div>
        ) : (
          <div style={{padding:"8px 16px 96px",textAlign:"center"}}>
            <p style={{color:th.textDim,fontSize:11,letterSpacing:2,textTransform:"uppercase",margin:"12px 0 4px"}}>{teamMode ? "Team aan de beurt" : "Aan de beurt"}</p>
            <UnitAvatars unit={current} th={th} size={56}/>
            <p style={{color:th.gold,fontSize:22,fontWeight:700,letterSpacing:1,margin:"0 0 4px",fontFamily:th.titleFont}}>{unitLabel(current)}</p>
            <p style={{color:th.textMid,fontSize:13,margin:"0 0 16px"}}>Doel: <b style={{color:th.gold}}>{current ? targetOf(current) : "-"}</b></p>

            <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
              <DartBoard target={current ? targetOf(current) : null} th={th}/>
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12,flexWrap:"wrap"}}>
              {current && current.position<=20 ? (
                <>
                  <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(1)}>Single</button>
                  <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(2)}>Double</button>
                  <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hit(3)}>Triple</button>
                </>
              ) : (
                <>
                  <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hitBull("Bull")}>Bull</button>
                  <button style={{...S.primary,width:"auto",padding:"13px 22px"}} onClick={()=>hitBull("Bullseye")}>Bulls eye</button>
                </>
              )}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
              <button style={{...S.secondary,width:"auto",padding:"11px 18px"}} disabled={history.length===0} onClick={undo}>↺ Ongedaan maken</button>
              <button style={{...S.secondary,width:"auto",padding:"11px 18px"}} onClick={nextTurn} disabled={units.length<2}>{teamMode ? "Volgend team ›" : "Volgende speler ›"}</button>
            </div>

            <div style={{textAlign:"left"}}>
              <p style={{...S.label,margin:"8px 0"}}>Stand</p>
              {units.map((u,i)=>(
                <div key={u.id} style={{...S.card,display:"flex",alignItems:"center",gap:12,margin:"6px 0",border:`1px solid ${i===currentIdx?th.gold:th.border}`}}>
                  <div style={{display:"flex",gap:4}}>
                    {u.members.map(m=><Avatar key={m.id} player={m} th={th} size={32}/>)}
                  </div>
                  <div style={{flex:1,fontWeight:700,fontSize:14,color:i===currentIdx?th.gold:th.text,letterSpacing:1}}>{unitLabel(u)}</div>
                  <div style={{fontSize:13,color:th.textDim}}>Doel: <b style={{color:th.text}}>{targetOf(u)}</b></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
