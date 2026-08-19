import React from 'react';
import ZenPaper, { ZEN_STYLE } from './ZenPaper';

export default function Wrap({ children, th, S, themeName }) {
  return (
    <div style={S.app}>
      {themeName === "zen" && <><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay && <div style={S.overlay}/>}
      <div style={S.wrap}>{children}</div>
    </div>
  );
}
