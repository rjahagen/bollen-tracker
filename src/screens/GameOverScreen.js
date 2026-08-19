import React from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

export default function GameOverScreen({ th, S, themeName, game, setGame, setGamePlayers, friends, endLiveGame, startBollen, go }) {
  function richPlayer(p) { const f=friends.find(f=>f.id===p?.id); return f?{...f,...p}:p; }
  function playerTotal(idx) { if (!game) return 0; return game.scores[idx].reduce((a,v)=>a+(v??0),0); }
  const totals=game.finalTotals||game.players.map((p,i)=>({...p,total:playerTotal(i),scores:game.scores[i]})).sort((a,b)=>b.total-a.total);
  const winner=totals[0];
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={{textAlign:"center",padding:"32px 20px 20px",borderBottom:`1px solid ${th.border}`}}>
        <div style={{fontSize:11,color:th.textDim,letterSpacing:4,textTransform:"uppercase",marginBottom:16}}>Winnaar</div>
        <Avatar player={richPlayer(winner)} size={88} th={th} style={{margin:"0 auto 12px",border:`2px solid ${th.gold}`}}/>
        <div style={{fontSize:26,fontWeight:700,color:th.gold,letterSpacing:3,textTransform:"uppercase",fontFamily:th.titleFont}}>{winner.name}</div>
        <div style={{fontSize:32,fontWeight:800,color:th.text,marginTop:4}}>{winner.total} <span style={{fontSize:14,color:th.textDim,fontWeight:400}}>punten</span></div>
      </div>
      <div style={{padding:"16px 16px 8px"}}>
        <p style={{...S.label,marginBottom:8}}>Eindstand</p>
        {totals.map((p,rank)=>(
          <div key={p.id||rank} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",margin:"6px 0",borderColor:rank===0?th.gold:th.border}}>
            <div style={{width:24,textAlign:"center",fontSize:13,color:rank===0?th.gold:th.textDim,fontWeight:700}}>{rank+1}</div>
            <Avatar player={richPlayer(p)} size={40} th={th}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:rank===0?th.gold:th.text,letterSpacing:1}}>{p.name}</div>
              <div style={{fontSize:10,color:th.textDim,fontFamily:"monospace",marginTop:2}}>{p.scores?p.scores.map(s=>s===null?"·":s<0?(themeName==="wsw"?"✨":"●"):s).join(" "):""}</div>
            </div>
            <div style={{fontWeight:800,fontSize:22,color:rank===0?th.gold:th.text}}>{p.total}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"8px 16px 32px"}}>
        <button style={{...S.primary,marginBottom:10}} onClick={async ()=>{ await endLiveGame(); setGame(null); setGamePlayers([]); go("home"); }}>Terug naar home</button>
        <button style={S.secondary} onClick={()=>{ setGamePlayers([...game.players]); startBollen(); }}>Opnieuw spelen</button>
      </div>
    </Wrap>
  );
}
