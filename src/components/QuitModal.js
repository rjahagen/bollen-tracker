import React from 'react';

export default function QuitModal({ th, S, onCancel, onConfirm }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:4,padding:28,maxWidth:300,width:"100%",textAlign:"center"}}>
        <p style={{color:th.gold,fontSize:18,fontWeight:700,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px",fontFamily:th.titleFont}}>Spel stoppen?</p>
        <p style={{color:th.textMid,fontSize:13,margin:"0 0 24px"}}>De huidige stand gaat verloren.</p>
        <div style={{display:"flex",gap:10}}>
          <button style={{...S.secondary,flex:1}} onClick={onCancel}>Annuleren</button>
          <button style={{flex:1,background:"transparent",border:"1px solid #5a2020",borderRadius:4,color:"#a04040",padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1,fontFamily:th.font}} onClick={onConfirm}>Stoppen</button>
        </div>
      </div>
    </div>
  );
}
