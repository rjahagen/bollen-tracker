import React from 'react';
import { ROUNDS } from '../constants';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';
import Avatar from '../components/Avatar';
import QuitModal from '../components/QuitModal';

export default function GameScreen({ th, S, themeName, game, setGame, showQuit, setShowQuit, roundNote, setRoundNote, friends, liveGameId, isController, syncLiveGame, refreshGameState, takeOverControls, endLiveGame, setBollenStats, setScreen, go, saveGameToSupabase }) {
  function richPlayer(p) { const f=friends.find(f=>f.id===p?.id); return f?{...f,...p}:p; }
  function playerTotal(idx) { if (!game) return 0; return game.scores[idx].reduce((a,v)=>a+(v??0),0); }
  function getBidOrder(g) { return Array.from({length:g.players.length},(_,i)=>(g.startingPlayer+i)%g.players.length); }
  function isForbidden(g,pos,val) {
    const max=ROUNDS[g.roundIdx].cards;
    if (max===1&&(g.roundIdx===0||g.roundIdx===16)) return false;
    if (pos!==g.players.length-1) return false;
    return g.bids.slice(0,pos).reduce((a,b)=>a+(b??0),0)+val===max;
  }
  function setBid(delta) {
    setGame(g=>{
      const max=ROUNDS[g.roundIdx].cards;
      let next=(g.bids[g.bidPos]??0)+delta;
      if (next<0) next=0; if (next>max) next=max;
      if (isForbidden(g,g.bidPos,next)) { next+=delta; if (next<0||next>max||isForbidden(g,g.bidPos,next)) return g; }
      const bids=[...g.bids]; bids[g.bidPos]=next; return {...g,bids};
    });
  }
  function nextBidder() {
    const g=game;
    const bids=[...g.bids];
    if (bids[g.bidPos]===undefined) bids[g.bidPos]=isForbidden(g,g.bidPos,0)?1:0;
    const nextPos=g.bidPos+1;
    const ns=nextPos>=g.players.length?{...g,bids,step:2,checkPos:0}:{...g,bids,bidPos:nextPos};
    setGame(ns); syncLiveGame(ns);
  }
  function prevBidder() {
    const g=game;
    if (g.step===2){const ns={...g,step:1,bidPos:g.players.length-1};setGame(ns);syncLiveGame(ns);return;}
    if (g.bidPos>0){const ns={...g,bidPos:g.bidPos-1};setGame(ns);syncLiveGame(ns);return;}
    if (g.roundIdx===0) return;
    const prev=g.roundIdx-1;
    const scores=g.scores.map(r=>{const row=[...r];row[prev]=null;return row;});
    const prevStart=((g.startingPlayer-1)+g.players.length)%g.players.length;
    const ns={...g,scores,roundIdx:prev,step:1,bidPos:0,checkPos:0,bids:[],startingPlayer:prevStart};
    setGame(ns);syncLiveGame(ns);
  }
  function resolvePlayer(correct) {
    const g=game;
    const order=getBidOrder(g);
    const pi=order[g.checkPos];
    const scores=g.scores.map(r=>[...r]);
    scores[pi][g.roundIdx]=correct?(g.bids[g.checkPos]??0):-5;
    const nextCheck=g.checkPos+1;
    if (nextCheck>=g.players.length) {
      const allWrong=g.players.every((_,i)=>scores[i][g.roundIdx]===-5);
      if (allWrong) {
        const cleared=scores.map(r=>{const row=[...r];row[g.roundIdx]=null;return row;});
        const ns={...g,scores:cleared,step:1,bidPos:0,checkPos:0,bids:[]};
        setGame(ns);syncLiveGame(ns);
        setRoundNote({type:"warn",text:"Iedereen fout — ronde wordt overgespeeld!"});
        setTimeout(()=>setRoundNote(null),3000);
        return;
      }
      const isSpecialRound=g.roundIdx===0||g.roundIdx===16;
      if (!isSpecialRound) {
        const allCorrect=g.players.every((_,i)=>scores[i][g.roundIdx]!=null&&scores[i][g.roundIdx]>=0);
        if (allCorrect) {
          const cleared=scores.map(r=>{const row=[...r];row[g.roundIdx]=null;return row;});
          const ns={...g,scores:cleared,step:2,checkPos:0};
          setGame(ns);syncLiveGame(ns);
          setRoundNote({type:"error",text:"Onmogelijk! Er moet minstens 1 speler fout zijn. Controleer opnieuw."});
          setTimeout(()=>setRoundNote(null),4000);
          return;
        }
      }
      const nextRound=g.roundIdx+1;
      if (nextRound>=17) {
        const totals=g.players.map((p,i)=>({...p,total:scores[i].reduce((a,v)=>a+(v??0),0),scores:scores[i]}));
        totals.sort((a,b)=>b.total-a.total);
        setBollenStats(prev=>{ const next={...prev}; totals.forEach((r,rank)=>{ const st=next[r.id]||{games:0,wins:0}; next[r.id]={games:st.games+1,wins:st.wins+(rank===0?1:0)}; }); return next; });
        const winnerIdx=g.players.findIndex(p=>p.id===totals[0].id);
        if (!g.saved) saveGameToSupabase(g.players,scores,winnerIdx,'bollen');
        setScreen("gameOver");
        const ns={...g,scores,roundIdx:nextRound,finalTotals:totals,saved:true};
        setGame(ns); syncLiveGame(ns); return;
      }
      const nsp=(g.startingPlayer+1)%g.players.length;
      const ns={...g,scores,roundIdx:nextRound,step:1,bidPos:0,checkPos:0,bids:[],startingPlayer:nsp};
      setGame(ns); syncLiveGame(ns); return;
    }
    const ns={...g,scores,checkPos:nextCheck};
    setGame(ns); syncLiveGame(ns);
  }
  function prevCheckPlayer() {
    const g=game;
    if (g.checkPos<=0){
      const scores=g.scores.map(r=>{const row=[...r];row[g.roundIdx]=null;return row;});
      const ns={...g,scores,step:1,bidPos:0,checkPos:0,bids:[]};
      setGame(ns);syncLiveGame(ns);return;
    }
    const order=getBidOrder(g);
    const scores=g.scores.map(r=>[...r]);
    scores[order[g.checkPos-1]][g.roundIdx]=null;
    const ns={...g,scores,checkPos:g.checkPos-1};
    setGame(ns); syncLiveGame(ns);
  }

  const round=ROUNDS[game.roundIdx];
  const n=game.players.length;
  const order=getBidOrder(game);
  const curPi=game.step===1?order[game.bidPos]:order[game.checkPos];
  const curPlayer=game.players[curPi];
  const bidSoFar=game.bids.slice(0,game.bidPos).reduce((a,b)=>a+(b??0),0);
  const isLastBid=game.step===1&&game.bidPos===n-1;
  const isExempt=round.cards===1&&(game.roundIdx===0||game.roundIdx===16);
  const forbidden=isLastBid&&!isExempt?round.cards-bidSoFar:null;

  return (
    <div style={{...S.app,display:"flex",flexDirection:"column",height:"100dvh"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={{...S.wrap,display:"flex",flexDirection:"column",height:"100dvh"}}>
        <div style={{...S.header,flexShrink:0}}>
          <button style={S.backBtn} onClick={()=>setShowQuit(true)}>✕</button>
          <h2 style={{...S.title,fontSize:16}}>Bollen</h2>
          <span style={{marginLeft:"auto",fontSize:12,color:th.textDim,letterSpacing:1}}>R{game.roundIdx+1}/17 · {round.cards}🃏</span>
        </div>
        {showQuit&&<QuitModal th={th} S={S} onCancel={()=>setShowQuit(false)} onConfirm={async ()=>{ setShowQuit(false); await endLiveGame(); setGame(null); go("home"); }}/>}
        <div style={{flex:1,overflowY:"auto",overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:th.surface,position:"sticky",top:0,zIndex:2}}>
                <th style={{padding:"5px 8px",color:th.textDim,textAlign:"left",position:"sticky",left:0,background:th.surface,fontSize:11,fontWeight:700,letterSpacing:1,minWidth:30,borderBottom:`1px solid ${th.border}`}}>R</th>
                <th style={{padding:"5px 4px",color:th.textDim,minWidth:22,textAlign:"center",borderBottom:`1px solid ${th.border}`}}>🃏</th>
                {game.players.map((p,i)=>(
                  <th key={i} style={{padding:"4px 2px",minWidth:50,textAlign:"center",borderBottom:`1px solid ${th.border}`}}>
                    <Avatar player={richPlayer(p)} size={26} th={th} style={{margin:"0 auto 2px"}}/>
                    <div style={{color:th.gold,fontSize:10,letterSpacing:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:52}}>{(p.name||"?").split(" ")[0]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROUNDS.map((r,ri)=>{
                const isCur=ri===game.roundIdx;
                return (
                  <tr key={ri} style={{background:isCur?th.surface2:ri%2===0?th.bg:th.surface,borderLeft:isCur?`2px solid ${th.gold}`:"2px solid transparent"}}>
                    <td style={{padding:"4px 8px",color:isCur?th.gold:th.textDim,fontWeight:isCur?700:400,position:"sticky",left:0,background:isCur?th.surface2:ri%2===0?th.bg:th.surface,fontSize:13,letterSpacing:1}}>{r.label}</td>
                    <td style={{textAlign:"center",color:th.textDim,fontSize:13}}>{r.cards}</td>
                    {game.players.map((_,pi)=>{
                      const sc=game.scores[pi][ri];
                      const bidIdx=order.indexOf(pi);
                      const hasBid=isCur&&sc===null&&game.bids[bidIdx]!==undefined&&(game.step===2||bidIdx<game.bidPos);
                      const dBid=hasBid?`(${game.bids[bidIdx]})`:null;
                      return (
                        <td key={pi} style={{textAlign:"center",padding:"4px 2px",fontWeight:sc!==null?700:400,color:sc===null?(dBid?th.gold:"rgba(255,255,255,0.15)"):sc<0?"#8a3030":th.gold,fontSize:15}}>
                          {sc!==null?(sc<0?(themeName==="wsw"?"✨":"●"):sc):(dBid||"·")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr style={{borderTop:`1px solid ${th.border}`,background:th.surface}}>
                <td colSpan={2} style={{padding:"5px 8px",color:th.gold,fontWeight:700,fontSize:11,letterSpacing:2,position:"sticky",left:0,background:th.surface}}>TOT</td>
                {game.players.map((_,pi)=>(
                  <td key={pi} style={{textAlign:"center",fontWeight:800,color:th.gold,fontSize:14}}>{playerTotal(pi)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{background:th.surface,borderTop:`1px solid ${th.border}`,padding:"12px 16px 20px",flexShrink:0}}>
          {roundNote&&(
            <div style={{textAlign:"center",marginBottom:12,padding:"8px 12px",borderRadius:4,background:roundNote.type==="error"?"rgba(140,30,30,0.18)":"rgba(180,120,0,0.15)",border:`1px solid ${roundNote.type==="error"?"#7a3030":"#8a6020"}`,color:roundNote.type==="error"?"#cc6060":"#c8a060",fontSize:13,fontWeight:700,letterSpacing:1}}>
              {roundNote.text}
            </div>
          )}
          {game.step===1?(
            <>
              <div style={{...S.row,marginBottom:10}}>
                <Avatar player={richPlayer(curPlayer)} size={42} th={th} style={{border:`1px solid ${th.gold}`}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:th.textDim,letterSpacing:2,textTransform:"uppercase"}}>Bieden — {game.bidPos+1}/{n}</div>
                  <div style={{fontSize:17,fontWeight:700,color:th.gold,letterSpacing:1}}>{curPlayer.name}</div>
                  {forbidden!==null&&forbidden>=0&&<div style={{fontSize:11,color:"#8a3030",letterSpacing:1}}>⚠ {forbidden} is verboden</div>}
                </div>
              </div>
              {(!liveGameId||isController)&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:10}}>
                  <button onClick={()=>setBid(-1)} style={{width:48,height:48,borderRadius:4,background:"transparent",border:`1px solid ${th.border}`,color:th.gold,fontSize:22,cursor:"pointer"}}>−</button>
                  <div style={{width:72,height:72,borderRadius:4,background:th.surface2,border:`1px solid ${th.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,fontWeight:800,color:th.text}}>{game.bids[game.bidPos]??0}</div>
                  <button onClick={()=>setBid(1)} style={{width:48,height:48,borderRadius:4,background:"transparent",border:`1px solid ${th.border}`,color:th.gold,fontSize:22,cursor:"pointer"}}>+</button>
                </div>
              )}
              {liveGameId&&!isController&&(
                <>
                  <div style={{textAlign:"center",padding:"8px 0 12px",color:th.textMid,fontSize:13,letterSpacing:1}}>Bod: {game.bids[game.bidPos]??0}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={refreshGameState} style={{...S.secondary,width:"auto",flex:1}}>↻ Vernieuwen</button>
                    <button onClick={takeOverControls} style={{...S.primary,flex:1}}>Overnemen</button>
                  </div>
                </>
              )}
              {(!liveGameId||isController)&&(
                <div style={{display:"flex",gap:8}}>
                  <button onClick={prevBidder} style={{...S.secondary,width:"auto",flex:1}} disabled={game.step===1&&game.bidPos===0&&game.roundIdx===0}>‹ Terug</button>
                  <button onClick={nextBidder} style={{...S.primary,flex:2}}>Volgende ›</button>
                </div>
              )}
            </>
          ):(
            <>
              <div style={{...S.row,marginBottom:10}}>
                <Avatar player={richPlayer(curPlayer)} size={42} th={th} style={{border:`1px solid ${th.gold}`}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:th.textDim,letterSpacing:2,textTransform:"uppercase"}}>Controleren — {game.checkPos+1}/{n}</div>
                  <div style={{fontSize:17,fontWeight:700,color:th.gold,letterSpacing:1}}>{curPlayer.name}</div>
                  <div style={{fontSize:13,color:th.textMid}}>Geboden: <strong style={{color:th.text}}>{game.bids[game.checkPos]??0}</strong>{(()=>{const tot=game.bids.reduce((a,b)=>a+(b??0),0);const cards=ROUNDS[game.roundIdx].cards;const diff=cards-tot;if(diff===0)return <span style={{color:"#7a9a60",marginLeft:8,fontSize:11,letterSpacing:1,textTransform:"uppercase"}}>Precies</span>;return <span style={{color:th.textDim,marginLeft:8,fontSize:11,letterSpacing:1}}>{Math.abs(diff)} {diff>0?"onderboden":"overboden"}</span>;})()}</div>
                </div>
              </div>
              {(!liveGameId||isController)&&(
                <div style={{display:"flex",gap:8}}>
                  <button onClick={prevCheckPlayer} style={{...S.secondary,width:"auto",flex:1}}>‹ Terug</button>
                  <button onClick={()=>resolvePlayer(false)} style={{flex:1.5,background:"transparent",border:"1px solid #5a2020",borderRadius:4,color:"#a04040",padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:th.font}}>FOUT</button>
                  <button onClick={()=>resolvePlayer(true)} style={{flex:1.5,background:"transparent",border:`1px solid ${th.gold}`,borderRadius:4,color:th.gold,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:th.font}}>GOED</button>
                </div>
              )}
              {liveGameId&&!isController&&(
                <div style={{display:"flex",gap:8}}>
                  <button onClick={refreshGameState} style={{...S.secondary,width:"auto",flex:1}}>↻ Vernieuwen</button>
                  <button onClick={takeOverControls} style={{...S.primary,flex:1}}>Overnemen</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
