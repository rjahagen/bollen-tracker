import React from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

export default function FriendsScreen({ th, S, themeName, groupFriends, myGroups, currentGroupId, setCurrentGroupId, setEditName, setSelFriend, bollenStats, toepStats, go }) {
  const showGroupTabs = myGroups.length > 1;
  function getBollenSt(id) { return bollenStats[id]||{games:0,wins:0}; }
  function getToepSt(id)   { return toepStats[id]||{games:0,wins:0}; }
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
        <h2 style={S.title}>Vrienden</h2>
        <button style={{...S.backBtn,marginLeft:"auto"}} onClick={()=>{ setEditName(""); go("addFriend"); }}>+</button>
      </div>
      {showGroupTabs&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,padding:"8px 16px 10px",borderBottom:`1px solid ${th.border}`,flexShrink:0}}>
          {myGroups.map(g=>{
            const active=g.id===currentGroupId;
            return (
              <button key={g.id} onClick={()=>setCurrentGroupId(g.id)} style={{
                padding:"9px 14px",fontSize:11,letterSpacing:2,textTransform:"uppercase",
                borderRadius:4,cursor:"pointer",fontFamily:th.font,width:"100%",textAlign:"left",
                background:active?th.gold:"transparent",
                color:active?th.bg:th.textDim,
                border:`1px solid ${active?th.gold:th.border}`,
                fontWeight:active?700:400,
              }}>{g.name}</button>
            );
          })}
        </div>
      )}
      <div style={{overflowY:"auto",maxHeight:`calc(100dvh - ${showGroupTabs?72+myGroups.length*45:72}px)`,padding:"6px 16px 8px"}}>
        {groupFriends.length===0?(
          <p style={{...S.label,textAlign:"center",padding:24}}>Geen leden in deze groep</p>
        ):groupFriends.map(f=>{
          const bs=getBollenSt(f.id); const ts=getToepSt(f.id);
          const tg=bs.games+ts.games; const tw=bs.wins+ts.wins;
          const pct=tg>0?Math.round(tw/tg*100):0;
          return (
            <div key={f.id} style={{...S.card,margin:"6px 0",cursor:"pointer"}} onClick={()=>{ setSelFriend(f); go("friendPage"); }}>
              <div style={S.row}>
                <Avatar player={f} size={44} th={th}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:16,color:th.text,letterSpacing:1}}>{f.name}</div>
                  <div style={{color:th.textDim,fontSize:11,marginTop:1}}>{tg} gespeeld · {tw} gewonnen · {pct}%</div>
                </div>
                <div style={{color:th.textDim}}>›</div>
              </div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
}
