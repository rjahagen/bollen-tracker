import { useState, useEffect, useRef } from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';

const DICE_PIPS = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
};

function DieFace({ value, th, size=56 }) {
  const active = value ? DICE_PIPS[value] : [];
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.18, boxSizing:"border-box",
      display:"grid", gridTemplateColumns:"repeat(3,1fr)", gridTemplateRows:"repeat(3,1fr)",
      padding:size*0.14,
      background: value ? "#f5f5f0" : "transparent",
      border: value ? "1px solid rgba(0,0,0,0.15)" : `1px dashed ${th.border}`,
      boxShadow: value ? "0 2px 6px rgba(0,0,0,0.3)" : "none",
    }}>
      {Array.from({length:9}).map((_,i)=>{
        const r=Math.floor(i/3), c=i%3;
        const on = active.some(([ar,ac])=>ar===r&&ac===c);
        return (
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
            {on && <div style={{width:"62%",height:"62%",borderRadius:"50%",background:"#1a1a1a"}}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function DiceScreen({ th, go, S, themeName }) {
  const [diceCount, setDiceCount]     = useState(5);
  const [values, setValues]           = useState(Array(5).fill(null));
  const [locked, setLocked]           = useState(Array(5).fill(false));
  const [rollingDice, setRollingDice] = useState(Array(5).fill(false)); // per-die: still tumbling
  const [justLanded, setJustLanded]   = useState(Array(5).fill(false)); // per-die: brief landing pop
  const [rolling, setRolling]         = useState(false); // any die still in motion
  const [hasRolled, setHasRolled]     = useState(false);
  const [rollCount, setRollCount]     = useState(0);
  const timers = useRef({ intervals: [], timeouts: [] });

  function clearTimers() {
    timers.current.intervals.forEach(id=>clearInterval(id));
    timers.current.timeouts.forEach(id=>clearTimeout(id));
    timers.current = { intervals: [], timeouts: [] };
  }
  useEffect(()=>clearTimers, []);

  function setCount(n) {
    if (rolling) return;
    clearTimers();
    setDiceCount(n);
    setValues(Array(n).fill(null));
    setLocked(Array(n).fill(false));
    setRollingDice(Array(n).fill(false));
    setJustLanded(Array(n).fill(false));
    setHasRolled(false);
    setRollCount(0);
  }

  function roll() {
    if (rolling) return;
    clearTimers();
    const heldSnapshot = hasRolled ? locked : Array(diceCount).fill(false);
    setRolling(true);
    setRollingDice(heldSnapshot.map(l=>!l));
    setJustLanded(Array(diceCount).fill(false));

    let maxDelay = 0;
    for (let i=0; i<diceCount; i++) {
      if (heldSnapshot[i]) continue;
      // fast flicker through random faces while this die tumbles
      const intervalId = setInterval(()=>{
        setValues(prev => { const n=[...prev]; n[i]=1+Math.floor(Math.random()*6); return n; });
      }, 70);
      timers.current.intervals.push(intervalId);

      // each die settles at a slightly different moment, like real dice coming to rest
      const delay = 480 + i*110 + Math.random()*180;
      maxDelay = Math.max(maxDelay, delay);
      const settleId = setTimeout(()=>{
        clearInterval(intervalId);
        setValues(prev => { const n=[...prev]; n[i]=1+Math.floor(Math.random()*6); return n; });
        setRollingDice(prev => { const n=[...prev]; n[i]=false; return n; });
        setJustLanded(prev => { const n=[...prev]; n[i]=true; return n; });
        const popId = setTimeout(()=>{
          setJustLanded(prev => { const n=[...prev]; n[i]=false; return n; });
        }, 320);
        timers.current.timeouts.push(popId);
      }, delay);
      timers.current.timeouts.push(settleId);
    }

    const doneId = setTimeout(()=>{
      setRolling(false);
      setHasRolled(true);
      setRollCount(c=>c+1);
    }, maxDelay + 120);
    timers.current.timeouts.push(doneId);
  }

  function toggleLock(i, e) {
    e.stopPropagation();
    if (!hasRolled || rolling) return;
    setLocked(prev => prev.map((l,idx)=> idx===i ? !l : l));
  }

  function newTurn() {
    if (rolling) return;
    setLocked(Array(diceCount).fill(false));
    setHasRolled(false);
    setRollCount(0);
  }

  const dieSize = diceCount===1 ? 76 : diceCount===3 ? 54 : 40;
  return (
    <div style={{...S.app,minHeight:"100dvh"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      <style>{`
        @keyframes diceDomeTumble {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(0.97) rotate(-2deg); }
          40%  { transform: scale(1.02) rotate(2deg); }
          60%  { transform: scale(0.98) rotate(-1.5deg); }
          80%  { transform: scale(1.01) rotate(1.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes dieTumble {
          0%   { transform: translateY(0) rotate(0deg) scale(1); }
          20%  { transform: translateY(-7px) rotate(80deg) scale(0.9); }
          45%  { transform: translateY(3px) rotate(170deg) scale(1.06); }
          70%  { transform: translateY(-4px) rotate(260deg) scale(0.94); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        @keyframes diePop {
          0%   { transform: scale(1.4); }
          55%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        .dice-dome-rolling { animation: diceDomeTumble 0.5s ease-in-out infinite; }
        .dice-tumble { animation: dieTumble 0.32s linear infinite; }
        .dice-pop { animation: diePop 0.32s cubic-bezier(.34,1.56,.64,1); }
        @media (prefers-reduced-motion: reduce) {
          .dice-dome-rolling, .dice-tumble, .dice-pop { animation: none!important; }
        }
      `}</style>
      {S.overlay&&<div style={S.overlay}/>}
      <div style={S.wrap}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
          <h2 style={S.title}>Dobbelstenen</h2>
        </div>

        <div style={{padding:"8px 16px 96px",textAlign:"center"}}>
          <p style={{...S.label,textAlign:"center",margin:"16px 0 8px"}}>Aantal dobbelstenen</p>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
            {[1,3,5].map(n=>(
              <button key={n} onClick={()=>setCount(n)} style={{
                width:52,height:44,borderRadius:8,cursor:"pointer",fontSize:16,fontWeight:700,
                fontFamily:th.font,
                background: diceCount===n ? th.gold : "transparent",
                color: diceCount===n ? th.bg : th.textDim,
                border:`1px solid ${diceCount===n?th.gold:th.border}`,
              }}>{n}</button>
            ))}
          </div>

          <div
            onClick={roll}
            className={rolling?"dice-dome-rolling":undefined}
            style={{
              width:240,height:240,borderRadius:"50%",margin:"0 auto 18px",cursor:rolling?"default":"pointer",
              background:`radial-gradient(circle at 35% 28%, ${th.surface2}, ${th.surface} 60%, ${th.bg} 100%)`,
              border:`2px solid ${th.border}`,
              boxShadow:`inset 0 10px 26px rgba(0,0,0,0.35), inset 0 -6px 14px rgba(255,255,255,0.06), 0 0 0 6px ${th.surface2}`,
              display:"flex",alignItems:"center",justifyContent:"center",position:"relative",
              userSelect:"none",
            }}
          >
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",maxWidth:170}}>
              {values.map((v,i)=>{
                const cls = rollingDice[i] ? "dice-tumble" : justLanded[i] ? "dice-pop" : undefined;
                return (
                  <button
                    key={i}
                    onClick={(e)=>toggleLock(i,e)}
                    className={cls}
                    style={{
                      background:"transparent", border:"none", padding:0,
                      cursor: hasRolled && !rolling ? "pointer" : "default",
                      filter: locked[i] ? `drop-shadow(0 0 7px ${th.gold})` : "none",
                    }}
                  >
                    <DieFace value={v} th={th} size={dieSize}/>
                  </button>
                );
              })}
            </div>
            {!hasRolled && !rolling && (
              <div style={{position:"absolute",bottom:20,left:0,right:0,textAlign:"center",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:th.textDim}}>
                Tik om te gooien
              </div>
            )}
          </div>

          <button style={{...S.primary,maxWidth:260,margin:"0 auto 10px"}} onClick={roll} disabled={rolling}>
            {rolling ? "…" : hasRolled ? "Gooi opnieuw 🎲" : "Gooien 🎲"}
          </button>

          {hasRolled && (
            <p style={{color:th.textDim,fontSize:12,margin:"10px auto 0",lineHeight:1.5,maxWidth:320}}>
              Tik op een dobbelsteen om 'm vast te houden voor de volgende worp — handig voor Yahtzee.
            </p>
          )}

          {hasRolled && (
            <div style={{display:"flex",justifyContent:"center",gap:16,alignItems:"center",marginTop:14}}>
              <span style={{color:th.textDim,fontSize:12}}>Worp {rollCount}</span>
              <button style={{...S.secondary,width:"auto",padding:"9px 16px"}} onClick={newTurn}>Nieuwe beurt</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
