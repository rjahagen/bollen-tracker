import { useState, useEffect, useRef } from "react";
import { supabase } from './supabase';
import { THEMES, ROUNDS, PRESET_FRIENDS } from './constants';
import { loadS, saveS, slimPlayer } from './utils';
import Wrap from './components/Wrap';

import SelectProfileScreen from './screens/SelectProfileScreen';
import HomeScreen          from './screens/HomeScreen';
import SelectPlayersScreen from './screens/SelectPlayersScreen';
import FriendsScreen       from './screens/FriendsScreen';
import AddFriendScreen     from './screens/AddFriendScreen';
import FriendPageScreen    from './screens/FriendPageScreen';
import GameScreen          from './screens/GameScreen';
import GameOverScreen      from './screens/GameOverScreen';
import ToepenScreen        from './screens/ToepenScreen';
import ToepenOverScreen    from './screens/ToepenOverScreen';
import SpelregelsScreen    from './screens/SpelregelsScreen';
import PollsScreen         from './screens/PollsScreen';
import CountdownScreen     from './screens/CountdownScreen';
import DiceScreen          from './screens/DiceScreen';

export default function App() {
  const [themeName, setThemeName]     = useState(() => loadS("cards_theme", "normal"));
  const [screen, setScreen]           = useState("home");
  const [friends, setFriends]         = useState([]);
  const [bollenStats, setBollenStats] = useState({});
  const [toepStats, setToepStats]     = useState({});
  const [selFriend, setSelFriend]     = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [gameMode, setGameMode]       = useState("bollen");
  const [game, setGame]               = useState(null);
  const [editName, setEditName]       = useState("");
  const [showQuit, setShowQuit]       = useState(false);
  const [showAddLatePlayer, setShowAddLatePlayer] = useState(false);
  const [roundNote, setRoundNote]     = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [groups, setGroups]           = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(()=>loadS("cards_current_group","group_jgls"));
  const [groupMembers, setGroupMembers] = useState({});
  const [events, setEvents]           = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(()=>loadS("cards_current_player",null));
  const [liveGameId, setLiveGameId]           = useState(null);
  const [isController, setIsController]       = useState(false);
  const [liveCtrlId, setLiveCtrlId]           = useState(null);
  const [activeGames, setActiveGames]         = useState([]);
  const [winWidth, setWinWidth]               = useState(window.innerWidth);
  const liveGameIdRef      = useRef(null);
  const isControllerRef    = useRef(false);
  const latestGameRef      = useRef(null);
  const liveCtrlIdRef      = useRef(null);
  const currentPlayerIdRef = useRef(null);

  useEffect(()=>{ saveS("cards_theme", themeName); }, [themeName]);
  useEffect(()=>{ saveS("cards_current_group", currentGroupId); }, [currentGroupId]);
  useEffect(()=>{
    if (!currentPlayerId || groups.length===0) return;
    const mine = groups.filter(g=>groupMembers[g.id]?.has(currentPlayerId));
    if (mine.length>0 && !mine.find(g=>g.id===currentGroupId)) setCurrentGroupId(mine[0].id);
  },[currentPlayerId, groups, groupMembers, currentGroupId]);
  useEffect(()=>{
    async function loadFriends() {
      const presets = PRESET_FRIENDS.map(({id, name, photo}) => ({id, name, photo, is_preset: true}));
      await supabase.from('friends').upsert(presets, {onConflict:'id'});
      const { data } = await supabase.from('friends').select('*');
      if (data) setFriends(data);
    }
    loadFriends();
  }, []);
  useEffect(()=>{
    async function loadEvents() {
      const { data } = await supabase.from('events').select('*');
      if (data) setEvents(data);
    }
    loadEvents();
  }, []);
  useEffect(()=>{
    async function loadGroups(){
      const [{data:g},{data:m}]=await Promise.all([
        supabase.from('groups').select('*'),
        supabase.from('group_members').select('*'),
      ]);
      if(g) setGroups(g);
      if(m){
        const map={};
        m.forEach(r=>{ if(!map[r.group_id]) map[r.group_id]=new Set(); map[r.group_id].add(r.player_id); });
        setGroupMembers(map);
      }
    }
    loadGroups();
  }, []);
  useEffect(()=>{
    async function fetchStats() {
      const { data } = await supabase.from('game_players').select('player_id, player_name, final_score, games(game_type)');
      if (!data) return;
      const bollen = {}, toep = {};
      data.forEach(row => {
        const id = row.player_id;
        const type = row.games?.game_type;
        if (type === 'bollen') {
          if (!bollen[id]) bollen[id] = {games:0, wins:0};
          bollen[id].games++;
        } else if (type === 'toepen') {
          if (!toep[id]) toep[id] = {games:0, wins:0};
          toep[id].games++;
        }
      });
      const { data: winners } = await supabase.from('games').select('winner_id, game_type');
      if (winners) winners.forEach(g => {
        if (g.game_type === 'bollen' && bollen[g.winner_id]) bollen[g.winner_id].wins++;
        if (g.game_type === 'toepen' && toep[g.winner_id]) toep[g.winner_id].wins++;
      });
      setBollenStats(bollen);
      setToepStats(toep);
    }
    fetchStats();
  }, []);
  useEffect(()=>{
    if (screen!=="friendPage"||!selFriend){ setFriendStats(null); return; }
    async function fetchFriendStats() {
      const id=selFriend.id;
      const [{data:gp},{data:rounds}]=await Promise.all([
        supabase.from('game_players').select('final_score,games(game_type)').eq('player_id',id),
        supabase.from('game_rounds').select('score').eq('player_id',id),
      ]);
      const bollenScores=(gp||[]).filter(r=>r.games?.game_type==='bollen').map(r=>r.final_score);
      const avg=bollenScores.length?Math.round(bollenScores.reduce((a,b)=>a+b,0)/bollenScores.length):null;
      const best=bollenScores.length?Math.max(...bollenScores):null;
      const worst=bollenScores.length?Math.min(...bollenScores):null;
      const allR=rounds||[];
      const correct=allR.filter(r=>r.score!==-5).length;
      const bollen=allR.filter(r=>r.score===-5).length;
      const acc=allR.length?Math.round(correct/allR.length*100):null;
      setFriendStats({avg,best,worst,acc,bollen,rounds:allR.length});
    }
    fetchFriendStats();
  },[screen,selFriend]);
  useEffect(()=>{
    const h=()=>setWinWidth(window.innerWidth);
    window.addEventListener('resize',h);
    return ()=>window.removeEventListener('resize',h);
  },[]);
  useEffect(()=>{ liveGameIdRef.current=liveGameId; },[liveGameId]);
  useEffect(()=>{ isControllerRef.current=isController; },[isController]);
  useEffect(()=>{ latestGameRef.current=game; },[game]);
  useEffect(()=>{ liveCtrlIdRef.current=liveCtrlId; },[liveCtrlId]);
  useEffect(()=>{ currentPlayerIdRef.current=currentPlayerId; },[currentPlayerId]);
  useEffect(()=>{
    if (!currentPlayerId) return;
    async function loadActive() {
      const {data}=await supabase.from('live_games').select('*').eq('is_active',true);
      if (data) setActiveGames(data.filter(g=>Array.isArray(g.player_ids)&&g.player_ids.includes(currentPlayerId)));
    }
    loadActive();
  },[currentPlayerId, screen]);
  useEffect(()=>{
    if (!liveGameId) return;
    const ch=supabase.channel(`live:${liveGameId}`)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'live_games',filter:`id=eq.${liveGameId}`},payload=>{
        const upd=payload.new;
        if (!upd.is_active) {
          setLiveGameId(null); liveGameIdRef.current=null;
          setIsController(false); isControllerRef.current=false;
          return;
        }
        if (upd.controller_id !== liveCtrlIdRef.current) {
          liveCtrlIdRef.current = upd.controller_id;
          setLiveCtrlId(upd.controller_id);
          if (upd.controller_id === currentPlayerIdRef.current) {
            setIsController(true); isControllerRef.current=true;
          } else if (isControllerRef.current) {
            setIsController(false); isControllerRef.current=false;
          }
        }
        if (!isControllerRef.current) {
          setGame(upd.state);
          const gs=upd.state;
          if (gs?.mode==='bollen') setScreen(gs.roundIdx>=17?'gameOver':'game');
          else if (gs?.mode==='toepen') setScreen(gs.winner?'toepOver':'toepen');
        }
      })
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[liveGameId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if (!liveGameId||isController) return;
    const timer=setInterval(async ()=>{
      const {data}=await supabase.from('live_games').select('state,is_active,controller_id').eq('id',liveGameId).single();
      if (!data) return;
      if (!data.is_active) { clearInterval(timer); return; }
      setGame(data.state);
      const gs=data.state;
      if (gs?.mode==='bollen') setScreen(gs.roundIdx>=17?'gameOver':'game');
      else if (gs?.mode==='toepen') setScreen(gs.winner?'toepOver':'toepen');
    },3000);
    return ()=>clearInterval(timer);
  },[liveGameId,isController]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme & styles ─────────────────────────────────────────────────────────
  const th = THEMES[themeName] || THEMES.normal;
  const appBg = th.bgImage
    ? { backgroundImage:`url(${th.bgImage})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundAttachment:"fixed" }
    : { backgroundImage: th.suitBg };
  const isIPad = winWidth >= 768;
  const currentPlayer = friends.find(f=>f.id===currentPlayerId)||null;
  const S = {
    app:       { minHeight:"100dvh", background:th.bg, ...appBg, color:th.text, fontFamily:th.font, fontWeight: themeName==="zen" ? 500 : undefined, maxWidth: isIPad ? 960 : 430, margin:"0 auto", position:"relative" },
    overlay:   th.overlay ? { position:"fixed", inset:0, background:th.overlay, zIndex:0, pointerEvents:"none" } : null,
    wrap:      { position:"relative", zIndex:1 },
    header:    { padding:"16px 20px 12px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${th.border}` },
    title:     { fontSize:20, fontWeight:700, letterSpacing:3, margin:0, color:th.gold, textTransform:"uppercase", fontFamily:th.titleFont },
    backBtn:   { background:"transparent", border:`1px solid ${th.border}`, borderRadius:6, color:th.gold, padding:"7px 14px", cursor:"pointer", fontSize:16, letterSpacing:1, fontFamily:th.font },
    card:      { background:th.surface, borderRadius:4, padding:"14px 16px", margin:"8px 16px", border:`1px solid ${th.border}` },
    primary:   { background:"transparent", border:`1px solid ${th.gold}`, borderRadius:4, color:th.gold, padding:"13px 20px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%", letterSpacing:2, textTransform:"uppercase", fontFamily:th.font },
    secondary: { background:"transparent", border:`1px solid ${th.border}`, borderRadius:4, color:th.textMid, padding:"11px 16px", fontSize:13, cursor:"pointer", width:"100%", letterSpacing:1, fontFamily:th.font },
    input:     { background:th.surface2, border:`1px solid ${th.border}`, borderRadius:4, color:th.text, padding:"11px 14px", fontSize:15, width:"100%", boxSizing:"border-box", outline:"none", fontFamily:th.font },
    label:     { color:th.textDim, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", display:"block", marginBottom:6 },
    row:       { display:"flex", alignItems:"center", gap:12 },
  };

  const go = s => setScreen(s);
  const allFriends = [...friends].sort((a,b) => a.name.localeCompare(b.name, "nl"));
  const currentGroup = groups.find(g=>g.id===currentGroupId)||null;
  const groupMemberSet = currentGroupId ? (groupMembers[currentGroupId]||new Set()) : null;
  const groupFriends = groupMemberSet
    ? [...friends].filter(f=>groupMemberSet.has(f.id)).sort((a,b)=>a.name.localeCompare(b.name,"nl"))
    : allFriends;
  const myGroups = currentPlayerId
    ? groups.filter(g=>groupMembers[g.id]?.has(currentPlayerId))
    : groups;
  const maxPlayers = gameMode === "toepen" ? 8 : 6;

  // ── Live game helpers ──────────────────────────────────────────────────────
  async function createLiveGame(initState, mode, playerIds) {
    if (!currentPlayerId) return null;
    const {data}=await supabase.from('live_games').insert({
      game_type:mode, state:initState,
      controller_id:currentPlayerId,
      player_ids:playerIds.filter(Boolean),
      is_active:true
    }).select().single();
    if (data){
      setLiveGameId(data.id); liveGameIdRef.current=data.id;
      liveCtrlIdRef.current=currentPlayerId;
      setLiveCtrlId(currentPlayerId);
      setIsController(true); isControllerRef.current=true;
      const current=latestGameRef.current;
      if (current) {
        supabase.from('live_games').update({state:current,updated_at:new Date().toISOString()}).eq('id',data.id);
      }
    }
    return data;
  }
  async function joinLiveGame(ag) {
    const {data}=await supabase.from('live_games').select('*').eq('id',ag.id).single();
    if (!data) return;
    setLiveGameId(data.id); liveGameIdRef.current=data.id;
    liveCtrlIdRef.current=data.controller_id;
    setLiveCtrlId(data.controller_id);
    const ctrl=data.controller_id===currentPlayerId;
    setIsController(ctrl); isControllerRef.current=ctrl;
    setGame(data.state);
    setGameMode(data.game_type);
    const gs=data.state;
    if (gs?.mode==='bollen') go(gs.roundIdx>=17?'gameOver':'game');
    else if (gs?.mode==='toepen') go(gs.winner?'toepOver':'toepen');
  }
  function syncLiveGame(state) {
    if (!liveGameIdRef.current || !state) return;
    supabase.from('live_games')
      .update({state, updated_at: new Date().toISOString()})
      .eq('id', liveGameIdRef.current)
      .then(({error}) => { if (error) console.error('[syncLiveGame] failed:', error); });
  }
  async function refreshGameState() {
    if (!liveGameId) return;
    const {data, error} = await supabase.from('live_games')
      .select('state,controller_id,is_active')
      .eq('id', liveGameId).single();
    if (error) { console.error('[refreshGameState] failed:', error.message); return; }
    if (!data || !data.is_active) return;
    liveCtrlIdRef.current = data.controller_id;
    setLiveCtrlId(data.controller_id);
    setGame(data.state);
    latestGameRef.current = data.state;
    const gs = data.state;
    if (gs?.mode==='bollen') setScreen(gs.roundIdx>=17?'gameOver':'game');
    else if (gs?.mode==='toepen') setScreen(gs.winner?'toepOver':'toepen');
  }
  async function takeOverControls() {
    if (!liveGameId) return;
    const {data} = await supabase.from('live_games').select('state').eq('id',liveGameId).single();
    const latest = data?.state || latestGameRef.current;
    if (latest) { setGame(latest); latestGameRef.current=latest; }
    await supabase.from('live_games').update({
      controller_id: currentPlayerId,
      ...(latest ? {state: latest} : {}),
      updated_at: new Date().toISOString()
    }).eq('id', liveGameId);
    setIsController(true); isControllerRef.current=true;
    liveCtrlIdRef.current=currentPlayerId;
    setLiveCtrlId(currentPlayerId);
  }
  async function endLiveGame() {
    const id=liveGameIdRef.current;
    if (!id) return;
    await supabase.from('live_games').update({is_active:false,updated_at:new Date().toISOString()}).eq('id',id);
    setLiveGameId(null); liveGameIdRef.current=null;
    setIsController(false); isControllerRef.current=false;
    setActiveGames(prev=>prev.filter(g=>g.id!==id));
  }

  // ── Friends CRUD ──────────────────────────────────────────────────────────
  async function addFriend() {
    if (!editName.trim()) return;
    const id = crypto.randomUUID();
    const { data } = await supabase.from('friends').insert({ id, name: editName.trim() }).select().single();
    if (data) {
      setFriends(p => [...p, data]);
      if (currentGroupId) {
        await supabase.from('group_members').insert({group_id:currentGroupId, player_id:id});
        setGroupMembers(m=>{ const s=new Set(m[currentGroupId]||[]); s.add(id); return {...m,[currentGroupId]:s}; });
      }
    }
    setEditName(""); go("friends");
  }
  async function deleteFriend(id) {
    await supabase.from('friends').delete().eq('id', id);
    setFriends(p => p.filter(f => f.id !== id));
    go("friends");
  }
  async function updatePhoto(id, dataUrl) {
    await supabase.from('friends').update({ photo: dataUrl }).eq('id', id);
    setFriends(p=>p.map(f=>f.id===id?{...f,photo:dataUrl}:f));
    setSelFriend(f=>f?{...f,photo:dataUrl}:f);
  }
  async function updateBirthday(id, birthday) {
    await supabase.from('friends').update({ birthday }).eq('id', id);
    setFriends(p=>p.map(f=>f.id===id?{...f,birthday}:f));
    setSelFriend(f=>f?{...f,birthday}:f);
  }

  // ── Player selection ──────────────────────────────────────────────────────
  function togglePlayer(f) {
    setGamePlayers(p=>{
      if (p.find(x=>x.id===f.id)) return p.filter(x=>x.id!==f.id);
      if (p.length>=maxPlayers) return p;
      return [...p,f];
    });
  }
  function removePlayer(id) { setGamePlayers(p=>p.filter(x=>x.id!==id)); }

  // ── Game starters ─────────────────────────────────────────────────────────
  async function startBollen() {
    if (gamePlayers.length<2) return;
    const slim=gamePlayers.map(slimPlayer);
    const init={mode:"bollen",players:slim,scores:slim.map(()=>Array(17).fill(null)),
      roundIdx:0,step:1,bidPos:0,checkPos:0,bids:[],startingPlayer:0};
    setGame(init);
    go("game");
    await createLiveGame(init,'bollen',gamePlayers.map(p=>p.id));
  }
  async function startToepen() {
    if (gamePlayers.length<2) return;
    const slim=gamePlayers.map(slimPlayer);
    const init={mode:"toepen",players:slim,scores:slim.map(()=>0),eliminated:[]};
    setGame(init);
    go("toepen");
    await createLiveGame(init,'toepen',gamePlayers.map(p=>p.id));
  }

  async function saveGameToSupabase(players, scores, winnerIdx, gameType='bollen') {
    try {
      const winner = players[winnerIdx];
      const { data: gameRow, error } = await supabase
        .from('games')
        .insert({ game_type: gameType, winner_id: winner.id, winner_name: winner.name })
        .select()
        .single();
      if (error || !gameRow) return;
      const playerRows = players.map((p, i) => {
        const total = scores[i].reduce((sum, s) => sum + (s ?? 0), 0);
        const rank = players.map((_, j) => scores[j].reduce((s, v) => s + (v ?? 0), 0))
          .filter(t => t > total).length + 1;
        return { game_id: gameRow.id, player_id: p.id, player_name: p.name, final_score: total, rank };
      });
      await supabase.from('game_players').insert(playerRows);
      const roundRows = [];
      ROUNDS.forEach((_, ri) => {
        players.forEach((p, pi) => {
          if (scores[pi][ri] !== null) {
            roundRows.push({ game_id: gameRow.id, round_number: ri, player_id: p.id, bid: 0, score: scores[pi][ri] });
          }
        });
      });
      await supabase.from('game_rounds').insert(roundRows);
    } catch(e) { console.error('Supabase error:', e); }
  }

  // ── Routing ───────────────────────────────────────────────────────────────
  const showProfilePicker = screen==="selectProfile" || (!currentPlayerId && friends.length>0);
  if (showProfilePicker) return (
    <SelectProfileScreen
      th={th} S={S} themeName={themeName} isIPad={isIPad}
      groups={groups} groupFriends={groupFriends} allFriends={allFriends}
      currentGroupId={currentGroupId} setCurrentGroupId={setCurrentGroupId}
      setCurrentPlayerId={setCurrentPlayerId} setScreen={setScreen}
      saveS={saveS}
    />
  );
  if (!currentPlayerId) return (
    <Wrap th={th} S={S} themeName={themeName}>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"60vh",color:th.textMid,fontSize:13,letterSpacing:2}}>Laden…</div>
    </Wrap>
  );

  if (screen==="home") return (
    <HomeScreen
      th={th} S={S} themeName={themeName} setThemeName={setThemeName} isIPad={isIPad}
      currentPlayer={currentPlayer}
      activeGames={activeGames} joinLiveGame={joinLiveGame}
      setGameMode={setGameMode} setGamePlayers={setGamePlayers}
      friends={friends} events={events}
      groupFriends={groupFriends} currentGroup={currentGroup}
      go={go}
    />
  );

  if (screen==="selectPlayers") return (
    <SelectPlayersScreen
      th={th} S={S} themeName={themeName}
      gamePlayers={gamePlayers} setGamePlayers={setGamePlayers}
      maxPlayers={maxPlayers} gameMode={gameMode}
      groupFriends={groupFriends} currentGroup={currentGroup}
      startToepen={startToepen} startBollen={startBollen}
      removePlayer={removePlayer} togglePlayer={togglePlayer}
      go={go}
    />
  );

  if (screen==="friends") return (
    <FriendsScreen
      th={th} S={S} themeName={themeName}
      groupFriends={groupFriends} myGroups={myGroups}
      currentGroupId={currentGroupId} setCurrentGroupId={setCurrentGroupId}
      setEditName={setEditName} setSelFriend={setSelFriend}
      bollenStats={bollenStats} toepStats={toepStats}
      go={go}
    />
  );

  if (screen==="addFriend") return (
    <AddFriendScreen
      th={th} S={S} themeName={themeName}
      editName={editName} setEditName={setEditName}
      addFriend={addFriend} go={go}
    />
  );

  if (screen==="friendPage"&&selFriend) return (
    <FriendPageScreen
      th={th} S={S} themeName={themeName}
      selFriend={selFriend} friendStats={friendStats}
      bollenStats={bollenStats} toepStats={toepStats}
      updatePhoto={updatePhoto} updateBirthday={updateBirthday}
      deleteFriend={deleteFriend} go={go}
    />
  );

  if (screen==="game"&&game&&game.mode==="bollen"&&game.roundIdx<17) return (
    <GameScreen
      th={th} S={S} themeName={themeName}
      game={game} setGame={setGame}
      showQuit={showQuit} setShowQuit={setShowQuit}
      roundNote={roundNote} setRoundNote={setRoundNote}
      friends={friends}
      liveGameId={liveGameId} isController={isController}
      syncLiveGame={syncLiveGame}
      refreshGameState={refreshGameState}
      takeOverControls={takeOverControls}
      endLiveGame={endLiveGame}
      setBollenStats={setBollenStats}
      setScreen={setScreen}
      saveGameToSupabase={saveGameToSupabase}
      go={go}
    />
  );

  if (screen==="gameOver"&&game) return (
    <GameOverScreen
      th={th} S={S} themeName={themeName}
      game={game} setGame={setGame} setGamePlayers={setGamePlayers}
      friends={friends}
      endLiveGame={endLiveGame} startBollen={startBollen}
      go={go}
    />
  );

  if (screen==="toepen"&&game&&game.mode==="toepen") return (
    <ToepenScreen
      th={th} S={S} themeName={themeName}
      game={game} setGame={setGame}
      showQuit={showQuit} setShowQuit={setShowQuit}
      showAddLatePlayer={showAddLatePlayer} setShowAddLatePlayer={setShowAddLatePlayer}
      friends={friends}
      liveGameId={liveGameId} isController={isController}
      syncLiveGame={syncLiveGame}
      refreshGameState={refreshGameState}
      takeOverControls={takeOverControls}
      endLiveGame={endLiveGame}
      setToepStats={setToepStats}
      setScreen={setScreen}
      groupFriends={groupFriends}
      saveGameToSupabase={saveGameToSupabase}
      go={go}
    />
  );

  if (screen==="toepOver"&&game) return (
    <ToepenOverScreen
      th={th} S={S} themeName={themeName}
      game={game} setGame={setGame} setGamePlayers={setGamePlayers}
      friends={friends}
      endLiveGame={endLiveGame} startToepen={startToepen}
      go={go}
    />
  );

  if (screen==="spelregels") return (
    <SpelregelsScreen th={th} go={go} S={S} themeName={themeName}/>
  );

  if (screen==="polls") return (
    <PollsScreen
      th={th} go={go} supabase={supabase} themeName={themeName} S={S}
      currentPlayerId={currentPlayerId} friends={friends} isIPad={isIPad}
      currentGroupId={currentGroupId} currentGroup={currentGroup}
    />
  );

  if (screen==="countdown") return (
    <CountdownScreen
      th={th} go={go} supabase={supabase} S={S}
      friends={friends} events={events} setEvents={setEvents}
      themeName={themeName}
    />
  );

  if (screen==="dice") return (
    <DiceScreen th={th} go={go} S={S} themeName={themeName}/>
  );

  return null;
}
