import React, { useState, useRef } from 'react';
import { slimPlayer } from '../utils';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';
import Avatar from '../components/Avatar';
import QuitModal from '../components/QuitModal';

export default function ToepenScreen({ th, S, themeName, game, setGame, showQuit, setShowQuit, showAddLatePlayer, setShowAddLatePlayer, friends, liveGameId, isController, syncLiveGame, refreshGameState, takeOverControls, endLiveGame, setToepStats, setScreen, go, groupFriends, saveGameToSupabase }) {
  const [toepDeltas, setToepDeltas] = useState({});
  const deltaTimers = useRef({});
  function richPlayer(p) { const f=friends.find(f=>f.id===p?.id); return f?{...f,...p}:p; }

  function toepChange(pi, delta) {
    setToepDeltas(prev => {
      const current = prev[pi];
      const accumulated = current ? current.delta + delta : delta;
      if (deltaTimers.current[pi]) clearTimeout(deltaTimers.current[pi]);
      deltaTimers.current[pi] = setTimeout(() => {
        setToepDeltas(p => { const n={...p}; delete n[pi]; return n; });
      }, 5000);
      return { ...prev, [pi]: { delta: accumulated } };
    });
    const g=game;
    const scores=[...g.scores];
    scores[pi]=Math.max(0,scores[pi]+delta);
    const stillElim=[...g.eliminated.filter(i=>scores[i]>=15)];
    if (scores[pi]>=15&&!stillElim.includes(pi)) stillElim.push(pi);
    const active=g.players.map((_,i)=>i).filter(i=>!stillElim.includes(i));
    if (active.length===1) {
      const wi=active[0];
      const totals=g.players.map((p,i)=>({...p,score:scores[i],isWinner:i===wi})).sort((a,b)=>a.score-b.score);
      setToepStats(prev=>{ const next={...prev}; g.players.forEach((p,i)=>{ const st=next[p.id]||{games:0,wins:0}; next[p.id]={games:st.games+1,wins:st.wins+(i===wi?1:0)}; }); return next; });
      if (!g.saved) { const toepScores=scores.map(s=>[s]); saveGameToSupabase(g.players,toepScores,wi,'toepen'); }
      setScreen("toepOver");
      const ns={...g,scores,eliminated:stillElim,finalTotals:totals,winner:g.players[wi],saved:true};
      setGame(ns); syncLiveGame(ns); return;
    }
    const ns={...g,scores,eliminated:stillElim};
    setGame(ns); syncLiveGame(ns);
  }

  function addLatePlayer(friend) {
    const g = game;
    const elim = g.eliminated || [];
    const activeScores = g.scores.filter((_,i) => !elim.includes(i));
    const maxScore = activeScores.length ? Math.max(...activeScores) : 0;
    const ns = { ...g, players:[...g.players, slimPlayer(friend)], scores:[...g.scores, maxScore] };
    setGame(ns); syncLiveGame(ns);
    setShowAddLatePlayer(false);
  }

  const elim=game.eliminated||[];
  const activeCnt=game.players.length-elim.length;

  return (
    <div style={{...S.app,display:"flex",flexDirection:"column",height:"100dvh"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={{...S.wrap,display:"flex",flexDirection:"column",height:"100dvh"}}>
        <div style={{...S.header,flexShrink:0}}>
          <button style={S.backBtn} onClick={()=>setShowQuit(true)}>✕</button>
          <h2 style={{...S.title,fontSize:16}}>Toepen</h2>
          <span style={{marginLeft:"auto",fontSize:12,color:th.textDim,letterSpacing:1}}>{activeCnt} actief</span>
        </div>
        {showQuit&&<QuitModal th={th} S={S} onCancel={()=>setShowQuit(false)} onConfirm={async ()=>{ setShowQuit(false); await endLiveGame(); setGame(null); go("home"); }}/>}
        <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
          {game.players.map((p,pi)=>{
            const score=game.scores[pi];
            const isElim=elim.includes(pi);
            const isWarn=score>=14&&!isElim;
            return (
              <div key={pi} style={{...S.card,margin:"6px 16px",border:`1px solid ${isElim?"#3a2020":isWarn?"#7a3030":th.border}`,background:isElim?"#110d0d":isWarn?"#1f1010":th.surface,opacity:isElim?0.55:1}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <Avatar player={richPlayer(p)} size={44} th={th} style={{border:`1px solid ${isElim?"#3a2020":isWarn?"#7a3030":th.border}`,opacity:isElim?0.5:1}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:17,letterSpacing:1,color:isElim?th.textDim:isWarn?"#cc6060":th.text,textDecoration:isElim?"line-through":"none"}}>{p.name}</div>
                    {isElim&&<div style={{fontSize:11,color:"#7a3030",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>Uitgeschakeld</div>}
                    {isWarn&&<div style={{fontSize:11,color:"#cc4040",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>Pelt!</div>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {(!liveGameId||isController)&&<button disabled={isElim} onClick={()=>toepChange(pi,-1)} style={{width:40,height:40,borderRadius:4,background:"transparent",border:`1px solid ${isElim?th.textDim:th.border}`,color:isElim?th.textDim:th.gold,fontSize:20,cursor:isElim?"not-allowed":"pointer"}}>−</button>}
                    <div style={{position:"relative",width:52,height:52}}>
                      <div style={{width:52,height:52,borderRadius:4,background:th.surface2,border:`1px solid ${isElim?"#3a2020":isWarn?"#cc4040":th.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:isElim?th.textDim:isWarn?"#cc6060":th.text}}>{score}</div>
                      {toepDeltas[pi]&&(
                        <div style={{position:"absolute",top:-10,right:-8,minWidth:22,height:22,borderRadius:11,background:toepDeltas[pi].delta>0?"#cc4040":"#3a8a3a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",padding:"0 5px",letterSpacing:0,boxShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>
                          {toepDeltas[pi].delta>0?"+":""}{toepDeltas[pi].delta}
                        </div>
                      )}
                    </div>
                    {(!liveGameId||isController)&&<button disabled={isElim} onClick={()=>toepChange(pi,1)} style={{width:40,height:40,borderRadius:4,background:"transparent",border:`1px solid ${isElim?th.textDim:th.border}`,color:isElim?th.textDim:th.gold,fontSize:20,cursor:isElim?"not-allowed":"pointer"}}>+</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {(!liveGameId||isController)&&(
            <div style={{padding:"8px 16px 20px"}}>
              <button onClick={()=>setShowAddLatePlayer(true)} style={{width:"100%",padding:"12px",background:"transparent",border:`1px dashed ${th.border}`,borderRadius:4,color:th.textDim,fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:th.font}}>＋ Speler toevoegen</button>
            </div>
          )}
        </div>
        {showAddLatePlayer&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:4,padding:20,maxWidth:340,width:"100%",maxHeight:"80dvh",display:"flex",flexDirection:"column"}}>
              <p style={{color:th.gold,fontSize:14,fontWeight:700,letterSpacing:2,textTransform:"uppercase",margin:"0 0 4px",fontFamily:th.titleFont}}>Speler toevoegen</p>
              <p style={{color:th.textMid,fontSize:12,margin:"0 0 14px"}}>Inkopen voor: {(()=>{const activeScores=game.scores.filter((_,i)=>!elim.includes(i));return activeScores.length?Math.max(...activeScores):0;})()} punten</p>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input id="late-guest-input" style={{...S.input,flex:1}} placeholder="Naam gast..." autoComplete="off"/>
                <button style={{...S.primary,width:"auto",padding:"11px 18px"}} onClick={()=>{const el=document.getElementById("late-guest-input");const val=el?.value?.trim();if(!val)return;addLatePlayer({id:`guest_${Date.now()}`,name:val,color:th.gold});el.value="";}}>+</button>
              </div>
              <div style={{overflowY:"auto",flex:1}}>
                {groupFriends.filter(f=>!game.players.find(p=>p.id===f.id)).map(f=>(
                  <div key={f.id} onClick={()=>addLatePlayer(f)} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"10px 12px",margin:"6px 0",cursor:"pointer"}}>
                    <Avatar player={f} size={36} th={th}/>
                    <div style={{fontWeight:700,fontSize:15,color:th.text,letterSpacing:1}}>{f.name}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowAddLatePlayer(false)} style={{...S.secondary,marginTop:12}}>Annuleren</button>
            </div>
          </div>
        )}
        {liveGameId&&!isController&&(
          <div style={{background:th.surface,borderTop:`1px solid ${th.border}`,padding:"12px 16px 20px",flexShrink:0}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={refreshGameState} style={{...S.secondary,width:"auto",flex:1}}>↻ Vernieuwen</button>
              <button onClick={takeOverControls} style={{...S.primary,flex:1}}>Overnemen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
