import React from 'react';

export default function Avatar({ player, size=48, th, style={} }) {
  const surface2 = th ? th.surface2 : "#1e2d34";
  const border   = th ? th.border   : "rgba(207,157,123,0.18)";
  const gold     = th ? th.gold     : "#CF9D7B";
  const base = { width:size, height:size, borderRadius:"50%", background:surface2,
    display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
    flexShrink:0, border:`1px solid ${border}`, ...style };
  if (player?.photo) return (
    <div style={{...base,display:"block",position:"relative",overflow:"hidden"}}>
      <img src={player.photo} alt={player.name} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover"}}/>
    </div>
  );
  return <div style={{...base,fontSize:size*0.45,color:gold,fontWeight:700}}>{(player?.name||"?")[0].toUpperCase()}</div>;
}
