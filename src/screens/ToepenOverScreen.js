import React from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

export default function ToepenOverScreen({ th, S, themeName, game, setGame, setGamePlayers, friends, endLiveGame, startToepen, go }) {
  function richPlayer(p) { const f=friends.find(f=>f.id===p?.id); return f?{...f,...p}:p; }
  const totals=game.finalTotals||[];
  const winner=game.winner||totals[0];
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={{textAlign:"center",padding:"32px 20px 20px",borderBottom:`1px solid ${th.border}`}}>
        <div style={{fontSize:11,color:th.textDim,letterSpacing:4,textTransform:"uppercase",marginBottom:16}}>Winnaar</div>
        {winner && <Avatar player={richPlayer(winner)} size={88} th={th} style={{margin:"0 auto 12px",border:`2px solid ${th.gold}`}}/>}
        <div style={{fontSize:26,fontWeight:700,color:th.gold,letterSpacing:3,textTransform:"uppercase",fontFamily:th.titleFont}}>{winner.name}</div>
        <div style={{fontSize:18,color:th.textMid,marginTop:6,letterSpacing:1}}>Laatste man staand</div>
      </div>
      <div style={{padding:"16px 16px 8px"}}>
        <p style={{...S.label,marginBottom:8}}>Eindstand</p>
        {totals.map((p,rank)=>(
          <div key={p.id||rank} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",margin:"6px 0",borderColor:p.isWinner?th.gold:th.border}}>
            <div style={{width:24,textAlign:"center",fontSize:13,color:p.isWinner?th.gold:th.textDim,fontWeight:700}}>{rank+1}</div>
            <Avatar player={richPlayer(p)} size={40} th={th}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:p.isWinner?th.gold:th.text,letterSpacing:1}}>{p.name}</div>
              <div style={{fontSize:11,color:th.textDim}}>{p.isWinner?"Winnaar":"Uitgeschakeld"}</div>
            </div>
            <div style={{fontWeight:800,fontSize:22,color:p.isWinner?th.gold:th.textDim}}>{p.score}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"8px 16px 32px"}}>
        <button style={{...S.primary,marginBottom:10}} onClick={async ()=>{ await endLiveGame(); setGame(null); setGamePlayers([]); go("home"); }}>Terug naar home</button>
        <button style={S.secondary} onClick={()=>{ setGamePlayers([...game.players]); startToepen(); }}>Opnieuw spelen</button>
      </div>
    </Wrap>
  );
}
