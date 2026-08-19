import React from 'react';

export default function StatPill({ label, value, th }) {
  const gold    = th ? th.gold    : "#CF9D7B";
  const textDim = th ? th.textDim : "#5a4e48";
  return (
    <div style={{textAlign:"center",minWidth:52}}>
      <div style={{fontSize:17,fontWeight:700,color:gold,letterSpacing:1}}>{value}</div>
      <div style={{fontSize:9,color:textDim,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    </div>
  );
}
