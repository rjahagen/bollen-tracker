import React from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';
import Avatar from '../components/Avatar';

export default function SelectProfileScreen({ th, S, themeName, isIPad, groups, groupFriends, allFriends, currentGroupId, setCurrentGroupId, setCurrentPlayerId, setScreen, saveS }) {
  return (
    <div style={{...S.app,height:"100dvh",overflowY:"auto"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={S.wrap}>
        <div style={{textAlign:"center",padding:"40px 24px 20px"}}>
          <h1 style={{...S.title,fontSize:28,letterSpacing:4,marginBottom:8}}>Wie ben jij?</h1>
          <p style={{color:th.textMid,fontSize:12,letterSpacing:3,textTransform:"uppercase"}}>Kies je groep en profiel</p>
        </div>
        {groups.length>1&&(
          <div style={{display:"flex",flexDirection:"column",gap:8,padding:"0 16px 20px"}}>
            {groups.map(g=>{
              const active=g.id===currentGroupId;
              return (
                <button key={g.id} onClick={()=>setCurrentGroupId(g.id)} style={{
                  padding:"10px 18px",fontSize:12,letterSpacing:2,textTransform:"uppercase",
                  borderRadius:4,cursor:"pointer",fontFamily:th.font,width:"100%",
                  boxSizing:"border-box",textAlign:"left",
                  background:active?th.gold:"transparent",
                  color:active?th.bg:th.textDim,
                  border:`1px solid ${active?th.gold:th.border}`,
                  fontWeight:active?700:400,
                }}>{g.name}</button>
              );
            })}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:isIPad?"repeat(4,1fr)":"repeat(3,1fr)",gap:12,padding:"0 16px 48px"}}>
          {(groups.length>0?groupFriends:allFriends).map(f=>(
            <div key={f.id} onClick={()=>{ saveS("cards_current_player",f.id); setCurrentPlayerId(f.id); setScreen("home"); }} style={{...S.card,cursor:"pointer",textAlign:"center",padding:"20px 8px",margin:0,transition:"opacity .15s"}}>
              <Avatar player={f} size={isIPad?80:60} th={th} style={{margin:"0 auto 10px"}}/>
              <div style={{color:th.gold,fontWeight:700,fontSize:13,letterSpacing:1,textTransform:"uppercase"}}>{f.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
