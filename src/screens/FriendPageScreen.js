import React from 'react';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';
import StatPill from '../components/StatPill';

export default function FriendPageScreen({ th, S, themeName, selFriend, friendStats, bollenStats, toepStats, updatePhoto, updateBirthday, deleteFriend, go }) {
  const getBollenSt = id => bollenStats[id]||{games:0,wins:0};
  const getToepSt   = id => toepStats[id]||{games:0,wins:0};
  const bs=getBollenSt(selFriend.id); const ts=getToepSt(selFriend.id);
  const tg=bs.games+ts.games; const tw=bs.wins+ts.wins;
  const pct=tg>0?Math.round(tw/tg*100):0;
  const bPct=bs.games>0?Math.round(bs.wins/bs.games*100):0;
  const tPct=ts.games>0?Math.round(ts.wins/ts.games*100):0;
  return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>go("friends")}>‹</button>
        <h2 style={S.title}>{selFriend.name}</h2>
      </div>
      <div style={{padding:16,textAlign:"center"}}>
        <div style={{position:"relative",width:100,margin:"20px auto 8px",cursor:"pointer"}} onClick={()=>document.getElementById("photo-input").click()}>
          <Avatar player={selFriend} size={100} th={th} style={{border:`2px solid ${th.gold}`}}/>
          <div style={{position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:th.surface,border:`1px solid ${th.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✎</div>
          <input id="photo-input" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{ const file=e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=ev=>updatePhoto(selFriend.id,ev.target.result); r.readAsDataURL(file); }}/>
        </div>
        <p style={{color:th.textDim,fontSize:11,letterSpacing:2,textTransform:"uppercase",margin:"0 0 4px"}}>Tik om foto te wijzigen</p>
        <h2 style={{color:th.text,fontSize:24,letterSpacing:2,margin:"0 0 16px"}}>{selFriend.name}</h2>
        <div style={{textAlign:"left",marginBottom:20}}>
          <p style={{...S.label,marginBottom:6}}>Verjaardag</p>
          <input type="date" value={selFriend.birthday||""} onChange={e=>updateBirthday(selFriend.id,e.target.value)} style={{...S.input}}/>
        </div>
        <p style={{...S.label,textAlign:"left",margin:"0 0 6px"}}>Totaal</p>
        <div style={{...S.card,display:"flex",justifyContent:"space-around",padding:"16px 8px",margin:"0 0 12px"}}>
          <StatPill label="Gespeeld" value={tg} th={th}/>
          <div style={{width:1,background:th.border}}/>
          <StatPill label="Gewonnen" value={tw} th={th}/>
          <div style={{width:1,background:th.border}}/>
          <StatPill label="Win %" value={pct+"%"} th={th}/>
        </div>
        <p style={{...S.label,textAlign:"left",margin:"0 0 6px"}}>Bollen</p>
        <div style={{...S.card,padding:"14px 8px",margin:"0 0 4px"}}>
          <div style={{display:"flex",justifyContent:"space-around",marginBottom:bs.games>0?12:0}}>
            <StatPill label="Gespeeld" value={bs.games} th={th}/>
            <div style={{width:1,background:th.border}}/>
            <StatPill label="Gewonnen" value={bs.wins} th={th}/>
            <div style={{width:1,background:th.border}}/>
            <StatPill label="Win %" value={bPct+"%"} th={th}/>
          </div>
          {bs.games>0&&friendStats&&(<>
            <div style={{height:1,background:th.border,margin:"0 0 12px"}}/>
            <div style={{display:"flex",justifyContent:"space-around",marginBottom:12}}>
              <StatPill label="Gem. score" value={friendStats.avg??"-"} th={th}/>
              <div style={{width:1,background:th.border}}/>
              <StatPill label="Beste" value={friendStats.best??"-"} th={th}/>
              <div style={{width:1,background:th.border}}/>
              <StatPill label="Slechtste" value={friendStats.worst??"-"} th={th}/>
            </div>
            <div style={{height:1,background:th.border,margin:"0 0 12px"}}/>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              <StatPill label="Nauwkeurig" value={friendStats.acc!=null?friendStats.acc+"%":"-"} th={th}/>
              <div style={{width:1,background:th.border}}/>
              <StatPill label="Bollen" value={friendStats.bollen} th={th}/>
              <div style={{width:1,background:th.border}}/>
              <StatPill label="Rondes" value={friendStats.rounds} th={th}/>
            </div>
          </>)}
          {bs.games>0&&!friendStats&&(
            <div style={{textAlign:"center",padding:"8px 0",color:th.textDim,fontSize:11,letterSpacing:1}}>Laden...</div>
          )}
        </div>
        <p style={{...S.label,textAlign:"left",margin:"12px 0 6px"}}>Toepen</p>
        <div style={{...S.card,display:"flex",justifyContent:"space-around",padding:"14px 8px",margin:"0 0 20px"}}>
          <StatPill label="Gespeeld" value={ts.games} th={th}/>
          <div style={{width:1,background:th.border}}/>
          <StatPill label="Gewonnen" value={ts.wins} th={th}/>
          <div style={{width:1,background:th.border}}/>
          <StatPill label="Win %" value={tPct+"%"} th={th}/>
        </div>
        {!selFriend.is_preset&&(
          <button style={{...S.secondary,color:"#a04040",borderColor:"#5a2020"}} onClick={()=>deleteFriend(selFriend.id)}>Verwijderen</button>
        )}
      </div>
    </Wrap>
  );
}
