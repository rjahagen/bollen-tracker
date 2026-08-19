import React from 'react';
import { THEMES } from '../constants';
import Wrap from '../components/Wrap';
import Avatar from '../components/Avatar';

function ThemeSwitcher({ themeName, setThemeName, th }) {
  return (
    <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
      {Object.entries(THEMES).map(([key,t])=>{
        const isActive = themeName===key;
        const isZenActive = isActive && key==="zen";
        return (
          <button key={key} onClick={()=>setThemeName(key)} style={{
            padding:"5px 14px", fontSize:11, letterSpacing:1, textTransform:"uppercase",
            borderRadius:20, cursor:"pointer", fontFamily:th.font,
            background: isZenActive ? "transparent" : isActive ? th.gold : "transparent",
            color: isZenActive ? "#8b1a1a" : isActive ? th.bg : th.textDim,
            border: `1px solid ${isZenActive ? "#8b1a1a" : isActive ? th.gold : th.border}`,
            fontWeight: isActive ? 700 : 400,
            transition:"all 0.2s",
          }}>{t.name}</button>
        );
      })}
    </div>
  );
}

function nextCountdownInfo(friends, events) {
  const today = new Date(); today.setHours(0,0,0,0);
  const all = [];
  friends.forEach(f=>{
    if (!f.birthday) return;
    const d = new Date(f.birthday+'T00:00:00');
    d.setFullYear(today.getFullYear());
    if (d < today) d.setFullYear(today.getFullYear()+1);
    all.push({ name: f.name, days: Math.round((d-today)/86400000) });
  });
  events.forEach(e=>{
    const d = new Date(e.event_date+'T00:00:00');
    if (e.is_yearly) { d.setFullYear(today.getFullYear()); if (d<today) d.setFullYear(today.getFullYear()+1); }
    const days = Math.round((d-today)/86400000);
    if (days>=0 && days<=365) all.push({ name: e.name, days });
  });
  all.sort((a,b)=>a.days-b.days);
  if (!all.length) return "Aankomende events en verjaardagen";
  const n = all[0];
  return n.days===0 ? `${n.name} — vandaag!` : `${n.name} — ${n.days} dag${n.days===1?'':'en'}`;
}

export default function HomeScreen({ th, S, themeName, setThemeName, isIPad, currentPlayer, activeGames, joinLiveGame, setGameMode, setGamePlayers, friends, events, groupFriends, currentGroup, go }) {
  const liveB = activeGames.find(g=>g.game_type==='bollen');
  const liveT = activeGames.find(g=>g.game_type==='toepen');

  const menuItems = [
    { label:"Bollen",     sub: liveB ? "LIVE — Tik om terug te gaan" : "Wouter heeft ook 1 keer gewonnen",
      action:()=>{ if(liveB){joinLiveGame(liveB);}else{setGameMode("bollen");setGamePlayers([]);go("selectPlayers");} },
      accentBorder: themeName==="wsw"?"3px solid #ff2ee6":null, live: !!liveB },
    { label:"Toepen",     sub: liveT ? "LIVE — Tik om terug te gaan" : "4 kaarten p.p. en aan het einde wint Ivar",
      action:()=>{ if(liveT){joinLiveGame(liveT);}else{setGameMode("toepen");setGamePlayers([]);go("selectPlayers");} },
      accentBorder: themeName==="wsw"?"3px solid #00f0ff":null, live: !!liveT },
    { label:"Dobbelstenen", sub:"Gooi 1, 3 of 5 dobbelstenen — hou ze vast voor Yahtzee", action:()=>go("dice") },
    { label:"Spelregels", sub:"Regels voor Bollen en Toepen",     action:()=>go("spelregels"), accentBorder: themeName==="wsw"?"3px solid #7f5bff":null },
    { label:"Vrienden",   sub: currentGroup ? `${groupFriends.length} vrienden · ${currentGroup.name}` : `${friends.length} vrienden`, action:()=>go("friends") },
    { label:"Polls",      sub: currentGroup ? `Polls voor ${currentGroup.name}` : "Stem op vragen van de groep", action:()=>go("polls") },
    { label:"Count Down", sub: nextCountdownInfo(friends, events), action:()=>go("countdown") },
  ];

  const LogoBlock = (
    <div style={{textAlign:"center",padding: isIPad ? "40px 32px 24px" : "32px 24px 20px"}}>
      {themeName==="wsw"&&<style>{`@keyframes wswTitleGlow{0%{background-position:0% center}100%{background-position:300% center}}@media (prefers-reduced-motion: reduce){.wsw-title-glow{animation:none!important}}`}</style>}
      <div style={{width:isIPad?120:100,height:isIPad?120:100,margin:"0 auto 18px",borderRadius:18,border:`1px solid ${th.border}`,overflow:"hidden",boxShadow:themeName==="zen"?"none":themeName==="wsw"?"0 0 28px rgba(255,46,230,0.35), 0 0 50px rgba(0,240,255,0.18)":"0 0 24px rgba(207,157,123,0.12)",background:th.surface}}>
        {themeName==="zen"?(
          <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#faf7f2"/>
            <rect x="3" y="3" width="94" height="94" rx="7" fill="none" stroke="#c8b49a" strokeWidth="0.8"/>
            <rect x="7" y="7" width="86" height="86" rx="4" fill="none" stroke="#c8b49a" strokeWidth="0.4"/>
            <rect x="0" y="24" width="100" height="8" fill="#8b1a1a" opacity="0.85"/>
            <rect x="0" y="68" width="100" height="8" fill="#8b1a1a" opacity="0.85"/>
            <text x="50" y="66" fontSize="44" textAnchor="middle" fill="#111111" fontFamily="serif">♠</text>
            <text x="13" y="22" fontSize="10" fill="#8b1a1a" fontFamily="Georgia,serif" fontWeight="700">A</text>
            <text x="87" y="93" fontSize="10" fill="#8b1a1a" fontFamily="Georgia,serif" fontWeight="700" textAnchor="middle" transform="rotate(180,87,93)">A</text>
          </svg>
        ):themeName==="wsw"?(
          <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="wswLogoBg" cx="50%" cy="42%" r="70%">
                <stop offset="0%" stopColor="#2a0845"/>
                <stop offset="100%" stopColor="#0a0014"/>
              </radialGradient>
              <linearGradient id="wswLogoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff2ee6"/>
                <stop offset="50%" stopColor="#7f5bff"/>
                <stop offset="100%" stopColor="#00f0ff"/>
              </linearGradient>
              <filter id="wswLogoGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="100" height="100" fill="url(#wswLogoBg)"/>
            <text x="50" y="70" fontSize="58" textAnchor="middle" fill="url(#wswLogoStroke)" fontFamily="Arial,sans-serif" filter="url(#wswLogoGlow)">♠</text>
            <circle cx="23" cy="21" r="2.2" fill="#00f0ff" filter="url(#wswLogoGlow)"/>
            <circle cx="80" cy="29" r="1.6" fill="#ff2ee6" filter="url(#wswLogoGlow)"/>
            <circle cx="73" cy="79" r="1.8" fill="#7f5bff" filter="url(#wswLogoGlow)"/>
          </svg>
        ):(
          <img src={themeName==="jazz"?"/Logo-Jazz.JPG":"/Logo-Normal.jpg"} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        )}
      </div>
      <h1 className={themeName==="wsw"?"wsw-title-glow":undefined} style={{fontSize:isIPad?40:34,fontWeight:700,letterSpacing:6,textTransform:"uppercase",margin:"0 0 4px",fontFamily:th.titleFont,...(themeName==="wsw"?{background:"linear-gradient(90deg,#ff2ee6,#7f5bff,#00f0ff,#ff2ee6)",backgroundSize:"300% auto",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",textShadow:"0 0 30px rgba(255,46,230,0.45)",animation:"wswTitleGlow 6s linear infinite"}:{color:th.gold})}}>Cards</h1>
      <p style={{color:th.textMid,fontSize:11,letterSpacing:3,textTransform:"uppercase",margin:0}}>Kaartspellen</p>
      <ThemeSwitcher themeName={themeName} setThemeName={setThemeName} th={th}/>
    </div>
  );

  const MenuBlock = (
    <div style={{padding: isIPad ? "0 24px 32px" : "0 16px 8px"}}>
      {menuItems.map(({label,sub,action,accentBorder,live})=>(
        <div key={label} style={{...S.card,cursor:"pointer",marginBottom:8,border:accentBorder||`1px solid ${th.border}`,position:"relative"}} onClick={action}>
          {live&&<span style={{position:"absolute",top:8,right:36,background:"#c0392b",color:"#fff",fontSize:9,fontWeight:800,letterSpacing:2,padding:"2px 6px",borderRadius:10,textTransform:"uppercase"}}>LIVE</span>}
          <div style={S.row}>
            <div style={{flex:1}}>
              <div style={{color:live?"#e74c3c":th.gold,fontWeight:700,fontSize:16,letterSpacing:2,textTransform:"uppercase",fontFamily:th.titleFont}}>{label}</div>
              <div style={{color:th.textMid,fontSize:12,marginTop:3}}>{sub}</div>
            </div>
            <div style={{color:th.textDim,fontSize:20}}>›</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Wrap th={th} S={S} themeName={themeName}>
      {currentPlayer&&(
        <button onClick={()=>go("selectProfile")} style={{position:"absolute",top:14,right:14,zIndex:10,background:"transparent",border:`2px solid ${th.border}`,borderRadius:"50%",padding:0,cursor:"pointer",lineHeight:0}}>
          <Avatar player={currentPlayer} size={40} th={th}/>
        </button>
      )}
      {isIPad ? (
        <div style={{display:"flex",minHeight:"100dvh"}}>
          <div style={{width:320,flexShrink:0,borderRight:`1px solid ${th.border}`,position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>{LogoBlock}</div>
          <div style={{flex:1,overflowY:"auto",padding:"24px 0"}}>{MenuBlock}</div>
        </div>
      ) : (
        <>{LogoBlock}{MenuBlock}</>
      )}
    </Wrap>
  );
}
