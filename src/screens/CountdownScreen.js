import { useState } from 'react';
import ZenPaper from '../components/ZenPaper';

export default function CountdownScreen({ th, go, supabase, S, friends, events, setEvents, themeName }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newYearly, setNewYearly] = useState(false);

  function buildList() {
    const today = new Date(); today.setHours(0,0,0,0);
    function entry(rawDate, isYearly, name, id) {
      const pastRef = new Date(rawDate+'T00:00:00');
      if (isYearly) pastRef.setFullYear(today.getFullYear());
      const pastDays = Math.round((pastRef-today)/86400000);
      const upRef = new Date(pastRef);
      if (isYearly && pastDays<0) upRef.setFullYear(today.getFullYear()+1);
      const upDays = isYearly ? Math.round((upRef-today)/86400000) : pastDays;
      return { id, name, is_yearly: isYearly, pastDays, upDays };
    }
    const all = [
      ...friends.filter(f=>f.birthday).map(f=>entry(f.birthday,true,`🎂 ${f.name}`,`b_${f.id}`)),
      ...events.map(e=>entry(e.event_date,e.is_yearly,e.name,e.id))
    ];
    const past = all.filter(e=>e.pastDays<0).sort((a,b)=>b.pastDays-a.pastDays).slice(0,2);
    const upcoming = all.filter(e=>e.upDays>=0&&e.upDays<=365).sort((a,b)=>a.upDays-b.upDays);
    return { past, upcoming };
  }

  async function addEvent() {
    if (!newName.trim()||!newDate) return;
    const {data} = await supabase.from('events').insert({name:newName.trim(),event_date:newDate,is_yearly:newYearly}).select().single();
    if (data) setEvents(evs=>[...evs,data]);
    setShowAdd(false); setNewName(""); setNewDate(""); setNewYearly(false);
  }

  async function deleteEvent(id) {
    await supabase.from('events').delete().eq('id',id);
    setEvents(evs=>evs.filter(e=>e.id!==id));
  }

  const { past, upcoming } = buildList();
  const zenStyle = `@font-face{font-family:'CooperHewitt';src:url('/CooperHewitt-Thin.otf') format('opentype');font-weight:300;}body{background-color:#f7f3ea!important}`;

  function DayLabel({ days, isPast }) {
    if (isPast) return <span>{Math.abs(days)} dag{Math.abs(days)===1?'':'en'} geleden</span>;
    if (days===0) return <span style={{color:th.gold,fontWeight:700}}>Vandaag! 🎉</span>;
    return <span>{days} dag{days===1?'':'en'}</span>;
  }

  function EventRow({ item, isPast }) {
    const isCustom = !String(item.id).startsWith('b_');
    const days = isPast ? item.pastDays : item.upDays;
    return (
      <div style={{...S.card,marginBottom:8,opacity:isPast?0.4:1,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <div style={{color:th.gold,fontWeight:700,fontSize:15,letterSpacing:1}}>{item.name}</div>
          <div style={{color:th.textMid,fontSize:12,marginTop:3}}>
            <DayLabel days={days} isPast={isPast}/>
            {item.is_yearly&&!isPast&&<span style={{marginLeft:8,fontSize:10,color:th.textDim}}>↺ jaarlijks</span>}
          </div>
        </div>
        {isCustom&&!isPast&&(
          <button style={{background:"none",border:"none",color:th.textDim,fontSize:16,cursor:"pointer",padding:"4px 8px",lineHeight:1}} onClick={()=>deleteEvent(item.id)}>✕</button>
        )}
      </div>
    );
  }

  return (
    <div style={{...S.app,minHeight:"100dvh"}}>
      {themeName==="zen"&&<><style>{zenStyle}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={S.wrap}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
          <h2 style={S.title}>Count Down</h2>
        </div>
        <div style={{padding:"8px 16px 96px"}}>
          {past.length>0&&(
            <>
              <p style={{...S.label,margin:"8px 0"}}>Voorbij</p>
              {past.map(e=><EventRow key={e.id} item={e} isPast={true}/>)}
            </>
          )}
          {upcoming.length>0&&(
            <>
              <p style={{...S.label,margin:`${past.length>0?16:8}px 0 8px`}}>Aankomend</p>
              {upcoming.map(e=><EventRow key={e.id} item={e} isPast={false}/>)}
            </>
          )}
          {past.length===0&&upcoming.length===0&&(
            <div style={{textAlign:"center",padding:"48px 24px",color:th.textDim,fontSize:13,lineHeight:1.8}}>
              Geen events gevonden.<br/>Voeg verjaardagen toe via <span style={{color:th.gold,cursor:"pointer"}} onClick={()=>go("friends")}>Vrienden</span> of tik + om een event toe te voegen.
            </div>
          )}
        </div>
        <button style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:th.gold,color:th.bg,fontSize:28,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.3)",zIndex:100,fontWeight:700,lineHeight:1}} onClick={()=>setShowAdd(true)}>+</button>
        {showAdd&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:8,width:"100%",maxWidth:400,padding:24}}>
              <h3 style={{color:th.gold,margin:"0 0 20px",letterSpacing:2,textTransform:"uppercase",fontSize:13,fontFamily:th.titleFont}}>Nieuw Event</h3>
              <label style={S.label}>Naam</label>
              <input style={{...S.input,marginBottom:16}} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Verjaardag, Feestje…"/>
              <label style={S.label}>Datum</label>
              <input type="date" style={{...S.input,marginBottom:16}} value={newDate} onChange={e=>setNewDate(e.target.value)}/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
                <input type="checkbox" id="cd-yearly" checked={newYearly} onChange={e=>setNewYearly(e.target.checked)} style={{width:18,height:18,cursor:"pointer",accentColor:th.gold}}/>
                <label htmlFor="cd-yearly" style={{color:th.textMid,fontSize:13,cursor:"pointer"}}>Jaarlijks terugkerend</label>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...S.secondary,flex:1}} onClick={()=>{setShowAdd(false);setNewName("");setNewDate("");setNewYearly(false);}}>Annuleren</button>
                <button style={{...S.primary,flex:1}} onClick={addEvent}>Toevoegen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
