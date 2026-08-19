import React, { useRef } from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

export default function SelectPlayersScreen({ th, S, themeName, gamePlayers, setGamePlayers, maxPlayers, gameMode, groupFriends, currentGroup, startToepen, startBollen, removePlayer, togglePlayer, go }) {
  const guestInputRef = useRef(null);
  const startFn = gameMode==="toepen" ? startToepen : startBollen;
  const label   = gameMode==="toepen" ? "Toepen" : "Bollen";
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
        <h2 style={S.title}>{label} — Spelers</h2>
      </div>
      <div style={{padding:"12px 16px 8px",display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
        {Array(maxPlayers).fill(null).map((_,i)=>{
          const p=gamePlayers[i];
          return (
            <div key={i} style={{width:50,height:50,borderRadius:"50%",border:`1px solid ${p?th.gold:th.border}`,display:"flex",alignItems:"center",justifyContent:"center",background:th.surface,position:"relative",cursor:p?"pointer":"default"}} onClick={p?()=>removePlayer(p.id):undefined}>
              {p?<><Avatar player={p} size={46} th={th}/><div style={{position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:"#5a2020",border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#ccc",cursor:"pointer"}}>✕</div></>
              :<span style={{color:th.textDim,fontSize:16}}>+</span>}
            </div>
          );
        })}
      </div>
      {gamePlayers.length>0&&<div style={{textAlign:"center",padding:"0 16px 4px"}}>
        <p style={{...S.label,marginBottom:0,textAlign:"center"}}>{gamePlayers.map((p,i)=>`${i+1}. ${p.name}`).join("  ·  ")}</p>
      </div>}
      <div style={{padding:"10px 16px 8px"}}>
        <button style={{...S.primary,opacity:gamePlayers.length<2?0.35:1}} disabled={gamePlayers.length<2} onClick={startFn}>Start spel ({gamePlayers.length}/{maxPlayers})</button>
      </div>
      <div style={{padding:"0 16px",overflowY:"auto",maxHeight:"calc(100dvh - 230px)"}}>
        <p style={{...S.label,margin:"8px 0 6px"}}>{currentGroup?currentGroup.name:"Kies spelers"}</p>
        {groupFriends.map(f=>{
          const sel=!!gamePlayers.find(p=>p.id===f.id);
          return (
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:`1px solid ${sel?th.gold:th.border}`,borderRadius:4,padding:"10px 12px",margin:"5px 0",background:sel?th.surface:th.bg}} onClick={()=>togglePlayer(f)}>
              <Avatar player={f} size={36} th={th}/>
              <span style={{flex:1,fontSize:15,letterSpacing:1}}>{f.name}</span>
              {sel&&<span style={{color:th.gold,fontSize:16}}>✓</span>}
            </div>
          );
        })}
        <p style={{...S.label,margin:"12px 0 6px"}}>Gast toevoegen</p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input ref={guestInputRef} id="guest-input" style={{...S.input,flex:1}} placeholder="Naam gast..." autoComplete="off"/>
          <button style={{...S.primary,width:"auto",padding:"11px 18px"}} onClick={()=>{const val=guestInputRef.current?.value?.trim();if(!val||gamePlayers.length>=maxPlayers)return;setGamePlayers(p=>[...p,{id:`guest_${Date.now()}`,name:val,color:th.gold}]);guestInputRef.current.value="";}}>+</button>
        </div>
      </div>
    </Wrap>
  );
}
