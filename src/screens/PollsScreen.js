import { useState, useEffect } from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';
import Avatar from '../components/Avatar';

export default   function PollsScreen({ th, go, supabase, themeName, S, currentPlayerId, friends, isIPad, currentGroupId, currentGroup }) {
  const [polls, setPolls]           = useState([]);
  const [pollVoters, setPollVoters] = useState({}); // { optionId: [voterId, ...] }
  const [voted, setVoted]           = useState(() => { try{return JSON.parse(localStorage.getItem("cards_voted_polls")||"{}");}catch{return {};} });
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions]   = useState(["",""]);
  const [loading, setLoading]         = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // poll id to delete

  useEffect(()=>{ fetchPolls(); },[]);// eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPolls() {
    setLoading(true);
    let q = supabase.from("polls").select("*, poll_options(*)").eq("is_active",true);
    if (currentGroupId) q = q.eq("group_id", currentGroupId);
    const {data} = await q.order("created_at",{ascending:false});
    if (data) {
      setPolls(data);
      // Load voter ids for all options
      const optIds = data.flatMap(p=>p.poll_options?.map(o=>o.id)||[]);
      if (optIds.length>0) {
        const {data:votes} = await supabase.from("poll_votes").select("option_id, voter_id").in("option_id",optIds);
        if (votes) {
          const map = {};
          votes.forEach(v=>{ if(v.voter_id){map[v.option_id]=[...(map[v.option_id]||[]),v.voter_id]; }});
          setPollVoters(map);
        }
      }
    }
    setLoading(false);
  }

  async function vote(pollId, optionId) {
    if (voted[pollId]) return;
    await supabase.from("poll_votes").insert({poll_id:pollId,option_id:optionId,voter_id:currentPlayerId||null});
    await supabase.from("poll_options").update({votes:(polls.find(p=>p.id===pollId)?.poll_options.find(o=>o.id===optionId)?.votes||0)+1}).eq("id",optionId);
    const nv={...voted,[pollId]:optionId};
    setVoted(nv);
    localStorage.setItem("cards_voted_polls",JSON.stringify(nv));
    fetchPolls();
  }

  async function createPoll() {
    if (!newQuestion.trim()||newOptions.filter(o=>o.trim()).length<2) return;
    const {data:poll} = await supabase.from("polls").insert({question:newQuestion.trim(),created_by:currentPlayerId||null,group_id:currentGroupId||null}).select().single();
    if (!poll) return;
    await supabase.from("poll_options").insert(newOptions.filter(o=>o.trim()).map(o=>({poll_id:poll.id,option_text:o.trim()})));
    setNewQuestion(""); setNewOptions(["",""]); setShowCreate(false); fetchPolls();
  }

  async function deletePoll(pollId) {
    await supabase.from("poll_votes").delete().eq("poll_id",pollId);
    await supabase.from("poll_options").delete().eq("poll_id",pollId);
    await supabase.from("polls").delete().eq("id",pollId);
    setConfirmDelete(null);
    fetchPolls();
  }

  return (
    <div style={{...S.app,minHeight:"100dvh"}}>
      {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
      {S.overlay&&<div style={S.overlay}/>}
      <div style={S.wrap}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:`1px solid ${th.border}`}}>
          <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
          <div style={{flex:1}}>
            <h2 style={{...S.title,margin:0}}>Polls</h2>
            {currentGroup&&<div style={{color:th.textDim,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginTop:1}}>{currentGroup.name}</div>}
          </div>
          <button style={{...S.primary,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>setShowCreate(s=>!s)}>+ Nieuwe poll</button>
        </div>

        {/* Confirm delete modal */}
        {confirmDelete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:4,padding:28,maxWidth:300,width:"100%",textAlign:"center"}}>
              <p style={{color:th.gold,fontSize:16,fontWeight:700,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>Poll verwijderen?</p>
              <p style={{color:th.textMid,fontSize:13,margin:"0 0 20px"}}>Dit kan niet ongedaan worden gemaakt.</p>
              <div style={{display:"flex",gap:10}}>
                <button style={{...S.secondary,flex:1}} onClick={()=>setConfirmDelete(null)}>Annuleren</button>
                <button onClick={()=>deletePoll(confirmDelete)} style={{flex:1,background:"transparent",border:"1px solid #5a2020",borderRadius:4,color:"#a04040",padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1,fontFamily:th.font}}>Verwijderen</button>
              </div>
            </div>
          </div>
        )}

        {showCreate&&(
          <div style={{...S.card,margin:"12px 16px",padding:"16px"}}>
            <div style={{...S.label,marginBottom:8}}>Nieuwe poll</div>
            <input style={{...S.input,width:"100%",marginBottom:10}} placeholder="Vraag..." value={newQuestion} onChange={e=>setNewQuestion(e.target.value)}/>
            {newOptions.map((opt,i)=>(
              <input key={i} style={{...S.input,width:"100%",marginBottom:8}} placeholder={`Optie ${i+1}...`} value={opt} onChange={e=>{const o=[...newOptions];o[i]=e.target.value;setNewOptions(o);}}/>
            ))}
            <button style={{background:"none",border:"none",color:th.gold,fontSize:13,cursor:"pointer",marginBottom:10}} onClick={()=>setNewOptions(o=>[...o,""])}>+ Optie toevoegen</button>
            <button style={{...S.primary}} onClick={createPoll}>Maak poll aan</button>
          </div>
        )}

        {loading&&<div style={{textAlign:"center",padding:32,color:th.textDim}}>Laden...</div>}

        <div style={{padding:"8px 16px 32px"}}>
          {polls.map(poll=>{
            const hasVoted=!!voted[poll.id];
            const totalVotes=poll.poll_options?.reduce((s,o)=>s+o.votes,0)||0;
            return (
              <div key={poll.id} style={{...S.card,marginBottom:12,padding:"16px",position:"relative"}}>
                {/* Delete button */}
                <button onClick={()=>setConfirmDelete(poll.id)} style={{position:"absolute",top:10,right:10,background:"transparent",border:"none",color:th.textDim,fontSize:16,cursor:"pointer",lineHeight:1,padding:"2px 6px",fontFamily:th.font}} title="Verwijderen">✕</button>
                <div style={{fontWeight:700,fontSize:15,color:th.text,marginBottom:12,paddingRight:24}}>{poll.question}</div>
                {poll.poll_options?.map(opt=>{
                  const pct=totalVotes>0?Math.round((opt.votes/totalVotes)*100):0;
                  const isMyVote=voted[poll.id]===opt.id;
                  const voters=(pollVoters[opt.id]||[]).map(id=>friends.find(f=>f.id===id)).filter(Boolean);
                  return (
                    <div key={opt.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:13,color:isMyVote?th.gold:th.text,fontWeight:isMyVote?700:400}}>{opt.option_text}{isMyVote?" ✓":""}</span>
                        {hasVoted&&<span style={{fontSize:12,color:th.textDim}}>{pct}% ({opt.votes})</span>}
                      </div>
                      {hasVoted?(
                        <>
                          <div style={{height:6,background:th.surface2,borderRadius:3,overflow:"hidden",marginBottom:voters.length?5:0}}>
                            <div style={{height:"100%",width:`${pct}%`,background:isMyVote?th.gold:th.textDim,borderRadius:3,transition:"width .4s"}}/>
                          </div>
                          {voters.length>0&&(
                            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                              {voters.map(f=>(
                                <div key={f.id} style={{display:"flex",alignItems:"center",gap:4,background:th.surface2,borderRadius:12,padding:"2px 8px 2px 2px"}}>
                                  <Avatar player={f} size={18} th={th}/>
                                  <span style={{fontSize:11,color:th.textMid}}>{f.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ):(
                        <button onClick={()=>vote(poll.id,opt.id)} style={{width:"100%",padding:"10px 14px",background:th.surface,border:`1px solid ${th.border}`,borderRadius:6,color:th.text,fontSize:13,cursor:"pointer",textAlign:"left",fontFamily:th.font}}>
                          {opt.option_text}
                        </button>
                      )}
                    </div>
                  );
                })}
                <div style={{fontSize:11,color:th.textDim,marginTop:8}}>{totalVotes} stemmen</div>
              </div>
            );
          })}
          {!loading&&polls.length===0&&<div style={{textAlign:"center",padding:32,color:th.textDim}}>Nog geen polls. Maak er een aan!</div>}
        </div>
      </div>
    </div>
  );
}
