import React from 'react';

export const ZEN_STYLE = `@font-face{font-family:'CooperHewitt';src:url('/CooperHewitt-Thin.otf') format('opentype');font-weight:300;}body{background-color:#f7f3ea!important}`;

export default function ZenPaper() {
  return (
    <svg style={{position:"fixed",inset:0,width:"100vw",height:"100vh",zIndex:0,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="zen-paper-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.62 0.62" numOctaves="4" seed="7" stitchTiles="stitch" result="noise"/>
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.97  0 0 0 0 0.93  0 0 0 0 0.85  0 0 0 0.45 0" result="tinted"/>
          <feBlend in="SourceGraphic" in2="tinted" mode="multiply" result="body"/>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="2" seed="14" stitchTiles="stitch" result="fine"/>
          <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.92  0 0 0 0 0.86  0 0 0 0.18 0" result="fineTinted"/>
          <feBlend in="body" in2="fineTinted" mode="overlay"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#f7f3ea"/>
      <rect width="100%" height="100%" fill="#f5f1e6" filter="url(#zen-paper-filter)"/>
    </svg>
  );
}
